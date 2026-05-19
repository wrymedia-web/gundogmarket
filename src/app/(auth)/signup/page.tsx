'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const display: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '-0.02em',
  lineHeight: 0.92,
}
const sans: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
}
const SC: React.CSSProperties = {
  fontFamily: "var(--font-cormorant-sc), 'Cormorant SC', Georgia, serif",
  fontWeight: 500,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontStyle: 'normal',
}

const fieldInput: React.CSSProperties = {
  border: '1px solid #D9C8A6',
  background: 'white',
  color: '#0E0E0E',
  outline: 'none',
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
  fontWeight: 400,
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
      <div className="min-h-screen flex items-center justify-center px-8" style={{ background: '#F4EFE5' }}>
        <div className="max-w-sm w-full text-center">
          <div style={{ width: 56, height: 56, background: '#D4600A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 24px' }}>✉️</div>
          <h1 style={{ ...display, fontSize: 28, color: '#0E0E0E', marginBottom: 12 }}>Check Your Email</h1>
          <p style={{ ...sans, fontWeight: 400, fontSize: 16, color: '#7C7A6E', lineHeight: 1.6 }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12" style={{ background: '#0E0E0E' }}>
        <div>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ ...display, fontSize: 22, color: '#F4EFE5' }}>GunDog</span>
            <span style={{ ...display, fontSize: 22, color: '#D4600A' }}> Exchange</span>
          </Link>
        </div>
        <div>
          <h2 style={{ ...display, fontSize: 'clamp(40px, 5vw, 56px)', color: '#F4EFE5', marginBottom: 16 }}>
            LIST YOUR DOG.<br />REACH THOUSANDS.<br /><span style={{ color: '#D4600A' }}>FOR FREE.</span>
          </h2>
          <p style={{ ...sans, fontWeight: 400, fontSize: 17, color: 'rgba(244,239,229,0.5)', lineHeight: 1.6 }}>
            Free listing · Verified seller badge · Secure payment.
          </p>
        </div>
        <div style={{ ...sans, fontWeight: 600, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(244,239,229,0.2)' }}>GunDog Exchange © 2026</div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12" style={{ background: '#F4EFE5' }}>
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{ ...display, fontSize: 20, color: '#0E0E0E' }}>GunDog</span>
              <span style={{ ...display, fontSize: 20, color: '#D4600A' }}> Exchange</span>
            </Link>
          </div>

          <h1 style={{ ...display, fontSize: 28, color: '#0E0E0E', marginBottom: 6 }}>Create Account</h1>
          <p style={{ ...sans, fontWeight: 400, fontSize: 16, color: '#7C7A6E', marginBottom: 28 }}>Start selling dogs or save your favorites</p>

          {error && (
            <div className="mb-5 px-4 py-3" style={{ background: '#fee2e2', border: '1px solid #fca5a5', ...sans, fontWeight: 400, fontSize: 15, color: '#991b1b' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0E0E0E', display: 'block', marginBottom: 6 }}>Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Smith" required className="w-full px-4 py-3 outline-none" style={fieldInput} />
            </div>
            <div>
              <label style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0E0E0E', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hunter@example.com" required className="w-full px-4 py-3 outline-none" style={fieldInput} />
            </div>
            <div>
              <label style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0E0E0E', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="w-full px-4 py-3 outline-none" style={fieldInput} />
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 disabled:opacity-60" style={{ background: '#D4600A', ...sans, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', border: 'none' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ ...sans, fontWeight: 400, fontSize: 15, color: '#7C7A6E', textAlign: 'center', marginTop: 24 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#D4600A', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
