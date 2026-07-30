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
    const tier = status === 'active' || status === 'trialing' ? 'pro' : 'free'
    // Stripe API returns period end as a Unix timestamp on the first item
    const periodEndUnix = (sub.items?.data?.[0] as unknown as { current_period_end?: number })?.current_period_end
    const periodEnd = periodEndUnix ? new Date(periodEndUnix * 1000).toISOString() : null
    await supabase.from('profiles').update({
      subscription_tier: tier,
      subscription_status: status,
      stripe_subscription_id: sub.id,
      subscription_current_period_end: periodEnd,
    }).eq('id', userId)
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
