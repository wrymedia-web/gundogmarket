import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/navbar'

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

const featuredDogs = [
  {
    img: '/photos/dog-retrieve.jpg',
    breed: 'German Shorthaired Pointer',
    name: 'Buck — Started Upland Male',
    price: '$3,200',
    location: 'Kansas',
    level: 'Started',
  },
  {
    img: '/photos/dog-field-hunters.jpg',
    breed: 'German Shorthaired Pointer',
    name: 'Stella — Finished Bird Dog',
    price: '$6,500',
    location: 'Nebraska',
    level: 'Finished',
  },
  {
    img: '/photos/dog-point.jpg',
    breed: 'German Shorthaired Pointer',
    name: 'Ace — JH Title, Broke to Shot',
    price: '$4,800',
    location: 'South Dakota',
    level: 'Finished',
  },
]

const breeds = ['Lab', 'GSP', 'Brittany', 'Vizsla', 'Setter', 'All Breeds']

function GDXSeal({ size = 100, ink = '#EFE7D4', accent = '#8B6A2E' }: { size?: number; ink?: string; accent?: string }) {
  return (
    <svg viewBox="0 0 360 360" width={size} height={size} style={{ display: 'block' }}>
      <defs>
        <path id="seal-top" d="M 70,180 A 110,110 0 0 1 290,180" fill="none" />
        <path id="seal-bot" d="M 70,180 A 110,110 0 0 0 290,180" fill="none" />
      </defs>
      <circle cx="180" cy="180" r="148" fill="none" stroke={ink} strokeWidth="1.5" />
      <circle cx="180" cy="180" r="140" fill="none" stroke={ink} strokeWidth="0.5" />
      <circle cx="180" cy="180" r="96" fill="none" stroke={accent} strokeWidth="0.75" />
      <text fill={ink} style={{ fontFamily: 'Cormorant SC, serif', fontSize: 13, letterSpacing: '0.36em' }}>
        <textPath href="#seal-top" startOffset="50%" textAnchor="middle">GUNDOG · EXCHANGE</textPath>
      </text>
      <text fill={accent} style={{ fontFamily: 'Cormorant SC, serif', fontSize: 10.5, letterSpacing: '0.4em' }}>
        <textPath href="#seal-bot" startOffset="50%" textAnchor="middle">EST · MMXXVI · OF THE FIELD</textPath>
      </text>
      <text x="180" y="200" fill={ink} textAnchor="middle"
        style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 500, fontSize: 88, letterSpacing: '-0.02em' }}>
        GDX
      </text>
      <g fill={accent}>
        <rect x="178" y="82" width="4" height="4" transform="rotate(45 180 84)" />
        <rect x="178" y="274" width="4" height="4" transform="rotate(45 180 276)" />
        <rect x="82" y="178" width="4" height="4" transform="rotate(45 84 180)" />
        <rect x="274" y="178" width="4" height="4" transform="rotate(45 276 180)" />
      </g>
    </svg>
  )
}

