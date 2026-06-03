"use client";

import { useId } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

function VizABM({ titleText }) {
  const reactId = useId();
  const titleId = `vizABM-${reactId}`;
  const cells = [];
  const seed = (r, c) => Math.sin(r * 5.13 + c * 1.7) * 1000;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 16; c++) {
      const v = (Math.abs(seed(r, c)) % 100) / 100;
      const x = 14 + c * 18;
      const y = 16 + r * 18;
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={x} y={y} width="14" height="14"
          fill={v > 0.55 ? "#FFD60A" : "#F6F4EE"}
          fillOpacity={v > 0.55 ? 0.4 + v * 0.6 : 0.4}
          stroke="#111110" strokeWidth="0.5"
        />
      );
    }
  }
  const arrows = [
    { x1: 70, y1: 60, x2: 110, y2: 100 },
    { x1: 200, y1: 50, x2: 160, y2: 110 },
    { x1: 250, y1: 130, x2: 210, y2: 80 },
  ];
  return (
    <svg viewBox="0 0 320 180" role="img" aria-labelledby={titleId} style={{ width: "100%", height: "100%" }}>
      <title id={titleId}>{titleText || "Agent-based grid simulating neighbourhood turnover from t=0 to t=10 years"}</title>
      {cells}
      {arrows.map((a, i) => (
        <g key={i}>
          <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="#111110" strokeWidth="1.2" strokeDasharray="3 2" />
          <circle cx={a.x2} cy={a.y2} r="3" fill="#111110" />
        </g>
      ))}
      <g fontFamily="var(--font-mono)" fontSize="8" fill="#8A8676">
        <text x="14" y="172">t = 0</text>
        <text x="274" y="172">t = 10y</text>
      </g>
    </svg>
  );
}

function VizHedonic({ titleText }) {
  const reactId = useId();
  const titleId = `vizHedonic-${reactId}`;
  // Deterministic EU country input bars
  const countries = [
    { label: "NL", w: 34 }, { label: "DE", w: 40 }, { label: "FR", w: 36 },
    { label: "IT", w: 30 }, { label: "DK", w: 32 }, { label: "ES", w: 38 }, { label: "+7", w: 24 },
  ];
  // Monthly HPI sparkline (deterministic, base=100)
  const spark = [100, 101, 100, 102, 103, 101, 105, 106, 104, 107, 109, 111];
  const sparkPath = spark.map((v, i) => `${i === 0 ? "M" : "L"}${233 + i * 6},${158 - (v - 100) * 2.5}`).join(" ");
  return (
    <svg viewBox="0 0 320 180" role="img" aria-labelledby={titleId} style={{ width: "100%", height: "100%" }}>
      <title id={titleId}>{titleText || "Eurostat HPI pipeline: 13 EU country scrapes to monthly hedonic price index"}</title>
      {/* Country input bars */}
      {countries.map((c, i) => (
        <g key={c.label} fontFamily="var(--font-mono)" fontSize="7">
          <rect x="14" y={14 + i * 22} width={c.w} height="16"
            fill={c.label === "+7" ? "#FFD60A" : "#F6F4EE"}
            stroke="#111110" strokeWidth="0.7" />
          <text x="18" y={26 + i * 22} fill="#111110">{c.label}</text>
        </g>
      ))}
      {/* Arrow from country stack to pipeline */}
      <path d="M58 80 L90 42" stroke="#111110" strokeWidth="1" fill="none" markerEnd="url(#arr)" />
      {/* Pipeline: scrape */}
      <rect x="90" y="30" width="62" height="26" fill="#F6F4EE" stroke="#111110" strokeWidth="0.8" />
      <text x="95" y="44" fontFamily="var(--font-mono)" fontSize="8" fill="#111110">scrape</text>
      <text x="95" y="53" fontFamily="var(--font-mono)" fontSize="6.5" fill="#8A8676">deduplicate</text>
      {/* Pipeline: enrich */}
      <rect x="90" y="78" width="62" height="26" fill="#FFD60A" stroke="#111110" strokeWidth="0.8" />
      <text x="95" y="92" fontFamily="var(--font-mono)" fontSize="8" fill="#111110">enrich</text>
      <text x="95" y="101" fontFamily="var(--font-mono)" fontSize="6.5" fill="#111110">NUTS3 · lat/lon</text>
      {/* Pipeline: regress */}
      <rect x="90" y="128" width="62" height="26" fill="#111110" stroke="#111110" />
      <text x="95" y="142" fontFamily="var(--font-mono)" fontSize="8" fill="#FFD60A">regress</text>
      <text x="95" y="151" fontFamily="var(--font-mono)" fontSize="6.5" fill="#F6F4EE">log-price model</text>
      {/* Vertical connectors */}
      <path d="M121 56 L121 78" stroke="#111110" strokeWidth="1" fill="none" />
      <path d="M121 104 L121 128" stroke="#111110" strokeWidth="1" fill="none" />
      {/* Arrow to index output */}
      <path d="M152 141 L230 141" stroke="#111110" strokeWidth="1" fill="none" />
      {/* Index output box */}
      <rect x="230" y="110" width="78" height="52" fill="#F6F4EE" stroke="#111110" strokeWidth="0.7" />
      <text x="234" y="124" fontFamily="var(--font-mono)" fontSize="7" fill="#8A8676">monthly HPI</text>
      <polyline points={spark.map((v, i) => `${233 + i * 6},${158 - (v - 100) * 2.5}`).join(" ")}
        fill="none" stroke="#111110" strokeWidth="1.4" />
      <text x="234" y="160" fontFamily="var(--font-mono)" fontSize="6" fill="#8A8676">base = 100</text>
    </svg>
  );
}

