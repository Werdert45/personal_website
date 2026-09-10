// Generates the site's public CV (public/ian-ronk-cv.pdf) from
// frontend/data/resume-leadership.js; wired into the build via npm prebuild.
// Also writes a local copy to docs/cv/ian-ronk-cv-leadership.pdf.
//
// Layout mirrors generate-cv.mjs (same styling constants) but with a
// leadership-CV structure: Summary -> Selected Achievements -> Tools ->
// Experience (KR&A as one stacked entry with themed bullet groups, Exact as a
// single line) -> Research (compact) -> Education + Certifications ->
// Selected Project -> Languages & Soft Skills. Target: one page, hard cap two.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { Document, Page, Text, View, Link, renderToBuffer } from "@react-pdf/renderer";
import { resumeLeadership } from "../data/resume-leadership.js";

const h = React.createElement;
const OUT_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public/ian-ronk-cv.pdf"
);
const COPY_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../docs/cv/ian-ronk-cv-leadership.pdf"
);

const GOLD = "#8A6D00";
const YELLOW = "#FFD60A";

const st = {
  page: {
    paddingTop: 22,
    paddingBottom: 22,
    paddingHorizontal: 42,
    fontFamily: "Helvetica",
    fontSize: 9.0,
    lineHeight: 1.34,
    color: "#111111",
    backgroundColor: "#ffffff",
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  name: { fontFamily: "Helvetica-Bold", fontSize: 19.5, letterSpacing: -0.4, lineHeight: 1.15 },
  roleLine: { fontFamily: "Helvetica-Bold", fontSize: 10.5, color: GOLD, marginTop: 1, lineHeight: 1.2 },
  contact: { fontSize: 8.6, color: "#444444", lineHeight: 1.55, textAlign: "right", paddingTop: 3, maxWidth: 300 },
  contactLink: { color: "#444444", textDecoration: "none" },
  summary: {
    borderLeftWidth: 3,
    borderLeftColor: YELLOW,
    borderLeftStyle: "solid",
    paddingLeft: 9,
    marginTop: 7,
    marginBottom: 8,
    color: "#222222",
  },
  sectionLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.25,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: GOLD,
    borderBottomWidth: 0.75,
    borderBottomColor: "#dddddd",
    borderBottomStyle: "solid",
    paddingBottom: 1.5,
    marginBottom: 4.5,
    lineHeight: 1.3,
  },
  toolsLine: { marginBottom: 8, color: "#222222" },
  jobRow: { flexDirection: "row", justifyContent: "space-between" },
  jobTitle: { fontFamily: "Helvetica-Bold" },
  jobPeriod: { color: "#666666", fontSize: 8.6 },
  titleProgression: { fontFamily: "Helvetica-Oblique", color: "#444444", fontSize: 8.5, marginTop: 0.5 },
  themeLabel: { fontFamily: "Helvetica-Bold", fontSize: 8.7, color: "#333333", marginTop: 3.5 },
  bulletRow: { flexDirection: "row", marginTop: 1, paddingLeft: 6, color: "#222222" },
  bulletDot: { width: 8 },
  bulletText: { flex: 1 },
  eduRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
  eduNote: { marginLeft: 12, marginTop: 1, color: "#444444" },
  grey: { color: "#666666" },
  bold: { fontFamily: "Helvetica-Bold" },
};

function SectionLabel(text, extraStyle) {
  return h(Text, { style: extraStyle ? [st.sectionLabel, extraStyle] : st.sectionLabel }, text);
}

function Bullet(children) {
  return h(
    View,
    { style: st.bulletRow },
    h(Text, { style: st.bulletDot }, "•"),
    h(Text, { style: st.bulletText }, children)
  );
}

