// Generate at request time: at Docker build time the backend is unreachable,
// so a build-frozen llms-full.txt would permanently miss every content slug.
export const dynamic = 'force-dynamic'

const preamble = (siteUrl: string) => `# Ian Ronk · ianronk.nl

> Ian Ronk is Head of Data in Amsterdam. He builds and leads production data systems and the analytics on top: web-scraped market data, official statistics and time series, document pipelines on LLMs and OCR, and spatial and network data, with a research specialization in urban dynamics. Head of Data at KR&A; MSc Data Science (Bocconi), BSc Artificial Intelligence (University of Amsterdam).

## Key pages
- [About / resume](${siteUrl}/en/about): competences, experience, education, publications
- [Work](${siteUrl}/en/thoughts): case studies and field notes
- [Papers & projects](${siteUrl}/en/projects): papers and project write-ups
- [Contact](${siteUrl}/en/contact): get in touch

## Competences
Big data pipelines · Network science · Time-series forecasting & nowcasting · Spatial analysis (PostGIS, H3, agent-based models) · Product ownership & team leadership

## Evidence
- Monthly EU house-price index across 13 countries, tested with Eurostat
- Connectivity/walkability score at parcel resolution: 13-server build, on budget, two weeks ahead of plan
- Three-year weekly scrape: 300k records a week across 8 protected sources; used by statistics bureaus`

const stripItalics = (text: string) => text.replace(/[*_]/g, '')

async function fetchList(endpoint: string): Promise<any[] | null> {
  const djangoUrl = process.env.DJANGO_API_URL || 'http://backend:8001'
  try {
    const res = await fetch(`${djangoUrl}/api/${endpoint}/?status=published`, { cache: 'no-store' })
    if (!res.ok) {
      console.error(`llms-full.txt: ${endpoint} fetch failed`, res.status)
      return null
    }
    const data = await res.json()
    return Array.isArray(data) ? data : data.results || []
  } catch (err) {
    console.error(`llms-full.txt: ${endpoint} fetch failed`, err)
    return null
  }
}

async function fetchDetail(endpoint: string, slug: string): Promise<any | null> {
  const djangoUrl = process.env.DJANGO_API_URL || 'http://backend:8001'
  try {
    const res = await fetch(`${djangoUrl}/api/${endpoint}/${slug}/`, { cache: 'no-store' })
    if (!res.ok) {
      console.error(`llms-full.txt: ${endpoint}/${slug} fetch failed`, res.status)
      return null
    }
    return await res.json()
  } catch (err) {
    console.error(`llms-full.txt: ${endpoint}/${slug} fetch failed`, err)
    return null
  }
}

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ianronk.nl'
  const [posts, papers] = await Promise.all([fetchList('blog'), fetchList('research')])

  const items = [
    ...(posts || []).map((post: any) => ({ endpoint: 'blog', path: 'thoughts', slug: post.slug })),
    ...(papers || []).map((paper: any) => ({ endpoint: 'research', path: 'research', slug: paper.slug })),
  ]

  const entries = await Promise.all(
    items.map(async (item) => {
      const detail = await fetchDetail(item.endpoint, item.slug)
      if (!detail || !detail.content) return null
      const lines = [
        `# ${stripItalics(detail.title || '')}`,
        '',
        `Canonical: ${siteUrl}/en/${item.path}/${item.slug}`,
      ]
      const date = detail.published_at || detail.date
      if (date) lines.push(`Date: ${date}`)
      lines.push('', detail.content.trim())
      return lines.join('\n')
    })
  )

  const sections = [preamble(siteUrl), ...entries.filter(Boolean)]

  return new Response(sections.join('\n\n---\n\n') + '\n', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
