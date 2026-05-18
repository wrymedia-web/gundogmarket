'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const montserrat: React.CSSProperties = {
  fontFamily: "'Montserrat', var(--font-montserrat), system-ui, sans-serif",
}

const inter: React.CSSProperties = {
  fontFamily: "'Inter', var(--font-inter), system-ui, sans-serif",
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
      {/* Left panel — Ink black */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] p-12"
        style={{ background: '#0E0E0E' }}
      >
        <div>
          <Link href="/" className="flex items-center gap-1">
            <span className="text-xl font-black" style={{ ...montserrat, color: '#D4600A' }}>GUNDOG</span>
            <span className="text-xl font-black" style={{ ...montserrat, color: '#F4EFE5' }}>MARKET</span>
          </Link>
        </div>
        <div>
          <h2
            className="text-4xl font-black text-white uppercase leading-none mb-4"
            style={{ ...montserrat, letterSpacing: '-0.02em' }}
          >
            BUY DOGS.<br />
            SELL DOGS.<br />
            <span style={{ color: '#D4600A' }}>GET HUNTING.</span>
          </h2>
          <p className="text-sm" style={{ color: 'rgba(244,239,229,0.5)', ...inter }}>
            The marketplace for working bird dogs.
          </p>
        </div>
        <div
          className="text-xs uppercase tracking-widest"
          style={{ color: 'rgba(244,239,229,0.25)', ...inter }}
        >
          GunDog Market © 2026
        </div>
      </div>

      {/* Right panel — Bone */}
      <div
        className="flex-1 flex items-center justify-center px-8 py-12"
        style={{ background: '#F4EFE5' }}
      >
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-xl font-black" style={{ ...montserrat, color: '#D4600A' }}>GUNDOG</span>
              <span className="text-xl font-black" style={{ ...montserrat, color: '#0E0E0E' }}>MARKET</span>
            </Link>
          </div>

          <h1
            className="text-2xl font-black uppercase mb-1"
            style={{ ...montserrat, color: '#0E0E0E' }}
          >
            Welcome Back
          </h1>
          <p className="text-sm mb-8" style={{ color: '#7C7A6E', ...inter }}>
            Sign in to your seller dashboard
          </p>

          {(error || errorParam) && (
            <div
              className="mb-5 px-4 py-3 text-sm font-medium"
              style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', ...inter }}
            >
              {error || 'Authentication failed. Please try again.'}
            </div>
          )}
          {messageParam && (
            <div
              className="mb-5 px-4 py-3 text-sm font-medium"
              style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', ...inter }}
            >
              {messageParam}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                className="block text-xs font-bold mb-1.5 uppercase tracking-wider"
                style={{ color: '#0E0E0E', ...inter }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hunter@example.com"
                required
                className="w-full px-4 py-3 text-sm outline-none"
                style={{ border: '1px solid #D9C8A6', background: 'white', color: '#0E0E0E', ...inter }}
              />
            </div>
            <div>
              <label
                className="block text-xs font-bold mb-1.5 uppercase tracking-wider"
                style={{ color: '#0E0E0E', ...inter }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 text-sm outline-none"
                style={{ border: '1px solid #D9C8A6', background: 'white', color: '#0E0E0E', ...inter }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-sm font-bold text-white uppercase tracking-widest disabled:opacity-60"
              style={{
                background: loading ? '#A84808' : '#D4600A',
                ...inter,
                letterSpacing: '0.1em',
                cursor: loading ? 'not-allowed' : 'pointer',
                border: 'none',
              }}
            >
              {loading ? 'Signing in...' : 'SIGN IN'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#7C7A6E', ...inter }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-bold" style={{ color: '#D4600A' }}>
              Create account
            </Link>
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
