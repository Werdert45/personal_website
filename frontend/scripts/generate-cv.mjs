// Generates frontend/public/ian-ronk-cv.pdf from frontend/data/resume.js.
// Wired as the npm "prebuild" script so every build regenerates the PDF.
//
// Layout: single-column hybrid A4 one-pager (ATS-friendly reading order:
// Summary -> Tools -> Experience -> Research -> Education -> Languages &
// Soft Skills), Y4 styling: deep gold #8A6D00 for the role line and section
// headings, one #FFD60A left-border bar on the summary, black body on white,
// Helvetica throughout. Pixel reference: brainstorm v6 render (2026-08-11).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { Document, Page, Text, View, Link, renderToBuffer } from "@react-pdf/renderer";
import { resume, resumeSections } from "../data/resume.js";

const h = React.createElement;
const OUT_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/ian-ronk-cv.pdf");

// ---------- Shape validation ----------

function validateResume(r) {
  const missing = [];
  const need = (cond, label) => { if (!cond) missing.push(label); };

  need(r && typeof r === "object", "resume");
  const hd = r?.header || {};
  for (const k of ["name", "roleLine", "location", "email", "languages", "softSkills", "summary"]) {
    need(typeof hd[k] === "string" && hd[k].trim(), `header.${k}`);
  }
  need(Array.isArray(hd.links) && hd.links.length > 0, "header.links (non-empty array)");
  (hd.links || []).forEach((l, i) => {
    need(l && l.label && l.url, `header.links[${i}].label/url`);
  });

  need(Array.isArray(r?.engineering) && r.engineering.length > 0, "engineering (non-empty array)");
  (r?.engineering || []).forEach((j, i) => {
    for (const k of ["role", "org", "period"]) need(typeof j?.[k] === "string" && j[k].trim(), `engineering[${i}].${k}`);
    need(Array.isArray(j?.bullets) && j.bullets.length > 0, `engineering[${i}].bullets (non-empty array)`);
  });

  need(Array.isArray(r?.research) && r.research.length > 0, "research (non-empty array)");
  (r?.research || []).forEach((p, i) => {
    for (const k of ["title", "venue"]) need(typeof p?.[k] === "string" && p[k].trim(), `research[${i}].${k}`);
  });

  need(Array.isArray(r?.education) && r.education.length > 0, "education (non-empty array)");
  (r?.education || []).forEach((e, i) => {
    for (const k of ["degree", "institution", "period"]) need(typeof e?.[k] === "string" && e[k].trim(), `education[${i}].${k}`);
  });

  need(Array.isArray(r?.stack) && r.stack.length > 0, "stack (non-empty array)");

  need(Array.isArray(r?.projects) && r.projects.length > 0, "projects (non-empty array)");
  (r?.projects || []).forEach((p, i) => {
    for (const k of ["name", "line", "stack"]) need(typeof p?.[k] === "string" && p[k].trim(), `projects[${i}].${k}`);
  });

  if (missing.length) {
    console.error("generate-cv: resume.js failed shape validation. Missing/invalid fields:");
    for (const m of missing) console.error(`  - ${m}`);
    process.exit(1);
  }
}

// ---------- Styles (pt; mockup px * 595/794 = 0.75) ----------

const GOLD = "#8A6D00";
const YELLOW = "#FFD60A";

const st = {
  page: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 42,
    fontFamily: "Helvetica",
    fontSize: 9.1,
    lineHeight: 1.38,
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
    marginTop: 8,
    marginBottom: 9,
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
    marginBottom: 5,
    lineHeight: 1.3,
  },
  toolsLine: { marginBottom: 9, color: "#222222" },
  job: { marginBottom: 5.5 },
  jobRow: { flexDirection: "row", justifyContent: "space-between" },
  jobTitle: { fontFamily: "Helvetica-Bold" },
  jobPeriod: { color: "#666666", fontSize: 8.6 },
  bulletRow: { flexDirection: "row", marginTop: 1, paddingLeft: 6, color: "#222222" },
  bulletDot: { width: 8 },
  bulletText: { flex: 1 },
  eduRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
  eduNote: { marginLeft: 12, marginTop: 1, color: "#444444" },
  grey: { color: "#666666" },
  bold: { fontFamily: "Helvetica-Bold" },
};

// ---------- Building blocks ----------

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

function jobTitleLine(job) {
  return [job.role, job.org, job.orgNote].filter(Boolean).join(", ");
}

