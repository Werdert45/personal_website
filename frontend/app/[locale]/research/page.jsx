import { ResearchList } from "@/components/research-list";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.com";
  const url = `${siteUrl}/${locale}/research`;
  return {
    title: "Research & Publications",
    description:
      "Research papers, case studies, and technical articles on GIS, real estate analytics, machine learning, and geospatial data science by Ian Ronk.",
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/en/research`,
        nl: `${siteUrl}/nl/research`,
        it: `${siteUrl}/it/research`,
        de: `${siteUrl}/de/research`,
        "x-default": `${siteUrl}/en/research`,
      },
    },
    openGraph: {
      title: "Research & Publications | Ian Ronk",
      description:
        "Research papers, case studies, and technical articles on GIS, real estate analytics, machine learning, and geospatial data science.",
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
