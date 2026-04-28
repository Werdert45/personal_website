"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

const DEFAULT_POSTS = [
  { slug: "against-dashboards", date: "2026-04", category: "THOUGHT", title: "The case against dashboards", italic: "dashboards" },
  { slug: "h3-for-real-estate", date: "2026-03", category: "EXPLANATION", title: "Why we switched to H3 for real-estate geoindexing", italic: "H3" },
  { slug: "internal-tools-beat-dashboards", date: "2026-02", category: "UPDATE", title: "Internal tools that quietly replaced our dashboards", italic: "tools" },
];

function renderTitle(title, italicToken) {
  if (!title) return null;
  if (italicToken && title.includes(italicToken)) {
    const [before, ...rest] = title.split(italicToken);
    return (
      <>
        {before}
        <i>{italicToken}</i>
        {rest.join(italicToken)}
      </>
    );
  }
  const parts = title.split(" ");
  if (parts.length === 1) return <i>{title}</i>;
  const last = parts.pop();
  return (
    <>
      {parts.join(" ")} <i>{last}</i>
    </>
  );
}

function getField(post, field, locale) {
  if (locale === "en") return post[field];
  const trans = post.translations?.find((t) => t.language === locale);
  return trans?.[field] || post[field];
}

export function WritingTeaser() {
  const [posts, setPosts] = useState([]);
  const locale = useLocale();
  const t = useTranslations("Thoughts");

  useEffect(() => {
    let alive = true;
    fetch("/api/django?endpoint=blog")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive || !data) return;
        const results = data.results || data;
        if (Array.isArray(results) && results.length) setPosts(results.slice(0, 3));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const list = posts.length ? posts : DEFAULT_POSTS;

  return (
    <section className="section-pad">
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 08</span>
        <span>{t("writingTeaserKicker")}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 32, gap: 40, flexWrap: "wrap" }}>
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
        <p style={{ fontSize: 15, color: "var(--mute)", maxWidth: "34ch", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {t("writingTeaserSubtitle")}{" "}
          <Link href={`/${locale}/thoughts`} style={{ borderBottom: "1px solid" }}>
            {t("viewAll")}
          </Link>
        </p>
      </div>

      <div className="writing-teaser">
        {list.map((p) => {
          const title = getField(p, "title", locale) || p.title;
          const date = (p.published_at || p.date || "").slice(0, 7);
          const tag = (getField(p, "category", locale) || p.category || "ARTICLE").toUpperCase();
          return (
            <Link href={`/${locale}/thoughts/${p.slug}`} key={p.slug} className="wt-card">
              <div className="t">
                <span>{tag}</span>
                <span>{date}</span>
              </div>
              <h4>{renderTitle(title, p.italic)}</h4>
              <div className="more">{t("readShort")}</div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
