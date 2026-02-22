"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Map,
  BarChart3,
  TrendingUp,
  Layers,
  Eye,
  ExternalLink,
  Calendar,
  MapPin,
  Database,
  Loader2,
} from "lucide-react";
import Link from "next/link";

const categories = [
  { value: "all", label: "All Projects" },
  { value: "heatmap", label: "Heatmaps" },
  { value: "choropleth", label: "Choropleth" },
  { value: "time-series", label: "Time Series" },
  { value: "other", label: "Other" },
];

// Region-specific map preview SVGs
const regionMaps = {
  // Netherlands - Rotterdam/Amsterdam area
  "Rotterdam, NL": {
    viewBox: "0 0 400 250",
    land: "M0 80 L60 75 L80 60 L120 55 L180 50 L220 55 L280 70 L320 80 L380 85 L400 90 L400 250 L0 250 Z",
    water: "M140 90 L160 85 L200 80 L180 100 L160 110 L140 105 Z",
    center: { x: 160, y: 130 },
  },
  // Spain - Barcelona area
  "Barcelona, ES": {
    viewBox: "0 0 400 250",
    land: "M0 60 L100 55 L180 40 L260 35 L340 45 L400 60 L400 250 L0 250 Z",
    water: "M0 0 L400 0 L400 55 L340 40 L260 30 L180 35 L100 50 L0 55 Z",
    coast: "M0 60 Q50 58 100 55 Q150 45 180 40 Q220 35 260 35 Q300 40 340 45 Q370 52 400 60",
    center: { x: 200, y: 100 },
  },
  // Germany - Munich area
  "Munich, DE": {
    viewBox: "0 0 400 250",
    land: "M0 0 L400 0 L400 250 L0 250 Z",
    rivers: ["M100 0 Q120 60 110 120 Q100 180 120 250", "M300 0 Q280 80 290 160 Q310 220 300 250"],
    center: { x: 200, y: 125 },
  },
  // France - Paris area
  "Paris, FR": {
    viewBox: "0 0 400 250",
    land: "M0 0 L400 0 L400 250 L0 250 Z",
    river: "M0 130 Q100 120 200 125 Q300 130 400 115",
    center: { x: 200, y: 125 },
  },
  // Default - generic city
  "default": {
    viewBox: "0 0 400 250",
    land: "M0 0 L400 0 L400 250 L0 250 Z",
    center: { x: 200, y: 125 },
  }
};

// Map-style preview SVG with region-specific styling
function MapPreviewSVG({ category, region }) {
  const seed = (category + (region || "default")).split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  const random = (i) => ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;

  const mapConfig = regionMaps[region] || regionMaps["default"];
  const { center } = mapConfig;

  // Generate data point markers around the center
  const markers = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 30 + random(i) * 60;
    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
      size: 3 + random(i + 5) * 4,
    };
  });

  // Category-specific styling
  const getHeatmapColors = () => {
    if (category === "heatmap") {
      return ["#ef4444", "#f97316", "#eab308", "#eab308"];
    }
    return ["#eab308", "#fbbf24", "#fde68a"];
  };

  const colors = getHeatmapColors();

  return (
    <svg viewBox={mapConfig.viewBox} className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Dark map background */}
      <rect width="400" height="250" fill="#0f172a" />

      {/* Subtle grid */}
      <defs>
        <pattern id={`grid-${seed}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
        </pattern>
        <radialGradient id={`heatGlow-${seed}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colors[0]} stopOpacity="0.4" />
          <stop offset="50%" stopColor={colors[1] || colors[0]} stopOpacity="0.2" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="400" height="250" fill={`url(#grid-${seed})`} />

      {/* Land mass */}
      <path d={mapConfig.land} fill="#1e293b" opacity="0.8" />

      {/* Water bodies */}
      {mapConfig.water && (
        <path d={mapConfig.water} fill="#0c4a6e" opacity="0.5" />
      )}

      {/* Coast line */}
      {mapConfig.coast && (
        <path d={mapConfig.coast} fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.3" />
      )}

      {/* River */}
      {mapConfig.river && (
        <path d={mapConfig.river} fill="none" stroke="#f59e0b" strokeWidth="3" opacity="0.4" />
      )}

      {/* Rivers array */}
      {mapConfig.rivers && mapConfig.rivers.map((river, i) => (
        <path key={i} d={river} fill="none" stroke="#f59e0b" strokeWidth="2" opacity="0.3" />
      ))}

      {/* Street grid pattern near center */}
      <g opacity="0.15">
        {[...Array(6)].map((_, i) => (
          <line
            key={`h-${i}`}
            x1={center.x - 80}
            y1={center.y - 50 + i * 20}
            x2={center.x + 80}
            y2={center.y - 50 + i * 20}
            stroke="#64748b"
            strokeWidth="1"
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <line
            key={`v-${i}`}
            x1={center.x - 70 + i * 20}
            y1={center.y - 60}
            x2={center.x - 70 + i * 20}
            y2={center.y + 60}
            stroke="#64748b"
            strokeWidth="1"
          />
        ))}
      </g>

      {/* Heat glow at center for heatmap category */}
      {category === "heatmap" && (
        <ellipse cx={center.x} cy={center.y} rx="80" ry="60" fill={`url(#heatGlow-${seed})`} />
      )}

      {/* Data markers */}
      {markers.map((m, i) => (
        <g key={i}>
          <circle cx={m.x} cy={m.y} r={m.size + 6} fill={colors[i % colors.length]} opacity="0.15" />
          <circle cx={m.x} cy={m.y} r={m.size + 3} fill={colors[i % colors.length]} opacity="0.25" />
          <circle cx={m.x} cy={m.y} r={m.size} fill={colors[i % colors.length]} />
          <circle cx={m.x} cy={m.y} r={m.size * 0.4} fill="white" opacity="0.7" />
        </g>
      ))}

      {/* Connection lines for time-series */}
      {category === "time-series" && markers.slice(0, 4).map((m, i) => {
        if (i === 0) return null;
        const prev = markers[i - 1];
        return (
          <line
            key={`conn-${i}`}
            x1={prev.x}
            y1={prev.y}
            x2={m.x}
            y2={m.y}
            stroke="#eab308"
            strokeWidth="2"
            strokeDasharray="4,4"
            opacity="0.5"
          />
        );
      })}

      {/* Vignette overlay */}
      <defs>
        <radialGradient id={`vignette-${seed}`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0.6" />
        </radialGradient>
      </defs>
      <rect width="400" height="250" fill={`url(#vignette-${seed})`} />
    </svg>
  );
}

