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

const inter: React.CSSProperties = {
  fontFamily: "'Inter', var(--font-inter), system-ui, sans-serif",
}

const montserrat: React.CSSProperties = {
  fontFamily: "'Montserrat', var(--font-montserrat), system-ui, sans-serif",
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
    <div style={{ background: '#F4EFE5', minHeight: '100vh' }}>
      <Navbar />

      {/* Header */}
      <div
        className="px-6 py-12"
        style={{ background: '#0E0E0E', borderBottom: '2px solid #D4600A' }}
      >
        <div className="max-w-7xl mx-auto">
          <h1
            className="text-4xl font-black uppercase mb-2"
            style={{ ...montserrat, color: '#F4EFE5', letterSpacing: '-0.02em' }}
          >
            Browse Dogs
          </h1>
          <p style={{ color: 'rgba(244,239,229,0.55)', ...inter }}>
            {MOCK_DOGS.length} listings nationwide
          </p>

          {/* Search */}
          <div className="mt-6 relative max-w-xl">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: '#7C7A6E' }}
            />
            <input
              type="text"
              placeholder="Search breed, title, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-sm outline-none"
              style={{
                border: '1px solid rgba(244,239,229,0.15)',
                background: 'rgba(255,255,255,0.06)',
                color: '#F4EFE5',
                ...inter,
              }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Sidebar filters */}
        <aside className="w-64 shrink-0 hidden lg:block">
          <div
            className="p-6 sticky top-6"
            style={{ background: 'white', border: '1px solid #D9C8A6' }}
          >
            <h2
              className="text-sm font-black uppercase mb-5 tracking-widest"
              style={{ ...montserrat, color: '#0E0E0E' }}
            >
              Filters
            </h2>

            <div className="space-y-5">
              {/* Breed */}
              <div>
                <label
                  className="block text-xs font-bold mb-2 uppercase tracking-wider"
                  style={{ color: '#0E0E0E', ...inter }}
                >
                  Breed
                </label>
                <select
                  value={breedFilter}
                  onChange={(e) => setBreedFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={{ border: '1px solid #D9C8A6', background: 'white', color: '#0E0E0E', ...inter }}
                >
                  <option value="">All Breeds</option>
                  {ALL_BREEDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Training Level */}
              <div>
                <label
                  className="block text-xs font-bold mb-2 uppercase tracking-wider"
                  style={{ color: '#0E0E0E', ...inter }}
                >
                  Training Level
                </label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={{ border: '1px solid #D9C8A6', background: 'white', color: '#0E0E0E', ...inter }}
                >
                  <option value="">All Levels</option>
                  <option value="puppy">Puppy</option>
                  <option value="started">Started</option>
                  <option value="finished">Finished</option>
                  <option value="brood">Brood</option>
                </select>
              </div>

              {/* State */}
              <div>
                <label
                  className="block text-xs font-bold mb-2 uppercase tracking-wider"
                  style={{ color: '#0E0E0E', ...inter }}
                >
                  State
                </label>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={{ border: '1px solid #D9C8A6', background: 'white', color: '#0E0E0E', ...inter }}
                >
                  <option value="">All States</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div>
                <label
                  className="block text-xs font-bold mb-2 uppercase tracking-wider"
                  style={{ color: '#0E0E0E', ...inter }}
                >
                  Gender
                </label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={{ border: '1px solid #D9C8A6', background: 'white', color: '#0E0E0E', ...inter }}
                >
                  <option value="">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Price range */}
              <div>
                <label
                  className="block text-xs font-bold mb-2 uppercase tracking-wider"
                  style={{ color: '#0E0E0E', ...inter }}
                >
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min $"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-1/2 px-3 py-2 text-sm outline-none"
                    style={{ border: '1px solid #D9C8A6', background: 'white', color: '#0E0E0E', ...inter }}
                  />
                  <input
                    type="number"
                    placeholder="Max $"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-1/2 px-3 py-2 text-sm outline-none"
                    style={{ border: '1px solid #D9C8A6', background: 'white', color: '#0E0E0E', ...inter }}
                  />
                </div>
              </div>

              {/* Clear filters */}
              <button
                onClick={() => {
                  setSearch(''); setBreedFilter(''); setLevelFilter('')
                  setStateFilter(''); setGenderFilter(''); setMinPrice(''); setMaxPrice('')
                }}
                className="w-full py-2 text-xs font-bold uppercase tracking-widest"
                style={{
                  border: '1px solid #D9C8A6',
                  color: '#7C7A6E',
                  background: 'transparent',
                  ...inter,
                  cursor: 'pointer',
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </aside>

        {/* Listing grid */}
        <main className="flex-1">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm" style={{ color: '#7C7A6E', ...inter }}>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div
              className="p-16 text-center"
              style={{ border: '1px solid #D9C8A6', background: 'white' }}
            >
              <p
                className="text-lg font-black uppercase mb-2"
                style={{ ...montserrat, color: '#0E0E0E' }}
              >
                No Dogs Found
              </p>
              <p style={{ color: '#7C7A6E', ...inter, fontSize: 14 }}>
                Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((dog) => {
                const lvlStyle = TRAINING_LEVEL_COLORS[dog.training_level as TrainingLevel]
                return (
                  <Link
                    href={`/dogs/${dog.id}`}
                    key={dog.id}
                    className="block group"
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      className="flex flex-col h-full transition-shadow"
                      style={{
                        background: 'white',
                        border: `1px solid ${dog.featured ? '#D4600A' : '#D9C8A6'}`,
                        boxShadow: dog.featured ? '3px 3px 0 #D4600A' : '3px 3px 0 #D9C8A6',
                      }}
                    >
                      {/* Photo placeholder */}
                      <div
                        className="w-full flex items-center justify-center"
                        style={{ height: 200, background: '#EAE4D6', position: 'relative' }}
                      >
                        {dog.featured && (
                          <div
                            className="absolute top-3 left-3 text-xs font-bold px-2 py-1 uppercase tracking-widest"
                            style={{ background: '#D4600A', color: 'white', ...inter }}
                          >
                            Featured
                          </div>
                        )}
                        <div
                          className="text-5xl"
                          style={{ opacity: 0.3 }}
                        >
                          🐕
                        </div>
                        {/* Breed badge */}
                        <div
                          className="absolute bottom-3 right-3 text-xs font-bold px-2 py-1"
                          style={{ background: '#0E0E0E', color: '#F4EFE5', ...inter }}
                        >
                          {dog.breed.split(' ').map(w => w[0]).join('')}
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="p-5 flex flex-col flex-1">
                        {/* Training badge */}
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className="text-xs font-bold px-2 py-0.5 uppercase tracking-wider"
                            style={{ background: lvlStyle.bg, color: lvlStyle.color, ...inter }}
                          >
                            {TRAINING_LEVEL_LABELS[dog.training_level as TrainingLevel]}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: '#7C7A6E', ...inter }}
                          >
                            {dog.gender === 'male' ? '♂' : '♀'} · {formatAge(dog.age_months)}
                          </span>
                        </div>

                        <h3
                          className="text-base font-black uppercase mb-1 leading-tight"
                          style={{ ...montserrat, color: '#0E0E0E' }}
                        >
                          {dog.title}
                        </h3>

                        <p
                          className="text-xs mb-3"
                          style={{ color: '#7C7A6E', ...inter }}
                        >
                          {dog.breed}
                        </p>

                        {/* Price */}
                        <div
                          className="text-xl font-black mb-4"
                          style={{ ...montserrat, color: '#D4600A' }}
                        >
                          {formatPrice(dog.price)}
                        </div>

                        {/* Location + seller */}
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1">
                            <MapPin size={12} style={{ color: '#7C7A6E' }} />
                            <span
                              className="text-xs"
                              style={{ color: '#7C7A6E', ...inter }}
                            >
                              {dog.location_city}, {dog.location_state}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {dog.seller.verified && (
                              <ShieldCheck size={12} style={{ color: '#D4600A' }} />
                            )}
                            <Star size={12} style={{ color: '#D4600A' }} />
                            <span
                              className="text-xs font-semibold"
                              style={{ color: '#0E0E0E', ...inter }}
                            >
                              {dog.seller.rating}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3" style={{ borderTop: '1px solid #EAE4D6' }}>
                          <span
                            className="text-xs"
                            style={{ color: '#7C7A6E', ...inter }}
                          >
                            {dog.seller.kennel_name || dog.seller.full_name}
                          </span>
                        </div>

                        <div
                          className="mt-4 py-2.5 text-center text-xs font-bold uppercase tracking-widest"
                          style={{
                            background: '#0E0E0E',
                            color: '#F4EFE5',
                            ...inter,
                          }}
                        >
                          View Dog →
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
