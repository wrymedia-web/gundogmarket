# GunDogExchange Launch Verdict

# ⛔ NOT READY TO LAUNCH

**Audit date:** 2026-09-13
**Auditor:** MOD-DEV (automated + live functional testing)
**Site:** https://gundogexchange.com (LIVE — DNS is already pointed and the site is publicly reachable **today**, which raises the urgency of the marketing-claim blockers below)
**Stack:** Next.js 16 App Router · Supabase (`bbrcozoncbtemctamiaw`) · Stripe (unconfigured) · Vercel
**Repo:** `~/.openclaw/workspace/gundogmarket` (github.com/wrymedia-web/gundogmarket)

**How this was tested:** full codebase read (every file in `src/` + migrations), live HTTP audit of every route on production, live Supabase REST probes with the public anon key, and authenticated authorization tests using a clearly-labeled QA account (`wrymedia+gde-qa-audit@gmail.com`, creds in `~/.config/mod-dev/secrets/gde-qa-account.txt`, kept for re-verification this week). All QA listings were deleted; QA profile flagged and reverted. Not tested: real Stripe checkout end-to-end (impossible — Stripe is not configured in prod), real device/mobile/browser matrix, email deliverability (no email provider exists to test).

---

## Executive Summary

- **The site is already publicly live** and its homepage promises escrow, buyer protection, identity-verified sellers, and buyer messaging — **none of which exist in any form**. For $1,200–$5,000 live-animal transactions this is a serious misrepresentation risk and the single biggest blocker.
- **New users cannot complete signup.** Email confirmation is ON, but the confirmation link targets `/auth/callback`, which 404s (real route is `/callback`). 1 of the 5 existing auth users is already stuck unconfirmed.
- **Payments are dead.** `POST /api/checkout/pro` returns `503 "Stripe not configured yet"` in production. Even once configured, the upgrade would silently fail: **zero rows exist in `profiles`** (no signup trigger), so the webhook's `UPDATE profiles` no-ops and a paying customer never becomes Pro.
- **Proven by live test:** any logged-in user can self-assign `verified=true`, 5.0 rating, 999 reviews, and `subscription_tier='pro'` via the public API, post **unlimited** listings (free cap is client-side only), and self-mark them `featured`. Cross-user listing edits ARE correctly blocked by RLS.
- **The marketplace loop cannot close:** Contact Seller / Buy Now / Make an Offer / Request Phone Number are all dead buttons with no handlers; there is no messaging table, no mailto, nothing.
- **Sellers' uploaded photos are never shown to buyers** — browse cards and the detail page render hardcoded placeholders ("Photos coming soon") even when photos exist in storage.
- The dashboard is 100% mock data (fake listings, "142 profile views") with **no edit / delete / mark-sold**, and its sidebar links 404.
- **No Terms of Service or Privacy Policy** (both 404) on a site that plans to take payments and facilitate live-animal sales.
- No logout, no forgot/reset password, no admin tooling, no emails, no analytics, no sitemap/robots, no per-listing SEO metadata.
- The database contains 2 seed dogs (one literally titled "SAMPLE") against a homepage claiming "2,400+ Listings."

The good news: the codebase is small and clean, auth-gating middleware works, dogs-table RLS ownership is correct, the Stripe webhook verifies signatures, no XSS vectors or leaked secrets were found, and anonymous users cannot read profile PII. The skeleton is sound — but this is currently a brochure wearing a marketplace's clothes.

---

## P0 — LAUNCH BLOCKERS

