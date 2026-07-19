import { ResearchList } from "@/components/research-list";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.com";
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

export default function ResearchPage() {
  return (
    <main>
      <ResearchList />
    </main>
  );
}
