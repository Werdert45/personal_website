"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Printer,
  Download,
  Map,
  ExternalLink,
} from "lucide-react";

// Research paper data
const researchData = {
  "urban-density-property-values": {
    title: "Urban Density and Property Values: A Spatial Analysis",
    subtitle:
      "Examining the relationship between population density and residential property prices across European capitals",
    author: "Alex Cartwright",
    date: "January 2025",
    readTime: "15 min",
    category: "research",
    tags: ["urban planning", "GIS", "real estate", "statistics"],
    mapConfig: {
      center: [10.0, 50.0],
      zoom: 4,
      markers: [
        { lng: 4.9041, lat: 52.3676, label: "Amsterdam", value: "€6,850/m²" },
        { lng: 13.405, lat: 52.52, label: "Berlin", value: "€4,200/m²" },
        { lng: 2.3522, lat: 48.8566, label: "Paris", value: "€10,500/m²" },
        { lng: -0.1276, lat: 51.5074, label: "London", value: "£12,400/m²" },
      ],
    },
    sections: [
      {
        type: "abstract",
        content:
          "This research examines the relationship between population density and residential property prices across major European capitals. Using PostGIS spatial analysis and regression models, we identify significant correlations between density metrics and property valuations, with implications for urban planning and real estate investment strategies.",
      },
      {
        type: "heading",
        content: "1. Introduction",
      },
      {
        type: "paragraph",
        content:
          "Urban density has long been recognized as a key factor influencing property values in metropolitan areas. As European cities continue to grow and evolve, understanding the spatial dynamics of density and its relationship to real estate markets becomes increasingly important for policymakers, developers, and investors.",
      },
      {
        type: "paragraph",
        content:
          "This study leverages geospatial analysis techniques, including PostGIS spatial queries and Mapbox GL JS visualization, to examine property price patterns across five major European capitals: Amsterdam, Berlin, Paris, London, and Madrid. Our analysis covers over 250,000 property transactions from 2020-2024.",
      },
      {
        type: "heading",
        content: "2. Methodology",
      },
      {
        type: "subheading",
        content: "2.1 Data Collection",
      },
      {
        type: "paragraph",
        content:
          "Property transaction data was collected from official cadastral records and real estate portals across each city. Population density metrics were derived from Eurostat GEOSTAT data at the 1km² grid level. All spatial data was processed and stored in a PostgreSQL/PostGIS database for analysis.",
      },
      {
        type: "code",
        language: "sql",
        content: `-- PostGIS query for density-price correlation
SELECT 
  d.district_name,
  AVG(p.price_per_sqm) as avg_price,
  d.population_density,
  ST_Area(d.geometry::geography) / 1000000 as area_km2
FROM properties p
JOIN districts d ON ST_Within(p.location, d.geometry)
WHERE p.transaction_date >= '2020-01-01'
GROUP BY d.district_name, d.population_density, d.geometry
ORDER BY d.population_density DESC;`,
      },
      {
        type: "subheading",
        content: "2.2 Spatial Analysis",
      },
      {
        type: "paragraph",
        content:
          "We employed spatial autocorrelation analysis (Moran's I) to identify clustering patterns in property prices, and geographically weighted regression (GWR) to model the locally varying relationship between density and price.",
      },
      {
        type: "map",
        title: "Interactive Map: European Capital Property Prices",
        description: "Click on markers to view average property prices by city",
      },
      {
        type: "heading",
        content: "3. Results",
      },
      {
        type: "paragraph",
        content:
          "Our analysis reveals a statistically significant positive correlation between population density and property prices (r² = 0.73, p < 0.001). However, this relationship varies considerably across cities and is moderated by factors including transit accessibility, amenity density, and historical building stock.",
      },
      {
        type: "stats",
        data: [
          { label: "Properties Analyzed", value: "254,000+" },
          { label: "Correlation (r²)", value: "0.73" },
          { label: "Cities Studied", value: "5" },
          { label: "Time Period", value: "2020-2024" },
        ],
      },
      {
        type: "heading",
        content: "4. Discussion",
      },
      {
        type: "paragraph",
        content:
          "The strong correlation between density and price supports urban economic theory regarding agglomeration benefits. Higher density areas typically offer better access to employment, services, and amenities, justifying price premiums. However, the relationship is non-linear, with diminishing returns observed at very high density levels.",
      },
      {
        type: "heading",
        content: "5. Conclusion",
      },
      {
        type: "paragraph",
        content:
          "This research demonstrates the utility of GIS-based spatial analysis in understanding real estate market dynamics. The findings have practical applications for investment strategy, urban planning policy, and development feasibility analysis. Future research should explore the temporal dynamics of density-price relationships and the impact of remote work trends on traditional density premiums.",
      },
      {
        type: "references",
        items: [
          "Glaeser, E. L. (2011). Triumph of the City. Penguin Press.",
          "Brueckner, J. K. (2011). Lectures on Urban Economics. MIT Press.",
          "Eurostat GEOSTAT Population Grid (2024).",
          "PostGIS 3.4 Documentation. https://postgis.net/docs/",
        ],
      },
    ],
  },
  "transit-oriented-development-paris": {
    title: "Transit-Oriented Development in Paris: An Isochrone Study",
    subtitle: "Mapping the impact of metro accessibility on property values",
    author: "Alex Cartwright",
    date: "December 2024",
    readTime: "12 min",
    category: "case-study",
    tags: ["transit", "accessibility", "France", "isochrone"],
    mapConfig: {
      center: [2.3522, 48.8566],
      zoom: 12,
      markers: [
        { lng: 2.295, lat: 48.8738, label: "Arc de Triomphe", value: "+18% premium" },
        { lng: 2.3376, lat: 48.8606, label: "Louvre", value: "+22% premium" },
        { lng: 2.2945, lat: 48.8584, label: "Eiffel Tower", value: "+15% premium" },
      ],
    },
    sections: [
      {
        type: "abstract",
        content:
          "This case study examines the relationship between metro station proximity and residential property values in Paris using isochrone analysis. We quantify the accessibility premium and identify optimal distances for transit-oriented development.",
      },
      {
        type: "heading",
        content: "1. Background",
      },
      {
        type: "paragraph",
        content:
          "Paris boasts one of the world's most extensive metro systems, with 16 lines and 302 stations serving 4.5 million daily passengers. This infrastructure creates significant variations in accessibility across the city, which we hypothesize correlates with property values.",
      },
      {
        type: "map",
        title: "Paris Metro Accessibility Map",
        description: "Isochrone analysis showing walk-time to nearest metro station",
      },
      {
        type: "heading",
        content: "2. Analysis",
      },
      {
        type: "paragraph",
        content:
          "We generated isochrone polygons representing 5, 10, and 15-minute walking distances from each metro station using the OSRM routing engine. Property transactions were then spatially joined to these zones to calculate average prices per accessibility band.",
      },
      {
        type: "stats",
        data: [
          { label: "Metro Stations", value: "302" },
          { label: "Properties Analyzed", value: "45,000" },
          { label: "Avg. Premium (<5 min)", value: "+22%" },
          { label: "Avg. Premium (5-10 min)", value: "+12%" },
        ],
      },
      {
        type: "heading",
        content: "3. Findings",
      },
      {
        type: "paragraph",
        content:
          "Properties within 5-minute walking distance of a metro station command an average premium of 22% compared to those beyond 15 minutes. The premium decreases to 12% for the 5-10 minute band and 5% for 10-15 minutes, demonstrating a clear distance-decay relationship.",
      },
      {
        type: "references",
        items: [
          "RATP Open Data Portal (2024)",
          "Notaires de France Transaction Database",
          "OSRM Project Documentation",
        ],
      },
    ],
  },
};

