"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MapboxWrapper } from "@/components/mapbox-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, ArrowRight, Clock, FileText } from "lucide-react";
import NewsletterSubscribe from "@/components/newsletter-subscribe";

const STATIC_PAPERS = {
  "metro-capitalisation-timing": {
    slug: "metro-capitalisation-timing",
    title: "When metro openings capitalise into residential rents: a seven-city European study",
    abstract: "Staggered difference-in-differences across seven European cities (Milano, Amsterdam, Copenhagen, Paris, Helsinki, Rennes, Roma; n = 42,004). The largest price response — a step of roughly +12% — appears at maturity, two or more years after opening. Bootstrap inference on few-cluster data (G = 7 cities). Maturity step positive under every leave-one-city-out check.",
    category: "WORKING-PAPER",
    date: "2026-06",
    author: "Ian Ronk",
    tags: ["difference-in-differences", "rent", "metro", "urban economics", "bootstrap"],
    status: "Under review",
    doi: null,
    arxiv_id: null,
    cite_as: 'Ronk, I. (2026). "When metro openings capitalise into residential rents: a seven-city European study." Working paper.',
    content: `## Design

Staggered difference-in-differences across seven European cities (Amsterdam, Copenhagen, Helsinki, Milano, Paris, Rennes, Roma), treating each metro extension as a separate treatment event. The panel covers transaction-level rent data from 2008 to 2024, yielding 42,004 observations after cleaning.

**Treatment timing.** Each city contributes its own treatment calendar: announcement, ground-break, opening, and maturity (defined as 24+ months post-opening). Event-study coefficients trace the price path relative to four quarters before announcement.

**Bootstrap inference.** With G = 7 cities, conventional cluster-robust standard errors are unreliable. We apply the wild cluster bootstrap (Webb weights, B = 999) and report p-values from the percentile-t distribution.

## Main results

The largest price step appears at maturity, not at announcement or opening. The point estimate is a +12% premium (95% CI: +7% to +18%) relative to never-treated control rings at 1-3 km.

**Robustness.** The maturity step is positive under every leave-one-city-out check and survives re-estimation with alternative bandwidth radii (400 m, 600 m, 1,000 m).

## Data

Rent transactions: national registers (Kadaster NL, DVF FR, OMI IT) supplemented by scraped listing platforms. Station polygons: OpenStreetMap. Treatment calendars hand-compiled from municipal transport authority press releases.`,
  },
  "voronoi-postcode-estimation": {
    slug: "voronoi-postcode-estimation",
    title: "Postcode boundary estimation from crowdsourced address data: a Voronoi approach",
    abstract: "OSM address points, kNN outlier removal, point Voronoi, and polygon dissolution, calibrated against authoritative NL and DK postcode layers (5,160 polygons combined). IoU saturates near 0.7 at roughly 300 seeds per postcode. Applied to Italy (4,209 CAP polygons) where no free authoritative layer exists. GeoJSON output ships with per-polygon seed count.",
    category: "PREPRINT",
    date: "2026-05",
    author: "Ian Ronk",
    tags: ["Voronoi", "OpenStreetMap", "postcode boundaries", "Italy", "geospatial"],
    status: "Preprint in preparation",
    doi: null,
    arxiv_id: null,
    cite_as: 'Ronk, I. (2026). "Postcode boundary estimation from crowdsourced address data: a Voronoi approach." Preprint.',
    content: `## Problem

Postcode boundaries are authoritative in some EU countries (NL, DK, DE) and absent or commercially restricted in others (IT). Without polygons, spatial aggregation over postcodes requires a surrogate.

## Pipeline

Four candidate methods were evaluated; the fourth — OSM address Voronoi with kNN outlier removal — achieved consistently acceptable IoU.

**Step 1: address harvest.** OSM Overpass API, tag \`addr:postcode\`, deduplicated on (lat, lon) pairs. Italy yields roughly 18 million address points.

**Step 2: kNN outlier removal.** For each point, compute the five nearest neighbours of a different postcode. Points closer to a foreign-postcode centroid than to their own are labelled outliers and dropped (approximately 4-6% of input).

**Step 3: Voronoi tessellation.** Constrained to the country bounding polygon. One Voronoi cell per seed point.

**Step 4: polygon dissolution.** Merge by \`addr:postcode\`. Islands smaller than 0.01 km² consolidated with the geographically nearest polygon of the same code.

## Calibration

Evaluated on NL (3,898 postcodes, 4-digit PC4) and DK (1,262 postcodes). IoU saturates near 0.70 at roughly 300 seeds per postcode; median IoU is 0.68 for NL and 0.71 for DK.

## Application

Applied to 4,209 Italian CAP polygons. GeoJSON output includes per-polygon seed count and IoU estimate (where computable by intersection with ISTAT municipality boundaries).`,
  },
};

