-- GunDogExchange Platform Overhaul
-- Phase 1: Profiles trigger + schema alignment
-- Phase 2: RLS lockdown + trust column protection
-- Phase 3: Messaging tables
-- Phase 4: Webhook idempotency

-- ============================================================
-- 1. Add missing columns to profiles (align with prod schema)
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'
    CHECK (role IN ('user', 'admin'));

-- Add missing columns to dogs (align with prod schema)
ALTER TABLE dogs
  ADD COLUMN IF NOT EXISTS registrations JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS pedigree_url TEXT DEFAULT NULL;

-- ============================================================
-- 2. Auto-create profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill: create profile rows for existing auth users who lack one
INSERT INTO profiles (id, full_name, created_at)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'full_name', ''),
  u.created_at
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- ============================================================
-- 3. RLS lockdown — protect trust columns
-- ============================================================

-- Drop overly permissive profile policies
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Users can INSERT their own profile (signup fallback)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can UPDATE only safe columns on their own profile
-- Trust columns (verified, rating, review_count, subscription_*, stripe_*,
-- verification_status, role) are protected via trigger below
CREATE POLICY "Users can update own safe profile fields"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger: prevent users from modifying trust columns
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
    NEW.verification_status := OLD.verification_status;
    NEW.role := OLD.role;
    NEW.breeder_pro := OLD.breeder_pro;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_trust ON profiles;
CREATE TRIGGER protect_profile_trust
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_trust_columns();

-- ============================================================
-- 4. Dogs: protect featured flag + enforce listing cap
-- ============================================================

CREATE OR REPLACE FUNCTION public.guard_dog_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_tier TEXT;
  v_status TEXT;
  v_cap INT;
  v_active INT;
BEGIN
  -- Skip for service_role
  IF current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Force featured = false unless seller is active Pro/Kennel
  SELECT subscription_tier, subscription_status
    INTO v_tier, v_status
    FROM public.profiles
    WHERE id = NEW.seller_id;

  IF v_tier IS NULL OR v_status NOT IN ('active', 'trialing') OR v_tier = 'free' THEN
    NEW.featured := false;
  END IF;

  -- Enforce listing cap
  IF v_status IN ('active', 'trialing') AND v_tier = 'kennel' THEN
    v_cap := 999999;
  ELSIF v_status IN ('active', 'trialing') AND v_tier = 'pro' THEN
    v_cap := 5;
  ELSE
    v_cap := 1;
  END IF;

  SELECT COUNT(*) INTO v_active
    FROM public.dogs
    WHERE seller_id = NEW.seller_id AND status = 'active';

  IF v_active >= v_cap THEN
    RAISE EXCEPTION 'Listing cap reached. You have % active listing(s) and your plan allows %.', v_active, v_cap;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_dog_on_insert ON dogs;
CREATE TRIGGER guard_dog_on_insert
  BEFORE INSERT ON dogs
  FOR EACH ROW EXECUTE FUNCTION public.guard_dog_insert();

-- Protect featured on update too
CREATE OR REPLACE FUNCTION public.guard_dog_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_tier TEXT;
  v_status TEXT;
BEGIN
  IF current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' THEN
    RETURN NEW;
  END IF;

  SELECT subscription_tier, subscription_status
    INTO v_tier, v_status
    FROM public.profiles
    WHERE id = NEW.seller_id;

  IF v_tier IS NULL OR v_status NOT IN ('active', 'trialing') OR v_tier = 'free' THEN
    NEW.featured := false;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_dog_on_update ON dogs;
CREATE TRIGGER guard_dog_on_update
  BEFORE UPDATE ON dogs
  FOR EACH ROW EXECUTE FUNCTION public.guard_dog_update();

-- ============================================================
-- 5. Messaging: conversations + messages
-- ============================================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(dog_id, buyer_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Participants can view messages in own conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

CREATE POLICY "Recipients can mark messages read"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- Update conversation.updated_at when a message is sent
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  UPDATE public.conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS message_updates_conversation ON messages;
CREATE TRIGGER message_updates_conversation
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_timestamp();

-- ============================================================
-- 6. Stripe webhook idempotency
-- ============================================================

CREATE TABLE IF NOT EXISTS stripe_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. Anon-safe profile view for seller cards
-- ============================================================

CREATE OR REPLACE VIEW public.seller_profiles AS
SELECT
  id,
  full_name,
  kennel_name,
  location_state,
  location_city,
  rating,
  review_count,
  verified,
  breeder_pro,
  verification_status,
  subscription_tier,
  created_at
FROM public.profiles;

GRANT SELECT ON public.seller_profiles TO anon, authenticated;
