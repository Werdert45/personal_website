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
        className="post-end-cta"
        aria-label={t("endCtaKicker")}
        style={{
          marginTop: 56,
          padding: "36px 32px",
          background: "var(--ink)",
          color: "var(--paper)",
          display: "grid",
          gridTemplateColumns: "1fr auto",
          alignItems: "end",
          gap: 32,
          position: "relative",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--yellow)",
              marginBottom: 12,
            }}
          >
            {t("endCtaKicker")}
          </div>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(26px, 3.4vw, 40px)",
              lineHeight: 1.08,
              letterSpacing: "-0.01em",
              color: "var(--paper)",
              marginBottom: 12,
            }}
          >
            {t("endCtaTitle")} <i style={{ fontStyle: "italic", color: "var(--yellow)" }}>{t("endCtaTitleItalic")}</i>
          </h3>
          <p style={{ fontSize: 15, lineHeight: 1.55, color: "#C9C7BE", maxWidth: "60ch" }}>
            {t("endCtaBody")}
          </p>
        </div>
        <Link
          href={`/${locale}/work`}
          onClick={() => trackEvent("cta_click", { cta: "work_with_me", location: "blog_post_end", source: "blog_post_end", slug })}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "18px 22px",
            background: "var(--yellow)",
            color: "var(--ink)",
            border: "1px solid var(--yellow)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {t("endCtaButton")}
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
        </Link>
      </aside>

      <div className="byline" style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--rule)" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mute)" }}>
          {t("bylinePrefix")} Ian Ronk {t("bylineSuffix")}
        </p>
      </div>
    </article>
  );
}
