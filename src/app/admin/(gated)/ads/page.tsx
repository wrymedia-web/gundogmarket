import { createServiceClient } from '@/lib/supabase/service'

// Meta ad spend next to what actually matters: registrations, trials, and
// paying sellers. Reads the Marketing API server-side (META_CAPI_TOKEN —
// never exposed to the browser) and first-party funnel data from Supabase.
const ACT = 'act_1668400466731708'
const GRAPH = 'https://graph.facebook.com/v21.0'

const sans: React.CSSProperties = { fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif" }
const display: React.CSSProperties = { ...sans, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }
const card: React.CSSProperties = { background: 'white', border: '1px solid #D9C8A6', padding: 20 }
const th: React.CSSProperties = { ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7C7A6E', textAlign: 'left', padding: '8px 12px' }
const td: React.CSSProperties = { ...sans, fontSize: 13, color: '#0F0F0E', padding: '8px 12px', borderTop: '1px solid #EAE4D6' }

export const dynamic = 'force-dynamic'

type Insight = {
  campaign_name: string
  spend?: string
  impressions?: string
  clicks?: string
  ctr?: string
  cpc?: string
  frequency?: string
  actions?: { action_type: string; value: string }[]
}

function act(row: Insight, needle: string): number {
  const hit = (row.actions ?? []).find((a) => a.action_type.toLowerCase().includes(needle.toLowerCase()))
  return hit ? Number(hit.value) : 0
}

async function metaInsights(days: number): Promise<Insight[]> {
  const token = process.env.META_CAPI_TOKEN
  if (!token) return []
  const params = new URLSearchParams({
    date_preset: days === 30 ? 'last_30d' : 'last_7d',
    level: 'campaign',
    fields: 'campaign_name,spend,impressions,clicks,ctr,cpc,frequency,actions',
  })
  try {
    const res = await fetch(`${GRAPH}/${ACT}/insights?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 900 },
    })
    if (!res.ok) return []
    return (await res.json()).data ?? []
  } catch {
    return []
  }
}

const money = (n: number) => `$${n.toFixed(2)}`
const per = (spend: number, n: number) => (n > 0 ? money(spend / n) : '—')

export default async function AdminAds() {
  const service = createServiceClient()
  const since30 = new Date(Date.now() - 30 * 86400_000).toISOString()
  const [meta7, meta30, { data: events }, { count: paying }, { count: trialing }] = await Promise.all([
    metaInsights(7),
    metaInsights(30),
    service.from('site_events').select('event, utm_source, created_at').gte('created_at', since30).limit(50000),
    service.from('profiles').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    service.from('profiles').select('id', { count: 'exact', head: true }).eq('subscription_status', 'trialing'),
  ])

  const ev = events ?? []
  const fbEv = ev.filter((e) => (e.utm_source ?? '').toLowerCase() === 'facebook')
  const funnel = (rows: typeof ev) => ({
    registrations: rows.filter((e) => e.event === 'complete_registration').length,
    checkouts: rows.filter((e) => e.event === 'initiate_checkout').length,
    trials: rows.filter((e) => e.event === 'start_trial').length,
    subscribes: rows.filter((e) => e.event === 'subscribe').length,
  })
  const all30 = funnel(ev)
  const fb30 = funnel(fbEv)
  const spend30 = meta30.reduce((s, c) => s + Number(c.spend ?? 0), 0)
  const spend7 = meta7.reduce((s, c) => s + Number(c.spend ?? 0), 0)

  const summary = [
    { label: 'Spend (7d)', value: money(spend7) },
    { label: 'Spend (30d)', value: money(spend30) },
    { label: 'Registrations (30d)', value: `${all30.registrations}` },
    { label: 'Trials started (30d)', value: `${all30.trials}` },
    { label: 'Paid subscribes (30d)', value: `${all30.subscribes}` },
    { label: 'Cost / paying seller (30d)', value: per(spend30, all30.subscribes) },
    { label: 'Active paid now', value: `${paying ?? 0}` },
    { label: 'Trialing now', value: `${trialing ?? 0}` },
  ]

  return (
    <div>
      <h1 style={{ ...display, fontSize: 28, marginBottom: 4 }}>Meta Ads</h1>
      <p style={{ ...sans, fontSize: 13, color: '#7C7A6E', marginBottom: 20 }}>
        Ad spend vs. real seller outcomes. Funnel counts are first-party (site_events + Stripe webhook);
        facebook-attributed = visits carrying utm_source=facebook.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {summary.map((s) => (
          <div key={s.label} style={card}>
            <div style={{ ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7C7A6E' }}>{s.label}</div>
            <div style={{ ...display, fontSize: 24, marginTop: 6 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {[{ label: 'Last 7 days', rows: meta7 }, { label: 'Last 30 days', rows: meta30 }].map((block) => (
        <div key={block.label} style={{ ...card, marginBottom: 24, padding: 0 }}>
          <div style={{ ...display, fontSize: 14, padding: '14px 12px 6px' }}>{block.label} — by campaign</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Campaign</th><th style={th}>Spend</th><th style={th}>Impr.</th>
                <th style={th}>CTR</th><th style={th}>CPC</th><th style={th}>Freq</th>
                <th style={th}>LPV</th><th style={th}>Regs</th><th style={th}>Cost/Reg</th>
              </tr>
            </thead>
            <tbody>
              {block.rows.length === 0 && (
                <tr><td style={td} colSpan={9}>No data (or META_CAPI_TOKEN unset).</td></tr>
              )}
              {block.rows.map((c) => {
                const spend = Number(c.spend ?? 0)
                const regs = act(c, 'complete_registration')
                return (
                  <tr key={c.campaign_name}>
                    <td style={td}>{c.campaign_name}</td>
                    <td style={td}>{money(spend)}</td>
                    <td style={td}>{c.impressions}</td>
                    <td style={td}>{Number(c.ctr ?? 0).toFixed(2)}%</td>
                    <td style={td}>{money(Number(c.cpc ?? 0))}</td>
                    <td style={td}>{Number(c.frequency ?? 0).toFixed(2)}</td>
                    <td style={td}>{act(c, 'landing_page_view')}</td>
                    <td style={td}>{regs}</td>
                    <td style={td}>{per(spend, regs)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ))}

      <div style={card}>
        <div style={{ ...display, fontSize: 14, marginBottom: 8 }}>Facebook-attributed site funnel (30d)</div>
        <p style={{ ...sans, fontSize: 13, color: '#0F0F0E' }}>
          Registrations {fb30.registrations} / {all30.registrations} · Checkouts {fb30.checkouts} / {all30.checkouts} ·
          Trials {fb30.trials} / {all30.trials} · Subscribes {fb30.subscribes} / {all30.subscribes}
          <span style={{ color: '#7C7A6E' }}> (facebook / all traffic — trials and subscribes are recorded server-side without UTM, so attribute via Meta’s own numbers above)</span>
        </p>
      </div>
    </div>
  )
}
