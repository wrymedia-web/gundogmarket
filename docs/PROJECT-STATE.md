# GunDog Exchange — Project State
*Last updated: 2026-10-07 by MOD-MAIN (full launch-readiness regression audit)*

## Status
Live at gundogexchange.com. **READY WITH MINOR ISSUES** — full prod regression passed 2026-10-07 (see `~/Agents/mod-dev/workspace/qa-gde/out/` for test results + screenshots). Launch verdict and open items in the 2026-10-07 final report delivered to Wes.

## What was verified end-to-end on PROD (2026-10-07, automated Playwright)
- Signup → confirmation email (Resend SMTP) → PKCE link → `/callback` → logged-in dashboard ✅
- `handle_new_user` trigger auto-creates profile rows ✅ (8 profiles, all users confirmed)
- Login / logout / re-login, forgot-password → recovery email → `/reset-password` → new password ✅
- Settings: change password ✅ · old password rejected ✅
- Sell wizard: create listing + photo upload + publish → public browse/detail with photo ✅
- Edit listing (price change) ✅ · Mark Sold (hidden from browse) ✅ · Reactivate ✅ · Delete (conversations cascade) ✅ · deleted URL 404s ✅
- **Two-way messaging ✅**: buyer Contact Seller → conversation+message rows → seller inbox → seller reply → buyer sees reply → thread continues. Anon contact → login redirect with return path.
- Security regression — ALL September exploits dead: self-verify/self-pro/self-admin/self-featured blocked (trust trigger), listing cap enforced server-side, cross-user listing edit blocked, profiles PII locked (owner/admin-only; `seller_profiles` view has no phone/bio), messaging RLS solid (anon + non-participant blocked read/write)
- Mobile (iPhone 13): no horizontal overflow anywhere; nav menu, browse, detail, contact composer, login, inbox, thread reply, sell wizard all work
- SEO/legal: robots.txt + sitemap (incl. dog URLs), real titles/meta/OG on listing pages, /terms + /privacy live with content, 404 handling OK

## Fixed + deployed 2026-10-07
- Dashboard layout now responsive (sidebar was fixed 256px, squeezing phone content to 134px; now `hidden md:flex` + mobile top-nav strip) — `src/app/(dashboard)/layout.tsx`
- Checkout 503 copy now customer-facing ("Paid plans aren't available quite yet…") — `src/app/api/checkout/pro/route.ts`

## Fixed + deployed 2026-10-08
- Listing photo gallery is now interactive: new client component `src/components/photo-gallery.tsx` (clickable thumbnails, prev/next arrows, 1/N counter, active-thumbnail highlight) replaces the static first-image-only markup in `src/app/dogs/[id]/page.tsx`. Verified on prod, desktop + mobile tap.

## Admin Dashboard — LIVE as of 2026-10-08
- Full admin platform at `/admin` (see `ADMIN-DASHBOARD.md`). Migration 006 = `super_admin` role + `admin_audit_log` table (RLS, service-role only).
- Auth: `src/lib/admin.ts` — role check + MFA (TOTP/AAL2) enforced server-side. Route group `(gated)` MFA-walls all pages; `/admin/security` (enroll) + `/admin/verify` (step-up) sit outside it. MFA pages use full-page navigation after verify so SSR re-reads the AAL2 cookie.
- Pages: Overview (DB + Stripe metrics, 8-wk charts), Listings (search/filter/edit/feature/status/photo-reorder/reassign/delete), Users (edit/ban/reset-pw/comp-pro/delete), Subscriptions, Payments (Stripe, refunds=super admin), Messages (audit-logged thread viewer), Activity Log, Settings (admin invites + system health).
- Actions in `src/app/admin/actions.ts` — all call `requireAdmin()`/`requireSuperAdmin()` + `logAdminAction()`. Stripe reads scoped to `STRIPE_PRICE_GDE_PRO` so OutfitterDesk activity on the shared account is excluded (`src/lib/stripe-admin.ts`).
- Super admins: westinyancey@gmail.com (use this) + info@gundogexchange.com (pre-created, needs mailbox/password — break-glass). Regular `admin` role lacks role-change/delete/refund.
- Verified on prod (stage11 + probes): anon/non-admin blocked, MFA enroll + step-up, all pages render, grant-comp/ban/unban work, banned user can't log in, audit log records everything. QA users + QA audit rows cleaned.

