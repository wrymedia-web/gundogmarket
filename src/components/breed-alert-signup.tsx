'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { ALL_BREEDS } from '@/lib/mock-data'

const sans: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
}
const display: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '-0.02em',
  lineHeight: 0.95,
}
const serif: React.CSSProperties = {
  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
  fontStyle: 'italic',
  fontWeight: 500,
}

const BLAZE = '#D85A1C'

export default function BreedAlertSignup({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const [email, setEmail] = useState('')
  const [breed, setBreed] = useState('All Breeds')
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const dark = variant === 'dark'
  const ink = dark ? '#EFE7D4' : '#0F0F0E'
  const sub = dark ? 'rgba(239,231,212,0.45)' : '#7C7A6E'
  const fieldStyle: React.CSSProperties = {
    ...sans,
    fontSize: 13,
    fontWeight: 400,
    padding: '11px 14px',
    outline: 'none',
    color: ink,
    background: dark ? 'rgba(255,255,255,0.04)' : 'white',
    border: dark ? '1px solid rgba(239,231,212,0.15)' : '1px solid #D9C8A6',
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'saving') return
    setStatus('saving')
    setErrorMsg('')
    try {
      const res = await fetch('/api/breed-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, breed }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErrorMsg(json.error || 'Something went wrong. Try again.')
        setStatus('error')
        return
      }
      setStatus('done')
    } catch {
      setErrorMsg('Something went wrong. Try again.')
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <p style={{ ...display, fontSize: 18, color: ink, marginBottom: 6 }}>You&apos;re on the list.</p>
        <p style={{ ...serif, fontSize: 15, color: sub }}>
          We&apos;ll email you the moment {breed === 'All Breeds' ? 'new' : breed} listings drop.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-3">
        <Bell size={13} style={{ color: BLAZE }} />
        <span style={{ ...sans, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: ink }}>
          First to Know
        </span>
      </div>
      <p style={{ ...serif, fontSize: 15, color: sub, textAlign: 'center', marginBottom: 16 }}>
        Get notified when {breed === 'All Breeds' ? 'new' : breed} listings drop.
      </p>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 justify-center items-stretch max-w-xl mx-auto">
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ ...fieldStyle, flex: 1, minWidth: 0 }}
        />
        <select value={breed} onChange={(e) => setBreed(e.target.value)} style={fieldStyle}>
          <option value="All Breeds">All Breeds</option>
          {ALL_BREEDS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={status === 'saving'}
          style={{
            ...sans,
            fontWeight: 700,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            background: BLAZE,
            color: 'white',
            border: 'none',
            padding: '11px 22px',
            cursor: status === 'saving' ? 'wait' : 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {status === 'saving' ? 'Saving…' : 'Notify Me'}
        </button>
      </form>
      {status === 'error' && (
        <p style={{ ...sans, fontSize: 12, color: '#B03A1F', textAlign: 'center', marginTop: 10 }}>{errorMsg}</p>
      )}
    </div>
  )
}
