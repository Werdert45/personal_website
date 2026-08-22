import { ProjectsGallery } from "@/components/projects-gallery";
import { ResearchList } from "@/components/research-list";

export const revalidate = 300;

async function fetchResearchList() {
  try {
    const djangoUrl = process.env.DJANGO_API_URL || "http://backend:8001";
    const res = await fetch(`${djangoUrl}/api/research/`, {
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
  const url = `${siteUrl}/${locale}/projects`;
  const description =
    "Projects and papers by Ian Ronk — production data systems, shipped products, and research on urban dynamics, housing markets and geospatial methods.";
  return {
    title: "Projects & Papers",
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/en/projects`,
        nl: `${siteUrl}/nl/projects`,
        de: `${siteUrl}/de/projects`,
        it: `${siteUrl}/it/projects`,
        "x-default": `${siteUrl}/en/projects`,
      },
    },
    openGraph: { title: "Projects & Papers", description, url, type: "website" },
  };
}

export default async function ProjectsPage() {
  const items = await fetchResearchList();
  const papers = (items || []).filter((i) => (i.category || "").toLowerCase() !== "project");
  return (
    <main style={{ paddingTop: 96 }}>
      <ProjectsGallery />
      <ResearchList initialItems={papers} />
    </main>
  );
}
