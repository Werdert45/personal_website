"use client";

import { useTranslations } from "next-intl";

export function SectorsStrip() {
  const t = useTranslations("Sectors");
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
          <i style={{ fontStyle: "italic", color: "var(--yellow-2)" }}>{t("titleItalic")}</i>{" "}
          {t("titleSuffix")}
        </h2>
        <p style={{ fontSize: 16, lineHeight: 1.55, color: "var(--ink-2)", maxWidth: "52ch" }}>
          {t("subtitle")}
        </p>
      </div>

      <div className="sectors-grid">
        {items.map((item, i) => (
          <div key={item.name} className="sector-tile">
            <div className="sector-kicker">
              <span>§ 04.{String(i + 1).padStart(2, "0")}</span>
              <span className="sector-dot" />
            </div>
            <h3 className="sector-name">{item.name}</h3>
            <p className="sector-blurb">{item.blurb}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
