"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";

function getField(post, field, locale) {
  if (locale === "en") return post[field];
  const trans = post.translations?.find((t) => t.language === locale);
  return trans?.[field] || post[field];
}

export function BlogPost({ slug }) {
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading");
  const locale = useLocale();

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
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--mute)" }}>Loading…</p>
      </section>
    );
  }

  if (status === "missing" || !post) {
    return (
      <section className="section-pad reader" style={{ paddingTop: 160 }}>
        <div className="section-label">
          <span className="bar" />
          <span className="num-label">§ 03</span>
          <Link href={`/${locale}/thoughts`}>← Back to thoughts</Link>
        </div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(40px,5vw,68px)", lineHeight: 1 }}>
          Post not <i style={{ fontStyle: "italic" }}>found</i>.
        </h1>
        <p style={{ marginTop: 24, color: "var(--mute)" }}>
          The post at <code>/{locale}/thoughts/{slug}</code> hasn&apos;t been published yet.
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
        <Link href={`/${locale}/thoughts`}>← Back to thoughts</Link>
      </div>

      <div className="meta" style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 24 }}>
        <span>{(post.category || "ARTICLE").toUpperCase()}</span>
        <span>{published}</span>
        {post.reading_time && <span>{post.reading_time} min read</span>}
      </div>

      <h1>{title}</h1>
      {excerpt && <p className="dek">{excerpt}</p>}

      <div
        dangerouslySetInnerHTML={{
          __html: content
            .split("\n\n")
            .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
            .join(""),
        }}
      />

      <div className="byline" style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid var(--rule)" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--mute)" }}>
          Written by Ian Ronk · Amsterdam
        </p>
      </div>
    </article>
  );
}
