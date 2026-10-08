'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
// Full-page navigation after MFA so SSR re-reads the upgraded session cookie.

const sans: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
}

export default function AdminVerifyPage() {
  const supabase = createClient()
  const [factorId, setFactorId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const f = (data?.totp ?? []).find((f) => f.status === 'verified')
      if (f) setFactorId(f.id)
      else window.location.assign('/admin/security')
    })
  }, [supabase])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!factorId) return
    setBusy(true); setError(null)
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId })
    if (chErr) { setBusy(false); setError(chErr.message); return }
    const { error: vErr } = await supabase.auth.mfa.verify({ factorId, challengeId: ch.id, code: code.trim() })
    if (vErr) { setBusy(false); setError(vErr.message); return }
    // Ensure the AAL2 session is persisted to cookies before the server re-reads it
    await supabase.auth.getSession()
    window.location.assign('/admin')
  }

  return (
    <div className="max-w-sm">
      <h1 style={{ ...sans, fontWeight: 900, fontSize: 24, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#0F0F0E', marginBottom: 4 }}>Verify It's You</h1>
      <p style={{ ...sans, fontSize: 13, color: '#7C7A6E', marginBottom: 20 }}>Enter the 6-digit code from your authenticator app to unlock the admin dashboard.</p>
      <form onSubmit={submit} style={{ background: 'white', border: '1px solid #D9C8A6', padding: 24 }}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          autoFocus
          style={{ ...sans, fontSize: 22, letterSpacing: '0.3em', width: '100%', padding: '12px', border: '1px solid #D9C8A6', outline: 'none', textAlign: 'center', marginBottom: 12 }}
        />
        {error && <p style={{ ...sans, fontSize: 12, color: '#B03A1F', marginBottom: 10 }}>{error}</p>}
        <button type="submit" disabled={busy || code.length !== 6} style={{ ...sans, width: '100%', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', background: busy ? '#7C7A6E' : '#D85A1C', color: 'white', border: 'none', padding: '14px', cursor: 'pointer' }}>
          {busy ? 'Checking…' : 'Verify'}
        </button>
      </form>
    </div>
  )
}
