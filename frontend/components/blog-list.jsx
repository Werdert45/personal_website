"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

const DEFAULT_POSTS = [
  { slug: "against-dashboards", category: "THOUGHT", date: "2026-04", title: "The case against dashboards", excerpt: "Why opinionated internal tools outperform generic dashboards for real estate teams — with five examples from the past year." },
  { slug: "h3-for-real-estate", category: "EXPLANATION", date: "2026-03", title: "Why we switched to H3 for real-estate geoindexing", excerpt: "Trading quadkeys for hexagons: what changed in query latency, cache hit-rate, and analyst ergonomics." },
  { slug: "internal-tools-beat-dashboards", category: "UPDATE", date: "2026-02", title: "Internal tools that quietly replaced our dashboards", excerpt: "A field report on building three small apps that retired a 40-tab dashboard farm over six months." },
  { slug: "postgis-vs-duckdb", category: "EXPLANATION", date: "2026-01", title: "PostGIS vs DuckDB for analyst queries", excerpt: "When each wins, and how we route analyst notebooks to the right backend without them noticing." },
  { slug: "cadastre-as-code", category: "UPDATE", date: "2025-12", title: "Cadastre-as-Code, one year in", excerpt: "Notes from maintaining an MIT-licensed library that normalises cadastral dumps across six EU countries." },
  { slug: "isochrone-api", category: "EXPLANATION", date: "2025-11", title: "Replacing three paid isochrone vendors", excerpt: "How we built a sub-200ms in-house isochrone API on OSRM + GTFS and retired three recurring contracts." },
];

function renderTitle(title) {
  if (!title) return null;
  const parts = title.split(" ");
  if (parts.length === 1) return <i>{title}</i>;
  const last = parts.pop();
  return (
    <>
      {parts.join(" ")} <i>{last}</i>
    </>
  );
}

function getField(post, field, locale, fallback) {
  if (locale === "en") return post[field] ?? fallback;
  const trans = post.translations?.find((t) => t.language === locale);
  return trans?.[field] || post[field] || fallback;
}

export function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const locale = useLocale();
  const t = useTranslations("Thoughts");

  useEffect(() => {
    let alive = true;
    fetch("/api/django?endpoint=blog")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive || !data) return;
        const results = data.results || data;
        if (Array.isArray(results) && results.length) setPosts(results);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const source = posts.length ? posts : DEFAULT_POSTS;
  const [featured, ...rest] = source;

  return (
    <section className="section-pad" style={{ paddingTop: 160 }}>
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 03</span>
        <span>{t("kicker")}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 48, gap: 64, flexWrap: "wrap" }}>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(48px, 7vw, 104px)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
          }}
        >
          {t("recentTitle")} <i style={{ fontStyle: "italic" }}>{t("recentItalic")}</i>.
        </h2>
        <p style={{ fontSize: 15, color: "var(--mute)", maxWidth: "38ch", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {t("subtitle")}
        </p>
      </div>

      {loading && !posts.length && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--mute)", padding: "40px 0" }}>
          {t("loading")}
        </p>
      )}

      {featured && (
        <Link href={`/${locale}/thoughts/${featured.slug}`} style={{ display: "block" }}>
          <div className="blog-feat">
            <div className="cover">
              <span className="kicker">{t("featuredKicker")} {getField(featured, "category", locale, "THOUGHT").toUpperCase()}</span>
            </div>
            <div className="body">
              <div className="tag">
                <span>{getField(featured, "category", locale, "THOUGHT").toUpperCase()}</span>
                <span>{(featured.date || featured.published_at || "").slice(0, 7)}</span>
              </div>
              <h3>{renderTitle(getField(featured, "title", locale, ""))}</h3>
              <p>{getField(featured, "excerpt", locale, "")}</p>
              <span className="cta">{t("readPiece")}</span>
            </div>
          </div>
        </Link>
      )}

      <div className="blog-list">
        {rest.map((post, i) => (
          <Link key={post.slug} href={`/${locale}/thoughts/${post.slug}`} style={{ display: "block" }}>
            <div className="blog-row">
              <div className="bi">{String(i + 2).padStart(2, "0")}</div>
              <div className="by">{(post.date || post.published_at || "").slice(0, 7)}</div>
              <div className="bt">
                {renderTitle(getField(post, "title", locale, ""))}
                <span className="bm">{getField(post, "excerpt", locale, "")}</span>
              </div>
              <div className="bg">{getField(post, "category", locale, "THOUGHT").toUpperCase()}</div>
              <div className="barr">→</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
