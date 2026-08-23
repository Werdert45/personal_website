"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { ResumeSection } from "@/components/resume-section";

export function AboutContent() {
  const t = useTranslations("About");

  const expertise = t.raw("expertise") || [];

  return (
    <>
      <section className="section-pad" style={{ paddingTop: 160 }}>
        <div className="section-label">
          <span className="bar" />
          <span>{t("sectionKicker")}</span>
        </div>

        <div className="about-top" style={{ paddingBottom: 0, borderBottom: "none" }}>
          <div>
            <h1>
              {t("heroTitleLine1a")} <i>{t("heroTitleLine1aItalic")}</i>
              <br />
              {t("heroTitleLine2")} <span className="u">{t("heroTitleLine2Underline")}</span>
              <br />
              {t("heroTitleLine3")}
            </h1>
            <p className="lede">
              {t("lede1")}
            </p>
            <p className="lede">
              {t("lede2")}
            </p>
            <a
              href="#resume"
              className="btn ghost"
              style={{ marginTop: 20, display: "inline-flex" }}
            >
              <span>{t("cvBelow")}</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><path d="M12 5v14m0 0l-5-5m5 5l5-5" /></svg>
            </a>
          </div>
          <div className="portrait">
            <Image src="/profile.jpg" alt="Ian Ronk" width={800} height={800} priority sizes="(max-width: 768px) 100vw, 600px" />
            <span className="cap">{t("portraitCaption")}</span>
          </div>
        </div>

      </section>

      {expertise.length > 0 && (
        <section className="section-pad" style={{ paddingTop: 72 }}>
          <div className="section-label">
            <span className="bar" />
            <span>{t("expertiseBadge")}</span>
          </div>
          <p className="lede">{t("expertiseSubtitle")}</p>
          {/* Same tile styling as the homepage Focus Areas section */}
          <div className="lanes-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginTop: 40 }}>
            {expertise.map((e) => (
              <div key={e.name} className="lane-tile" style={{ borderTop: "1px solid var(--ink)", paddingTop: 18 }}>
                <div className="sector-kicker" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                  <span className="sector-dot" />
                </div>
                <h3 className="sector-name" style={{ marginTop: 12 }}>{e.name}</h3>
                <p className="sector-blurb">{e.blurb}</p>
                <div className="stack" style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {(e.stack || []).map((s) => (
                    <span key={s} className="chip">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <ResumeSection />
    </>
  );
}
