import { notFound } from "next/navigation";
import ResearchArticleDetail from "@/components/research-article-detail";
// Imported from a plain module (not the "use client" component) so the server
// page sees the real object rather than a client-reference proxy.
import { STATIC_PAPERS } from "@/components/research-static-papers";
import {
  ArticleJsonLd,
  BreadcrumbListJsonLd,
  isScholarlyCategory,
  toIsoDate,
} from "@/components/json-ld";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { slug, locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.nl";

  // Try to fetch actual article data for rich metadata
  let title, description, image, updatedAt, category, date;
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
      category = article.category;
      date = article.date;
    }
  } catch {
    // Fallback to slug-based title
  }

  if (!title && STATIC_PAPERS[slug]) {
    title = STATIC_PAPERS[slug].title;
    description = STATIC_PAPERS[slug].abstract || STATIC_PAPERS[slug].excerpt || "";
    category = STATIC_PAPERS[slug].category;
    date = STATIC_PAPERS[slug].date;
  }

  if (!title) {
    return {
      title: "Article not found",
      robots: { index: false, follow: false },
    };
  }

  const url = `${siteUrl}/${locale}/research/${slug}`;
  const publishedTime = toIsoDate(date);
  const modifiedTime = toIsoDate(updatedAt);
  const scholarly = isScholarlyCategory(category);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/en/research/${slug}`,
        nl: `${siteUrl}/nl/research/${slug}`,
        de: `${siteUrl}/de/research/${slug}`,
        it: `${siteUrl}/it/research/${slug}`,
        "x-default": `${siteUrl}/en/research/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      ...(image && { images: [{ url: image }] }),
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && { images: [image] }),
    },
    ...(scholarly && {
      other: {
        citation_title: title,
        citation_author: "Ian Ronk",
        ...(publishedTime && {
          citation_publication_date: publishedTime.slice(0, 10).replace(/-/g, "/"),
        }),
        citation_public_url: `${siteUrl}/en/research/${slug}`,
      },
    }),
  };
}

async function fetchArticleForJsonLd(slug) {
  try {
    const djangoUrl = process.env.DJANGO_API_URL || "http://backend:8001";
    const res = await fetch(`${djangoUrl}/api/research/${slug}/`, {
      next: { revalidate: 300 },
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
  if (!article && !STATIC_PAPERS[slug]) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.nl";
  let jsonLdProps;
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
      category: article.category,
      availableLocales,
      inLanguage: locale === "en" || translation ? locale : "en",
    };
  } else {
    const paper = STATIC_PAPERS[slug];
    jsonLdProps = {
      slug,
      locale,
      title: paper.title,
      description: paper.abstract || paper.excerpt,
      datePublished: paper.date,
      category: paper.category,
      inLanguage: "en",
    };
  }

  return (
    <main>
      <ArticleJsonLd {...jsonLdProps} />
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: `${siteUrl}/${locale}` },
          { name: "Projects & Papers", url: `${siteUrl}/${locale}/projects` },
          { name: jsonLdProps.title, url: `${siteUrl}/${locale}/research/${slug}` },
        ]}
      />
      <ResearchArticleDetail slug={slug} initialArticle={article} />
    </main>
  );
}