export function VisualizationsGallery() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [visualizations, setVisualizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchVisualizations() {
      try {
        setLoading(true);
        const response = await fetch("/api/django?endpoint=research/visualizations");
        if (!response.ok) {
          throw new Error("Failed to fetch visualizations");
        }
        const data = await response.json();
        // Handle paginated response
        const results = data.results || data;
        setVisualizations(results);
      } catch (err) {
        console.error("Error fetching visualizations:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchVisualizations();
  }, []);

  const filteredVisualizations =
    activeCategory === "all"
      ? visualizations
      : visualizations.filter((v) => v.category === activeCategory);

  if (loading) {
    return (
      <section className="pt-20 md:pt-32 pb-16 md:pb-24">
        <div className="container">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading visualizations...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-20 md:pt-32 pb-16 md:pb-24">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <Badge variant="secondary" className="mb-4">
            Portfolio
          </Badge>
          <h1 className="text-2xl md:text-5xl font-bold text-foreground mb-3 md:mb-4 text-balance">
            Data Visualizations
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Interactive maps, spatial analyses, and dashboards showcasing
            European real estate data through modern geospatial technologies.
          </p>
        </div>

        {/* Category Tabs */}
        <Tabs
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="mb-8 md:mb-12"
        >
          <TabsList className="flex flex-wrap justify-center gap-2 bg-transparent h-auto p-0">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="text-xs md:text-sm px-2 md:px-4 py-1 md:py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Visualizations Grid */}
        {filteredVisualizations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No visualizations found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {filteredVisualizations.map((viz) => (
              <Link key={viz.id} href={`/visualizations/${viz.slug}`} className="group">
                <Card className="bg-card border-border overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                  {/* Map Preview */}
                  <div className="aspect-video bg-muted/50 relative overflow-hidden">
                    <MapPreviewSVG category={viz.category} region={viz.region} />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4 right-2 md:right-4 flex justify-between items-end gap-2">
                      <div className="flex gap-1 md:gap-2">
                        {(viz.technologies || []).slice(0, 2).map((tech) => (
                          <Badge
                            key={tech}
                            variant="secondary"
                            className="bg-background/90 backdrop-blur-sm text-xs"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Eye className="w-3 h-3" /> View Live
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Title and Meta */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                          {viz.title}
                        </h3>
                        <Badge variant="secondary" className="shrink-0">
                          {viz.category}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {viz.region && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {viz.region}
                          </span>
                        )}
                        {viz.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {viz.date}
                          </span>
                        )}
                        {viz.data_points && (
                          <span className="flex items-center gap-1">
                            <Database className="w-4 h-4" />
                            {viz.data_points}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                      {viz.description}
                    </p>

                    {/* Key Metrics */}
                    {viz.metrics && viz.metrics.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg mb-6">
                        {viz.metrics.map((metric, idx) => (
                          <div key={idx} className="text-center">
                            <p className="text-lg font-bold text-foreground">
                              {metric.value}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {metric.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Technologies */}
                    {viz.technologies && viz.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {viz.technologies.map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-muted/30 border-border p-8 inline-block">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Interested in a custom visualization?
            </h3>
            <p className="text-muted-foreground mb-6">
              Let's discuss how spatial data can drive insights for your
              project.
            </p>
            <Link href="/contact">
              <Button className="gap-2">
                Get in Touch <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
}
