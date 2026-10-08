-- GunDogExchange — Profiles PII lockdown
-- Problem: the "Profiles are viewable by everyone" SELECT policy (USING true)
-- exposed every column — including phone and bio — to anon via the public
-- REST endpoint and the shipped anon key. Public seller info already has an
-- anon-safe path through the seller_profiles view (no phone/bio), so the raw
-- table only needs to be readable by the row owner and admins.

-- Admin check helper (SECURITY DEFINER bypasses RLS → no recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Replace the wide-open SELECT policy with owner-or-admin
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

CREATE POLICY "Profiles readable by owner or admin"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- seller_profiles view (created in 003) stays anon-readable and is the only
-- public window onto profile data. Re-assert the grant for safety.
GRANT SELECT ON public.seller_profiles TO anon, authenticated;
