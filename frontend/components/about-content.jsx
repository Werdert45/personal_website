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
            <h2>
              {t("heroTitleLine1a")} <i>{t("heroTitleLine1aItalic")}</i>
              <br />
              {t("heroTitleLine2")} <span className="u">{t("heroTitleLine2Underline")}</span>
              <br />
              {t("heroTitleLine3")}
            </h2>
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
            <Image src="/profile.jpg" alt="Ian Ronk" width={600} height={800} priority sizes="(max-width: 768px) 100vw, 600px" />
            <span className="cap">{t("portraitCaption")}</span>
          </div>
        </div>

      </section>

      {expertise.length > 0 && (
        <section className="section-pad" style={{ paddingTop: 0 }}>
          <div className="section-label">
            <span className="bar" />
            <span>{t("expertiseBadge")}</span>
          </div>
          <p className="lede">{t("expertiseSubtitle")}</p>
          <div
            className="expertise-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginTop: 40 }}
          >
            {expertise.map((e, i) => (
              <div key={e.title} style={{ borderTop: "1px solid var(--ink)", paddingTop: 18 }}>
                <h3 className="sector-name" style={{ marginTop: 12 }}>{e.title}</h3>
                <p className="sector-blurb">{e.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <ResumeSection />
    </>
  );
}
