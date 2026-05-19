'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

function GDXMark({ size = 40 }: { size?: number }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} style={{ display: 'block', flexShrink: 0 }}>
      <circle cx="40" cy="40" r="37" fill="none" stroke="#2D3A2A" strokeWidth="1.5" />
      <circle cx="40" cy="40" r="30" fill="none" stroke="#8B6A2E" strokeWidth="0.7" />
      <text x="40" y="52" fill="#2D3A2A" textAnchor="middle"
        style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontWeight: 500, fontSize: 32, letterSpacing: '-0.02em' }}>
        GDX
      </text>
    </svg>
  )
}

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

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{ background: '#EFE7D4', borderBottom: '1px solid rgba(184,137,63,0.4)' }}>
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 no-underline">
          <GDXMark size={38} />
          <div>
            <div style={{ ...serif, fontSize: 22, color: '#1C2418', lineHeight: 1 }}>GunDog</div>
            <div style={{ ...SC, fontSize: 10, color: '#8B6A2E', lineHeight: 1 }}>Exchange</div>
          </div>
        </Link>

        {/* Center nav — desktop */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Browse Dogs', href: '/dogs' },
            { label: 'How It Works', href: '/#how-it-works' },
            { label: 'Pricing', href: '/#pricing' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              style={{ ...SC, fontSize: 11, color: '#2D3A2A', textDecoration: 'none' }}
              className="hover:opacity-60 transition-opacity"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right actions — desktop */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            style={{ ...SC, fontSize: 11, color: '#8B6A2E', textDecoration: 'none' }}
            className="hover:opacity-70 transition-opacity"
          >
            Sign In
          </Link>
          <Link
            href="/sell"
            style={{
              ...SC, fontSize: 11,
              background: '#2D3A2A', color: '#EFE7D4',
              padding: '8px 20px', textDecoration: 'none',
              display: 'inline-block',
            }}
            className="hover:opacity-90 transition-opacity"
          >
            List Your Dog
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          style={{ color: '#2D3A2A' }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-6 pb-6 pt-2 flex flex-col gap-5"
          style={{ background: '#EFE7D4', borderTop: '1px solid rgba(184,137,63,0.2)' }}
        >
          {[
            { label: 'Browse Dogs', href: '/dogs' },
            { label: 'How It Works', href: '/#how-it-works' },
            { label: 'Pricing', href: '/#pricing' },
            { label: 'Sign In', href: '/login' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              style={{ ...SC, fontSize: 12, color: '#2D3A2A', textDecoration: 'none' }}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/sell"
            style={{
              ...SC, fontSize: 12,
              background: '#2D3A2A', color: '#EFE7D4',
              padding: '12px 20px', textDecoration: 'none',
              display: 'block', textAlign: 'center',
            }}
            onClick={() => setMenuOpen(false)}
          >
            List Your Dog
          </Link>
        </div>
      )}
    </nav>
  )
}
