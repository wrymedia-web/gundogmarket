import Stripe from 'stripe'

// The Stripe account is shared with OutfitterDesk — every query here is
// scoped to the GDE Breeder Pro price so metrics only reflect GunDog Exchange.

export type StripeAdminData = {
  configured: boolean
  activeSubscribers: number
  trialing: number
  canceled: number
  mrrCents: number
  revenueCents90d: number
  failedInvoices90d: number
  upcomingRenewals: { customerEmail: string; renewsAt: string; amountCents: number }[]
  subscriptions: {
    id: string
    status: string
    customerEmail: string
    supabaseUserId: string | null
    currentPeriodEnd: string | null
    amountCents: number
  }[]
  invoices: {
    id: string
    status: string
    customerEmail: string
    amountCents: number
    created: string
    paymentIntentId: string | null
    hostedUrl: string | null
  }[]
}

export async function getStripeAdminData(): Promise<StripeAdminData> {
  const secret = process.env.STRIPE_SECRET_KEY
  const priceIds = [
    process.env.STRIPE_PRICE_GDE_STANDARD,
    process.env.STRIPE_PRICE_GDE_FEATURED,
    process.env.STRIPE_PRICE_GDE_PRO,
  ].filter(Boolean) as string[]
  const empty: StripeAdminData = {
    configured: false, activeSubscribers: 0, trialing: 0, canceled: 0, mrrCents: 0,
    revenueCents90d: 0, failedInvoices90d: 0, upcomingRenewals: [], subscriptions: [], invoices: [],
  }
  if (!secret || priceIds.length === 0) return empty

  const stripe = new Stripe(secret)

  const subLists = await Promise.all(priceIds.map((pid) =>
    stripe.subscriptions.list({ price: pid, status: 'all', limit: 100, expand: ['data.customer'] })
  ))
  const seen = new Set<string>()
  const subsData = subLists.flatMap((l) => l.data).filter((s) => !seen.has(s.id) && seen.add(s.id))

  const subscriptions = subsData.map((s) => {
    const cust = s.customer as Stripe.Customer | Stripe.DeletedCustomer
    const email = 'email' in cust ? (cust.email ?? '—') : '(deleted)'
    const item = s.items.data[0] as unknown as { current_period_end?: number; price?: Stripe.Price }
    const amount = s.items.data.reduce((sum, i) => sum + (i.price.unit_amount ?? 0) * (i.quantity ?? 1), 0)
    return {
      id: s.id,
      status: s.status,
      customerEmail: email,
      supabaseUserId: (s.metadata?.supabase_user_id as string) ?? null,
      currentPeriodEnd: item?.current_period_end ? new Date(item.current_period_end * 1000).toISOString() : null,
      amountCents: amount,
    }
  })

  const active = subscriptions.filter((s) => s.status === 'active')
  const trialing = subscriptions.filter((s) => s.status === 'trialing')
  const canceled = subscriptions.filter((s) => s.status === 'canceled')
  const mrrCents = [...active, ...trialing].reduce((sum, s) => sum + s.amountCents, 0)

  const upcomingRenewals = [...active, ...trialing]
    .filter((s) => s.currentPeriodEnd && new Date(s.currentPeriodEnd).getTime() < Date.now() + 14 * 86400_000)
    .map((s) => ({ customerEmail: s.customerEmail, renewsAt: s.currentPeriodEnd!, amountCents: s.amountCents }))

  // Invoices for the GDE price only (90 days)
  const since = Math.floor(Date.now() / 1000) - 90 * 86400
  const invList = await stripe.invoices.list({ limit: 100, created: { gte: since }, expand: ['data.customer'] })
  const gdeInvoices = invList.data.filter((inv) =>
    inv.lines.data.some((l) => {
      const pid = (l as unknown as { price?: { id: string } }).price?.id ??
        (l.pricing as unknown as { price_details?: { price?: string } })?.price_details?.price
      return !!pid && priceIds.includes(pid)
    })
  )
  const invoices = gdeInvoices.map((inv) => {
    const cust = inv.customer as Stripe.Customer | Stripe.DeletedCustomer | null
    const email = cust && 'email' in cust ? (cust.email ?? '—') : '—'
    const pi = (inv as unknown as { payment_intent?: string | { id: string } }).payment_intent
    return {
      id: inv.id!,
      status: inv.status ?? 'unknown',
      customerEmail: email,
      amountCents: inv.amount_paid || inv.amount_due || 0,
      created: new Date((inv.created ?? 0) * 1000).toISOString(),
      paymentIntentId: typeof pi === 'string' ? pi : pi?.id ?? null,
      hostedUrl: inv.hosted_invoice_url ?? null,
    }
  })

  const revenueCents90d = gdeInvoices.filter((i) => i.status === 'paid').reduce((s, i) => s + (i.amount_paid ?? 0), 0)
  const failedInvoices90d = gdeInvoices.filter((i) => i.status === 'open' || i.status === 'uncollectible').length

  return {
    configured: true,
    activeSubscribers: active.length,
    trialing: trialing.length,
    canceled: canceled.length,
    mrrCents,
    revenueCents90d,
    failedInvoices90d,
    upcomingRenewals,
    subscriptions,
    invoices,
  }
}
