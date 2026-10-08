export type PlanId = 'standard' | 'featured'

export type Plan = {
  id: PlanId
  name: string
  price: string
  period: string
  priceCents: number
  maxListings: number
  maxPhotos: number
  video: boolean
  featured: boolean
  trialDays: number
  tagline: string
  features: string[]
  cta: string
  renewalDisclosure: string
}

export const PLANS: Record<PlanId, Plan> = {
  standard: {
    id: 'standard',
    name: 'Standard',
    price: '$29',
    period: '/30 days',
    priceCents: 2900,
    maxListings: 1,
    maxPhotos: 1,
    video: false,
    featured: false,
    trialDays: 7,
    tagline: 'Everything you need to sell one dog',
    features: ['1 active dog listing', '1 photo', 'All standard dog information', 'Direct buyer messaging'],
    cta: 'Start Free 7-Day Trial',
    renewalDisclosure: 'Renews automatically at $29 every 30 days until canceled.',
  },
  featured: {
    id: 'featured',
    name: 'Featured',
    price: '$49',
    period: '/30 days',
    priceCents: 4900,
    maxListings: 1,
    maxPhotos: 10,
    video: true,
    featured: true,
    trialDays: 0,
    tagline: 'Maximum exposure for serious sellers',
    features: ['1 active dog listing', 'Up to 10 photos', '1 video', 'Featured placement on the homepage', 'Direct buyer messaging'],
    cta: 'Go Featured',
    renewalDisclosure: 'Renews automatically at $49 every 30 days until canceled.',
  },
}

export const PLAN_ORDER: PlanId[] = ['standard', 'featured']

export type Entitlements = {
  effectiveTier: 'free' | 'pro' | 'standard' | 'featured'
  canPublish: boolean
  maxListings: number
  maxPhotos: number
  videoAllowed: boolean
  featuredAllowed: boolean
}

/**
 * Single source of truth for what an account can do, given its tier + status.
 * Mirrors the DB-side guard_dog_media() trigger (migration 007).
 * Legacy tiers: 'pro' (grandfathered 5 listings) and 'free' (grandfathered
 * existing listings stay up, but new publishes require a plan).
 */
export function entitlements(tier: string | null | undefined, status: string | null | undefined): Entitlements {
  const active = status === 'active' || status === 'trialing'
  const eff = (tier === 'standard' || tier === 'featured' || tier === 'pro')
    ? (active ? tier : 'free')
    : 'free'

  switch (eff) {
    case 'featured':
      return { effectiveTier: eff, canPublish: true, maxListings: 1, maxPhotos: 10, videoAllowed: true, featuredAllowed: true }
    case 'standard':
      return { effectiveTier: eff, canPublish: true, maxListings: 1, maxPhotos: 1, videoAllowed: false, featuredAllowed: false }
    case 'pro': // legacy grandfathered
      return { effectiveTier: 'pro', canPublish: true, maxListings: 5, maxPhotos: 10, videoAllowed: true, featuredAllowed: true }
    default: // free / no subscription — must pick a plan to publish
      return { effectiveTier: 'free', canPublish: false, maxListings: 1, maxPhotos: 10, videoAllowed: true, featuredAllowed: false }
  }
}

/** Legacy helper kept for compatibility with existing call sites. */
export function listingCap(tier: string | null | undefined): number {
  if (tier === 'pro') return 5
  return 1
}
