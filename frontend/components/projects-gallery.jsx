"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";
import {
  VizLanguage,
  VizABM,
  VizConnectivity,
  VizHedonic,
  VizPipelines,
  VizTransfer,
  VizSponsor,
  VizFish,
  VizFlood,
} from "./project-viz";

const VIZ = {
  language: VizLanguage,
  abm: VizABM,
  connectivity: VizConnectivity,
  hedonic: VizHedonic,
  pipelines: VizPipelines,
  transfer: VizTransfer,
  sponsor: VizSponsor,
  fish: VizFish,
  flood: VizFlood,
};

function ProjectViz({ kind }) {
  const C = VIZ[kind];
  return C ? <C /> : null;
}

export function ProjectsGallery() {
  const t = useTranslations("Projects");
  const locale = useLocale();
  const items = t.raw("items");

  return (
    <section className="section-pad">
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 04</span>
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
          const isExternalLink = item.link && /^https?:\/\//.test(item.link);
          const linkLabel = isResearchLink ? t("viewPaper") : t("viewCase");
          const localizedHref = item.link ? (isExternalLink ? item.link : `/${locale}${item.link}`) : null;

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
                  <span>§ 04.{num}</span>
                  <span>{item.sector}</span>
                  {item.badge && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, background: item.badge === "KR&A" ? "var(--ink)" : "var(--yellow)", color: item.badge === "KR&A" ? "var(--yellow)" : "var(--ink)", padding: "2px 8px", borderRadius: 2, letterSpacing: "0.08em" }}>{item.badge}</span>
                  )}
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
              {...(isExternalLink ? { target: "_blank", rel: "noopener noreferrer" } : {})}
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
