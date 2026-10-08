-- GunDogExchange — pricing v2: Trial→Standard ($29/30d) + Featured ($49/30d)
-- Additive and backward-compatible: legacy 'free'/'pro' behavior is preserved
-- until the production rollout is approved.

-- New tiers
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_subscription_tier_check
  CHECK (subscription_tier = ANY (ARRAY['free'::text, 'pro'::text, 'standard'::text, 'featured'::text]));

-- Cancellation visibility ("access until" display)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_cancel_at timestamptz;

-- 'expired' listing status: hidden from public browse without deleting data
ALTER TABLE public.dogs DROP CONSTRAINT IF EXISTS dogs_status_check;
ALTER TABLE public.dogs ADD CONSTRAINT dogs_status_check
  CHECK (status = ANY (ARRAY['active'::text, 'pending'::text, 'sold'::text, 'draft'::text, 'expired'::text]));

-- Server-side entitlement enforcement: listing count, photo count, video.
-- service_role bypasses (admin + webhooks). Caps by tier:
--   free     → 1 listing, 10 photos, video allowed   (legacy, unchanged)
--   pro      → 5 listings, 10 photos, video allowed  (legacy, unchanged)
--   standard → 1 listing, 1 photo, NO video
--   featured → 1 listing, 10 photos, 1 video
CREATE OR REPLACE FUNCTION public.guard_dog_media()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_tier text;
  v_status text;
  v_active boolean;
  v_max_listings int;
  v_max_photos int;
  v_video_ok boolean;
  v_active_count int;
BEGIN
  IF current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' THEN
    RETURN NEW;
  END IF;

  SELECT subscription_tier, subscription_status INTO v_tier, v_status
  FROM public.profiles WHERE id = NEW.seller_id;

  v_active := v_status IN ('active', 'trialing');
  IF v_tier IN ('standard', 'featured') AND NOT v_active THEN
    v_tier := 'free';
  END IF;
  IF v_tier = 'pro' AND NOT v_active THEN
    v_tier := 'free';
  END IF;

  v_max_listings := CASE v_tier WHEN 'pro' THEN 5 ELSE 1 END;
  v_max_photos   := CASE v_tier WHEN 'standard' THEN 1 ELSE 10 END;
  v_video_ok     := v_tier <> 'standard';

  -- listing cap (on insert, or on transition to active)
  IF NEW.status = 'active' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'active') THEN
    SELECT count(*) INTO v_active_count FROM public.dogs
    WHERE seller_id = NEW.seller_id AND status = 'active' AND id <> NEW.id;
    IF v_active_count >= v_max_listings THEN
      RAISE EXCEPTION 'Listing cap reached. You have % active listing(s) and your plan allows %.', v_active_count, v_max_listings;
    END IF;
  END IF;

  -- media caps
  IF jsonb_array_length(COALESCE(NEW.images, '[]'::jsonb)) > v_max_photos THEN
    RAISE EXCEPTION 'Photo limit exceeded: your plan allows % photo(s).', v_max_photos;
  END IF;
  IF NOT v_video_ok AND NEW.video_url IS NOT NULL AND NEW.video_url <> '' THEN
    RAISE EXCEPTION 'Video is not included in your plan. Upgrade to Featured to add a video.';
  END IF;

  -- featured placement only with a featured-capable entitlement
  -- (inactive subs were already downgraded to 'free' above)
  IF NEW.featured = true AND v_tier NOT IN ('featured', 'pro') THEN
    NEW.featured := false;
  END IF;

  RETURN NEW;
END;
$$;

-- Replace the old cap-only guards with the combined guard
DROP TRIGGER IF EXISTS guard_dog_on_insert ON public.dogs;
DROP TRIGGER IF EXISTS guard_dog_on_update ON public.dogs;
DROP TRIGGER IF EXISTS trg_guard_dog_media_ins ON public.dogs;
DROP TRIGGER IF EXISTS trg_guard_dog_media_upd ON public.dogs;
CREATE TRIGGER trg_guard_dog_media_ins BEFORE INSERT ON public.dogs
  FOR EACH ROW EXECUTE FUNCTION public.guard_dog_media();
CREATE TRIGGER trg_guard_dog_media_upd BEFORE UPDATE ON public.dogs
  FOR EACH ROW EXECUTE FUNCTION public.guard_dog_media();
