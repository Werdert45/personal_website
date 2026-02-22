import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ianronk.com'
  const locales = ['en', 'nl', 'it']

  const staticPages = ['', '/research', '/visualizations', '/contact', '/privacy-policy', '/terms-of-service', '/cookie-policy']

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'weekly' as const : 'monthly' as const,
      priority: page === '' ? 1 : page === '/research' ? 0.9 : 0.7,
    }))
  )

  // Fetch research articles for dynamic sitemap entries
  let researchEntries: MetadataRoute.Sitemap = []
  try {
    const djangoUrl = process.env.DJANGO_API_URL || 'http://backend:8001'
    const res = await fetch(`${djangoUrl}/api/research/`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const articles = await res.json()
      researchEntries = (articles || []).flatMap((article: any) =>
        locales.map((locale) => ({
          url: `${siteUrl}/${locale}/research/${article.slug}`,
          lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        }))
      )
    }
  } catch {
    // Backend might not be available during build
  }

  // Fetch visualizations
  let vizEntries: MetadataRoute.Sitemap = []
  try {
    const djangoUrl = process.env.DJANGO_API_URL || 'http://backend:8001'
    const res = await fetch(`${djangoUrl}/api/research/visualizations/`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const vizs = await res.json()
      vizEntries = (vizs || []).flatMap((viz: any) =>
        locales.map((locale) => ({
          url: `${siteUrl}/${locale}/visualizations/${viz.slug}`,
          lastModified: viz.updated_at ? new Date(viz.updated_at) : new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        }))
      )
    }
  } catch {
    // Backend might not be available during build
  }

  return [...staticEntries, ...researchEntries, ...vizEntries]
}
