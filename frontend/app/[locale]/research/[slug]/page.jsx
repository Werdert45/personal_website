import ResearchArticleDetail from "@/components/research-article-detail";
import { ArticleJsonLd } from "@/components/json-ld";

export async function generateMetadata({ params }) {
  const { slug, locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.com";

  // Try to fetch actual article data for rich metadata
  let title, description, image, updatedAt;
  try {
    const djangoUrl = process.env.DJANGO_API_URL || "http://backend:8001";
    const res = await fetch(`${djangoUrl}/api/research/${slug}/`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const article = await res.json();

      // Use translation if available
      const translation = (article.translations || []).find(
        (t) => t.language === locale
      );
      title = translation?.title || article.title;
      description =
        translation?.abstract ||
        article.abstract ||
        `Research article on ${title}`;
      image = article.preview_image;
      updatedAt = article.updated_at;
    }
  } catch {
    // Fallback to slug-based title
  }

  if (!title) {
    title = slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    description = `Research article on ${title}`;
  }

  const url = `${siteUrl}/${locale}/research/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/en/research/${slug}`,
        nl: `${siteUrl}/nl/research/${slug}`,
        it: `${siteUrl}/it/research/${slug}`,
        de: `${siteUrl}/de/research/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      ...(image && { images: [{ url: image }] }),
      ...(updatedAt && { modifiedTime: updatedAt }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

async function fetchArticleForJsonLd(slug) {
  try {
    const djangoUrl = process.env.DJANGO_API_URL || "http://backend:8001";
    const res = await fetch(`${djangoUrl}/api/research/${slug}/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function ResearchArticlePage({ params }) {
  const { slug, locale } = await params;
  const article = await fetchArticleForJsonLd(slug);

  let jsonLdProps = { slug, locale };
  if (article) {
    const translation = (article.translations || []).find(
      (t) => t.language === locale,
    );
    const availableLocales = [
      "en",
      ...(article.translations || [])
        .map((t) => t.language)
        .filter((l) => l !== "en"),
    ];
    jsonLdProps = {
      slug,
      locale,
      title: translation?.title || article.title,
      description: translation?.abstract || article.abstract,
      datePublished: article.date,
      dateModified: article.updated_at,
      image: article.preview_image,
      availableLocales,
    };
  }

  return (
    <main>
      <ArticleJsonLd {...jsonLdProps} />
      <ResearchArticleDetail slug={slug} />
    </main>
  );
}
