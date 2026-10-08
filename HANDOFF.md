# GunDog Exchange — Handoff
*Updated: 2026-09-14*

## Current state
Live at gundogexchange.com. Empty-marketplace revamp + new 3-tier pricing shipped and deployed (commits cd0b9bc…0d7e6f8).

**IMPORTANT — deploys:** there is NO GitHub auto-deploy. Pushing to main does nothing. Deploy with `vercel deploy --prod` from this repo (Vercel team "Modern Outdoor Media", project `gundogexchange`). The July commits sat undeployed for 46 days because of this.

## Shipped 2026-09-14
- Honest trust bar ($0 to List · Escrow Protected · Hunt-Test Verified); fake "2,400+ Listings" removed
- Pricing tiers: Basic $9.99/mo (30-day trial, 1 listing) · Breeder Pro $29/mo (3 listings, Verified badge, social post promo) · Kennel $49/mo (unlimited + video). Source of truth: `src/lib/plans.ts`
- `breed_alerts` table (live in Supabase, RLS locked) + `POST /api/breed-alerts` + `BreedAlertSignup` component
- Empty states on / and /dogs: founding-seller CTA + breed email-alert capture
- /dogs: editorial big-card layout under 12 listings, counts hidden under 20, photos render on cards

## Blockers
- Stripe account decision → then set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_GDE_BASIC`, `STRIPE_PRICE_GDE_PRO`, `STRIPE_PRICE_GDE_KENNEL`, `STRIPE_WEBHOOK_SECRET` in Vercel. Checkout currently 503s by design.

## Next agent should
- Work the launch-audit P0s in `GUNDOGEXCHANGE-LAUNCH-AUDIT.md` (signup confirm 404, profiles trigger, contact-seller flow, RLS trust-column lockdown)
- Ask Wes about deleting the "Duke - SAMPLE" seed listing
- Uncommitted WIP brand-color tweaks on login/signup/globals.css are Wes-side work in progress — do not commit or discard without asking
