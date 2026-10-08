'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateMyProfile } from '../actions'

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

type Profile = {
  full_name?: string | null
  kennel_name?: string | null
  location_city?: string | null
  location_state?: string | null
  phone?: string | null
  website?: string | null
  bio?: string | null
  verified?: boolean | null
  verification_status?: string | null
  subscription_tier?: string | null
}

function Field({ label, name, defaultValue, placeholder, type = 'text' }: {
  label: string; name: string; defaultValue?: string | null; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label style={{ ...inter, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', display: 'block', marginBottom: 4 }}>{label}</label>
      <input name={name} type={type} defaultValue={defaultValue ?? ''} placeholder={placeholder} style={inputStyle} />
    </div>
  )
}

export default function ProfileForm({ profile, email }: { profile: Profile; email: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSaved(false)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await updateMyProfile(formData)
        setSaved(true)
        router.refresh()
      } catch (err) {
        setError((err as Error).message || 'Could not save profile.')
      }
    })
  }

  const tier = profile.subscription_tier ?? 'free'

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black uppercase mb-1" style={{ ...montserrat, color: '#0E0E0E', letterSpacing: '-0.02em' }}>
          Edit Profile
        </h1>
        <p className="text-sm" style={{ color: '#7C7A6E', ...inter }}>
          This is what buyers see on your listings. Keep it accurate.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" style={{ background: 'white', border: '1px solid #D9C8A6', padding: 24 }}>
        <div>
          <label style={{ ...inter, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', display: 'block', marginBottom: 4 }}>Account Email</label>
          <input value={email} disabled style={{ ...inputStyle, background: '#F4EFE5', color: '#7C7A6E' }} />
          <p style={{ ...inter, fontSize: 11, color: '#B0AEA4', marginTop: 4 }}>Change your email in Settings.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" name="full_name" defaultValue={profile.full_name} placeholder="Your name" />
          <Field label="Kennel Name" name="kennel_name" defaultValue={profile.kennel_name} placeholder="(optional)" />
          <Field label="City" name="location_city" defaultValue={profile.location_city} placeholder="Nixa" />
          <Field label="State" name="location_state" defaultValue={profile.location_state} placeholder="MO" />
          <Field label="Phone" name="phone" defaultValue={profile.phone} placeholder="(optional, shared with buyers you message)" type="tel" />
          <Field label="Website" name="website" defaultValue={profile.website} placeholder="https://" type="url" />
        </div>

        <div>
          <label style={{ ...inter, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', display: 'block', marginBottom: 4 }}>Bio</label>
          <textarea name="bio" defaultValue={profile.bio ?? ''} rows={4} placeholder="Tell buyers about your breeding program, hunting background, and what makes your dogs special." style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        <div className="flex items-center gap-4 pt-2" style={{ borderTop: '1px solid #EAE4D6' }}>
          <div className="pt-4">
            <span style={{ ...inter, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7C7A6E' }}>Plan:</span>
            <span style={{ ...inter, fontSize: 12, fontWeight: 700, color: '#D4600A', marginLeft: 6 }}>{tier === 'pro' ? 'Breeder Pro' : 'Free'}</span>
            <span style={{ ...inter, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7C7A6E', marginLeft: 16 }}>Verification:</span>
            <span style={{ ...inter, fontSize: 12, fontWeight: 700, color: profile.verified ? '#166534' : '#7C7A6E', marginLeft: 6 }}>{profile.verified ? 'Verified' : (profile.verification_status ?? 'Unverified')}</span>
          </div>
        </div>

        {error && <p style={{ ...inter, fontSize: 13, color: '#B03A1F' }}>{error}</p>}
        {saved && <p style={{ ...inter, fontSize: 13, color: '#166534' }}>Profile saved.</p>}

        <button type="submit" disabled={isPending} style={{ ...inter, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', background: isPending ? '#7C7A6E' : '#D4600A', color: 'white', border: 'none', padding: '12px 32px', cursor: isPending ? 'wait' : 'pointer' }}>
          {isPending ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
