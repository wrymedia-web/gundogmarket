-- 010: close publish bypass — free/no-subscription accounts may publish 0 active
-- listings. Existing (grandfathered) active listings are untouched: the guard
-- only fires on INSERT or on a transition INTO active, not on edits of rows
-- that are already active.
CREATE OR REPLACE FUNCTION public.guard_dog_media()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_tier text;
  v_status text;
  v_extra int;
  v_active boolean;
  v_max_listings int;
  v_max_photos int;
  v_video_ok boolean;
  v_active_count int;
BEGIN
  IF current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' THEN
    RETURN NEW;
  END IF;

  SELECT subscription_tier, subscription_status, COALESCE(extra_listings, 0)
  INTO v_tier, v_status, v_extra
  FROM public.profiles WHERE id = NEW.seller_id;

  v_active := v_status IN ('active', 'trialing', 'past_due');
  IF v_tier IN ('standard', 'featured', 'pro') AND NOT v_active THEN
    v_tier := 'free';
    v_extra := 0;
  END IF;

  -- free / no active subscription => 0 publishable listings (must subscribe)
  v_max_listings := CASE v_tier
                      WHEN 'pro' THEN 5 + v_extra
                      WHEN 'standard' THEN 1 + v_extra
                      WHEN 'featured' THEN 1 + v_extra
                      ELSE 0
                    END;
  v_max_photos   := CASE v_tier WHEN 'standard' THEN 1 ELSE 10 END;
  v_video_ok     := v_tier <> 'standard';

  IF NEW.status = 'active' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'active') THEN
    SELECT count(*) INTO v_active_count FROM public.dogs
    WHERE seller_id = NEW.seller_id AND status = 'active' AND id <> NEW.id;
    IF v_active_count >= v_max_listings THEN
      IF v_max_listings = 0 THEN
        RAISE EXCEPTION 'An active subscription is required to publish a listing. Start your free trial at /pricing.';
      ELSE
        RAISE EXCEPTION 'Listing cap reached. You have % active listing(s) and your plan allows %.', v_active_count, v_max_listings;
      END IF;
    END IF;
  END IF;

  IF jsonb_array_length(COALESCE(NEW.images, '[]'::jsonb)) > v_max_photos THEN
    RAISE EXCEPTION 'Photo limit exceeded: your plan allows % photo(s).', v_max_photos;
  END IF;
  IF NOT v_video_ok AND NEW.video_url IS NOT NULL AND NEW.video_url <> '' THEN
    RAISE EXCEPTION 'Video is not included in your plan. Upgrade to Featured to add a video.';
  END IF;

  IF NEW.featured = true AND v_tier NOT IN ('featured', 'pro') THEN
    NEW.featured := false;
  END IF;

  RETURN NEW;
END;
$$;
