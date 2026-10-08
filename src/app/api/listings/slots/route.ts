import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

// Add or remove a $10/30-day extra-listing slot on the seller's existing
// subscription. Adding invoices the prorated amount immediately; removing
// takes effect now with no partial-period credit (disclosed in UI).
export async function POST(req: Request) {
  const secret = process.env.STRIPE_SECRET_KEY
  const extraPrice = process.env.STRIPE_PRICE_GDE_EXTRA
  if (!secret || !extraPrice) return NextResponse.json({ error: 'Add-ons not available yet.' }, { status: 503 })

  let action: 'add' | 'remove' = 'add'
  try {
    const body = await req.json()
    if (body.action === 'remove') action = 'remove'
  } catch { /* default add */ }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_subscription_id, subscription_tier, subscription_status, extra_listings')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.stripe_subscription_id) {
    return NextResponse.json({ error: 'Extra listings require an active Standard or Featured plan.' }, { status: 409 })
  }

  const stripe = new Stripe(secret)
  const sub = await stripe.subscriptions.retrieve(profile.stripe_subscription_id).catch(() => null)
  if (!sub || !['active', 'trialing', 'past_due'].includes(sub.status)) {
    return NextResponse.json({ error: 'Your subscription isn’t active. Check Manage Billing in Settings.' }, { status: 409 })
  }

  const extraItem = sub.items.data.find((i) => i.price.id === extraPrice)
  const currentQty = extraItem?.quantity ?? 0

  if (action === 'add') {
    if (currentQty >= 20) return NextResponse.json({ error: 'Slot limit reached — contact support.' }, { status: 409 })
    if (extraItem) {
      await stripe.subscriptionItems.update(extraItem.id, { quantity: currentQty + 1, proration_behavior: 'always_invoice' })
    } else {
      await stripe.subscriptionItems.create({
        subscription: sub.id, price: extraPrice, quantity: 1, proration_behavior: 'always_invoice',
      })
    }
    await createServiceClient().from('profiles').update({ extra_listings: currentQty + 1 }).eq('id', user.id)
    return NextResponse.json({ ok: true, extraListings: currentQty + 1 })
  }

  // remove
  if (currentQty === 0 || !extraItem) {
    return NextResponse.json({ error: 'No extra slots to remove.' }, { status: 409 })
  }
  // Don't allow removing a slot that's in use
  const service = createServiceClient()
  const { count: activeCount } = await service
    .from('dogs').select('id', { count: 'exact', head: true })
    .eq('seller_id', user.id).eq('status', 'active')
  const newCap = 1 + (currentQty - 1) + (profile.subscription_tier === 'pro' ? 4 : 0)
  if ((activeCount ?? 0) > newCap) {
    return NextResponse.json({ error: `You have ${activeCount} active listings. Mark one sold or unpublish it first.` }, { status: 409 })
  }
  if (currentQty === 1) {
    await stripe.subscriptionItems.del(extraItem.id, { proration_behavior: 'none' })
  } else {
    await stripe.subscriptionItems.update(extraItem.id, { quantity: currentQty - 1, proration_behavior: 'none' })
  }
  await service.from('profiles').update({ extra_listings: currentQty - 1 }).eq('id', user.id)
  return NextResponse.json({ ok: true, extraListings: currentQty - 1 })
}
