'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

// Unified analytics hub: one fbTrack() call fans out to Meta Pixel,
// Google Analytics 4, and our first-party /api/track store.
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

const GA_EVENT_MAP: Record<string, string> = {
  ViewContent: 'view_item',
  InitiateCheckout: 'begin_checkout',
  CompleteRegistration: 'sign_up',
  Lead: 'generate_lead',
}
const BACKEND_EVENT_MAP: Record<string, string> = {
  ViewContent: 'view_content',
  InitiateCheckout: 'initiate_checkout',
  CompleteRegistration: 'complete_registration',
  Lead: 'lead',
}

function visitorId(): string {
  try {
    let v = localStorage.getItem('gde_vid')
    if (!v) {
      v = crypto.randomUUID()
      localStorage.setItem('gde_vid', v)
    }
    return v
  } catch {
    return 'anon'
  }
}

function utm(): { utmSource?: string; utmMedium?: string; utmCampaign?: string } {
  try {
    const p = new URLSearchParams(window.location.search)
    const fresh = {
      utmSource: p.get('utm_source') ?? undefined,
      utmMedium: p.get('utm_medium') ?? undefined,
      utmCampaign: p.get('utm_campaign') ?? undefined,
    }
    if (fresh.utmSource) sessionStorage.setItem('gde_utm', JSON.stringify(fresh))
    const stored = sessionStorage.getItem('gde_utm')
    return fresh.utmSource ? fresh : stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function cookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return m ? decodeURIComponent(m[1]) : undefined
}

function beacon(event: string, props?: Record<string, unknown>, eventId?: string) {
  try {
    const payload = JSON.stringify({
      event,
      eventId,
      path: window.location.pathname,
      visitorId: visitorId(),
      referrer: document.referrer || undefined,
      listingId: props?.content_ids ? (props.content_ids as string[])[0] : undefined,
      value: typeof props?.value === 'number' ? props.value : undefined,
      fbp: cookie('_fbp'),
      fbc: cookie('_fbc'),
      ...utm(),
    })
    if (navigator.sendBeacon) navigator.sendBeacon('/api/track', payload)
    else fetch('/api/track', { method: 'POST', body: payload, keepalive: true })
  } catch { /* never break the page for analytics */ }
}

/** First-party-only event (site_events via /api/track) — for funnel steps
 *  that aren't Meta/GA standard events, e.g. sell-flow progression. */
export function trackEvent(event: string) {
  if (typeof window === 'undefined') return
  beacon(event)
}

/** Fire an event everywhere: Meta Pixel + GA4 + first-party store. */
export function fbTrack(event: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  // Shared event_id lets the server-side Conversions API mirror deduplicate
  // against this browser event in Meta.
  const eventId = crypto.randomUUID()
  if (window.fbq) window.fbq('track', event, params ?? {}, { eventID: eventId })
  const gaEvent = GA_EVENT_MAP[event]
  if (gaEvent && window.gtag) window.gtag('event', gaEvent, { value: params?.value, currency: params?.currency })
  const beEvent = BACKEND_EVENT_MAP[event]
  if (beEvent) beacon(beEvent, params, eventId)
}

export default function MetaPixel() {
  const pathname = usePathname()

  useEffect(() => {
    if (PIXEL_ID && window.fbq) window.fbq('track', 'PageView')
    if (GA_ID && window.gtag) window.gtag('event', 'page_view', { page_path: pathname })
    beacon('page_view')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <>
      {PIXEL_ID && (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img height="1" width="1" style={{ display: 'none' }} alt=""
              src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`} />
          </noscript>
        </>
      )}
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
          </Script>
        </>
      )}
    </>
  )
}
