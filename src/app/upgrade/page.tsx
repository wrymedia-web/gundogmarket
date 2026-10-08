'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle } from 'lucide-react'
import { PLANS, type PlanId } from '@/lib/plans'

const display: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '-0.02em',
  lineHeight: 0.95,
}
const sans: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
}

export default function UpgradePage() {
  return (
    <Suspense fallback={<div style={{ background: '#EFE7D4', minHeight: '100vh' }}><Navbar /></div>}>
      <UpgradePageInner />
    </Suspense>
  )
}

function UpgradePageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTier, setCurrentTier] = useState<string | null>(null)
  const canceled = params.get('canceled') === '1'

  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user || !mounted) return
      const { data } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status')
        .eq('id', user.id)
        .maybeSingle()
      if (mounted && data?.subscription_status === 'active' && data?.subscription_tier) {
        setCurrentTier(data.subscription_tier)
      }
    })
    return () => { mounted = false }
  }, [supabase])

  async function startCheckout() {
    setError(null)
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?redirect=/upgrade')
        return
      }
      const res = await fetch('/api/checkout/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' }),
      })
      const json = await res.json()
      if (!res.ok || !json.url) {
        setError(json.error || 'Checkout is not available yet.')
        return
      }
      window.location.href = json.url
    } finally {
      setLoading(false)
    }
  }

  const free = PLANS.free
  const pro = PLANS.pro

  return (
    <div style={{ background: '#EFE7D4', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h1 style={{ ...display, fontSize: 40, color: '#0F0F0E', marginBottom: 12 }}>
            Upgrade to Breeder Pro
          </h1>
          <p style={{ ...sans, fontWeight: 400, fontSize: 17, color: '#7C7A6E', lineHeight: 1.6 }}>
            More listings, featured placement, and priority support. Cancel any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free tier */}
          <div style={{ background: 'white', border: '1px solid #D9C8A6', padding: 32, display: 'flex', flexDirection: 'column' }}>
            <div style={{ ...display, fontSize: 17, color: '#0F0F0E', marginBottom: 2 }}>{free.name}</div>
            <div style={{ ...sans, fontSize: 11, fontWeight: 400, color: '#7C7A6E', marginBottom: 16 }}>{free.tagline}</div>
            <div className="flex items-baseline gap-2 mb-6">
              <span style={{ ...display, fontSize: 44, color: '#0F0F0E', lineHeight: 1 }}>{free.price}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', flex: 1 }}>
              {free.features.map((perk) => (
                <li key={perk} className="flex items-start gap-2.5 mb-2.5" style={{ ...sans, fontSize: 13, fontWeight: 400, color: '#0F0F0E', lineHeight: 1.5 }}>
                  <CheckCircle size={16} style={{ color: '#D85A1C', flexShrink: 0, marginTop: 2 }} />
                  {perk}
                </li>
              ))}
            </ul>
            {currentTier === 'free' || !currentTier ? (
              <Link
                href="/sell"
                className="w-full py-4"
                style={{ ...sans, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0F0F0E', border: '1px solid #D9C8A6', background: 'transparent', textAlign: 'center', textDecoration: 'none', display: 'block' }}
              >
                {free.cta}
              </Link>
            ) : (
              <div style={{ background: '#EFE7D4', padding: 14, textAlign: 'center' }}>
                <p style={{ ...sans, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0F0F0E' }}>Free tier</p>
              </div>
            )}
          </div>

          {/* Pro tier */}
          <div style={{ background: '#0F0F0E', border: '1px solid #D85A1C', padding: 32, display: 'flex', flexDirection: 'column' }}>
            <div style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#D85A1C', color: 'white', display: 'inline-block', padding: '3px 10px', marginBottom: 16, alignSelf: 'flex-start' }}>For Breeders</div>
            <div style={{ ...display, fontSize: 17, color: '#EFE7D4', marginBottom: 2 }}>{pro.name}</div>
            <div style={{ ...sans, fontSize: 11, fontWeight: 400, color: 'rgba(244,239,229,0.45)', marginBottom: 16 }}>{pro.tagline}</div>
            <div className="flex items-baseline gap-2 mb-6">
              <span style={{ ...display, fontSize: 44, color: '#EFE7D4', lineHeight: 1 }}>{pro.price}</span>
              <span style={{ ...sans, fontSize: 13, color: 'rgba(244,239,229,0.45)' }}>{pro.period}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', flex: 1 }}>
              {pro.features.map((perk) => (
                <li key={perk} className="flex items-start gap-2.5 mb-2.5" style={{ ...sans, fontSize: 13, fontWeight: 400, color: 'rgba(244,239,229,0.7)', lineHeight: 1.5 }}>
                  <CheckCircle size={16} style={{ color: '#D85A1C', flexShrink: 0, marginTop: 2 }} />
                  {perk}
                </li>
              ))}
            </ul>
            {currentTier === 'pro' ? (
              <div style={{ background: 'rgba(244,239,229,0.08)', padding: 14, textAlign: 'center' }}>
                <p style={{ ...sans, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#EFE7D4' }}>Your current plan</p>
              </div>
            ) : (
              <button
                onClick={startCheckout}
                disabled={loading}
                className="w-full py-4"
                style={{
                  background: loading ? '#7C7A6E' : '#D85A1C',
                  ...sans, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em',
                  color: 'white',
                  border: '1px solid #D85A1C',
                  cursor: loading ? 'wait' : 'pointer',
                }}
              >
                {loading ? 'Redirecting…' : pro.cta}
              </button>
            )}
          </div>
        </div>

        {canceled && (
          <p style={{ ...sans, fontSize: 13, color: '#7C7A6E', textAlign: 'center', marginTop: 20 }}>Checkout canceled. You can start again any time.</p>
        )}
        {error && (
          <p style={{ ...sans, fontSize: 13, color: '#B03A1F', textAlign: 'center', marginTop: 20 }}>{error}</p>
        )}

        <p style={{ ...sans, fontSize: 12, color: '#7C7A6E', textAlign: 'center', marginTop: 32 }}>
          Payment secure via Stripe · Cancel any time from your account
        </p>
      </div>
    </div>
  )
}
