import Link from "next/link";
import { getTranslations } from "next-intl/server";

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

async function fetchPosts() {
  const djangoUrl = process.env.DJANGO_API_URL || "http://backend:8001";
  try {
    const res = await fetch(`${djangoUrl}/api/blog/?status=published&page_size=3`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const results = data.results || data;
    return Array.isArray(results) ? results.slice(0, 3) : null;
  } catch {
    return null;
  }
}

export async function WritingTeaser({ locale = "en" }) {
  const t = await getTranslations({ locale, namespace: "Thoughts" });
  const posts = await fetchPosts();

  return (
    <section className="section-pad">
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 06</span>
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

      {!posts || posts.length === 0 ? (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--mute)" }}>
          {t("loadingFallback")}
        </p>
      ) : (
        <div className="writing-teaser">
          {posts.map((p) => {
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
      )}
    </section>
  );
}
