'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Wordmark } from '@/components/navbar'

const display: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
  fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.92,
}
const sans: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [hasSession, setHasSession] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setHasSession(!!data.user))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setDone(true)
    setTimeout(() => { router.push('/dashboard'); router.refresh() }, 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-8" style={{ background: '#EFE7D4' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link href="/" style={{ textDecoration: 'none' }}><Wordmark dark /></Link>
        </div>

        {hasSession === false ? (
          <>
            <h1 style={{ ...display, fontSize: 28, color: '#0F0F0E', marginBottom: 6 }}>Link Expired</h1>
            <p style={{ ...sans, fontWeight: 400, fontSize: 16, color: '#7C7A6E', marginBottom: 24 }}>
              This reset link is invalid or has expired. Request a new one.
            </p>
            <Link href="/forgot-password" style={{ ...sans, color: '#D85A1C', fontWeight: 600, fontSize: 15 }}>Request new link →</Link>
          </>
        ) : done ? (
          <>
            <div style={{ width: 56, height: 56, background: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 24, color: 'white' }}>✓</div>
            <h1 style={{ ...display, fontSize: 28, color: '#0F0F0E', marginBottom: 6 }}>Password Updated</h1>
            <p style={{ ...sans, fontWeight: 400, fontSize: 16, color: '#7C7A6E' }}>Redirecting to your dashboard…</p>
          </>
        ) : (
          <>
            <h1 style={{ ...display, fontSize: 28, color: '#0F0F0E', marginBottom: 6 }}>Set New Password</h1>
            <p style={{ ...sans, fontWeight: 400, fontSize: 16, color: '#7C7A6E', marginBottom: 28 }}>Choose a new password for your account.</p>
            {error && (
              <div className="mb-5 px-4 py-3" style={{ background: '#fee2e2', border: '1px solid #fca5a5', ...sans, fontWeight: 400, fontSize: 15, color: '#991b1b' }}>{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0F0F0E', display: 'block', marginBottom: 6 }}>New Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full px-4 py-3 outline-none" style={{ border: '1px solid #D9C8A6', background: 'white', color: '#0F0F0E', ...sans, fontWeight: 400, fontSize: 16 }} />
              </div>
              <div>
                <label style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0F0F0E', display: 'block', marginBottom: 6 }}>Confirm Password</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required className="w-full px-4 py-3 outline-none" style={{ border: '1px solid #D9C8A6', background: 'white', color: '#0F0F0E', ...sans, fontWeight: 400, fontSize: 16 }} />
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 disabled:opacity-60" style={{ background: '#D85A1C', ...sans, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', border: 'none' }}>
                {loading ? 'Updating…' : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
