"use client";

import { use } from "react";
import VisualizationDetail from "@/components/visualization-detail";

export default function VisualizationPage({ params }) {
  const { slug } = use(params);
  return (
    <main>
      <VisualizationDetail slug={slug} />
    </main>
  );
}
