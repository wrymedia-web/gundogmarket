import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/navbar'
import { ShieldCheck, Trophy, CreditCard } from 'lucide-react'

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
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontStyle: 'normal',
}

const featuredDogs = [
  { img: '/photos/dog-retrieve.jpg', breed: 'German Shorthair', name: 'Buck — Started Upland Male', price: '$3,200', location: 'Kansas', level: 'Started' },
  { img: '/photos/dog-field-hunters.jpg', breed: 'German Shorthair', name: 'Stella — Finished Bird Dog', price: '$6,500', location: 'Nebraska', level: 'Finished' },
  { img: '/photos/dog-point.jpg', breed: 'German Shorthair', name: 'Ace — JH Title, Broke to Shot', price: '$4,800', location: 'South Dakota', level: 'Finished' },
]

const breeds = ['Lab', 'GSP', 'Brittany', 'Vizsla', 'Setter', 'All Breeds']

const features = [
  { icon: <ShieldCheck size={26} style={{ color: '#F4EFE5' }} />, title: 'Verified Sellers', desc: 'Every seller is identity-verified. Reviews, ratings, and kennel history before you buy.' },
  { icon: <Trophy size={26} style={{ color: '#F4EFE5' }} />, title: 'Hunt Test Data', desc: 'AKC, NAVHDA, HRC, and NSTRA titles on every profile. See proven field performance.' },
  { icon: <CreditCard size={26} style={{ color: '#F4EFE5' }} />, title: 'Secure Escrow', desc: 'Funds held safely until you receive the dog. Full buyer protection — no wire fraud.' },
]

