import crypto from 'crypto'

// Meta Conversions API sender. Server-side mirror of the browser pixel:
// browser fires fbq() with an eventID, we send the same event_id here so
// Meta deduplicates. Events that only exist server-side (StartTrial,
// Subscribe from Stripe webhooks) have no browser twin and need stable
// event_ids so webhook retries don't double-count.
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const CAPI_TOKEN = process.env.META_CAPI_TOKEN
const API = 'https://graph.facebook.com/v21.0'

export function sha256(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

export type CapiUserData = {
  email?: string | null
  userId?: string | null
  clientIp?: string | null
  userAgent?: string | null
  fbp?: string | null
  fbc?: string | null
}

export type CapiEvent = {
  eventName: string
  eventId: string
  eventSourceUrl?: string
  user: CapiUserData
  customData?: Record<string, unknown>
}

/** Fire-and-forget: tracking must never break checkout or the webhook. */
export async function capiSend(events: CapiEvent[]): Promise<void> {
  if (!PIXEL_ID || !CAPI_TOKEN || events.length === 0) return
  const data = events.map((e) => ({
    event_name: e.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: e.eventId,
    action_source: 'website',
    ...(e.eventSourceUrl ? { event_source_url: e.eventSourceUrl } : {}),
    user_data: {
      ...(e.user.email ? { em: [sha256(e.user.email)] } : {}),
      ...(e.user.userId ? { external_id: [sha256(e.user.userId)] } : {}),
      ...(e.user.clientIp ? { client_ip_address: e.user.clientIp } : {}),
      ...(e.user.userAgent ? { client_user_agent: e.user.userAgent } : {}),
      ...(e.user.fbp ? { fbp: e.user.fbp } : {}),
      ...(e.user.fbc ? { fbc: e.user.fbc } : {}),
    },
    ...(e.customData ? { custom_data: e.customData } : {}),
  }))
  try {
    const res = await fetch(`${API}/${PIXEL_ID}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data, access_token: CAPI_TOKEN }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error('meta-capi error', res.status, body.slice(0, 300))
    }
  } catch (err) {
    console.error('meta-capi send failed', err)
  }
}
