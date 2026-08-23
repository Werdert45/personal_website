// Generate at request time: at Docker build time the backend is unreachable,
// so a build-frozen feed would permanently miss every content item.
export const dynamic = 'force-dynamic'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ianronk.nl'

const siteDescription =
  'Ian Ronk is Head of Data in Amsterdam. He builds and leads production data systems and the analytics on top: web-scraped market data, official statistics and time series, document pipelines on LLMs and OCR, and spatial and network data, with a research specialization in urban dynamics.'

function escapeXml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function parseDate(value: unknown): Date | null {
  if (!value) return null
  const raw = String(value).trim()
  if (!raw) return null
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    const parsed = new Date(raw)
    return isNaN(parsed.getTime()) ? null : parsed
  }
  const yearMonth = raw.match(/^(\d{4})-(\d{1,2})$/)
  if (yearMonth) {
    const month = Number(yearMonth[2])
    if (month >= 1 && month <= 12) {
      return new Date(Date.UTC(Number(yearMonth[1]), month - 1, 1))
    }
  }
  const year = raw.match(/^(\d{4})/)
  if (year && !/[A-Za-z]/.test(raw)) {
    return new Date(Date.UTC(Number(year[1]), 0, 1))
  }
  const fallback = new Date(raw)
  return isNaN(fallback.getTime()) ? null : fallback
}

async function fetchList(endpoint: string): Promise<any[]> {
  const djangoUrl = process.env.DJANGO_API_URL || 'http://backend:8001'
  const res = await fetch(`${djangoUrl}/api/${endpoint}/?status=published`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`${endpoint} fetch failed: ${res.status}`)
  const data = await res.json()
  return Array.isArray(data) ? data : data.results || []
}

interface FeedItem {
  title: string
  link: string
  date: Date | null
  description: string
}

export async function GET() {
  let items: FeedItem[] = []
  try {
    const [posts, papers] = await Promise.all([fetchList('blog'), fetchList('research')])
    items = [
      ...posts.map((post: any): FeedItem => ({
        title: post.title || '',
        link: `${siteUrl}/en/thoughts/${post.slug}`,
        date: parseDate(post.published_at) || parseDate(post.date),
        description: post.excerpt || '',
      })),
      ...papers.map((paper: any): FeedItem => ({
        title: paper.title || '',
        link: `${siteUrl}/en/research/${paper.slug}`,
        date: parseDate(paper.date),
        description: paper.abstract || paper.excerpt || '',
      })),
    ]
    items.sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
  } catch (err) {
    console.error('feed: content fetch failed', err)
    items = []
  }

  const itemsXml = items
    .map((item) => {
      const link = escapeXml(item.link)
      const parts = [
        `      <title>${escapeXml(item.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
      ]
      if (item.date) {
        parts.push(`      <pubDate>${item.date.toUTCString()}</pubDate>`)
      }
      parts.push(`      <dc:creator>Ian Ronk</dc:creator>`)
      if (item.description) {
        parts.push(`      <description>${escapeXml(item.description)}</description>`)
      }
      return `    <item>\n${parts.join('\n')}\n    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ian Ronk</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${siteUrl}/feed.xml`)}" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
