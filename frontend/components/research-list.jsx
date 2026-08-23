"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import NewsletterSubscribe from "@/components/newsletter-subscribe";
import { trackEvent } from "@/lib/analytics";
import { getItemField } from "@/lib/i18n-item";
import { renderTitle } from "@/lib/render-title";

// Fallback shown only when the CMS returns no published research.
// Every entry here must describe REAL work with a real detail page.
const DEFAULT_ITEMS = [
  { id: 1, slug: "voronoi-postcode-estimation", category: "PREPRINT", date: "2026-07", title: "Calibrating free postcode boundaries from OpenStreetMap", abstract: "How many OSM address points does a usable postcode polygon need? A single Voronoi pipeline calibrated against authoritative NL and DK layers (5,160 polygons), a seed-density-to-IoU curve with a robust asymptote (mean matched IoU ≈ 0.76–0.82), out-of-sample transfer to held-out Belgium, and an application to Italy's 4,209 CAP polygons, where no free authoritative layer exists." },
  { id: 2, slug: "metro-capitalisation-timing", category: "WORKING-PAPER", date: "2026-07", title: "When does metro infrastructure capitalize into property prices?", abstract: "Phase-decomposed staggered difference-in-differences across seven European cities (n = 42,004). The pooled average locates the largest response at maturity, two or more years after opening. But city-by-year fixed effects collapse that pooled step, and the defensible magnitudes are per-city: foremost Milano's +167 EUR/m² (wild-bootstrap p = 0.004)." },
  { id: 3, slug: "gentrification-abm", category: "THESIS", date: "2025-08", title: "Agent-based modelling of gentrification dynamics", abstract: "MSc thesis (2025). An agent-based model of neighbourhood change driven by attractiveness and affordability, applied to Amsterdam, Utrecht and Milan on open spatial data, with an honest account of where the aggregation level limits what the model can claim. Case-study posts land here from August 2026." },
];

// Announced but unpublished work, shown after the published papers.
const IN_PROGRESS = [
  { title: "Social housing impact on the gentrification ABM" },
  { title: "Urban heat island research" },
];

export function ResearchList({ initialItems = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [researchItems, setResearchItems] = useState(initialItems);
  const [loading, setLoading] = useState(!initialItems.length);
  const t = useTranslations("Research");
  const locale = useLocale();

  useEffect(() => {
    if (initialItems.length) return undefined;
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

  // Project detail pages live under /research/<slug> too, but belong to the
  // Projects grid — keep them out of the papers list.
  const source = (researchItems.length ? researchItems : loading ? [] : DEFAULT_ITEMS)
    .filter((item) => (item.category || "").toLowerCase() !== "project");

  const filteredItems = source.filter((item) => {
    const title = getItemField(item, "title", locale) || "";
    const abstract = getItemField(item, "abstract", locale) || "";
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
          {t("listTitlePrefix")} <i style={{ fontStyle: "italic" }}>{t("listTitleItalic")}</i>.
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
                {renderTitle(getItemField(item, "title", locale))}
                <span className="rm">{getItemField(item, "excerpt", locale) || getItemField(item, "abstract", locale)}</span>
              </div>
              <div className="rtag">{(item.category || "RESEARCH").toUpperCase()}</div>
              <div className="rarr">→</div>
            </div>
          </Link>
        ))}
        {!searchQuery && IN_PROGRESS.map((item, i) => (
          <div key={item.title} className="research-item" style={{ cursor: "default", opacity: 0.65 }}>
            <div className="ri">{String(filteredItems.length + i + 1).padStart(2, "0")}</div>
            <div className="ry" />
            <div className="rt">{item.title}</div>
            <div className="rtag">IN PROGRESS</div>
            <div className="rarr" />
          </div>
        ))}
      </div>

      {!loading && filteredItems.length === 0 && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--mute)", padding: "40px 0", textAlign: "center" }}>
          {t("noResults")}
        </p>
      )}

      <div style={{ marginTop: 64 }}>
        <NewsletterSubscribe variant="inline" source="research-index" locale={locale} />
      </div>

      <Link
        href={`/${locale}/contact`}
        className="btn ghost"
        style={{ marginTop: 20 }}
        onClick={() => trackEvent("cta_click", { cta: "contact", location: "research_index", source: "research_index" })}
      >
        <span>{t("indexDiscuss")}</span>
      </Link>
    </section>
  );
}
