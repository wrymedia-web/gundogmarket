-- GunDogExchange — extra listing slots: $10/30 days per additional active
-- listing on top of a Standard or Featured plan. Quantity lives as a second
-- item on the seller's Stripe subscription; the webhook syncs it here.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS extra_listings integer NOT NULL DEFAULT 0;

-- Protect the new column: only service_role (webhook/admin) may write it
CREATE OR REPLACE FUNCTION public.protect_trust_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- If the caller is NOT service_role, reset trust columns to old values
  IF current_setting('request.jwt.claims', true)::jsonb ->> 'role' != 'service_role' THEN
    NEW.verified := OLD.verified;
    NEW.rating := OLD.rating;
    NEW.review_count := OLD.review_count;
    NEW.subscription_tier := OLD.subscription_tier;
    NEW.subscription_status := OLD.subscription_status;
    NEW.stripe_customer_id := OLD.stripe_customer_id;
    NEW.stripe_subscription_id := OLD.stripe_subscription_id;
    NEW.subscription_current_period_end := OLD.subscription_current_period_end;
    NEW.subscription_cancel_at := OLD.subscription_cancel_at;
    NEW.verification_status := OLD.verification_status;
    NEW.role := OLD.role;
    NEW.breeder_pro := OLD.breeder_pro;
    NEW.extra_listings := OLD.extra_listings;
  END IF;
  RETURN NEW;
END;
$$;

-- Listing cap now includes purchased extra slots
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

  v_max_listings := (CASE v_tier WHEN 'pro' THEN 5 ELSE 1 END) + CASE WHEN v_tier IN ('standard','featured','pro') THEN v_extra ELSE 0 END;
  v_max_photos   := CASE v_tier WHEN 'standard' THEN 1 ELSE 10 END;
  v_video_ok     := v_tier <> 'standard';

  IF NEW.status = 'active' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'active') THEN
    SELECT count(*) INTO v_active_count FROM public.dogs
    WHERE seller_id = NEW.seller_id AND status = 'active' AND id <> NEW.id;
    IF v_active_count >= v_max_listings THEN
      RAISE EXCEPTION 'Listing cap reached. You have % active listing(s) and your plan allows %.', v_active_count, v_max_listings;
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
