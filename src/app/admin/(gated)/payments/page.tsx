import { getStripeAdminData } from '@/lib/stripe-admin'
import { getAdminContext } from '@/lib/admin'
import { refundPayment } from '@/app/admin/actions'
import { ConfirmActionButton } from '@/app/admin/action-buttons'

const sans: React.CSSProperties = { fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif" }
const display: React.CSSProperties = { ...sans, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }
const th: React.CSSProperties = { ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7C7A6E', textAlign: 'left', padding: '8px 12px' }
const td: React.CSSProperties = { ...sans, fontSize: 13, color: '#0F0F0E', padding: '10px 12px', borderTop: '1px solid #EAE4D6' }

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  paid: '#166534', active: '#166534', trialing: '#92400E',
  open: '#B03A1F', uncollectible: '#B03A1F', void: '#7C7A6E', draft: '#7C7A6E', canceled: '#7C7A6E',
}

export default async function AdminPayments() {
  const [stripe, ctx] = await Promise.all([getStripeAdminData(), getAdminContext()])
  const usd = (c: number) => `$${(c / 100).toFixed(2)}`

  if (!stripe.configured) {
    return <p style={{ ...sans, fontSize: 14 }}>Stripe is not configured.</p>
  }

  return (
    <div>
      <h1 style={{ ...display, fontSize: 24, color: '#0F0F0E', marginBottom: 4 }}>Payments</h1>
      <p style={{ ...sans, fontSize: 13, color: '#7C7A6E', marginBottom: 24 }}>
        GunDog Exchange activity on the shared Modern Outdoor Media Stripe account (filtered to GDE products).
        Full records: <a href="https://dashboard.stripe.com/payments" target="_blank" style={{ color: '#D85A1C' }}>Stripe Dashboard ↗</a>.
        No card data is ever stored in our database.
      </p>

      <p style={{ ...sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D85A1C', marginBottom: 10 }}>
        Subscriptions ({stripe.subscriptions.length})
      </p>
      <div style={{ background: 'white', border: '1px solid #D9C8A6', marginBottom: 24, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>Customer</th><th style={th}>Status</th><th style={th}>Amount</th><th style={th}>Current Period Ends</th><th style={th}>Stripe</th></tr></thead>
          <tbody>
            {stripe.subscriptions.length === 0 && <tr><td style={td} colSpan={5}>No subscriptions yet.</td></tr>}
            {stripe.subscriptions.map((s) => (
              <tr key={s.id}>
                <td style={td}>{s.customerEmail}</td>
                <td style={{ ...td, color: STATUS_COLOR[s.status] ?? '#0F0F0E', fontWeight: 700 }}>{s.status}</td>
                <td style={td}>{usd(s.amountCents)}/mo</td>
                <td style={td}>{s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : '—'}</td>
                <td style={td}><a href={`https://dashboard.stripe.com/subscriptions/${s.id}`} target="_blank" style={{ color: '#D85A1C', fontSize: 11 }}>Open ↗</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ ...sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D85A1C', marginBottom: 10 }}>
        Invoices — last 90 days ({stripe.invoices.length})
      </p>
      <div style={{ background: 'white', border: '1px solid #D9C8A6', marginBottom: 24, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>Date</th><th style={th}>Customer</th><th style={th}>Status</th><th style={th}>Amount</th><th style={th}>Links</th>{ctx?.role === 'super_admin' && <th style={th}>Refund</th>}</tr></thead>
          <tbody>
            {stripe.invoices.length === 0 && <tr><td style={td} colSpan={6}>No invoices in the last 90 days.</td></tr>}
            {stripe.invoices.map((inv) => {
              const refundBound = inv.paymentIntentId ? refundPayment.bind(null, inv.paymentIntentId) : null
              return (
                <tr key={inv.id}>
                  <td style={td}>{new Date(inv.created).toLocaleDateString()}</td>
                  <td style={td}>{inv.customerEmail}</td>
                  <td style={{ ...td, color: STATUS_COLOR[inv.status] ?? '#0F0F0E', fontWeight: 700 }}>{inv.status}</td>
                  <td style={td}>{usd(inv.amountCents)}</td>
                  <td style={td}>
                    <a href={`https://dashboard.stripe.com/invoices/${inv.id}`} target="_blank" style={{ color: '#D85A1C', fontSize: 11 }}>Stripe ↗</a>
                    {inv.hostedUrl && <> · <a href={inv.hostedUrl} target="_blank" style={{ color: '#D85A1C', fontSize: 11 }}>Invoice ↗</a></>}
                  </td>
                  {ctx?.role === 'super_admin' && (
                    <td style={td}>
                      {inv.status === 'paid' && refundBound
                        ? <ConfirmActionButton action={refundBound} label="Refund" confirmText={`Refund ${usd(inv.amountCents)} to ${inv.customerEmail}? This cannot be undone.`} danger />
                        : '—'}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {stripe.upcomingRenewals.length > 0 && (
        <>
          <p style={{ ...sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D85A1C', marginBottom: 10 }}>
            Upcoming renewals (14 days)
          </p>
          <div style={{ background: 'white', border: '1px solid #D9C8A6', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={th}>Customer</th><th style={th}>Renews</th><th style={th}>Amount</th></tr></thead>
              <tbody>
                {stripe.upcomingRenewals.map((r, i) => (
                  <tr key={i}>
                    <td style={td}>{r.customerEmail}</td>
                    <td style={td}>{new Date(r.renewsAt).toLocaleDateString()}</td>
                    <td style={td}>{usd(r.amountCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