function CvDocument(r) {
  const hd = r.header;

  return h(
    Document,
    { title: `${hd.name} - CV`, author: hd.name },
    h(
      Page,
      { size: "A4", style: st.page },

      // Header
      h(
        View,
        { style: st.headerRow },
        h(
          View,
          null,
          h(Text, { style: st.name }, hd.name),
          h(Text, { style: st.roleLine }, hd.roleLine)
        ),
        h(
          View,
          { style: st.contact },
          h(Text, null, `${hd.location} · ${hd.email}`),
          h(
            Text,
            null,
            ...hd.links.flatMap((l, i) => [
              i > 0 ? " · " : null,
              h(Link, { key: `link-${i}`, src: l.url, style: st.contactLink }, l.label),
            ]).filter(Boolean)
          )
        )
      ),

      // Positioning summary with yellow bar
      h(View, { style: st.summary }, h(Text, null, hd.summary)),

      // Selected achievements
      SectionLabel("Selected Achievements"),
      h(
        View,
        { style: { marginBottom: 8 } },
        ...r.achievements.map((a, i) => h(View, { key: i }, Bullet(a)))
      ),

      // Tools
      SectionLabel("Tools"),
      h(Text, { style: st.toolsLine }, r.stack.join(" · ")),

      // Experience: KR&A stacked entry
      SectionLabel("Professional Experience", { marginBottom: 5 }),
      h(
        View,
        { style: { marginBottom: 5 } },
        h(
          View,
          { style: st.jobRow },
          h(Text, { style: st.jobTitle }, [r.kra.org, r.kra.orgNote].filter(Boolean).join(", ")),
          h(Text, { style: st.jobPeriod }, r.kra.period)
        ),
        r.kra.titleProgression ? h(Text, { style: st.titleProgression }, r.kra.titleProgression) : null,
        ...r.kra.themes.flatMap((t, i) => [
          h(Text, { key: `theme-${i}`, style: st.themeLabel }, t.theme),
          ...t.bullets.map((b, j) => h(View, { key: `t${i}b${j}` }, Bullet(b))),
        ])
      ),
      ...r.otherExperience.map((e, i) =>
        h(
          View,
          { key: `other-${i}`, style: [st.jobRow, { marginBottom: 8 }] },
          h(Text, { style: { flex: 1, paddingRight: 10 } }, e.line),
          h(Text, { style: st.jobPeriod }, e.period)
        )
      ),

      // Research: compact, no job title
      SectionLabel(`${r.research.heading} — ${r.research.titleLine}, ${r.research.period}`, { textTransform: "none", letterSpacing: 0.4 }),
      h(Text, { style: { color: "#222222", marginBottom: 8 } }, r.research.text),

      // Education + certifications
      SectionLabel("Education", { marginBottom: 5 }),
      ...r.education.map((e, i) =>
        h(
          View,
          { key: `edu-${i}`, style: { marginBottom: 3 } },
          h(
            View,
            { style: st.eduRow },
            h(
              Text,
              null,
              h(Text, { style: st.bold }, e.degree),
              `, ${e.institution}`,
              e.grade ? h(Text, { style: st.grey }, ` · ${e.grade}`) : null
            ),
            h(Text, { style: st.jobPeriod }, e.period)
          ),
          ...[].concat(e.note || []).map((n, j) => h(Text, { key: j, style: st.eduNote }, n))
        )
      ),
      r.certifications
        ? h(
            Text,
            { style: { marginBottom: 8 } },
            h(Text, { style: st.bold }, "Certifications: "),
            r.certifications
          )
        : h(View, { style: { marginBottom: 5 } }),

      // Selected project (one, no stack list)
      SectionLabel("Selected Project", { marginBottom: 5 }),
      h(
        View,
        { style: { marginBottom: 8 } },
        h(Text, { style: st.jobTitle }, r.project.name),
        h(Text, { style: { color: "#222222", marginTop: 1 } }, r.project.line)
      ),

      // Languages & Soft Skills
      SectionLabel("Languages & Soft Skills"),
      h(Text, { style: { color: "#222222", marginBottom: 2 } }, hd.languages),
      h(Text, { style: { color: "#222222" } }, hd.softSkills)
    )
  );
}

function countPages(buffer) {
  const matches = buffer.toString("latin1").match(/\/Type\s*\/Page(?![a-zA-Z])/g);
  return matches ? matches.length : 0;
}

async function main() {
  const buffer = await renderToBuffer(CvDocument(resumeLeadership));
  const pages = countPages(buffer);

  if (pages > 2) {
    console.error(
      `generate-cv-leadership: rendered ${pages} pages; the cap is 2. Trim frontend/data/resume-leadership.js.`
    );
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, buffer);
  fs.mkdirSync(path.dirname(COPY_PATH), { recursive: true });
  fs.writeFileSync(COPY_PATH, buffer);
  console.log(
    `generate-cv-leadership: wrote ${path.relative(process.cwd(), OUT_PATH)} (${pages} page(s), ${(buffer.length / 1024).toFixed(1)} kB)`
  );
  if (pages === 2) {
    console.log("generate-cv-leadership: note - content overflows one page; one page is the target.");
  }
}

main().catch((err) => {
  console.error("generate-cv-leadership: failed to render CV PDF.");
  console.error(err);
  process.exit(1);
});
