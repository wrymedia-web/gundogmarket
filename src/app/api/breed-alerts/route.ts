import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ALL_BREEDS } from '@/lib/mock-data'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'Alerts are not available right now.' }, { status: 503 })
  }

  let body: { email?: string; breed?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const email = (body.email ?? '').trim().toLowerCase()
  const breed = (body.breed ?? '').trim()
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }
  if (breed !== 'All Breeds' && !ALL_BREEDS.includes(breed)) {
    return NextResponse.json({ error: 'Pick a breed from the list.' }, { status: 400 })
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })
  const { error } = await supabase
    .from('breed_alerts')
    .upsert({ email, breed }, { onConflict: 'email,breed', ignoreDuplicates: true })

  if (error) {
    console.error('[breed-alerts] insert failed', error)
    return NextResponse.json({ error: 'Could not save your alert. Try again.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
