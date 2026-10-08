import { createServiceClient } from '@/lib/supabase/service'

const sans: React.CSSProperties = { fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif" }
const display: React.CSSProperties = { ...sans, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }
const th: React.CSSProperties = { ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7C7A6E', textAlign: 'left', padding: '8px 12px' }
const td: React.CSSProperties = { ...sans, fontSize: 12, color: '#0F0F0E', padding: '8px 12px', borderTop: '1px solid #EAE4D6', verticalAlign: 'top' }

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 50

export default async function AdminActivity({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const service = createServiceClient()
  const { data: rows, count } = await service
    .from('admin_audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))

  return (
    <div>
      <h1 style={{ ...display, fontSize: 24, color: '#0F0F0E', marginBottom: 4 }}>Admin Activity Log</h1>
      <p style={{ ...sans, fontSize: 13, color: '#7C7A6E', marginBottom: 24 }}>
        Immutable record of every administrative action ({count ?? 0} entries).
      </p>

      <div style={{ background: 'white', border: '1px solid #D9C8A6', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr><th style={th}>When</th><th style={th}>Admin</th><th style={th}>Action</th><th style={th}>Target</th><th style={th}>Detail</th></tr></thead>
          <tbody>
            {(rows ?? []).length === 0 && <tr><td style={td} colSpan={5}>No administrative actions recorded yet.</td></tr>}
            {(rows ?? []).map((r) => (
              <tr key={r.id}>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{new Date(r.created_at).toLocaleString()}</td>
                <td style={td}>{r.admin_email ?? r.admin_id}</td>
                <td style={{ ...td, fontWeight: 700 }}>{r.action}</td>
                <td style={td}>{r.target_type ? `${r.target_type}:${(r.target_id ?? '').slice(0, 12)}…` : '—'}</td>
                <td style={{ ...td, fontFamily: 'monospace', fontSize: 11, color: '#7C7A6E' }}>{r.detail ? JSON.stringify(r.detail) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <a key={i} href={`/admin/activity?page=${i + 1}`} style={{ ...sans, fontSize: 12, fontWeight: page === i + 1 ? 900 : 400, color: page === i + 1 ? '#D85A1C' : '#7C7A6E' }}>
              {i + 1}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
