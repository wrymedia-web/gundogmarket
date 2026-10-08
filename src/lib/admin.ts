import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import type { User } from '@supabase/supabase-js'

export type AdminContext = {
  user: User
  role: 'admin' | 'super_admin'
  aal: 'aal1' | 'aal2'
  hasVerifiedFactor: boolean
  mfaSatisfied: boolean
}

function decodeAal(accessToken: string | undefined): 'aal1' | 'aal2' {
  if (!accessToken) return 'aal1'
  try {
    const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64url').toString())
    return payload.aal === 'aal2' ? 'aal2' : 'aal1'
  } catch {
    return 'aal1'
  }
}

/**
 * Resolve the current admin context WITHOUT throwing.
 * Returns null if the user is not signed in or not an admin.
 */
export async function getAdminContext(): Promise<AdminContext | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') return null

  const { data: { session } } = await supabase.auth.getSession()
  const aal = decodeAal(session?.access_token)

  const { data: factorData } = await supabase.auth.mfa.listFactors()
  const hasVerifiedFactor = (factorData?.totp ?? []).some((f) => f.status === 'verified')

  // MFA policy: admins with an enrolled factor must be at AAL2.
  // Admins without a factor are allowed in only to reach the enrollment page —
  // page-level gating redirects them there.
  const mfaSatisfied = hasVerifiedFactor ? aal === 'aal2' : false

  return { user, role: profile.role, aal, hasVerifiedFactor, mfaSatisfied }
}

/**
 * Authorization guard for admin server actions.
 * Enforces: signed in + admin role + MFA (enrolled factor verified this session).
 */
export async function requireAdmin(): Promise<AdminContext> {
  const ctx = await getAdminContext()
  if (!ctx) throw new Error('Not authorized')
  if (!ctx.hasVerifiedFactor) throw new Error('MFA enrollment required — visit /admin/security')
  if (ctx.aal !== 'aal2') throw new Error('MFA verification required — visit /admin/verify')
  return ctx
}

export async function requireSuperAdmin(): Promise<AdminContext> {
  const ctx = await requireAdmin()
  if (ctx.role !== 'super_admin') throw new Error('Super admin only')
  return ctx
}

/** Append an entry to the immutable admin audit log (service role only table). */
export async function logAdminAction(
  ctx: AdminContext,
  action: string,
  targetType?: string,
  targetId?: string,
  detail?: Record<string, unknown>,
) {
  const service = createServiceClient()
  await service.from('admin_audit_log').insert({
    admin_id: ctx.user.id,
    admin_email: ctx.user.email,
    action,
    target_type: targetType ?? null,
    target_id: targetId ?? null,
    detail: detail ?? null,
  })
}
