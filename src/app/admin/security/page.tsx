'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const sans: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
}
const card: React.CSSProperties = { background: 'white', border: '1px solid #D9C8A6', padding: 24, maxWidth: 560 }

type Factor = { id: string; status: string; friendly_name?: string | null }

export default function AdminSecurityPage() {
  const supabase = createClient()
  const router = useRouter()
  const [factors, setFactors] = useState<Factor[]>([])
  const [enrolling, setEnrolling] = useState<{ id: string; qr: string; secret: string } | null>(null)
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors()
    setFactors((data?.totp ?? []) as Factor[])
  }, [supabase])

  useEffect(() => { load() }, [load])

  async function startEnroll() {
    setMsg(null); setBusy(true)
    // Clean up any stale unverified enrollments first
    const { data } = await supabase.auth.mfa.listFactors()
    for (const f of (data?.all ?? []).filter((f) => f.status === 'unverified')) {
      await supabase.auth.mfa.unenroll({ factorId: f.id })
    }
    const { data: enr, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Authenticator app' })
    setBusy(false)
    if (error) { setMsg({ ok: false, text: error.message }); return }
    setEnrolling({ id: enr.id, qr: enr.totp.qr_code, secret: enr.totp.secret })
  }

  async function confirmEnroll(e: React.FormEvent) {
    e.preventDefault()
    if (!enrolling) return
    setBusy(true); setMsg(null)
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: enrolling.id })
    if (chErr) { setBusy(false); setMsg({ ok: false, text: chErr.message }); return }
    const { error } = await supabase.auth.mfa.verify({ factorId: enrolling.id, challengeId: ch.id, code: code.trim() })
    setBusy(false)
    if (error) { setMsg({ ok: false, text: error.message }); return }
    setMsg({ ok: true, text: 'MFA enabled. Redirecting to the dashboard…' })
    setEnrolling(null); setCode('')
    await supabase.auth.getSession()
    setTimeout(() => { window.location.assign('/admin') }, 800)
  }

  const verified = factors.filter((f) => f.status === 'verified')

  return (
    <div>
      <h1 style={{ ...sans, fontWeight: 900, fontSize: 24, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#0F0F0E', marginBottom: 4 }}>Security — MFA</h1>
      <p style={{ ...sans, fontSize: 13, color: '#7C7A6E', marginBottom: 24 }}>
        Admin access requires two-factor authentication with an authenticator app (Google Authenticator, 1Password, Authy…).
      </p>

      {verified.length === 0 && !enrolling && (
        <div style={card}>
          <p style={{ ...sans, fontSize: 14, color: '#B03A1F', fontWeight: 700, marginBottom: 12 }}>
            MFA is not set up yet. The admin dashboard is locked until you enroll.
          </p>
          <button onClick={startEnroll} disabled={busy} style={{ ...sans, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', background: '#D85A1C', color: 'white', border: 'none', padding: '12px 32px', cursor: 'pointer' }}>
            {busy ? 'Starting…' : 'Set Up Authenticator'}
          </button>
        </div>
      )}

      {enrolling && (
        <div style={card}>
          <p style={{ ...sans, fontSize: 14, fontWeight: 700, marginBottom: 12 }}>1. Scan this QR code with your authenticator app</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enrolling.qr} alt="MFA QR code" style={{ width: 180, height: 180, border: '1px solid #D9C8A6' }} />
          <p style={{ ...sans, fontSize: 12, color: '#7C7A6E', margin: '10px 0' }}>
            Or enter the secret manually: <code style={{ fontSize: 11, background: '#F4EFE5', padding: '2px 6px' }}>{enrolling.secret}</code>
          </p>
          <form onSubmit={confirmEnroll}>
            <p style={{ ...sans, fontSize: 14, fontWeight: 700, margin: '16px 0 8px' }}>2. Enter the 6-digit code</p>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                style={{ ...sans, fontSize: 18, letterSpacing: '0.2em', width: 140, padding: '10px 12px', border: '1px solid #D9C8A6', outline: 'none' }}
              />
              <button type="submit" disabled={busy || code.length !== 6} style={{ ...sans, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', background: busy ? '#7C7A6E' : '#D85A1C', color: 'white', border: 'none', padding: '0 24px', cursor: 'pointer' }}>
                {busy ? 'Verifying…' : 'Verify & Enable'}
              </button>
            </div>
          </form>
        </div>
      )}

      {verified.length > 0 && !enrolling && (
        <div style={card}>
          <p style={{ ...sans, fontSize: 14, color: '#166534', fontWeight: 700, marginBottom: 8 }}>✓ MFA is enabled on this account.</p>
          <p style={{ ...sans, fontSize: 12, color: '#7C7A6E' }}>
            {verified.length} authenticator factor{verified.length === 1 ? '' : 's'} enrolled. To replace a device, enroll from the device you're replacing it with, then contact a super admin to remove the old factor if needed.
          </p>
        </div>
      )}

      {msg && <p style={{ ...sans, fontSize: 13, color: msg.ok ? '#166534' : '#B03A1F', marginTop: 16 }}>{msg.text}</p>}
    </div>
  )
}
