'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import { ALL_BREEDS, US_STATES } from '@/lib/mock-data'
import { CheckCircle } from 'lucide-react'

const inter: React.CSSProperties = {
  fontFamily: "'Inter', var(--font-inter), system-ui, sans-serif",
}

const montserrat: React.CSSProperties = {
  fontFamily: "'Montserrat', var(--font-montserrat), system-ui, sans-serif",
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

function InputLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block text-xs font-bold mb-1.5 uppercase tracking-wider"
      style={{ color: '#0E0E0E', ...inter }}
    >
      {children}
    </label>
  )
}

function FieldInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 text-sm outline-none"
      style={{
        border: '1px solid #D9C8A6',
        background: 'white',
        color: '#0E0E0E',
        ...inter,
      }}
    />
  )
}

function FieldSelect({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 text-sm outline-none"
      style={{
        border: '1px solid #D9C8A6',
        background: 'white',
        color: '#0E0E0E',
        ...inter,
      }}
    >
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
          <div
            className="w-16 h-16 flex items-center justify-center mx-auto mb-6"
            style={{ background: '#D4600A' }}
          >
            <CheckCircle size={32} style={{ color: 'white' }} />
          </div>
          <h1
            className="text-3xl font-black uppercase mb-3"
            style={{ ...montserrat, color: '#0E0E0E', letterSpacing: '-0.02em' }}
          >
            Listing Published!
          </h1>
          <p className="text-sm mb-8" style={{ color: '#7C7A6E', ...inter }}>
            Your listing for <strong>{form.name || form.breed}</strong> is now live. Buyers can see and contact you directly.
          </p>
          <a
            href="/dogs"
            className="inline-block text-sm font-bold px-8 py-4 text-white uppercase tracking-widest"
            style={{ background: '#D4600A', ...inter, letterSpacing: '0.1em' }}
          >
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
      <div className="px-6 py-12" style={{ background: '#0E0E0E', borderBottom: '2px solid #D4600A' }}>
        <div className="max-w-3xl mx-auto">
          <h1
            className="text-4xl font-black uppercase mb-2"
            style={{ ...montserrat, color: '#F4EFE5', letterSpacing: '-0.02em' }}
          >
            Post a Listing
          </h1>
          <p style={{ color: 'rgba(244,239,229,0.55)', ...inter }}>
            Reach thousands of serious hunters nationwide.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Step indicator */}
        <div className="flex items-center mb-10">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 flex items-center justify-center text-sm font-black"
                  style={{
                    ...montserrat,
                    background: i <= step ? '#D4600A' : '#EAE4D6',
                    color: i <= step ? 'white' : '#7C7A6E',
                  }}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <span
                  className="text-xs mt-1.5 text-center hidden sm:block"
                  style={{
                    color: i <= step ? '#D4600A' : '#7C7A6E',
                    fontWeight: i === step ? 700 : 400,
                    ...inter,
                  }}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 mx-2 mb-6"
                  style={{
                    height: 2,
                    background: i < step ? '#D4600A' : '#D9C8A6',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step panels */}
        <div className="p-8" style={{ background: 'white', border: '1px solid #D9C8A6' }}>
          {step === 0 && (
            <div className="space-y-5">
              <h2
                className="text-xl font-black uppercase mb-6"
                style={{ ...montserrat, color: '#0E0E0E' }}
              >
                Dog Info
              </h2>
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
              <h2
                className="text-xl font-black uppercase mb-6"
                style={{ ...montserrat, color: '#0E0E0E' }}
              >
                Details
              </h2>
              <div>
                <InputLabel>Description *</InputLabel>
                <textarea
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Describe the dog's training, temperament, hunting experience, lineage, etc."
                  rows={5}
                  className="w-full px-4 py-3 text-sm outline-none resize-none"
                  style={{
                    border: '1px solid #D9C8A6',
                    background: 'white',
                    color: '#0E0E0E',
                    ...inter,
                  }}
                />
              </div>
              <div>
                <InputLabel>Health Certifications</InputLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {HEALTH_CERT_OPTIONS.map((cert) => (
                    <label
                      key={cert}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                      style={{
                        border: `1px solid ${form.health_certs.includes(cert) ? '#D4600A' : '#D9C8A6'}`,
                        background: form.health_certs.includes(cert) ? '#FEF3C7' : 'white',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.health_certs.includes(cert)}
                        onChange={() => toggleCheck('health_certs', cert)}
                        style={{ accentColor: '#D4600A' }}
                      />
                      <span className="text-xs font-medium" style={{ color: '#0E0E0E', ...inter }}>
                        {cert}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <InputLabel>Hunt Titles</InputLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {HUNT_TITLE_OPTIONS.map((title) => (
                    <label
                      key={title}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                      style={{
                        border: `1px solid ${form.hunt_titles.includes(title) ? '#D4600A' : '#D9C8A6'}`,
                        background: form.hunt_titles.includes(title) ? '#DCFCE7' : 'white',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.hunt_titles.includes(title)}
                        onChange={() => toggleCheck('hunt_titles', title)}
                        style={{ accentColor: '#D4600A' }}
                      />
                      <span className="text-xs font-medium" style={{ color: '#0E0E0E', ...inter }}>
                        {title}
                      </span>
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
              <h2
                className="text-xl font-black uppercase mb-6"
                style={{ ...montserrat, color: '#0E0E0E' }}
              >
                Photos & Video
              </h2>
              {/* Photo upload placeholder */}
              <div>
                <InputLabel>Photos</InputLabel>
                <div
                  className="flex flex-col items-center justify-center py-16 mt-2"
                  style={{
                    border: '2px dashed #D9C8A6',
                    background: '#F4EFE5',
                    cursor: 'pointer',
                  }}
                >
                  <div className="text-4xl mb-3" style={{ opacity: 0.3 }}>📷</div>
                  <p
                    className="text-sm font-semibold mb-1"
                    style={{ color: '#0E0E0E', ...inter }}
                  >
                    Drop photos here or click to upload
                  </p>
                  <p className="text-xs" style={{ color: '#7C7A6E', ...inter }}>
                    Up to 10 photos · JPG, PNG · Max 5MB each
                  </p>
                  <p
                    className="text-xs mt-3 px-4 py-1.5"
                    style={{ background: '#D9C8A6', color: '#7C7A6E', ...inter }}
                  >
                    Photo upload coming soon — connect Supabase Storage to enable
                  </p>
                </div>
              </div>
              <div>
                <InputLabel>Video URL (optional)</InputLabel>
                <FieldInput
                  value={form.video_url}
                  onChange={(v) => update('video_url', v)}
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-xs mt-1" style={{ color: '#7C7A6E', ...inter }}>
                  YouTube, Vimeo, or any video link showing the dog in action
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2
                className="text-xl font-black uppercase mb-6"
                style={{ ...montserrat, color: '#0E0E0E' }}
              >
                Review & Publish
              </h2>
              <div className="space-y-4 mb-8">
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
                  <div
                    key={label}
                    className="flex gap-4 py-3"
                    style={{ borderBottom: '1px solid #EAE4D6' }}
                  >
                    <span
                      className="w-32 shrink-0 text-xs font-bold uppercase tracking-wider"
                      style={{ color: '#7C7A6E', ...inter }}
                    >
                      {label}
                    </span>
                    <span className="text-sm" style={{ color: '#0E0E0E', ...inter }}>
                      {value}
                    </span>
                  </div>
                ))}
                {form.description && (
                  <div className="py-3" style={{ borderBottom: '1px solid #EAE4D6' }}>
                    <span
                      className="block text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: '#7C7A6E', ...inter }}
                    >
                      Description
                    </span>
                    <p className="text-sm" style={{ color: '#0E0E0E', ...inter }}>
                      {form.description}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setPublished(true)}
                className="w-full py-4 text-sm font-bold uppercase tracking-widest text-white"
                style={{ background: '#D4600A', ...inter, letterSpacing: '0.1em', cursor: 'pointer', border: 'none' }}
              >
                Publish Listing →
              </button>
              <p className="text-xs text-center mt-3" style={{ color: '#7C7A6E', ...inter }}>
                Free listing — no credit card required
              </p>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-6 py-3 text-sm font-bold uppercase tracking-widest"
              style={{
                border: '1px solid #D9C8A6',
                color: '#0E0E0E',
                background: 'transparent',
                ...inter,
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
          ) : (
            <div />
          )}
          {step < STEPS.length - 1 && (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-8 py-3 text-sm font-bold uppercase tracking-widest text-white"
              style={{ background: '#D4600A', ...inter, letterSpacing: '0.08em', cursor: 'pointer', border: 'none' }}
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
