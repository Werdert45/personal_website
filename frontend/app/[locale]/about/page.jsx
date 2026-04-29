import { AboutContent } from "@/components/about-content";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.com";
  const url = `${siteUrl}/${locale}/about`;
  return {
    title: "About",
    description:
      "Ian Ronk — Head of Data at KR&A. Background in AI, geospatial analysis, and real estate data science. Based in Amsterdam.",
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/en/about`,
        nl: `${siteUrl}/nl/about`,
        it: `${siteUrl}/it/about`,
        de: `${siteUrl}/de/about`,
        "x-default": `${siteUrl}/en/about`,
      },
    },
    openGraph: { url, type: "website" },
  };
}

export default function AboutPage() {
  return (
    <main>
      <AboutContent />
    </main>
  );
}
