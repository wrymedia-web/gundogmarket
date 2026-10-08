import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600

const BASE = 'https://gundogexchange.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    '', '/dogs', '/sell', '/login', '/signup', '/upgrade', '/terms', '/privacy',
  ].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: path === '/dogs' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.6,
  }))

  let dogRoutes: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    const { data: dogs } = await supabase
      .from('dogs')
      .select('id, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1000)
    dogRoutes = (dogs ?? []).map((d) => ({
      url: `${BASE}/dogs/${d.id}`,
      lastModified: d.created_at ? new Date(d.created_at) : undefined,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch {
    // If the DB is unreachable at build/request time, still return static routes.
  }

  return [...staticRoutes, ...dogRoutes]
}
