"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MapboxWrapper } from "@/components/mapbox-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Database, Loader2, MapPin, Calendar, ArrowRight } from "lucide-react";

function MapPreviewSVG({ category, region }) {
  const seed = (category + (region || "default")).split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  const random = (i) => ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;
  const markers = Array.from({ length: 4 }, (_, i) => ({
    x: 60 + random(i) * 280,
    y: 30 + random(i + 10) * 70,
  }));

  return (
    <svg viewBox="0 0 400 130" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="130" fill="#1a1a2e" />
      <defs>
        <pattern id={`grid-${seed}`} width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#2a2a4a" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="400" height="130" fill={`url(#grid-${seed})`} />
      <path d="M0 80 Q100 70 200 75 Q300 80 400 70" fill="none" stroke="#3a3a5a" strokeWidth="1.5" opacity="0.5" />
      {markers.map((m, i) => (
        <g key={i}>
          <circle cx={m.x} cy={m.y} r="8" fill="#eab308" opacity="0.2" />
          <circle cx={m.x} cy={m.y} r="4" fill="#eab308" />
          <circle cx={m.x} cy={m.y} r="2" fill="white" opacity="0.8" />
        </g>
      ))}
    </svg>
  );
}

export default function VisualizationDetail({ slug }) {
  const [mounted, setMounted] = useState(false);
  const [viz, setViz] = useState(null);
  const [geojsonData, setGeojsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedViz, setRelatedViz] = useState([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchVisualization() {
      try {
        setLoading(true);
        const response = await fetch(`/api/django?endpoint=research/visualizations/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setViz(data);
          fetchRelatedVisualizations(data.category, data.slug);

          // Load GeoJSON: from uploaded dataset, geojson_endpoint, or inline data
          if (data.geodataset) {
            fetchUploadedGeoJSON(data.geodataset, data.value_field);
          } else if (data.geojson_endpoint) {
            fetchGeoJSON(data.geojson_endpoint);
          } else if (data.geojson_data) {
            setGeojsonData(data.geojson_data);
          }
        } else {
          setError("Visualization not found");
        }
      } catch (err) {
        console.error("Error fetching visualization:", err);
        setError("Failed to load visualization");
      } finally {
        setLoading(false);
      }
    }

    async function fetchUploadedGeoJSON(datasetId, valueField) {
      try {
        let url = `/api/django?endpoint=geodata/datasets/${datasetId}/geojson`;
        if (valueField) url += `&value_field=${valueField}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setGeojsonData(data);
        }
      } catch (err) {
        console.error("Error fetching uploaded GeoJSON:", err);
      }
    }

    async function fetchGeoJSON(endpointSlug) {
      try {
        const response = await fetch(`/api/django?endpoint=geodata/${endpointSlug}/geojson`);
        if (response.ok) {
          const data = await response.json();
          setGeojsonData(data);
        }
      } catch (err) {
        console.error("Error fetching GeoJSON:", err);
      }
    }

    async function fetchRelatedVisualizations(category, currentSlug) {
      try {
        const response = await fetch(`/api/django?endpoint=research/visualizations`);
        if (response.ok) {
          const data = await response.json();
          const results = data.results || data;
          const related = results
            .filter((v) => v.slug !== currentSlug && v.status === "published")
            .sort((a, b) => {
              if (a.category === category && b.category !== category) return -1;
              if (b.category === category && a.category !== category) return 1;
              return 0;
            })
            .slice(0, 3);
          setRelatedViz(related);
        }
      } catch (err) {
        console.error("Error fetching related visualizations:", err);
      }
    }

    if (slug) fetchVisualization();
  }, [slug]);

  if (!mounted) return null;

  if (loading) {
    return (
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading visualization...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !viz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Visualization not found</h1>
          <Button asChild>
            <Link href="/visualizations">Back to Visualizations</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getMapCenter = () => {
    if (viz.map_config?.center) return viz.map_config.center;
    if (geojsonData?.features?.[0]?.geometry?.coordinates) return geojsonData.features[0].geometry.coordinates;
    return [4.8952, 52.3676];
  };

  const getMapZoom = () => viz.map_config?.zoom || 5;

  return (
    <section className="py-12 md:py-20">
      <div className="container">
        <Button variant="ghost" asChild className="mb-6 md:mb-8">
          <Link href="/visualizations" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Visualizations
          </Link>
        </Button>

        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <Badge className="text-xs md:text-sm">{viz.category}</Badge>
              {viz.date && (
                <span className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {viz.date}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4">{viz.title}</h1>
            <p className="text-sm md:text-lg text-muted-foreground mb-4 md:mb-6">{viz.description}</p>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              {viz.region && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {viz.region}
                </span>
              )}
              {viz.data_points && (
                <span className="flex items-center gap-1">
                  <Database className="w-4 h-4" />
                  {viz.data_points}
                </span>
              )}
            </div>

            {viz.technologies && viz.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {viz.technologies.map((tech) => (
                  <Badge key={tech} variant="outline" className="text-xs md:text-sm">
                    {tech}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Metrics */}
          {viz.metrics && viz.metrics.length > 0 && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {viz.metrics.map((metric, idx) => (
                    <div key={idx} className="text-center">
                      <p className="text-2xl md:text-3xl font-bold text-primary">{metric.value}</p>
                      <p className="text-sm text-muted-foreground">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Map */}
          {geojsonData && (
            <>
              <Card className="mb-6 border-primary/20 bg-primary/5">
                <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
                  <Database className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs md:text-sm font-medium text-foreground">Interactive Map</p>
                    <p className="text-xs text-muted-foreground">
                      {geojsonData.features?.length || 0} features loaded
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="mb-8 overflow-hidden border-border">
                <CardContent className="p-0">
                  <div className="w-full h-64 md:h-[500px] bg-muted">
                    <MapboxWrapper
                      geojsonData={geojsonData}
                      title={viz.title}
                      center={getMapCenter()}
                      zoom={getMapZoom()}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Content */}
          {viz.content && (
            <div className="space-y-4 md:space-y-6 text-foreground prose prose-sm md:prose-base max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ node, ...props }) => <h2 className="text-xl md:text-2xl font-bold mt-6 md:mt-8 mb-3 md:mb-4 text-foreground" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-lg md:text-xl font-semibold mt-4 md:mt-6 mb-2 md:mb-3 text-foreground" {...props} />,
                  p: ({ node, ...props }) => <p className="text-sm md:text-base text-muted-foreground leading-relaxed" {...props} />,
                  ul: ({ node, ...props }) => <ul className="space-y-1 md:space-y-2 ml-4 md:ml-6 list-disc" {...props} />,
                  ol: ({ node, ...props }) => <ol className="space-y-1 md:space-y-2 ml-4 md:ml-6 list-decimal" {...props} />,
                  li: ({ node, ...props }) => <li className="text-sm md:text-base text-muted-foreground" {...props} />,
                  strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                  code: ({ node, ...props }) => <code className="bg-muted/50 px-1.5 md:px-2 py-0.5 rounded text-xs md:text-sm font-mono text-primary" {...props} />,
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto my-6">
                      <table className="min-w-full border-collapse text-sm border border-border rounded-lg overflow-hidden" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }) => <thead className="bg-muted" {...props} />,
                  tr: ({ node, ...props }) => <tr className="border-b border-border last:border-b-0" {...props} />,
                  th: ({ node, ...props }) => <th className="border-r border-border last:border-r-0 px-4 py-3 text-left font-semibold text-foreground" {...props} />,
                  td: ({ node, ...props }) => <td className="border-r border-border last:border-r-0 px-4 py-3 text-muted-foreground" {...props} />,
                }}
              >
                {viz.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Related visualizations */}
          {relatedViz.length > 0 && (
            <div className="mt-12 md:mt-16 pt-8 border-t border-border">
              <h2 className="text-xl md:text-2xl font-bold mb-6">You might also like</h2>
              <div className="grid gap-4 md:gap-6 md:grid-cols-3">
                {relatedViz.map((item) => (
                  <Link key={item.slug} href={`/visualizations/${item.slug}`}>
                    <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer overflow-hidden">
                      <div className="h-32 bg-[#1a1a2e] relative overflow-hidden">
                        <MapPreviewSVG category={item.category} region={item.region} />
                      </div>
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          {item.region && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{item.region}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm md:text-base mb-2 line-clamp-2">{item.title}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                        <span className="text-xs text-primary flex items-center gap-1">
                          View visualization <ArrowRight className="w-3 h-3" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
