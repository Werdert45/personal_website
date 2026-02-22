"use client";

import { use } from "react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import VisualizationDetail from "@/components/visualization-detail";

export default function VisualizationPage({ params }) {
  const { slug } = use(params);
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <VisualizationDetail slug={slug} />
      <Footer />
    </main>
  );
}
