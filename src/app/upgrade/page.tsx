'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/navbar'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle } from 'lucide-react'
import { PLANS, PLAN_ORDER, type PlanId } from '@/lib/plans'

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
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentTier, setCurrentTier] = useState<string | null>(null)
  const canceled = params.get('canceled') === '1'
  const highlight = (params.get('plan') as PlanId | null) ?? 'pro'

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

  async function startCheckout(plan: PlanId) {
    setError(null)
    setLoadingPlan(plan)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/login?redirect=/upgrade?plan=${plan}`)
        return
      }
      const res = await fetch('/api/checkout/pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const json = await res.json()
      if (!res.ok || !json.url) {
        setError(json.error || 'Checkout is not available yet.')
        return
      }
      window.location.href = json.url
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div style={{ background: '#EFE7D4', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h1 style={{ ...display, fontSize: 40, color: '#0F0F0E', marginBottom: 12 }}>
            Pick Your Plan
          </h1>
          <p style={{ ...sans, fontWeight: 400, fontSize: 17, color: '#7C7A6E', lineHeight: 1.6 }}>
            Every plan starts with a listing in front of serious buyers. Cancel any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLAN_ORDER.map((planId) => {
            const p = PLANS[planId]
            const featured = planId === highlight
            const isCurrent = currentTier === planId
            const busy = loadingPlan === planId
            return (
              <div key={p.id} style={{ background: featured ? '#0F0F0E' : 'white', border: `1px solid ${featured ? '#D85A1C' : '#D9C8A6'}`, padding: 32, display: 'flex', flexDirection: 'column' }}>
                <div style={{ ...display, fontSize: 17, color: featured ? '#EFE7D4' : '#0F0F0E', marginBottom: 2 }}>{p.name}</div>
                <div style={{ ...sans, fontSize: 11, fontWeight: 400, color: featured ? 'rgba(244,239,229,0.45)' : '#7C7A6E', marginBottom: 16 }}>{p.tagline}</div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span style={{ ...display, fontSize: 44, color: featured ? '#EFE7D4' : '#0F0F0E', lineHeight: 1 }}>{p.price}</span>
                  <span style={{ ...sans, fontSize: 13, color: featured ? 'rgba(244,239,229,0.45)' : '#7C7A6E' }}>{p.period}</span>
                </div>
                <div style={{ ...sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#D85A1C', marginBottom: 20, minHeight: 14 }}>
                  {p.trial ?? ''}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', flex: 1 }}>
                  {p.features.map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5 mb-2.5" style={{ ...sans, fontSize: 13, fontWeight: 400, color: featured ? 'rgba(244,239,229,0.7)' : '#0F0F0E', lineHeight: 1.5 }}>
                      <CheckCircle size={16} style={{ color: '#D85A1C', flexShrink: 0, marginTop: 2 }} />
                      {perk}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div style={{ background: featured ? 'rgba(244,239,229,0.08)' : '#EFE7D4', padding: 14, textAlign: 'center' }}>
                    <p style={{ ...sans, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: featured ? '#EFE7D4' : '#0F0F0E' }}>Your current plan</p>
                  </div>
                ) : (
                  <button
                    onClick={() => startCheckout(p.id)}
                    disabled={loadingPlan !== null}
                    className="w-full py-4"
                    style={{
                      background: busy ? '#7C7A6E' : featured ? '#D85A1C' : 'transparent',
                      ...sans, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em',
                      color: featured ? 'white' : '#0F0F0E',
                      border: `1px solid ${featured ? '#D85A1C' : '#0F0F0E'}`,
                      cursor: busy ? 'wait' : 'pointer',
                    }}
                  >
                    {busy ? 'Redirecting…' : p.cta}
                  </button>
                )}
              </div>
            )
          })}
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
