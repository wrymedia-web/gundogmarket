import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'

const sans: React.CSSProperties = { fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif" }
const display: React.CSSProperties = { ...sans, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }
const card: React.CSSProperties = { background: 'white', border: '1px solid #D9C8A6', padding: 20 }
const th: React.CSSProperties = { ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7C7A6E', textAlign: 'left', padding: '8px 12px' }
const td: React.CSSProperties = { ...sans, fontSize: 13, color: '#0F0F0E', padding: '10px 12px', borderTop: '1px solid #EAE4D6' }

export const dynamic = 'force-dynamic'

export default async function AdminMessages() {
  const service = createServiceClient()
  const [{ data: convs }, { data: msgs }, authList] = await Promise.all([
    service.from('conversations').select('id, dog_id, buyer_id, seller_id, created_at, updated_at, dogs(title)').order('updated_at', { ascending: false }),
    service.from('messages').select('id, conversation_id, created_at'),
    service.auth.admin.listUsers({ perPage: 1000 }),
  ])
  const emailById = new Map((authList.data?.users ?? []).map((u) => [u.id, u.email ?? '—']))
  const msgCount = new Map<string, number>()
  for (const m of msgs ?? []) msgCount.set(m.conversation_id, (msgCount.get(m.conversation_id) ?? 0) + 1)

  const now = Date.now()
  const msgs7d = (msgs ?? []).filter((m) => now - new Date(m.created_at).getTime() < 7 * 86400_000).length

  return (
    <div>
      <h1 style={{ ...display, fontSize: 24, color: '#0F0F0E', marginBottom: 4 }}>Messages</h1>
      <p style={{ ...sans, fontSize: 13, color: '#7C7A6E', marginBottom: 24 }}>
        Buyer–seller conversations. Opening a private thread is for support, safety, and moderation only — every access is written to the activity log.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6" style={{ maxWidth: 560 }}>
        <div style={card}><p style={{ ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#7C7A6E' }}>Conversations</p><p style={{ ...display, fontSize: 26 }}>{convs?.length ?? 0}</p></div>
        <div style={card}><p style={{ ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#7C7A6E' }}>Total Messages</p><p style={{ ...display, fontSize: 26 }}>{msgs?.length ?? 0}</p></div>
        <div style={card}><p style={{ ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#7C7A6E' }}>Messages (7d)</p><p style={{ ...display, fontSize: 26, color: '#D85A1C' }}>{msgs7d}</p></div>
      </div>

      <div style={{ background: 'white', border: '1px solid #D9C8A6', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>Listing</th><th style={th}>Buyer</th><th style={th}>Seller</th><th style={th}>Messages</th><th style={th}>Last Activity</th><th style={th}></th></tr></thead>
          <tbody>
            {(convs ?? []).length === 0 && <tr><td style={td} colSpan={6}>No conversations yet.</td></tr>}
            {(convs ?? []).map((c) => (
              <tr key={c.id}>
                <td style={td}>{(c.dogs as unknown as { title: string } | null)?.title ?? '(deleted listing)'}</td>
                <td style={td}>{emailById.get(c.buyer_id) ?? '—'}</td>
                <td style={td}>{emailById.get(c.seller_id) ?? '—'}</td>
                <td style={td}>{msgCount.get(c.id) ?? 0}</td>
                <td style={td}>{new Date(c.updated_at).toLocaleString()}</td>
                <td style={td}><Link href={`/admin/messages/${c.id}`} style={{ color: '#D85A1C', fontSize: 12, fontWeight: 700 }}>Open (logged) →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
