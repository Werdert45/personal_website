import { AboutContent } from "@/components/about-content";
import { PublicationsList } from "@/components/publications-list";
import { ProfilePageJsonLd } from "@/components/json-ld";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.nl";
  const url = `${siteUrl}/${locale}/about`;
  return {
    title: "Resume & competences — Head of Data",
    description:
      "Resume of Ian Ronk — data lead and geodata specialist based in Amsterdam: competences across big data, network science, forecasting and spatial analysis, plus experience, education and publications.",
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
    openGraph: {
      title: "Resume & competences — Head of Data",
      description:
        "Resume of Ian Ronk — data lead and geodata specialist based in Amsterdam: competences across big data, network science, forecasting and spatial analysis, plus experience, education and publications.",
      url,
      type: "website",
    },
  };
}

export default async function AboutPage({ params }) {
  const { locale } = await params;

  return (
    <main>
      <ProfilePageJsonLd />
      <AboutContent />
      <PublicationsList locale={locale} />
    </main>
  );
}
