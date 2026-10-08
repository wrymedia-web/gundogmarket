'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { requireAdmin, requireSuperAdmin, logAdminAction } from '@/lib/admin'
import { revalidatePath } from 'next/cache'
import Stripe from 'stripe'

// ---------- Users ----------

export async function updateUser(userId: string, formData: FormData) {
  const ctx = await requireAdmin()
  const service = createServiceClient()

  const updates: Record<string, unknown> = {}
  const fields = ['full_name', 'kennel_name', 'location_state', 'location_city', 'phone', 'bio', 'website']
  for (const f of fields) {
    const val = formData.get(f)
    if (val !== null) updates[f] = (val as string) || null
  }

  const trustFields = ['subscription_tier', 'verification_status']
  for (const f of trustFields) {
    const val = formData.get(f)
    if (val !== null) updates[f] = val as string
  }

  // Role changes are super-admin only; silently ignored for regular admins
  const requestedRole = formData.get('role')
  if (requestedRole !== null && ctx.role === 'super_admin') {
    updates.role = requestedRole as string
  }

  updates.verified = formData.get('verified') === 'on'
  updates.breeder_pro = formData.get('breeder_pro') === 'on'

  const { error } = await service.from('profiles').update(updates).eq('id', userId)
  if (error) throw new Error(error.message)

  await logAdminAction(ctx, 'user_updated', 'user', userId, { fields: Object.keys(updates) })
  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)
}

export async function banUser(userId: string) {
  const ctx = await requireAdmin()
  if (userId === ctx.user.id) throw new Error('You cannot ban yourself')
  const service = createServiceClient()
  const { data: target } = await service.from('profiles').select('role').eq('id', userId).maybeSingle()
  if ((target?.role === 'admin' || target?.role === 'super_admin') && ctx.role !== 'super_admin') {
    throw new Error('Only a super admin can ban an admin')
  }
  const { error } = await service.auth.admin.updateUserById(userId, { ban_duration: '876000h' }) // ~100 years
  if (error) throw new Error(error.message)
  await logAdminAction(ctx, 'user_banned', 'user', userId)
  revalidatePath(`/admin/users/${userId}`)
  revalidatePath('/admin/users')
}

export async function unbanUser(userId: string) {
  const ctx = await requireAdmin()
  const service = createServiceClient()
  const { error } = await service.auth.admin.updateUserById(userId, { ban_duration: 'none' })
  if (error) throw new Error(error.message)
  await logAdminAction(ctx, 'user_unbanned', 'user', userId)
  revalidatePath(`/admin/users/${userId}`)
  revalidatePath('/admin/users')
}

export async function sendPasswordReset(userId: string) {
  const ctx = await requireAdmin()
  const service = createServiceClient()
  const { data } = await service.auth.admin.getUserById(userId)
  const email = data?.user?.email
  if (!email) throw new Error('User has no email')
  // Anon-key flow sends the standard recovery email via the configured SMTP
  const { createClient: createBrowserless } = await import('@supabase/supabase-js')
  const anon = createBrowserless(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { error } = await anon.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://gundogexchange.com/callback?next=/reset-password',
  })
  if (error) throw new Error(error.message)
  await logAdminAction(ctx, 'password_reset_sent', 'user', userId, { email })
}

export async function grantCompPro(userId: string) {
  const ctx = await requireAdmin()
  const service = createServiceClient()
  const { error } = await service.from('profiles').update({
    subscription_tier: 'pro',
    subscription_status: 'active',
    breeder_pro: true,
  }).eq('id', userId)
  if (error) throw new Error(error.message)
  await logAdminAction(ctx, 'comp_subscription_granted', 'user', userId, { tier: 'pro' })
  revalidatePath(`/admin/users/${userId}`)
  revalidatePath('/admin/subscriptions')
}

export async function revokeCompPro(userId: string) {
  const ctx = await requireAdmin()
  const service = createServiceClient()
  const { data: prof } = await service.from('profiles').select('stripe_subscription_id').eq('id', userId).maybeSingle()
  if (prof?.stripe_subscription_id && !prof.stripe_subscription_id.startsWith('sub_qa')) {
    throw new Error('User has a real Stripe subscription — cancel it in Stripe instead')
  }
  const { error } = await service.from('profiles').update({
    subscription_tier: 'free',
    subscription_status: null,
    breeder_pro: false,
  }).eq('id', userId)
  if (error) throw new Error(error.message)
  await logAdminAction(ctx, 'comp_subscription_revoked', 'user', userId)
  revalidatePath(`/admin/users/${userId}`)
  revalidatePath('/admin/subscriptions')
}

export async function deleteUser(userId: string) {
  const ctx = await requireSuperAdmin()
  if (userId === ctx.user.id) throw new Error('You cannot delete yourself')
  const service = createServiceClient()
  const { error: dogsErr } = await service.from('dogs').delete().eq('seller_id', userId)
  if (dogsErr) throw new Error(dogsErr.message)
  const { error } = await service.from('profiles').delete().eq('id', userId)
  if (error) throw new Error(error.message)
  const { error: authErr } = await service.auth.admin.deleteUser(userId)
  if (authErr) throw new Error(authErr.message)
  await logAdminAction(ctx, 'user_deleted', 'user', userId)
  revalidatePath('/admin/users')
}

// ---------- Listings ----------

