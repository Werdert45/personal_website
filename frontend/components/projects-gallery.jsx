"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

function VizIntake() {
  return (
    <svg viewBox="0 0 320 180" style={{ width: "100%", height: "100%" }}>
      <defs>
        <pattern id="vizGridA" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 L0 0 0 20" fill="none" stroke="rgba(15,14,11,.06)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="320" height="180" fill="url(#vizGridA)" />
      <g fontFamily="var(--font-mono)" fontSize="9" fill="#111110">
        <rect x="22" y="40" width="62" height="34" fill="#F6F4EE" stroke="#111110" />
        <text x="36" y="60">intake</text>
        <text x="34" y="72" opacity="0.55" fontSize="7">11 days</text>

        <rect x="106" y="40" width="62" height="34" fill="#FFD60A" stroke="#111110" />
        <text x="118" y="60">KYC</text>
        <text x="114" y="72" opacity="0.6" fontSize="7">automated</text>

        <rect x="190" y="40" width="62" height="34" fill="#FFD60A" stroke="#111110" />
        <text x="200" y="60">parse</text>
        <text x="196" y="72" opacity="0.6" fontSize="7">LLM</text>

        <rect x="22" y="108" width="230" height="34" fill="#111110" stroke="#111110" />
        <text x="78" y="128" fill="#FFD60A">approved · 3 days</text>
      </g>
      <g stroke="#111110" strokeWidth="1.2" fill="none">
        <path d="M84 57 L106 57" />
        <path d="M168 57 L190 57" />
        <path d="M221 74 L221 92 L137 92 L137 108" />
      </g>
    </svg>
  );
}

function VizABM() {
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
          x={x}
          y={y}
          width="14"
          height="14"
          fill={v > 0.55 ? "#FFD60A" : "#F6F4EE"}
          fillOpacity={v > 0.55 ? 0.4 + v * 0.6 : 0.4}
          stroke="#111110"
          strokeWidth="0.5"
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
    <svg viewBox="0 0 320 180" style={{ width: "100%", height: "100%" }}>
      {cells}
      {arrows.map((a, i) => (
        <g key={i}>
          <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="#111110" strokeWidth="1.2" strokeDasharray="3 2" />
          <circle cx={a.x2} cy={a.y2} r="3" fill="#111110" />
        </g>
      ))}
      <g fontFamily="var(--font-mono)" fontSize="8" fill="#8A8676">
        <text x="14" y="172">t = 0</text>
        <text x="280" y="172">t = 10y</text>
      </g>
    </svg>
  );
}

function VizPipeline() {
  return (
    <svg viewBox="0 0 320 180" style={{ width: "100%", height: "100%" }}>
      <defs>
        <pattern id="vizGridB" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 L0 0 0 20" fill="none" stroke="rgba(15,14,11,.06)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="320" height="180" fill="url(#vizGridB)" />
      <g fontFamily="var(--font-mono)" fontSize="9" fill="#111110">
        <rect x="14" y="60" width="56" height="32" fill="#F6F4EE" stroke="#111110" />
        <text x="26" y="79">lead</text>

        <rect x="86" y="60" width="56" height="32" fill="#FFD60A" stroke="#111110" />
        <text x="92" y="79">qualify</text>
        <text x="88" y="50" fontSize="7" opacity="0.55">LLM agent</text>

        <rect x="158" y="60" width="56" height="32" fill="#FFD60A" stroke="#111110" />
        <text x="174" y="79">quote</text>
        <text x="160" y="50" fontSize="7" opacity="0.55">templated</text>

        <rect x="230" y="60" width="56" height="32" fill="#111110" stroke="#111110" />
        <text x="248" y="79" fill="#FFD60A">close</text>

        <rect x="86" y="118" width="128" height="26" fill="#F6F4EE" stroke="#111110" strokeDasharray="3 2" />
        <text x="98" y="135" fontSize="8" opacity="0.7">human-in-the-loop · review</text>
      </g>
      <g stroke="#111110" strokeWidth="1.2" fill="none">
        <path d="M70 76 L86 76" />
        <path d="M142 76 L158 76" />
        <path d="M214 76 L230 76" />
        <path d="M114 92 L114 118" />
        <path d="M186 92 L186 118" />
      </g>
    </svg>
  );
}

function ProjectViz({ kind }) {
  if (kind === "intake") return <VizIntake />;
  if (kind === "abm") return <VizABM />;
  if (kind === "pipeline") return <VizPipeline />;
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
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
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
