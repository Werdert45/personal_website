"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MapboxWrapper } from "@/components/mapbox-wrapper";
import { getMapFenceSource, parseMapFence } from "@/lib/map-fence";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, ArrowRight, Clock, FileText } from "lucide-react";
import NewsletterSubscribe from "@/components/newsletter-subscribe";
import { trackEvent } from "@/lib/analytics";
import { getItemField } from "@/lib/i18n-item";
import { AuthorTrailer } from "@/components/author-trailer";

// Loaded lazily so articles without a ```map fence ship no mapbox JS.
const MapFigure = dynamic(
  () => import("@/components/map-figure").then((mod) => mod.MapFigure),
  {
    ssr: false,
    loading: () => (
      <div className="my-6 rounded-lg border border-border p-6">
        <p className="text-xs font-mono text-muted-foreground">Loading map…</p>
      </div>
    ),
  }
);

// Static fallbacks describe the REAL manuscripts faithfully. Any number or
// claim here must match the current paper text — when in doubt, say less and
// point at the paper. (These render only when the CMS has no row for the slug.)
export const STATIC_PAPERS = {
  "metro-capitalisation-timing": {
    slug: "metro-capitalisation-timing",
    title: "When does metro infrastructure capitalize into property prices?",
    abstract: "Phase-decomposed difference-in-differences evidence from seven European cities. Seventeen staggered treated cohorts (Milano, Amsterdam, Copenhagen, Paris, Helsinki, Rennes, Roma; n = 42,004) pooled into one panel, with the response decomposed into announcement, construction, opening and maturity phases. The pooled cross-city average locates the largest response at maturity — but that step is a pooled average, not a within-city fact: city-by-year fixed effects collapse it to an insignificant −0.5 log points. The defensible magnitudes are per-city, foremost Milano's within-ring +167 EUR/m² (≈ +5.6%, wild-bootstrap p = 0.004).",
    category: "WORKING-PAPER",
    date: "2026-07",
    author: "Ian Ronk",
    tags: ["difference-in-differences", "property prices", "metro", "urban economics", "wild cluster bootstrap"],
    publication_status: "Working paper — draft available on request",
    doi: null,
    arxiv_id: null,
    cite_as: 'Ronk, I. (2026). "When Does Metro Infrastructure Capitalize into Property Prices? Phase-Decomposed Difference-in-Differences Evidence from Seven European Cities." Working paper.',
    content: `## Question

Not *whether* new metro lines capitalize into residential property prices, but *when* along the project timeline — announcement, construction, opening, or maturity. Single-snapshot hedonic studies cannot separate those phases; a phase-decomposed staggered design can.

## Design

Seventeen staggered treated cohorts across seven European cities in five countries (Milano, Amsterdam, Copenhagen, Paris, Helsinki, Rennes, Roma) pool into a single phase-decomposed panel of 42,004 observations. Outcomes are property prices from administrative and register sources (OMI appraisal series for the Italian cities, WOZ/Kadaster for Amsterdam, DVF for France, national registers elsewhere). With only seven city clusters, inference uses the wild cluster bootstrap throughout.

## What the paper actually finds

The pooled cross-city average locates the largest response at maturity: a construction-to-maturity step of +9 to +12%, two or more years after opening, stable across the control ladder and positive under every leave-one-city-out check. The paper then spends much of its length establishing what that step is *not*: under city-by-year fixed effects it collapses to an insignificant −0.5 log points, and its few-cluster significance depends on the clustering partition and control set. The defensible magnitudes are per-city — foremost Milano's within-ring +167 EUR/m² (≈ +5.6%, wild-bootstrap p = 0.004), the first ex-post difference-in-differences evidence on Milano's M5/M4 openings. The delayed-to-maturity pattern is read as a cross-city hypothesis worth testing on longer panels, not a settled within-city effect.

## Status and what comes next

Working paper. A Milan case study and a data-engineering write-up of the seven-city pipeline are planned as companion posts here, and the future-work post doubles as an open invitation: extending the phase-decomposed design to more cities is co-author-shaped work.`,
  },
  "voronoi-postcode-estimation": {
    slug: "voronoi-postcode-estimation",
    title: "Calibrating free postcode boundaries from OpenStreetMap",
    abstract: "Postcode polygons are free and authoritative in some European countries and sold or absent in others. Voronoi tessellation of OSM address points is the natural estimator — but how many address points are needed, and does the answer transfer across countries? One pipeline calibrated against national references in NL and DK (5,160 polygons), a seed-density-to-IoU curve whose asymptote is robust across functional forms (mean matched IoU ≈ 0.76–0.82), out-of-sample transfer tested on held-out Belgium (mean matched IoU 0.618 at 81% coverage), and an application to Italy's 4,209 CAP polygons, where no free authoritative intra-city layer exists.",
    category: "PREPRINT",
    date: "2026-07",
    author: "Ian Ronk",
    tags: ["Voronoi", "OpenStreetMap", "postcode boundaries", "calibration", "geospatial"],
    publication_status: "Preprint in preparation — arXiv August 2026",
    doi: null,
    arxiv_id: null,
    cite_as: 'Ronk, I. (2026). "Calibrating Free Postcode Boundaries from OpenStreetMap." Preprint.',
    content: `## Problem

Several European countries publish authoritative postcode polygons free of charge (the Netherlands, Denmark, Belgium, Switzerland, Finland, Norway); elsewhere they are sold or simply absent. Italy — the application case — has no free authoritative intra-city postcode layer at all.

## Approach

One pipeline: OSM address points as seeds, a kNN-based outlier pre-filter, Voronoi tessellation, dissolution by postcode. The contribution is not the tessellation — it is the *calibration*: fitting a seed-density-to-IoU curve against national reference layers in two countries (NL CBS PC4 and DK DAGI postnumre, 5,160 polygons combined) so that the accuracy of an estimated polygon can be predicted from its seed count before anyone uses it.

## What the calibration shows

The curve's asymptote is robust across functional forms — mean matched IoU saturates around 0.76–0.82 — while the fitted 0.7-IoU seed threshold is form-sensitive, and per-postcode scatter is wide: the curve calibrates the population mean, not individual polygons. The shape transfers out of sample: held-out Belgium reaches mean matched IoU 0.618 at 81% coverage, near the curve, with roughly double the calibration error.

## Application

Applied to Italy, the pipeline produces 4,209 estimated CAP polygons with per-polygon seed counts, so downstream users can filter by predicted quality. Full method, uncertainty treatment and limitations are in the paper; the GeoJSON and the complete pipeline are released alongside it (repository and archive links land here with the arXiv submission, August 2026).`,
  },
  "gentrification-abm": {
    slug: "gentrification-abm",
    title: "Agent-based modelling of gentrification dynamics",
    abstract: "MSc thesis (2025). An agent-based model of neighbourhood change driven by attractiveness and affordability, applied to Amsterdam, Utrecht and Milan on open spatial data — including an honest account of where the chosen aggregation level limits what the model can claim.",
    category: "THESIS",
    date: "2025-08",
    author: "Ian Ronk",
    tags: ["agent-based modelling", "gentrification", "housing", "Amsterdam", "urban dynamics"],
    publication_status: "MSc thesis (2025)",
    doi: null,
    arxiv_id: null,
    cite_as: 'Ronk, I. (2025). "Agent-based modelling of gentrification dynamics." MSc thesis.',
    content: `## In one paragraph

The thesis builds an agent-based model of gentrification in which households respond to neighbourhood attractiveness and affordability, and applies it to three European cities — Amsterdam, Utrecht and Milan — on open spatial data. Alongside the simulation results, it documents the data pipeline that fed the model and treats the limits seriously: the spatial aggregation level materially constrains which conclusions the model can support, and the thesis says so rather than smoothing over it.

## What's coming here

From August 2026 this site carries a case-study series on the thesis — the model itself, the pipeline that ran it, a revisit of the hot/cold-spot analysis, and the streetview and simulation work — written now, about 2025 work, and labelled as such. A social-housing extension of the model is the subject of ongoing follow-up research.`,
  },
};

