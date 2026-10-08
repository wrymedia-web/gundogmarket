import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatPrice, TRAINING_LEVEL_LABELS, type TrainingLevel } from '@/lib/mock-data'

const montserrat: React.CSSProperties = {
  fontFamily: "'Montserrat', var(--font-montserrat), system-ui, sans-serif",
}
const inter: React.CSSProperties = {
  fontFamily: "'Inter', var(--font-inter), system-ui, sans-serif",
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard')

  const { data: myDogs } = await supabase
    .from('dogs')
    .select('id, title, breed, training_level, price, status, featured, created_at')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  const activeCount = myDogs?.filter(d => d.status === 'active').length ?? 0

  const { count: inboxCount } = await supabase
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .eq('seller_id', user.id)

  const { count: unreadCount } = await supabase
    .from('messages')
    .select('id, conversation_id, conversations!inner(seller_id)', { count: 'exact', head: true })
    .eq('conversations.seller_id', user.id)
    .eq('read', false)
    .neq('sender_id', user.id)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase mb-1" style={{ ...montserrat, color: '#0E0E0E', letterSpacing: '-0.02em' }}>
          My Dashboard
        </h1>
        <p className="text-sm" style={{ color: '#7C7A6E', ...inter }}>
          Manage your listings and seller profile.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {[
          { label: 'Active Listings', value: String(activeCount), icon: '🐕' },
          { label: 'Total Listings', value: String(myDogs?.length ?? 0), icon: '📋' },
          { label: 'Messages', value: unreadCount ? `${unreadCount} new` : String(inboxCount ?? 0), icon: '💬', href: '/dashboard/messages' },
        ].map((stat) => {
          const inner = (
            <div className="p-6 flex items-center gap-4" style={{ background: 'white', border: '1px solid #D9C8A6' }}>
              <div className="w-12 h-12 flex items-center justify-center text-2xl" style={{ background: '#F4EFE5' }}>
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-black" style={{ ...montserrat, color: unreadCount && stat.href ? '#D4600A' : '#0E0E0E' }}>
                  {stat.value}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7C7A6E', ...inter }}>
                  {stat.label}
                </div>
              </div>
            </div>
          )
          return stat.href ? (
            <Link key={stat.label} href={stat.href} style={{ textDecoration: 'none' }}>{inner}</Link>
          ) : (
            <div key={stat.label}>{inner}</div>
          )
        })}
      </div>

      <div style={{ background: 'white', border: '1px solid #D9C8A6' }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #EAE4D6' }}>
          <h2 className="text-base font-black uppercase" style={{ ...montserrat, color: '#0E0E0E' }}>My Listings</h2>
          <Link href="/sell" className="text-xs font-bold px-4 py-2 text-white uppercase tracking-widest" style={{ background: '#D4600A', ...inter }}>
            + Create New Listing
          </Link>
        </div>
        <div className="overflow-x-auto">
          {myDogs && myDogs.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #EAE4D6', background: '#F4EFE5' }}>
                  {['Dog', 'Breed', 'Level', 'Price', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest" style={{ color: '#7C7A6E', ...inter }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {myDogs.map((dog, i) => (
                  <tr key={dog.id} style={{ borderBottom: i < myDogs.length - 1 ? '1px solid #EAE4D6' : 'none' }}>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold" style={{ color: '#0E0E0E', ...inter }}>{dog.title}</span>
                      {dog.featured && <span className="ml-2 text-xs font-bold px-1.5 py-0.5 uppercase" style={{ background: '#D4600A', color: 'white', ...inter }}>★</span>}
                    </td>
                    <td className="px-6 py-4"><span className="text-sm" style={{ color: '#7C7A6E', ...inter }}>{dog.breed}</span></td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2 py-1 uppercase tracking-wider" style={{ background: '#EAE4D6', color: '#7C7A6E', ...inter }}>
                        {TRAINING_LEVEL_LABELS[dog.training_level as TrainingLevel] ?? dog.training_level}
                      </span>
                    </td>
                    <td className="px-6 py-4"><span className="text-sm font-bold" style={{ color: '#D4600A', ...inter }}>{formatPrice(dog.price)}</span></td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold px-2 py-1 uppercase tracking-wider" style={{
                        background: dog.status === 'active' ? '#DCFCE7' : dog.status === 'sold' ? '#EFE7D4' : '#FEF3C7',
                        color: dog.status === 'active' ? '#166534' : dog.status === 'sold' ? '#7C7A6E' : '#92400E',
                        ...inter,
                      }}>
                        {dog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Link href={`/dashboard/edit/${dog.id}`} className="text-xs font-bold uppercase tracking-wider" style={{ color: '#D4600A', ...inter }}>
                          Edit
                        </Link>
                        <Link href={`/dogs/${dog.id}`} className="text-xs font-bold uppercase tracking-wider" style={{ color: '#7C7A6E', ...inter }}>
                          View →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-sm mb-3" style={{ color: '#7C7A6E', ...inter }}>You don&apos;t have any listings yet.</p>
              <Link href="/sell" className="text-sm font-bold uppercase tracking-wider" style={{ color: '#D4600A', ...inter }}>
                Create Your First Listing →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
