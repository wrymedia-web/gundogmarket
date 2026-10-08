'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MessageCircle } from 'lucide-react'

const sans: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
}

export default function ContactSeller({ dogId, sellerId }: { dogId: string; sellerId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push(`/login?redirect=/dogs/${dogId}`)
      return
    }
    if (user.id === sellerId) {
      setError("This is your own listing.")
      return
    }
    if (!message.trim()) {
      setError("Write a message first.")
      return
    }

    setSending(true)
    try {
      // Find or create conversation
      let { data: conv } = await supabase
        .from('conversations')
        .select('id')
        .eq('dog_id', dogId)
        .eq('buyer_id', user.id)
        .maybeSingle()

      if (!conv) {
        const { data: newConv, error: convErr } = await supabase
          .from('conversations')
          .insert({ dog_id: dogId, buyer_id: user.id, seller_id: sellerId })
          .select('id')
          .single()
        if (convErr) throw convErr
        conv = newConv
      }

      const { error: msgErr } = await supabase
        .from('messages')
        .insert({ conversation_id: conv.id, sender_id: user.id, body: message.trim() })
      if (msgErr) throw msgErr

      setSent(true)
      setMessage('')
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center py-2">
        <p style={{ ...sans, fontWeight: 700, fontSize: 13, color: '#166534', marginBottom: 4 }}>Message sent!</p>
        <p style={{ ...sans, fontSize: 12, color: '#7C7A6E' }}>The seller will see it in their dashboard.</p>
        <button
          onClick={() => { setSent(false); setOpen(false) }}
          style={{ ...sans, fontSize: 11, fontWeight: 600, color: '#D85A1C', background: 'none', border: 'none', cursor: 'pointer', marginTop: 8 }}
        >
          Send another
        </button>
      </div>
    )
  }

  if (!open) {
    return (
      <>
        <button
          onClick={async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
              router.push(`/login?redirect=/dogs/${dogId}`)
              return
            }
            setOpen(true)
          }}
          className="w-full py-4 flex items-center justify-center gap-2"
          style={{ background: '#D85A1C', ...sans, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          <MessageCircle size={14} /> Contact Seller
        </button>
        <p style={{ ...sans, fontWeight: 400, fontSize: 12, color: '#7C7A6E', textAlign: 'center', marginTop: 12 }}>
          Sign in to message the seller directly
        </p>
      </>
    )
  }

  return (
    <div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Hi, I'm interested in this dog. Is it still available?"
        rows={4}
        style={{ ...sans, fontSize: 14, width: '100%', padding: '10px 12px', border: '1px solid #D9C8A6', background: 'white', color: '#0F0F0E', resize: 'vertical', outline: 'none', marginBottom: 8 }}
      />
      {error && <p style={{ ...sans, fontSize: 12, color: '#B03A1F', marginBottom: 8 }}>{error}</p>}
      <button
        onClick={handleSend}
        disabled={sending}
        className="w-full py-3 flex items-center justify-center gap-2"
        style={{ background: sending ? '#7C7A6E' : '#D85A1C', ...sans, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'white', border: 'none', cursor: sending ? 'wait' : 'pointer' }}
      >
        <MessageCircle size={14} /> {sending ? 'Sending…' : 'Send Message'}
      </button>
      <button
        onClick={() => setOpen(false)}
        style={{ ...sans, fontSize: 11, fontWeight: 600, color: '#7C7A6E', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'center', marginTop: 8 }}
      >
        Cancel
      </button>
    </div>
  )
}
