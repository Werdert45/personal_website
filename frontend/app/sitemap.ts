import type { MetadataRoute } from 'next'

// Generate at request time: at Docker build time the backend is unreachable,
// so a build-frozen sitemap would permanently miss every content slug.
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ianronk.nl'
  const locales = ['en', 'nl', 'de', 'it']

  const staticPages = ['', '/about', '/projects', '/thoughts', '/contact', '/privacy-policy', '/terms-of-service', '/cookie-policy']

  const staticEntries: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}${page}`,
      changeFrequency: page === '' ? 'weekly' as const : 'monthly' as const,
      priority: page === '' ? 1 : page === '/projects' ? 0.9 : 0.7,
    }))
  )

  const djangoUrl = process.env.DJANGO_API_URL || 'http://backend:8001'

  const contentDate = (item: any): { lastModified?: Date } => {
    const date = item.updated_at || item.published_at
    return date ? { lastModified: new Date(date) } : {}
  }

  let researchEntries: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${djangoUrl}/api/research/?status=published`, { cache: 'no-store' })
    if (res.ok) {
      const articles = await res.json()
      const articleList = Array.isArray(articles) ? articles : articles.results || []
      researchEntries = articleList.flatMap((article: any) =>
        locales.map((locale) => ({
          url: `${siteUrl}/${locale}/research/${article.slug}`,
          ...contentDate(article),
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        }))
      )
    } else {
      console.error('sitemap: research fetch failed', res.status)
    }
  } catch (err) {
    console.error('sitemap: research fetch failed', err)
  }

  let blogEntries: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${djangoUrl}/api/blog/?status=published`, { cache: 'no-store' })
    if (res.ok) {
      const posts = await res.json()
      const list = Array.isArray(posts) ? posts : posts.results || []
      blogEntries = list.flatMap((post: any) =>
        locales.map((locale) => ({
          url: `${siteUrl}/${locale}/thoughts/${post.slug}`,
          ...contentDate(post),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        }))
      )
    } else {
      console.error('sitemap: blog fetch failed', res.status)
    }
  } catch (err) {
    console.error('sitemap: blog fetch failed', err)
  }

  return [...staticEntries, ...researchEntries, ...blogEntries]
}
