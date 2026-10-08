export type PlanId = 'free' | 'pro'

export type Plan = {
  id: PlanId
  name: string
  price: string
  period: string
  maxListings: number
  tagline: string
  features: string[]
  cta: string
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '',
    maxListings: 1,
    tagline: 'For the one-dog seller',
    features: ['1 active listing', 'Photos & hunt titles', 'Seller profile', 'Buyer messaging'],
    cta: 'List Your Dog Free',
  },
  pro: {
    id: 'pro',
    name: 'Breeder Pro',
    price: '$29',
    period: '/month',
    maxListings: 5,
    tagline: 'For working breeders',
    features: ['Up to 5 active listings', 'Featured placement on homepage', 'Priority in search results', 'Priority support'],
    cta: 'Upgrade to Pro',
  },
}

export const PLAN_ORDER: PlanId[] = ['free', 'pro']

export function listingCap(tier: string | null | undefined): number {
  if (tier === 'pro') return PLANS.pro.maxListings
  return PLANS.free.maxListings
}