### P0-1 · Fraudulent-feeling marketing claims: escrow, buyer protection, verified sellers, messaging
- **URL/page:** `/` (hero stats, feature cards, How-It-Works, pricing), `/dogs/[id]` ("Secured by GunDog Exchange Escrow"), site-wide meta description
- **Account:** anonymous
- **Repro:** Load homepage. Read "Secure Escrow — Funds held safely until you receive the dog. Full buyer protection — no wire fraud", "Every seller is identity-verified", "Message verified sellers directly", "2,400+ Listings".
- **Expected:** claims match implemented functionality
- **Actual:** zero escrow/purchase/offer code exists anywhere; zero verification flow; zero messaging; 2 seed listings in DB
- **Evidence:** code grep — no purchase/order/escrow/message tables or routes; `dogs/[id]/page.tsx:169-211` dead buttons; live REST count `dogs=2`
- **Involves:** frontend copy (`src/app/page.tsx:36-38,66,76,156-157,180-181`, `src/app/dogs/[id]/page.tsx:175`, `src/app/layout.tsx` meta)
- **Fix:** Since the site is live NOW, strip/soften these claims immediately (hours, not days): remove "Secure Escrow" everywhere, change "2,400+" to a real dynamic count or remove the stat row, reword "identity-verified" until verification exists. Rebuild honest copy around what launch actually offers (direct listings + contact). Escrow/verification become roadmap features, not launch claims.

