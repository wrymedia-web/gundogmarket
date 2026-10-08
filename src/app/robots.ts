import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/admin', '/api', '/callback'],
    },
    sitemap: 'https://gundogexchange.com/sitemap.xml',
  }
}
