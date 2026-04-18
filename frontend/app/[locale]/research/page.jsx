import { ResearchList } from "@/components/research-list";

export const metadata = {
  title: "Research & Publications",
  description:
    "Research papers, case studies, and technical articles on GIS, real estate analytics, machine learning, and geospatial data science by Ian Ronk.",
  openGraph: {
    title: "Research & Publications | Ian Ronk",
    description:
      "Research papers, case studies, and technical articles on GIS, real estate analytics, machine learning, and geospatial data science.",
    type: "website",
  },
};

export default function ResearchPage() {
  return (
    <main>
      <ResearchList />
    </main>
  );
}
