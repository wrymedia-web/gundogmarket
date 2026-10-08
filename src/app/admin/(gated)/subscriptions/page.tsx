import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import { getStripeAdminData } from '@/lib/stripe-admin'
import { PLANS, PLAN_ORDER } from '@/lib/plans'
import { grantCompPro, revokeCompPro } from '@/app/admin/actions'
import { ConfirmActionButton } from '@/app/admin/action-buttons'

const sans: React.CSSProperties = { fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif" }
const display: React.CSSProperties = { ...sans, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }
const card: React.CSSProperties = { background: 'white', border: '1px solid #D9C8A6', padding: 20 }
const th: React.CSSProperties = { ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7C7A6E', textAlign: 'left', padding: '8px 12px' }
const td: React.CSSProperties = { ...sans, fontSize: 13, color: '#0F0F0E', padding: '10px 12px', borderTop: '1px solid #EAE4D6' }

export const dynamic = 'force-dynamic'

export default async function AdminSubscriptions() {
  const service = createServiceClient()
  const [profRes, usersRes, stripe] = await Promise.all([
    service.from('profiles').select('id, full_name, kennel_name, subscription_tier, subscription_status, stripe_subscription_id, subscription_current_period_end'),
    service.auth.admin.listUsers({ perPage: 1000 }),
    getStripeAdminData(),
  ])
  const emailById = new Map((usersRes.data?.users ?? []).map((u) => [u.id, u.email ?? '—']))
  const pros = (profRes.data ?? []).filter((p) => ['pro', 'standard', 'featured'].includes(p.subscription_tier ?? ''))
  const frees = (profRes.data ?? []).filter((p) => !['pro', 'standard', 'featured'].includes(p.subscription_tier ?? ''))

  return (
    <div>
      <h1 style={{ ...display, fontSize: 24, color: '#0F0F0E', marginBottom: 4 }}>Subscriptions</h1>
      <p style={{ ...sans, fontSize: 13, color: '#7C7A6E', marginBottom: 24 }}>
        Stripe is the source of truth for billing. Pricing changes are made in Stripe (new price → update <code>STRIPE_PRICE_GDE_PRO</code>), never by editing existing subscriber agreements.
      </p>

      {/* Plan definitions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8" style={{ maxWidth: 720 }}>
        {PLAN_ORDER.map((pid) => {
          const p = PLANS[pid]
          return (
            <div key={pid} style={card}>
              <div className="flex items-baseline justify-between">
                <p style={{ ...display, fontSize: 16 }}>{p.name}</p>
                <p style={{ ...display, fontSize: 20, color: '#D85A1C' }}>{p.price}<span style={{ fontSize: 11, color: '#7C7A6E' }}>{p.period}</span></p>
              </div>
              <p style={{ ...sans, fontSize: 11, color: '#7C7A6E', margin: '4px 0 10px' }}>{p.tagline} · {p.maxListings} active listing{p.maxListings === 1 ? '' : 's'}</p>
              {p.features.map((f) => <p key={f} style={{ ...sans, fontSize: 12, padding: '2px 0' }}>· {f}</p>)}
            </div>
          )
        })}
      </div>
      <p style={{ ...sans, fontSize: 12, color: '#7C7A6E', marginBottom: 24 }}>
        Plan entitlements (listing caps, badges) are enforced server-side from <code>src/lib/plans.ts</code> + DB triggers.
        Manage the live Stripe product at{' '}
        <a href="https://dashboard.stripe.com/products" target="_blank" style={{ color: '#D85A1C' }}>dashboard.stripe.com/products</a>.
      </p>

      {/* Pro subscribers */}
      <p style={{ ...sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D85A1C', marginBottom: 10 }}>
        Paid accounts ({pros.length})
      </p>
      <div style={{ background: 'white', border: '1px solid #D9C8A6', marginBottom: 24, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={th}>User</th><th style={th}>Email</th><th style={th}>Status</th><th style={th}>Source</th><th style={th}>Renews</th><th style={th}>Actions</th>
          </tr></thead>
          <tbody>
            {pros.length === 0 && <tr><td style={td} colSpan={6}>No Pro accounts yet.</td></tr>}
            {pros.map((p) => {
              const stripeSub = stripe.subscriptions.find((s) => s.supabaseUserId === p.id && (s.status === 'active' || s.status === 'trialing'))
              const revokeBound = revokeCompPro.bind(null, p.id)
              return (
                <tr key={p.id}>
                  <td style={td}><Link href={`/admin/users/${p.id}`} style={{ color: '#D85A1C' }}>{p.kennel_name || p.full_name || '(no name)'}</Link></td>
                  <td style={td}>{emailById.get(p.id) ?? '—'}</td>
                  <td style={td}>{p.subscription_status ?? '—'}</td>
                  <td style={td}>{stripeSub ? 'Stripe' : 'Complimentary'}</td>
                  <td style={td}>{p.subscription_current_period_end ? new Date(p.subscription_current_period_end).toLocaleDateString() : '—'}</td>
                  <td style={td}>
                    {!stripeSub && <ConfirmActionButton action={revokeBound} label="Revoke Comp" confirmText="Downgrade this account to Free?" danger />}
                    {stripeSub && <a href={`https://dashboard.stripe.com/subscriptions/${stripeSub.id}`} target="_blank" style={{ ...sans, fontSize: 11, color: '#D85A1C' }}>Manage in Stripe ↗</a>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Grant comp */}
      <p style={{ ...sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D85A1C', marginBottom: 10 }}>
        Grant complimentary Breeder Pro
      </p>
      <div style={{ background: 'white', border: '1px solid #D9C8A6', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>User</th><th style={th}>Email</th><th style={th}>Action</th></tr></thead>
          <tbody>
            {frees.map((p) => {
              const grantBound = grantCompPro.bind(null, p.id)
              return (
                <tr key={p.id}>
                  <td style={td}>{p.kennel_name || p.full_name || '(no name)'}</td>
                  <td style={td}>{emailById.get(p.id) ?? '—'}</td>
                  <td style={td}><ConfirmActionButton action={grantBound} label="Grant Pro (Comp)" confirmText="Give this account Breeder Pro for free?" /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