## Data state (2026-10-07)
- Active listings: Nitro (randy@flyingrkennel.com), Richie Von Kiefernblick (charlzdikens1@gmail.com) — both legit
- "Duke - SAMPLE" (Wes's seed listing) set to **draft** (unpublished, recoverable from Wes's dashboard)
- All QA artifacts removed: QA listings, QA buyer users, QA conversations/messages, QA storage files
- QA account kept: wrymedia+gde-qa-audit@gmail.com (creds in `~/.config/mod-dev/secrets/gde-qa-account.txt`)
- Real signups happening organically: info@ozarkwings.com (10/02), risingcreek803@yahoo.com (10/04) — neither has listed yet

## Stripe — LIVE as of 2026-10-08 (Modern Outdoor Media account, per Wes)
- Account: acct_1APGs9JpDfzVQvhp (wes.yancey@modernoutdoormedia.com), live mode, charges+payouts enabled — same account as OutfitterDesk
- Product `prod_VP74llYVF1O3Xw` "GunDog Exchange — Breeder Pro", price `price_1UOIqCJpDfzVQvhpktez5TyZ` $29/mo
- Webhook `we_1UOIqCJpDfzVQvhpqT3QuuYq` → https://gundogexchange.com/api/webhooks/stripe (checkout.session.completed + subscription created/updated/deleted)
- Vercel prod env: STRIPE_SECRET_KEY, STRIPE_PRICE_GDE_PRO, STRIPE_WEBHOOK_SECRET set 2026-10-08; local copy at `~/.config/mod-dev/secrets/gde-stripe.env`
- Verified live: upgrade → real Checkout ($29/mo, branded); signed-webhook round-trip upgrades profile to pro/active, cancellation downgrades to free, tampered signature → 400; /upgrade/success renders
- **Fixed 2026-10-08:** checkout route persisted stripe_customer_id with the user-session client, which the trust-column trigger silently blocked → duplicate Stripe customer per checkout attempt. Now uses service client (`src/app/api/checkout/pro/route.ts`). QA customers deleted from Stripe.

## Message email notifications — LIVE as of 2026-10-08
- AFTER INSERT trigger `trg_notify_new_message` on `messages` (migration 005) → pg_net POST to `/api/notify/message` → Resend email to the recipient (works both directions: buyer→seller and seller→buyer)
- Throttle: if the same sender wrote in that conversation within the last hour, no additional email
- Secret: Supabase Vault `message_notify_secret` (DB side) must match Vercel env `MESSAGE_NOTIFY_SECRET`; `RESEND_API_KEY` (send-only key, shared with OutfitterDesk) also in Vercel prod. Local copy: `~/.config/mod-dev/secrets/gde-notify.env`
- Email failures can never block message inserts (EXCEPTION handler returns NEW); sender: `GunDog Exchange <noreply@gundogexchange.com>`
- Verified on prod 2026-10-08: 2 sends + 1 throttled across 3 messages, all pg_net calls 200 (`qa-gde/out/stage10.json`)

## Remaining open items (full detail in 2026-10-07 report)
2. **dog-documents bucket is public** — vet records/pedigrees readable by URL (UUID-unguessable, but PII; decision: signed URLs vs keep)
3. `uri_allow_list` has stale `https://gundogexchange.com/auth/callback` entry (harmless)
4. Working tree still uncommitted (incl. Wes's brand WIP on login/signup/globals.css — do not commit/discard without asking). Deploys are working-tree based (`npx vercel --prod`), no GitHub auto-deploy.
5. Stripe webhook: wire `stripe_events` dedupe table (handler is idempotent-ish but dedupe is cleaner)
6. ~~plans.ts vs homepage pricing mismatch~~ — resolved; homepage renders Free/$29 Pro from plans.ts

## Database Tables (all live in remote, migrations 001–004 applied)
`dogs`, `profiles` (+trigger `on_auth_user_created`, trust-column trigger), `reviews`, `breed_alerts`, `conversations`, `messages`, `stripe_events`, `seller_profiles` (anon-safe view)

## Key Files
- `src/proxy.ts` — session refresh + route protection (/dashboard, /sell)
- `src/app/(auth)/callback/route.ts` — PKCE exchange; honors `?next=` (used by reset flow)
- `src/app/(dashboard)/dashboard/messages/` — inbox + thread UI
- `src/components/contact-seller.tsx` — buyer-side composer
- `src/lib/plans.ts` — pricing source of truth
- QA harness: `~/Agents/mod-dev/workspace/qa-gde/` (stages 1–8, rerunnable)

## Recommended Next Session
1. New-message email notification via Resend (biggest marketplace-liveness win)
2. Stripe setup once Wes picks the account → set env vars → webhook secret → test upgrade e2e
3. Commit hygiene: untangle Wes's brand WIP, commit the shipped working tree