export default function HomePage() {
  return (
    <div style={{ background: '#EFE7D4', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero — full bleed photo */}
      <section className="relative overflow-hidden" style={{ minHeight: '680px' }}>
        <Image
          src="/photos/hero-dog-sunset.jpg"
          alt="German Shorthaired Pointer at sunset"
          fill
          className="object-cover object-center"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(28,36,24,0.88) 45%, rgba(28,36,24,0.45) 100%)',
          }}
        />
        <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col items-start justify-center" style={{ minHeight: '680px', paddingTop: '80px', paddingBottom: '80px' }}>
          {/* SC label */}
          <div style={{ ...SC, fontSize: 10, color: '#B8893F', marginBottom: 20 }}>
            The Hunting Dog Marketplace
          </div>
          {/* Ochre rule */}
          <div style={{ width: 48, height: 1, background: '#B8893F', marginBottom: 24 }} />
          {/* Headline */}
          <h1 style={{ ...serif, fontSize: 'clamp(52px, 7vw, 88px)', color: '#F6F0E1', lineHeight: 1, maxWidth: 680, marginBottom: 24 }}>
            The Marketplace<br />for Working Dogs.
          </h1>
          {/* Subhead */}
          <p style={{ ...body, fontSize: 19, color: 'rgba(246,240,225,0.72)', maxWidth: 480, lineHeight: 1.55, marginBottom: 36 }}>
            Buy and sell trained bird dogs — verified sellers, hunt test records, and escrow protection. Built for the field.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/dogs" className="gx-btn" style={{ fontSize: 12 }}>
              Browse Dogs
            </Link>
            <Link href="/sell" className="gx-btn-ghost" style={{ fontSize: 12 }}>
              List Your Dog
            </Link>
          </div>
          {/* Stats */}
          <div className="flex items-center gap-8 mt-12 flex-wrap">
            {['2,400+ Listings', 'Verified Sellers', 'Secure Escrow'].map((stat, i) => (
              <div key={stat} className="flex items-center gap-8">
                {i > 0 && <div style={{ width: 1, height: 18, background: 'rgba(184,137,63,0.4)' }} />}
                <span style={{ ...SC, fontSize: 10, color: 'rgba(246,240,225,0.5)' }}>{stat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Breed filter — bone strip */}
      <section style={{ background: '#F6F0E1', borderTop: '1px solid rgba(184,137,63,0.3)', borderBottom: '1px solid rgba(184,137,63,0.3)', padding: '16px 24px' }}>
        <div className="max-w-6xl mx-auto flex items-center gap-3 flex-wrap justify-center">
          <span style={{ ...SC, fontSize: 9, color: '#8B6A2E', marginRight: 8 }}>Browse by Breed:</span>
          {breeds.map((breed) => (
            <Link
              key={breed}
              href={breed === 'All Breeds' ? '/dogs' : `/dogs?breed=${encodeURIComponent(breed)}`}
              style={{
                ...SC, fontSize: 9,
                padding: '6px 14px',
                border: `1px solid ${breed === 'All Breeds' ? '#2D3A2A' : 'rgba(139,106,46,0.35)'}`,
                background: breed === 'All Breeds' ? '#2D3A2A' : 'transparent',
                color: breed === 'All Breeds' ? '#EFE7D4' : '#8B6A2E',
                textDecoration: 'none',
              }}
            >
              {breed}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section style={{ background: '#EFE7D4', padding: '80px 24px' }}>
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="flex items-end justify-between mb-2">
            <div style={{ ...SC, fontSize: 10, color: '#8B6A2E' }}>Selected Listings</div>
            <Link href="/dogs" style={{ ...SC, fontSize: 10, color: '#8B6A2E', textDecoration: 'none' }}>
              View All →
            </Link>
          </div>
          <h2 style={{ ...serif, fontSize: 40, color: '#1C2418', marginBottom: 8 }}>Featured Dogs</h2>
          <div style={{ width: 48, height: 1, background: '#B8893F', opacity: 0.6, marginBottom: 36 }} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDogs.map((dog) => (
              <Link href="/dogs" key={dog.name} className="group block" style={{ textDecoration: 'none' }}>
                <div style={{ background: '#F6F0E1', border: '1px solid rgba(184,137,63,0.25)', overflow: 'hidden' }}>
                  <div className="relative" style={{ height: '240px' }}>
                    <Image
                      src={dog.img}
                      alt={dog.name}
                      fill
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className="absolute top-0 left-0 px-3 py-1.5"
                      style={{ background: '#2D3A2A' }}
                    >
                      <span style={{ ...SC, fontSize: 9, color: '#EFE7D4' }}>{dog.level}</span>
                    </div>
                  </div>
                  <div style={{ padding: '20px 22px 22px' }}>
                    <div style={{ ...SC, fontSize: 9, color: '#8B6A2E', marginBottom: 6 }}>{dog.breed}</div>
                    <div style={{ ...serif, fontSize: 20, color: '#1C2418', marginBottom: 14, lineHeight: 1.2 }}>{dog.name}</div>
                    <div style={{ height: 1, background: 'rgba(184,137,63,0.25)', marginBottom: 14 }} />
                    <div className="flex items-center justify-between">
                      <span style={{ ...serif, fontSize: 24, color: '#1C2418' }}>{dog.price}</span>
                      <span style={{ ...SC, fontSize: 9, color: '#8B6A2E' }}>{dog.location}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Full-bleed editorial photo banner */}
      <section className="relative overflow-hidden" style={{ height: '420px' }}>
        <Image
          src="/photos/dog-celebration.jpg"
          alt="Hunters with gun dog after a successful hunt"
          fill
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(28,36,24,0.72)' }}
        >
          <div className="text-center px-6">
            <div style={{ ...SC, fontSize: 10, color: '#B8893F', marginBottom: 16 }}>GunDog Exchange</div>
            <h2 style={{ ...serif, fontSize: 'clamp(40px, 6vw, 68px)', color: '#F6F0E1', lineHeight: 1, marginBottom: 28 }}>
              Find Your Next<br />Hunting Partner.
            </h2>
            <Link href="/dogs" className="gx-btn" style={{ fontSize: 12 }}>
              Browse All Dogs
            </Link>
          </div>
        </div>
      </section>

      {/* Features — bone soft ground */}
      <section style={{ background: '#F6F0E1', padding: '80px 24px', borderTop: '1px solid rgba(184,137,63,0.2)' }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ ...SC, fontSize: 10, color: '#8B6A2E', marginBottom: 12 }}>Why GunDog Exchange</div>
            <h2 style={{ ...serif, fontSize: 40, color: '#1C2418', marginBottom: 0 }}>Built for the Field.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: 'rgba(184,137,63,0.2)' }}>
            {[
              {
                num: 'I',
                title: 'Verified Sellers',
                desc: 'Every seller is identity-verified. Reviews, ratings, and kennel history available before you commit.',
              },
              {
                num: 'II',
                title: 'Hunt Test Records',
                desc: 'AKC, NAVHDA, HRC, and NSTRA titles listed on every profile. See the dog\'s proven field performance.',
              },
              {
                num: 'III',
                title: 'Secure Escrow',
                desc: 'Funds held safely until you receive the dog. Full buyer protection — no wire fraud, no risk.',
              },
            ].map((f) => (
              <div key={f.num} style={{ background: '#F6F0E1', padding: '40px 36px' }}>
                <div style={{ ...serif, fontSize: 40, color: '#B8893F', marginBottom: 20, lineHeight: 1 }}>{f.num}</div>
                <div style={{ width: 32, height: 1, background: '#B8893F', opacity: 0.5, marginBottom: 20 }} />
                <h3 style={{ ...SC, fontSize: 13, color: '#1C2418', marginBottom: 14 }}>{f.title}</h3>
                <p style={{ ...body, fontSize: 16, color: 'rgba(28,36,24,0.65)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — field deep ground */}
      <section id="how-it-works" style={{ background: '#1C2418', padding: '80px 24px' }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ ...SC, fontSize: 10, color: '#8B6A2E', marginBottom: 12 }}>Simple Process</div>
            <h2 style={{ ...serif, fontSize: 40, color: '#EFE7D4' }}>Simple. Safe. Of the Field.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: 'rgba(184,137,63,0.15)' }}>
            {[
              { num: '01', title: 'Browse & Filter', desc: 'Search by breed, training level, location, and price. View hunt titles, health certs, and seller ratings.' },
              { num: '02', title: 'Contact the Seller', desc: 'Message verified sellers directly. Ask for field videos, vet records, or a live evaluation. No middlemen.' },
              { num: '03', title: 'Secure the Deal', desc: 'Pay through escrow. Funds release only after you receive the dog. Full buyer protection, guaranteed.' },
            ].map((step) => (
              <div key={step.num} style={{ background: '#1C2418', padding: '40px 36px' }}>
                <div style={{ ...serif, fontSize: 56, color: '#B8893F', lineHeight: 1, marginBottom: 16 }}>{step.num}</div>
                <div style={{ width: 32, height: 1, background: '#B8893F', opacity: 0.4, marginBottom: 20 }} />
                <h3 style={{ ...SC, fontSize: 13, color: '#EFE7D4', marginBottom: 14 }}>{step.title}</h3>
                <p style={{ ...body, fontSize: 16, color: 'rgba(239,231,212,0.55)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — bone ground */}
      <section id="pricing" style={{ background: '#EFE7D4', padding: '80px 24px' }}>
        <div className="max-w-6xl mx-auto">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ ...SC, fontSize: 10, color: '#8B6A2E', marginBottom: 12 }}>Pricing</div>
            <h2 style={{ ...serif, fontSize: 40, color: '#1C2418', marginBottom: 0 }}>Sell for Free. Upgrade for More.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                name: 'Free Listing',
                price: '$0',
                period: 'always free',
                items: ['1 active listing', 'Standard profile', 'Buyer messaging', 'Photo upload'],
                cta: 'Post a Free Listing',
                dark: false,
              },
              {
                name: 'Breeder Pro',
                price: '$29',
                period: 'per month',
                items: ['Unlimited listings', 'Featured placement', 'Verified Kennel badge', 'Analytics dashboard', 'Priority support'],
                cta: 'Start Free Trial',
                dark: true,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                style={{
                  background: plan.dark ? '#1C2418' : '#F6F0E1',
                  border: `1px solid ${plan.dark ? 'rgba(184,137,63,0.4)' : 'rgba(184,137,63,0.25)'}`,
                  padding: '36px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {plan.dark && (
                  <div style={{ ...SC, fontSize: 9, color: '#B8893F', marginBottom: 16 }}>Most Popular</div>
                )}
                <div style={{ ...SC, fontSize: 13, color: plan.dark ? '#EFE7D4' : '#1C2418', marginBottom: 8 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                  <span style={{ ...serif, fontSize: 52, color: plan.dark ? '#EFE7D4' : '#1C2418', lineHeight: 1 }}>{plan.price}</span>
                  <span style={{ ...body, fontSize: 15, color: plan.dark ? 'rgba(239,231,212,0.5)' : '#8B6A2E' }}>{plan.period}</span>
                </div>
                <div style={{ height: 1, background: plan.dark ? 'rgba(184,137,63,0.3)' : 'rgba(184,137,63,0.25)', margin: '20px 0' }} />
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', flex: 1 }}>
                  {plan.items.map((item) => (
                    <li key={item} style={{ ...body, fontSize: 16, color: plan.dark ? 'rgba(239,231,212,0.7)' : 'rgba(28,36,24,0.7)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: '#B8893F' }}>·</span> {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sell"
                  style={{
                    ...SC, fontSize: 11,
                    background: plan.dark ? '#B8893F' : '#2D3A2A',
                    color: plan.dark ? '#1C2418' : '#EFE7D4',
                    padding: '13px 24px',
                    display: 'block',
                    textAlign: 'center',
                    textDecoration: 'none',
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1C2418', borderTop: '1px solid rgba(184,137,63,0.2)', padding: '60px 24px 40px' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
            {/* Seal + wordmark */}
            <div className="flex flex-col items-center md:items-start gap-4">
              <GDXSeal size={80} />
              <div style={{ ...SC, fontSize: 9, color: 'rgba(239,231,212,0.35)', maxWidth: 240, textAlign: 'center', lineHeight: 1.7 }}>
                The Marketplace for Working Dogs<br />Est. MMXXVI
              </div>
            </div>
            {/* Nav links */}
            <div className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-10">
              {[
                { label: 'Browse Dogs', href: '/dogs' },
                { label: 'List a Dog', href: '/sell' },
                { label: 'How It Works', href: '/#how-it-works' },
                { label: 'Pricing', href: '/#pricing' },
                { label: 'Sign In', href: '/login' },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{ ...SC, fontSize: 10, color: 'rgba(239,231,212,0.4)', textDecoration: 'none' }}
                  className="hover:opacity-70 transition-opacity"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div style={{ height: 1, background: 'rgba(184,137,63,0.15)', margin: '32px 0' }} />
          <p style={{ ...body, fontSize: 13, color: 'rgba(239,231,212,0.25)', textAlign: 'center' }}>
            © 2026 GunDog Exchange · The Marketplace for Working Dogs
          </p>
        </div>
      </footer>
    </div>
  )
}
