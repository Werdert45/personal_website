import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { VisualizationsGallery } from "@/components/visualizations-gallery";

export const metadata = {
  title: "Data Visualizations",
  description:
    "Interactive maps and spatial data visualizations for European real estate analytics. Explore geospatial insights powered by Mapbox and PostGIS.",
  openGraph: {
    title: "Data Visualizations | Ian Ronk",
    description:
      "Interactive maps and spatial data visualizations for European real estate analytics.",
    type: "website",
  },
};

export default function VisualizationsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <VisualizationsGallery />
      <Footer />
    </main>
  );
}
