'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'
import { ALL_BREEDS, US_STATES } from '@/lib/mock-data'
import { PLANS, listingCap, photoCap, videoCap, effectiveTier, type PlanId } from '@/lib/plans'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, X } from 'lucide-react'

const MAX_PHOTOS = 10
const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const MAX_DOCS = 10
const MAX_DOC_BYTES = 10 * 1024 * 1024
const DOC_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

const display: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '-0.02em',
  lineHeight: 0.92,
}
const sans: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
}
const SC: React.CSSProperties = {
  fontFamily: "var(--font-cormorant-sc), 'Cormorant SC', Georgia, serif",
  fontWeight: 500,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontStyle: 'normal',
}

const STEPS = ['Dog Info', 'Details', 'Media', 'Review & Publish']

const HEALTH_CERT_OPTIONS = [
  'No health testing performed',
  'OFA Hip - Excellent',
  'OFA Hip - Good',
  'OFA Hip - Fair',
  'CAER Eye Exam - Clear',
  'DNA Panel - Clear',
  'Cardiac Exam - Normal',
  'Elbow OFA - Normal',
  'PennHIP',
  'Vet Health Cert',
  'Thyroid - Normal',
]

const HUNT_TITLE_OPTIONS = [
  'AKC Junior Hunter (JH)',
  'AKC Senior Hunter (SH)',
  'AKC Master Hunter (MH)',
  'NAVHDA Natural Ability - Prize I',
  'NAVHDA Natural Ability - Prize II',
  'NAVHDA Natural Ability - Prize III',
  'NAVHDA Utility Test - Prize I',
  'NAVHDA Utility Test - Prize II',
  'HRC Started',
  'HRC Seasoned',
  'HRC Finished',
  'NSTRA Champion',
  'NSTRA Open Champion',
  'AKC Field Champion',
  'AKC Amateur Field Champion',
]

const REGISTRATION_OPTIONS = [
  'AKC Registered — Full',
  'AKC Registered — Limited',
  'UKC Registered',
  'FDSB Registered',
  'CKC Registered',
  'NAVHDA Registered',
  'GSPCA Registered',
  'ABC (American Brittany Club) Registered',
  'ARC (American Retriever Club) Registered',
  'Papers Pending',
  'Sire/Dam Both Registered',
]

interface PedigreeData {
  sire_name: string
  dam_name: string
  reg_number: string
  reg_org: string
  sire_sire_name: string
  sire_dam_name: string
  dam_sire_name: string
  dam_dam_name: string
}

interface FormData {
  breed: string
  name: string
  age_months: string
  gender: string
  training_level: string
  price: string
  description: string
  health_certs: string[]
  health_cert_other: string
  hunt_titles: string[]
  hunt_title_other: string
  registrations: string[]
  registration_other: string
  location_state: string
  location_city: string
  video_url: string
  images: string[]
  documents: { name: string; url: string }[]
  pedigree_url: string
  pedigree: PedigreeData
}

const defaultPedigree: PedigreeData = {
  sire_name: '',
  dam_name: '',
  reg_number: '',
  reg_org: '',
  sire_sire_name: '',
  sire_dam_name: '',
  dam_sire_name: '',
  dam_dam_name: '',
}

const defaultForm: FormData = {
  breed: '',
  name: '',
  age_months: '',
  gender: '',
  training_level: '',
  price: '',
  description: '',
  health_certs: [],
  health_cert_other: '',
  hunt_titles: [],
  hunt_title_other: '',
  registrations: [],
  registration_other: '',
  location_state: '',
  location_city: '',
  video_url: '',
  images: [],
  documents: [],
  pedigree_url: '',
  pedigree: { ...defaultPedigree },
}

const fieldStyle: React.CSSProperties = {
  border: '1px solid #D9C8A6',
  background: 'white',
  color: '#0F0F0E',
  outline: 'none',
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
  fontWeight: 400,
  fontSize: 16,
}

function InputLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif", fontWeight: 700, fontSize: 9, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#0F0F0E', display: 'block', marginBottom: 6 }}>
      {children}
    </label>
  )
}

function FieldInput({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 outline-none"
      style={fieldStyle}
    />
  )
}

function FieldSelect({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-4 py-3 outline-none" style={fieldStyle}>
      {children}
    </select>
  )
}

