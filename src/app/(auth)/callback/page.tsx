'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const sans: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
}

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')

  useEffect(() => {
    const code = searchParams.get('code')
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const next = searchParams.get('next') ?? '/dashboard'

    async function handleCallback() {
      const supabase = createClient()

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          router.replace(next)
          return
        }
      }

      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          type: type as 'signup' | 'email',
          token_hash,
        })
        if (!error) {
          router.replace(next)
          return
        }
      }

      setStatus('error')
      setTimeout(() => router.replace('/login?error=auth_callback_failed'), 2000)
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <>
      {status === 'loading' ? (
        <>
          <div style={{ width: 40, height: 40, border: '3px solid #D9C8A6', borderTopColor: '#D85A1C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ ...sans, fontWeight: 500, fontSize: 16, color: '#0F0F0E' }}>Confirming your account…</p>
        </>
      ) : (
        <p style={{ ...sans, fontWeight: 500, fontSize: 16, color: '#991b1b' }}>Something went wrong. Redirecting to login…</p>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </>
  )
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#EFE7D4' }}>
      <div className="text-center">
        <Suspense fallback={
          <>
            <div style={{ width: 40, height: 40, border: '3px solid #D9C8A6', borderTopColor: '#D85A1C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ ...sans, fontWeight: 500, fontSize: 16, color: '#0F0F0E' }}>Confirming your account…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </>
        }>
          <CallbackHandler />
        </Suspense>
      </div>
    </div>
  )
}
