"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Loader2, MapPin, Database } from "lucide-react";

const colorSchemes = {
  heatmap: ["#e8f4f8", "#b8dde8", "#6bc4d8", "#2d8c82", "#1a5c54"],
  choropleth: ["#fefce8", "#fef08a", "#fbbf24", "#d97706", "#78350f"],
  "time-series": ["#fef3c7", "#fcd34d", "#f59e0b", "#d97706", "#92400e"],
  default: ["#e8f4f8", "#b8dde8", "#6bc4d8", "#2d8c82", "#1a5c54"],
};

function MapPreviewSVG({ category }) {
  const colors = colorSchemes[category] || colorSchemes.default;
  return (
    <svg viewBox="0 0 400 200" className="w-full h-full">
      <defs>
        <pattern id="gridPreview" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
        </pattern>
      </defs>
      <rect width="400" height="200" fill="url(#gridPreview)" />
      <path d="M60 40 L120 30 L180 45 L160 80 L100 90 L60 70 Z" fill={colors[4]} />
      <path d="M180 45 L260 40 L280 70 L240 100 L160 80 Z" fill={colors[3]} />
      <path d="M100 90 L160 80 L180 120 L140 140 L80 120 Z" fill={colors[2]} />
      <path d="M160 80 L240 100 L260 130 L220 160 L180 120 Z" fill={colors[4]} />
      <circle cx="130" cy="60" r="4" fill="white" stroke={colors[4]} strokeWidth="2" />
      <circle cx="210" cy="70" r="4" fill="white" stroke={colors[3]} strokeWidth="2" />
      <circle cx="180" cy="130" r="4" fill="white" stroke={colors[3]} strokeWidth="2" />
    </svg>
  );
}

export function ProjectsPreview() {
  const [visualizations, setVisualizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("Projects");
  const locale = useLocale();

  useEffect(() => {
    async function fetchVisualizations() {
      try {
        setLoading(true);
        const response = await fetch("/api/django?endpoint=research/visualizations");
        if (response.ok) {
          const data = await response.json();
          const results = data.results || data;
          setVisualizations(results.slice(0, 2));
        }
      } catch (err) {
        console.error("Error fetching visualizations:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVisualizations();
  }, []);

  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8 md:mb-12 gap-4">
          <div>
            <Badge variant="outline" className="mb-4">{t("badge")}</Badge>
            <h2 className="text-2xl md:text-4xl font-bold text-balance">
              {t("title")}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-2 max-w-2xl">
              {t("subtitle")}
            </p>
          </div>
          <Button variant="outline" asChild className="w-full md:w-auto md:ml-4 md:mt-2 bg-transparent">
            <Link href={`/${locale}/visualizations`} className="flex items-center justify-center md:justify-start gap-2">
              {t("viewAll")}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {visualizations.map((viz) => (
              <Link key={viz.id} href={`/${locale}/visualizations/${viz.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group">
                  <div className="relative w-full h-40 md:h-48 bg-muted/50 overflow-hidden">
                    <MapPreviewSVG category={viz.category} />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/60 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      {(viz.technologies || []).slice(0, 2).map((tech) => (
                        <Badge key={tech} variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                  <CardHeader className="p-4 md:p-6">
                    <div className="flex items-start justify-between gap-2 mb-2 md:mb-3">
                      <CardTitle className="text-base md:text-lg group-hover:text-primary transition-colors line-clamp-2">{viz.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">{viz.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0 md:pt-0">
                    <p className="text-muted-foreground line-clamp-2 text-sm">{viz.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {viz.region && (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{viz.region}</span>
                      )}
                      {viz.data_points && (
                        <span className="flex items-center gap-1"><Database className="w-3 h-3" />{viz.data_points}</span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                      {t("viewProject")}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