export async function updateListing(dogId: string, formData: FormData) {
  const ctx = await requireAdmin()
  const service = createServiceClient()

  const priceDollars = parseFloat(formData.get('price') as string || '0')
  const updates: Record<string, unknown> = {
    title: formData.get('title') || null,
    breed: formData.get('breed') || null,
    age_months: parseInt(formData.get('age_months') as string || '0', 10) || null,
    gender: formData.get('gender') || null,
    training_level: formData.get('training_level') || null,
    price: Math.round(priceDollars * 100),
    location_state: formData.get('location_state') || null,
    location_city: formData.get('location_city') || null,
    description: formData.get('description') || null,
    status: formData.get('status') || 'active',
    featured: formData.get('featured') === 'on',
    video_url: formData.get('video_url') || null,
    pedigree_url: formData.get('pedigree_url') || null,
  }

  const { error } = await service.from('dogs').update(updates).eq('id', dogId)
  if (error) throw new Error(error.message)

  await logAdminAction(ctx, 'listing_updated', 'listing', dogId, { status: updates.status, featured: updates.featured })
  revalidatePath('/admin/listings')
  revalidatePath(`/admin/listings/${dogId}`)
  revalidatePath('/dogs')
  revalidatePath(`/dogs/${dogId}`)
}

export async function deleteListing(dogId: string) {
  const ctx = await requireAdmin()
  const service = createServiceClient()
  const { data: dog } = await service.from('dogs').select('title, seller_id').eq('id', dogId).maybeSingle()
  const { error } = await service.from('dogs').delete().eq('id', dogId)
  if (error) throw new Error(error.message)
  await logAdminAction(ctx, 'listing_deleted', 'listing', dogId, { title: dog?.title })
  revalidatePath('/admin/listings')
  revalidatePath('/dogs')
}

export async function removeListingPhoto(dogId: string, url: string) {
  const ctx = await requireAdmin()
  const service = createServiceClient()
  const { data: dog } = await service.from('dogs').select('images').eq('id', dogId).single()
  const images = (dog?.images as string[] ?? []).filter((u) => u !== url)
  const { error } = await service.from('dogs').update({ images }).eq('id', dogId)
  if (error) throw new Error(error.message)
  await logAdminAction(ctx, 'listing_photo_removed', 'listing', dogId)
  revalidatePath(`/admin/listings/${dogId}`)
  revalidatePath(`/dogs/${dogId}`)
}

export async function makeListingPhotoPrimary(dogId: string, url: string) {
  const ctx = await requireAdmin()
  const service = createServiceClient()
  const { data: dog } = await service.from('dogs').select('images').eq('id', dogId).single()
  const rest = (dog?.images as string[] ?? []).filter((u) => u !== url)
  const { error } = await service.from('dogs').update({ images: [url, ...rest] }).eq('id', dogId)
  if (error) throw new Error(error.message)
  await logAdminAction(ctx, 'listing_photo_reordered', 'listing', dogId)
  revalidatePath(`/admin/listings/${dogId}`)
  revalidatePath(`/dogs/${dogId}`)
}

export async function reassignListing(dogId: string, formData: FormData) {
  const ctx = await requireAdmin()
  const newSellerId = formData.get('new_seller_id') as string
  if (!newSellerId) throw new Error('Pick a seller')
  const service = createServiceClient()
  const { error } = await service.from('dogs').update({ seller_id: newSellerId }).eq('id', dogId)
  if (error) throw new Error(error.message)
  await logAdminAction(ctx, 'listing_reassigned', 'listing', dogId, { new_seller_id: newSellerId })
  revalidatePath(`/admin/listings/${dogId}`)
}

// ---------- Payments ----------

export async function refundPayment(paymentIntentId: string) {
  const ctx = await requireSuperAdmin()
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) throw new Error('Stripe not configured')
  const stripe = new Stripe(secret)
  const refund = await stripe.refunds.create({ payment_intent: paymentIntentId })
  await logAdminAction(ctx, 'payment_refunded', 'payment', paymentIntentId, { refund_id: refund.id, amount: refund.amount })
  revalidatePath('/admin/payments')
}

// ---------- Admin accounts (Settings) ----------

export async function inviteAdmin(formData: FormData) {
  const ctx = await requireSuperAdmin()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const role = (formData.get('role') as string) === 'super_admin' ? 'super_admin' : 'admin'
  if (!email || !email.includes('@')) throw new Error('Valid email required')
  const service = createServiceClient()

  // Existing account → upgrade; otherwise invite (sends activation email)
  const { data: list } = await service.auth.admin.listUsers({ perPage: 1000 })
  let userId = list?.users?.find((u) => u.email === email)?.id
  if (!userId) {
    const { data, error } = await service.auth.admin.inviteUserByEmail(email, {
      redirectTo: 'https://gundogexchange.com/callback?next=/reset-password',
    })
    if (error) throw new Error(error.message)
    userId = data.user?.id
  }
  if (!userId) throw new Error('Could not resolve user')

  const { error: roleErr } = await service.from('profiles').update({ role }).eq('id', userId)
  if (roleErr) throw new Error(roleErr.message)

  await logAdminAction(ctx, 'admin_invited', 'user', userId, { email, role })
  revalidatePath('/admin/settings')
}

export async function setUserRole(userId: string, formData: FormData) {
  const ctx = await requireSuperAdmin()
  const role = formData.get('role') as string
  if (!['user', 'admin', 'super_admin'].includes(role)) throw new Error('Invalid role')
  if (userId === ctx.user.id && role !== 'super_admin') throw new Error('You cannot demote yourself')
  const service = createServiceClient()
  const { error } = await service.from('profiles').update({ role }).eq('id', userId)
  if (error) throw new Error(error.message)
  await logAdminAction(ctx, 'role_changed', 'user', userId, { role })
  revalidatePath('/admin/settings')
  revalidatePath(`/admin/users/${userId}`)
}
