'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return { supabase, user }
}

export async function updateMyListing(dogId: string, formData: FormData) {
  const { supabase, user } = await getUser()

  // Verify ownership
  const { data: dog } = await supabase
    .from('dogs')
    .select('seller_id')
    .eq('id', dogId)
    .maybeSingle()
  if (!dog || dog.seller_id !== user.id) throw new Error('Not your listing')

  const priceDollars = parseFloat(formData.get('price') as string || '0')
  const ageYears = parseInt(formData.get('age_years') as string || '0', 10) || 0
  const ageMonthsRem = parseInt(formData.get('age_months_rem') as string || '0', 10) || 0
  const totalAgeMonths = (ageYears || ageMonthsRem) ? (ageYears * 12 + ageMonthsRem) : null
  const updates: Record<string, unknown> = {
    title: formData.get('title') || null,
    breed: formData.get('breed') || null,
    age_months: totalAgeMonths,
    gender: formData.get('gender') || null,
    training_level: formData.get('training_level') || null,
    price: Math.round(priceDollars * 100),
    location_state: formData.get('location_state') || null,
    location_city: formData.get('location_city') || null,
    description: formData.get('description') || null,
    status: formData.get('status') || 'active',
    video_url: formData.get('video_url') || null,
    pedigree_url: formData.get('pedigree_url') || null,
  }

  const { error } = await supabase.from('dogs').update(updates).eq('id', dogId)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/edit/${dogId}`)
}

export async function deleteMyListing(dogId: string) {
  const { supabase, user } = await getUser()

  const { data: dog } = await supabase
    .from('dogs')
    .select('seller_id')
    .eq('id', dogId)
    .maybeSingle()
  if (!dog || dog.seller_id !== user.id) throw new Error('Not your listing')

  const { error } = await supabase.from('dogs').delete().eq('id', dogId)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
}

export async function setMyListingStatus(dogId: string, status: 'active' | 'sold' | 'draft') {
  const { supabase, user } = await getUser()

  const { data: dog } = await supabase
    .from('dogs')
    .select('seller_id')
    .eq('id', dogId)
    .maybeSingle()
  if (!dog || dog.seller_id !== user.id) throw new Error('Not your listing')

  const { error } = await supabase.from('dogs').update({ status }).eq('id', dogId)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
}

export async function updateMyProfile(formData: FormData) {
  const { supabase, user } = await getUser()

  // Only self-editable columns. Trust columns (verified, rating, subscription_*,
  // role, verification_status) are protected by the protect_trust_columns trigger.
  const updates: Record<string, unknown> = {
    full_name: (formData.get('full_name') as string)?.trim() || null,
    kennel_name: (formData.get('kennel_name') as string)?.trim() || null,
    location_city: (formData.get('location_city') as string)?.trim() || null,
    location_state: (formData.get('location_state') as string)?.trim() || null,
    phone: (formData.get('phone') as string)?.trim() || null,
    website: (formData.get('website') as string)?.trim() || null,
    bio: (formData.get('bio') as string)?.trim() || null,
  }

  const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard')
}
