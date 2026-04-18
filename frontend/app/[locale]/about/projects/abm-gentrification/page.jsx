import { ABMThesisContent } from "@/components/project-abm-thesis";

export const metadata = {
  title: "ABM Gentrification Thesis",
  description:
    "Master's thesis: Building an Agent-Based Model to Explain Gentrification in European Cities. Grade: 8/8 at Bocconi University.",
};

export default function ABMThesisPage() {
  return (
    <main>
      <ABMThesisContent />
    </main>
  );
}