export default function SellPage() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [published, setPublished] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userTier, setUserTier] = useState<PlanId>('free')
  const [tierLoaded, setTierLoaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)
  const pedigreeInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const planMaxPhotos = PLANS[userTier].maxPhotos
  const planMaxVideos = PLANS[userTier].maxVideos

  // Load user's subscription tier on mount
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !mounted) { setTierLoaded(true); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status')
        .eq('id', user.id)
        .maybeSingle()
      if (mounted && profile) {
        setUserTier(effectiveTier(profile.subscription_tier, profile.subscription_status))
      }
      if (mounted) setTierLoaded(true)
    })()
    return () => { mounted = false }
  }, [supabase])

  function update(key: keyof FormData, value: string | string[]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updatePedigree(key: keyof PedigreeData, value: string) {
    setForm((prev) => ({ ...prev, pedigree: { ...prev.pedigree, [key]: value } }))
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in to upload photos.')
      return
    }
    const slotsLeft = planMaxPhotos - form.images.length
    if (slotsLeft <= 0) {
      setError(`Your ${PLANS[userTier].name} plan allows ${planMaxPhotos} photo${planMaxPhotos === 1 ? '' : 's'} per listing. Upgrade for more.`)
      return
    }
    const incoming = Array.from(files).slice(0, slotsLeft)
    if (files.length > slotsLeft) {
      setError(`Only ${slotsLeft} photo slot${slotsLeft === 1 ? '' : 's'} left (${planMaxPhotos} max on ${PLANS[userTier].name} plan).`)
    }
    setUploading(true)
    try {
      const uploadedUrls: string[] = []
      for (const file of incoming) {
        if (file.size > MAX_PHOTO_BYTES) {
          setError(`"${file.name}" is over 5 MB — skipped.`)
          continue
        }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          setError(`"${file.name}" isn't a JPG, PNG, or WEBP — skipped.`)
          continue
        }
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('dog-photos')
          .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type })
        if (upErr) {
          setError(`Upload failed: ${upErr.message}`)
          continue
        }
        const { data: pub } = supabase.storage.from('dog-photos').getPublicUrl(path)
        uploadedUrls.push(pub.publicUrl)
      }
      setForm((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function removeImage(url: string) {
    setForm((prev) => ({ ...prev, images: prev.images.filter((u) => u !== url) }))
  }

  async function uploadOne(
    file: File,
    bucket: 'dog-photos' | 'dog-documents',
    userId: string,
  ): Promise<string | null> {
    const ext = file.name.split('.').pop() || 'bin'
    const path = `${userId}/${crypto.randomUUID()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type })
    if (upErr) {
      setError(`Upload failed: ${upErr.message}`)
      return null
    }
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path)
    return pub.publicUrl
  }

  async function handleDocs(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('You must be logged in to upload paperwork.'); return }
    const slotsLeft = MAX_DOCS - form.documents.length
    const incoming = Array.from(files).slice(0, slotsLeft)
    if (files.length > slotsLeft) setError(`Only ${slotsLeft} paperwork slot${slotsLeft === 1 ? '' : 's'} left (10 max).`)
    setUploading(true)
    try {
      const uploaded: { name: string; url: string }[] = []
      for (const file of incoming) {
        if (file.size > MAX_DOC_BYTES) { setError(`"${file.name}" is over 10 MB — skipped.`); continue }
        if (!DOC_MIME_TYPES.includes(file.type)) { setError(`"${file.name}" must be PDF, JPG, PNG, or WEBP — skipped.`); continue }
        const url = await uploadOne(file, 'dog-documents', user.id)
        if (url) uploaded.push({ name: file.name, url })
      }
      setForm((prev) => ({ ...prev, documents: [...prev.documents, ...uploaded] }))
    } finally {
      setUploading(false)
      if (docInputRef.current) docInputRef.current.value = ''
    }
  }

  function removeDoc(url: string) {
    setForm((prev) => ({ ...prev, documents: prev.documents.filter((d) => d.url !== url) }))
  }

  async function handlePedigree(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    const file = files[0]
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('You must be logged in to upload a pedigree.'); return }
    if (file.size > MAX_DOC_BYTES) { setError(`Pedigree file is over 10 MB.`); return }
    if (!DOC_MIME_TYPES.includes(file.type)) { setError(`Pedigree must be PDF, JPG, PNG, or WEBP.`); return }
    setUploading(true)
    try {
      const url = await uploadOne(file, 'dog-documents', user.id)
      if (url) setForm((prev) => ({ ...prev, pedigree_url: url }))
    } finally {
      setUploading(false)
      if (pedigreeInputRef.current) pedigreeInputRef.current.value = ''
    }
  }

  function removePedigree() {
    setForm((prev) => ({ ...prev, pedigree_url: '' }))
  }

  async function handlePublish() {
    setError(null)
    setPublishing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in to publish a listing.')
        router.push('/login')
        return
      }
      // Look up plan + count active listings to enforce tier cap
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status')
        .eq('id', user.id)
        .maybeSingle()
      const subActive = profile?.subscription_status === 'active' || profile?.subscription_status === 'trialing'
      const cap = listingCap(profile?.subscription_tier, subActive)
      const { count: activeCount } = await supabase
        .from('dogs')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', user.id)
        .eq('status', 'active')
      if ((activeCount ?? 0) >= cap) {
        const resolved = effectiveTier(profile?.subscription_tier, profile?.subscription_status)
        const planName = PLANS[resolved].name
        setError(`Your ${planName} plan allows ${cap} active listing${cap === 1 ? '' : 's'}. Upgrade at /upgrade for more.`)
        return
      }

      // Enforce photo/video limits server-side
      const resolved = effectiveTier(profile?.subscription_tier, profile?.subscription_status)
      const maxPhotosAllowed = PLANS[resolved].maxPhotos
      const maxVideosAllowed = PLANS[resolved].maxVideos
      const clampedImages = form.images.slice(0, maxPhotosAllowed)

      // Video enforcement: strip video_url if plan doesn't allow videos
      const videoUrl = maxVideosAllowed > 0 ? (form.video_url || null) : null

      // Free-tier listings expire after 14 days
      const listingDuration = PLANS[resolved].listingDurationDays
      const expiresAt = listingDuration
        ? new Date(Date.now() + listingDuration * 24 * 60 * 60 * 1000).toISOString()
        : null

      const priceCents = Math.round(parseFloat(form.price || '0') * 100)
      const ageMonths = form.age_months ? parseInt(form.age_months, 10) : null
      const title = form.name ? `${form.name} — ${form.breed}` : form.breed
      const hasPedigree = Object.values(form.pedigree).some((v) => v.trim() !== '')
      const { error: insertErr } = await supabase.from('dogs').insert({
        seller_id: user.id,
        title,
        breed: form.breed,
        age_months: ageMonths,
        gender: form.gender || null,
        training_level: form.training_level,
        price: priceCents,
        location_state: form.location_state || null,
        location_city: form.location_city || null,
        description: form.description || null,
        health_certs: [...form.health_certs, ...splitOther(form.health_cert_other)],
        hunt_titles: [...form.hunt_titles, ...splitOther(form.hunt_title_other)],
        registrations: [...form.registrations, ...splitOther(form.registration_other)],
        images: clampedImages,
        documents: form.documents,
        pedigree_url: form.pedigree_url || null,
        pedigree: hasPedigree ? form.pedigree : {},
        video_url: videoUrl,
        listing_expires_at: expiresAt,
        status: 'active',
        featured: subActive && (profile?.subscription_tier === 'kennel'),
      })
      if (insertErr) {
        setError(`Publish failed: ${insertErr.message}`)
        return
      }
      setPublished(true)
    } finally {
      setPublishing(false)
    }
  }

  function toggleCheck(key: 'health_certs' | 'hunt_titles' | 'registrations', val: string) {
    setForm((prev) => {
      const arr = prev[key] as string[]
      return {
        ...prev,
        [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val],
      }
    })
  }

  // Split comma-separated "other" field into array of trimmed non-empty strings
  function splitOther(raw: string): string[] {
    return raw.split(',').map((s) => s.trim()).filter(Boolean)
  }

  if (published) {
    return (
      <div style={{ background: '#EFE7D4', minHeight: '100vh' }}>
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-24 text-center">
          <div style={{ width: 64, height: 64, background: '#D85A1C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={32} style={{ color: 'white' }} />
          </div>
          <h1 style={{ ...display, fontSize: 28, color: '#0F0F0E', marginBottom: 12 }}>Listing Published</h1>
          <p style={{ ...sans, fontWeight: 400, fontSize: 17, color: '#7C7A6E', marginBottom: 32, lineHeight: 1.6 }}>
            Your listing for <strong>{form.name || form.breed}</strong> is now live. Buyers can see and contact you directly.
          </p>
          <a href="/dogs" style={{ ...sans, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', background: '#D85A1C', color: 'white', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }}>
            Browse All Dogs
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#EFE7D4', minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <div className="px-6 py-12" style={{ background: '#0F0F0E', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-3xl mx-auto">
          <div style={{ ...SC, fontSize: 10, color: 'rgba(244,239,229,0.55)', marginBottom: 12 }}>New Listing</div>
          <h1 style={{ ...display, fontSize: 40, color: '#EFE7D4', marginBottom: 8 }}>Post a Listing</h1>
          <p style={{ ...sans, fontWeight: 400, fontSize: 16, color: 'rgba(244,239,229,0.55)' }}>Reach thousands of serious hunters nationwide.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Step indicator */}
        <div className="flex items-center mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div style={{
                  width: 32, height: 32,
                  background: i <= step ? '#D85A1C' : '#EFE7D4',
                  color: i <= step ? 'white' : '#7C7A6E',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  ...sans, fontWeight: 700, fontSize: 11,
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="mt-1.5 text-center hidden sm:block" style={{ ...sans, fontWeight: 700, fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em', color: i <= step ? '#D85A1C' : '#7C7A6E' }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-2 mb-6" style={{ height: 1, background: i < step ? '#D85A1C' : '#D9C8A6' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step panels */}
        <div className="p-8" style={{ background: 'white', border: '1px solid #D9C8A6' }}>
          {step === 0 && (
            <div className="space-y-5">
              <h2 style={{ ...sans, fontWeight: 800, fontSize: 22, textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#0F0F0E', marginBottom: 20 }}>Dog Info</h2>
              <div>
                <InputLabel>Breed *</InputLabel>
                <FieldSelect value={form.breed} onChange={(v) => update('breed', v)}>
                  <option value="">Select a breed</option>
                  {ALL_BREEDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </FieldSelect>
              </div>
              <div>
                <InputLabel>Dog&apos;s Name</InputLabel>
                <FieldInput value={form.name} onChange={(v) => update('name', v)} placeholder="e.g. Duke" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <InputLabel>Age (months) *</InputLabel>
                  <FieldInput
                    type="number"
                    value={form.age_months}
                    onChange={(v) => update('age_months', v)}
                    placeholder="e.g. 24"
                  />
                </div>
                <div>
                  <InputLabel>Gender *</InputLabel>
                  <FieldSelect value={form.gender} onChange={(v) => update('gender', v)}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </FieldSelect>
                </div>
              </div>
              <div>
                <InputLabel>Training Level *</InputLabel>
                <FieldSelect value={form.training_level} onChange={(v) => update('training_level', v)}>
                  <option value="">Select level</option>
                  <option value="puppy">Puppy (untrained)</option>
                  <option value="started">Started (basic obedience + bird intro)</option>
                  <option value="finished">Finished (fully trained)</option>
                  <option value="brood">Brood (breeding stock)</option>
                </FieldSelect>
              </div>
              <div>
                <InputLabel>Asking Price (USD) *</InputLabel>
                <FieldInput
                  type="number"
                  value={form.price}
                  onChange={(v) => update('price', v)}
                  placeholder="e.g. 3500"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 style={{ ...sans, fontWeight: 800, fontSize: 22, textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#0F0F0E', marginBottom: 20 }}>Details</h2>
              <div>
                <InputLabel>Description *</InputLabel>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Describe the dog's training, temperament, hunting experience, lineage, etc."
                  rows={5}
                  className="w-full px-4 py-3 outline-none resize-none"
                  style={{ border: '1px solid #D9C8A6', background: 'white', color: '#0F0F0E', fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif", fontWeight: 400, fontSize: 16 }}
                />
              </div>
              <div>
                <h3 style={{ ...sans, fontWeight: 800, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0F0F0E', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #D85A1C' }}>Paperwork & Registrations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {REGISTRATION_OPTIONS.map((reg) => (
                    <label key={reg} className="flex items-center gap-3 px-4 py-3 cursor-pointer" style={{ border: `1px solid ${form.registrations.includes(reg) ? '#D85A1C' : '#D9C8A6'}`, background: form.registrations.includes(reg) ? '#FEF3C7' : 'white' }}>
                      <input type="checkbox" checked={form.registrations.includes(reg)} onChange={() => toggleCheck('registrations', reg)} style={{ accentColor: '#D85A1C' }} />
                      <span style={{ ...sans, fontWeight: 400, fontSize: 14, color: '#0F0F0E' }}>{reg}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3">
                  <InputLabel>Other registrations</InputLabel>
                  <FieldInput value={form.registration_other} onChange={(v) => update('registration_other', v)} placeholder="e.g. PHR Registered, custom kennel club (separate multiple with commas)" />
                </div>
              </div>

              <div>
                <h3 style={{ ...sans, fontWeight: 800, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0F0F0E', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #D85A1C' }}>Health Certifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {HEALTH_CERT_OPTIONS.map((cert) => (
                    <label key={cert} className="flex items-center gap-3 px-4 py-3 cursor-pointer" style={{ border: `1px solid ${form.health_certs.includes(cert) ? '#D85A1C' : '#D9C8A6'}`, background: form.health_certs.includes(cert) ? '#FEF3C7' : 'white' }}>
                      <input type="checkbox" checked={form.health_certs.includes(cert)} onChange={() => toggleCheck('health_certs', cert)} style={{ accentColor: '#D85A1C' }} />
                      <span style={{ ...sans, fontWeight: 400, fontSize: 14, color: '#0F0F0E' }}>{cert}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3">
                  <InputLabel>Other health certifications</InputLabel>
                  <FieldInput value={form.health_cert_other} onChange={(v) => update('health_cert_other', v)} placeholder="e.g. BAER Hearing - Normal, custom health screen (separate multiple with commas)" />
                </div>
              </div>

              <div>
                <h3 style={{ ...sans, fontWeight: 800, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0F0F0E', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #D85A1C' }}>Hunt Titles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {HUNT_TITLE_OPTIONS.map((title) => (
                    <label key={title} className="flex items-center gap-3 px-4 py-3 cursor-pointer" style={{ border: `1px solid ${form.hunt_titles.includes(title) ? '#D85A1C' : '#D9C8A6'}`, background: form.hunt_titles.includes(title) ? '#FEF3C7' : 'white' }}>
                      <input type="checkbox" checked={form.hunt_titles.includes(title)} onChange={() => toggleCheck('hunt_titles', title)} style={{ accentColor: '#D85A1C' }} />
                      <span style={{ ...sans, fontWeight: 400, fontSize: 14, color: '#0F0F0E' }}>{title}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3">
                  <InputLabel>Other hunt titles</InputLabel>
                  <FieldInput value={form.hunt_title_other} onChange={(v) => update('hunt_title_other', v)} placeholder="e.g. UKC HR, custom trial placement (separate multiple with commas)" />
                </div>
              </div>
              <div>
                <h3 style={{ ...sans, fontWeight: 800, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0F0F0E', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #D85A1C' }}>Pedigree</h3>
                <p style={{ ...sans, fontWeight: 400, fontSize: 14, color: '#7C7A6E', marginBottom: 12 }}>
                  Optional — add lineage details to help serious buyers evaluate bloodlines.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <InputLabel>Sire (Father)</InputLabel>
                    <FieldInput value={form.pedigree.sire_name} onChange={(v) => updatePedigree('sire_name', v)} placeholder="e.g. FC AFC Lean Mac" />
                  </div>
                  <div>
                    <InputLabel>Dam (Mother)</InputLabel>
                    <FieldInput value={form.pedigree.dam_name} onChange={(v) => updatePedigree('dam_name', v)} placeholder="e.g. Trumarc's Zip Code MH" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <InputLabel>Registration Number</InputLabel>
                    <FieldInput value={form.pedigree.reg_number} onChange={(v) => updatePedigree('reg_number', v)} placeholder="e.g. SR12345678" />
                  </div>
                  <div>
                    <InputLabel>Registration Organization</InputLabel>
                    <FieldSelect value={form.pedigree.reg_org} onChange={(v) => updatePedigree('reg_org', v)}>
                      <option value="">Select org</option>
                      <option value="AKC">AKC</option>
                      <option value="FDSB">FDSB</option>
                      <option value="UKC">UKC</option>
                      <option value="NAVHDA">NAVHDA</option>
                      <option value="CKC">CKC</option>
                      <option value="Other">Other</option>
                    </FieldSelect>
                  </div>
                </div>
                <p style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', marginBottom: 8, marginTop: 16 }}>Grandparents (optional)</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <InputLabel>Sire&apos;s Sire</InputLabel>
                    <FieldInput value={form.pedigree.sire_sire_name} onChange={(v) => updatePedigree('sire_sire_name', v)} placeholder="Paternal grandsire" />
                  </div>
                  <div>
                    <InputLabel>Sire&apos;s Dam</InputLabel>
                    <FieldInput value={form.pedigree.sire_dam_name} onChange={(v) => updatePedigree('sire_dam_name', v)} placeholder="Paternal granddam" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <InputLabel>Dam&apos;s Sire</InputLabel>
                    <FieldInput value={form.pedigree.dam_sire_name} onChange={(v) => updatePedigree('dam_sire_name', v)} placeholder="Maternal grandsire" />
                  </div>
                  <div>
                    <InputLabel>Dam&apos;s Dam</InputLabel>
                    <FieldInput value={form.pedigree.dam_dam_name} onChange={(v) => updatePedigree('dam_dam_name', v)} placeholder="Maternal granddam" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <InputLabel>State *</InputLabel>
                  <FieldSelect value={form.location_state} onChange={(v) => update('location_state', v)}>
                    <option value="">Select state</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </FieldSelect>
                </div>
                <div>
                  <InputLabel>City</InputLabel>
                  <FieldInput value={form.location_city} onChange={(v) => update('location_city', v)} placeholder="e.g. Minneapolis" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 style={{ ...sans, fontWeight: 800, fontSize: 22, textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#0F0F0E', marginBottom: 20 }}>Photos &amp; Video</h2>
              <div>
                <InputLabel>Photos</InputLabel>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                  style={{ display: 'none' }}
                />
                <div
                  onClick={() => !uploading && form.images.length < planMaxPhotos && fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault() }}
                  onDrop={(e) => { e.preventDefault(); if (!uploading) handleFiles(e.dataTransfer.files) }}
                  className="flex flex-col items-center justify-center py-16 mt-2"
                  style={{ border: '2px dashed #D9C8A6', background: '#EFE7D4', cursor: uploading || form.images.length >= planMaxPhotos ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}
                >
                  <div style={{ fontSize: 36, opacity: 0.25, marginBottom: 12 }}>📷</div>
                  <p style={{ ...sans, fontWeight: 400, fontSize: 16, color: '#0F0F0E', marginBottom: 4 }}>
                    {uploading ? 'Uploading…' : form.images.length >= planMaxPhotos ? 'Photo limit reached' : 'Drop photos here or click to upload'}
                  </p>
                  <p style={{ ...sans, fontWeight: 400, fontSize: 14, color: '#7C7A6E' }}>
                    Up to {planMaxPhotos} photo{planMaxPhotos === 1 ? '' : 's'} · JPG, PNG, WEBP · Max 5MB each · {form.images.length}/{planMaxPhotos} added
                  </p>
                  {planMaxPhotos < 20 && (
                    <p style={{ ...sans, fontWeight: 400, fontSize: 12, color: '#D85A1C', marginTop: 6 }}>
                      {PLANS[userTier].name} plan — <a href="/upgrade" style={{ color: '#D85A1C', textDecoration: 'underline' }}>upgrade for more photos</a>
                    </p>
                  )}
                </div>
                {error && step === 2 && (
                  <p style={{ ...sans, fontWeight: 400, fontSize: 13, color: '#B03A1F', marginTop: 8 }}>{error}</p>
                )}
                {form.images.length > 0 && (
                  <div className="grid grid-cols-5 gap-3 mt-4">
                    {form.images.map((url) => (
                      <div key={url} style={{ position: 'relative', aspectRatio: '1 / 1', overflow: 'hidden', border: '1px solid #D9C8A6' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="Dog photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => removeImage(url)}
                          aria-label="Remove photo"
                          style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(15,15,14,0.85)', color: 'white', border: 'none', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <InputLabel>Video URL {planMaxVideos > 0 ? '(optional)' : ''}</InputLabel>
                {planMaxVideos > 0 ? (
                  <>
                    <FieldInput value={form.video_url} onChange={(v) => update('video_url', v)} placeholder="https://youtube.com/watch?v=..." />
                    <p style={{ ...sans, fontWeight: 400, fontSize: 14, color: '#7C7A6E', marginTop: 6 }}>
                      YouTube, Vimeo, or any video link showing the dog in action
                      {userTier === 'kennel' ? ` — up to ${planMaxVideos} videos per listing` : ''}
                    </p>
                  </>
                ) : (
                  <div className="px-4 py-4 mt-2" style={{ background: '#EFE7D4', border: '1px solid #D9C8A6' }}>
                    <p style={{ ...sans, fontWeight: 400, fontSize: 14, color: '#7C7A6E' }}>
                      Video uploads are available on Pro ($24.99/mo) and Kennel Elite ($59.99/mo) plans.
                    </p>
                    <a href="/upgrade" style={{ ...sans, fontWeight: 700, fontSize: 12, color: '#D85A1C', textDecoration: 'underline', display: 'inline-block', marginTop: 6 }}>Upgrade to add video</a>
                  </div>
                )}
              </div>

              <div>
                <h3 style={{ ...sans, fontWeight: 800, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0F0F0E', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #D85A1C' }}>Paperwork</h3>
                <p style={{ ...sans, fontWeight: 400, fontSize: 14, color: '#7C7A6E', marginBottom: 12 }}>
                  Upload scanned or photographed papers: AKC/UKC registration, health cert docs, vet records, etc. Buyers see these on the listing to verify what you claim above.
                </p>
                <input
                  ref={docInputRef}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => handleDocs(e.target.files)}
                  style={{ display: 'none' }}
                />
                <div
                  onClick={() => !uploading && form.documents.length < MAX_DOCS && docInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault() }}
                  onDrop={(e) => { e.preventDefault(); if (!uploading) handleDocs(e.dataTransfer.files) }}
                  className="flex flex-col items-center justify-center py-12"
                  style={{ border: '2px dashed #D9C8A6', background: '#EFE7D4', cursor: uploading || form.documents.length >= MAX_DOCS ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}
                >
                  <div style={{ fontSize: 32, opacity: 0.25, marginBottom: 10 }}>📄</div>
                  <p style={{ ...sans, fontWeight: 400, fontSize: 16, color: '#0F0F0E', marginBottom: 4 }}>
                    {uploading ? 'Uploading…' : form.documents.length >= MAX_DOCS ? 'Paperwork limit reached' : 'Drop paperwork here or click to upload'}
                  </p>
                  <p style={{ ...sans, fontWeight: 400, fontSize: 14, color: '#7C7A6E' }}>
                    Up to {MAX_DOCS} files · PDF, JPG, PNG, WEBP · Max 10MB each · {form.documents.length}/{MAX_DOCS} added
                  </p>
                </div>
                {form.documents.length > 0 && (
                  <ul style={{ listStyle: 'none', padding: 0, marginTop: 12 }}>
                    {form.documents.map((doc) => (
                      <li key={doc.url} className="flex items-center gap-3 px-4 py-3" style={{ border: '1px solid #D9C8A6', background: 'white', marginBottom: 6 }}>
                        <span style={{ fontSize: 18 }}>📄</span>
                        <a href={doc.url} target="_blank" rel="noopener" style={{ ...sans, fontWeight: 400, fontSize: 14, color: '#0F0F0E', textDecoration: 'underline', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</a>
                        <button
                          type="button"
                          onClick={() => removeDoc(doc.url)}
                          aria-label="Remove paperwork"
                          style={{ background: 'transparent', color: '#7C7A6E', border: 'none', cursor: 'pointer', padding: 4 }}
                        >
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <h3 style={{ ...sans, fontWeight: 800, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0F0F0E', marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid #D85A1C' }}>Pedigree</h3>
                <p style={{ ...sans, fontWeight: 400, fontSize: 14, color: '#7C7A6E', marginBottom: 12 }}>
                  Upload the dog's pedigree chart (5-generation is standard). A clean pedigree is often the single most valued document for serious buyers.
                </p>
                <input
                  ref={pedigreeInputRef}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) => handlePedigree(e.target.files)}
                  style={{ display: 'none' }}
                />
                {form.pedigree_url ? (
                  <div className="flex items-center gap-3 px-4 py-4" style={{ border: '1px solid #D85A1C', background: '#FEF3C7' }}>
                    <span style={{ fontSize: 22 }}>🐕</span>
                    <a href={form.pedigree_url} target="_blank" rel="noopener" style={{ ...sans, fontWeight: 700, fontSize: 14, color: '#0F0F0E', textDecoration: 'underline', flex: 1 }}>Pedigree uploaded — view</a>
                    <button
                      type="button"
                      onClick={() => pedigreeInputRef.current?.click()}
                      style={{ ...sans, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0F0F0E', background: 'transparent', border: '1px solid #D9C8A6', padding: '6px 12px', cursor: 'pointer' }}
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={removePedigree}
                      aria-label="Remove pedigree"
                      style={{ background: 'transparent', color: '#7C7A6E', border: 'none', cursor: 'pointer', padding: 4 }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => !uploading && pedigreeInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault() }}
                    onDrop={(e) => { e.preventDefault(); if (!uploading) handlePedigree(e.dataTransfer.files) }}
                    className="flex flex-col items-center justify-center py-12"
                    style={{ border: '2px dashed #D9C8A6', background: '#EFE7D4', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}
                  >
                    <div style={{ fontSize: 32, opacity: 0.25, marginBottom: 10 }}>🐕</div>
                    <p style={{ ...sans, fontWeight: 400, fontSize: 16, color: '#0F0F0E', marginBottom: 4 }}>
                      {uploading ? 'Uploading…' : 'Drop pedigree here or click to upload'}
                    </p>
                    <p style={{ ...sans, fontWeight: 400, fontSize: 14, color: '#7C7A6E' }}>
                      One file · PDF, JPG, PNG, WEBP · Max 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ ...sans, fontWeight: 800, fontSize: 22, textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#0F0F0E', marginBottom: 20 }}>Review &amp; Publish</h2>
              <div className="mb-8">
                {[
                  { label: 'Breed', value: form.breed },
                  { label: 'Age', value: form.age_months ? `${form.age_months} months` : '—' },
                  { label: 'Gender', value: form.gender || '—' },
                  { label: 'Training Level', value: form.training_level || '—' },
                  { label: 'Price', value: form.price ? `$${parseInt(form.price).toLocaleString()}` : '—' },
                  { label: 'Location', value: [form.location_city, form.location_state].filter(Boolean).join(', ') || '—' },
                  { label: 'Registrations', value: [...form.registrations, ...splitOther(form.registration_other)].join(', ') || 'None' },
                  { label: 'Health Certs', value: [...form.health_certs, ...splitOther(form.health_cert_other)].join(', ') || 'None' },
                  { label: 'Hunt Titles', value: [...form.hunt_titles, ...splitOther(form.hunt_title_other)].join(', ') || 'None' },
                  { label: 'Paperwork Files', value: form.documents.length > 0 ? `${form.documents.length} file${form.documents.length === 1 ? '' : 's'} attached` : 'None' },
                  { label: 'Pedigree Doc', value: form.pedigree_url ? 'Uploaded' : 'Not uploaded' },
                  { label: 'Sire', value: form.pedigree.sire_name || '—' },
                  { label: 'Dam', value: form.pedigree.dam_name || '—' },
                  { label: 'Reg #', value: form.pedigree.reg_number ? `${form.pedigree.reg_number}${form.pedigree.reg_org ? ` (${form.pedigree.reg_org})` : ''}` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-4 py-3" style={{ borderBottom: '1px solid #EFE7D4' }}>
                    <span style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', width: 120, flexShrink: 0 }}>{label}</span>
                    <span style={{ ...sans, fontWeight: 400, fontSize: 15, color: '#0F0F0E' }}>{value}</span>
                  </div>
                ))}
                {form.description && (
                  <div className="py-3" style={{ borderBottom: '1px solid #EFE7D4' }}>
                    <span style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', display: 'block', marginBottom: 8 }}>Description</span>
                    <p style={{ ...sans, fontWeight: 400, fontSize: 15, color: '#0F0F0E', lineHeight: 1.6 }}>{form.description}</p>
                  </div>
                )}
              </div>

              {error && (
                <p style={{ ...sans, fontWeight: 400, fontSize: 13, color: '#B03A1F', textAlign: 'center', marginBottom: 12 }}>{error}</p>
              )}
              <button
                onClick={handlePublish}
                disabled={publishing || !form.breed || !form.training_level || !form.price}
                className="w-full py-4"
                style={{ background: publishing || !form.breed || !form.training_level || !form.price ? '#7C7A6E' : '#D85A1C', ...sans, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'white', cursor: publishing ? 'wait' : 'pointer', border: 'none' }}
              >
                {publishing ? 'Publishing…' : 'Publish Listing →'}
              </button>
              <p style={{ ...sans, fontWeight: 400, fontSize: 13, color: '#7C7A6E', textAlign: 'center', marginTop: 12 }}>
                {userTier === 'free'
                  ? 'Free listing — active for 14 days, no credit card required'
                  : `${PLANS[userTier].name} plan — listing active while subscribed`}
              </p>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6">
          {step > 0 ? (
            <button onClick={() => setStep((s) => s - 1)} className="px-6 py-3" style={{ border: '1px solid #D9C8A6', ...sans, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0F0F0E', background: 'transparent', cursor: 'pointer' }}>
              ← Back
            </button>
          ) : <div />}
          {step < STEPS.length - 1 && (
            <button onClick={() => setStep((s) => s + 1)} className="px-8 py-3" style={{ background: '#D85A1C', ...sans, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'white', cursor: 'pointer', border: 'none' }}>
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
