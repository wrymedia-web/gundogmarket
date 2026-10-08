-- Add subscription-related columns to profiles (idempotent: only adds if missing)
DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN subscription_status TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN stripe_subscription_id TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN subscription_current_period_end TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Free-tier listing expiration: auto-deactivate after 14 days
DO $$ BEGIN
  ALTER TABLE dogs ADD COLUMN listing_expires_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add registrations and documents columns to dogs (referenced in sell page)
DO $$ BEGIN
  ALTER TABLE dogs ADD COLUMN registrations JSONB DEFAULT '[]';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE dogs ADD COLUMN documents JSONB DEFAULT '[]';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE dogs ADD COLUMN pedigree_url TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Index for cron-style expiration queries
CREATE INDEX IF NOT EXISTS idx_dogs_expires_active
  ON dogs (listing_expires_at)
  WHERE status = 'active' AND listing_expires_at IS NOT NULL;
