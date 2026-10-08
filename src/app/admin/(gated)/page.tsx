import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import { getStripeAdminData } from '@/lib/stripe-admin'

const sans: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
}
const display: React.CSSProperties = { ...sans, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }
const card: React.CSSProperties = { background: 'white', border: '1px solid #D9C8A6', padding: 20 }

export const dynamic = 'force-dynamic'

function Stat({ label, value, accent, href }: { label: string; value: string | number; accent?: boolean; href?: string }) {
  const inner = (
    <div style={card}>
      <p style={{ ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', marginBottom: 6 }}>{label}</p>
      <p style={{ ...display, fontSize: 28, color: accent ? '#D85A1C' : '#0F0F0E' }}>{value}</p>
    </div>
  )
  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link> : inner
}

function WeeklyBars({ title, buckets }: { title: string; buckets: { label: string; count: number }[] }) {
  const max = Math.max(1, ...buckets.map((b) => b.count))
  return (
    <div style={card}>
      <p style={{ ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', marginBottom: 10 }}>{title}</p>
      <div className="flex items-end gap-2" style={{ height: 90 }}>
        {buckets.map((b, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end" style={{ height: '100%' }}>
            <span style={{ ...sans, fontSize: 10, color: '#0F0F0E', fontWeight: 700 }}>{b.count || ''}</span>
            <div style={{ width: '100%', background: '#D85A1C', height: `${Math.round((b.count / max) * 64)}px`, minHeight: b.count > 0 ? 4 : 1, opacity: b.count > 0 ? 1 : 0.15 }} />
            <span style={{ ...sans, fontSize: 8, color: '#7C7A6E', marginTop: 4 }}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function weekBuckets(dates: string[], weeks = 8) {
  const out: { label: string; count: number }[] = []
  const now = Date.now()
  for (let w = weeks - 1; w >= 0; w--) {
    const start = now - (w + 1) * 7 * 86400_000
    const end = now - w * 7 * 86400_000
    const count = dates.filter((d) => { const t = new Date(d).getTime(); return t >= start && t < end }).length
    const d = new Date(end)
    out.push({ label: `${d.getMonth() + 1}/${d.getDate()}`, count })
  }
  return out
}

export default async function AdminOverview() {
  const service = createServiceClient()
  const [profilesRes, dogsRes, convRes, msgRes, alertRes, usersRes, stripe] = await Promise.all([
    service.from('profiles').select('id, created_at, subscription_tier, role'),
    service.from('dogs').select('id, status, breed, location_state, created_at, featured'),
    service.from('conversations').select('id', { count: 'exact', head: true }),
    service.from('messages').select('id, created_at'),
    service.from('breed_alerts').select('id', { count: 'exact', head: true }),
    service.auth.admin.listUsers({ perPage: 1000 }),
    getStripeAdminData(),
  ])

  const profiles = profilesRes.data ?? []
  const dogs = dogsRes.data ?? []
  const messages = msgRes.data ?? []
  const authUsers = usersRes.data?.users ?? []

  const now = Date.now()
  const within = (d: string | null | undefined, days: number) => !!d && now - new Date(d).getTime() < days * 86400_000

  const byStatus = (s: string) => dogs.filter((d) => d.status === s).length
  const breedCounts = Object.entries(
    dogs.reduce<Record<string, number>>((acc, d) => { acc[d.breed ?? '—'] = (acc[d.breed ?? '—'] ?? 0) + 1; return acc }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const stateCounts = Object.entries(
    dogs.reduce<Record<string, number>>((acc, d) => { const k = d.location_state ?? '—'; acc[k] = (acc[k] ?? 0) + 1; return acc }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 6)

  const usd = (c: number) => `$${(c / 100).toLocaleString(undefined, { minimumFractionDigits: 0 })}`
  const compPro = Math.max(0, profiles.filter((p) => p.subscription_tier === 'pro').length - stripe.activeSubscribers - stripe.trialing)

  return (
    <div>
      <h1 style={{ ...display, fontSize: 24, color: '#0F0F0E', marginBottom: 4 }}>Business Overview</h1>
      <p style={{ ...sans, fontSize: 13, color: '#7C7A6E', marginBottom: 24 }}>Live marketplace and revenue snapshot — all figures from the production database and Stripe.</p>

      <p style={{ ...sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D85A1C', marginBottom: 10 }}>Marketplace</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Registered Users" value={profiles.length} href="/admin/users" />
        <Stat label="New Users (7d)" value={profiles.filter((p) => within(p.created_at, 7)).length} />
        <Stat label="New Users (30d)" value={profiles.filter((p) => within(p.created_at, 30)).length} />
        <Stat label="Pro Accounts" value={profiles.filter((p) => p.subscription_tier === 'pro').length} href="/admin/subscriptions" />
        <Stat label="Active Listings" value={byStatus('active')} accent href="/admin/listings?status=active" />
        <Stat label="Pending" value={byStatus('pending')} href="/admin/listings?status=pending" />
        <Stat label="Sold" value={byStatus('sold')} href="/admin/listings?status=sold" />
        <Stat label="Drafts" value={byStatus('draft')} href="/admin/listings?status=draft" />
        <Stat label="New Listings (7d)" value={dogs.filter((d) => within(d.created_at, 7)).length} />
        <Stat label="New Listings (30d)" value={dogs.filter((d) => within(d.created_at, 30)).length} />
        <Stat label="Conversations" value={convRes.count ?? 0} href="/admin/messages" />
        <Stat label="Breed Alert Signups" value={alertRes.count ?? 0} />
      </div>

      <p style={{ ...sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D85A1C', marginBottom: 10 }}>Revenue (Stripe — GDE products only)</p>
      {stripe.configured ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat label="MRR" value={usd(stripe.mrrCents)} accent href="/admin/payments" />
          <Stat label="Active Paid Subscribers" value={stripe.activeSubscribers} href="/admin/subscriptions" />
          <Stat label="Revenue (90d)" value={usd(stripe.revenueCents90d)} href="/admin/payments" />
          <Stat label="Failed Payments (90d)" value={stripe.failedInvoices90d} href="/admin/payments" />
          <Stat label="Trialing" value={stripe.trialing} />
          <Stat label="Canceled Subs" value={stripe.canceled} />
          <Stat label="Renewals (14d)" value={stripe.upcomingRenewals.length} href="/admin/payments" />
          <Stat label="Comp Pro (no Stripe)" value={compPro} />
        </div>
      ) : (
        <div style={{ ...card, marginBottom: 24 }}>
          <p style={{ ...sans, fontSize: 13, color: '#7C7A6E' }}>Stripe is not configured.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <WeeklyBars title="User Signups — last 8 weeks" buckets={weekBuckets(authUsers.map((u) => u.created_at))} />
        <WeeklyBars title="New Listings — last 8 weeks" buckets={weekBuckets(dogs.map((d) => d.created_at))} />
        <WeeklyBars title="Messages — last 8 weeks" buckets={weekBuckets(messages.map((m) => m.created_at))} />
        <div style={card}>
          <p style={{ ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', marginBottom: 10 }}>Listings by Breed / State</p>
          {breedCounts.map(([b, c]) => (
            <div key={b} className="flex justify-between" style={{ ...sans, fontSize: 12, padding: '3px 0' }}>
              <span>{b}</span><span style={{ fontWeight: 700 }}>{c}</span>
            </div>
          ))}
          <div style={{ height: 1, background: '#EAE4D6', margin: '8px 0' }} />
          {stateCounts.map(([s, c]) => (
            <div key={s} className="flex justify-between" style={{ ...sans, fontSize: 12, padding: '3px 0' }}>
              <span>{s}</span><span style={{ fontWeight: 700 }}>{c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
