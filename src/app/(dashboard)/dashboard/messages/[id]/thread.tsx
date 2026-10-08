'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const inter: React.CSSProperties = {
  fontFamily: "'Inter', var(--font-inter), system-ui, sans-serif",
}

type Message = { id: string; sender_id: string; body: string; created_at: string }

export default function Thread({
  conversationId, currentUserId, initialMessages,
}: { conversationId: string; currentUserId: string; initialMessages: Message[] }) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages.length])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const text = body.trim()
    if (!text) return
    setSending(true)
    const { data, error } = await supabase
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: currentUserId, body: text })
      .select('id, sender_id, body, created_at')
      .single()
    setSending(false)
    if (error) { setError(error.message); return }
    if (data) { setMessages((m) => [...m, data as Message]); setBody('') }
  }

  return (
    <div style={{ background: 'white', border: '1px solid #D9C8A6' }}>
      <div style={{ maxHeight: 440, overflowY: 'auto', padding: 20 }}>
        {messages.length === 0 ? (
          <p style={{ ...inter, fontSize: 14, color: '#7C7A6E', textAlign: 'center', padding: '24px 0' }}>No messages yet. Say hello.</p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === currentUserId
            return (
              <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
                <div style={{ maxWidth: '75%', padding: '10px 14px', background: mine ? '#D4600A' : '#F4EFE5', color: mine ? 'white' : '#0E0E0E', ...inter, fontSize: 14, lineHeight: 1.45 }}>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.body}</div>
                  <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7 }}>
                    {new Date(m.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} style={{ borderTop: '1px solid #EAE4D6', padding: 16 }}>
        {error && <p style={{ ...inter, fontSize: 12, color: '#B03A1F', marginBottom: 8 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a reply…"
            style={{ ...inter, flex: 1, fontSize: 14, padding: '10px 12px', border: '1px solid #D9C8A6', background: 'white', color: '#0E0E0E', outline: 'none' }}
          />
          <button type="submit" disabled={sending} style={{ ...inter, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', background: sending ? '#7C7A6E' : '#D4600A', color: 'white', border: 'none', padding: '0 24px', cursor: sending ? 'wait' : 'pointer' }}>
            {sending ? '…' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  )
}
