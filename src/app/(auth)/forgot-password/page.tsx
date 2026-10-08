'use client'

import { useState } from 'react'
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/callback?next=/reset-password`,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-8" style={{ background: '#EFE7D4' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link href="/" style={{ textDecoration: 'none' }}><Wordmark dark /></Link>
        </div>

        {sent ? (
          <>
            <div style={{ width: 56, height: 56, background: '#D85A1C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 24 }}>✉️</div>
            <h1 style={{ ...display, fontSize: 28, color: '#0F0F0E', marginBottom: 6 }}>Check Your Email</h1>
            <p style={{ ...sans, fontWeight: 400, fontSize: 16, color: '#7C7A6E', marginBottom: 24 }}>
              If an account exists for {email}, we sent a link to reset your password.
            </p>
            <Link href="/login" style={{ ...sans, color: '#D85A1C', fontWeight: 600, fontSize: 15 }}>← Back to sign in</Link>
          </>
        ) : (
          <>
            <h1 style={{ ...display, fontSize: 28, color: '#0F0F0E', marginBottom: 6 }}>Reset Password</h1>
            <p style={{ ...sans, fontWeight: 400, fontSize: 16, color: '#7C7A6E', marginBottom: 28 }}>
              Enter your email and we&apos;ll send a reset link.
            </p>
            {error && (
              <div className="mb-5 px-4 py-3" style={{ background: '#fee2e2', border: '1px solid #fca5a5', ...sans, fontWeight: 400, fontSize: 15, color: '#991b1b' }}>{error}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0F0F0E', display: 'block', marginBottom: 6 }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hunter@example.com" required className="w-full px-4 py-3 outline-none" style={{ border: '1px solid #D9C8A6', background: 'white', color: '#0F0F0E', ...sans, fontWeight: 400, fontSize: 16 }} />
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 disabled:opacity-60" style={{ background: '#D85A1C', ...sans, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', border: 'none' }}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
            <p style={{ ...sans, fontWeight: 400, fontSize: 15, color: '#7C7A6E', textAlign: 'center', marginTop: 24 }}>
              <Link href="/login" style={{ color: '#D85A1C', fontWeight: 600 }}>Back to sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
