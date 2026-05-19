'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import { ALL_BREEDS, US_STATES } from '@/lib/mock-data'
import { CheckCircle } from 'lucide-react'

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

interface FormData {
  breed: string
  name: string
  age_months: string
  gender: string
  training_level: string
  price: string
  description: string
  health_certs: string[]
  hunt_titles: string[]
  location_state: string
  location_city: string
  video_url: string
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
  hunt_titles: [],
  location_state: '',
  location_city: '',
  video_url: '',
}

const fieldStyle: React.CSSProperties = {
  border: '1px solid #D9C8A6',
  background: 'white',
  color: '#0E0E0E',
  outline: 'none',
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
  fontWeight: 400,
  fontSize: 16,
}

function InputLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif", fontWeight: 700, fontSize: 9, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: '#0E0E0E', display: 'block', marginBottom: 6 }}>
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

  function update(key: keyof FormData, value: string | string[]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleCheck(key: 'health_certs' | 'hunt_titles', val: string) {
    setForm((prev) => {
      const arr = prev[key] as string[]
      return {
        ...prev,
        [key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val],
      }
    })
  }

  if (published) {
    return (
      <div style={{ background: '#F4EFE5', minHeight: '100vh' }}>
        <Navbar />
        <div className="max-w-xl mx-auto px-6 py-24 text-center">
          <div style={{ width: 64, height: 64, background: '#D4600A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={32} style={{ color: 'white' }} />
          </div>
          <h1 style={{ ...display, fontSize: 28, color: '#0E0E0E', marginBottom: 12 }}>Listing Published</h1>
          <p style={{ ...sans, fontWeight: 400, fontSize: 17, color: '#7C7A6E', marginBottom: 32, lineHeight: 1.6 }}>
            Your listing for <strong>{form.name || form.breed}</strong> is now live. Buyers can see and contact you directly.
          </p>
          <a href="/dogs" style={{ ...sans, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', background: '#D4600A', color: 'white', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }}>
            Browse All Dogs
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#F4EFE5', minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <div className="px-6 py-12" style={{ background: '#0E0E0E', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-3xl mx-auto">
          <div style={{ ...SC, fontSize: 10, color: 'rgba(244,239,229,0.55)', marginBottom: 12 }}>New Listing</div>
          <h1 style={{ ...display, fontSize: 40, color: '#F4EFE5', marginBottom: 8 }}>Post a Listing</h1>
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
                  background: i <= step ? '#D4600A' : '#EAE4D6',
                  color: i <= step ? 'white' : '#7C7A6E',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  ...sans, fontWeight: 700, fontSize: 11,
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="mt-1.5 text-center hidden sm:block" style={{ ...sans, fontWeight: 700, fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em', color: i <= step ? '#D4600A' : '#7C7A6E' }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-2 mb-6" style={{ height: 1, background: i < step ? '#D4600A' : '#D9C8A6' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step panels */}
        <div className="p-8" style={{ background: 'white', border: '1px solid #D9C8A6' }}>
          {step === 0 && (
            <div className="space-y-5">
              <h2 style={{ ...sans, fontWeight: 800, fontSize: 22, textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#0E0E0E', marginBottom: 20 }}>Dog Info</h2>
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
              <h2 style={{ ...sans, fontWeight: 800, fontSize: 22, textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#0E0E0E', marginBottom: 20 }}>Details</h2>
              <div>
                <InputLabel>Description *</InputLabel>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Describe the dog's training, temperament, hunting experience, lineage, etc."
                  rows={5}
                  className="w-full px-4 py-3 outline-none resize-none"
                  style={{ border: '1px solid #D9C8A6', background: 'white', color: '#0E0E0E', fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif", fontWeight: 400, fontSize: 16 }}
                />
              </div>
              <div>
                <InputLabel>Health Certifications</InputLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {HEALTH_CERT_OPTIONS.map((cert) => (
                    <label key={cert} className="flex items-center gap-3 px-4 py-3 cursor-pointer" style={{ border: `1px solid ${form.health_certs.includes(cert) ? '#D4600A' : '#D9C8A6'}`, background: form.health_certs.includes(cert) ? '#FEF3C7' : 'white' }}>
                      <input type="checkbox" checked={form.health_certs.includes(cert)} onChange={() => toggleCheck('health_certs', cert)} style={{ accentColor: '#D4600A' }} />
                      <span style={{ ...sans, fontWeight: 400, fontSize: 14, color: '#0E0E0E' }}>{cert}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <InputLabel>Hunt Titles</InputLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {HUNT_TITLE_OPTIONS.map((title) => (
                    <label key={title} className="flex items-center gap-3 px-4 py-3 cursor-pointer" style={{ border: `1px solid ${form.hunt_titles.includes(title) ? '#D4600A' : '#D9C8A6'}`, background: form.hunt_titles.includes(title) ? '#FEF3C7' : 'white' }}>
                      <input type="checkbox" checked={form.hunt_titles.includes(title)} onChange={() => toggleCheck('hunt_titles', title)} style={{ accentColor: '#D4600A' }} />
                      <span style={{ ...sans, fontWeight: 400, fontSize: 14, color: '#0E0E0E' }}>{title}</span>
                    </label>
                  ))}
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
              <h2 style={{ ...sans, fontWeight: 800, fontSize: 22, textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#0E0E0E', marginBottom: 20 }}>Photos &amp; Video</h2>
              <div>
                <InputLabel>Photos</InputLabel>
                <div className="flex flex-col items-center justify-center py-16 mt-2" style={{ border: '2px dashed #D9C8A6', background: '#F4EFE5', cursor: 'pointer' }}>
                  <div style={{ fontSize: 36, opacity: 0.25, marginBottom: 12 }}>📷</div>
                  <p style={{ ...sans, fontWeight: 400, fontSize: 16, color: '#0E0E0E', marginBottom: 4 }}>Drop photos here or click to upload</p>
                  <p style={{ ...sans, fontWeight: 400, fontSize: 14, color: '#7C7A6E' }}>Up to 10 photos · JPG, PNG · Max 5MB each</p>
                  <p style={{ ...sans, fontWeight: 400, fontSize: 9, color: '#7C7A6E', marginTop: 12, padding: '4px 12px', background: '#D9C8A6' }}>
                    Photo upload coming soon
                  </p>
                </div>
              </div>
              <div>
                <InputLabel>Video URL (optional)</InputLabel>
                <FieldInput value={form.video_url} onChange={(v) => update('video_url', v)} placeholder="https://youtube.com/watch?v=..." />
                <p style={{ ...sans, fontWeight: 400, fontSize: 14, color: '#7C7A6E', marginTop: 6 }}>YouTube, Vimeo, or any video link showing the dog in action</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ ...sans, fontWeight: 800, fontSize: 22, textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#0E0E0E', marginBottom: 20 }}>Review &amp; Publish</h2>
              <div className="mb-8">
                {[
                  { label: 'Breed', value: form.breed },
                  { label: 'Age', value: form.age_months ? `${form.age_months} months` : '—' },
                  { label: 'Gender', value: form.gender || '—' },
                  { label: 'Training Level', value: form.training_level || '—' },
                  { label: 'Price', value: form.price ? `$${parseInt(form.price).toLocaleString()}` : '—' },
                  { label: 'Location', value: [form.location_city, form.location_state].filter(Boolean).join(', ') || '—' },
                  { label: 'Health Certs', value: form.health_certs.length > 0 ? form.health_certs.join(', ') : 'None selected' },
                  { label: 'Hunt Titles', value: form.hunt_titles.length > 0 ? form.hunt_titles.join(', ') : 'None selected' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-4 py-3" style={{ borderBottom: '1px solid #EAE4D6' }}>
                    <span style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', width: 120, flexShrink: 0 }}>{label}</span>
                    <span style={{ ...sans, fontWeight: 400, fontSize: 15, color: '#0E0E0E' }}>{value}</span>
                  </div>
                ))}
                {form.description && (
                  <div className="py-3" style={{ borderBottom: '1px solid #EAE4D6' }}>
                    <span style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', display: 'block', marginBottom: 8 }}>Description</span>
                    <p style={{ ...sans, fontWeight: 400, fontSize: 15, color: '#0E0E0E', lineHeight: 1.6 }}>{form.description}</p>
                  </div>
                )}
              </div>

              <button onClick={() => setPublished(true)} className="w-full py-4" style={{ background: '#D4600A', ...sans, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'white', cursor: 'pointer', border: 'none' }}>
                Publish Listing →
              </button>
              <p style={{ ...sans, fontWeight: 400, fontSize: 13, color: '#7C7A6E', textAlign: 'center', marginTop: 12 }}>Free listing — no credit card required</p>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6">
          {step > 0 ? (
            <button onClick={() => setStep((s) => s - 1)} className="px-6 py-3" style={{ border: '1px solid #D9C8A6', ...sans, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0E0E0E', background: 'transparent', cursor: 'pointer' }}>
              ← Back
            </button>
          ) : <div />}
          {step < STEPS.length - 1 && (
            <button onClick={() => setStep((s) => s + 1)} className="px-8 py-3" style={{ background: '#D4600A', ...sans, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'white', cursor: 'pointer', border: 'none' }}>
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