// Fallback for unknown slugs
const defaultArticle = {
  title: "Research Article",
  subtitle: "GIS and Real Estate Analytics",
  author: "Alex Cartwright",
  date: "2024",
  readTime: "10 min",
  category: "research",
  tags: ["GIS", "research"],
  mapConfig: { center: [4.9, 52.37], zoom: 10, markers: [] },
  sections: [
    {
      type: "paragraph",
      content: "This article is not yet available. Please check back later.",
    },
  ],
};

function EmbeddedMap({ config, title }) {
  const mapContainerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Simple SVG map placeholder - replace with Mapbox when token is available
    setMapLoaded(true);
  }, []);

  return (
    <div className="my-8">
      <div className="flex items-center gap-2 mb-3">
        <Map className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <Card className="bg-muted/30 border-border overflow-hidden">
        <div className="aspect-video relative bg-muted">
          {/* SVG Map Visualization */}
          <svg viewBox="0 0 800 450" className="w-full h-full">
            <defs>
              <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
              </pattern>
              <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(45, 140, 130, 0.1)" />
                <stop offset="100%" stopColor="rgba(45, 140, 130, 0.2)" />
              </linearGradient>
            </defs>
            <rect width="800" height="450" fill="url(#mapGrid)" />
            <rect width="800" height="450" fill="url(#waterGradient)" />
            
            {/* Simplified Europe outline */}
            <path
              d="M200 150 L250 120 L350 100 L450 110 L550 90 L600 120 L620 180 L580 250 L500 280 L400 300 L300 280 L250 220 L200 180 Z"
              fill="rgba(45, 140, 130, 0.15)"
              stroke="rgba(45, 140, 130, 0.4)"
              strokeWidth="2"
            />
            
            {/* City markers */}
            {config.markers.map((marker, i) => {
              const x = 400 + (marker.lng - 5) * 30;
              const y = 250 - (marker.lat - 48) * 25;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="20" fill="rgba(45, 140, 130, 0.2)" />
                  <circle cx={x} cy={y} r="8" fill="hsl(var(--primary))" />
                  <text
                    x={x}
                    y={y - 25}
                    textAnchor="middle"
                    className="fill-foreground text-sm font-medium"
                  >
                    {marker.label}
                  </text>
                  <text
                    x={x}
                    y={y + 35}
                    textAnchor="middle"
                    className="fill-primary text-xs font-medium"
                  >
                    {marker.value}
                  </text>
                </g>
              );
            })}
          </svg>
          
          {/* Map overlay info */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
              Interactive Map
            </Badge>
            <p className="text-xs text-muted-foreground bg-card/90 backdrop-blur-sm px-2 py-1 rounded">
              Configure Mapbox for full interactivity
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function ResearchArticle({ slug }) {
  const article = researchData[slug] || defaultArticle;

  const renderSection = (section, index) => {
    switch (section.type) {
      case "abstract":
        return (
          <Card key={index} className="bg-primary/5 border-primary/20 mb-8">
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
                Abstract
              </h2>
              <p className="text-foreground leading-relaxed">{section.content}</p>
            </CardContent>
          </Card>
        );

      case "heading":
        return (
          <h2
            key={index}
            className="text-2xl font-bold text-foreground mt-10 mb-4"
          >
            {section.content}
          </h2>
        );

      case "subheading":
        return (
          <h3
            key={index}
            className="text-lg font-semibold text-foreground mt-6 mb-3"
          >
            {section.content}
          </h3>
        );

      case "paragraph":
        return (
          <p
            key={index}
            className="text-muted-foreground leading-relaxed mb-4 text-pretty"
          >
            {section.content}
          </p>
        );

      case "code":
        return (
          <div key={index} className="my-6">
            <div className="flex items-center justify-between bg-muted/50 px-4 py-2 rounded-t-lg border border-b-0 border-border">
              <span className="text-xs font-mono text-muted-foreground uppercase">
                {section.language}
              </span>
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                Copy
              </Button>
            </div>
            <pre className="bg-muted/30 p-4 rounded-b-lg border border-border overflow-x-auto">
              <code className="text-sm font-mono text-foreground">
                {section.content}
              </code>
            </pre>
          </div>
        );

      case "map":
        return (
          <EmbeddedMap
            key={index}
            config={article.mapConfig}
            title={section.title}
          />
        );

      case "stats":
        return (
          <div
            key={index}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8"
          >
            {section.data.map((stat, i) => (
              <Card key={i} className="bg-muted/30 border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case "references":
        return (
          <div key={index} className="mt-10 pt-8 border-t border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">References</h2>
            <ol className="list-decimal list-inside space-y-2">
              {section.items.map((ref, i) => (
                <li key={i} className="text-sm text-muted-foreground">
                  {ref}
                </li>
              ))}
            </ol>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <article className="pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        {/* Back link */}
        <Link
          href="/research"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Research
        </Link>

        {/* Article Header */}
        <header className="mb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">{article.category}</Badge>
            {article.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-balance">
            {article.title}
          </h1>

          <p className="text-xl text-muted-foreground mb-6">{article.subtitle}</p>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{article.author}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {article.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.readTime}
              </span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <div className="prose prose-neutral max-w-none">
          {article.sections.map((section, index) =>
            renderSection(section, index)
          )}
        </div>

        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Written by</p>
              <p className="font-semibold text-foreground">{article.author}</p>
              <p className="text-sm text-muted-foreground">
                GIS Developer & Spatial Analyst
              </p>
            </div>
            <Link href="/contact">
              <Button className="gap-2">
                Discuss this research
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </footer>
      </div>
    </article>
  );
}
