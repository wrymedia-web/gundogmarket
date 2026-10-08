'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const montserrat: React.CSSProperties = {
  fontFamily: "'Montserrat', var(--font-montserrat), system-ui, sans-serif",
}
const inter: React.CSSProperties = {
  fontFamily: "'Inter', var(--font-inter), system-ui, sans-serif",
}
const inputStyle: React.CSSProperties = {
  ...inter, fontSize: 14, color: '#0E0E0E', width: '100%',
  padding: '10px 12px', border: '1px solid #D9C8A6', background: 'white', outline: 'none',
}
const card: React.CSSProperties = { background: 'white', border: '1px solid #D9C8A6', padding: 24 }
const sectionTitle: React.CSSProperties = {
  ...montserrat, fontWeight: 900, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.02em', color: '#0E0E0E', marginBottom: 12,
}

export default function SettingsClient({ email, tier, status, periodEnd, cancelAt, hasBilling }: {
  email: string; tier: string; status: string | null
  periodEnd: string | null; cancelAt: string | null; hasBilling: boolean
}) {
  const [portalBusy, setPortalBusy] = useState(false)
  const [portalErr, setPortalErr] = useState<string | null>(null)
  async function openPortal() {
    setPortalBusy(true); setPortalErr(null)
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const json = await res.json()
      if (!res.ok || !json.url) { setPortalErr(json.error || 'Billing portal unavailable.'); return }
      window.location.href = json.url
    } finally { setPortalBusy(false) }
  }
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [pwBusy, setPwBusy] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwMsg(null)
    if (password.length < 8) { setPwMsg({ ok: false, text: 'Password must be at least 8 characters.' }); return }
    if (password !== confirm) { setPwMsg({ ok: false, text: 'Passwords do not match.' }); return }
    setPwBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setPwBusy(false)
    if (error) { setPwMsg({ ok: false, text: error.message }); return }
    setPassword(''); setConfirm('')
    setPwMsg({ ok: true, text: 'Password updated.' })
  }

  async function signOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase mb-1" style={{ ...montserrat, color: '#0E0E0E', letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p className="text-sm" style={{ color: '#7C7A6E', ...inter }}>Manage your account and subscription.</p>
      </div>

      {/* Account */}
      <div style={{ ...card, marginBottom: 20 }}>
        <h2 style={sectionTitle}>Account</h2>
        <label style={{ ...inter, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', display: 'block', marginBottom: 4 }}>Email</label>
        <input value={email} disabled style={{ ...inputStyle, background: '#F4EFE5', color: '#7C7A6E' }} />
        <Link href="/dashboard/profile" style={{ ...inter, fontSize: 13, fontWeight: 600, color: '#D4600A', textDecoration: 'none', display: 'inline-block', marginTop: 12 }}>
          Edit public profile →
        </Link>
      </div>

      {/* Subscription */}
      <div style={{ ...card, marginBottom: 20 }}>
        <h2 style={sectionTitle}>Subscription</h2>
        {(() => {
          const names: Record<string, string> = { standard: 'Standard — $29/30 days', featured: 'Featured — $49/30 days', pro: 'Breeder Pro (legacy)', free: 'No plan' }
          const active = status === 'active' || status === 'trialing' || status === 'past_due'
          const planLabel = active ? (names[tier] ?? tier) : 'No active plan'
          return (
            <>
              <p style={{ ...inter, fontSize: 14, color: '#0E0E0E' }}>
                Current plan: <span style={{ fontWeight: 700, color: '#D4600A' }}>{planLabel}</span>
                {status === 'trialing' && <span style={{ color: '#92400E' }}> — free trial</span>}
                {status === 'past_due' && <span style={{ color: '#B03A1F' }}> — payment issue, update your card</span>}
              </p>
              {active && periodEnd && (
                <p style={{ ...inter, fontSize: 13, color: '#7C7A6E', marginTop: 6 }}>
                  {cancelAt
                    ? <>Cancels on <strong>{new Date(cancelAt).toLocaleDateString()}</strong> — you keep full access until then. No further charges.</>
                    : status === 'trialing'
                      ? <>Trial converts to the $29 Standard plan on <strong>{new Date(periodEnd).toLocaleDateString()}</strong> unless canceled before then.</>
                      : <>Renews on <strong>{new Date(periodEnd).toLocaleDateString()}</strong>.</>}
                </p>
              )}
              <div className="flex gap-3 mt-3 flex-wrap">
                {hasBilling && active && (
                  <button onClick={openPortal} disabled={portalBusy} style={{ ...inter, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', background: '#D4600A', color: 'white', border: 'none', padding: '10px 24px', cursor: portalBusy ? 'wait' : 'pointer' }}>
                    {portalBusy ? 'Opening…' : 'Manage Billing'}
                  </button>
                )}
                {!active && (
                  <Link href="/pricing" className="inline-block" style={{ ...inter, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', background: '#D4600A', color: 'white', padding: '10px 24px', textDecoration: 'none' }}>
                    Choose a Plan
                  </Link>
                )}
                {active && tier === 'standard' && (
                  <Link href="/pricing" className="inline-block" style={{ ...inter, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'transparent', color: '#D4600A', border: '1px solid #D4600A', padding: '10px 24px', textDecoration: 'none' }}>
                    See Featured Perks
                  </Link>
                )}
              </div>
              {hasBilling && active && (
                <p style={{ ...inter, fontSize: 11, color: '#7C7A6E', marginTop: 8 }}>
                  Upgrade, downgrade, update your card, or cancel in Manage Billing. Cancellations keep access until the end of the paid period.
                </p>
              )}
              {portalErr && <p style={{ ...inter, fontSize: 12, color: '#B03A1F', marginTop: 8 }}>{portalErr}</p>}
            </>
          )
        })()}
      </div>

      {/* Password */}
      <div style={{ ...card, marginBottom: 20 }}>
        <h2 style={sectionTitle}>Change Password</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label style={{ ...inter, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', display: 'block', marginBottom: 4 }}>New Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
          </div>
          <div>
            <label style={{ ...inter, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', display: 'block', marginBottom: 4 }}>Confirm New Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" style={inputStyle} />
          </div>
          {pwMsg && <p style={{ ...inter, fontSize: 13, color: pwMsg.ok ? '#166534' : '#B03A1F' }}>{pwMsg.text}</p>}
          <button type="submit" disabled={pwBusy} style={{ ...inter, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', background: pwBusy ? '#7C7A6E' : '#D4600A', color: 'white', border: 'none', padding: '12px 32px', cursor: pwBusy ? 'wait' : 'pointer' }}>
            {pwBusy ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Sign out */}
      <div style={card}>
        <h2 style={sectionTitle}>Session</h2>
        <button onClick={signOut} disabled={signingOut} style={{ ...inter, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'transparent', color: '#B03A1F', border: '1px solid #B03A1F', padding: '12px 24px', cursor: signingOut ? 'wait' : 'pointer' }}>
          {signingOut ? 'Signing out…' : 'Sign Out'}
        </button>
      </div>
    </div>
  )
}
