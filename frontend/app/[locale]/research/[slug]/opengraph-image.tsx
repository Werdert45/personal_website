import { renderPostOg } from "@/lib/og/post-template";

export const runtime = "edge";
export const alt = "Research on ianronk.com";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const djangoUrl = process.env.DJANGO_API_URL ?? "http://localhost:8000";

  try {
    const res = await fetch(`${djangoUrl}/api/research/${slug}/`, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error("not ok");
    const article = await res.json();

    const t = article.translations?.find((x: any) => x.language === locale);
    const title = t?.title ?? article.title;
    const date = article.date ?? "";

    return renderPostOg({ title, category: "Research", date });
  } catch {
    return renderPostOg({ title: "New research on ianronk.com", category: "Research" });
  }
}