export default function HomePage() {
  return (
    <div style={{ background: '#F4EFE5', minHeight: '100vh' }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: 680 }}>
        <Image src="/photos/hero-dog-sunset.jpg" alt="German Shorthair Pointer at sunset" fill className="object-cover object-center" priority />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(10,10,10,0.92) 45%, rgba(10,10,10,0.5) 100%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col items-start justify-center" style={{ minHeight: 680, paddingTop: 72, paddingBottom: 72 }}>
          {/* Editorial tag line */}
          <div className="flex items-center gap-3 mb-6">
            <div style={{ width: 32, height: 2, background: '#D4600A' }} />
            <span style={{ ...SC, fontSize: 11, color: '#D4600A' }}>The Sporting Dog Exchange</span>
            <span style={{ ...serif, fontSize: 14, color: 'rgba(244,239,229,0.5)', marginLeft: 4 }}>— Of the field, for the field.</span>
          </div>

          {/* Main headline */}
          <h1 className="mb-8" style={{ ...display, fontSize: 'clamp(56px, 9vw, 108px)', color: '#F4EFE5', maxWidth: 760 }}>
            The<br />Marketplace<br />for Working<br />
            <span style={{ color: '#D4600A' }}>Dogs.</span>
          </h1>

          <p style={{ ...sans, fontSize: 15, fontWeight: 400, color: 'rgba(244,239,229,0.65)', maxWidth: 440, lineHeight: 1.65, marginBottom: 32 }}>
            Buy and sell trained bird dogs with verified sellers, secure payment, and hunt test data. Built for hunters.
          </p>

          <div className="flex items-center gap-4 flex-wrap">
            <Link href="/dogs" className="gx-btn">Browse Dogs</Link>
            <Link href="/sell" className="gx-btn-ghost">Sell Your Dog</Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-12 flex-wrap">
            {['2,400+ Listings', 'Verified Sellers', 'Secure Escrow'].map((s, i) => (
              <div key={s} className="flex items-center gap-6">
                {i > 0 && <div style={{ width: 1, height: 18, background: 'rgba(244,239,229,0.15)' }} />}
                <span style={{ ...sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(244,239,229,0.45)' }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Breed filter ─────────────────────────────────── */}
      <section style={{ background: '#1A1A1A', borderBottom: '2px solid #D4600A', padding: '14px 24px' }}>
        <div className="max-w-7xl mx-auto flex items-center gap-3 flex-wrap justify-center">
          <span style={{ ...sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(244,239,229,0.35)', marginRight: 8 }}>Browse by Breed:</span>
          {breeds.map((breed) => (
            <Link key={breed} href={breed === 'All Breeds' ? '/dogs' : `/dogs?breed=${encodeURIComponent(breed)}`} style={{
              ...sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '6px 14px', textDecoration: 'none',
              background: breed === 'All Breeds' ? '#D4600A' : 'rgba(244,239,229,0.05)',
              color: breed === 'All Breeds' ? 'white' : 'rgba(244,239,229,0.6)',
              border: `1px solid ${breed === 'All Breeds' ? '#D4600A' : 'rgba(244,239,229,0.1)'}`,
            }}>
              {breed}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Listings ────────────────────────────── */}
      <section style={{ background: '#F4EFE5', padding: '80px 24px' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div style={{ ...SC, fontSize: 10, color: '#D4600A', marginBottom: 8 }}>Selected Listings</div>
              <h2 style={{ ...display, fontSize: 36, color: '#0E0E0E' }}>Featured Dogs</h2>
            </div>
            <Link href="/dogs" style={{ ...sans, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#D4600A', textDecoration: 'none' }}>View All →</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDogs.map((dog) => (
              <Link href="/dogs" key={dog.name} className="group block" style={{ textDecoration: 'none' }}>
                <div style={{ background: 'white', border: '1px solid #D9C8A6', overflow: 'hidden' }}>
                  <div className="relative" style={{ height: 240 }}>
                    <Image src={dog.img} alt={dog.name} fill className="object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-0 left-0 px-3 py-1.5" style={{ background: '#D4600A' }}>
                      <span style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'white' }}>{dog.level}</span>
                    </div>
                  </div>
                  <div style={{ padding: '20px 22px 22px' }}>
                    <div style={{ ...SC, fontSize: 9, color: '#D4600A', marginBottom: 6 }}>{dog.breed}</div>
                    <div style={{ ...sans, fontSize: 14, fontWeight: 800, textTransform: 'uppercase', color: '#0E0E0E', marginBottom: 14, letterSpacing: '-0.01em' }}>{dog.name}</div>
                    <div style={{ height: 1, background: '#D9C8A6', marginBottom: 14 }} />
                    <div className="flex items-center justify-between">
                      <span style={{ ...display, fontSize: 22, color: '#0E0E0E' }}>{dog.price}</span>
                      <span style={{ ...SC, fontSize: 9, color: '#7C7A6E' }}>{dog.location}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Photo banner ─────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ height: 400 }}>
        <Image src="/photos/dog-celebration.jpg" alt="Hunters with gun dog after a successful hunt" fill className="object-cover object-center" />
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(10,10,10,0.68)' }}>
          <div className="text-center px-6">
            {/* Serif editorial touch */}
            <div style={{ ...serif, fontSize: 20, color: 'rgba(244,239,229,0.55)', marginBottom: 12 }}>Of the field, for the field.</div>
            <h2 style={{ ...display, fontSize: 'clamp(40px, 6vw, 68px)', color: '#F4EFE5', marginBottom: 28 }}>
              Find Your Next<br /><span style={{ color: '#D4600A' }}>Hunting Partner.</span>
            </h2>
            <Link href="/dogs" className="gx-btn">Browse All Dogs</Link>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section style={{ background: '#F4EFE5', padding: '80px 24px' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div style={{ ...SC, fontSize: 10, color: '#D4600A', marginBottom: 10 }}>Why GunDog Exchange</div>
            <h2 style={{ ...display, fontSize: 36, color: '#0E0E0E', marginBottom: 8 }}>Built for Hunters</h2>
            <p style={{ ...sans, fontSize: 14, fontWeight: 400, color: '#7C7A6E', maxWidth: 480, margin: '0 auto' }}>
              Not just another classifieds site. Purpose-built for the working dog community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} style={{ background: 'white', border: '1px solid #D9C8A6', padding: '36px' }}>
                <div style={{ width: 48, height: 48, background: '#0E0E0E', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>{f.icon}</div>
                <h3 style={{ ...sans, fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em', color: '#0E0E0E', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ ...sans, fontSize: 13, fontWeight: 400, color: '#7C7A6E', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────── */}
      <section id="how-it-works" style={{ background: '#0E0E0E', padding: '80px 24px' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div style={{ ...SC, fontSize: 10, color: '#D4600A', marginBottom: 10 }}>How It Works</div>
            <h2 style={{ ...display, fontSize: 36, color: '#F4EFE5' }}>
              Simple. Safe. Built for<br /><span style={{ color: '#D4600A' }}>the Field.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Browse & Filter', desc: 'Search by breed, training level, location, and price. View hunt titles, health certs, and seller ratings.' },
              { num: '02', title: 'Contact Seller', desc: 'Message verified sellers directly. Ask for videos, vet records, or a live demo. No middlemen.' },
              { num: '03', title: 'Secure the Deal', desc: 'Pay through escrow. Funds release only after you receive the dog. Full buyer protection.' },
            ].map((step) => (
              <div key={step.num} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(244,239,229,0.08)', padding: '36px' }}>
                <div style={{ ...display, fontSize: 48, color: '#D4600A', marginBottom: 16 }}>{step.num}</div>
                <h3 style={{ ...sans, fontSize: 14, fontWeight: 800, textTransform: 'uppercase', color: '#F4EFE5', marginBottom: 10 }}>{step.title}</h3>
                <p style={{ ...sans, fontSize: 13, fontWeight: 400, color: 'rgba(244,239,229,0.5)', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────── */}
      <section id="pricing" style={{ background: '#F4EFE5', padding: '80px 24px' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div style={{ ...SC, fontSize: 10, color: '#D4600A', marginBottom: 10 }}>Pricing</div>
            <h2 style={{ ...display, fontSize: 36, color: '#0E0E0E' }}>
              Sell for Free.<br /><span style={{ color: '#D4600A' }}>Upgrade for More.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              { name: 'Free Listing', price: '$0', period: 'always free', items: ['1 active listing', 'Basic profile', 'Buyer messaging', 'Photo upload'], cta: 'Post a Free Listing', dark: false },
              { name: 'Breeder Pro', price: '$29', period: '/month', items: ['Unlimited listings', 'Featured placement', 'Verified badge', 'Analytics dashboard', 'Priority support'], cta: 'Start Free Trial', dark: true },
            ].map((plan) => (
              <div key={plan.name} style={{ background: plan.dark ? '#0E0E0E' : 'white', border: `1px solid ${plan.dark ? '#D4600A' : '#D9C8A6'}`, padding: '36px', display: 'flex', flexDirection: 'column' }}>
                {plan.dark && <div style={{ ...sans, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#D4600A', color: 'white', display: 'inline-block', padding: '3px 10px', marginBottom: 16, alignSelf: 'flex-start' }}>Most Popular</div>}
                <div style={{ ...display, fontSize: 18, color: plan.dark ? '#F4EFE5' : '#0E0E0E', marginBottom: 4 }}>{plan.name}</div>
                <div className="flex items-baseline gap-2 mb-6">
                  <span style={{ ...display, fontSize: 48, color: plan.dark ? '#F4EFE5' : '#0E0E0E', lineHeight: 1 }}>{plan.price}</span>
                  <span style={{ ...sans, fontSize: 13, color: plan.dark ? 'rgba(244,239,229,0.45)' : '#7C7A6E' }}>{plan.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', flex: 1 }}>
                  {plan.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 mb-2.5" style={{ ...sans, fontSize: 13, fontWeight: 400, color: plan.dark ? 'rgba(244,239,229,0.7)' : '#7C7A6E' }}>
                      <span style={{ color: '#D4600A', fontWeight: 700 }}>✓</span> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/sell" style={{ ...sans, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: plan.dark ? '#D4600A' : 'transparent', color: plan.dark ? 'white' : '#0E0E0E', border: `1px solid ${plan.dark ? '#D4600A' : '#D9C8A6'}`, padding: '14px', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={{ background: '#0E0E0E', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 24px' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-1">
            <span style={{ ...display, fontSize: 16, color: '#F4EFE5' }}>GunDog</span>
            <span style={{ ...display, fontSize: 16, color: '#D4600A', marginLeft: 6 }}>Exchange</span>
          </div>
          <div className="flex items-center gap-8 flex-wrap justify-center">
            {[
              { label: 'Browse Dogs', href: '/dogs' },
              { label: 'Sell a Dog', href: '/sell' },
              { label: 'How It Works', href: '/#how-it-works' },
              { label: 'Sign In', href: '/login' },
            ].map((link) => (
              <Link key={link.label} href={link.href} style={{ ...sans, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
                {link.label}
              </Link>
            ))}
          </div>
          <p style={{ ...sans, fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.2)' }}>© 2026 GunDog Exchange</p>
        </div>
      </footer>
    </div>
  )
}
