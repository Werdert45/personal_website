"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import NewsletterSubscribe from "@/components/newsletter-subscribe";
import { getItemField } from "@/lib/i18n-item";
import { renderTitle } from "@/lib/render-title";

// No fabricated fallback posts: until the CMS has published content, the
// index shows an honest empty state instead of an invented back catalogue.
const DEFAULT_POSTS = [];

export function BlogList({ initialPosts = [] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(!initialPosts.length);
  const locale = useLocale();
  const t = useTranslations("Thoughts");

  useEffect(() => {
    if (initialPosts.length) return undefined;
    let alive = true;
    fetch("/api/django?endpoint=blog")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive || !data) return;
        const results = data.results || data;
        if (Array.isArray(results) && results.length) setPosts(results);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const source = posts.length ? posts : DEFAULT_POSTS;
  const [featured, ...rest] = source;

  return (
    <section className="section-pad" style={{ paddingTop: 160 }}>
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 03</span>
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

      {loading && !posts.length && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--mute)", padding: "40px 0" }}>
          {t("loading")}
        </p>
      )}

      {!loading && !source.length && (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--mute)", padding: "40px 0" }}>
          {t("empty")}
        </p>
      )}

      {featured && (
        <Link href={`/${locale}/thoughts/${featured.slug}`} style={{ display: "block" }}>
          <div className="blog-feat">
            <div className="cover">
              <span className="kicker">{t("featuredKicker")} {getItemField(featured, "category", locale, "THOUGHT").toUpperCase()}</span>
            </div>
            <div className="body">
              <div className="tag">
                <span>{getItemField(featured, "category", locale, "THOUGHT").toUpperCase()}</span>
                <span>{(featured.published_at || featured.date || "").slice(0, 7)}</span>
              </div>
              <h3>{renderTitle(getItemField(featured, "title", locale, ""))}</h3>
              <p>{getItemField(featured, "excerpt", locale, "")}</p>
              <span className="cta">{t("readPiece")}</span>
            </div>
          </div>
        </Link>
      )}

      <div className="blog-list">
        {rest.map((post, i) => (
          <Link key={post.slug} href={`/${locale}/thoughts/${post.slug}`} style={{ display: "block" }}>
            <div className="blog-row">
              <div className="bi">{String(i + 2).padStart(2, "0")}</div>
              <div className="by">{(post.published_at || post.date || "").slice(0, 7)}</div>
              <div className="bt">
                {renderTitle(getItemField(post, "title", locale, ""))}
                <span className="bm">{getItemField(post, "excerpt", locale, "")}</span>
              </div>
              <div className="bg">{getItemField(post, "category", locale, "THOUGHT").toUpperCase()}</div>
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
