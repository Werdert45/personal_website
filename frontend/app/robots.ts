import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ianronk.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin-portal/', '/api/', '/login/', '/crm/', '/en/work', '/nl/work', '/it/work', '/de/work'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
