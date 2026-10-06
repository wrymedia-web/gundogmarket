# GunDog Exchange — Agent Instructions

## Read First
Before starting any major work, read `docs/PROJECT-STATE.md` for current status, completed work, known issues, and the next recommended task.

## What This Is
Marketplace for buying and selling hunting dogs. Brand: **GunDog Exchange**. Domain: gundogexchange.com (live, DNS pointed).

## Stack
- **Framework:** Next.js 16 (App Router, React 19, Tailwind 4)
- **Database:** Supabase (project `bbrcozoncbtemctamiaw`)
- **Auth:** Supabase Auth (email/password, cookie-based SSR sessions)
- **Payments:** Stripe (subscriptions — not yet configured in prod)
- **Hosting:** Vercel (team "Modern Outdoor Media")
- **UI:** shadcn/ui components, Lucide icons

## Critical Rules

### Deployment
There is NO GitHub auto-deploy. Pushing to `main` does nothing. Deploy manually:
```bash
cd /Users/modernoutdoormedia/.openclaw/workspace/gundogmarket
npx vercel --token $VERCEL_TOKEN --yes --prod --scope modern-outdoor-media
```
Always verify the build succeeds locally (`npm run build`) before deploying.

### Auth & Security
- Never use `service-role` client for user-facing actions. Use `createClient()` from `src/lib/supabase/server.ts` (anon key + user session cookies).
- Service-role (`src/lib/supabase/service.ts`) is ONLY for admin routes and webhook handlers.
- RLS is enabled on all tables. Every new table/migration must include RLS policies.
- Trust columns (`verified`, `rating`, `review_count`, `subscription_tier`, `stripe_*`, `dogs.featured`) must only be writable by service-role — never by the user's own session.
- Enforce listing caps server-side (DB trigger or RLS), not just client-side.

### Database
- Schema changes go through Supabase migrations in `supabase/migrations/`. Never edit the remote DB by hand without committing a matching migration.
- The remote DB has drifted from committed migrations (see P1-4 in launch audit). A schema reconciliation migration is needed.

### Coding Conventions
- Route groups: `(auth)` for login/signup/callback, `(dashboard)` for seller dashboard.
- Supabase clients: `src/lib/supabase/client.ts` (browser), `server.ts` (server components/actions), `service.ts` (admin/webhooks).
- Pricing source of truth: `src/lib/plans.ts`.
- Components: `src/components/ui/` for shadcn primitives, `src/components/` for app-level components.

### Working Tree
There are uncommitted brand-color tweaks on login/signup/globals.css — these are Wes's work in progress. Do not commit or discard without asking.

## Session Workflow
At the end of every completed feature or major debugging session, update `docs/PROJECT-STATE.md` with:
1. What was completed (move items from Current Work to Completed)
2. Files changed
3. Database/schema changes made
4. Any new issues discovered
5. The next recommended task

Keep it concise enough that a new session can resume without needing the previous conversation.

## Env Vars (names only)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_PRICE_GDE_BASIC        # not yet set
STRIPE_PRICE_GDE_PRO           # not yet set
STRIPE_PRICE_GDE_KENNEL        # not yet set
STRIPE_WEBHOOK_SECRET           # not yet set
```

## Key References
- Launch audit: `GUNDOGEXCHANGE-LAUNCH-AUDIT.md` (detailed P0–P3 findings)
- Architecture: `docs/ARCHITECTURE.md`
- Project state: `docs/PROJECT-STATE.md`
- GitHub: github.com/wrymedia-web/gundogmarket
