import { BlogList } from "@/components/blog-list";

export const revalidate = 300;

async function fetchBlogList() {
  try {
    const djangoUrl = process.env.DJANGO_API_URL || "http://backend:8001";
    const res = await fetch(`${djangoUrl}/api/blog/`, {
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
      "Case studies and field notes from shipped data projects (pipelines, forecasting, geospatial methods) by Ian Ronk, data lead in Amsterdam.",
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
        "Case studies and field notes from shipped data projects (pipelines, forecasting, geospatial methods) by Ian Ronk, data lead in Amsterdam.",
      url,
      type: "website",
    },
  };
}

export default async function BlogPage() {
  const posts = await fetchBlogList();
  return (
    <main>
      <BlogList initialPosts={posts || []} />
    </main>
  );
}
