'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const errorParam = searchParams.get('error')
  const messageParam = searchParams.get('message')
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
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
            BUY DOGS.<br />SELL DOGS.<br /><span style={{ color: '#D4600A' }}>GET HUNTING.</span>
          </h2>
          <p style={{ ...sans, fontWeight: 400, fontSize: 17, color: 'rgba(244,239,229,0.5)', lineHeight: 1.6 }}>
            The marketplace for working bird dogs.
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

          <h1 style={{ ...display, fontSize: 28, color: '#0E0E0E', marginBottom: 6 }}>Welcome Back</h1>
          <p style={{ ...sans, fontWeight: 400, fontSize: 16, color: '#7C7A6E', marginBottom: 28 }}>Sign in to your account</p>

          {(error || errorParam) && (
            <div className="mb-5 px-4 py-3" style={{ background: '#fee2e2', border: '1px solid #fca5a5', ...sans, fontWeight: 400, fontSize: 15, color: '#991b1b' }}>
              {error || 'Authentication failed. Please try again.'}
            </div>
          )}
          {messageParam && (
            <div className="mb-5 px-4 py-3" style={{ background: '#dcfce7', border: '1px solid #86efac', ...sans, fontWeight: 400, fontSize: 15, color: '#166534' }}>
              {messageParam}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0E0E0E', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hunter@example.com" required className="w-full px-4 py-3 outline-none" style={{ border: '1px solid #D9C8A6', background: 'white', color: '#0E0E0E', ...sans, fontWeight: 400, fontSize: 16 }} />
            </div>
            <div>
              <label style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0E0E0E', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full px-4 py-3 outline-none" style={{ border: '1px solid #D9C8A6', background: 'white', color: '#0E0E0E', ...sans, fontWeight: 400, fontSize: 16 }} />
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 disabled:opacity-60" style={{ background: '#D4600A', ...sans, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', border: 'none' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ ...sans, fontWeight: 400, fontSize: 15, color: '#7C7A6E', textAlign: 'center', marginTop: 24 }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: '#D4600A', fontWeight: 600 }}>Create account</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