function getTranslated(article, field, locale) {
  if (locale === "en" || !article.translations) return article[field];
  const trans = article.translations.find((t) => t.language === locale);
  return trans?.[field] || article[field];
}

export default function ResearchArticleDetail({ slug }) {
  const [mounted, setMounted] = useState(false);
  const [article, setArticle] = useState(null);
  const [geojsonData, setGeojsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);

  let locale;
  let t;
  try {
    locale = useLocale();
  } catch {
    locale = "en";
  }
  try {
    t = useTranslations("Research");
  } catch {
    t = (key) => key;
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchArticle() {
      try {
        setLoading(true);
        const response = await fetch(`/api/django?endpoint=research/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setArticle(data);
          fetchRelatedArticles(data.category, data.tags, data.slug);

          // Load GeoJSON: from uploaded dataset, geojson_endpoint, or inline data
          if (data.geodataset) {
            fetchUploadedGeoJSON(data.geodataset, data.value_field);
          } else if (data.geojson_endpoint) {
            fetchGeoJSON(data.geojson_endpoint);
          } else if (data.geojson_data) {
            setGeojsonData(data.geojson_data);
          }
        } else if (STATIC_PAPERS[slug]) {
          setArticle(STATIC_PAPERS[slug]);
        } else {
          setError("Article not found");
        }
      } catch (err) {
        console.error("Error fetching article:", err);
        setError("Failed to load article");
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

    async function fetchRelatedArticles(category, tags, currentSlug) {
      try {
        const response = await fetch(`/api/django?endpoint=research`);
        if (response.ok) {
          const data = await response.json();
          const results = data.results || data;
          const related = results
            .filter((a) => a.slug !== currentSlug && a.status === "published")
            .map((a) => {
              let score = 0;
              if (a.category === category) score += 2;
              if (tags && a.tags) {
                const sharedTags = a.tags.filter((t) => tags.includes(t));
                score += sharedTags.length;
              }
              return { ...a, score };
            })
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
          setRelatedArticles(related);
        }
      } catch (err) {
        console.error("Error fetching related articles:", err);
      }
    }

    if (slug) fetchArticle();
  }, [slug]);

  if (!mounted) return null;

  if (loading) {
    return (
      <section className="pt-24 md:pt-32 pb-12 md:pb-20">
        <div className="container">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">{t("loadingArticle")}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !article) {
    return (
      <section className="pt-24 md:pt-32 pb-12">
        <div className="container px-4 md:px-6">
          <Button variant="ghost" asChild className="mb-8">
            <Link href={`/${locale}/research`} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t("backToResearch")}
            </Link>
          </Button>
          <div className="min-h-96 flex items-center justify-center text-center">
            <div>
              <h1 className="text-2xl font-bold mb-4">{t("articleNotFound")}</h1>
              <p className="text-muted-foreground mb-6">{t("articleNotFoundBody")}</p>
              <Button asChild>
                <Link href={`/${locale}/research`}>{t("browseAll")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const title = getTranslated(article, "title", locale);
  const abstract = getTranslated(article, "abstract", locale);
  const content = getTranslated(article, "content", locale);

  const getMapCenter = () => {
    if (article.map_config?.center) return article.map_config.center;
    if (geojsonData?.features?.[0]?.geometry?.coordinates) return geojsonData.features[0].geometry.coordinates;
    return [10, 50];
  };

  const getMapZoom = () => article.map_config?.zoom || 5;

  return (
    <section className="pt-24 md:pt-32 pb-12">
      <div className="container px-4 md:px-6">
        <Button variant="ghost" asChild className="mb-8">
          <Link href={`/${locale}/research`} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t("backToResearch")}
          </Link>
        </Button>

        <div className="max-w-4xl">
          {/* Preview image or placeholder */}
          <div className="mb-8 rounded-lg overflow-hidden border border-border">
            {article.preview_image ? (
              <img
                src={article.preview_image}
                alt={title}
                className="w-full h-48 md:h-72 object-cover"
              />
            ) : (
              <div className="w-full h-48 md:h-72 bg-muted flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <FileText className="w-12 h-12" />
                  <p className="text-sm font-medium">{article.category}</p>
                </div>
              </div>
            )}
          </div>

          {geojsonData && (
            <Card className="mb-8 overflow-hidden border-border">
              <CardContent className="p-0">
                <div className="w-full h-64 md:h-[500px] bg-muted">
                  <MapboxWrapper geojsonData={geojsonData} title={title} center={getMapCenter()} zoom={getMapZoom()} />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge>{article.category}</Badge>
              <span className="text-sm text-muted-foreground">{article.date}</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            {article.author && <p className="text-lg text-muted-foreground mb-4">{t("byAuthor")} {article.author}</p>}
            <p className="text-lg text-muted-foreground mb-6">{abstract}</p>

            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}

            {(article.status || article.doi !== undefined || article.arxiv_id !== undefined || article.cite_as) && (
              <div className="mb-2 p-4 rounded-lg border border-border bg-muted/20 font-mono text-xs">
                <p className="uppercase tracking-widest text-muted-foreground mb-3 text-[10px]">Reference</p>
                <div className="space-y-2">
                  {article.status && (
                    <div className="flex gap-4">
                      <span className="text-muted-foreground uppercase w-16 shrink-0">Status</span>
                      <span>{article.status}</span>
                    </div>
                  )}
                  <div className="flex gap-4">
                    <span className="text-muted-foreground uppercase w-16 shrink-0">DOI</span>
                    {article.doi
                      ? <a href={`https://doi.org/${article.doi}`} className="text-primary hover:underline">{article.doi}</a>
                      : <span className="text-muted-foreground italic">forthcoming</span>}
                  </div>
                  <div className="flex gap-4">
                    <span className="text-muted-foreground uppercase w-16 shrink-0">arXiv</span>
                    {article.arxiv_id
                      ? <a href={`https://arxiv.org/abs/${article.arxiv_id}`} className="text-primary hover:underline">arXiv:{article.arxiv_id}</a>
                      : <span className="text-muted-foreground italic">forthcoming</span>}
                  </div>
                  {article.cite_as && (
                    <div className="flex gap-4">
                      <span className="text-muted-foreground uppercase w-16 shrink-0">Cite</span>
                      <span className="text-muted-foreground leading-relaxed">{article.cite_as}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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
                code: ({ node, inline, ...props }) =>
                  inline ? (
                    <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs md:text-sm font-mono text-primary" {...props} />
                  ) : (
                    <code className="block bg-muted p-3 md:p-4 rounded text-xs md:text-sm font-mono overflow-x-auto" {...props} />
                  ),
                pre: ({ node, ...props }) => <pre className="bg-muted p-3 md:p-4 rounded overflow-x-auto text-xs md:text-sm" {...props} />,
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
              {content}
            </ReactMarkdown>
          </div>

          <div className="newsletter-inline">
            <NewsletterSubscribe variant="inline" source="research-end" locale={locale} />
          </div>

          {relatedArticles.length > 0 && (
            <div className="mt-12 md:mt-16 pt-8 border-t border-border">
              <h2 className="text-xl md:text-2xl font-bold mb-6">{t("youMightAlsoLike")}</h2>
              <div className="grid gap-4 md:gap-6 md:grid-cols-3">
                {relatedArticles.map((item) => (
                  <Link key={item.slug} href={`/${locale}/research/${item.slug}`}>
                    <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          {item.read_time && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />{item.read_time}
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm md:text-base mb-2 line-clamp-2">
                          {getTranslated(item, "title", locale)}
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-3">
                          {getTranslated(item, "abstract", locale)}
                        </p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{tag}</span>
                            ))}
                          </div>
                        )}
                        <span className="text-xs text-primary flex items-center gap-1">
                          {t("readArticle")} <ArrowRight className="w-3 h-3" />
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
