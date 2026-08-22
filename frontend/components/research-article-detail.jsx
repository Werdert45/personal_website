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
import { ArrowLeft, Loader2, ArrowRight, Clock } from "lucide-react";
import NewsletterSubscribe from "@/components/newsletter-subscribe";
import { trackEvent } from "@/lib/analytics";
import { getItemField } from "@/lib/i18n-item";
import { AuthorTrailer } from "@/components/author-trailer";
import { STATIC_PAPERS } from "@/components/research-static-papers";

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

export default function ResearchArticleDetail({ slug, initialArticle = null }) {
  // Server-provided article, or the static manuscript fallback, renders
  // synchronously on the server — no mounted gate, or crawlers see nothing.
  const fallbackArticle = initialArticle || STATIC_PAPERS[slug] || null;
  const [article, setArticle] = useState(fallbackArticle);
  const [geojsonData, setGeojsonData] = useState(null);
  const [loading, setLoading] = useState(!fallbackArticle);
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
        } else if (fallbackArticle) {
          // Keep the server-provided or static article; just hydrate the related list.
          fetchRelatedArticles(fallbackArticle.category, fallbackArticle.tags, fallbackArticle.slug);
        } else {
          setError("Article not found");
        }
      } catch (err) {
        if (!fallbackArticle) {
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
                img: ({ node, ...props }) => (
                  // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                  <img className="w-full rounded border border-border my-6" loading="lazy" {...props} />
                ),
                code: ({ node, className, children, ...props }) => {
                  // react-markdown v9+ dropped the `inline` prop: detect block
                  // code by a language- class or embedded newlines instead.
                  const isBlock = /language-/.test(className || "") || /\n/.test(String(children));
                  return isBlock ? (
                    <code className={`block bg-muted p-3 md:p-4 rounded text-xs md:text-sm font-mono overflow-x-auto ${className || ""}`} {...props}>{children}</code>
                  ) : (
                    <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs md:text-sm font-mono text-primary" {...props}>{children}</code>
                  );
                },
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
