# GunDog Exchange — Architecture

## Stack
- **Next.js 16** (App Router, React 19, Server Components)
- **Supabase** (Postgres, Auth, Storage, RLS)
- **Stripe** (subscription billing — scaffolded, not live)
- **Tailwind CSS 4** + shadcn/ui
- **Vercel** (hosting, manual deploy)

## Directory Structure
```
src/
├── app/
│   ├── (auth)/           # Route group: login, signup, callback
│   │   ├── callback/route.ts
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/      # Route group: seller dashboard
│   │   ├── dashboard/
│   │   │   ├── actions.ts
│   │   │   ├── messages/page.tsx
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── admin/            # Admin panel (not route-grouped)
│   │   ├── actions.ts
│   │   ├── form-components.tsx
│   │   ├── layout.tsx
│   │   ├── listings/[id]/page.tsx
│   │   ├── listings/page.tsx
│   │   ├── messages/page.tsx
│   │   ├── page.tsx
│   │   ├── users/[id]/page.tsx
│   │   └── users/page.tsx
│   ├── api/
│   │   ├── breed-alerts/route.ts
│   │   ├── checkout/pro/route.ts
│   │   └── webhooks/stripe/route.ts
│   ├── dogs/
│   │   ├── [id]/page.tsx
│   │   └── page.tsx
│   ├── sell/page.tsx
│   ├── upgrade/page.tsx
│   ├── terms/page.tsx
│   ├── privacy/page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/               # shadcn primitives
│   ├── breed-alert-signup.tsx
│   ├── contact-seller.tsx
│   ├── featured-dogs.tsx
│   └── navbar.tsx
└── lib/
    ├── supabase/
    │   ├── client.ts     # Browser client (anon key)
    │   ├── server.ts     # Server Components/Actions (anon key + cookies)
    │   └── service.ts    # Admin/webhooks (service_role key)
    ├── mock-data.ts      # Legacy mock data (still used by dashboard)
    ├── plans.ts          # Pricing tier definitions (source of truth)
    └── utils.ts          # cn() helper
```

## Auth Flow
1. User signs up at `/signup` → Supabase sends confirmation email
2. Email link → `/(auth)/callback/route.ts` exchanges code for session
3. Session stored in cookies, read by `server.ts` client
4. Middleware (if added) or per-page checks gate authenticated routes

## Database Schema (Supabase)
### `dogs` (listings)
Core fields: id, user_id, title, breed, gender, age, price, description, training_level, location_state, location_city, images[], registrations, hunt_titles, documents, pedigree_url, video_url, featured, status, created_at

### `profiles` (user profiles)
Fields: id (= auth.uid), full_name, kennel_name, phone, bio, verified, rating, review_count, subscription_tier, stripe_customer_id, stripe_subscription_id, subscription_current_period_end

### `reviews`
Exists but has no UI.

### `breed_alerts`
Fields: id, email, breed, created_at — captures buyer interest by breed.

## Payment Architecture
- Tiers defined in `src/lib/plans.ts`: Free (1 listing) / Pro (5 listings)
- Checkout: `POST /api/checkout/pro` creates Stripe Checkout Session
- Webhook: `POST /api/webhooks/stripe` handles `customer.subscription.updated/deleted`
- Webhook updates `profiles.subscription_tier` and Stripe fields
- **Currently non-functional:** no Stripe keys configured, no profiles rows exist

## Storage
- `dog-photos` bucket — public (listing images)
- `dog-documents` bucket — currently public (should be private: vet records, pedigrees)
