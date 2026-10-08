import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, formatAge } from '@/lib/mock-data'

const sans: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
}
const display: React.CSSProperties = {
  ...sans, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em',
}

export const dynamic = 'force-dynamic'

export default async function AdminListingsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { q, status } = await searchParams
  const supabase = await createClient()

  let queryBuilder = supabase
    .from('dogs')
    .select('id, title, breed, age_months, gender, training_level, price, location_state, location_city, status, featured, images, created_at, seller_id')
    .order('created_at', { ascending: false })
  if (status && ['active', 'pending', 'sold', 'draft'].includes(status)) {
    queryBuilder = queryBuilder.eq('status', status)
  }
  const { data: allDogs } = await queryBuilder

  // Get seller names
  const sellerIds = [...new Set(allDogs?.map((d) => d.seller_id) ?? [])]
  const { data: sellers } = sellerIds.length > 0
    ? await supabase.from('profiles').select('id, full_name, kennel_name').in('id', sellerIds)
    : { data: [] }

  const sellerMap: Record<string, { full_name: string; kennel_name: string | null }> = {}
  sellers?.forEach((s) => { sellerMap[s.id] = s })

  const query = (q ?? '').trim().toLowerCase()
  const dogs = (allDogs ?? []).filter((d) => {
    if (!query) return true
    const seller = sellerMap[d.seller_id]
    return [d.title, d.breed, d.id, d.location_city, d.location_state, seller?.full_name, seller?.kennel_name]
      .some((v) => (v ?? '').toLowerCase().includes(query))
  })

  const statusColors: Record<string, { bg: string; color: string }> = {
    active: { bg: '#DCFCE7', color: '#166534' },
    draft: { bg: '#E0E7FF', color: '#3730A3' },
    pending: { bg: '#FEF3C7', color: '#92400E' },
    sold: { bg: '#EFE7D4', color: '#7C7A6E' },
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 style={{ ...display, fontSize: 28, color: '#0F0F0E' }}>Listings</h1>
        <form method="GET" className="flex gap-2 flex-wrap">
          <input name="q" defaultValue={q ?? ''} placeholder="Search dog, breed, seller, location, ID…"
            style={{ ...sans, fontSize: 13, padding: '8px 12px', border: '1px solid #D9C8A6', background: 'white', outline: 'none', width: 280 }} />
          <select name="status" defaultValue={status ?? ''} style={{ ...sans, fontSize: 13, padding: '8px 12px', border: '1px solid #D9C8A6', background: 'white' }}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft / Unpublished</option>
            <option value="sold">Sold</option>
          </select>
          <button type="submit" style={{ ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: '#0F0F0E', color: '#EFE7D4', border: 'none', padding: '0 16px', cursor: 'pointer' }}>Filter</button>
        </form>
        <p style={{ ...sans, fontSize: 13, color: '#7C7A6E' }}>{dogs?.length ?? 0} shown</p>
      </div>

      {dogs && dogs.length > 0 ? (
        <div style={{ background: 'white', border: '1px solid #D9C8A6', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #D9C8A6', background: '#EFE7D4' }}>
                {['', 'Dog', 'Breed / Age', 'Price', 'Seller', 'Location', 'Status', 'Created'].map((h) => (
                  <th key={h} style={{ ...sans, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', padding: '10px 12px', textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dogs.map((d) => {
                const imgs = d.images as string[] | null
                const sc = statusColors[d.status] ?? statusColors.draft
                const seller = sellerMap[d.seller_id]
                return (
                  <tr key={d.id} style={{ borderBottom: '1px solid #EFE7D4' }}>
                    <td style={{ padding: '8px 12px', width: 56 }}>
                      {imgs && imgs.length > 0 ? (
                        <img src={imgs[0]} alt="" style={{ width: 44, height: 44, objectFit: 'cover', border: '1px solid #D9C8A6' }} />
                      ) : (
                        <div style={{ width: 44, height: 44, background: '#EFE7D4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '1px solid #D9C8A6' }}>🐕</div>
                      )}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <Link href={`/admin/listings/${d.id}`} style={{ ...sans, fontWeight: 600, fontSize: 14, color: '#0F0F0E', textDecoration: 'none' }}>
                        {d.title}
                      </Link>
                      {d.featured && <span style={{ ...sans, fontSize: 9, fontWeight: 700, marginLeft: 6, padding: '1px 6px', background: '#D85A1C', color: 'white', textTransform: 'uppercase' }}>Featured</span>}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <p style={{ ...sans, fontSize: 13, color: '#0F0F0E' }}>{d.breed}</p>
                      <p style={{ ...sans, fontSize: 12, color: '#7C7A6E' }}>
                        {d.age_months ? formatAge(d.age_months) : '—'} · {d.gender === 'male' ? '♂' : '♀'} · {d.training_level}
                      </p>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <p style={{ ...sans, fontWeight: 700, fontSize: 14, color: '#0F0F0E' }}>{formatPrice(d.price)}</p>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <p style={{ ...sans, fontSize: 13, color: '#0F0F0E' }}>{seller?.kennel_name || seller?.full_name || '—'}</p>
                      {seller?.kennel_name && <p style={{ ...sans, fontSize: 11, color: '#7C7A6E' }}>{seller.full_name}</p>}
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <p style={{ ...sans, fontSize: 13, color: '#0F0F0E' }}>{d.location_city ? `${d.location_city}, ` : ''}{d.location_state}</p>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px', background: sc.bg, color: sc.color }}>
                        {d.status}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <p style={{ ...sans, fontSize: 13, color: '#0F0F0E' }}>{new Date(d.created_at).toLocaleDateString()}</p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-12 text-center" style={{ background: 'white', border: '1px solid #D9C8A6' }}>
          <p style={{ ...sans, fontSize: 16, color: '#7C7A6E' }}>No listings yet</p>
        </div>
      )}
    </div>
  )
}
