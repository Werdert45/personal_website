"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

function getTranslated(item, field, locale) {
  if (locale === "en") return item[field];
  const trans = item.translations?.find((t) => t.language === locale);
  return trans?.[field] || item[field];
}

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

const DEFAULT_ITEMS = [
  { id: 1, slug: "rent-prediction-hedonic", category: "PAPER", date: "2025-11", title: "Hedonic rent prediction across 15 EU metros", abstract: "Parcel-level hedonic model on PostGIS + gradient boosting." },
  { id: 2, slug: "gentrification-abm", category: "WORKING-PAPER", date: "2024-06", title: "Agent-based simulation of neighbourhood turnover", abstract: "10-year ABM calibrated on Kadaster + CBS microdata." },
  { id: 3, slug: "flood-risk-parcels", category: "PAPER", date: "2023-09", title: "Parcel-level flood-risk classification for insurers", abstract: "Supervised classification on LiDAR + rainfall radar." },
  { id: 4, slug: "street-view-cv", category: "PREPRINT", date: "2024-02", title: "Façade and commerce signals from street-view imagery", abstract: "CNN extraction from 4M frames, six EU cities." },
];

export function ResearchPreview() {
  const [articles, setArticles] = useState([]);
  const t = useTranslations("Research");
  const locale = useLocale();

  useEffect(() => {
    let alive = true;
    async function fetchArticles() {
      try {
        const response = await fetch("/api/django?endpoint=research");
        if (response.ok) {
          const data = await response.json();
          const results = data.results || data;
          if (alive && Array.isArray(results) && results.length) setArticles(results.slice(0, 4));
        }
      } catch {}
    }
    fetchArticles();
    return () => { alive = false; };
  }, []);

  const list = articles.length ? articles : DEFAULT_ITEMS;

  return (
    <section className="section-pad">
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 04</span>
        <span>{t("previewBadge")}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 40, gap: 64, flexWrap: "wrap" }}>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(48px, 7vw, 104px)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
          }}
        >
          Selected <i style={{ fontStyle: "italic" }}>papers</i>.
        </h2>
        <p style={{ fontSize: 15, color: "var(--mute)", maxWidth: "34ch", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Recent output on real-estate econometrics and geospatial methods.{" "}
          <Link href={`/${locale}/research`} style={{ borderBottom: "1px solid" }}>
            {t("viewAll")} →
          </Link>
        </p>
      </div>

      <div className="research-list">
        {list.map((item, i) => (
          <Link key={item.id || item.slug} href={`/${locale}/research/${item.slug}`} style={{ display: "block" }}>
            <div className="research-item">
              <div className="ri">{String(i + 1).padStart(2, "0")}</div>
              <div className="ry">{item.date || ""}</div>
              <div className="rt">
                {renderTitle(getTranslated(item, "title", locale))}
                <span className="rm">{getTranslated(item, "abstract", locale)}</span>
              </div>
              <div className="rtag">{(item.category || "RESEARCH").toUpperCase()}</div>
              <div className="rarr">→</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
