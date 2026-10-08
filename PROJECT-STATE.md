# Gun Dog Exchange — Project State

> Marketplace/listing platform for bird dogs (started dogs, finished dogs, litters across bird-dog breeds).
> NOT a hunt-booking marketplace — that is WWHT (Worldwide Hunting Trips).

## Overview

- **Product:** GunDogExchange.com — hunters and breeders list and browse bird dogs
- **Stack:** Next.js + Supabase + Vercel
- **Supabase project:** `bbrcozoncbtemctamiaw`
- **Transactional email:** Resend (shared with OutfitterDesk), sender `noreply@gundogexchange.com`
- **Domain:** gundogexchange.com
- **Related concept:** BirdDog Exchange (Wes's live hunt-booking marketplace concept — free to list, no commission, Facebook ad running)

## History & Decisions

- **Concept origin:** Grew from bird-dog SaaS research (May 2026) and Wes's BirdDog Exchange idea (hunt marketplace for outfitters ↔ hunters)
- **Ambiguity flagged:** relationship between GDE (dog listings), BirdDog Exchange (hunt booking), and OutfitterDesk (guide SaaS) was unclear — Wes clarified they are separate products
- **Launch audit (2026-09-13):** Site went LIVE but was NOT ready for public use

## Launch Audit Findings (2026-09-13)

**P0 — Critical blockers:**
- False escrow/verified-seller claims on live marketing copy
- Signup confirmation link 404s (`/auth/callback` vs `/callback` mismatch)
- Stripe unconfigured in production (503 errors)
- Profiles table EMPTY — no signup trigger, webhook upgrades no-op
- Self-verify and self-pro exploits proven via API
- No contact-seller path exists
- Photos never render on browse/detail pages
- No terms/privacy pages

**Shipped (2026-09-14, post-audit):**
- Photo upload working
- Browse filters working
- Duration render fixed (note: Terrance's own row had `duration_days=null` — user must fill it)
- Edit Outfitter Profile working
- Inquiries open/reply working
- Last-Minute / Cancellation / Show-Special tags working
- Commit `b10f6f2` on main, migrations 008+009 applied to Supabase prod

## Open Items

1. **Stripe account choice** — new account for GDE vs. reuse OutfitterDesk's. Recommendation: new account (clean revenue/tax separation). Three env vars needed in Vercel: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_GDE_PRO`, `STRIPE_WEBHOOK_SECRET`. Also verify `SUPABASE_SERVICE_ROLE_KEY` is in Vercel.
2. Remaining P0s from launch audit (escrow claims, self-verify exploit, missing terms/privacy)
3. Pro tier scaffold exists but unpurchasable without Stripe

## Credentials

All credentials in `~/.openclaw/vault/credentials.env`. Resend API key shared with OutfitterDesk (in `outfitteros/.env.local`). QA account: `wrymedia+gde-qa-audit@gmail.com` (creds in `~/.config/mod-dev/secrets/gde-qa-account.txt`).

## Supabase

- `mailer_autoconfirm` gotcha: if set to `true`, signup confirmation emails are silently skipped and users are auto-confirmed. Check this first when "signup email not arriving" is reported.

## Source Memory

- Auto-memory: `project_gde_status.md`, `project_bird_dog_exchange.md`, `gde-resend-supabase-wiring.md`, `supabase-mailer-autoconfirm-gotcha.md`
- DEV auto-memory: `project_gundogexchange_launch.md`
- Workspace: `memory/gundogmarket-build-log.md`
- Full audit report: `gundogmarket/GUNDOGEXCHANGE-LAUNCH-AUDIT.md`
