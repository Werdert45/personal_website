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
  const url = `${siteUrl}/${locale}/research`;
  return {
    title: "Academics — papers & publications",
    description:
      "Papers and publications on urban dynamics, network analysis and geospatial methods by Ian Ronk — gentrification, accessibility, housing markets.",
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/en/research`,
        nl: `${siteUrl}/nl/research`,
        de: `${siteUrl}/de/research`,
        it: `${siteUrl}/it/research`,
        "x-default": `${siteUrl}/en/research`,
      },
    },
    openGraph: {
      title: "Academics — papers & publications",
      description:
        "Papers and publications on urban dynamics, network analysis and geospatial methods by Ian Ronk — gentrification, accessibility, housing markets.",
      url,
      type: "website",
    },
  };
}

export default async function ResearchPage() {
  const items = await fetchResearchList();
  return (
    <main>
      <ResearchList initialItems={items || []} />
    </main>
  );
}
