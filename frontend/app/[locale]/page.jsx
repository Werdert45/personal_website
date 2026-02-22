import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { AboutSection } from "@/components/about-section";
import { ProjectsPreview } from "@/components/projects-preview";
import { ResearchPreview } from "@/components/research-preview";
import { ContactContent } from "@/components/contact-content";
import { Footer } from "@/components/footer";
import { PersonJsonLd, WebSiteJsonLd } from "@/components/json-ld";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <PersonJsonLd />
      <WebSiteJsonLd />
      <Navigation />
      <HeroSection />
      <AboutSection />
      <ProjectsPreview />
      <ResearchPreview />
      <ContactContent />
      <Footer />
    </main>
  );
}
