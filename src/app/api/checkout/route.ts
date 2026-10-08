import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { PLANS, type PlanId } from '@/lib/plans'

const PRICE_ENV: Record<PlanId, string | undefined> = {
  standard: process.env.STRIPE_PRICE_GDE_STANDARD,
  featured: process.env.STRIPE_PRICE_GDE_FEATURED,
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret || !PRICE_ENV.standard || !PRICE_ENV.featured) {
    return NextResponse.json({ error: 'Plans aren’t available quite yet — check back soon.' }, { status: 503 })
  }

  let plan: PlanId = 'standard'
  let trial = false
  try {
    const body = await req.json()
    if (body.plan === 'featured') plan = 'featured'
    trial = body.trial === true && plan === 'standard' // trial converts to Standard only
  } catch { /* defaults */ }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, stripe_subscription_id, subscription_status, full_name')
    .eq('id', user.id)
    .maybeSingle()

  const stripe = new Stripe(secret)

  // Prevent duplicate subscriptions: live sub → manage it in the portal instead
  if (profile?.stripe_subscription_id) {
    const existing = await stripe.subscriptions.retrieve(profile.stripe_subscription_id).catch(() => null)
    if (existing && ['active', 'trialing', 'past_due'].includes(existing.status)) {
      return NextResponse.json({
        error: 'You already have a subscription. Use Manage Billing in Settings to change plans.',
        manage: true,
      }, { status: 409 })
    }
  }

  let customerId = profile?.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      name: profile?.full_name ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
    await createServiceClient().from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
  }

  const origin = new URL(req.url).origin
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: PRICE_ENV[plan]!, quantity: 1 }],
    // Card is always collected — including for the free trial
    payment_method_collection: 'always',
    success_url: `${origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?canceled=1`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { supabase_user_id: user.id, tier: plan },
      ...(trial ? { trial_period_days: PLANS.standard.trialDays } : {}),
    },
  })

  return NextResponse.json({ url: session.url })
}
