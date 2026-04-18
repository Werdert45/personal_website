import { HeroSection } from "@/components/hero-section";
import { Marquee } from "@/components/marquee";
import { SkillsGrid } from "@/components/skills-grid";
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
      <SkillsGrid />
      <WritingTeaser />
      <ResearchPreview />
    </main>
  );
}
