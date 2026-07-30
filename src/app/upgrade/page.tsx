'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/navbar'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle } from 'lucide-react'

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

const PERKS = [
  'Up to 5 active listings',
  'Featured on homepage',
  'Verified badge on your profile',
  'Priority support',
]

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
  const [alreadyPro, setAlreadyPro] = useState(false)
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
      if (mounted && data?.subscription_tier === 'pro' && data?.subscription_status === 'active') {
        setAlreadyPro(true)
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
        router.push('/login?next=/upgrade')
        return
      }
      const res = await fetch('/api/checkout/pro', { method: 'POST' })
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

  return (
    <div style={{ background: '#EFE7D4', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-20">
        <h1 style={{ ...display, fontSize: 40, color: '#0F0F0E', marginBottom: 12 }}>
          Breeder Pro
        </h1>
        <p style={{ ...sans, fontWeight: 400, fontSize: 17, color: '#7C7A6E', marginBottom: 40, lineHeight: 1.6 }}>
          More listings, more visibility. Cancel any time.
        </p>

        <div style={{ background: 'white', border: '1px solid #D9C8A6', padding: 40, marginBottom: 24 }}>
          <div className="flex items-baseline gap-2 mb-8">
            <span style={{ ...display, fontSize: 64, color: '#0F0F0E', lineHeight: 1 }}>$29</span>
            <span style={{ ...sans, fontSize: 15, color: '#7C7A6E' }}>/month</span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px' }}>
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-3 mb-3" style={{ ...sans, fontSize: 16, color: '#0F0F0E' }}>
                <CheckCircle size={20} style={{ color: '#D85A1C', flexShrink: 0 }} />
                {perk}
              </li>
            ))}
          </ul>

          {alreadyPro ? (
            <div style={{ background: '#EFE7D4', padding: 20, textAlign: 'center' }}>
              <p style={{ ...sans, fontWeight: 700, fontSize: 14, color: '#0F0F0E' }}>You're already on Breeder Pro. 🎉</p>
              <p style={{ ...sans, fontWeight: 400, fontSize: 13, color: '#7C7A6E', marginTop: 4 }}>Manage your subscription from the customer portal (coming soon).</p>
            </div>
          ) : (
            <>
              <button
                onClick={startCheckout}
                disabled={loading}
                className="w-full py-4"
                style={{ background: loading ? '#7C7A6E' : '#D85A1C', ...sans, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'white', cursor: loading ? 'wait' : 'pointer', border: 'none' }}
              >
                {loading ? 'Redirecting…' : 'Start Subscription'}
              </button>
              {canceled && (
                <p style={{ ...sans, fontSize: 13, color: '#7C7A6E', textAlign: 'center', marginTop: 12 }}>Checkout canceled. You can start again any time.</p>
              )}
              {error && (
                <p style={{ ...sans, fontSize: 13, color: '#B03A1F', textAlign: 'center', marginTop: 12 }}>{error}</p>
              )}
            </>
          )}
        </div>

        <p style={{ ...sans, fontSize: 12, color: '#7C7A6E', textAlign: 'center' }}>
          Payment secure via Stripe · Cancel any time from your account
        </p>
      </div>
    </div>
  )
}
