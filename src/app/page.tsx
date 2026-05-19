import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/navbar'
import { ShieldCheck, Trophy, CreditCard } from 'lucide-react'

const montserrat: React.CSSProperties = {
  fontFamily: "'Montserrat', var(--font-montserrat), system-ui, sans-serif",
}

const inter: React.CSSProperties = {
  fontFamily: "'Inter', var(--font-inter), system-ui, sans-serif",
}

const features = [
  {
    icon: <ShieldCheck size={28} style={{ color: '#F4EFE5' }} />,
    title: 'Verified Sellers',
    description: 'Every seller is identity-verified. Reviews, ratings, and kennel history available before you buy.',
  },
  {
    icon: <Trophy size={28} style={{ color: '#F4EFE5' }} />,
    title: 'Hunt Test Data',
    description: 'AKC, NAVHDA, HRC, and NSTRA titles listed on every profile. See the dog\'s proven performance.',
  },
  {
    icon: <CreditCard size={28} style={{ color: '#F4EFE5' }} />,
    title: 'Secure Payment',
    description: 'Escrow-protected transactions. Your money is held safely until you receive the dog. No wire fraud.',
  },
]

const breeds = ['Lab', 'GSP', 'Brittany', 'Vizsla', 'Setter', 'All Breeds']

const featuredDogs = [
  {
    img: '/photos/dog-retrieve.jpg',
    breed: 'German Shorthair',
    name: 'Buck — Started Upland Male',
    price: '$3,200',
    location: 'Kansas',
    level: 'Started',
  },
  {
    img: '/photos/dog-field-hunters.jpg',
    breed: 'German Shorthair',
    name: 'Stella — Finished Bird Dog',
    price: '$6,500',
    location: 'Nebraska',
    level: 'Finished',
  },
  {
    img: '/photos/dog-point.jpg',
    breed: 'German Shorthair',
    name: 'Ace — JH Title, Broke to Shot',
    price: '$4,800',
    location: 'South Dakota',
    level: 'Finished',
  },
]

