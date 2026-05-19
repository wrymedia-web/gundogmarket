import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navbar from '@/components/navbar'
import {
  MOCK_DOGS,
  formatPrice,
  formatAge,
  TRAINING_LEVEL_LABELS,
  type TrainingLevel,
} from '@/lib/mock-data'
import { MapPin, Star, ShieldCheck, CheckCircle, Phone, MessageCircle, Trophy } from 'lucide-react'

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

  return (
    <div style={{ background: '#F4EFE5', minHeight: '100vh' }}>
      <Navbar />

      {/* Breadcrumb */}
      <div className="px-6 py-3" style={{ background: '#0E0E0E', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto flex items-center gap-2" style={{ ...sans, fontWeight: 400, fontSize: 13, color: 'rgba(244,239,229,0.4)' }}>
          <Link href="/dogs" style={{ color: 'rgba(244,239,229,0.4)', textDecoration: 'none' }}>Browse Dogs</Link>
          <span>/</span>
          <span style={{ color: '#D4600A' }}>{dog.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Photo placeholder */}
            <div className="w-full mb-6 flex items-center justify-center" style={{ background: '#EAE4D6', border: '1px solid #D9C8A6', height: 400 }}>
              <div className="text-center">
                <div style={{ fontSize: 72, opacity: 0.2 }}>🐕</div>
                <p style={{ ...sans, fontWeight: 400, color: '#7C7A6E', fontSize: 15, marginTop: 8 }}>Photos coming soon</p>
              </div>
            </div>

            {/* Details panel */}
            <div className="p-8 mb-6" style={{ background: 'white', border: '1px solid #D9C8A6' }}>
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 10px', background: '#D4600A', color: 'white' }}>
                  {TRAINING_LEVEL_LABELS[dog.training_level as TrainingLevel]}
                </span>
                {dog.featured && (
                  <span style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 10px', background: '#D4600A', color: 'white' }}>Featured</span>
                )}
                {dog.seller.verified && (
                  <span className="flex items-center gap-1" style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 10px', background: '#EAE4D6', color: '#0E0E0E' }}>
                    <ShieldCheck size={11} style={{ color: '#D4600A' }} /> Verified Seller
                  </span>
                )}
              </div>

              <h1 style={{ ...display, fontSize: 32, color: '#0E0E0E', marginBottom: 20 }}>{dog.title}</h1>

              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 p-5" style={{ background: '#F4EFE5', border: '1px solid #EAE4D6' }}>
                {[
                  { label: 'Breed', value: dog.breed },
                  { label: 'Age', value: formatAge(dog.age_months) },
                  { label: 'Gender', value: dog.gender === 'male' ? '♂ Male' : '♀ Female' },
                  { label: 'Location', value: `${dog.location_city}, ${dog.location_state}` },
                ].map((item) => (
                  <div key={item.label}>
                    <p style={{ ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', marginBottom: 4 }}>{item.label}</p>
                    <p style={{ ...sans, fontWeight: 600, fontSize: 15, color: '#0E0E0E' }}>{item.value}</p>
                  </div>
                ))}
              </div>

              <h2 style={{ ...sans, fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0E0E0E', marginBottom: 12 }}>About This Dog</h2>
              <div style={{ width: 32, height: 2, background: '#D4600A', marginBottom: 16 }} />
              <p style={{ ...sans, fontWeight: 400, fontSize: 16, color: '#4A4A4A', lineHeight: 1.65, marginBottom: 24 }}>{dog.description}</p>

              {dog.health_certs.length > 0 && (
                <div className="mb-6">
                  <h2 style={{ ...sans, fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0E0E0E', marginBottom: 12 }}>Health Certifications</h2>
                  <div className="flex flex-wrap gap-2">
                    {dog.health_certs.map((cert) => (
                      <div key={cert} className="flex items-center gap-2 px-3 py-2" style={{ background: '#F0FDF4', border: '1px solid #86EFAC', ...sans, fontWeight: 400, fontSize: 13, color: '#166534' }}>
                        <CheckCircle size={11} style={{ color: '#166534' }} /> {cert}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {dog.hunt_titles.length > 0 && (
                <div className="mb-6">
                  <h2 style={{ ...sans, fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0E0E0E', marginBottom: 12 }}>Hunt Titles &amp; Achievements</h2>
                  <div className="flex flex-wrap gap-2">
                    {dog.hunt_titles.map((title) => (
                      <div key={title} className="flex items-center gap-2 px-3 py-2" style={{ background: '#FEF3C7', border: '1px solid #FDE68A', ...sans, fontWeight: 400, fontSize: 13, color: '#92400E' }}>
                        <Trophy size={11} style={{ color: '#92400E' }} /> {title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="p-6 mb-5 sticky top-6" style={{ background: 'white', border: '1px solid #D9C8A6' }}>
              <div style={{ ...display, fontSize: 42, color: '#D4600A', marginBottom: 4 }}>{formatPrice(dog.price)}</div>
              <div className="flex items-center gap-1 mb-6" style={{ ...sans, fontWeight: 400, color: '#7C7A6E', fontSize: 14 }}>
                <MapPin size={13} style={{ color: '#7C7A6E' }} />
                {dog.location_city}, {dog.location_state}
              </div>
              <div style={{ height: 1, background: '#D9C8A6', marginBottom: 20 }} />
              <button className="w-full py-4 mb-3" style={{ background: '#D4600A', ...sans, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'white', cursor: 'pointer', border: 'none' }}>
                Make an Offer
              </button>
              <button className="w-full py-4 mb-4" style={{ background: 'transparent', border: '1px solid #D9C8A6', ...sans, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0E0E0E', cursor: 'pointer' }}>
                Buy Now
              </button>
              <p style={{ ...sans, fontWeight: 400, fontSize: 12, color: '#7C7A6E', textAlign: 'center' }}>Secured by GunDog Exchange Escrow</p>
            </div>

            {/* Seller card */}
            <div className="p-6" style={{ background: 'white', border: '1px solid #D9C8A6' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 style={{ ...sans, fontWeight: 800, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0E0E0E' }}>{dog.seller.kennel_name || dog.seller.full_name}</h3>
                    {dog.seller.verified && <ShieldCheck size={14} style={{ color: '#D4600A' }} />}
                  </div>
                  {dog.seller.kennel_name && <p style={{ ...sans, fontWeight: 400, fontSize: 13, color: '#7C7A6E' }}>{dog.seller.full_name}</p>}
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={11} style={{ color: '#D4600A' }} />
                    <span style={{ ...sans, fontWeight: 400, fontSize: 13, color: '#0E0E0E' }}>{dog.seller.rating}</span>
                    <span style={{ ...sans, fontWeight: 400, fontSize: 13, color: '#7C7A6E' }}>({dog.seller.review_count} reviews)</span>
                  </div>
                </div>
                <div style={{ width: 40, height: 40, background: '#EAE4D6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🐾</div>
              </div>

              {dog.seller.breeder_pro && (
                <div className="mb-4 px-3 py-2 flex items-center gap-2" style={{ background: '#FEF3C7', border: '1px solid #FDE68A', ...sans, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#92400E' }}>
                  <Trophy size={11} style={{ color: '#92400E' }} /> Breeder Pro Seller
                </div>
              )}

              <div className="flex items-center gap-1 mb-5" style={{ ...sans, fontWeight: 400, fontSize: 13, color: '#7C7A6E' }}>
                <MapPin size={11} style={{ color: '#7C7A6E' }} /> {dog.location_state}
              </div>

              <button className="w-full py-3 flex items-center justify-center gap-2 mb-2" style={{ background: '#0E0E0E', ...sans, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#F4EFE5', cursor: 'pointer', border: 'none' }}>
                <MessageCircle size={13} /> Contact Seller
              </button>
              <button className="w-full py-3 flex items-center justify-center gap-2" style={{ background: 'transparent', border: '1px solid #D9C8A6', ...sans, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0E0E0E', cursor: 'pointer' }}>
                <Phone size={13} /> Request Phone Number
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
