"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { resume, resumeSections } from "@/data/resume";

// Resume content is EN-only by design (see docs/superpowers/specs/
// 2026-08-11-cv-resume-design.md); the surrounding page chrome stays localized.

const RULE = "1px solid #3a382f";

const colHeadingStyle = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  color: "var(--yellow)",
  borderBottom: RULE,
  paddingBottom: 10,
  marginBottom: 28,
};

const metaStyle = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  color: "#8A8676",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const bodyStyle = { fontSize: 14, color: "#D6D2C4", lineHeight: 1.55 };

export function ResumeSection() {
  const t = useTranslations("About");
  const locale = useLocale();

  const engineering = resume.engineering || [];
  const research = resume.research || [];
  const education = resume.education || [];
  const stack = resume.stack || [];
  const { languages, softSkills } = resume.header || {};

  return (
    <section className="xp" id="resume">
      <div className="section-label">
        <span className="bar" />
        <span>{resumeSections.kicker}</span>
      </div>
      <h2>
        <i>{t("journeyTitlePrefixItalic")}</i> {t("journeyTitleRest")}
        <br />
        {t("journeyTitleLine2")}
      </h2>
      <p className="lede">{t("experienceSubtitle")}</p>

      <a
        href="/ian-ronk-cv.pdf"
        download="ian-ronk-cv.pdf"
        className="btn primary"
        style={{ marginBottom: 64 }}
      >
        <span>{t("downloadCv")}</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" focusable="false"><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" /></svg>
      </a>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: "64px 72px",
          alignItems: "start",
        }}
      >
        {/* Engineering & Leadership (left on desktop, first on mobile) */}
        <div>
          <h3 style={colHeadingStyle}>{resumeSections.engineering}</h3>
          {engineering.map((job, i) => (
            <div key={i} style={{ marginBottom: i === engineering.length - 1 ? 0 : 36 }}>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 24,
                  lineHeight: 1.1,
                  letterSpacing: "-0.01em",
                }}
              >
                {job.role}
              </div>
              <div style={{ ...metaStyle, marginTop: 6 }}>
                {[job.org, job.orgNote].filter(Boolean).join(" · ")} · {job.period}
              </div>
              <ul style={{ ...bodyStyle, margin: "10px 0 0 18px", padding: 0, listStyle: "disc" }}>
                {(job.bullets || []).map((b, j) => (
                  <li key={j} style={{ marginBottom: 4 }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Research & Publications (right on desktop, second on mobile) */}
        <div>
          <h3 style={colHeadingStyle}>{resumeSections.research}</h3>
          {research.map((paper, i) => {
            const title = (
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 22,
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                }}
              >
                {paper.title}
                {paper.href ? <span style={{ color: "var(--yellow)" }}> ↗</span> : null}
              </div>
            );
            return (
              <div key={i} style={{ marginBottom: i === research.length - 1 ? 0 : 32 }}>
                {paper.href && /^https?:\/\//.test(paper.href) ? (
                  <a href={paper.href} target="_blank" rel="noopener noreferrer">{title}</a>
                ) : paper.href ? (
                  <Link href={`/${locale}${paper.href}`}>{title}</Link>
                ) : (
                  title
                )}
                <div style={{ ...metaStyle, marginTop: 6 }}>{paper.venue}</div>
                {paper.result ? (
                  <p style={{ ...bodyStyle, fontSize: 13.5, marginTop: 8 }}>{paper.result}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Education + Stack + Languages, full-width beneath the columns */}
      <div
        style={{
          marginTop: 72,
          paddingTop: 48,
          borderTop: RULE,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          gap: "48px 72px",
          alignItems: "start",
        }}
      >
        <div>
          <h3 style={colHeadingStyle}>{resumeSections.education}</h3>
          {education.map((edu, i) => (
            <div key={i} style={{ marginBottom: i === education.length - 1 ? 0 : 28 }}>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 21,
                  lineHeight: 1.15,
                  letterSpacing: "-0.01em",
                }}
              >
                {edu.degree}
              </div>
              <div style={{ ...metaStyle, marginTop: 6 }}>
                {[edu.institution, edu.grade].filter(Boolean).join(" · ")} · {edu.period}
              </div>
              {[].concat(edu.note || []).map((n, j) => (
                <div key={j} style={{ ...bodyStyle, fontSize: 13.5, marginTop: j === 0 ? 8 : 2 }}>{n}</div>
              ))}
            </div>
          ))}
        </div>

        <div>
          <h3 style={colHeadingStyle}>{resumeSections.stack}</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {stack.map((s) => (
              <span
                key={s}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                  padding: "5px 10px",
                  border: RULE,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#D6D2C4",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 style={colHeadingStyle}>{resumeSections.languages}</h3>
          {languages ? <p style={{ ...bodyStyle, marginBottom: 12 }}>{languages}</p> : null}
          {softSkills ? <p style={bodyStyle}>{softSkills}</p> : null}
        </div>
      </div>
    </section>
  );
}