// Matches the v6 mockup: ", venue. Result" normally; " (venue): Result" when
// the venue string is already parenthesized (the MSc thesis entry).
function researchLine(p) {
  const parenthesized = p.venue.startsWith("(");
  const venuePart = parenthesized ? ` ${p.venue}` : `, ${p.venue}`;
  const sep = p.result ? (parenthesized ? ": " : ". ") : ".";
  return h(
    Text,
    null,
    h(Text, { style: st.bold }, p.title),
    `${venuePart}${sep}${p.result || ""}`
  );
}

// ---------- Document ----------

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
          // Short labels fit on one line; each stays clickable.
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

      // Summary with yellow bar
      h(View, { style: st.summary }, h(Text, null, hd.summary)),

      // Tools
      SectionLabel("Tools"),
      h(Text, { style: st.toolsLine }, r.stack.join(" · ")),

      // Experience
      SectionLabel(resumeSections.engineering, { marginBottom: 6 }),
      ...r.engineering.map((job, i) =>
        h(
          View,
          { key: `job-${i}`, style: i === r.engineering.length - 1 ? [st.job, { marginBottom: 9 }] : st.job },
          h(
            View,
            { style: st.jobRow },
            h(Text, { style: st.jobTitle }, jobTitleLine(job)),
            h(Text, { style: st.jobPeriod }, job.period)
          ),
          ...job.bullets.map((b, j) => h(View, { key: j }, Bullet(b)))
        )
      ),

      // Research
      SectionLabel(resumeSections.research, { marginBottom: 6 }),
      h(
        View,
        { style: { marginBottom: 9 } },
        ...r.research.map((p, i) => h(View, { key: i, style: { marginBottom: 2.5 } }, Bullet(researchLine(p))))
      ),

      // Education
      SectionLabel("Education", { marginBottom: 6 }),
      ...r.education.map((e, i) =>
        h(
          View,
          { key: `edu-${i}`, style: i === r.education.length - 1 ? { marginBottom: 9 } : { marginBottom: 4 } },
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

      // Languages & Soft Skills
      SectionLabel("Languages & Soft Skills"),
      h(Text, { style: { color: "#222222", marginBottom: 2 } }, hd.languages),
      h(Text, { style: { color: "#222222" } }, hd.softSkills)
    ),

    // Page 2: Projects (condensed from the site's Projects cards)
    h(
      Page,
      { size: "A4", style: st.page },
      h(
        View,
        { style: [st.headerRow, { marginBottom: 8 }] },
        h(Text, { style: [st.name, { fontSize: 13 }] }, hd.name),
        h(Text, { style: st.contact }, `${hd.location} · ${hd.email}`)
      ),
      SectionLabel("Projects", { marginBottom: 6 }),
      ...r.projects.map((p, i) =>
        h(
          View,
          { key: `proj-${i}`, style: { marginBottom: 8 } },
          h(Text, { style: st.jobTitle }, p.name),
          h(Text, { style: { color: "#222222", marginTop: 1 } }, p.line),
          h(Text, { style: [st.grey, { fontSize: 8.4, marginTop: 1.5 }] }, p.stack)
        )
      )
    )
  );
}

// ---------- Render + one-page assertion ----------

function countPages(buffer) {
  // PDF object dictionaries are uncompressed; count page objects directly.
  const matches = buffer.toString("latin1").match(/\/Type\s*\/Page(?![a-zA-Z])/g);
  return matches ? matches.length : 0;
}

async function main() {
  validateResume(resume);

  const buffer = await renderToBuffer(CvDocument(resume));
  const pages = countPages(buffer);

  if (process.env.CV_DEBUG_OUT) {
    fs.writeFileSync(process.env.CV_DEBUG_OUT, buffer);
    console.log(`generate-cv: debug copy written to ${process.env.CV_DEBUG_OUT} (${pages} page(s))`);
  }

  if (pages !== 2) {
    console.error(
      `generate-cv: rendered CV is ${pages} page(s), but the budget is exactly 2 (resume + projects). ` +
        "Trim content in frontend/data/resume.js (or adjust styles in frontend/scripts/generate-cv.mjs)."
    );
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, buffer);
  console.log(`generate-cv: wrote ${path.relative(process.cwd(), OUT_PATH)} (${pages} pages, ${(buffer.length / 1024).toFixed(1)} kB)`);
}

main().catch((err) => {
  console.error("generate-cv: failed to render CV PDF.");
  console.error(err);
  process.exit(1);
});
