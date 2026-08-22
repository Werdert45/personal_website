"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";
import { ShareBar } from "@/components/share-bar";
import { trackEvent } from "@/lib/analytics";
import NewsletterSubscribe from "@/components/newsletter-subscribe";
import { getItemField } from "@/lib/i18n-item";
import { RelatedPosts } from "@/components/related-posts";
import { AuthorTrailer } from "@/components/author-trailer";
import { getMapFenceSource, parseMapFence } from "@/lib/map-fence";

// Loaded lazily so posts without a ```map fence ship no mapbox JS.
const MapFigure = dynamic(
  () => import("@/components/map-figure").then((mod) => mod.MapFigure),
  {
    ssr: false,
    loading: () => (
      <div style={{ border: "1px solid var(--rule, #d4d4d4)", borderRadius: 8, padding: "28px 24px", margin: "24px 0" }}>
        <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--mute)" }}>Loading map…</p>
      </div>
    ),
  }
);

export function BlogPost({ slug, initialPost = null }) {
  const [post, setPost] = useState(initialPost);
  const [status, setStatus] = useState(initialPost ? "ok" : "loading");
  const locale = useLocale();
  const t = useTranslations("Thoughts");

  useEffect(() => {
    if (initialPost) return undefined;
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
  }, [slug, initialPost]);

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

  const title = getItemField(post, "title", locale) || post.title;
  const excerpt = getItemField(post, "excerpt", locale) || post.excerpt;
  const content = getItemField(post, "content", locale) || post.content || "";
  // Prefer published_at (the backdatable display date). Only slice ISO
  // strings — free-text dates like "July 2026" render verbatim.
  const rawDate = post.published_at || post.date || "";
  const published = /^\d{4}-\d{2}/.test(rawDate) ? rawDate.slice(0, 10) : rawDate;

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
        {post.read_time && <span>{post.read_time}</span>}
      </div>

      <h1>{title}</h1>
      {excerpt && <p className="dek">{excerpt}</p>}

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre: ({ node, ...props }) => {
            const fence = getMapFenceSource(node);
            if (fence !== null) {
              const { config, error } = parseMapFence(fence);
              return <MapFigure {...(config || {})} configError={error} />;
            }
            return (
              <pre style={{ borderRadius: 8, padding: "16px 20px", overflowX: "auto", fontSize: 14, lineHeight: 1.6, margin: "24px 0", background: "#282c34" }} {...props} />
            );
          },
          code: ({ node, className, children, ...props }) => {
            // react-markdown v9+ dropped the `inline` prop: detect block code
            // by a language- class or embedded newlines instead.
            const isBlock = /language-/.test(className || "") || /\n/.test(String(children));
            return isBlock
              ? <code className={className} style={{ fontFamily: "var(--font-mono)" }} {...props}>{children}</code>
              : <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.9em", background: "var(--rule)", padding: "1px 5px", borderRadius: 4 }} {...props}>{children}</code>;
          },
          h2: ({ node, ...props }) => <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px,3vw,36px)", lineHeight: 1.15, margin: "40px 0 16px" }} {...props} />,
          h3: ({ node, ...props }) => <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(20px,2.2vw,26px)", lineHeight: 1.2, margin: "32px 0 12px" }} {...props} />,
          ul: ({ node, ...props }) => <ul style={{ margin: "16px 0", paddingLeft: 28, listStyle: "disc", display: "grid", gap: 8 }} {...props} />,
          ol: ({ node, ...props }) => <ol style={{ margin: "16px 0", paddingLeft: 28, listStyle: "decimal", display: "grid", gap: 8 }} {...props} />,
          table: ({ node, ...props }) => (
            <div style={{ overflowX: "auto", margin: "24px 0" }}>
              <table style={{ borderCollapse: "collapse", fontSize: 14, minWidth: "100%" }} {...props} />
            </div>
          ),
          th: ({ node, ...props }) => <th style={{ border: "1px solid var(--rule)", padding: "8px 14px", textAlign: "left", fontFamily: "var(--font-mono)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }} {...props} />,
          td: ({ node, ...props }) => <td style={{ border: "1px solid var(--rule)", padding: "8px 14px" }} {...props} />,
          blockquote: ({ node, ...props }) => <blockquote style={{ borderLeft: "3px solid var(--yellow-2)", margin: "24px 0", padding: "4px 0 4px 20px", color: "var(--ink-2)", fontStyle: "italic" }} {...props} />,
          img: ({ node, ...props }) => <img style={{ maxWidth: "100%", borderRadius: 8, margin: "24px 0" }} alt="" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>

      <RelatedPosts slug={slug} category={post.category} tags={post.tags || []} />
      <AuthorTrailer location="post_author" />

      <div className="newsletter-inline">
        <NewsletterSubscribe variant="inline" source="post-end" locale={locale} />
      </div>

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
          <Link
            href={`/${locale}/contact`}
            onClick={() => trackEvent("cta_click", { cta: "contact_from_post", location: "blog_post_end", source: "blog_post_end", slug })}
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
            {t("endCtaContact")} →
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
