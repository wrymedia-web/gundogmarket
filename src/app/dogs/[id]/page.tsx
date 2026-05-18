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

const inter: React.CSSProperties = {
  fontFamily: "'Inter', var(--font-inter), system-ui, sans-serif",
}

const montserrat: React.CSSProperties = {
  fontFamily: "'Montserrat', var(--font-montserrat), system-ui, sans-serif",
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
    <div style={{ background: '#F4EFE5', minHeight: '100vh' }}>
      <Navbar />

      {/* Breadcrumb */}
      <div
        className="px-6 py-3"
        style={{ background: '#0E0E0E', borderBottom: '1px solid rgba(244,239,229,0.08)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(244,239,229,0.4)', ...inter }}>
            <Link href="/dogs" style={{ color: 'rgba(244,239,229,0.5)' }}>Browse Dogs</Link>
            <span>/</span>
            <span style={{ color: '#D4600A' }}>{dog.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Photo gallery placeholder */}
            <div
              className="w-full mb-6 flex items-center justify-center"
              style={{
                background: '#EAE4D6',
                border: '1px solid #D9C8A6',
                height: 400,
              }}
            >
              <div className="text-center">
                <div className="text-8xl mb-3" style={{ opacity: 0.25 }}>🐕</div>
                <p className="text-sm" style={{ color: '#7C7A6E', ...inter }}>
                  Photos coming soon
                </p>
              </div>
            </div>

            {/* Details */}
            <div
              className="p-8 mb-6"
              style={{ background: 'white', border: '1px solid #D9C8A6' }}
            >
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span
                  className="text-xs font-bold px-3 py-1 uppercase tracking-wider"
                  style={{ background: lvlStyle.bg, color: lvlStyle.color, ...inter }}
                >
                  {TRAINING_LEVEL_LABELS[dog.training_level as TrainingLevel]}
                </span>
                {dog.featured && (
                  <span
                    className="text-xs font-bold px-3 py-1 uppercase tracking-wider"
                    style={{ background: '#D4600A', color: 'white', ...inter }}
                  >
                    Featured
                  </span>
                )}
                {dog.seller.verified && (
                  <span
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1"
                    style={{ background: '#EAE4D6', color: '#0E0E0E', ...inter }}
                  >
                    <ShieldCheck size={12} style={{ color: '#D4600A' }} />
                    Verified Seller
                  </span>
                )}
              </div>

              <h1
                className="text-3xl font-black uppercase mb-2"
                style={{ ...montserrat, color: '#0E0E0E', letterSpacing: '-0.02em' }}
              >
                {dog.title}
              </h1>

              {/* Quick stats */}
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 p-5"
                style={{ background: '#F4EFE5', border: '1px solid #EAE4D6' }}
              >
                {[
                  { label: 'Breed', value: dog.breed },
                  { label: 'Age', value: formatAge(dog.age_months) },
                  { label: 'Gender', value: dog.gender === 'male' ? '♂ Male' : '♀ Female' },
                  { label: 'Location', value: `${dog.location_city}, ${dog.location_state}` },
                ].map((item) => (
                  <div key={item.label}>
                    <p
                      className="text-xs font-bold uppercase tracking-wider mb-1"
                      style={{ color: '#7C7A6E', ...inter }}
                    >
                      {item.label}
                    </p>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: '#0E0E0E', ...inter }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <h2
                className="text-lg font-black uppercase mb-3"
                style={{ ...montserrat, color: '#0E0E0E' }}
              >
                About This Dog
              </h2>
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: '#4A4A4A', ...inter }}
              >
                {dog.description}
              </p>

              {/* Health Certs */}
              {dog.health_certs.length > 0 && (
                <div className="mb-6">
                  <h2
                    className="text-lg font-black uppercase mb-3"
                    style={{ ...montserrat, color: '#0E0E0E' }}
                  >
                    Health Certifications
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {dog.health_certs.map((cert) => (
                      <div
                        key={cert}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold"
                        style={{
                          background: '#F0FDF4',
                          border: '1px solid #86EFAC',
                          color: '#166534',
                          ...inter,
                        }}
                      >
                        <CheckCircle size={12} />
                        {cert}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hunt Titles */}
              {dog.hunt_titles.length > 0 && (
                <div className="mb-6">
                  <h2
                    className="text-lg font-black uppercase mb-3"
                    style={{ ...montserrat, color: '#0E0E0E' }}
                  >
                    Hunt Titles & Achievements
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {dog.hunt_titles.map((title) => (
                      <div
                        key={title}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold"
                        style={{
                          background: '#FEF3C7',
                          border: '1px solid #FDE68A',
                          color: '#92400E',
                          ...inter,
                        }}
                      >
                        <Trophy size={12} />
                        {title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            {/* Price & CTA */}
            <div
              className="p-6 mb-5 sticky top-6"
              style={{ background: 'white', border: '1px solid #D9C8A6' }}
            >
              <div
                className="text-4xl font-black mb-1"
                style={{ ...montserrat, color: '#D4600A' }}
              >
                {formatPrice(dog.price)}
              </div>
              <div
                className="flex items-center gap-1 mb-6 text-sm"
                style={{ color: '#7C7A6E', ...inter }}
              >
                <MapPin size={14} />
                {dog.location_city}, {dog.location_state}
              </div>

              <button
                className="w-full py-4 text-sm font-bold uppercase tracking-widest text-white mb-3"
                style={{ background: '#D4600A', ...inter, letterSpacing: '0.1em', cursor: 'pointer', border: 'none' }}
              >
                Make an Offer
              </button>
              <button
                className="w-full py-4 text-sm font-bold uppercase tracking-widest mb-3"
                style={{
                  background: 'transparent',
                  border: '1px solid #D9C8A6',
                  color: '#0E0E0E',
                  ...inter,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                }}
              >
                Buy Now
              </button>
              <p
                className="text-xs text-center"
                style={{ color: '#7C7A6E', ...inter }}
              >
                Secured by GunDog Market Escrow
              </p>
            </div>

            {/* Seller card */}
            <div
              className="p-6"
              style={{ background: 'white', border: '1px solid #D9C8A6' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="text-base font-black uppercase"
                      style={{ ...montserrat, color: '#0E0E0E' }}
                    >
                      {dog.seller.kennel_name || dog.seller.full_name}
                    </h3>
                    {dog.seller.verified && (
                      <ShieldCheck size={16} style={{ color: '#D4600A' }} />
                    )}
                  </div>
                  {dog.seller.kennel_name && (
                    <p className="text-xs" style={{ color: '#7C7A6E', ...inter }}>
                      {dog.seller.full_name}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} style={{ color: '#D4600A' }} />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: '#0E0E0E', ...inter }}
                    >
                      {dog.seller.rating}
                    </span>
                    <span className="text-xs" style={{ color: '#7C7A6E', ...inter }}>
                      ({dog.seller.review_count} reviews)
                    </span>
                  </div>
                </div>
                <div
                  className="w-10 h-10 flex items-center justify-center text-lg"
                  style={{ background: '#EAE4D6' }}
                >
                  🐾
                </div>
              </div>

              {dog.seller.breeder_pro && (
                <div
                  className="mb-4 px-3 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                  style={{ background: '#FEF3C7', color: '#92400E', ...inter }}
                >
                  <Trophy size={12} />
                  Breeder Pro Seller
                </div>
              )}

              <div
                className="flex items-center gap-1 mb-4 text-xs"
                style={{ color: '#7C7A6E', ...inter }}
              >
                <MapPin size={12} />
                {dog.location_state}
              </div>

              <button
                className="w-full py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                style={{
                  background: '#0E0E0E',
                  color: '#F4EFE5',
                  ...inter,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                <MessageCircle size={14} />
                Contact Seller
              </button>
              <button
                className="w-full py-3 mt-2 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                style={{
                  background: 'transparent',
                  border: '1px solid #D9C8A6',
                  color: '#0E0E0E',
                  ...inter,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                }}
              >
                <Phone size={14} />
                Request Phone Number
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
