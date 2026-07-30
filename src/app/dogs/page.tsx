'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  US_STATES,
  formatPrice,
  formatAge,
  TRAINING_LEVEL_LABELS,
  type TrainingLevel,
  type DogListing,
} from '@/lib/mock-data'

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
const serif: React.CSSProperties = {
  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
  fontStyle: 'italic',
  fontWeight: 500,
}
const SC: React.CSSProperties = {
  fontFamily: "var(--font-cormorant-sc), 'Cormorant SC', Georgia, serif",
  fontWeight: 500,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  fontStyle: 'normal',
}

// Brand colors
const BLAZE = '#D85A1C'
const INK = '#0F0F0E'
const BONE = '#EFE7D4'
const BONE_SOFT = '#F6F0E1'

const BREED_GROUPS: Record<string, string[]> = {
  POINTERS: ['English Pointer', 'German Shorthaired Pointer', 'Vizsla', 'Weimaraner', 'Brittany'],
  RETRIEVERS: ['Labrador Retriever', 'Golden Retriever', 'Chesapeake Bay Retriever', 'Flat-Coated Retriever'],
  SPANIELS: ['English Springer Spaniel', 'Boykin Spaniel', 'Cocker Spaniel', 'Clumber Spaniel'],
  VERSATILE: ['German Wirehaired Pointer', 'Wirehaired Pointing Griffon', 'Pudelpointer', 'Drahthaars'],
}

type PillFilter = 'ALL' | 'PUPS' | 'STARTED' | 'FINISHED' | 'TITLES' | 'POINTERS' | 'RETRIEVERS' | 'SPANIELS' | 'VERSATILE'

const PILLS: { label: string; value: PillFilter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pups', value: 'PUPS' },
  { label: 'Started', value: 'STARTED' },
  { label: 'Finished', value: 'FINISHED' },
  { label: 'Titles', value: 'TITLES' },
  { label: 'Pointers', value: 'POINTERS' },
  { label: 'Retrievers', value: 'RETRIEVERS' },
  { label: 'Spaniels', value: 'SPANIELS' },
  { label: 'Versatile', value: 'VERSATILE' },
]

const breedGroupKeys = new Set(Object.keys(BREED_GROUPS))

// Diagonal stripe photo placeholder pattern
const stripePhoto: React.CSSProperties = {
  background: `repeating-linear-gradient(
    -45deg,
    #171717 0px,
    #171717 10px,
    #1e1e1e 10px,
    #1e1e1e 20px
  )`,
}

