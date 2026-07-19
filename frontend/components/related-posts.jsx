"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { getItemField } from "@/lib/i18n-item";
import { trackEvent } from "@/lib/analytics";

export function RelatedPosts({ slug, category, tags = [] }) {
  const locale = useLocale();
  const t = useTranslations("Thoughts");
  const [related, setRelated] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/django?endpoint=blog`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const results = data.results || data;
        if (!Array.isArray(results)) return;
        const picks = results
          .filter((p) => p.slug && p.slug !== slug)
          .map((p) => {
            let score = 0;
            if (category && p.category === category) score += 2;
            if (Array.isArray(p.tags) && tags.length) {
              score += p.tags.filter((x) => tags.includes(x)).length;
            }
            return { p, score };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((s) => s.p);
        setRelated(picks);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug, category, tags]);

  if (!related.length) return null;

  return (
    <section className="mt-12">
      <p className="section-label">{t("relatedKicker")}</p>
      <div className="grid gap-4 md:grid-cols-3 mt-4">
        {related.map((p) => (
          <Link
            key={p.slug}
            href={`/${locale}/thoughts/${p.slug}`}
            className="block border-t pt-3 hover:underline"
            onClick={() =>
              trackEvent("cta_click", {
                cta: "related_post",
                location: "post_related",
                source: p.slug,
              })
            }
          >
            <span className="chip">
              {(getItemField(p, "category", locale) || p.category || "ARTICLE").toUpperCase()}
            </span>
            <h4 className="mt-2 font-medium">{getItemField(p, "title", locale)}</h4>
          </Link>
        ))}
      </div>
    </section>
  );
}
