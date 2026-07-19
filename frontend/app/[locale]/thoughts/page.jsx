import { BlogList } from "@/components/blog-list";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.com";
  const url = `${siteUrl}/${locale}/thoughts`;
  return {
    title: "Work — case studies & field notes",
    description:
      "Case studies and field notes from shipped data projects — pipelines, forecasting, geospatial methods — by Ian Ronk, data lead in Amsterdam.",
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
      title: "Work — case studies & field notes",
      description:
        "Case studies and field notes from shipped data projects — pipelines, forecasting, geospatial methods — by Ian Ronk, data lead in Amsterdam.",
      url,
      type: "website",
    },
  };
}

export default function BlogPage() {
  return (
    <main>
      <BlogList />
    </main>
  );
}
