import { HeroSection } from "@/components/hero-section";
import { Marquee } from "@/components/marquee";
import { AboutTeaser } from "@/components/about-teaser";
import { SkillsGrid } from "@/components/skills-grid";
import { SectorsStrip } from "@/components/sectors-strip";
import { ProjectsGallery } from "@/components/projects-gallery";
import { WritingTeaser } from "@/components/writing-teaser";
import { ResearchPreview } from "@/components/research-preview";
import { PersonJsonLd, WebSiteJsonLd } from "@/components/json-ld";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.com";
  const url = `${siteUrl}/${locale}`;
  return {
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/en`,
        nl: `${siteUrl}/nl`,
        it: `${siteUrl}/it`,
        de: `${siteUrl}/de`,
        "x-default": `${siteUrl}/en`,
      },
    },
    openGraph: { url, type: "website" },
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
      <SkillsGrid />
      <SectorsStrip />
      <ProjectsGallery />
      <WritingTeaser locale={locale} />
      <ResearchPreview locale={locale} />
    </main>
  );
}
