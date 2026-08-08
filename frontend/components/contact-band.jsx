"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

export function ContactBand() {
  const t = useTranslations("Contact");
  const nav = useTranslations("Navigation");
  const locale = useLocale();

  return (
    <section className="section-pad" style={{ background: "var(--ink)", color: "var(--paper-2)" }}>
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 08</span>
        <span>{t("sectionKicker")}</span>
      </div>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(48px, 8vw, 120px)", lineHeight: 0.95, letterSpacing: "-0.02em", marginTop: 24, color: "var(--paper-2)" }}>
        {t("bandLine1")}{" "}
        <i style={{ fontStyle: "italic", color: "var(--yellow)" }}>{t("bandLine2Italic")}</i>{" "}
        {t("bandLine3")}
      </h2>
      <div style={{ marginTop: 40, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <Link
          href={`/${locale}/contact`}
          className="btn primary"
          onClick={() => trackEvent("cta_click", { cta: "contact", location: "home_contact_band", source: "contact_band_primary" })}
        >
          <span>{nav("letsTalk")}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        </Link>
        <a
          href="https://github.com/Werdert45"
          target="_blank"
          rel="noopener noreferrer"
          className="btn ghost"
          onClick={() => trackEvent("cta_click", { cta: "github", location: "home_contact_band", source: "contact_band_secondary" })}
        >
          <span>{t("linkGitHub")}</span>
        </a>
      </div>
    </section>
  );
}
