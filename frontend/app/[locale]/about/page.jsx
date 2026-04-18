import { AboutContent } from "@/components/about-content";

export const metadata = {
  title: "About",
  description:
    "Ian Ronk - Head of Data at KR&A. Background in AI, geospatial analysis, and real estate data science. Based in Amsterdam.",
};

export default function AboutPage() {
  return (
    <main>
      <AboutContent />
    </main>
  );
}
