'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateMyListing, deleteMyListing, setMyListingStatus } from '../../actions'

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
const labelStyle: React.CSSProperties = {
  ...inter, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', display: 'block', marginBottom: 4,
}

type Dog = {
  id: string
  title: string | null
  breed: string | null
  age_months: number | null
  gender: string | null
  training_level: string | null
  price: number | null
  location_state: string | null
  location_city: string | null
  description: string | null
  status: string | null
  video_url: string | null
  pedigree_url: string | null
}

export default function EditListingForm({ dog }: { dog: Dog }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMsg(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await updateMyListing(dog.id, formData)
        setMsg({ ok: true, text: 'Listing saved.' })
        router.refresh()
      } catch (err) {
        setMsg({ ok: false, text: (err as Error).message || 'Could not save listing.' })
      }
    })
  }

  function markSold() {
    setMsg(null)
    startTransition(async () => {
      try {
        await setMyListingStatus(dog.id, 'sold')
        setMsg({ ok: true, text: 'Marked as sold.' })
        router.refresh()
      } catch (err) {
        setMsg({ ok: false, text: (err as Error).message })
      }
    })
  }

  function reactivate() {
    setMsg(null)
    startTransition(async () => {
      try {
        await setMyListingStatus(dog.id, 'active')
        setMsg({ ok: true, text: 'Listing reactivated.' })
        router.refresh()
      } catch (err) {
        setMsg({ ok: false, text: (err as Error).message })
      }
    })
  }

  function handleDelete() {
    if (!confirm('Delete this listing permanently? This cannot be undone.')) return
    startTransition(async () => {
      try {
        await deleteMyListing(dog.id)
        router.push('/dashboard')
        router.refresh()
      } catch (err) {
        setMsg({ ok: false, text: (err as Error).message })
      }
    })
  }

  const priceDollars = dog.price != null ? (dog.price / 100).toString() : ''
  const ageYearsDefault = dog.age_months != null ? Math.floor(dog.age_months / 12).toString() : ''
  const ageMonthsRemDefault = dog.age_months != null ? (dog.age_months % 12).toString() : ''

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black uppercase" style={{ ...montserrat, color: '#0E0E0E', letterSpacing: '-0.02em' }}>
          Edit Listing
        </h1>
        <span style={{ ...inter, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 10px', background: dog.status === 'active' ? '#DCFCE7' : dog.status === 'sold' ? '#EFE7D4' : '#FEF3C7', color: dog.status === 'active' ? '#166534' : '#7C7A6E' }}>
          {dog.status}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" style={{ background: 'white', border: '1px solid #D9C8A6', padding: 24 }}>
        <div>
          <label style={labelStyle}>Title</label>
          <input name="title" defaultValue={dog.title ?? ''} style={inputStyle} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Breed</label>
            <input name="breed" defaultValue={dog.breed ?? ''} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Training Level</label>
            <select name="training_level" defaultValue={dog.training_level ?? 'started'} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="puppy">Puppy / Prospect</option>
              <option value="started">Started</option>
              <option value="finished">Finished</option>
              <option value="brood">Broodstock</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Age</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <div style={{ ...inter, fontWeight: 700, fontSize: 9, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#7C7A6E', marginBottom: 3 }}>Years</div>
                <select name="age_years" defaultValue={ageYearsDefault} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">—</option>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i} value={String(i)}>{i}</option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ ...inter, fontWeight: 700, fontSize: 9, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#7C7A6E', marginBottom: 3 }}>Months</div>
                <select name="age_months_rem" defaultValue={ageMonthsRemDefault} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">—</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={String(i)}>{i}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Gender</label>
            <select name="gender" defaultValue={dog.gender ?? 'male'} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Price (USD)</label>
            <input name="price" type="number" min="0" step="1" defaultValue={priceDollars} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select name="status" defaultValue={dog.status ?? 'active'} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>City</label>
            <input name="location_city" defaultValue={dog.location_city ?? ''} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>State</label>
            <input name="location_state" defaultValue={dog.location_state ?? ''} style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea name="description" defaultValue={dog.description ?? ''} rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={labelStyle}>Video URL</label>
            <input name="video_url" type="url" defaultValue={dog.video_url ?? ''} placeholder="https://" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Pedigree URL</label>
            <input name="pedigree_url" type="url" defaultValue={dog.pedigree_url ?? ''} placeholder="https://" style={inputStyle} />
          </div>
        </div>

        {msg && <p style={{ ...inter, fontSize: 13, color: msg.ok ? '#166534' : '#B03A1F' }}>{msg.text}</p>}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button type="submit" disabled={isPending} style={{ ...inter, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', background: isPending ? '#7C7A6E' : '#D4600A', color: 'white', border: 'none', padding: '12px 32px', cursor: isPending ? 'wait' : 'pointer' }}>
            {isPending ? 'Saving…' : 'Save Changes'}
          </button>
          {dog.status === 'sold' ? (
            <button type="button" onClick={reactivate} disabled={isPending} style={{ ...inter, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'transparent', color: '#166534', border: '1px solid #166534', padding: '12px 20px', cursor: 'pointer' }}>
              Reactivate
            </button>
          ) : (
            <button type="button" onClick={markSold} disabled={isPending} style={{ ...inter, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'transparent', color: '#7C7A6E', border: '1px solid #D9C8A6', padding: '12px 20px', cursor: 'pointer' }}>
              Mark Sold
            </button>
          )}
          <button type="button" onClick={handleDelete} disabled={isPending} style={{ ...inter, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'transparent', color: '#B03A1F', border: '1px solid #B03A1F', padding: '12px 20px', cursor: 'pointer', marginLeft: 'auto' }}>
            Delete
          </button>
        </div>
      </form>
    </div>
  )
}
