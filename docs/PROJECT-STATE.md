# GunDog Exchange — Project State
*Last updated: 2026-10-06 by MOD-DEV (initial setup)*

## Status
Live at gundogexchange.com. **NOT launch-ready** — see launch audit P0 blockers below.

## Completed Features
- [x] Initial Next.js 16 scaffold + Supabase wiring
- [x] Brand kit applied (Montserrat + field-sports editorial design)
- [x] Homepage with hero, featured dogs strip, pricing section
- [x] `/dogs` browse page with client-side search/filter
- [x] `/dogs/[id]` detail page
- [x] `/sell` multi-step listing wizard (6 steps: basics → location → photos → health/hunt → pricing → review)
- [x] Photo + document upload to Supabase Storage
- [x] `/login`, `/signup` with Supabase Auth
- [x] Auth callback route at `/(auth)/callback`
- [x] `/dashboard` with messages sub-page
- [x] Admin panel: `/admin`, `/admin/listings`, `/admin/users`, `/admin/messages`
- [x] Stripe checkout route + webhook handler (scaffolded, not configured)
- [x] Pricing tiers defined: Free (1 listing) / Breeder Pro $29/mo (5 listings)
- [x] `breed_alerts` table + API route + signup component
- [x] Empty-state UX: founding-seller CTA + breed email-alert capture
- [x] Honest trust bar (replaced fake "2,400+ Listings" claim)
- [x] 3-tier pricing display on homepage
- [x] Browse page: editorial big-card layout for <12 listings, counts hidden <20
- [x] Real Supabase-backed featured dogs (replaced hardcoded mock data)
- [x] `/terms` and `/privacy` pages exist (routes created)
- [x] Contact seller component exists (`src/components/contact-seller.tsx`)
- [x] Deployed to Vercel (manual deploy, no auto-deploy from GitHub)

## Current Work
Nothing in progress — pick from P0 blockers below.

## P0 Blockers (from launch audit, prioritized)
1. **Signup broken** — email confirm link targets `/auth/callback` but route is at `/callback` (route group). Fix: change `emailRedirectTo` in `signup/page.tsx` OR move route file.
2. **No profiles trigger** — `profiles` table has 0 rows. No `handle_new_user` trigger. Stripe webhook UPDATE no-ops. Fix: add trigger on `auth.users` + backfill existing 5 users.
3. **Trust column exploit** — users can self-assign `verified=true`, Pro tier, 5★ rating via API. Fix: column-level grants or BEFORE trigger restricting trust columns to service_role.
4. **No buyer→seller contact** — Contact Seller/Buy Now buttons are dead. No messages table. Fix: minimum viable = email relay via Resend, or reveal contact info to logged-in users.
5. **Photos never display** — browse cards and detail page show placeholders. Fix: render `images[0]` on cards, gallery on detail page. Add `remotePatterns` to next.config.ts.
6. **Seller card empty** — detail page seller section renders nothing (no profile row). Depends on #2.
7. **Stripe not configured** — `STRIPE_SECRET_KEY` etc. not set in Vercel. Checkout 503s by design. Decision needed from Wes on Stripe account.
8. **No Terms/Privacy content** — routes exist but need actual legal content.

## P1 Issues (post-launch or alongside)
- No logout button anywhere
- No forgot/reset password flow
- Dashboard is 100% mock data, no edit/delete/mark-sold
- Remote DB drifted from committed migrations
- Stripe webhook lacks idempotency
- Uploaded documents (vet records) are publicly readable
- Browse page: null city crash, breed pill links broken, no pagination
- Sell wizard: thin validation, no server-side field enforcement
- Login redirect param mismatch (`next` vs `redirect`)
- Images: unoptimized, no `remotePatterns` config

## Known Issues / Notes
- Uncommitted WIP: brand-color tweaks on login/signup/globals.css (Wes's work, don't touch)
- `plans.ts` defines Free + Pro but homepage shows 3 tiers (Basic/Breeder Pro/Kennel) — mismatch
- Seed listing "Duke - SAMPLE" should be deleted (ask Wes first)
- QA account: wrymedia+gde-qa-audit@gmail.com (creds in `~/.config/mod-dev/secrets/gde-qa-account.txt`)

## Database Tables
- `dogs` — listings (RLS: owner can CRUD own, all can SELECT)
- `profiles` — user profiles (RLS: owner can CRUD own, anon can SELECT — but 0 rows exist)
- `reviews` — review table (exists, no UI)
- `breed_alerts` — email capture for breed notifications

## Files Recently Modified (last shipped commit: 0d7e6f8)
- `src/app/page.tsx` — homepage (trust bar, pricing, empty state)
- `src/app/dogs/page.tsx` — browse (editorial layout, empty state)
- `src/lib/plans.ts` — pricing definitions
- `src/components/breed-alert-signup.tsx` — breed alert capture
- `src/components/featured-dogs.tsx` — real Supabase-backed featured strip

## Recommended Next Session
**Fix signup flow (P0 #1 + #2):** Fix the auth callback URL mismatch, add the `handle_new_user` trigger for profiles, backfill existing users. This unblocks most other P0s. Estimated: 1 session.
