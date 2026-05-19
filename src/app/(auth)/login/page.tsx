'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
      {/* Left panel — Field Deep */}
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
            Buy dogs.<br />Sell dogs.<br />Get hunting.
          </h2>
          <p style={{ ...body, fontSize: 17, color: 'rgba(239,231,212,0.5)', lineHeight: 1.6 }}>
            The marketplace for working bird dogs.
          </p>
        </div>
        <div style={{ ...SC, fontSize: 9, color: 'rgba(239,231,212,0.25)' }}>GunDog Exchange © 2026</div>
      </div>

      {/* Right panel — Bone */}
      <div className="flex-1 flex items-center justify-center px-8 py-12" style={{ background: '#EFE7D4' }}>
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{ ...serif, fontSize: 26, color: '#1C2418' }}>GunDog</span>
              <span style={{ ...SC, fontSize: 12, color: '#8B6A2E', display: 'block' }}>Exchange</span>
            </Link>
          </div>

          <h1 style={{ ...serif, fontSize: 36, color: '#1C2418', marginBottom: 6 }}>Welcome back.</h1>
          <p style={{ ...body, fontSize: 16, color: 'rgba(28,36,24,0.55)', marginBottom: 28 }}>Sign in to your account</p>

          {(error || errorParam) && (
            <div className="mb-5 px-4 py-3" style={{ background: 'rgba(107,32,24,0.08)', border: '1px solid rgba(107,32,24,0.25)', ...body, fontSize: 15, color: '#6B2018' }}>
              {error || 'Authentication failed. Please try again.'}
            </div>
          )}
          {messageParam && (
            <div className="mb-5 px-4 py-3" style={{ background: 'rgba(45,58,42,0.08)', border: '1px solid rgba(45,58,42,0.25)', ...body, fontSize: 15, color: '#2D3A2A' }}>
              {messageParam}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label style={{ ...SC, fontSize: 9, color: '#8B6A2E', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hunter@example.com" required className="w-full px-4 py-3 outline-none" style={{ border: '1px solid rgba(184,137,63,0.3)', background: '#F6F0E1', color: '#1C2418', ...body, fontSize: 16 }} />
            </div>
            <div>
              <label style={{ ...SC, fontSize: 9, color: '#8B6A2E', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full px-4 py-3 outline-none" style={{ border: '1px solid rgba(184,137,63,0.3)', background: '#F6F0E1', color: '#1C2418', ...body, fontSize: 16 }} />
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 disabled:opacity-60" style={{ background: '#2D3A2A', ...SC, fontSize: 10, color: '#EFE7D4', cursor: loading ? 'not-allowed' : 'pointer', border: 'none' }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ ...body, fontSize: 16, color: 'rgba(28,36,24,0.55)', textAlign: 'center', marginTop: 24 }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: '#8B6A2E', fontStyle: 'italic' }}>Create account</Link>
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
