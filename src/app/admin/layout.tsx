import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminContext } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'

const sans: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
}

const navItems = [
  { label: 'Overview', href: '/admin' },
  { label: 'Listings', href: '/admin/listings' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Subscriptions', href: '/admin/subscriptions' },
  { label: 'Payments', href: '/admin/payments' },
  { label: 'Messages', href: '/admin/messages' },
  { label: 'Activity Log', href: '/admin/activity' },
  { label: 'Settings', href: '/admin/settings' },
  { label: 'Security (MFA)', href: '/admin/security' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAdminContext()
  if (!ctx) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    redirect(user ? '/' : '/login?redirect=/admin') // logged-in non-admins go home
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: '#F4EFE5' }}>
      {/* Mobile top nav */}
      <div className="md:hidden" style={{ background: '#0F0F0E', borderBottom: '2px solid #D85A1C' }}>
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <span style={{ ...sans, fontWeight: 900, fontSize: 15, color: '#D85A1C' }}>GDE</span>
            <span style={{ ...sans, fontWeight: 900, fontSize: 15, color: '#EFE7D4' }}> ADMIN</span>
          </Link>
          <span style={{ ...sans, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: ctx.role === 'super_admin' ? '#D85A1C' : 'rgba(244,239,229,0.5)' }}>
            {ctx.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </span>
        </div>
        <nav className="flex overflow-x-auto px-2 pb-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="px-3 py-2 text-xs font-semibold whitespace-nowrap" style={{ ...sans, color: 'rgba(244,239,229,0.8)', textDecoration: 'none' }}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Sidebar */}
      <aside className="w-56 shrink-0 hidden md:flex flex-col" style={{ background: '#0F0F0E', borderRight: '2px solid #D85A1C' }}>
        <div className="p-6" style={{ borderBottom: '1px solid rgba(244,239,229,0.08)' }}>
          <Link href="/admin" style={{ textDecoration: 'none' }}>
            <span style={{ ...sans, fontWeight: 900, fontSize: 16, color: '#D85A1C' }}>GDE</span>
            <span style={{ ...sans, fontWeight: 900, fontSize: 16, color: '#EFE7D4' }}> ADMIN</span>
          </Link>
          <p className="mt-1" style={{ ...sans, fontSize: 10, color: 'rgba(244,239,229,0.4)' }}>
            {ctx.user.email}
          </p>
          <span style={{ ...sans, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: ctx.role === 'super_admin' ? '#D85A1C' : 'rgba(244,239,229,0.5)' }}>
            {ctx.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </span>
        </div>
        <nav className="flex-1 p-4">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="block px-4 py-2.5 mb-1 text-sm font-semibold" style={{ ...sans, color: 'rgba(244,239,229,0.7)', textDecoration: 'none' }}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4" style={{ borderTop: '1px solid rgba(244,239,229,0.08)' }}>
          <Link href="/" className="block px-4 py-3 text-xs font-semibold uppercase tracking-widest" style={{ ...sans, color: 'rgba(244,239,229,0.4)', textDecoration: 'none' }}>
            ← Back to Site
          </Link>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}
