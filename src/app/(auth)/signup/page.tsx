'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const montserrat: React.CSSProperties = {
  fontFamily: "'Montserrat', var(--font-montserrat), system-ui, sans-serif",
}

const inter: React.CSSProperties = {
  fontFamily: "'Inter', var(--font-inter), system-ui, sans-serif",
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
          <div
            className="w-14 h-14 flex items-center justify-center text-2xl mx-auto mb-6"
            style={{ background: '#0E0E0E' }}
          >
            ✉️
          </div>
          <h1 className="text-2xl font-black uppercase mb-3" style={{ ...montserrat, color: '#0E0E0E' }}>
            Check Your Email
          </h1>
          <p className="text-sm" style={{ color: '#7C7A6E', ...inter }}>
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
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
            LIST YOUR DOG.<br />
            REACH THOUSANDS.<br />
            <span style={{ color: '#D4600A' }}>FOR FREE.</span>
          </h2>
          <p className="text-sm" style={{ color: 'rgba(244,239,229,0.5)', ...inter }}>
            Free listing · Verified seller badge · Secure payment.
          </p>
        </div>
        <div className="text-xs uppercase tracking-widest" style={{ color: 'rgba(244,239,229,0.25)', ...inter }}>
          GunDog Market © 2026
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-8 py-12" style={{ background: '#F4EFE5' }}>
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-xl font-black" style={{ ...montserrat, color: '#D4600A' }}>GUNDOG</span>
              <span className="text-xl font-black" style={{ ...montserrat, color: '#0E0E0E' }}>MARKET</span>
            </Link>
          </div>

          <h1 className="text-2xl font-black uppercase mb-1" style={{ ...montserrat, color: '#0E0E0E' }}>
            Create Account
          </h1>
          <p className="text-sm mb-8" style={{ color: '#7C7A6E', ...inter }}>
            Start selling dogs or save your favorites
          </p>

          {error && (
            <div
              className="mb-5 px-4 py-3 text-sm font-medium"
              style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', ...inter }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: '#0E0E0E', ...inter }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                required
                className="w-full px-4 py-3 text-sm outline-none"
                style={{ border: '1px solid #D9C8A6', background: 'white', color: '#0E0E0E', ...inter }}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: '#0E0E0E', ...inter }}>
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
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: '#0E0E0E', ...inter }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
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
              {loading ? 'Creating account...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#7C7A6E', ...inter }}>
            Already have an account?{' '}
            <Link href="/login" className="font-bold" style={{ color: '#D4600A' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
