import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/service'

// Subscription lifecycle sync. Tier is derived from the PRICE on the
// subscription (not just metadata) so Billing Portal plan switches are
// reflected correctly.
function tierFromPrice(priceId: string | undefined): 'standard' | 'featured' | 'pro' | null {
  if (!priceId) return null
  if (priceId === process.env.STRIPE_PRICE_GDE_STANDARD) return 'standard'
  if (priceId === process.env.STRIPE_PRICE_GDE_FEATURED) return 'featured'
  if (priceId === process.env.STRIPE_PRICE_GDE_PRO) return 'pro' // legacy
  return null
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

  const supabase = createServiceClient()

  async function syncSubscription(sub: Stripe.Subscription) {
    const userId = (sub.metadata?.supabase_user_id as string) || null
    if (!userId) return

    const item = sub.items?.data?.[0] as unknown as { price?: { id: string }; current_period_end?: number }
    const priceTier = tierFromPrice(item?.price?.id) ?? ((sub.metadata?.tier as string) || 'standard')
    const status = sub.status
    const hasAccess = status === 'active' || status === 'trialing' || status === 'past_due' // past_due = grace period
    const tier = hasAccess ? priceTier : 'free'
    const periodEnd = item?.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null
    const cancelAt = sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString()
      : (sub.cancel_at_period_end && periodEnd ? periodEnd : null)

    await supabase.from('profiles').update({
      subscription_tier: tier,
      subscription_status: status,
      stripe_subscription_id: sub.id,
      subscription_current_period_end: periodEnd,
      subscription_cancel_at: cancelAt,
      breeder_pro: tier === 'pro',
    }).eq('id', userId)

    if (!hasAccess) {
      // Subscription ended (canceled/unpaid after grace): hide listings from
      // public browse WITHOUT deleting data or photos; clear featured flags.
      await supabase.from('dogs').update({ status: 'expired', featured: false })
        .eq('seller_id', userId).eq('status', 'active')
    } else if (tier === 'standard') {
      // Downgrade from a featured-capable plan: pull homepage placement
      await supabase.from('dogs').update({ featured: false })
        .eq('seller_id', userId).eq('featured', true)
    } else if (tier === 'featured') {
      // Upgrade: feature their active listing(s) automatically
      await supabase.from('dogs').update({ featured: true })
        .eq('seller_id', userId).eq('status', 'active')
    }
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await syncSubscription(event.data.object as Stripe.Subscription)
      break
    case 'checkout.session.completed': {
      const s = event.data.object as Stripe.Checkout.Session
      if (s.subscription) {
        const sub = await stripe.subscriptions.retrieve(s.subscription as string).catch(() => null)
        if (sub) await syncSubscription(sub)
      }
      break
    }
    case 'invoice.payment_failed': {
      const inv = event.data.object as Stripe.Invoice
      const subId = (inv as unknown as { subscription?: string }).subscription
      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId).catch(() => null)
        if (sub) await syncSubscription(sub) // status will be past_due/unpaid per Stripe settings
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
