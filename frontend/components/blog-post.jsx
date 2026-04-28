"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ShareBar } from "@/components/share-bar";
import { trackEvent } from "@/lib/analytics";

function getField(post, field, locale) {
  if (locale === "en") return post[field];
  const trans = post.translations?.find((t) => t.language === locale);
  return trans?.[field] || post[field];
}

export function BlogPost({ slug }) {
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading");
  const locale = useLocale();
  const t = useTranslations("Thoughts");

  useEffect(() => {
    let alive = true;
    fetch(`/api/django?endpoint=blog/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!alive) return;
        if (data && (data.slug || data.title)) {
          setPost(data);
          setStatus("ok");
        } else {
          setStatus("missing");
        }
      })
      .catch(() => alive && setStatus("missing"));
    return () => { alive = false; };
  }, [slug]);

  if (status === "loading") {
    return (
      <section className="section-pad" style={{ paddingTop: 160 }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--mute)" }}>{t("loading")}</p>
      </section>
    );
  }

  if (status === "missing" || !post) {
    return (
      <section className="section-pad reader" style={{ paddingTop: 160 }}>
        <div className="section-label">
          <span className="bar" />
          <span className="num-label">§ 03</span>
          <Link href={`/${locale}/thoughts`}>{t("backToList")}</Link>
        </div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(40px,5vw,68px)", lineHeight: 1 }}>
          {t("notFoundTitle")} <i style={{ fontStyle: "italic" }}>{t("notFoundItalic")}</i>.
        </h1>
        <p style={{ marginTop: 24, color: "var(--mute)" }}>
          {t("notFoundBodyPrefix")} <code>/{locale}/thoughts/{slug}</code> {t("notFoundBody")}
        </p>
      </section>
    );
  }

  const title = getField(post, "title", locale) || post.title;
  const excerpt = getField(post, "excerpt", locale) || post.excerpt;
  const content = getField(post, "content", locale) || post.content || "";
  const published = (post.published_at || post.date || "").slice(0, 10);

  return (
    <article className="section-pad reader" style={{ paddingTop: 160 }}>
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 03</span>
        <Link href={`/${locale}/thoughts`}>{t("backToList")}</Link>
      </div>

      <div className="meta" style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 24 }}>
        <span>{(post.category || "ARTICLE").toUpperCase()}</span>
        <span>{published}</span>
        {post.reading_time && <span>{post.reading_time} {t("minRead")}</span>}
      </div>

      <h1>{title}</h1>
      {excerpt && <p className="dek">{excerpt}</p>}

      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>

      <ShareBar slug={slug} title={title} />

      <aside
        className="post-end-cta-soft"
        aria-label={t("endCtaKicker")}
        style={{
          marginTop: 56,
          paddingTop: 32,
          borderTop: "1px solid var(--ink)",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--mute)",
          }}
        >
          {t("endCtaKicker")}
        </div>
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(24px, 2.8vw, 34px)",
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            color: "var(--ink)",
          }}
        >
          {t("endCtaTitle")} <i style={{ fontStyle: "italic", color: "var(--yellow-2)" }}>{t("endCtaTitleItalic")}</i>
        </h3>
        <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--ink-2)", maxWidth: "60ch" }}>
          {t("endCtaBody")}
        </p>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 6 }}>
          <Link
            href={`/${locale}/thoughts`}
            onClick={() => trackEvent("cta_click", { cta: "more_writing", location: "blog_post_end", source: "blog_post_end", slug })}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--ink)",
              borderBottom: "1px solid var(--ink)",
              paddingBottom: 2,
            }}
          >
            {t("endCtaButton")} →
          </Link>
          <Link
            href={`/${locale}/about`}
            onClick={() => trackEvent("cta_click", { cta: "about_me", location: "blog_post_end", source: "blog_post_end", slug })}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--ink-2)",
              borderBottom: "1px solid var(--rule)",
              paddingBottom: 2,
            }}
          >
            {t("endCtaSecondary")} →
          </Link>
        </div>
      </aside>

      <div className="byline" style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--rule)" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mute)" }}>
          {t("bylinePrefix")} Ian Ronk {t("bylineSuffix")}
        </p>
      </div>
    </article>
  );
}
