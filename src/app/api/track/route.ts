import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

const ALLOWED = new Set([
  'page_view', 'view_content', 'initiate_checkout', 'complete_registration', 'lead', 'add_slot',
  // seller listing funnel
  'sell_start', 'sell_step_details', 'sell_step_media', 'sell_step_review', 'sell_published',
])
const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : null)

export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    const raw = await req.text()
    if (raw.length > 2000) return new NextResponse(null, { status: 204 })
    body = JSON.parse(raw)
  } catch {
    return new NextResponse(null, { status: 204 })
  }

  const event = clip(body.event, 40)
  if (!event || !ALLOWED.has(event)) return new NextResponse(null, { status: 204 })

  const listingId = typeof body.listingId === 'string' && /^[0-9a-f-]{36}$/.test(body.listingId) ? body.listingId : null

  const service = createServiceClient()
  await service.from('site_events').insert({
    event,
    path: clip(body.path, 200),
    listing_id: listingId,
    visitor_id: clip(body.visitorId, 64),
    utm_source: clip(body.utmSource, 60),
    utm_medium: clip(body.utmMedium, 60),
    utm_campaign: clip(body.utmCampaign, 60),
    referrer: clip(body.referrer, 200),
  }).then(() => {}, () => {}) // analytics must never error the client

  return new NextResponse(null, { status: 204 })
}
