'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const display: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '-0.02em',
}

const SC: React.CSSProperties = {
  fontFamily: "var(--font-cormorant-sc), 'Cormorant SC', Georgia, serif",
  fontWeight: 500,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  fontStyle: 'normal',
}

const nav: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
  fontWeight: 600,
  fontSize: 11,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{ background: '#0E0E0E', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-0.5 shrink-0" style={{ textDecoration: 'none' }}>
          <span style={{ ...display, fontSize: 18, color: '#F4EFE5' }}>GunDog</span>
          <span style={{ ...display, fontSize: 18, color: '#D4600A', marginLeft: 6 }}>Exchange</span>
        </Link>

        {/* Center nav — desktop */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Browse', href: '/dogs' },
            { label: 'How It Works', href: '/#how-it-works' },
            { label: 'Pricing', href: '/#pricing' },
          ].map((item) => (
            <Link key={item.label} href={item.href} style={{ ...nav, color: 'rgba(244,239,229,0.65)', textDecoration: 'none' }} className="hover:text-white transition-colors">
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" style={{ ...nav, color: 'rgba(244,239,229,0.55)', textDecoration: 'none' }} className="hover:opacity-80 transition-opacity">
            Sign In
          </Link>
          <Link href="/sell" className="gx-btn" style={{ fontSize: 11, padding: '10px 20px' }}>
            List a Dog
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" style={{ color: '#F4EFE5' }} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-6 pt-2 flex flex-col gap-5" style={{ background: '#0E0E0E', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            { label: 'Browse Dogs', href: '/dogs' },
            { label: 'How It Works', href: '/#how-it-works' },
            { label: 'Pricing', href: '/#pricing' },
            { label: 'Sign In', href: '/login' },
          ].map((item) => (
            <Link key={item.label} href={item.href} style={{ ...nav, color: 'rgba(244,239,229,0.7)', textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/sell" className="gx-btn" style={{ fontSize: 11, textAlign: 'center', display: 'block' }} onClick={() => setMenuOpen(false)}>
            List a Dog
          </Link>
        </div>
      )}
    </nav>
  )
}
