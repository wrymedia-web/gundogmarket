import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/navbar'
import {
  MOCK_DOGS,
  formatPrice,
  formatAge,
  TRAINING_LEVEL_LABELS,
  TRAINING_LEVEL_COLORS,
  type TrainingLevel,
} from '@/lib/mock-data'
import { MapPin, Star, ShieldCheck, CheckCircle, Phone, MessageCircle, Trophy } from 'lucide-react'

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

export async function generateStaticParams() {
  return MOCK_DOGS.map((dog) => ({ id: dog.id }))
}

export default async function DogProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dog = MOCK_DOGS.find((d) => d.id === id)
  if (!dog) notFound()

  const lvlStyle = TRAINING_LEVEL_COLORS[dog.training_level as TrainingLevel]

  return (
    <div style={{ background: '#EFE7D4', minHeight: '100vh' }}>
      <Navbar />

      {/* Breadcrumb */}
      <div className="px-6 py-3" style={{ background: '#1C2418', borderBottom: '1px solid rgba(184,137,63,0.2)' }}>
        <div className="max-w-7xl mx-auto flex items-center gap-2" style={{ ...body, fontSize: 13, color: 'rgba(239,231,212,0.45)' }}>
          <Link href="/dogs" style={{ color: 'rgba(239,231,212,0.5)', textDecoration: 'none' }}>Browse Dogs</Link>
          <span>/</span>
          <span style={{ color: '#B8893F' }}>{dog.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Photo placeholder */}
            <div className="w-full mb-6 flex items-center justify-center" style={{ background: '#E8DFCB', border: '1px solid rgba(184,137,63,0.25)', height: 400 }}>
              <div className="text-center">
                <div style={{ fontSize: 72, opacity: 0.2 }}>🐕</div>
                <p style={{ ...body, color: 'rgba(28,36,24,0.45)', fontSize: 15, marginTop: 8 }}>Photos coming soon</p>
              </div>
            </div>

            {/* Details panel */}
            <div className="p-8 mb-6" style={{ background: '#F6F0E1', border: '1px solid rgba(184,137,63,0.25)' }}>
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span style={{ ...SC, fontSize: 9, padding: '4px 10px', background: '#2D3A2A', color: '#EFE7D4' }}>
                  {TRAINING_LEVEL_LABELS[dog.training_level as TrainingLevel]}
                </span>
                {dog.featured && (
                  <span style={{ ...SC, fontSize: 9, padding: '4px 10px', background: '#B8893F', color: '#1C2418' }}>Featured</span>
                )}
                {dog.seller.verified && (
                  <span className="flex items-center gap-1" style={{ ...SC, fontSize: 9, padding: '4px 10px', background: '#E8DFCB', color: '#2D3A2A' }}>
                    <ShieldCheck size={11} style={{ color: '#B8893F' }} /> Verified Seller
                  </span>
                )}
              </div>

              <h1 style={{ ...serif, fontSize: 36, color: '#1C2418', marginBottom: 20, lineHeight: 1.1 }}>{dog.title}</h1>

              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 p-5" style={{ background: '#EFE7D4', border: '1px solid rgba(184,137,63,0.2)' }}>
                {[
                  { label: 'Breed', value: dog.breed },
                  { label: 'Age', value: formatAge(dog.age_months) },
                  { label: 'Gender', value: dog.gender === 'male' ? '♂ Male' : '♀ Female' },
                  { label: 'Location', value: `${dog.location_city}, ${dog.location_state}` },
                ].map((item) => (
                  <div key={item.label}>
                    <p style={{ ...SC, fontSize: 9, color: '#8B6A2E', marginBottom: 4 }}>{item.label}</p>
                    <p style={{ ...body, fontSize: 16, color: '#1C2418' }}>{item.value}</p>
                  </div>
                ))}
              </div>

              <h2 style={{ ...SC, fontSize: 11, color: '#1C2418', marginBottom: 12 }}>About This Dog</h2>
              <div style={{ width: 32, height: 1, background: '#B8893F', opacity: 0.5, marginBottom: 16 }} />
              <p style={{ ...body, fontSize: 17, color: 'rgba(28,36,24,0.7)', lineHeight: 1.65, marginBottom: 24 }}>{dog.description}</p>

              {dog.health_certs.length > 0 && (
                <div className="mb-6">
                  <h2 style={{ ...SC, fontSize: 11, color: '#1C2418', marginBottom: 12 }}>Health Certifications</h2>
                  <div className="flex flex-wrap gap-2">
                    {dog.health_certs.map((cert) => (
                      <div key={cert} className="flex items-center gap-2 px-3 py-2" style={{ background: '#EFE7D4', border: '1px solid rgba(184,137,63,0.3)', ...body, fontSize: 13, color: '#2D3A2A' }}>
                        <CheckCircle size={11} style={{ color: '#B8893F' }} /> {cert}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dog.hunt_titles.length > 0 && (
                <div className="mb-6">
                  <h2 style={{ ...SC, fontSize: 11, color: '#1C2418', marginBottom: 12 }}>Hunt Titles & Achievements</h2>
                  <div className="flex flex-wrap gap-2">
                    {dog.hunt_titles.map((title) => (
                      <div key={title} className="flex items-center gap-2 px-3 py-2" style={{ background: '#EFE7D4', border: '1px solid rgba(184,137,63,0.4)', ...body, fontSize: 13, color: '#8B6A2E' }}>
                        <Trophy size={11} style={{ color: '#B8893F' }} /> {title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="p-6 mb-5 sticky top-6" style={{ background: '#F6F0E1', border: '1px solid rgba(184,137,63,0.25)' }}>
              <div style={{ ...serif, fontSize: 44, color: '#1C2418', lineHeight: 1, marginBottom: 4 }}>{formatPrice(dog.price)}</div>
              <div className="flex items-center gap-1 mb-6" style={{ ...body, color: 'rgba(28,36,24,0.55)', fontSize: 15 }}>
                <MapPin size={13} style={{ color: '#8B6A2E' }} />
                {dog.location_city}, {dog.location_state}
              </div>
              <div style={{ height: 1, background: 'rgba(184,137,63,0.25)', marginBottom: 20 }} />
              <button className="w-full py-4 mb-3" style={{ background: '#2D3A2A', ...SC, fontSize: 10, color: '#EFE7D4', cursor: 'pointer', border: 'none' }}>
                Make an Offer
              </button>
              <button className="w-full py-4 mb-4" style={{ background: 'transparent', border: '1px solid rgba(184,137,63,0.35)', ...SC, fontSize: 10, color: '#1C2418', cursor: 'pointer' }}>
                Buy Now
              </button>
              <p style={{ ...body, fontSize: 13, color: 'rgba(28,36,24,0.4)', textAlign: 'center' }}>Secured by GunDog Exchange Escrow</p>
            </div>

            {/* Seller card */}
            <div className="p-6" style={{ background: '#F6F0E1', border: '1px solid rgba(184,137,63,0.25)' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 style={{ ...SC, fontSize: 12, color: '#1C2418' }}>{dog.seller.kennel_name || dog.seller.full_name}</h3>
                    {dog.seller.verified && <ShieldCheck size={14} style={{ color: '#B8893F' }} />}
                  </div>
                  {dog.seller.kennel_name && <p style={{ ...body, fontSize: 13, color: 'rgba(28,36,24,0.55)' }}>{dog.seller.full_name}</p>}
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={11} style={{ color: '#B8893F' }} />
                    <span style={{ ...body, fontSize: 13, color: '#1C2418' }}>{dog.seller.rating}</span>
                    <span style={{ ...body, fontSize: 13, color: 'rgba(28,36,24,0.5)' }}>({dog.seller.review_count} reviews)</span>
                  </div>
                </div>
                <div style={{ width: 40, height: 40, background: '#E8DFCB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🐾</div>
              </div>

              {dog.seller.breeder_pro && (
                <div className="mb-4 px-3 py-2 flex items-center gap-2" style={{ background: '#EFE7D4', border: '1px solid rgba(184,137,63,0.35)', ...SC, fontSize: 9, color: '#8B6A2E' }}>
                  <Trophy size={11} style={{ color: '#B8893F' }} /> Breeder Pro Seller
                </div>
              )}

              <div className="flex items-center gap-1 mb-5" style={{ ...body, fontSize: 13, color: 'rgba(28,36,24,0.55)' }}>
                <MapPin size={11} style={{ color: '#8B6A2E' }} /> {dog.location_state}
              </div>

              <button className="w-full py-3 flex items-center justify-center gap-2 mb-2" style={{ background: '#1C2418', ...SC, fontSize: 9, color: '#EFE7D4', cursor: 'pointer', border: 'none' }}>
                <MessageCircle size={13} /> Contact Seller
              </button>
              <button className="w-full py-3 flex items-center justify-center gap-2" style={{ background: 'transparent', border: '1px solid rgba(184,137,63,0.35)', ...SC, fontSize: 9, color: '#1C2418', cursor: 'pointer' }}>
                <Phone size={13} /> Request Phone Number
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
