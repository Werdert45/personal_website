import Link from "next/link";
import { getTranslations } from "next-intl/server";

function getTranslated(item, field, locale) {
  if (locale === "en") return item[field];
  const trans = item.translations?.find((t) => t.language === locale);
  return trans?.[field] || item[field];
}

function renderTitle(title) {
  if (!title) return null;
  const parts = title.split(" ");
  if (parts.length === 1) return <i>{title}</i>;
  const last = parts.pop();
  return (
    <>
      {parts.join(" ")} <i>{last}</i>
    </>
  );
}

async function fetchArticles() {
  const djangoUrl = process.env.DJANGO_API_URL || "http://backend:8001";
  try {
    const res = await fetch(`${djangoUrl}/api/research/?status=published&page_size=4`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const results = data.results || data;
    return Array.isArray(results) ? results.slice(0, 4) : null;
  } catch {
    return null;
  }
}

export async function ResearchPreview({ locale = "en" }) {
  const t = await getTranslations({ locale, namespace: "Research" });
  const articles = await fetchArticles();

  return (
    <section className="section-pad">
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 07</span>
        <span>{t("previewBadge")}</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 40, gap: 64, flexWrap: "wrap" }}>
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(48px, 7vw, 104px)",
            lineHeight: 0.95,
            letterSpacing: "-0.02em",
          }}
        >
          {t("previewTitlePrefix")} <i style={{ fontStyle: "italic" }}>{t("previewTitleItalic")}</i>.
        </h2>
        <p style={{ fontSize: 15, color: "var(--mute)", maxWidth: "34ch", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {t("previewSubtitleShort")}{" "}
          <Link href={`/${locale}/research`} style={{ borderBottom: "1px solid" }}>
            {t("viewAll")} →
          </Link>
        </p>
      </div>

      {!articles || articles.length === 0 ? (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--mute)" }}>
          {t("loadingFallback")}
        </p>
      ) : (
        <div className="research-list">
          {articles.map((item, i) => (
            <Link key={item.id || item.slug} href={`/${locale}/research/${item.slug}`} style={{ display: "block" }}>
              <div className="research-item">
                <div className="ri">{String(i + 1).padStart(2, "0")}</div>
                <div className="ry">{item.date || ""}</div>
                <div className="rt">
                  {renderTitle(getTranslated(item, "title", locale))}
                  <span className="rm">{getTranslated(item, "abstract", locale)}</span>
                </div>
                <div className="rtag">{(item.category || "RESEARCH").toUpperCase()}</div>
                <div className="rarr">→</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
