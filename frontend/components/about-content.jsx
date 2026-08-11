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
          <span className="num-label">§ 02</span>
          <span>{t("sectionKicker")}</span>
        </div>

        <div className="about-top">
          <div>
            <h2>
              {t("heroTitleLine1a")} <i>{t("heroTitleLine1aItalic")}</i> —<br />
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
              href="/ian-ronk-cv.pdf"
              download="ian-ronk-cv.pdf"
              className="btn ghost"
              style={{ marginTop: 20, display: "inline-flex" }}
            >
              <span>{t("downloadCv")}</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" /></svg>
            </a>
          </div>
          <div className="portrait">
            <Image src="/profile.jpg" alt="Ian Ronk" width={600} height={800} priority sizes="(max-width: 768px) 100vw, 600px" />
            <span className="cap">{t("portraitCaption")}</span>
          </div>
        </div>

      </section>

      {expertise.length > 0 && (
        <section className="section-pad">
          <div className="section-label">
            <span className="bar" />
            <span className="num-label">§ 03</span>
            <span>{t("expertiseBadge")}</span>
          </div>
          <p className="lede">{t("expertiseSubtitle")}</p>
          <div
            className="expertise-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24, marginTop: 40 }}
          >
            {expertise.map((e, i) => (
              <div key={e.title} style={{ borderTop: "1px solid var(--ink)", paddingTop: 18 }}>
                <div className="sector-kicker">
                  <span>§ 03.{String(i + 1).padStart(2, "0")}</span>
                </div>
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
