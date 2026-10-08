import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { getAdminContext, logAdminAction } from '@/lib/admin'

const sans: React.CSSProperties = { fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif" }
const display: React.CSSProperties = { ...sans, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }

export const dynamic = 'force-dynamic'

export default async function AdminThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const service = createServiceClient()

  const { data: conv } = await service
    .from('conversations')
    .select('id, buyer_id, seller_id, created_at, dogs(title)')
    .eq('id', id)
    .maybeSingle()
  if (!conv) notFound()

  // Privacy safeguard: every admin view of a private thread is audit-logged
  const ctx = await getAdminContext()
  if (ctx) await logAdminAction(ctx, 'message_thread_viewed', 'conversation', id)

  const [{ data: messages }, buyerRes, sellerRes] = await Promise.all([
    service.from('messages').select('id, sender_id, body, created_at').eq('conversation_id', id).order('created_at'),
    service.auth.admin.getUserById(conv.buyer_id),
    service.auth.admin.getUserById(conv.seller_id),
  ])
  const emails: Record<string, string> = {
    [conv.buyer_id]: buyerRes.data?.user?.email ?? 'buyer',
    [conv.seller_id]: sellerRes.data?.user?.email ?? 'seller',
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <Link href="/admin/messages" style={{ ...sans, fontSize: 13, color: '#D85A1C', fontWeight: 600, textDecoration: 'none' }}>← Messages</Link>
      <h1 style={{ ...display, fontSize: 20, color: '#0F0F0E', margin: '12px 0 4px' }}>
        {(conv.dogs as unknown as { title: string } | null)?.title ?? '(deleted listing)'}
      </h1>
      <p style={{ ...sans, fontSize: 12, color: '#7C7A6E', marginBottom: 16 }}>
        Buyer: {emails[conv.buyer_id]} · Seller: {emails[conv.seller_id]} · Started {new Date(conv.created_at).toLocaleDateString()}
        <br /><span style={{ color: '#B03A1F' }}>Read-only support/moderation view — this access has been recorded in the activity log.</span>
      </p>

      <div style={{ background: 'white', border: '1px solid #D9C8A6', padding: 20 }}>
        {(messages ?? []).map((m) => {
          const fromBuyer = m.sender_id === conv.buyer_id
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: fromBuyer ? 'flex-start' : 'flex-end', marginBottom: 10 }}>
              <div style={{ maxWidth: '75%', padding: '10px 14px', background: fromBuyer ? '#F4EFE5' : '#D4600A', color: fromBuyer ? '#0E0E0E' : 'white' }}>
                <p style={{ ...sans, fontSize: 10, fontWeight: 700, opacity: 0.75, marginBottom: 2 }}>{emails[m.sender_id] ?? m.sender_id}</p>
                <p style={{ ...sans, fontSize: 13, whiteSpace: 'pre-wrap' }}>{m.body}</p>
                <p style={{ fontSize: 10, marginTop: 4, opacity: 0.6 }}>{new Date(m.created_at).toLocaleString()}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
