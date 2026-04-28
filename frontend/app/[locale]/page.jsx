import { HeroSection } from "@/components/hero-section";
import { Marquee } from "@/components/marquee";
import { AboutTeaser } from "@/components/about-teaser";
import { SkillsGrid } from "@/components/skills-grid";
import { SectorsStrip } from "@/components/sectors-strip";
import { ProjectsGallery } from "@/components/projects-gallery";
import { WritingTeaser } from "@/components/writing-teaser";
import { ResearchPreview } from "@/components/research-preview";
import { PersonJsonLd, WebSiteJsonLd } from "@/components/json-ld";

export default function HomePage() {
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
      <WritingTeaser />
      <ResearchPreview />
    </main>
  );
}
