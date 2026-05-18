'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const montserrat: React.CSSProperties = {
  fontFamily: "'Montserrat', var(--font-montserrat), system-ui, sans-serif",
}

const inter: React.CSSProperties = {
  fontFamily: "'Inter', var(--font-inter), system-ui, sans-serif",
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{ background: '#0E0E0E', borderBottom: '2px solid #D4600A' }}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <span
            className="text-xl font-black tracking-tight"
            style={{ ...montserrat, color: '#D4600A', letterSpacing: '-0.02em' }}
          >
            GUNDOG
          </span>
          <span
            className="text-xl font-black tracking-tight"
            style={{ ...montserrat, color: '#F4EFE5', letterSpacing: '-0.02em' }}
          >
            MARKET
          </span>
        </Link>

        {/* Center nav — desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/dogs"
            className="text-sm font-semibold uppercase tracking-wide transition-colors hover:text-orange-400"
            style={{ color: 'rgba(244,239,229,0.75)', ...inter, letterSpacing: '0.06em' }}
          >
            Browse Dogs
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm font-semibold uppercase tracking-wide transition-colors hover:text-orange-400"
            style={{ color: 'rgba(244,239,229,0.75)', ...inter, letterSpacing: '0.06em' }}
          >
            How It Works
          </Link>
          <Link
            href="/#pricing"
            className="text-sm font-semibold uppercase tracking-wide transition-colors hover:text-orange-400"
            style={{ color: 'rgba(244,239,229,0.75)', ...inter, letterSpacing: '0.06em' }}
          >
            Pricing
          </Link>
        </div>

        {/* Right actions — desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-semibold px-4 py-2 transition-colors"
            style={{ color: 'rgba(244,239,229,0.7)', ...inter }}
          >
            Sign In
          </Link>
          <Link
            href="/sell"
            className="text-sm font-bold px-5 py-2.5 text-white uppercase tracking-widest transition-colors"
            style={{
              background: '#D4600A',
              ...inter,
              letterSpacing: '0.08em',
            }}
          >
            Sell Your Dog
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          style={{ color: '#F4EFE5' }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-6 pb-6 pt-2 flex flex-col gap-4"
          style={{ background: '#0E0E0E', borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Link
            href="/dogs"
            className="text-sm font-semibold uppercase tracking-wide py-2"
            style={{ color: 'rgba(244,239,229,0.75)', ...inter, letterSpacing: '0.06em' }}
            onClick={() => setMenuOpen(false)}
          >
            Browse Dogs
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm font-semibold uppercase tracking-wide py-2"
            style={{ color: 'rgba(244,239,229,0.75)', ...inter, letterSpacing: '0.06em' }}
            onClick={() => setMenuOpen(false)}
          >
            How It Works
          </Link>
          <Link
            href="/#pricing"
            className="text-sm font-semibold uppercase tracking-wide py-2"
            style={{ color: 'rgba(244,239,229,0.75)', ...inter, letterSpacing: '0.06em' }}
            onClick={() => setMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold py-2"
            style={{ color: 'rgba(244,239,229,0.7)', ...inter }}
            onClick={() => setMenuOpen(false)}
          >
            Sign In
          </Link>
          <Link
            href="/sell"
            className="text-sm font-bold px-5 py-3 text-white uppercase tracking-widest text-center"
            style={{ background: '#D4600A', ...inter, letterSpacing: '0.08em' }}
            onClick={() => setMenuOpen(false)}
          >
            Sell Your Dog
          </Link>
        </div>
      )}
    </nav>
  )
}