### P0-2 · New-user signup funnel is broken (email confirm link 404s)
- **URL/page:** `/signup` → confirmation email → `https://gundogexchange.com/auth/callback?...`
- **Account:** new QA signup
- **Repro:** Sign up; Supabase sends confirmation (confirmation is ON in the project); link targets `/auth/callback` per `signup/page.tsx:57`; that path returns **404** live (verified). Real route is `/callback` (`src/app/(auth)/callback/route.ts` — `(auth)` is a route group and doesn't appear in the URL).
- **Expected:** confirm → session established → redirected into app
- **Actual:** 404 page; user stranded. **1 of 5 current auth users is stuck unconfirmed.**
- **Involves:** frontend (`signup/page.tsx:57`) + Supabase auth redirect allow-list
- **Fix:** change `emailRedirectTo` to `${origin}/callback` (and add the URL to Supabase Auth → Redirect URLs), or move the route to `src/app/auth/callback/route.ts`. Verify end-to-end with a fresh signup.

### P0-3 · Stripe not configured in production — upgrade flow dead; and even configured, upgrades would silently no-op
- **URL/page:** `/upgrade` → `POST /api/checkout/pro`
- **Account:** any
- **Repro (live-verified):** `POST https://gundogexchange.com/api/checkout/pro` → `503 {"error":"Stripe not configured yet"}`. `STRIPE_SECRET_KEY` is a placeholder locally; `STRIPE_PRICE_GDE_PRO` and `STRIPE_WEBHOOK_SECRET` are set nowhere.
- **Second, subtler failure:** `profiles` has **0 rows** (no signup trigger exists in any migration). Checkout route (`route.ts:33`) and webhook (`webhooks/stripe/route.ts:34-48`) both do `UPDATE profiles ... eq(id)` → match 0 rows → silent no-op. A paying customer would be charged by Stripe and **never upgraded in the app**.
- **Involves:** Vercel env config, Stripe dashboard (product/price/webhook), DB trigger
- **Fix:** (1) add `handle_new_user` trigger on `auth.users` inserting a `profiles` row (+ backfill the 5 existing users); (2) create live Stripe product/price $29-mo, set `STRIPE_SECRET_KEY`, `STRIPE_PRICE_GDE_PRO`, `STRIPE_WEBHOOK_SECRET` in Vercel; (3) register the webhook endpoint; (4) test with Stripe test mode first (4242 card), verifying DB tier flips and UI updates. Alternatively: **launch without Pro** (hide the pricing section) and cut scope.

### P0-4 · Any user can self-assign Verified badge, 5★ rating, Pro tier, featured placement, and unlimited listings (proven live)
- **URL/page:** Supabase REST API (same anon key the site ships)
- **Account:** QA account (normal authenticated user)
- **Repro (executed 2026-09-13, then cleaned up):**
  - `INSERT profiles {verified:true, rating:5.0, review_count:999}` → **SUCCEEDED**
  - `UPDATE profiles {subscription_tier:'pro'}` → **SUCCEEDED** (free Pro, no payment)
  - `INSERT dogs {featured:true}` → **SUCCEEDED** (self-featured on homepage)
  - Second active listing on free tier → **SUCCEEDED** (1-listing cap is client-JS only, `sell/page.tsx:308-325`)
  - Cross-user check: `UPDATE` another seller's dog → correctly blocked (RLS ownership works)
- **Expected:** trust fields (`verified`, `rating`, `review_count`, `subscription_*`, `stripe_*`) and `dogs.featured` are server-controlled; listing caps enforced server-side
- **Actual:** `profiles` policy is `FOR ALL USING (auth.uid()=id)` with no column protection; no cap enforcement in DB
- **Involves:** backend (Supabase RLS/grants/triggers)
- **Fix (migration):** revoke direct INSERT/UPDATE on trust columns (column-level `GRANT`s or a `BEFORE INSERT/UPDATE` trigger forcing `verified=false`, `rating=null`, `review_count=0`, `subscription_*` unchanged unless `service_role`); force `dogs.featured=false` unless seller is Pro (trigger); enforce listing cap in a trigger (`count active listings >= cap → raise`). Re-run the QA probe to confirm all three are blocked.

### P0-5 · No buyer→seller contact path — the marketplace cannot produce a single transaction
- **URL/page:** `/dogs/[id]`
- **Account:** anonymous or buyer
- **Repro:** open any listing → click "Contact Seller", "Make an Offer", "Buy Now", "Request Phone Number"
- **Expected:** some contact mechanism (message thread, email relay, or even revealed contact info)
- **Actual:** all four buttons have no `onClick`/`href` — nothing happens. No messages table exists (REST 404 `PGRST205`). Sell flow collects no public contact info.
- **Involves:** frontend + backend (missing feature)
- **Fix (minimum viable for launch):** pick ONE: (a) "Contact Seller" opens a form that emails the seller via Resend and stores the inquiry row, or (b) reveal seller email/phone to logged-in users. Full threaded messaging is post-launch. Update Free-tier "Buyer messaging" copy to match whatever ships.

### P0-6 · Seller identity never renders — every listing shows an empty seller card
- **URL/page:** `/dogs/[id]` (live-verified on the Nitro listing)
- **Repro:** open a listing → seller card shows the "Seller" heading with no name, kennel, or details
- **Cause:** `profiles` table is empty (no trigger — see P0-3), so the `profiles` lookup in `dogs/[id]/page.tsx:49-53` returns nothing; additionally live RLS appears to block anon profile reads (repo migration says `SELECT USING(true)` but live behavior differs — **remote DB has drifted from migrations**, see P1-4)
- **Fix:** create the signup trigger + backfill; add an anon-readable **view** of safe profile columns (name, kennel, verified, rating — NOT phone) and point listing pages at it; confirm the seller card renders.

### P0-7 · Uploaded photos are never displayed to buyers
- **URL/page:** `/dogs` (browse cards) and `/dogs/[id]`
- **Account:** any
- **Repro:** the Nitro seed listing has 3 images in storage; browse card shows diagonal-stripe "Dog Portrait" placeholder (`dogs/page.tsx:260-278` never reads `dog.images`); detail page unconditionally renders "🐕 Photos coming soon" (`dogs/[id]/page.tsx:88-93`)
- **Expected:** photos a seller uploads (the sell wizard's whole Step 3) are what sells a dog
- **Actual:** photos render ONLY in the homepage Featured strip (`featured-dogs.tsx:99`)
- **Fix:** render `images[0]` on browse cards and a gallery on the detail page (Next/Image with `remotePatterns` for the Supabase storage host). Also display `registrations`, `hunt_titles` docs, `pedigree_url`, `video_url` collected at listing time — or stop collecting them at launch.

### P0-8 · No Terms of Service or Privacy Policy
- **URL/page:** `/terms` → 404, `/privacy` → 404; no footer legal links
- **Why P0:** payments (subscriptions), PII collection, and live-animal sales facilitation without any terms, marketplace disclaimer, refund language, or privacy disclosure. Also required by Stripe's ToS for merchants, and by GDPR/CCPA-adjacent baseline expectations.
- **Fix:** ship standard marketplace ToS + Privacy pages (flag for real legal review — see Legal section), link in footer, add checkbox at signup. Include: platform-is-not-a-party disclaimer, no-escrow clarity (until built), prohibited listings, animal-welfare and legal-compliance responsibility on seller, age 18+, state-law/transport disclaimer.

---

## P1 — MUST FIX BEFORE OR IMMEDIATELY AFTER LAUNCH

### P1-1 · No logout anywhere
No `signOut()` call exists in the codebase; navbar always shows "Sign In." Users on shared devices cannot log out. **Fix:** auth-aware navbar (show account state + Sign Out).

### P1-2 · No forgot/reset password
`/forgot-password`, `/reset-password` → 404; no `resetPasswordForEmail` call. Locked-out users are permanently locked out (support burden lands on you). **Fix:** standard Supabase reset flow (2 small pages).

### P1-3 · Dashboard is 100% fake and has no listing management
`(dashboard)/dashboard/page.tsx:12-35` renders `MOCK_DOGS.slice(0,3)` and hardcoded stats ("142 Profile Views", "7 Inquiries") for every user. No edit, delete, mark-sold, or reactivate exists anywhere — the sell-flow error message "Mark one sold" references a feature that doesn't exist, and a free user can never free their slot. Sidebar links `/dashboard/profile` and `/dashboard/settings` → **404** (`(dashboard)/layout.tsx:13-14`). Sidebar still says "GUNDOG MARKET" in the old orange. **Fix:** query the user's real listings; add Edit (reuse sell wizard) + Mark Sold + Delete; remove or build the sidebar links; fix branding.

### P1-4 · Remote database has drifted from committed migrations
`001_initial.sql` lacks: `dogs.registrations/documents/pedigree_url`, all `profiles.subscription_*`/`stripe_*` columns, and the live (stricter) profiles RLS. The production schema was edited by hand. Anyone rebuilding from the repo gets a broken app, and policy state is unauditable. **Fix:** `supabase db pull` (or dump remote schema) into a new committed migration; from now on schema changes go through migrations only.

### P1-5 · Stripe webhook has no idempotency/ordering guard
`webhooks/stripe/route.ts` verifies signatures (good) but processes replayed/out-of-order `subscription.updated` events blindly — a stale "canceled" replay after reactivation would downgrade a paying user. Also `current_period_end` is read via a fragile `as unknown as` cast and may store null. **Fix:** store processed `event.id`s (table with unique constraint) and skip duplicates; compare `event.created` against last-applied timestamp.

### P1-6 · Uploaded documents (vet records, pedigrees) are publicly readable
`dog-documents` bucket uses public URLs (`sell/page.tsx:216-246`); these files can contain names/addresses/registration numbers. Bucket policies exist only in the dashboard (not in repo — unauditable). **Fix:** private bucket + signed URLs for documents; keep `dog-photos` public. Commit storage policies.

### P1-7 · Browse-page bugs
(a) Search crashes on listings with null city — `dogs/page.tsx:123` calls `.toLowerCase()` on nullable `location_city` (sell form inserts null). (b) Homepage breed pills link `/dogs?breed=GSP` but the page never reads `searchParams` — filter silently ignored; pill labels ("Lab","GSP") wouldn't match DB breed strings anyway. (c) All listings load in one unpaginated query — fine at 2 dogs, degrades at hundreds. (d) Copy says "Sorted by week of listing — fresh first" but sort is featured-first. **Fix:** null-guard, wire `searchParams` with canonical breed values, add pagination before listing volume grows.

### P1-8 · Sell-wizard validation is thin
Publish requires only breed, training level, price (`sell/page.tsx:763`); fields marked `*` (age, gender, description, state) aren't enforced; price accepts 0/negative; no per-step gating. Also the wizard promises "Buyers see these on the listing" for docs that are never displayed (P0-7). **Fix:** enforce required fields + sane price bounds client- and DB-side (CHECK constraint).

### P1-9 · Login redirect param mismatch
`upgrade/page.tsx:66` sends `/login?next=/upgrade` but login reads `redirect` — user lands on /dashboard instead of returning to upgrade (drops a purchase-intent flow). One-line fix.

### P1-10 · Image handling
1.86 MB unoptimized PNG served straight from storage on the seed listing; `next.config.ts` has no `images.remotePatterns` so Next/Image runs unoptimized. **Fix:** add remotePatterns + use optimized `<Image>`; optionally client-resize before upload. (Also closes the minor hole of listings pointing `images[]` at arbitrary external URLs.)

---

## P2 — IMPORTANT IMPROVEMENTS

- **SEO foundation absent:** no `sitemap.xml`, no `robots.txt`, no canonical, no JSON-LD, no `og:image`, no `metadataBase`; dog pages have generic site-wide titles/OG (no `generateMetadata`); browse content is client-fetched so crawlers see an empty state. For a listings site this forfeits the main organic channel. Add: `robots.ts`, dynamic `sitemap.ts` (dog + static URLs), `generateMetadata` on `dogs/[id]` (title = "Nitro — GSP, Started, $1,500 — Missouri"), a real OG image, Product/Offer JSON-LD.
- **Analytics: none installed.** Zero visibility on launch traffic. Minimum viable: Vercel Analytics (1-line) or Plausible/GA4 + events for `account_created`, `listing_created`, `search_performed`, `contact_seller`, `checkout_started`, `subscription_started`.
- **Empty-marketplace launch experience:** 2 seed dogs (one titled "SAMPLE — delete it). Recommend: recruit 5–10 founding breeders pre-announcement (free Pro for 6 months), seed 15–25 real listings across pointer/retriever/versatile groups, keep the honest "Be the First to List" empty state, remove the fake stat row until real numbers exist, hide zero-count breed categories.
- **Reviews:** table + insert policy exist, zero UI; also self-review and repeat-review are unguarded, and profile `rating`/`review_count` aren't derived from reviews. Either ship minimal review display + write path with guards, or drop review/rating UI references at launch.
- **Public seller/kennel profile pages** (`/sellers/[id]`): promised by "kennel history before you buy" copy; currently nothing.
- **Stripe customer portal** for cancel/payment-method management ("coming soon" text at `upgrade/page.tsx:110`) — without it, cancellations become support emails.
- **Email notifications** (Resend): welcome, listing-published, inquiry-received; SPF/DKIM on gundogexchange.com before sending.

## P3 — POLISH / FUTURE

- Remove dead code: 10 unused shadcn components (~800 lines), `MOCK_DOGS` once dashboard is real, leftover template SVGs (`globe.svg`, `window.svg`, `vercel.svg`, `file.svg`).
- Brand consistency: dashboard sidebar wordmark/color vs new brand; commit the uncommitted brand-color working-tree changes (login/signup/globals.css) or revert them so deploys match the repo.
- `training_level` mismatch: `featured-dogs.tsx:30` maps a `'broke'` level the DB check constraint doesn't allow.
- Favicon is 26 KB (fine, but an .ico + SVG pair would be tidier); `supabase/.temp/` project-ref files are committed (identifiers, not secrets — still better ignored).
- Mobile nav: verify the sheet menu on small screens once real testing happens.

---

## Buyer Journey Results

| Step | Result | Notes |
|---|---|---|
| View homepage | **PASS** | renders, but claims are false (P0-1) |
| Browse dogs | **PASS (degraded)** | works; no photos on cards (P0-7), no server filters, null-city crash risk (P1-7) |
| Search/filter | **PARTIAL** | client-side filters work on loaded data; breed-pill deep links dead |
| Sort | **FAIL** | no user-selectable sort; copy misstates order |
| Dog detail page | **PARTIAL** | data renders; photos placeholder (P0-7); seller card empty (P0-6) |
| Create account | **FAIL** | confirm email links to 404 (P0-2) |
| Login | **PASS** | works (QA-verified) |
| Logout | **FAIL** | doesn't exist (P1-1) |
| Forgot password | **FAIL** | doesn't exist (P1-2) |
| Contact seller | **FAIL** | dead button, no mechanism (P0-5) |
| Favorites/saves | **FAIL** | promised in signup copy, doesn't exist |
| Buy/offer/escrow | **FAIL** | dead buttons, no purchase flow (P0-1/P0-5) |

## Seller Journey Results

| Step | Result | Notes |
|---|---|---|
| Seller registration | **FAIL** | same broken confirm funnel (P0-2) |
| Seller/kennel profile | **FAIL** | no profile row auto-created; no profile edit UI; no public seller page |
| Create listing (/sell wizard) | **PASS (conditional)** | wizard works incl. real photo/doc upload to Supabase Storage; thin validation (P1-8) |
| Photos visible to buyers | **FAIL** | only on homepage Featured strip (P0-7) |
| Free 1-listing cap | **FAIL** | client-only; bypassed via API in testing (P0-4) |
| View own listings | **FAIL** | dashboard shows mock data (P1-3) |
| Edit / mark sold / delete / relist | **FAIL** | none exist (P1-3) |
| Edit another seller's listing | **PASS (blocked)** | RLS ownership verified live — correctly denied |

## Payment Test Results

**Provider discovered:** Stripe (subscription mode, price via `STRIPE_PRICE_GDE_PRO` env, $29/mo per UI copy). Checkout route is properly authenticated (session-derived user, 401 unauthenticated — cannot buy for another user). Webhook verifies signatures.

| Test | Result |
|---|---|
| Prod checkout endpoint | **FAIL — 503 "Stripe not configured yet"** (live-verified) |
| `STRIPE_PRICE_GDE_PRO` / `STRIPE_WEBHOOK_SECRET` | **Missing** (local + evidently prod) |
| Local `STRIPE_SECRET_KEY` | placeholder value |
| Webhook → DB upgrade path | **Would silently fail** — `profiles` empty, UPDATE matches 0 rows (P0-3) |
| Successful/declined/canceled payment flows | **UNTESTABLE** until configured |
| Webhook idempotency/replay | **FAIL** — no event dedupe (P1-5) |
| Subscription mgmt / customer portal | **FAIL** — not implemented ("coming soon") |
| Free-tier limit enforcement | **FAIL** — bypassed live (P0-4) |
| "Verified badge" on Pro | **FAIL** — webhook never sets `verified`; meanwhile anyone can set it themselves (P0-4). Decide: badge = paid (relabel it) or badge = identity-verified (build verification). Do not conflate. |

## Escrow Test Results

**REAL ESCROW FUNCTIONALITY DOES NOT EXIST.** No escrow provider, no Stripe Connect, no purchase/order/offer tables or routes, no payout/KYC, no dispute or refund mechanism. The only money flow in the codebase is the seller's own $29 Pro subscription. Every escrow/buyer-protection claim on the site is unbacked → P0-1. The site is currently a classifieds/contact platform (and the contact part is also missing — P0-5).

## Email Test Results

No email provider (Resend/SendGrid/etc.) is installed — zero transactional email exists beyond Supabase's built-in auth confirmation, whose redirect 404s (P0-2). Sender domain, SPF/DKIM/DMARC: not applicable yet; must be configured when email ships. **FAIL.**

## Admin Test Results

No admin backend exists: no admin routes, no role column, no moderation, no user/listing/subscription management tooling. Admin work currently means raw Supabase dashboard access. Direct admin-endpoint access tests: N/A (nothing to probe — which also means nothing to secure, for now). **FAIL (absent).** Minimum for launch week: a simple service-role-gated admin page or documented Supabase-dashboard runbook for removing listings/banning users/granting Pro.

## Mobile Test Results

**NOT DEVICE-TESTED** (no real-device pass in this audit). Code review shows responsive Tailwind classes and a mobile sheet menu throughout; nothing obviously broken. Before launch: one manual pass on a real iPhone + Android through browse → detail → signup → sell (photo upload from camera roll is the highest-risk step). **INCOMPLETE.**

## Browser Test Results

Not run (audit was HTTP/code-level). Smoke Chrome + Safari + Edge during Day 5 regression. **INCOMPLETE.**

## Security / Permissions Results

| Check | Result |
|---|---|
| Cross-user listing edit (IDOR) | **PASS** — blocked by RLS (live-tested) |
| Anonymous read of profile PII (phone) | **PASS** — live RLS returns 0 rows to anon (note: committed migration says otherwise — fix drift, P1-4) |
| Self-assign verified/rating/Pro | **FAIL** — succeeded live (P0-4) |
| Listing cap / self-featured | **FAIL** — bypassed live (P0-4) |
| Checkout auth | **PASS** — 401 unauthenticated; session-derived user |
| Webhook signature | **PASS**; replay dedupe **FAIL** (P1-5) |
| Service-role key exposure | **PASS** — server-only, env not committed |
| XSS | **PASS** — no `dangerouslySetInnerHTML`; JSX-escaped output |
| SQL injection | **PASS (by architecture)** — PostgREST parameterized |
| Upload restrictions | **PARTIAL** — client-side MIME/size only; storage policies not in repo (P1-6); docs publicly readable (P1-6) |
| Secrets in repo | **PASS** — none found |
| Schema introspection | **PASS** — OpenAPI root 401 |

## SEO Results

**FAIL overall** — root metadata only. No sitemap, no robots.txt, no canonicals, no JSON-LD, no og:image, generic titles on every dog page, client-rendered browse invisible to crawlers. Proper 404s and indexable homepage are the only passes. Details in P2.

## Legal / Policy Gaps (flag for counsel — not legal advice)

Missing entirely: Terms of Service · Privacy Policy · marketplace/seller agreement · refund/cancellation policy for Pro subscriptions · prohibited-listings + animal-welfare policy · dispute policy · age requirement · state-law/transport/health-certificate disclaimers (interstate dog sales trigger state-specific breeder/transport rules) · escrow terms (moot until escrow exists — remove claims instead). Also decide merchant-of-record posture: today the only merchant activity is the SaaS subscription (simple); actual dog-money handling (escrow/Connect) is a materially bigger compliance lift — recommend explicitly deferring it post-launch.

---

# THIS WEEK'S LAUNCH PLAN

**Scope decision baked into this plan:** launch as an honest classifieds + contact marketplace. Defer: escrow, threaded messaging, identity verification, admin UI. Cut the copy to match. (If you want Pro revenue at launch, Day 3 covers it; otherwise hide pricing and defer Stripe too.)

### DAY 1 — STOP THE BLEEDING (site is already public)
1. **Copy purge (P0-1):** remove/reword escrow, buyer-protection, identity-verified, messaging, "2,400+ Listings" claims. Files: `src/app/page.tsx`, `src/app/dogs/[id]/page.tsx`, `src/app/layout.tsx` (meta). Verify: read every rendered claim; nothing promises the unbuilt. — *no dependencies*
2. **Fix signup funnel (P0-2):** `signup/page.tsx` emailRedirectTo → `/callback`; add redirect URL in Supabase Auth settings; manually confirm the 1 stuck user. Verify: fresh signup end-to-end on prod.
3. **Profiles trigger + backfill (P0-3/P0-6 prereq):** migration adding `handle_new_user()` trigger; backfill 5 existing users; commit remote schema as migration (P1-4 `supabase db pull`). Verify: new signup → profile row exists.
4. Delete the "Duke — SAMPLE" seed listing.

### DAY 2 — CORE MARKETPLACE FUNCTION
1. **Photos render (P0-7):** browse cards use `images[0]`; detail page gallery; `next.config.ts` remotePatterns. Verify: Nitro's 3 photos visible on /dogs and detail.
2. **Seller card (P0-6):** safe-columns profile view readable by anon; detail page reads it. Verify: seller name/kennel renders.
3. **Contact seller (P0-5):** minimal inquiry flow — logged-in "Contact Seller" form → insert `inquiries` row + Resend email to seller (set up Resend + SPF/DKIM today; it's also needed for launch emails). Verify: send inquiry from QA buyer → email arrives at seller address.
4. **Lockdown migration (P0-4):** trust-column trigger, featured guard, listing-cap trigger. Verify: re-run the QA probe (recreate from audit notes — `~/.config/mod-dev/secrets/gde-qa-account.txt` account) — all three attacks must now be BLOCKED.

### DAY 3 — PAYMENTS + SELLER FLOW (or hide pricing and skip)
1. Stripe live product/price $29-mo; Vercel envs `STRIPE_SECRET_KEY`, `STRIPE_PRICE_GDE_PRO`, `STRIPE_WEBHOOK_SECRET`; register webhook. Test-mode E2E first: checkout → webhook → `subscription_tier='pro'` → 5-listing cap → homepage featuring. Depends on Day 1 trigger.
2. Webhook idempotency table (P1-5).
3. Decide Verified-badge semantics (rename to "Pro" badge is the honest 5-minute fix).
4. **Dashboard real data + Mark Sold / Delete / Edit (P1-3).** Verify: QA seller manages a listing end-to-end. Remove mock stats; fix 404 sidebar links.
5. Logout (P1-1) + forgot/reset password (P1-2).

### DAY 4 — CONTENT / LEGAL / SEO / MOBILE
1. Terms + Privacy + prohibited-listings pages (P0-8), footer links, signup checkbox. Flag for legal review.
2. SEO: `robots.ts`, `sitemap.ts`, `generateMetadata` on dog pages, og:image, metadataBase.
3. Analytics: Vercel Analytics + the 6 core events.
4. Browse fixes: null-city guard, breed-pill params, sort copy (P1-7); sell validation (P1-8); login `next` param (P1-9); image optimization (P1-10).
5. Seed content: recruit founding breeders, target 10+ real listings; real-device mobile pass (esp. photo upload).

### DAY 5 — REGRESSION + LAUNCH
1. Full smoke test below on prod, desktop + mobile, Chrome/Safari/Edge.
2. Re-run security probe (self-verify, cap bypass, featured, cross-user edit) — all blocked.
3. Private-bucket documents (P1-6) if docs shipped; otherwise hide doc upload.
4. Fresh backup/snapshot of Supabase; tag repo `v1.0-launch`; then marketing.

---

# FINAL PRE-LAUNCH SMOKE TEST

Run on production, in order (≈30 min):

1. [ ] Homepage loads; no claim references escrow/verification/messaging that doesn't exist; stats are real or absent
2. [ ] Sign up with a fresh email → confirmation email arrives → link works → lands logged-in
3. [ ] Log out; log back in; forgot-password round-trip works
4. [ ] Browse /dogs: photos visible on cards; search with a listing that has no city; each filter; empty-state on nonsense search
5. [ ] Open a listing: photos gallery, seller name/kennel, price, titles render; share URL shows correct title/OG preview
6. [ ] Contact Seller as a buyer → seller receives email/inquiry; buyer sees confirmation
7. [ ] Create a listing as free seller (with phone photos); it appears on /dogs; second listing is BLOCKED with clear message
8. [ ] Edit the listing; Mark Sold; confirm it disappears from browse; slot frees up
9. [ ] Upgrade to Pro (live card, refund after or 100%-off promo): checkout completes → dashboard shows Pro → can create listing #2–5 → #6 blocked
10. [ ] Cancel via portal/support path documented; webhook downgrade verified in test mode
11. [ ] API probes: self-set `verified`/`featured`/`subscription_tier` and over-cap insert all REJECTED; cross-user edit rejected
12. [ ] /terms, /privacy load and are linked in footer; signup requires acceptance
13. [ ] robots.txt, sitemap.xml resolve; a dog URL is in the sitemap; unique title on dog page
14. [ ] 404 page for garbage URL; no console errors on the 5 core pages
15. [ ] Full buyer + seller pass on a real phone (photo upload from camera roll)
16. [ ] Analytics events firing (check dashboard)
17. [ ] Supabase backup taken; repo tagged; rollback = Vercel instant rollback to previous deployment

---
*Working notes: QA account `wrymedia+gde-qa-audit@gmail.com` (creds: `~/.config/mod-dev/secrets/gde-qa-account.txt`) left in place for re-verification; its test listings were deleted and profile reverted/flagged. Probe scripts were removed from the repo after use. No production data was modified beyond the labeled QA rows. One pre-existing unconfirmed user was left untouched.*
