// Single source of truth for subscription tiers.
// Stripe billing is not live yet — checkout falls back to a 503 until price IDs exist.

export type PlanId = 'free' | 'basic' | 'pro' | 'kennel'

export type Plan = {
  id: PlanId
  name: string
  price: string
  period: string
  trial: string | null
  maxListings: number
  maxPhotos: number
  maxVideos: number
  listingDurationDays: number | null // null = active while subscription is current
  tagline: string
  features: string[]
  cta: string
  /** Whether this plan requires a Stripe subscription (paid) */
  paid: boolean
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '',
    trial: null,
    maxListings: 1,
    maxPhotos: 1,
    maxVideos: 0,
    listingDurationDays: 14,
    tagline: 'Try the exchange — no card required',
    features: [
      '1 active listing',
      '1 photo per listing',
      '14-day listing duration',
      'Basic buyer messaging',
      'Upgrade anytime',
    ],
    cta: 'Get Started Free',
    paid: false,
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    price: '$9.99',
    period: '/month',
    trial: null,
    maxListings: 1,
    maxPhotos: 5,
    maxVideos: 0,
    listingDurationDays: null,
    tagline: 'For the one-dog seller',
    features: [
      '1 active listing',
      'Up to 5 photos per listing',
      'Listing active while subscribed',
      'Buyer messaging',
      'Basic listing analytics',
    ],
    cta: 'Subscribe to Basic',
    paid: true,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: '$24.99',
    period: '/month',
    trial: null,
    maxListings: 3,
    maxPhotos: 10,
    maxVideos: 1,
    listingDurationDays: null,
    tagline: 'For working breeders',
    features: [
      'Up to 3 active listings',
      'Up to 10 photos per listing',
      '1 video per listing',
      'Buyer messaging',
      'Advanced listing analytics',
    ],
    cta: 'Upgrade to Pro',
    paid: true,
  },
  kennel: {
    id: 'kennel',
    name: 'Kennel Elite',
    price: '$59.99',
    period: '/month',
    trial: null,
    maxListings: 20,
    maxPhotos: 20,
    maxVideos: 5,
    listingDurationDays: null,
    tagline: 'For full kennel programs',
    features: [
      'Up to 20 active listings',
      'Up to 20 photos per listing',
      'Up to 5 videos per listing',
      'Buyer messaging',
      'Advanced listing analytics',
      'Dedicated kennel storefront',
      'Featured homepage placement',
      '1 promo social post per month',
    ],
    cta: 'Go Kennel Elite',
    paid: true,
  },
}

/** Paid plans in display order (excludes free) */
export const PAID_PLAN_ORDER: PlanId[] = ['basic', 'pro', 'kennel']

/** All plans in display order */
export const PLAN_ORDER: PlanId[] = ['free', 'basic', 'pro', 'kennel']

/** Resolve the effective tier for a user, accounting for subscription status */
export function effectiveTier(
  tier: string | null | undefined,
  status: string | null | undefined,
): PlanId {
  const isActive = status === 'active' || status === 'trialing'
  if (!isActive || !tier || tier === 'free') return 'free'
  if (tier === 'kennel') return 'kennel'
  if (tier === 'pro') return 'pro'
  if (tier === 'basic') return 'basic'
  return 'free'
}

/** Maximum active listings for a given effective tier */
export function listingCap(tier: string | null | undefined, active: boolean): number {
  const resolved = effectiveTier(tier, active ? 'active' : null)
  return PLANS[resolved].maxListings
}

/** Maximum photos per listing for a given effective tier */
export function photoCap(tier: string | null | undefined, active: boolean): number {
  const resolved = effectiveTier(tier, active ? 'active' : null)
  return PLANS[resolved].maxPhotos
}

/** Maximum video uploads per listing for a given effective tier */
export function videoCap(tier: string | null | undefined, active: boolean): number {
  const resolved = effectiveTier(tier, active ? 'active' : null)
  return PLANS[resolved].maxVideos
}
