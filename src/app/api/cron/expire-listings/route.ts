import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Cron endpoint: deactivates free-tier listings whose listing_expires_at has passed.
 * Call via Vercel Cron or external scheduler with Authorization: Bearer <CRON_SECRET>.
 *
 * Expired listings are set to 'draft' (retained for future upgrades, not deleted).
 */
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  )

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('dogs')
    .update({ status: 'draft' })
    .eq('status', 'active')
    .not('listing_expires_at', 'is', null)
    .lt('listing_expires_at', now)
    .select('id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    expired: data?.length ?? 0,
    timestamp: now,
  })
}
