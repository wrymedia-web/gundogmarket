import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const montserrat: React.CSSProperties = {
  fontFamily: "'Montserrat', var(--font-montserrat), system-ui, sans-serif",
}
const inter: React.CSSProperties = {
  fontFamily: "'Inter', var(--font-inter), system-ui, sans-serif",
}

export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/messages')

  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, created_at, updated_at, dog_id, buyer_id, seller_id, dogs(title, breed)')
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('updated_at', { ascending: false })

  // Resolve counterparty names via the anon-safe seller_profiles view
  // (raw profiles is owner/admin-only under RLS).
  const otherIds = Array.from(new Set(
    (conversations ?? []).map((c) => (c.buyer_id === user.id ? c.seller_id : c.buyer_id))
  ))
  const nameById: Record<string, string> = {}
  if (otherIds.length > 0) {
    const { data: people } = await supabase
      .from('seller_profiles')
      .select('id, full_name, kennel_name')
      .in('id', otherIds)
    for (const p of people ?? []) nameById[p.id] = p.kennel_name || p.full_name || 'Member'
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase mb-1" style={{ ...montserrat, color: '#0E0E0E', letterSpacing: '-0.02em' }}>
          Messages
        </h1>
        <p className="text-sm" style={{ color: '#7C7A6E', ...inter }}>
          Conversations about your listings and inquiries.
        </p>
      </div>

      <div style={{ background: 'white', border: '1px solid #D9C8A6' }}>
        {conversations && conversations.length > 0 ? (
          conversations.map((conv, i) => {
            const dog = conv.dogs as unknown as { title: string; breed: string } | null
            const otherId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id
            const role = conv.buyer_id === user.id ? 'You contacted' : 'Inquiry from'
            const other = nameById[otherId] ?? 'Member'
            return (
              <Link
                key={conv.id}
                href={`/dashboard/messages/${conv.id}`}
                className="px-6 py-4 flex items-center justify-between hover:bg-[#FAF7EF]"
                style={{ borderBottom: i < conversations.length - 1 ? '1px solid #EAE4D6' : 'none', textDecoration: 'none' }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#0E0E0E', ...inter }}>
                    {role} {other} · {dog?.title ?? 'Listing'}
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#7C7A6E', ...inter }}>
                    {dog?.breed} · {new Date(conv.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <span style={{ ...inter, fontSize: 12, fontWeight: 700, color: '#D4600A' }}>Open →</span>
              </Link>
            )
          })
        ) : (
          <div className="px-6 py-16 text-center">
            <div style={{ fontSize: 48, opacity: 0.2, marginBottom: 12 }}>💬</div>
            <p className="text-sm mb-1" style={{ color: '#7C7A6E', ...inter }}>No messages yet.</p>
            <p className="text-xs" style={{ color: '#B0AEA4', ...inter }}>
              When buyers contact you about a listing, conversations will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
