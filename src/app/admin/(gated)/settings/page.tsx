import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/service'
import { getAdminContext } from '@/lib/admin'
import { inviteAdmin, setUserRole } from '@/app/admin/actions'
import { AdminForm, Field, SelectField, SubmitButton } from '@/app/admin/form-components'

const sans: React.CSSProperties = { fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif" }
const display: React.CSSProperties = { ...sans, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }
const card: React.CSSProperties = { background: 'white', border: '1px solid #D9C8A6', padding: 20, marginBottom: 20 }
const th: React.CSSProperties = { ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7C7A6E', textAlign: 'left', padding: '8px 12px' }
const td: React.CSSProperties = { ...sans, fontSize: 13, color: '#0F0F0E', padding: '10px 12px', borderTop: '1px solid #EAE4D6' }

export const dynamic = 'force-dynamic'

async function getSystemHealth() {
  const out: { name: string; ok: boolean; note: string }[] = []

  // Supabase
  try {
    const service = createServiceClient()
    const { error } = await service.from('profiles').select('id', { count: 'exact', head: true })
    out.push({ name: 'Supabase database', ok: !error, note: error?.message ?? 'Connected' })
  } catch (e) {
    out.push({ name: 'Supabase database', ok: false, note: (e as Error).message })
  }

  // Stripe + webhook
  try {
    const secret = process.env.STRIPE_SECRET_KEY
    if (!secret) throw new Error('STRIPE_SECRET_KEY not set')
    const stripe = new Stripe(secret)
    const endpoints = await stripe.webhookEndpoints.list({ limit: 20 })
    const gde = endpoints.data.find((e) => e.url.includes('gundogexchange.com'))
    out.push({ name: 'Stripe API', ok: true, note: 'Connected (live mode)' })
    out.push({
      name: 'Stripe webhook', ok: gde?.status === 'enabled',
      note: gde ? `${gde.status} → ${gde.url}` : 'No gundogexchange.com endpoint found',
    })
  } catch (e) {
    out.push({ name: 'Stripe API', ok: false, note: (e as Error).message })
  }

  // Email (Resend) — send-only key, so presence + auth-email history is the signal
  out.push({
    name: 'Email (Resend)',
    ok: !!process.env.RESEND_API_KEY,
    note: process.env.RESEND_API_KEY ? 'Send-only key configured; sender noreply@gundogexchange.com' : 'RESEND_API_KEY not set',
  })

  return out
}

export default async function AdminSettings() {
  const ctx = await getAdminContext()
  const service = createServiceClient()
  const [profRes, usersRes, health] = await Promise.all([
    service.from('profiles').select('id, full_name, role').in('role', ['admin', 'super_admin']),
    service.auth.admin.listUsers({ perPage: 1000 }),
    getSystemHealth(),
  ])
  const emailById = new Map((usersRes.data?.users ?? []).map((u) => [u.id, u.email ?? '—']))
  const admins = profRes.data ?? []
  const isSuper = ctx?.role === 'super_admin'

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ ...display, fontSize: 24, color: '#0F0F0E', marginBottom: 4 }}>Settings</h1>
      <p style={{ ...sans, fontSize: 13, color: '#7C7A6E', marginBottom: 24 }}>Administrative accounts and system health.</p>

      {/* Admin accounts */}
      <p style={{ ...sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D85A1C', marginBottom: 10 }}>Administrator accounts</p>
      <div style={{ background: 'white', border: '1px solid #D9C8A6', marginBottom: 20, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>Name</th><th style={th}>Email</th><th style={th}>Role</th>{isSuper && <th style={th}>Change Role</th>}</tr></thead>
          <tbody>
            {admins.map((a) => {
              const setRoleBound = setUserRole.bind(null, a.id)
              return (
                <tr key={a.id}>
                  <td style={td}>{a.full_name ?? '(no name)'}</td>
                  <td style={td}>{emailById.get(a.id) ?? '—'}</td>
                  <td style={{ ...td, fontWeight: 700, color: a.role === 'super_admin' ? '#D85A1C' : '#0F0F0E' }}>{a.role}</td>
                  {isSuper && (
                    <td style={td}>
                      <form action={setRoleBound} className="flex gap-2 items-center">
                        <select name="role" defaultValue={a.role} style={{ ...sans, fontSize: 12, padding: '4px 8px', border: '1px solid #D9C8A6' }}>
                          <option value="user">user (remove admin)</option>
                          <option value="admin">admin</option>
                          <option value="super_admin">super_admin</option>
                        </select>
                        <button type="submit" style={{ ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: '#0F0F0E', color: '#EFE7D4', border: 'none', padding: '6px 12px', cursor: 'pointer' }}>Apply</button>
                      </form>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {isSuper && (
        <>
          <p style={{ ...sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D85A1C', marginBottom: 10 }}>Invite a new admin</p>
          <div style={{ marginBottom: 24 }}>
            <AdminForm action={inviteAdmin}>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email" name="email" defaultValue="" type="email" />
                <SelectField label="Role" name="role" defaultValue="admin" options={[
                  { value: 'admin', label: 'Admin (no role/refund powers)' },
                  { value: 'super_admin', label: 'Super Admin (full control)' },
                ]} />
              </div>
              <p style={{ ...sans, fontSize: 11, color: '#7C7A6E' }}>
                New accounts get an activation email. Existing accounts are upgraded in place. Every admin must enroll MFA on first visit.
              </p>
              <SubmitButton />
            </AdminForm>
          </div>
        </>
      )}

      {/* System health */}
      <p style={{ ...sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D85A1C', marginBottom: 10 }}>System health</p>
      <div style={card}>
        {health.map((h) => (
          <div key={h.name} className="flex items-start gap-3" style={{ padding: '6px 0' }}>
            <span style={{ fontSize: 14 }}>{h.ok ? '🟢' : '🔴'}</span>
            <div>
              <p style={{ ...sans, fontSize: 13, fontWeight: 700 }}>{h.name}</p>
              <p style={{ ...sans, fontSize: 12, color: '#7C7A6E' }}>{h.note}</p>
            </div>
          </div>
        ))}
      </div>

      <p style={{ ...sans, fontSize: 11, color: '#7C7A6E' }}>
        Secrets (API keys, service-role credentials) are never displayed here — they live in Vercel environment variables and Supabase Vault.
      </p>
    </div>
  )
}
