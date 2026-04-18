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
  { id: 1, slug: "rent-prediction-hedonic", category: "RESEARCH", date: "2025-11", title: "Hedonic rent prediction across 15 EU metros", abstract: "PostGIS + gradient boosting at parcel level." },
  { id: 2, slug: "gentrification-abm", category: "METHODOLOGY", date: "2024-06", title: "Agent-based simulation of gentrification", abstract: "10-year neighbourhood turnover in Amsterdam." },
  { id: 3, slug: "flood-risk-parcels", category: "CASE-STUDY", date: "2023-09", title: "Parcel-level flood risk for insurers", abstract: "LiDAR + rainfall radar + cadastre." },
  { id: 4, slug: "street-view-maintenance", category: "RESEARCH", date: "2024-02", title: "Street-view CV for maintenance signals", abstract: "4M frames across six European cities." },
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
          Recent <i style={{ fontStyle: "italic" }}>research</i>.
        </h2>
        <p style={{ fontSize: 15, color: "var(--mute)", maxWidth: "34ch", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {t("previewSubtitle")}{" "}
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