export default function BrowsePage() {
  const [dogs, setDogs] = useState<DogListing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()
    ;(async () => {
      const { data, error } = await supabase
        .from('dogs')
        .select('id,title,breed,age_months,gender,training_level,price,location_state,location_city,description,health_certs,hunt_titles,images,status,featured,seller_id,created_at')
        .eq('status', 'active')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
      if (cancelled) return
      if (error || !data) {
        console.error('[BrowsePage] failed to load dogs', error)
        setDogs([])
      } else {
        setDogs(data.map((d) => ({
          ...d,
          seller: { id: d.seller_id, full_name: '', location_state: d.location_state, rating: 0, review_count: 0, verified: false, breeder_pro: false },
        }) as unknown as DogListing))
      }
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  const [search, setSearch] = useState('')
  const [activePill, setActivePill] = useState<PillFilter>('ALL')
  const [stateFilter, setStateFilter] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const filtered = useMemo(() => {
    return dogs.filter((dog) => {
      if (search) {
        const s = search.toLowerCase()
        if (
          !dog.title.toLowerCase().includes(s) &&
          !dog.breed.toLowerCase().includes(s) &&
          !dog.location_city.toLowerCase().includes(s)
        ) return false
      }
      if (activePill === 'PUPS' && dog.training_level !== 'puppy') return false
      if (activePill === 'STARTED' && dog.training_level !== 'started') return false
      if (activePill === 'FINISHED' && dog.training_level !== 'finished') return false
      if (activePill === 'TITLES' && dog.hunt_titles.length === 0) return false
      if (breedGroupKeys.has(activePill) && !BREED_GROUPS[activePill]?.includes(dog.breed)) return false
      if (stateFilter && dog.location_state !== stateFilter) return false
      if (genderFilter && dog.gender !== genderFilter) return false
      if (minPrice && dog.price < parseInt(minPrice) * 100) return false
      if (maxPrice && dog.price > parseInt(maxPrice) * 100) return false
      return true
    })
  }, [dogs, search, activePill, stateFilter, genderFilter, minPrice, maxPrice])

  const hasActiveFilters = search || activePill !== 'ALL' || stateFilter || genderFilter || minPrice || maxPrice

  const inputStyle: React.CSSProperties = {
    border: '1px solid rgba(239,231,212,0.1)',
    background: 'rgba(255,255,255,0.03)',
    color: BONE,
    outline: 'none',
    ...sans,
    fontSize: 13,
    fontWeight: 400,
    padding: '9px 12px',
  }

  return (
    <div style={{ background: INK, minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div style={{ ...SC, fontSize: 10, color: 'rgba(239,231,212,0.28)', marginBottom: 16 }}>
          GunDog · Exchange
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <h1 style={{ ...display, fontSize: 'clamp(38px, 6vw, 68px)', color: BONE }}>
            {dogs.length.toLocaleString()} Dogs{' '}
            <span style={{ color: BLAZE }}>Listed.</span>
          </h1>
          <p style={{ ...serif, fontSize: 15, color: 'rgba(239,231,212,0.28)', paddingBottom: 6 }}>
            Sorted by week of listing — fresh first
          </p>
        </div>

        {/* Pill filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6" style={{ scrollbarWidth: 'none' }}>
          {PILLS.map((pill) => {
            const active = activePill === pill.value
            return (
              <button
                key={pill.value}
                onClick={() => setActivePill(pill.value)}
                style={{
                  ...sans,
                  fontWeight: 700,
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '7px 18px',
                  background: active ? BLAZE : 'transparent',
                  color: active ? 'white' : 'rgba(239,231,212,0.4)',
                  border: active ? `1px solid ${BLAZE}` : '1px solid rgba(239,231,212,0.1)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {pill.label}
              </button>
            )
          })}
        </div>

        {/* Secondary filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1" style={{ minWidth: 200, maxWidth: 360 }}>
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(239,231,212,0.22)' }} />
            <input
              type="text"
              placeholder="Search breed, name, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, width: '100%', paddingLeft: 36, paddingRight: 14 }}
            />
          </div>
          <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} style={inputStyle}>
            <option value="">All States</option>
            {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} style={inputStyle}>
            <option value="">Any Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <input type="number" placeholder="Min $" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={{ ...inputStyle, width: 90 }} />
          <input type="number" placeholder="Max $" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ ...inputStyle, width: 90 }} />
          {hasActiveFilters && (
            <button
              onClick={() => { setSearch(''); setActivePill('ALL'); setStateFilter(''); setGenderFilter(''); setMinPrice(''); setMaxPrice('') }}
              style={{ ...sans, fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(239,231,212,0.25)', background: 'none', border: 'none', cursor: 'pointer', padding: '9px 4px' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Divider + count */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <div style={{ height: 1, background: 'rgba(239,231,212,0.06)', marginBottom: 14 }} />
        <p style={{ ...sans, fontWeight: 400, color: 'rgba(239,231,212,0.25)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {filtered.length === 0 ? (
          <div className="p-16 text-center" style={{ border: '1px solid rgba(239,231,212,0.06)' }}>
            <p style={{ ...display, fontSize: 24, color: BONE, marginBottom: 8 }}>No Dogs Found</p>
            <p style={{ ...sans, fontWeight: 400, color: 'rgba(239,231,212,0.35)', fontSize: 15 }}>Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((dog) => {
              const badgeLabel = [
                TRAINING_LEVEL_LABELS[dog.training_level as TrainingLevel],
                dog.hunt_titles.length > 0 ? 'Titled' : '',
              ].filter(Boolean).join(' · ')

              return (
                <Link href={`/dogs/${dog.id}`} key={dog.id} className="block" style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#141414', border: '1px solid rgba(239,231,212,0.07)', display: 'flex', flexDirection: 'column' }}>

                    {/* Photo area — diagonal stripe placeholder */}
                    <div style={{ ...stripePhoto, height: 280, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {/* Training badge — top left */}
                      <div style={{ position: 'absolute', top: 14, left: 14 }}>
                        <span style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', background: BLAZE, color: 'white', padding: '5px 12px' }}>
                          {badgeLabel}
                        </span>
                      </div>

                      {/* GDX circle — top right */}
                      <div style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, border: '1px solid rgba(239,231,212,0.18)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ ...sans, fontWeight: 700, fontSize: 8, letterSpacing: '0.05em', color: 'rgba(239,231,212,0.35)' }}>GDX</span>
                      </div>

                      {/* Photo placeholder text */}
                      <span style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(239,231,212,0.12)' }}>
                        Dog Portrait
                      </span>
                    </div>

                    {/* Card content */}
                    <div style={{ padding: '20px 20px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {/* Breed · gender · age */}
                      <p style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: BLAZE, marginBottom: 10 }}>
                        {dog.breed} · {dog.gender === 'male' ? 'Male' : 'Female'} · {formatAge(dog.age_months)}
                      </p>

                      {/* Dog name — Cormorant italic */}
                      <h3 style={{ ...serif, fontSize: 28, color: BONE_SOFT, lineHeight: 1.05, marginBottom: 10 }}>
                        {dog.title}
                      </h3>

                      {/* Description — Cormorant italic, truncated */}
                      <p style={{ ...serif, fontWeight: 400, fontSize: 15, color: 'rgba(246,240,225,0.45)', lineHeight: 1.55, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {dog.description}
                      </p>

                      {/* Divider */}
                      <div style={{ height: 1, background: 'rgba(239,231,212,0.07)', marginBottom: 14 }} />

                      {/* Bottom row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <p style={{ ...sans, fontWeight: 600, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(239,231,212,0.3)', marginBottom: 4 }}>
                            {dog.seller.kennel_name || dog.seller.full_name} · {dog.location_state}
                          </p>
                          <div style={{ ...display, fontSize: 24, color: BONE_SOFT, lineHeight: 1 }}>
                            {formatPrice(dog.price)}
                          </div>
                        </div>
                        <div style={{ background: BLAZE, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          <span style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'white' }}>Inquire →</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
