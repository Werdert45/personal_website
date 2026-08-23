import { BlogList } from "@/components/blog-list";

export const revalidate = 300;

async function fetchList(endpoint) {
  try {
    const djangoUrl = process.env.DJANGO_API_URL || "http://backend:8001";
    const res = await fetch(`${djangoUrl}/api/${endpoint}/`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const results = data.results || data;
    return Array.isArray(results) && results.length ? results : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.nl";
  const url = `${siteUrl}/${locale}/thoughts`;
  return {
    title: "Work: case studies & field notes",
    description:
      "Case studies, papers and field notes from shipped data projects (pipelines, forecasting, geospatial methods) by Ian Ronk, data lead in Amsterdam.",
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/en/thoughts`,
        nl: `${siteUrl}/nl/thoughts`,
        de: `${siteUrl}/de/thoughts`,
        it: `${siteUrl}/it/thoughts`,
        "x-default": `${siteUrl}/en/thoughts`,
      },
    },
    openGraph: {
      title: "Work: case studies & field notes",
      description:
        "Case studies, papers and field notes from shipped data projects (pipelines, forecasting, geospatial methods) by Ian Ronk, data lead in Amsterdam.",
      url,
      type: "website",
    },
  };
}

export default async function BlogPage() {
  const [posts, research] = await Promise.all([
    fetchList("blog"),
    fetchList("research"),
  ]);
  // Papers only: project detail pages stay on /projects.
  const papers = (research || []).filter(
    (item) => (item.category || "").toLowerCase() !== "project"
  );
  return (
    <main>
      <BlogList initialPosts={posts || []} initialPapers={papers} />
    </main>
  );
}
