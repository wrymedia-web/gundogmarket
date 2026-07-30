'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

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

const TRAINING_LABEL: Record<string, string> = {
  puppy: 'Pup',
  started: 'Started',
  finished: 'Finished',
  broke: 'Finished',
}

const stripe: React.CSSProperties = {
  background: `repeating-linear-gradient(-45deg, #171717 0px, #171717 10px, #1e1e1e 10px, #1e1e1e 20px)`,
}

type Row = {
  id: string
  title: string
  breed: string
  price: number
  location_state: string | null
  training_level: string
  images: string[] | null
}

export default function FeaturedDogs() {
  const [dogs, setDogs] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('dogs')
        .select('id,title,breed,price,location_state,training_level,images,featured,created_at')
        .eq('status', 'active')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(3)
      if (cancelled) return
      setDogs((data as Row[]) ?? [])
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <section style={{ background: '#EFE7D4', padding: '80px 24px' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div style={{ ...SC, fontSize: 10, color: '#D85A1C', marginBottom: 8 }}>Selected Listings</div>
            <h2 style={{ ...display, fontSize: 36, color: '#0F0F0E' }}>Featured Dogs</h2>
          </div>
          <Link href="/dogs" style={{ ...sans, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#D85A1C', textDecoration: 'none' }}>View All →</Link>
        </div>

        {loading ? (
          <div style={{ ...sans, color: '#7C7A6E', fontSize: 13, textAlign: 'center', padding: 40 }}>Loading listings…</div>
        ) : dogs.length === 0 ? (
          <div style={{ border: '1px solid #D9C8A6', background: 'white', padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ ...display, fontSize: 24, color: '#0F0F0E', marginBottom: 10 }}>Be the First to List</div>
            <p style={{ ...sans, fontSize: 13, color: '#7C7A6E', marginBottom: 20 }}>No dogs are listed yet. Post yours and it lands right here.</p>
            <Link href="/sell" className="gx-btn">Sell Your Dog</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dogs.map((dog) => {
              const priceStr = `$${(dog.price / 100).toLocaleString()}`
              const level = TRAINING_LABEL[dog.training_level] ?? dog.training_level
              const heroImg = dog.images?.[0]
              return (
                <Link href={`/dogs/${dog.id}`} key={dog.id} className="group block" style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'white', border: '1px solid #D9C8A6', overflow: 'hidden' }}>
                    <div className="relative" style={{ height: 240, ...(!heroImg ? stripe : {}) }}>
                      {heroImg ? (
                        <Image src={heroImg} alt={dog.title} fill className="object-cover object-center transition-transform duration-500 group-hover:scale-105" unoptimized />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(239,231,212,0.14)' }}>Dog Portrait</span>
                        </div>
                      )}
                      <div className="absolute top-0 left-0 px-3 py-1.5" style={{ background: '#D85A1C' }}>
                        <span style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'white' }}>{level}</span>
                      </div>
                    </div>
                    <div style={{ padding: '20px 22px 22px' }}>
                      <div style={{ ...SC, fontSize: 9, color: '#D85A1C', marginBottom: 6 }}>{dog.breed}</div>
                      <div style={{ ...sans, fontSize: 14, fontWeight: 800, textTransform: 'uppercase', color: '#0F0F0E', marginBottom: 14, letterSpacing: '-0.01em' }}>{dog.title}</div>
                      <div style={{ height: 1, background: '#D9C8A6', marginBottom: 14 }} />
                      <div className="flex items-center justify-between">
                        <span style={{ ...display, fontSize: 22, color: '#0F0F0E' }}>{priceStr}</span>
                        <span style={{ ...SC, fontSize: 9, color: '#7C7A6E' }}>{dog.location_state ?? ''}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
