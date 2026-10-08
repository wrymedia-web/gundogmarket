'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Navbar from '@/components/navbar'
import { createClient } from '@/lib/supabase/client'
import { PLANS } from '@/lib/plans'
import { CheckCircle } from 'lucide-react'

const display: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
  fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 0.95,
}
const sans: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
}

function addDays(days: number) {
  const d = new Date(Date.now() + days * 86400_000)
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

function PricingInner() {
  const router = useRouter()
  const params = useSearchParams()
  const supabase = createClient()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasSub, setHasSub] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('profiles')
        .select('subscription_tier, subscription_status').eq('id', user.id).maybeSingle()
      if (data && ['standard', 'featured', 'pro'].includes(data.subscription_tier ?? '') &&
        ['active', 'trialing', 'past_due'].includes(data.subscription_status ?? '')) {
        setHasSub(true)
      }
    })
  }, [supabase])

  async function startCheckout(plan: 'standard' | 'featured', trial: boolean) {
    setError(null)
    setBusy(trial ? 'trial' : plan)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/signup?redirect=/pricing')
        return
      }
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, trial }),
      })
      const json = await res.json()
      if (!res.ok || !json.url) {
        setError(json.error || 'Checkout is not available right now.')
        return
      }
      window.location.href = json.url
    } finally {
      setBusy(null)
    }
  }

  const std = PLANS.standard
  const fea = PLANS.featured

  const cardStyle = (dark: boolean): React.CSSProperties => ({
    background: dark ? '#0F0F0E' : 'white',
    border: dark ? '2px solid #D85A1C' : '1px solid #D9C8A6',
    padding: 32, display: 'flex', flexDirection: 'column',
  })
  const btn = (active: boolean): React.CSSProperties => ({
    ...sans, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em',
    background: active ? '#7C7A6E' : '#D85A1C', color: 'white', border: 'none',
    padding: '14px 0', width: '100%', cursor: active ? 'wait' : 'pointer', marginTop: 'auto',
  })

  return (
    <div style={{ background: '#EFE7D4', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 style={{ ...display, fontSize: 'clamp(32px,5vw,44px)', color: '#0F0F0E', marginBottom: 12 }}>Simple Pricing. Serious Buyers.</h1>
          <p style={{ ...sans, fontSize: 16, color: '#7C7A6E' }}>Pick a plan, post your dog, get contacted directly. Cancel any time.</p>
          {params.get('canceled') && <p style={{ ...sans, fontSize: 13, color: '#B03A1F', marginTop: 10 }}>Checkout canceled — no charge was made.</p>}
          {hasSub && <p style={{ ...sans, fontSize: 13, color: '#166534', marginTop: 10 }}>You already have an active plan — manage it from <a href="/dashboard/settings" style={{ color: '#D85A1C' }}>Settings</a>.</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Free trial */}
          <div style={cardStyle(false)}>
            <p style={{ ...display, fontSize: 18, color: '#0F0F0E' }}>Free Trial</p>
            <p style={{ ...sans, fontSize: 12, color: '#7C7A6E', margin: '4px 0 14px' }}>Try Standard free for 7 days</p>
            <p style={{ ...display, fontSize: 40, color: '#0F0F0E' }}>$0<span style={{ fontSize: 13, color: '#7C7A6E', textTransform: 'none', letterSpacing: 0 }}> for 7 days</span></p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 20px' }}>
              {std.features.map((f) => (
                <li key={f} className="flex items-start gap-2 mb-2" style={{ ...sans, fontSize: 13, color: '#0F0F0E' }}>
                  <CheckCircle size={15} style={{ color: '#D85A1C', flexShrink: 0, marginTop: 2 }} />{f}
                </li>
              ))}
            </ul>
            <button onClick={() => startCheckout('standard', true)} disabled={busy !== null || hasSub} style={btn(busy === 'trial')}>
              {busy === 'trial' ? 'Starting…' : 'Start Free 7-Day Trial'}
            </button>
            <p style={{ ...sans, fontSize: 11, color: '#7C7A6E', marginTop: 10, lineHeight: 1.5 }}>
              Payment method required. Your trial converts to the <strong>$29/30-day Standard plan on {addDays(7)}</strong> and renews automatically every 30 days until you cancel. Cancel before then and you won&apos;t be charged.
            </p>
          </div>

          {/* Standard */}
          <div style={cardStyle(false)}>
            <p style={{ ...display, fontSize: 18, color: '#0F0F0E' }}>{std.name}</p>
            <p style={{ ...sans, fontSize: 12, color: '#7C7A6E', margin: '4px 0 14px' }}>{std.tagline}</p>
            <p style={{ ...display, fontSize: 40, color: '#0F0F0E' }}>{std.price}<span style={{ fontSize: 13, color: '#7C7A6E', textTransform: 'none', letterSpacing: 0 }}>{std.period}</span></p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 20px' }}>
              {std.features.map((f) => (
                <li key={f} className="flex items-start gap-2 mb-2" style={{ ...sans, fontSize: 13, color: '#0F0F0E' }}>
                  <CheckCircle size={15} style={{ color: '#D85A1C', flexShrink: 0, marginTop: 2 }} />{f}
                </li>
              ))}
            </ul>
            <button onClick={() => startCheckout('standard', false)} disabled={busy !== null || hasSub} style={btn(busy === 'standard')}>
              {busy === 'standard' ? 'Starting…' : 'Choose Standard'}
            </button>
            <p style={{ ...sans, fontSize: 11, color: '#7C7A6E', marginTop: 10, lineHeight: 1.5 }}>
              <strong>First charge today.</strong> {std.renewalDisclosure} Cancel any time from your dashboard.
            </p>
          </div>

          {/* Featured */}
          <div style={cardStyle(true)}>
            <p style={{ ...sans, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', background: '#D85A1C', color: 'white', padding: '3px 10px', alignSelf: 'flex-start', marginBottom: 8 }}>Most Visibility</p>
            <p style={{ ...display, fontSize: 18, color: '#EFE7D4' }}>{fea.name}</p>
            <p style={{ ...sans, fontSize: 12, color: 'rgba(244,239,229,0.6)', margin: '4px 0 14px' }}>{fea.tagline}</p>
            <p style={{ ...display, fontSize: 40, color: '#EFE7D4' }}>{fea.price}<span style={{ fontSize: 13, color: 'rgba(244,239,229,0.6)', textTransform: 'none', letterSpacing: 0 }}>{fea.period}</span></p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '18px 0 20px' }}>
              {fea.features.map((f) => (
                <li key={f} className="flex items-start gap-2 mb-2" style={{ ...sans, fontSize: 13, color: '#EFE7D4' }}>
                  <CheckCircle size={15} style={{ color: '#D85A1C', flexShrink: 0, marginTop: 2 }} />{f}
                </li>
              ))}
            </ul>
            <button onClick={() => startCheckout('featured', false)} disabled={busy !== null || hasSub} style={btn(busy === 'featured')}>
              {busy === 'featured' ? 'Starting…' : 'Go Featured'}
            </button>
            <p style={{ ...sans, fontSize: 11, color: 'rgba(244,239,229,0.55)', marginTop: 10, lineHeight: 1.5 }}>
              <strong style={{ color: 'rgba(244,239,229,0.8)' }}>First charge today.</strong> {fea.renewalDisclosure} Cancel any time from your dashboard.
            </p>
          </div>
        </div>

        {error && <p style={{ ...sans, fontSize: 13, color: '#B03A1F', textAlign: 'center', marginTop: 20 }}>{error}</p>}

        <p style={{ ...sans, fontSize: 12, color: '#7C7A6E', textAlign: 'center', marginTop: 28, lineHeight: 1.6 }}>
          By starting a plan you authorize GunDog Exchange to charge your payment method on a recurring 30-day schedule at the listed price until you cancel.
          Cancel any time from Dashboard → Settings → Manage Billing; you keep access until the end of the period you&apos;ve paid for.
          Payments are processed securely by Stripe. See our <a href="/terms" style={{ color: '#D85A1C' }}>Terms</a>.
        </p>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return <Suspense fallback={null}><PricingInner /></Suspense>
}