export default function HomePage() {
  return (
    <div style={{ background: '#F4EFE5', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero — full bleed photo */}
      <section className="relative overflow-hidden" style={{ minHeight: '680px' }}>
        <Image
          src="/photos/hero-dog-sunset.jpg"
          alt="German Shorthair Pointer at sunset"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(14,14,14,0.85) 40%, rgba(14,14,14,0.4) 100%)',
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-32 flex flex-col items-start justify-center" style={{ minHeight: '680px' }}>
          <div
            className="inline-block text-xs font-bold px-4 py-1.5 mb-8 uppercase tracking-widest"
            style={{ background: '#D4600A', color: 'white', ...inter }}
          >
            The Hunting Dog Marketplace
          </div>
          <h1
            className="text-5xl md:text-7xl font-black leading-none mb-6 uppercase"
            style={{ ...montserrat, color: '#F4EFE5', letterSpacing: '-0.02em', maxWidth: '700px' }}
          >
            THE MARKETPLACE<br />
            FOR WORKING<br />
            <span style={{ color: '#D4600A' }}>DOGS.</span>
          </h1>
          <p
            className="text-lg mb-10 max-w-xl"
            style={{ color: 'rgba(244,239,229,0.7)', ...inter }}
          >
            Buy and sell trained bird dogs with verified sellers, secure payment, and hunt test data. Built for hunters.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/dogs"
              className="text-sm font-bold px-8 py-4 text-white uppercase tracking-widest transition-colors"
              style={{ background: '#D4600A', ...inter, letterSpacing: '0.1em' }}
            >
              Browse Dogs
            </Link>
            <Link
              href="/sell"
              className="text-sm font-semibold px-8 py-4 uppercase tracking-widest transition-colors"
              style={{
                border: '1px solid rgba(244,239,229,0.4)',
                color: 'rgba(244,239,229,0.9)',
                ...inter,
                letterSpacing: '0.1em',
              }}
            >
              Sell Your Dog
            </Link>
          </div>
          {/* Stats bar */}
          <div
            className="mt-14 inline-flex items-center gap-8 px-8 py-4"
            style={{ border: '1px solid rgba(244,239,229,0.15)', background: 'rgba(0,0,0,0.3)' }}
          >
            {['2,400+ Listings', 'Verified Sellers', 'Secure Escrow'].map((stat, i) => (
              <div key={stat} className="flex items-center gap-4">
                {i > 0 && <div style={{ width: 1, height: 20, background: 'rgba(244,239,229,0.15)' }} />}
                <span
                  className="text-sm font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(244,239,229,0.6)', ...inter, letterSpacing: '0.08em' }}
                >
                  {stat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Breed quick-filter */}
      <section
        className="px-6 py-6"
        style={{ background: '#1A1A1A', borderBottom: '2px solid #D4600A' }}
      >
        <div className="max-w-5xl mx-auto flex items-center gap-3 flex-wrap justify-center">
          <span className="text-xs font-bold uppercase tracking-widest mr-2" style={{ color: 'rgba(244,239,229,0.4)', ...inter }}>
            Browse by Breed:
          </span>
          {breeds.map((breed) => (
            <Link
              key={breed}
              href={breed === 'All Breeds' ? '/dogs' : `/dogs?breed=${encodeURIComponent(breed)}`}
              className="text-xs font-bold px-4 py-2 uppercase tracking-wide transition-all"
              style={{
                background: breed === 'All Breeds' ? '#D4600A' : 'rgba(244,239,229,0.06)',
                color: breed === 'All Breeds' ? 'white' : 'rgba(244,239,229,0.7)',
                border: `1px solid ${breed === 'All Breeds' ? '#D4600A' : 'rgba(244,239,229,0.12)'}`,
                ...inter,
              }}
            >
              {breed}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="px-6 py-20" style={{ background: '#F4EFE5' }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <h2 className="text-3xl font-black uppercase" style={{ ...montserrat, color: '#0E0E0E', letterSpacing: '-0.02em' }}>
              Featured Dogs
            </h2>
            <Link href="/dogs" className="text-sm font-bold uppercase tracking-widest" style={{ color: '#D4600A', ...inter }}>
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDogs.map((dog) => (
              <Link href="/dogs" key={dog.name} className="group block" style={{ textDecoration: 'none' }}>
                <div style={{ background: 'white', border: '1px solid #D9C8A6', overflow: 'hidden' }}>
                  <div className="relative" style={{ height: '220px' }}>
                    <Image
                      src={dog.img}
                      alt={dog.name}
                      fill
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                    <div
                      className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 uppercase tracking-wide"
                      style={{ background: '#D4600A', color: 'white', ...inter }}
                    >
                      {dog.level}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#D4600A', ...inter }}>
                      {dog.breed}
                    </div>
                    <div className="font-black text-base uppercase mb-3" style={{ ...montserrat, color: '#0E0E0E' }}>
                      {dog.name}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black" style={{ ...montserrat, color: '#0E0E0E' }}>{dog.price}</span>
                      <span className="text-xs uppercase tracking-wide" style={{ color: '#7C7A6E', ...inter }}>{dog.location}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Full-bleed photo banner */}
      <section className="relative overflow-hidden" style={{ height: '360px' }}>
        <Image
          src="/photos/dog-celebration.jpg"
          alt="Hunters with gun dog after successful hunt"
          fill
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(14,14,14,0.65)' }}
        >
          <div className="text-center px-6">
            <h2
              className="text-4xl md:text-5xl font-black uppercase mb-4"
              style={{ ...montserrat, color: '#F4EFE5', letterSpacing: '-0.02em' }}
            >
              Find Your Next<br />
              <span style={{ color: '#D4600A' }}>Hunting Partner.</span>
            </h2>
            <Link
              href="/dogs"
              className="inline-block text-sm font-bold px-8 py-4 text-white uppercase tracking-widest"
              style={{ background: '#D4600A', ...inter, letterSpacing: '0.1em' }}
            >
              Browse All Dogs
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24" style={{ background: '#F4EFE5' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black uppercase mb-4" style={{ ...montserrat, color: '#0E0E0E', letterSpacing: '-0.02em' }}>
              Built for Hunters
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: '#7C7A6E', ...inter }}>
              Not just another classifieds site. GunDog Exchange is purpose-built for the working dog community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-8" style={{ background: 'white', border: '1px solid #D9C8A6' }}>
                <div className="w-12 h-12 flex items-center justify-center mb-6" style={{ background: '#0E0E0E' }}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-black uppercase mb-3" style={{ ...montserrat, color: '#0E0E0E' }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#7C7A6E', ...inter }}>
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-24" style={{ background: '#0E0E0E' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block text-xs font-bold px-4 py-1.5 mb-4 uppercase tracking-widest" style={{ background: '#D4600A', color: 'white', ...inter }}>
              HOW IT WORKS
            </div>
            <h2 className="text-4xl font-black uppercase" style={{ ...montserrat, color: '#F4EFE5', letterSpacing: '-0.02em' }}>
              Simple. Safe. Built<br />
              <span style={{ color: '#D4600A' }}>for the Field.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Browse & Filter', desc: 'Search by breed, training level, location, and price. View hunt titles, health certs, and seller ratings.' },
              { num: '02', title: 'Contact the Seller', desc: 'Message verified sellers directly. Ask for videos, vet records, or a live demo. No middlemen.' },
              { num: '03', title: 'Secure the Deal', desc: 'Pay securely through escrow. Funds release only after you receive the dog. Full buyer protection.' },
            ].map((step) => (
              <div key={step.num} className="p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(244,239,229,0.08)' }}>
                <div className="text-5xl font-black leading-none mb-4" style={{ ...montserrat, color: '#D4600A' }}>
                  {step.num}
                </div>
                <h3 className="text-lg font-black uppercase mb-3" style={{ ...montserrat, color: '#F4EFE5' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(244,239,229,0.55)', ...inter }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24" style={{ background: '#F4EFE5' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black uppercase mb-4" style={{ ...montserrat, color: '#0E0E0E', letterSpacing: '-0.02em' }}>
              Sell for Free.<br />
              <span style={{ color: '#D4600A' }}>Upgrade for More.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                name: 'Free Listing',
                price: '$0',
                desc: 'Get started',
                features: ['1 active listing', 'Basic profile', 'Buyer messaging', 'Photo upload'],
                cta: 'Post a Free Listing',
                highlight: false,
              },
              {
                name: 'Breeder Pro',
                price: '$29',
                desc: '/month',
                features: ['Unlimited listings', 'Featured placement', 'Verified badge', 'Analytics dashboard', 'Priority support'],
                cta: 'Start Free Trial',
                highlight: true,
              },
            ].map((plan) => (
              <div key={plan.name} className="p-8 flex flex-col" style={{
                background: plan.highlight ? '#0E0E0E' : 'white',
                border: `1px solid ${plan.highlight ? '#D4600A' : '#D9C8A6'}`,
              }}>
                {plan.highlight && (
                  <div className="text-xs font-bold px-3 py-1 mb-6 self-start uppercase tracking-widest" style={{ background: '#D4600A', color: 'white', ...inter }}>
                    Most Popular
                  </div>
                )}
                <div className="mb-1 font-black text-xl uppercase" style={{ ...montserrat, color: plan.highlight ? '#F4EFE5' : '#0E0E0E' }}>
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1 mb-6 mt-2">
                  <span className="text-5xl font-black" style={{ ...montserrat, color: plan.highlight ? '#F4EFE5' : '#0E0E0E' }}>
                    {plan.price}
                  </span>
                  <span className="text-sm" style={{ color: plan.highlight ? 'rgba(244,239,229,0.5)' : '#7C7A6E', ...inter }}>
                    {plan.desc}
                  </span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm" style={{ color: plan.highlight ? 'rgba(244,239,229,0.75)' : '#7C7A6E', ...inter }}>
                      <span style={{ color: '#D4600A', fontWeight: 700 }}>✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sell"
                  className="block text-center text-sm font-bold py-3.5 uppercase tracking-widest"
                  style={{
                    background: plan.highlight ? '#D4600A' : 'transparent',
                    color: plan.highlight ? 'white' : '#0E0E0E',
                    border: `1px solid ${plan.highlight ? '#D4600A' : '#D9C8A6'}`,
                    ...inter,
                    letterSpacing: '0.08em',
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
      <footer className="px-6 py-8 text-center" style={{ background: '#0E0E0E', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-center gap-1 mb-4">
          <span className="text-lg font-black" style={{ ...montserrat, color: '#D4600A', letterSpacing: '-0.02em' }}>GUNDOG</span>
          <span className="text-lg font-black" style={{ ...montserrat, color: 'rgba(244,239,229,0.4)', letterSpacing: '-0.02em' }}>EXCHANGE</span>
        </div>
        <div className="flex items-center justify-center gap-6 mb-4">
          {['Browse Dogs', 'Sell a Dog', 'How It Works', 'Sign In'].map((link) => (
            <Link
              key={link}
              href={link === 'Browse Dogs' ? '/dogs' : link === 'Sell a Dog' ? '/sell' : link === 'Sign In' ? '/login' : '/#how-it-works'}
              className="text-xs uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.3)', ...inter }}
            >
              {link}
            </Link>
          ))}
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)', ...inter }}>
          © 2026 GunDog Exchange. The Marketplace for Working Dogs.
        </p>
      </footer>
    </div>
  )
}