function VizLanguageBuddy({ titleText }) {
  const reactId = useId();
  const gridId = `vizGridLB-${reactId}`;
  const titleId = `vizLB-${reactId}`;
  const langs = ["NL", "IT", "ES"];
  const levels = ["A1", "A2", "B1", "B2", "C1"];
  return (
    <svg viewBox="0 0 320 180" role="img" aria-labelledby={titleId} style={{ width: "100%", height: "100%" }}>
      <title id={titleId}>{titleText || "LanguageBuddy: conversational AI tutor with spaced repetition and CEFR progression"}</title>
      <defs>
        <pattern id={gridId} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 L0 0 0 20" fill="none" stroke="rgba(15,14,11,.06)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="320" height="180" fill={`url(#${gridId})`} />
      {/* Language × level grid */}
      {langs.map((lang, li) =>
        levels.map((lvl, vi) => {
          const active = (li === 0 && vi < 3) || (li === 1 && vi <= 4) || (li === 2 && vi <= 4);
          return (
            <g key={`${lang}-${lvl}`}>
              <rect x={20 + vi * 36} y={20 + li * 36} width="30" height="24"
                fill={active ? (vi === 2 && li === 0 ? "#FFD60A" : "#F6F4EE") : "transparent"}
                stroke={active ? "#111110" : "rgba(15,14,11,.15)"}
                strokeWidth="0.7" />
              <text x={24 + vi * 36} y={36 + li * 36}
                fontFamily="var(--font-mono)" fontSize="8"
                fill={active ? "#111110" : "rgba(15,14,11,.25)"}>
                {lvl}
              </text>
            </g>
          );
        })
      )}
      {/* Language labels */}
      {langs.map((lang, li) => (
        <text key={lang} x="10" y={34 + li * 36} fontFamily="var(--font-mono)" fontSize="7" fill="#8A8676"
          textAnchor="middle" transform={`rotate(-90, 10, ${34 + li * 36})`}>{lang}</text>
      ))}
      {/* Pipeline below the grid */}
      <rect x="14" y="130" width="58" height="26" fill="#F6F4EE" stroke="#111110" strokeWidth="0.8" />
      <text x="18" y="144" fontFamily="var(--font-mono)" fontSize="8" fill="#111110">converse</text>
      <text x="18" y="153" fontFamily="var(--font-mono)" fontSize="6.5" fill="#8A8676">Claude AI</text>

      <rect x="90" y="130" width="58" height="26" fill="#FFD60A" stroke="#111110" strokeWidth="0.8" />
      <text x="94" y="144" fontFamily="var(--font-mono)" fontSize="8" fill="#111110">correct</text>
      <text x="94" y="153" fontFamily="var(--font-mono)" fontSize="6.5" fill="#111110">real-time</text>

      <rect x="166" y="130" width="58" height="26" fill="#FFD60A" stroke="#111110" strokeWidth="0.8" />
      <text x="170" y="144" fontFamily="var(--font-mono)" fontSize="8" fill="#111110">review</text>
      <text x="170" y="153" fontFamily="var(--font-mono)" fontSize="6.5" fill="#111110">SM-2 SRS</text>

      <rect x="242" y="130" width="64" height="26" fill="#111110" stroke="#111110" />
      <text x="246" y="144" fontFamily="var(--font-mono)" fontSize="8" fill="#FFD60A">progress</text>
      <text x="246" y="153" fontFamily="var(--font-mono)" fontSize="6.5" fill="#F6F4EE">XP · streak</text>

      <path d="M72 143 L90 143" stroke="#111110" strokeWidth="1" fill="none" />
      <path d="M148 143 L166 143" stroke="#111110" strokeWidth="1" fill="none" />
      <path d="M224 143 L242 143" stroke="#111110" strokeWidth="1" fill="none" />
    </svg>
  );
}

