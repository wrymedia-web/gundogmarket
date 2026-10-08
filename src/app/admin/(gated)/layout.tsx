import { redirect } from 'next/navigation'
import { getAdminContext } from '@/lib/admin'

// MFA gate for all admin pages except /admin/security and /admin/verify
// (which live outside this route group so admins can enroll/step-up).
export default async function GatedAdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAdminContext()
  if (!ctx) redirect('/login?redirect=/admin')
  if (!ctx.hasVerifiedFactor) redirect('/admin/security')
  if (ctx.aal !== 'aal2') redirect('/admin/verify')
  return <>{children}</>
}
