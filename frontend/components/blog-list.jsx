"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import NewsletterSubscribe from "@/components/newsletter-subscribe";
import { getItemField } from "@/lib/i18n-item";
import { renderTitle } from "@/lib/render-title";

const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

// Sort key for mixed date formats: "2026-08-23", "2026-07", "August 2026",
// "2024–2025", "2022". Returns year * 100 + month (0 when unknown).
function dateKey(raw) {
  const s = String(raw || "");
  const year = (s.match(/\d{4}/) || [0])[0];
  let month = 0;
  const iso = s.match(/^\d{4}-(\d{2})/);
  if (iso) month = parseInt(iso[1], 10);
  else {
    const name = s.toLowerCase().match(/[a-z]+/);
    if (name && MONTHS[name[0]]) month = MONTHS[name[0]];
  }
  return Number(year) * 100 + month;
}

function displayDate(raw) {
  const s = String(raw || "");
  return /^\d{4}-\d{2}/.test(s) ? s.slice(0, 7) : s;
}

export function BlogList({ initialPosts = [], initialPapers = [] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [papers, setPapers] = useState(initialPapers);
  const [loading, setLoading] = useState(!initialPosts.length);
  const locale = useLocale();
  const t = useTranslations("Thoughts");

  useEffect(() => {
    if (initialPosts.length) return undefined;
    let alive = true;
    const grab = (endpoint) =>
      fetch(`/api/django?endpoint=${endpoint}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const results = data && (data.results || data);
          return Array.isArray(results) ? results : [];
        })
        .catch(() => []);
    Promise.all([grab("blog"), grab("research")])
      .then(([blogRows, researchRows]) => {
        if (!alive) return;
        if (blogRows.length) setPosts(blogRows);
        const paperRows = researchRows.filter(
          (item) => (item.category || "").toLowerCase() !== "project"
        );
        if (paperRows.length) setPapers(paperRows);
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  // One list of entries: case studies (blog) and papers (research), newest first.
  const entries = [
    ...posts.map((post) => ({
      key: `b-${post.slug}`,
      href: `/${locale}/thoughts/${post.slug}`,
      date: post.published_at || post.date || "",
      title: getItemField(post, "title", locale, ""),
      excerpt: getItemField(post, "excerpt", locale, ""),
      tag: getItemField(post, "category", locale, "THOUGHT").toUpperCase(),
    })),
    ...papers.map((paper) => ({
      key: `p-${paper.slug}`,
      href: `/${locale}/research/${paper.slug}`,
      date: paper.date || "",
      title: getItemField(paper, "title", locale, ""),
      excerpt: getItemField(paper, "excerpt", locale, "") || getItemField(paper, "abstract", locale, ""),
      tag: (paper.category || "PAPER").toUpperCase(),
    })),
  ].sort((a, b) => dateKey(b.date) - dateKey(a.date));

  return (
    <section className="section-pad" style={{ paddingTop: 160 }}>
      <div className="section-label">
        <span className="bar" />
        <span>{t("kicker")}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 48, gap: 64, flexWrap: "wrap" }}>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(48px, 7vw, 104px)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
          }}
        >
          {t("recentTitle")} <i style={{ fontStyle: "italic" }}>{t("recentItalic")}</i>.
        </h2>
        <p style={{ fontSize: 15, color: "var(--mute)", maxWidth: "38ch", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {t("subtitle")}
        </p>
      </div>

      {loading && !entries.length && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--mute)", padding: "40px 0" }}>
          {t("loading")}
        </p>
      )}

      {!loading && !entries.length && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--mute)", padding: "40px 0" }}>
          {t("empty")}
        </p>
      )}

      <div className="blog-list">
        {entries.map((entry, i) => (
          <Link key={entry.key} href={entry.href} style={{ display: "block" }}>
            <div className="blog-row">
              <div className="bi">{String(i + 1).padStart(2, "0")}</div>
              <div className="by">{displayDate(entry.date)}</div>
              <div className="bt">
                {renderTitle(entry.title)}
                <span className="bm">{entry.excerpt}</span>
              </div>
              <div className="bg">{entry.tag}</div>
              <div className="barr">→</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 64 }}>
        <NewsletterSubscribe variant="inline" source="thoughts-index" locale={locale} />
      </div>
    </section>
  );
}
