import { createServiceClient } from '@/lib/supabase/service'
import { getStripeAdminData } from '@/lib/stripe-admin'

const sans: React.CSSProperties = { fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif" }
const display: React.CSSProperties = { ...sans, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }
const card: React.CSSProperties = { background: 'white', border: '1px solid #D9C8A6', padding: 20 }
const th: React.CSSProperties = { ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7C7A6E', textAlign: 'left', padding: '8px 12px' }
const td: React.CSSProperties = { ...sans, fontSize: 13, color: '#0F0F0E', padding: '8px 12px', borderTop: '1px solid #EAE4D6' }

export const dynamic = 'force-dynamic'

function count<T>(rows: T[], key: (r: T) => string | null | undefined, top = 8) {
  const m = new Map<string, number>()
  for (const r of rows) {
    const k = key(r) || '(direct)'
    m.set(k, (m.get(k) ?? 0) + 1)
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, top)
}

export default async function AdminAnalytics() {
  const service = createServiceClient()
  const since = new Date(Date.now() - 14 * 86400_000).toISOString()
  const [{ data: events }, { data: dogs }, stripe, { count: userCount }] = await Promise.all([
    service.from('site_events').select('event, path, listing_id, visitor_id, utm_source, referrer, created_at').gte('created_at', since).order('created_at', { ascending: false }).limit(20000),
    service.from('dogs').select('id, title'),
    getStripeAdminData(),
    service.from('profiles').select('id', { count: 'exact', head: true }),
  ])
  const ev = events ?? []
  const dogTitle = new Map((dogs ?? []).map((d) => [d.id, d.title]))

  const pageViews = ev.filter((e) => e.event === 'page_view')
  const uniques = new Set(pageViews.map((e) => e.visitor_id)).size
  const funnel = {
    visits: pageViews.length,
    visitors: uniques,
    pricingViews: pageViews.filter((e) => e.path === '/pricing').length,
    listingViews: ev.filter((e) => e.event === 'view_content').length,
    checkouts: ev.filter((e) => e.event === 'initiate_checkout').length,
    signups: ev.filter((e) => e.event === 'complete_registration').length,
    leads: ev.filter((e) => e.event === 'lead').length,
  }

  // daily pageviews (14 days)
  const days: { label: string; count: number }[] = []
  for (let d = 13; d >= 0; d--) {
    const start = new Date(Date.now() - (d + 1) * 86400_000)
    const end = new Date(Date.now() - d * 86400_000)
    const c = pageViews.filter((e) => { const t = new Date(e.created_at); return t >= start && t < end }).length
    days.push({ label: `${end.getMonth() + 1}/${end.getDate()}`, count: c })
  }
  const maxDay = Math.max(1, ...days.map((d) => d.count))

  const topPages = count(pageViews, (e) => e.path)
  const topSources = count(ev, (e) => e.utm_source)
  const topListings = count(ev.filter((e) => e.event === 'view_content' && e.listing_id), (e) => dogTitle.get(e.listing_id as string) ?? e.listing_id)

  return (
    <div>
      <h1 style={{ ...display, fontSize: 24, color: '#0F0F0E', marginBottom: 4 }}>Analytics</h1>
      <p style={{ ...sans, fontSize: 13, color: '#7C7A6E', marginBottom: 24 }}>
        First-party events, last 14 days — collected on your own database, independent of Meta/Google.
      </p>

      {/* Funnel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          ['Page Views', funnel.visits], ['Unique Visitors', funnel.visitors],
          ['Listing Views', funnel.listingViews], ['Pricing Views', funnel.pricingViews],
          ['Plan Clicks', funnel.checkouts], ['Signups', funnel.signups],
          ['Buyer Inquiries', funnel.leads], ['Total Accounts', userCount ?? 0],
        ].map(([label, value]) => (
          <div key={label as string} style={card}>
            <p style={{ ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', marginBottom: 6 }}>{label}</p>
            <p style={{ ...display, fontSize: 26, color: '#D85A1C' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Daily traffic */}
      <div style={{ ...card, marginBottom: 24 }}>
        <p style={{ ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', marginBottom: 10 }}>Daily Page Views — 14 days</p>
        <div className="flex items-end gap-1" style={{ height: 100 }}>
          {days.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end" style={{ height: '100%' }}>
              <span style={{ ...sans, fontSize: 9, fontWeight: 700 }}>{d.count || ''}</span>
              <div style={{ width: '100%', background: '#D85A1C', height: `${Math.round((d.count / maxDay) * 70)}px`, minHeight: d.count ? 3 : 1, opacity: d.count ? 1 : 0.15 }} />
              <span style={{ ...sans, fontSize: 8, color: '#7C7A6E', marginTop: 3 }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          ['Top Pages', topPages], ['Traffic Sources (UTM)', topSources], ['Most-Viewed Listings', topListings],
        ].map(([title, rows]) => (
          <div key={title as string} style={{ background: 'white', border: '1px solid #D9C8A6' }}>
            <p style={{ ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D85A1C', padding: '12px 12px 4px' }}>{title}</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {(rows as [string, number][]).length === 0 && <tr><td style={td}>No data yet.</td></tr>}
                {(rows as [string, number][]).map(([k, v]) => (
                  <tr key={k}><td style={td}>{k}</td><td style={{ ...td, textAlign: 'right', fontWeight: 700 }}>{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <p style={{ ...sans, fontSize: 11, color: '#7C7A6E', marginTop: 20 }}>
        Paid subscribers (Stripe): {stripe.activeSubscribers + stripe.trialing} · MRR ${(stripe.mrrCents / 100).toFixed(0)} — full detail under Payments.
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? ' Google Analytics: connected.' : ' Google Analytics: not connected yet (needs Measurement ID).'}
      </p>
    </div>
  )
}
