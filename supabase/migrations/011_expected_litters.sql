-- Expected Litter listings: breeders can list a litter before the puppies
-- are born, using sire/dam photos or a kennel logo in place of puppy photos.
ALTER TABLE public.dogs
  ADD COLUMN IF NOT EXISTS listing_type TEXT NOT NULL DEFAULT 'dog'
    CHECK (listing_type IN ('dog', 'litter')),
  ADD COLUMN IF NOT EXISTS expected_birth_date DATE,
  ADD COLUMN IF NOT EXISTS go_home_date DATE,
  ADD COLUMN IF NOT EXISTS sire_name TEXT,
  ADD COLUMN IF NOT EXISTS dam_name TEXT,
  ADD COLUMN IF NOT EXISTS sire_images JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS dam_images JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS kennel_logo_url TEXT;

CREATE INDEX IF NOT EXISTS dogs_listing_type_idx ON public.dogs (listing_type);
