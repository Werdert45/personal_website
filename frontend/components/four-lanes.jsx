"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

export function FourLanes() {
  const t = useTranslations("Lanes");
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
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(40px, 5.6vw, 84px)", lineHeight: 0.98, letterSpacing: "-0.02em" }}>
          <i style={{ fontStyle: "italic", color: "var(--yellow-2)" }}>{t("titleItalic")}</i> {t("titleRest")}
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: "var(--ink-2)", maxWidth: "52ch" }}>{t("subtitle")}</p>
      </div>

      <div className="lanes-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
        {items.map((lane, i) => (
          <div key={lane.name} className="lane-tile" style={{ borderTop: "1px solid var(--ink)", paddingTop: 18 }}>
            <div className="sector-kicker" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>§ 04.{String(i + 1).padStart(2, "0")}</span>
              {lane.anchor ? (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink)", background: "var(--yellow)", padding: "2px 8px", borderRadius: 2 }}>ANCHOR</span>
              ) : (
                <span className="sector-dot" />
              )}
            </div>
            <h3 className="sector-name" style={{ marginTop: 12 }}>{lane.name}</h3>
            <p className="sector-blurb">{lane.blurb}</p>
            <div className="stack" style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {lane.stack.map((s) => (
                <span key={s} className="chip">{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 40, fontSize: 14, color: "var(--mute)", maxWidth: "70ch" }}>{t("appliedAcross")}</p>
      <p style={{ marginTop: 12, fontSize: 14, color: "var(--mute)", maxWidth: "70ch" }}>{t("automationNote")}</p>

      <div style={{ marginTop: 40 }}>
        <Link
          href={`/${locale}/contact`}
          className="btn primary"
          onClick={() => trackEvent("cta_click", { cta: "contact", location: "home_lanes", source: "lanes_cta" })}
        >
          <span>{t("ctaLabel")}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        </Link>
      </div>
    </section>
  );
}
