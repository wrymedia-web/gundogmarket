import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'

// Service-role client for webhook writes (bypasses RLS)
function serviceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  )
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret || !whSecret) {
    return NextResponse.json({ error: 'Stripe not configured yet' }, { status: 503 })
  }

  const stripe = new Stripe(secret)
  const sig = req.headers.get('stripe-signature')!
  const raw = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(raw, sig, whSecret)
  } catch (err) {
    return NextResponse.json({ error: `Bad signature: ${(err as Error).message}` }, { status: 400 })
  }

  const supabase = serviceClient()

  async function updateFromSubscription(sub: Stripe.Subscription) {
    const userId = (sub.metadata?.supabase_user_id as string) || null
    if (!userId) return
    const status = sub.status
    const rawTier = (sub.metadata?.tier as string) || 'pro'
    // Only recognize valid paid tiers
    const validPaid = ['basic', 'pro', 'kennel']
    const paidTier = validPaid.includes(rawTier) ? rawTier : 'pro'
    const tier = status === 'active' || status === 'trialing' ? paidTier : 'free'
    // Stripe API returns period end as a Unix timestamp on the first item
    const periodEndUnix = (sub.items?.data?.[0] as unknown as { current_period_end?: number })?.current_period_end
    const periodEnd = periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null
    await supabase.from('profiles').update({
      subscription_tier: tier,
      subscription_status: status,
      stripe_subscription_id: sub.id,
      subscription_current_period_end: periodEnd,
    }).eq('id', userId)

    // When subscription is canceled/expired, enforce free-tier limits on published listings.
    // Retain all listings and media but deactivate any beyond the free cap (1 listing).
    if (tier === 'free') {
      // Get all active listings for this user, ordered oldest first (keep the oldest one)
      const { data: activeDogs } = await supabase
        .from('dogs')
        .select('id')
        .eq('seller_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: true })
      if (activeDogs && activeDogs.length > 1) {
        // Keep the first listing active, deactivate the rest (mark as draft to retain)
        const toDeactivate = activeDogs.slice(1).map((d: { id: string }) => d.id)
        await supabase
          .from('dogs')
          .update({ status: 'draft' })
          .in('id', toDeactivate)
      }
    }
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await updateFromSubscription(event.data.object as Stripe.Subscription)
      break
    case 'checkout.session.completed': {
      const s = event.data.object as Stripe.Checkout.Session
      if (s.subscription) {
        const sub = await stripe.subscriptions.retrieve(s.subscription as string)
        await updateFromSubscription(sub)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
