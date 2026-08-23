import Link from "next/link";
import { getTranslations } from "next-intl/server";
import NewsletterSubscribe from "@/components/newsletter-subscribe";
import { getItemField } from "@/lib/i18n-item";
import { renderTitle } from "@/lib/render-title";

async function fetchPapers() {
  const djangoUrl = process.env.DJANGO_API_URL || "http://backend:8001";
  try {
    const res = await fetch(`${djangoUrl}/api/research/?status=published`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results = data.results || data;
    if (!Array.isArray(results)) return [];
    // Dates are mixed-precision strings ("2026-08", "2022"); string sort is enough.
    return results
      .filter((item) => (item.category || "").toLowerCase() !== "project")
      .sort((a, b) => String(b.published_at || b.date || "").localeCompare(String(a.published_at || a.date || "")))
      .slice(0, 6);
  } catch {
    return [];
  }
}

export async function PapersSection({ locale = "en" }) {
  const t = await getTranslations({ locale, namespace: "Papers" });
  const nl = await getTranslations({ locale, namespace: "Newsletter" });
  const papers = await fetchPapers();

  return (
    <section className="section-pad">
      <div className="section-label">
        <span className="bar" />
        <span className="num-label">§ 05</span>
        <span>{t("kicker")}</span>
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
          {t("titlePrefix")} <i style={{ fontStyle: "italic" }}>{t("titleItalic")}</i>.
        </h2>
        <p style={{ fontSize: 15, color: "var(--mute)", maxWidth: "34ch", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {t("subtitle")}{" "}
          <Link href={`/${locale}/projects`} style={{ borderBottom: "1px solid" }}>
            {t("viewAll")}
          </Link>
        </p>
      </div>

      {papers.length === 0 ? (
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--mute)" }}>
          {t("empty")}
        </p>
      ) : (
        <div className="blog-list">
          {papers.map((p, i) => (
            <Link href={`/${locale}/research/${p.slug}`} key={p.slug} style={{ display: "block" }}>
              <div className="blog-row">
                <div className="bi">{String(i + 1).padStart(2, "0")}</div>
                <div className="by">{(p.published_at || p.date || "").slice(0, 7)}</div>
                <div className="bt">
                  {renderTitle(getItemField(p, "title", locale) || p.title, p.italic)}
                  <span className="bm">{getItemField(p, "excerpt", locale, "") || getItemField(p, "abstract", locale, "")}</span>
                </div>
                <div className="bg">{(p.category || "PAPER").toUpperCase()}</div>
                <div className="barr">→</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div style={{ marginTop: 56 }}>
        <NewsletterSubscribe
          variant="inline"
          source="home-papers"
          locale={locale}
          heading={nl("homeThoughtsHeading")}
          description={nl("homeThoughtsDescription")}
        />
      </div>
    </section>
  );
}
