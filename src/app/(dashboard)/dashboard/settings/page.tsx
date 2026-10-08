import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsClient from './settings-client'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/settings')

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status, subscription_current_period_end, subscription_cancel_at, stripe_customer_id')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <SettingsClient
      email={user.email ?? ''}
      tier={profile?.subscription_tier ?? 'free'}
      status={profile?.subscription_status ?? null}
      periodEnd={profile?.subscription_current_period_end ?? null}
      cancelAt={profile?.subscription_cancel_at ?? null}
      hasBilling={!!profile?.stripe_customer_id}
    />
  )
}
