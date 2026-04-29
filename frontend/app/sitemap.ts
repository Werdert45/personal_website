import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ianronk.com'
  const locales = ['en', 'nl', 'it', 'de']

  const staticPages = ['', '/about', '/research', '/thoughts', '/contact', '/privacy-policy', '/terms-of-service', '/cookie-policy']

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'weekly' as const : 'monthly' as const,
      priority: page === '' ? 1 : page === '/research' ? 0.9 : 0.7,
    }))
  )

  const djangoUrl = process.env.DJANGO_API_URL || 'http://backend:8001'

  let researchEntries: MetadataRoute.Sitemap = []
  try {
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

  let blogEntries: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${djangoUrl}/api/blog/`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const posts = await res.json()
      const list = Array.isArray(posts) ? posts : posts.results || []
      blogEntries = list.flatMap((post: any) =>
        locales.map((locale) => ({
          url: `${siteUrl}/${locale}/thoughts/${post.slug}`,
          lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        }))
      )
    }
  } catch {
    // Backend might not be available during build
  }

  return [...staticEntries, ...researchEntries, ...blogEntries]
}
