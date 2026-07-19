import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getItemField } from "@/lib/i18n-item";

async function fetchPublications() {
  const djangoUrl = process.env.DJANGO_API_URL || "http://backend:8001";
  try {
    const res = await fetch(`${djangoUrl}/api/research/?status=published`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const results = data.results || data;
    return Array.isArray(results) ? results.slice(0, 6) : [];
  } catch {
    return [];
  }
}

export async function PublicationsList({ locale }) {
  const t = await getTranslations({ locale, namespace: "About" });
  const pubs = await fetchPublications();
  if (!pubs.length) return null;

  return (
    <section className="section-pad">
      <p className="section-label">{t("publicationsKicker")}</p>
      <ul className="mt-6 divide-y">
        {pubs.map((p) => (
          <li key={p.slug} className="py-3">
            <Link href={`/${locale}/research/${p.slug}`} className="hover:underline">
              {getItemField(p, "title", locale)}
            </Link>
            <span className="text-sm opacity-60">
              {" "}· {p.category} · {(p.published_at || p.date || "").slice(0, 4)}
            </span>
          </li>
        ))}
      </ul>
      <Link href={`/${locale}/research`} className="btn ghost mt-4">
        {t("publicationsViewAll")}
      </Link>
    </section>
  );
}
