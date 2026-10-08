import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'

const sans: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
}
const display: React.CSSProperties = {
  ...sans, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em',
}

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const service = createServiceClient()

  const [{ data: users }, { data: dogsData }, authList] = await Promise.all([
    service.from('profiles')
      .select('id, full_name, kennel_name, location_state, location_city, phone, verified, breeder_pro, subscription_tier, subscription_status, verification_status, role, created_at')
      .order('created_at', { ascending: false }),
    service.from('dogs').select('seller_id, id'),
    service.auth.admin.listUsers({ perPage: 1000 }),
  ])

  const countMap: Record<string, number> = {}
  dogsData?.forEach((d) => { countMap[d.seller_id] = (countMap[d.seller_id] || 0) + 1 })

  const authById = new Map((authList.data?.users ?? []).map((u) => [u.id, u]))
  const query = (q ?? '').trim().toLowerCase()
  const filtered = (users ?? []).filter((u) => {
    if (!query) return true
    const email = authById.get(u.id)?.email ?? ''
    return [u.full_name, u.kennel_name, email, u.location_city, u.location_state, u.id]
      .some((v) => (v ?? '').toLowerCase().includes(query))
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 style={{ ...display, fontSize: 28, color: '#0F0F0E' }}>Users</h1>
        <form method="GET" className="flex gap-2">
          <input name="q" defaultValue={q ?? ''} placeholder="Search name, email, kennel, location…"
            style={{ ...sans, fontSize: 13, padding: '8px 12px', border: '1px solid #D9C8A6', background: 'white', outline: 'none', width: 280 }} />
          <button type="submit" style={{ ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: '#0F0F0E', color: '#EFE7D4', border: 'none', padding: '0 16px', cursor: 'pointer' }}>Search</button>
        </form>
        <p style={{ ...sans, fontSize: 13, color: '#7C7A6E' }}>{filtered.length} of {users?.length ?? 0}</p>
      </div>

      <div style={{ background: 'white', border: '1px solid #D9C8A6', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #D9C8A6', background: '#EFE7D4' }}>
              {['Name', 'Email', 'Location', 'Plan', 'Listings', 'Status', 'Signed Up'].map((h) => (
                <th key={h} style={{ ...sans, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', padding: '10px 16px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const au = authById.get(u.id)
              const banned = !!(au as unknown as { banned_until?: string })?.banned_until &&
                new Date((au as unknown as { banned_until: string }).banned_until).getTime() > Date.now()
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid #EFE7D4' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/admin/users/${u.id}`} style={{ textDecoration: 'none' }}>
                      <p style={{ ...sans, fontWeight: 600, fontSize: 14, color: '#0F0F0E' }}>
                        {u.full_name || '(no name)'}
                        {(u.role === 'admin' || u.role === 'super_admin') && <span style={{ ...sans, fontSize: 9, fontWeight: 700, marginLeft: 6, padding: '1px 6px', background: u.role === 'super_admin' ? '#D85A1C' : '#0F0F0E', color: '#EFE7D4', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{u.role === 'super_admin' ? 'Super' : 'Admin'}</span>}
                        {banned && <span style={{ ...sans, fontSize: 9, fontWeight: 700, marginLeft: 6, padding: '1px 6px', background: '#B03A1F', color: 'white', textTransform: 'uppercase' }}>Banned</span>}
                      </p>
                      {u.kennel_name && <p style={{ ...sans, fontSize: 12, color: '#7C7A6E' }}>{u.kennel_name}</p>}
                    </Link>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <p style={{ ...sans, fontSize: 13, color: '#0F0F0E' }}>{au?.email ?? '—'}</p>
                    <p style={{ ...sans, fontSize: 10, color: '#B0AEA4' }}>
                      {au?.last_sign_in_at ? `Last seen ${new Date(au.last_sign_in_at).toLocaleDateString()}` : 'Never signed in'}
                    </p>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <p style={{ ...sans, fontSize: 13, color: '#0F0F0E' }}>
                      {u.location_city && u.location_state ? `${u.location_city}, ${u.location_state}` : u.location_state || '—'}
                    </p>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                      padding: '2px 8px',
                      background: u.subscription_tier === 'pro' ? '#D85A1C' : '#EFE7D4',
                      color: u.subscription_tier === 'pro' ? 'white' : '#7C7A6E',
                    }}>
                      {u.subscription_tier || 'free'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ ...sans, fontWeight: 600, fontSize: 14, color: '#0F0F0E' }}>{countMap[u.id] || 0}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="flex flex-wrap gap-1">
                      {u.verified && <span style={{ ...sans, fontSize: 9, fontWeight: 700, padding: '1px 6px', background: '#DCFCE7', color: '#166534', textTransform: 'uppercase' }}>Verified</span>}
                      {u.breeder_pro && <span style={{ ...sans, fontSize: 9, fontWeight: 700, padding: '1px 6px', background: '#FEF3C7', color: '#92400E', textTransform: 'uppercase' }}>Breeder</span>}
                      {!u.verified && !u.breeder_pro && <span style={{ ...sans, fontSize: 12, color: '#7C7A6E' }}>—</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <p style={{ ...sans, fontSize: 13, color: '#0F0F0E' }}>{new Date(u.created_at).toLocaleDateString()}</p>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
