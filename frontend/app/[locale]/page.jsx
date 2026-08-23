import { HeroSection } from "@/components/hero-section";
import { Marquee } from "@/components/marquee";
import { AboutTeaser } from "@/components/about-teaser";
import { FourLanes } from "@/components/four-lanes";
import { ProjectsGallery } from "@/components/projects-gallery";
import { PapersSection } from "@/components/papers-section";
import { ContactBand } from "@/components/contact-band";
import { PersonJsonLd, WebSiteJsonLd } from "@/components/json-ld";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.nl";
  const url = `${siteUrl}/${locale}`;
  return {
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/en`,
        nl: `${siteUrl}/nl`,
        de: `${siteUrl}/de`,
        it: `${siteUrl}/it`,
        "x-default": `${siteUrl}/en`,
      },
    },
    openGraph: { url, type: "website", images: ["/og.png"] },
  };
}

export default async function HomePage({ params }) {
  const { locale } = await params;
  return (
    <main>
      <PersonJsonLd />
      <WebSiteJsonLd />
      <HeroSection />
      <Marquee />
      <AboutTeaser />
      <FourLanes />
      <ProjectsGallery />
      <PapersSection locale={locale} />
      <ContactBand />
    </main>
  );
}
