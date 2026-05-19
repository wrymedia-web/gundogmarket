'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const SC: React.CSSProperties = {
  fontFamily: "var(--font-cormorant-sc), 'Cormorant SC', Georgia, serif",
  fontWeight: 500,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  fontStyle: 'normal',
}

const serif: React.CSSProperties = {
  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
  fontStyle: 'italic',
  fontWeight: 500,
}

const body: React.CSSProperties = {
  fontFamily: "var(--font-eb-garamond), 'EB Garamond', Georgia, serif",
  fontWeight: 400,
}

const fieldInput: React.CSSProperties = {
  border: '1px solid rgba(184,137,63,0.3)',
  background: '#F6F0E1',
  color: '#1C2418',
  outline: 'none',
  ...body,
  fontSize: 16,
}

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-8" style={{ background: '#EFE7D4' }}>
        <div className="max-w-sm w-full text-center">
          <div style={{ width: 56, height: 56, background: '#1C2418', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 24px' }}>✉️</div>
          <h1 style={{ ...serif, fontSize: 32, color: '#1C2418', marginBottom: 12 }}>Check Your Email</h1>
          <p style={{ ...body, fontSize: 16, color: 'rgba(28,36,24,0.6)', lineHeight: 1.6 }}>
            We sent a confirmation link to <em>{email}</em>. Click it to activate your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12" style={{ background: '#1C2418' }}>
        <div>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ ...serif, fontSize: 28, color: '#EFE7D4' }}>GunDog</span>
            <span style={{ ...SC, fontSize: 14, color: '#8B6A2E', display: 'block', marginTop: 2 }}>Exchange</span>
          </Link>
        </div>
        <div>
          <div style={{ width: 40, height: 1, background: '#B8893F', opacity: 0.6, marginBottom: 24 }} />
          <h2 style={{ ...serif, fontSize: 52, color: '#EFE7D4', lineHeight: 1, marginBottom: 16 }}>
            List your dog.<br />Reach thousands.<br />For free.
          </h2>
          <p style={{ ...body, fontSize: 17, color: 'rgba(239,231,212,0.5)', lineHeight: 1.6 }}>
            Free listing · Verified seller badge · Secure payment.
          </p>
        </div>
        <div style={{ ...SC, fontSize: 9, color: 'rgba(239,231,212,0.25)' }}>GunDog Exchange © 2026</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12" style={{ background: '#EFE7D4' }}>
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{ ...serif, fontSize: 26, color: '#1C2418' }}>GunDog</span>
              <span style={{ ...SC, fontSize: 12, color: '#8B6A2E', display: 'block' }}>Exchange</span>
            </Link>
          </div>

          <h1 style={{ ...serif, fontSize: 36, color: '#1C2418', marginBottom: 6 }}>Create your account.</h1>
          <p style={{ ...body, fontSize: 16, color: 'rgba(28,36,24,0.55)', marginBottom: 28 }}>Start selling dogs or save your favorites</p>

          {error && (
            <div className="mb-5 px-4 py-3" style={{ background: 'rgba(107,32,24,0.08)', border: '1px solid rgba(107,32,24,0.25)', ...body, fontSize: 15, color: '#6B2018' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label style={{ ...SC, fontSize: 9, color: '#8B6A2E', display: 'block', marginBottom: 6 }}>Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Smith" required className="w-full px-4 py-3 outline-none" style={fieldInput} />
            </div>
            <div>
              <label style={{ ...SC, fontSize: 9, color: '#8B6A2E', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hunter@example.com" required className="w-full px-4 py-3 outline-none" style={fieldInput} />
            </div>
            <div>
              <label style={{ ...SC, fontSize: 9, color: '#8B6A2E', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="w-full px-4 py-3 outline-none" style={fieldInput} />
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 disabled:opacity-60" style={{ background: '#2D3A2A', ...SC, fontSize: 10, color: '#EFE7D4', cursor: loading ? 'not-allowed' : 'pointer', border: 'none' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ ...body, fontSize: 16, color: 'rgba(28,36,24,0.55)', textAlign: 'center', marginTop: 24 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#8B6A2E', fontStyle: 'italic' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
