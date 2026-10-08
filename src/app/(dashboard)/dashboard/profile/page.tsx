import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './profile-form'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/profile')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, kennel_name, location_city, location_state, phone, website, bio, verified, verification_status, subscription_tier')
    .eq('id', user.id)
    .maybeSingle()

  return <ProfileForm profile={profile ?? {}} email={user.email ?? ''} />
}
