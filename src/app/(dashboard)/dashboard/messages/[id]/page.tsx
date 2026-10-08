import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Thread from './thread'

const montserrat: React.CSSProperties = {
  fontFamily: "'Montserrat', var(--font-montserrat), system-ui, sans-serif",
}
const inter: React.CSSProperties = {
  fontFamily: "'Inter', var(--font-inter), system-ui, sans-serif",
}

export const dynamic = 'force-dynamic'

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=/dashboard/messages/${id}`)

  // RLS ensures only participants can read this conversation
  const { data: conv } = await supabase
    .from('conversations')
    .select('id, buyer_id, seller_id, dog_id, dogs(title, breed)')
    .eq('id', id)
    .maybeSingle()

  if (!conv) notFound()

  const otherId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id
  const { data: other } = await supabase
    .from('seller_profiles')
    .select('full_name, kennel_name')
    .eq('id', otherId)
    .maybeSingle()
  const otherName = other?.kennel_name || other?.full_name || 'Member'

  const { data: messages } = await supabase
    .from('messages')
    .select('id, sender_id, body, created_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  const dog = conv.dogs as unknown as { title: string; breed: string } | null

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/messages" style={{ ...inter, fontSize: 13, color: '#D4600A', fontWeight: 600, textDecoration: 'none' }}>← Messages</Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-black uppercase mb-1" style={{ ...montserrat, color: '#0E0E0E', letterSpacing: '-0.02em' }}>
          {otherName}
        </h1>
        <Link href={`/dogs/${conv.dog_id}`} style={{ ...inter, fontSize: 13, color: '#7C7A6E', textDecoration: 'none' }}>
          Re: {dog?.title ?? 'Listing'} ({dog?.breed}) →
        </Link>
      </div>

      <Thread
        conversationId={conv.id}
        currentUserId={user.id}
        initialMessages={messages ?? []}
      />
    </div>
  )
}
