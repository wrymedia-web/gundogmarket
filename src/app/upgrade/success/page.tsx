'use client'

import Navbar from '@/components/navbar'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

const display: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '-0.02em',
  lineHeight: 0.95,
}
const sans: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
}

export default function UpgradeSuccessPage() {
  return (
    <div style={{ background: '#EFE7D4', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <div style={{ width: 64, height: 64, background: '#D85A1C', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CheckCircle size={32} style={{ color: 'white' }} />
        </div>
        <h1 style={{ ...display, fontSize: 32, color: '#0F0F0E', marginBottom: 12 }}>Welcome to Breeder Pro</h1>
        <p style={{ ...sans, fontWeight: 400, fontSize: 17, color: '#7C7A6E', marginBottom: 32, lineHeight: 1.6 }}>
          Your subscription is active. You can now post up to 5 listings and all your dogs will be featured on the homepage.
        </p>
        <Link href="/sell" style={{ ...sans, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', background: '#D85A1C', color: 'white', padding: '14px 32px', textDecoration: 'none', display: 'inline-block' }}>
          Post Your Next Listing →
        </Link>
      </div>
    </div>
  )
}
