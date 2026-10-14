-- Litter status: litters can be listed before birth (expected) or with
-- puppies already on the ground (born). Existing litter rows stay 'expected'.
ALTER TABLE public.dogs
  ADD COLUMN IF NOT EXISTS litter_status TEXT NOT NULL DEFAULT 'expected'
    CHECK (litter_status IN ('expected', 'born'));
