import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || supabaseUrl === 'your-supabase-url') {
    console.warn(
      '[GunDog Market] Supabase URL not configured. ' +
      'Copy .env.local and add your Supabase credentials. ' +
      'Running in mock-data mode.'
    )
  }

  if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key') {
    console.warn(
      '[GunDog Market] Supabase anon key not configured. ' +
      'Running in mock-data mode.'
    )
  }

  return createBrowserClient(
    supabaseUrl ?? 'https://placeholder.supabase.co',
    supabaseAnonKey ?? 'placeholder-anon-key'
  )
}
