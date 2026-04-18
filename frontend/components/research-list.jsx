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
  { id: 1, slug: "rent-prediction-hedonic", category: "RESEARCH", date: "2025-11", title: "Hedonic rent prediction across 15 EU metros", abstract: "Predicting apartment rents with PostGIS, gradient boosting and amenity-weighted isochrones. Cross-validated at parcel level." },
  { id: 2, slug: "gentrification-abm", category: "METHODOLOGY", date: "2024-06", title: "Agent-based simulation of gentrification", abstract: "Modelling 10-year neighbourhood turnover in Amsterdam using Kadaster + CBS microdata and calibrated move probabilities." },
  { id: 3, slug: "flood-risk-parcels", category: "CASE-STUDY", date: "2023-09", title: "Parcel-level flood risk for insurers", abstract: "90%+ accuracy on insurable-loss classification combining LiDAR, rainfall radar, and cadastre data." },
  { id: 4, slug: "street-view-maintenance", category: "RESEARCH", date: "2024-02", title: "Street-view CV for maintenance signals", abstract: "Extracting façade wear and commerce intensity from 4M frames across six European cities." },
  { id: 5, slug: "isochrones-api", category: "CASE-STUDY", date: "2025-03", title: "Sub-200ms isochrone API on OSRM + GTFS", abstract: "Replacing three paid vendors with an in-house stack covering walk/bike/transit for any EU point." },
];

export function ResearchList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [researchItems, setResearchItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("Research");
  const locale = useLocale();

  const categories = [
    { value: "all", label: t("all") },
    { value: "research", label: t("research") },
    { value: "case-study", label: t("caseStudies") },
    { value: "methodology", label: t("methodology") },
  ];

  useEffect(() => {
    let alive = true;
    async function fetchResearch() {
      try {
        const response = await fetch("/api/django?endpoint=research");
        if (response.ok) {
          const data = await response.json();
          const results = data.results || data;
          if (alive && Array.isArray(results) && results.length) setResearchItems(results);
        }
      } catch {}
      finally {
        if (alive) setLoading(false);
      }
    }
    fetchResearch();
    return () => { alive = false; };
  }, []);

  const source = researchItems.length ? researchItems : DEFAULT_ITEMS;

  const filteredItems = source.filter((item) => {
    const title = getTranslated(item, "title", locale) || "";
    const abstract = getTranslated(item, "abstract", locale) || "";
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      activeCategory === "all" || (item.category || "").toLowerCase() === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="section-pad" style={{ paddingTop: 160 }}>
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 04</span>
        <span>Research — case notes, methods, essays</span>
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
          Field <i style={{ fontStyle: "italic" }}>notes</i>,<br />
          public <span style={{ color: "var(--yellow-2)" }}>record</span>.
        </h2>
        <p style={{ fontSize: 15, color: "var(--mute)", maxWidth: "38ch", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {t("subtitle")}
        </p>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 40, alignItems: "center" }}>
        <input
          type="search"
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: "1 1 260px",
            background: "transparent",
            border: 0,
            borderBottom: "1px solid var(--ink)",
            padding: "10px 0",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            letterSpacing: "0.04em",
            outline: "none",
            color: "var(--ink)",
          }}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "8px 14px",
                border: "1px solid var(--ink)",
                background: activeCategory === cat.value ? "var(--ink)" : "transparent",
                color: activeCategory === cat.value ? "var(--paper)" : "var(--ink)",
                cursor: "pointer",
                transition: "all .2s",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !researchItems.length && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--mute)", padding: "40px 0" }}>
          {t("loading")}
        </p>
      )}

      <div className="research-list">
        {filteredItems.map((item, i) => (
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

      {!loading && filteredItems.length === 0 && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--mute)", padding: "40px 0", textAlign: "center" }}>
          {t("noResults")}
        </p>
      )}
    </section>
  );
}
