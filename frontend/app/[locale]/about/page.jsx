import { AboutContent } from "@/components/about-content";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.com";
  const url = `${siteUrl}/${locale}/about`;
  return {
    title: "About",
    description:
      "Ian Ronk — geodata engineer and urban-dynamics researcher in Amsterdam. Production spatial systems (PostGIS, Airflow, ML) and research into how cities change; real estate is one application among several. Head of Data at KR&A.",
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/en/about`,
        nl: `${siteUrl}/nl/about`,
        de: `${siteUrl}/de/about`,
        it: `${siteUrl}/it/about`,
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
