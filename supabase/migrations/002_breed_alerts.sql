-- Buyer email alerts: "notify me when [breed] listings drop"
-- Inserts happen server-side via service role only; no anon/authenticated access.
create table if not exists public.breed_alerts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  breed text not null,
  created_at timestamptz not null default now(),
  unique (email, breed)
);

alter table public.breed_alerts enable row level security;
-- No policies: anon/authenticated get nothing; service_role bypasses RLS.
