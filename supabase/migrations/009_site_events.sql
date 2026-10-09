-- GunDogExchange — first-party analytics events
-- Written by /api/track (service role). RLS enabled with NO policies:
-- the anon key can neither read nor write this table directly.
CREATE TABLE IF NOT EXISTS public.site_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event text NOT NULL,
  path text,
  listing_id uuid,
  visitor_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS site_events_created_idx ON public.site_events (created_at DESC);
CREATE INDEX IF NOT EXISTS site_events_event_idx ON public.site_events (event);
CREATE INDEX IF NOT EXISTS site_events_utm_idx ON public.site_events (utm_source);