function ProjectViz({ kind }) {
  if (kind === "abm") return <VizABM />;
  if (kind === "hedonic") return <VizHedonic />;
  if (kind === "languagebuddy") return <VizLanguageBuddy />;
  return null;
}

export function ProjectsGallery() {
  const t = useTranslations("Projects");
  const locale = useLocale();
  const items = t.raw("items");

  return (
    <section className="section-pad">
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 05</span>
        <span>{t("kicker")}</span>
      </div>

      <div className="section-head" style={{ alignItems: "end", marginBottom: 56 }}>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(40px, 5.6vw, 84px)",
            lineHeight: 0.98,
            letterSpacing: "-0.02em",
          }}
        >
          {t("titlePrefix")}{" "}
          <i style={{ fontStyle: "italic", color: "var(--yellow-2)" }}>{t("titleItalic")}</i>
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: "var(--ink-2)", maxWidth: "52ch" }}>
          {t("subtitle")}
        </p>
      </div>

      <div className="projects-grid">
        {items.map((item, i) => {
          const num = String(i + 1).padStart(2, "0");
          const isResearchLink = item.link && item.link.startsWith("/research/");
          const linkLabel = isResearchLink ? t("viewPaper") : t("viewCase");
          const localizedHref = item.link ? `/${locale}${item.link}` : null;

          const cardInner = (
            <>
              <div className="project-viz">
                {item.viz === "image" && item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 800px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <ProjectViz kind={item.viz} />
                )}
              </div>
              <div className="project-body">
                <div className="project-kicker">
                  <span>§ 05.{num}</span>
                  <span>{item.sector}</span>
                </div>
                <h3 className="project-title">{item.title}</h3>
                <p className="project-outcome">{item.outcome}</p>
                <div className="project-stack">
                  {(item.stack || []).map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                </div>
                {item.link && (
                  <div className="project-link">
                    <span>{linkLabel}</span>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                  </div>
                )}
              </div>
            </>
          );

          return item.link ? (
            <Link
              key={i}
              href={localizedHref}
              className="project-card project-card-linked"
              onClick={() => trackEvent("cta_click", { cta: "project_open", location: "home_projects", source: "home_projects_card", project: item.title })}
            >
              {cardInner}
            </Link>
          ) : (
            <div key={i} className="project-card">
              {cardInner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
