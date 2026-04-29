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
  { id: 1, slug: "rent-prediction-hedonic", category: "PAPER", date: "2025-11", title: "Hedonic rent prediction across 15 EU metros", abstract: "A parcel-level hedonic model combining PostGIS spatial joins, gradient boosting and amenity-weighted isochrones. Cross-validated out-of-sample; preprint under review." },
  { id: 2, slug: "gentrification-abm", category: "WORKING-PAPER", date: "2024-06", title: "Agent-based simulation of neighbourhood turnover", abstract: "Calibrated ABM for 10-year turnover in Amsterdam on Kadaster + CBS microdata. Robustness checks and sensitivity analyses across move-probability priors." },
  { id: 3, slug: "flood-risk-parcels", category: "PAPER", date: "2023-09", title: "Parcel-level flood-risk classification for insurers", abstract: "Supervised classification on LiDAR, rainfall radar and cadastre features. Reports 90%+ balanced accuracy on held-out insurable-loss claims." },
  { id: 4, slug: "street-view-cv", category: "PREPRINT", date: "2024-02", title: "Façade and commerce signals from street-view imagery", abstract: "CNN-based extraction of maintenance and retail-intensity signals from 4M frames across six European cities; inter-rater agreement and limitations." },
  { id: 5, slug: "isochrone-methodology", category: "METHOD", date: "2025-03", title: "Sub-200ms isochrones on OSRM + GTFS: a replication note", abstract: "Methodology note documenting routing-graph preprocessing, tile-cache strategy and measured p95 latency against three commercial baselines." },
  { id: 6, slug: "cadastre-review", category: "REVIEW", date: "2024-10", title: "Open cadastre data in the EU: a coverage review", abstract: "Survey of cadastral data access and licensing across NL, DE, BE, FR, IT, ES. Tabulates fields, refresh cadence, and reproducibility gaps." },
];

export function ResearchList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [researchItems, setResearchItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("Research");
  const locale = useLocale();

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
    const q = searchQuery.toLowerCase();
    return (
      title.toLowerCase().includes(q) ||
      abstract.toLowerCase().includes(q) ||
      (item.tags || []).some((tag) => tag.toLowerCase().includes(q))
    );
  });

  return (
    <section className="section-pad" style={{ paddingTop: 160 }}>
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 04</span>
        <span>{t("listKicker")}</span>
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
          {t("listTitlePrefix")} <i style={{ fontStyle: "italic" }}>{t("listTitleItalic")}</i><br />
          {t("listTitleAmp")} <span style={{ color: "var(--yellow-2)" }}>{t("listTitleHighlight")}</span>.
        </h2>
        <p style={{ fontSize: 15, color: "var(--mute)", maxWidth: "38ch", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {t("listSubtitle")}
        </p>
      </div>

      <div role="search" style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 40, alignItems: "center" }}>
        <label htmlFor="research-search" className="sr-only">
          {t("searchPlaceholder")}
        </label>
        <input
          id="research-search"
          type="search"
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="focus-ring"
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
