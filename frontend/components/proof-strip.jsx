"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { trackEvent } from "@/lib/analytics";

export function ProofStrip() {
  const t = useTranslations("Proof");
  const locale = useLocale();
  const outcomes = t.raw("outcomes");
  const quote = t("quote");

  return (
    <section className="section-pad">
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 05</span>
        <span>{t("kicker")}</span>
      </div>

      <div className="section-head" style={{ alignItems: "end", marginBottom: 40 }}>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(40px, 5.6vw, 84px)",
            lineHeight: 0.98,
            letterSpacing: "-0.02em",
          }}
        >
          {t("titlePrefix")}{" "}
          <i style={{ fontStyle: "italic", color: "var(--yellow-2)" }}>{t("titleItalic")}</i>{" "}
          {t("titleSuffix")}
        </h2>
      </div>

      <div className="proof-strip">
        {quote ? (
          <div className="proof-quote">
            <div>
              <div className="proof-quote-mark" aria-hidden>
                &ldquo;
              </div>
              <p className="proof-quote-text">{quote}</p>
            </div>
            <div className="proof-quote-attribution">— {t("quoteAttribution")}</div>
          </div>
        ) : null}
        <div className="proof-outcomes">
          {outcomes.map((o, i) => (
            <div key={i} className="proof-outcome">
              <div className="proof-outcome-value">{o.value}</div>
              <div className="proof-outcome-meta">
                <div className="proof-outcome-unit">{o.unit}</div>
                <div className="proof-outcome-context">{o.context}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="proof-cta-row">
        <Link
          href={`/${locale}/about`}
          className="btn primary"
          onClick={() => trackEvent("cta_click", { cta: "resume", location: "home_proof_strip", source: "home_proof_primary" })}
        >
          <span>{t("ctaPrimary")}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        </Link>
        <Link
          href={`/${locale}/contact`}
          className="btn ghost"
          onClick={() => trackEvent("cta_click", { cta: "contact", location: "home_proof_strip", source: "home_proof_secondary" })}
        >
          <span>{t("ctaSecondary")}</span>
        </Link>
      </div>
    </section>
  );
}
