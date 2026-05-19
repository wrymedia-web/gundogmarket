'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/components/navbar'
import { Search, MapPin, Star, ShieldCheck } from 'lucide-react'
import {
  MOCK_DOGS,
  ALL_BREEDS,
  US_STATES,
  formatPrice,
  formatAge,
  TRAINING_LEVEL_LABELS,
  TRAINING_LEVEL_COLORS,
  type TrainingLevel,
} from '@/lib/mock-data'

const SC: React.CSSProperties = {
  fontFamily: "var(--font-cormorant-sc), 'Cormorant SC', Georgia, serif",
  fontWeight: 500,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  fontStyle: 'normal',
}

const serif: React.CSSProperties = {
  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
  fontStyle: 'italic',
  fontWeight: 500,
}

const body: React.CSSProperties = {
  fontFamily: "var(--font-eb-garamond), 'EB Garamond', Georgia, serif",
  fontWeight: 400,
}

const fieldInput: React.CSSProperties = {
  border: '1px solid rgba(184,137,63,0.3)',
  background: '#F6F0E1',
  color: '#1C2418',
  outline: 'none',
  ...body,
}

export default function BrowsePage() {
  const [search, setSearch] = useState('')
  const [breedFilter, setBreedFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const filtered = useMemo(() => {
    return MOCK_DOGS.filter((dog) => {
      if (search) {
        const s = search.toLowerCase()
        if (
          !dog.title.toLowerCase().includes(s) &&
          !dog.breed.toLowerCase().includes(s) &&
          !dog.location_city.toLowerCase().includes(s)
        ) return false
      }
      if (breedFilter && dog.breed !== breedFilter) return false
      if (levelFilter && dog.training_level !== levelFilter) return false
      if (stateFilter && dog.location_state !== stateFilter) return false
      if (genderFilter && dog.gender !== genderFilter) return false
      if (minPrice && dog.price < parseInt(minPrice) * 100) return false
      if (maxPrice && dog.price > parseInt(maxPrice) * 100) return false
      return true
    })
  }, [search, breedFilter, levelFilter, stateFilter, genderFilter, minPrice, maxPrice])

  return (
    <div style={{ background: '#EFE7D4', minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <div className="px-6 py-12" style={{ background: '#1C2418', borderBottom: '1px solid rgba(184,137,63,0.3)' }}>
        <div className="max-w-7xl mx-auto">
          <div style={{ ...SC, fontSize: 10, color: '#8B6A2E', marginBottom: 12 }}>Browse Listings</div>
          <h1 style={{ ...serif, fontSize: 44, color: '#EFE7D4', marginBottom: 8 }}>All Dogs</h1>
          <p style={{ ...body, color: 'rgba(239,231,212,0.55)', fontSize: 16 }}>
            {MOCK_DOGS.length} listings nationwide
          </p>
          <div className="mt-6 relative max-w-xl">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#8B6A2E' }} />
            <input
              type="text"
              placeholder="Search breed, title, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 outline-none"
              style={{ border: '1px solid rgba(184,137,63,0.25)', background: 'rgba(239,231,212,0.07)', color: '#EFE7D4', fontSize: 16, ...body }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar filters */}
        <aside className="w-60 shrink-0 hidden lg:block">
          <div className="p-6 sticky top-6" style={{ background: '#F6F0E1', border: '1px solid rgba(184,137,63,0.25)' }}>
            <div style={{ ...SC, fontSize: 11, color: '#1C2418', marginBottom: 20 }}>Filters</div>
            <div className="space-y-5">
              {[
                { label: 'Breed', value: breedFilter, onChange: setBreedFilter, options: [['', 'All Breeds'], ...ALL_BREEDS.map(b => [b, b])] },
                { label: 'Training Level', value: levelFilter, onChange: setLevelFilter, options: [['', 'All Levels'], ['puppy', 'Puppy'], ['started', 'Started'], ['finished', 'Finished'], ['brood', 'Brood']] },
                { label: 'State', value: stateFilter, onChange: setStateFilter, options: [['', 'All States'], ...US_STATES.map(s => [s, s])] },
                { label: 'Gender', value: genderFilter, onChange: setGenderFilter, options: [['', 'Any'], ['male', 'Male'], ['female', 'Female']] },
              ].map(({ label, value, onChange, options }) => (
                <div key={label}>
                  <label style={{ ...SC, fontSize: 9, color: '#8B6A2E', display: 'block', marginBottom: 6 }}>{label}</label>
                  <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full px-3 py-2 outline-none"
                    style={{ ...fieldInput, fontSize: 15 }}
                  >
                    {options.map(([val, text]) => <option key={val} value={val}>{text}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label style={{ ...SC, fontSize: 9, color: '#8B6A2E', display: 'block', marginBottom: 6 }}>Price Range</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min $" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-1/2 px-3 py-2 outline-none" style={{ ...fieldInput, fontSize: 15 }} />
                  <input type="number" placeholder="Max $" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-1/2 px-3 py-2 outline-none" style={{ ...fieldInput, fontSize: 15 }} />
                </div>
              </div>
              <button
                onClick={() => { setSearch(''); setBreedFilter(''); setLevelFilter(''); setStateFilter(''); setGenderFilter(''); setMinPrice(''); setMaxPrice('') }}
                style={{ ...SC, fontSize: 9, width: '100%', padding: '8px', border: '1px solid rgba(184,137,63,0.3)', color: '#8B6A2E', background: 'transparent', cursor: 'pointer' }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Listing grid */}
        <main className="flex-1">
          <div className="mb-5">
            <p style={{ ...body, color: 'rgba(28,36,24,0.55)', fontSize: 15 }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="p-16 text-center" style={{ border: '1px solid rgba(184,137,63,0.25)', background: '#F6F0E1' }}>
              <p style={{ ...serif, fontSize: 24, color: '#1C2418', marginBottom: 8 }}>No Dogs Found</p>
              <p style={{ ...body, color: 'rgba(28,36,24,0.55)', fontSize: 15 }}>Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((dog) => {
                return (
                  <Link href={`/dogs/${dog.id}`} key={dog.id} className="block group" style={{ textDecoration: 'none' }}>
                    <div className="flex flex-col h-full" style={{
                      background: '#F6F0E1',
                      border: `1px solid ${dog.featured ? 'rgba(184,137,63,0.6)' : 'rgba(184,137,63,0.25)'}`,
                    }}>
                      {/* Photo placeholder */}
                      <div style={{ height: 200, background: '#E8DFCB', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {dog.featured && (
                          <div className="absolute top-0 left-0 px-3 py-1" style={{ background: '#B8893F' }}>
                            <span style={{ ...SC, fontSize: 9, color: '#1C2418' }}>Featured</span>
                          </div>
                        )}
                        <div style={{ opacity: 0.2, fontSize: 48 }}>🐕</div>
                        <div className="absolute bottom-0 right-0 px-2 py-1" style={{ background: '#1C2418' }}>
                          <span style={{ ...SC, fontSize: 8, color: '#EFE7D4' }}>{dog.breed.split(' ').map((w: string) => w[0]).join('')}</span>
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="p-5 flex flex-col flex-1">
                        <div style={{ ...SC, fontSize: 9, color: '#8B6A2E', marginBottom: 8 }}>
                          {TRAINING_LEVEL_LABELS[dog.training_level as TrainingLevel]} · {dog.gender === 'male' ? '♂' : '♀'} · {formatAge(dog.age_months)}
                        </div>
                        <h3 style={{ ...serif, fontSize: 20, color: '#1C2418', marginBottom: 4, lineHeight: 1.2 }}>{dog.title}</h3>
                        <p style={{ ...body, fontSize: 14, color: 'rgba(28,36,24,0.55)', marginBottom: 14 }}>{dog.breed}</p>
                        <div style={{ height: 1, background: 'rgba(184,137,63,0.2)', marginBottom: 14 }} />
                        <div style={{ ...serif, fontSize: 24, color: '#1C2418', marginBottom: 14 }}>{formatPrice(dog.price)}</div>

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1">
                            <MapPin size={11} style={{ color: '#8B6A2E' }} />
                            <span style={{ ...body, fontSize: 13, color: 'rgba(28,36,24,0.55)' }}>{dog.location_city}, {dog.location_state}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {dog.seller.verified && <ShieldCheck size={11} style={{ color: '#B8893F' }} />}
                            <Star size={11} style={{ color: '#B8893F' }} />
                            <span style={{ ...body, fontSize: 13, color: '#1C2418' }}>{dog.seller.rating}</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(184,137,63,0.2)' }}>
                          <span style={{ ...body, fontSize: 13, color: 'rgba(28,36,24,0.55)' }}>{dog.seller.kennel_name || dog.seller.full_name}</span>
                        </div>
                        <div className="mt-4 py-2.5 text-center" style={{ background: '#1C2418' }}>
                          <span style={{ ...SC, fontSize: 9, color: '#EFE7D4' }}>View Dog →</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
