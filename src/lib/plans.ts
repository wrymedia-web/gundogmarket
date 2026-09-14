// Single source of truth for subscription tiers.
// Stripe billing is not live yet — checkout falls back to a 503 until price IDs exist.

export type PlanId = 'basic' | 'pro' | 'kennel'

export type Plan = {
  id: PlanId
  name: string
  price: string
  period: string
  trial: string | null
  maxListings: number // Infinity = unlimited
  tagline: string
  features: string[]
  cta: string
}

export const PLANS: Record<PlanId, Plan> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: '$9.99',
    period: '/month',
    trial: '30-day free trial',
    maxListings: 1,
    tagline: 'For the one-dog seller',
    features: ['30-day free trial', '1 active listing', 'Basic seller profile', 'Photo upload'],
    cta: 'Start Free Trial',
  },
  pro: {
    id: 'pro',
    name: 'Breeder Pro',
    price: '$29',
    period: '/month',
    trial: null,
    maxListings: 3,
    tagline: 'For working breeders',
    features: ['Up to 3 active listings', 'Verified badge', 'One social-media post promoting your listing', 'Priority support'],
    cta: 'Upgrade to Pro',
  },
  kennel: {
    id: 'kennel',
    name: 'Kennel',
    price: '$49',
    period: '/month',
    trial: null,
    maxListings: Infinity,
    tagline: 'For full kennel programs',
    features: ['Unlimited active listings', 'Video on listings', 'Verified badge', 'One social-media post promoting your listing', 'Priority support'],
    cta: 'Go Kennel',
  },
}

export const PLAN_ORDER: PlanId[] = ['basic', 'pro', 'kennel']

export function listingCap(tier: string | null | undefined, active: boolean): number {
  if (!active) return 1
  if (tier === 'kennel') return Infinity
  if (tier === 'pro') return PLANS.pro.maxListings
  return PLANS.basic.maxListings
}