export default function ResearchArticleDetail({ slug, initialArticle = null }) {
  const [mounted, setMounted] = useState(false);
  const [article, setArticle] = useState(initialArticle);
  const [geojsonData, setGeojsonData] = useState(null);
  const [loading, setLoading] = useState(!initialArticle);
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
        if (!initialArticle) setLoading(true);
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
        } else if (initialArticle) {
          // Keep the server-provided article; just hydrate the related list.
          fetchRelatedArticles(initialArticle.category, initialArticle.tags, initialArticle.slug);
        } else if (STATIC_PAPERS[slug]) {
          setArticle(STATIC_PAPERS[slug]);
        } else {
          setError("Article not found");
        }
      } catch (err) {
        if (!initialArticle) {
          console.error("Error fetching article:", err);
          setError("Failed to load article");
        }
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

  const title = getItemField(article, "title", locale);
  const abstract = getItemField(article, "abstract", locale);
  const content = getItemField(article, "content", locale);

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

            {/* Reference block: renders ONLY honest publication metadata.
                The CMS workflow status (draft/published/archived) must never
                appear here — publication_status is the reader-facing field. */}
            {(article.publication_status || article.doi || article.arxiv_id || article.repo_url || article.cite_as) && (
              <div className="mb-2 p-4 rounded-lg border border-border bg-muted/20 font-mono text-xs">
                <p className="uppercase tracking-widest text-muted-foreground mb-3 text-[10px]">Reference</p>
                <div className="space-y-2">
                  {article.publication_status && (
                    <div className="flex gap-4">
                      <span className="text-muted-foreground uppercase w-16 shrink-0">Status</span>
                      <span>{article.publication_status}</span>
                    </div>
                  )}
                  {(article.doi || article.publication_status) && (
                    <div className="flex gap-4">
                      <span className="text-muted-foreground uppercase w-16 shrink-0">DOI</span>
                      {article.doi
                        ? <a href={`https://doi.org/${article.doi}`} className="text-primary hover:underline">{article.doi}</a>
                        : <span className="text-muted-foreground italic">forthcoming</span>}
                    </div>
                  )}
                  {(article.arxiv_id || article.publication_status) && (
                    <div className="flex gap-4">
                      <span className="text-muted-foreground uppercase w-16 shrink-0">arXiv</span>
                      {article.arxiv_id
                        ? <a href={`https://arxiv.org/abs/${article.arxiv_id}`} className="text-primary hover:underline">arXiv:{article.arxiv_id}</a>
                        : <span className="text-muted-foreground italic">forthcoming</span>}
                    </div>
                  )}
                  {article.repo_url && (
                    <div className="flex gap-4">
                      <span className="text-muted-foreground uppercase w-16 shrink-0">Code</span>
                      <a href={article.repo_url} className="text-primary hover:underline" rel="noopener">{article.repo_url.replace(/^https?:\/\//, "")}</a>
                    </div>
                  )}
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
                pre: ({ node, ...props }) => {
                  const fence = getMapFenceSource(node);
                  if (fence !== null) {
                    const { config, error } = parseMapFence(fence);
                    return <MapFigure {...(config || {})} configError={error} />;
                  }
                  return <pre className="bg-muted p-3 md:p-4 rounded overflow-x-auto text-xs md:text-sm" {...props} />;
                },
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

          <AuthorTrailer location="research_author" />

          <div className="newsletter-inline">
            <NewsletterSubscribe variant="inline" source="research-end" locale={locale} />
          </div>

          <aside style={{ marginTop: 56, paddingTop: 32, borderTop: "1px solid var(--rule)" }}>
            <div className="num-label" style={{ color: "var(--mute)" }}>{t("endCtaKicker")}</div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.0, margin: "12px 0 20px" }}>{t("endCtaHeading")}</h3>
            <Link
              href={`/${locale}/contact`}
              className="btn primary"
              onClick={() => trackEvent("cta_click", { cta: "contact", location: "research_end", source: "research_end", slug })}
            >
              <span>{t("endCtaButton")}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </Link>
          </aside>

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
                          {getItemField(item, "title", locale)}
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-3">
                          {getItemField(item, "abstract", locale)}
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
