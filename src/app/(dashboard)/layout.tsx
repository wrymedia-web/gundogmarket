import Link from 'next/link'

const montserrat: React.CSSProperties = {
  fontFamily: "'Montserrat', var(--font-montserrat), system-ui, sans-serif",
}

const inter: React.CSSProperties = {
  fontFamily: "'Inter', var(--font-inter), system-ui, sans-serif",
}

const navItems = [
  { label: 'My Listings', href: '/dashboard', icon: '🐕' },
  { label: 'Profile', href: '/dashboard/profile', icon: '👤' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex" style={{ background: '#F4EFE5' }}>
      {/* Sidebar */}
      <aside
        className="w-64 shrink-0 flex flex-col"
        style={{ background: '#0E0E0E', borderRight: '2px solid #D4600A' }}
      >
        {/* Logo */}
        <div className="p-6" style={{ borderBottom: '1px solid rgba(244,239,229,0.08)' }}>
          <Link href="/" className="flex items-center gap-1">
            <span className="text-lg font-black" style={{ ...montserrat, color: '#D4600A' }}>GUNDOG</span>
            <span className="text-lg font-black" style={{ ...montserrat, color: '#F4EFE5' }}>MARKET</span>
          </Link>
          <p className="text-xs mt-1" style={{ color: 'rgba(244,239,229,0.3)', ...inter }}>
            Seller Dashboard
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 mb-1 text-sm font-semibold transition-colors"
              style={{ color: 'rgba(244,239,229,0.7)', ...inter }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(244,239,229,0.08)' }}>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'rgba(244,239,229,0.4)', ...inter }}
          >
            ← Back to Marketplace
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div
          className="px-8 py-4 flex items-center justify-between"
          style={{ background: 'white', borderBottom: '1px solid #D9C8A6' }}
        >
          <div />
          <div className="flex items-center gap-4">
            <Link
              href="/sell"
              className="text-xs font-bold px-4 py-2 text-white uppercase tracking-widest"
              style={{ background: '#D4600A', ...inter, border: 'none' }}
            >
              + New Listing
            </Link>
          </div>
        </div>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
