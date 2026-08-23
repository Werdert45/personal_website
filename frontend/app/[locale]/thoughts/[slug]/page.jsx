import { notFound } from "next/navigation";
import { BlogPost } from "@/components/blog-post";
import { BlogPostingJsonLd, BreadcrumbListJsonLd, toIsoDate } from "@/components/json-ld";

export const revalidate = 300;

async function fetchBlogPost(slug) {
  try {
    const djangoUrl = process.env.DJANGO_API_URL || "http://backend:8001";
    const res = await fetch(`${djangoUrl}/api/blog/${slug}/`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug, locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.nl";
  const post = await fetchBlogPost(slug);

  let title;
  let description;
  let image;
  let publishedAt;
  let updatedAt;

  if (post) {
    const translation = (post.translations || []).find((t) => t.language === locale);
    title = translation?.title || post.title;
    description = translation?.excerpt || post.excerpt || `Blog post: ${title}`;
    image = post.cover_image;
    publishedAt = post.published_at || post.date;
    updatedAt = post.updated_at;
  } else {
    return {
      title: "Post not found",
      robots: { index: false, follow: false },
    };
  }

  const url = `${siteUrl}/${locale}/thoughts/${slug}`;
  const publishedTime = toIsoDate(publishedAt);
  const modifiedTime = toIsoDate(updatedAt);

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/en/thoughts/${slug}`,
        nl: `${siteUrl}/nl/thoughts/${slug}`,
        de: `${siteUrl}/de/thoughts/${slug}`,
        it: `${siteUrl}/it/thoughts/${slug}`,
        "x-default": `${siteUrl}/en/thoughts/${slug}`,
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
  };
}

export default async function BlogPostPage({ params }) {
  const { slug, locale } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.nl";
  const translation = (post.translations || []).find((t) => t.language === locale);
  const availableLocales = [
    "en",
    ...(post.translations || [])
      .map((t) => t.language)
      .filter((l) => l !== "en"),
  ];
  const title = translation?.title || post.title;
  const jsonLdProps = {
    slug,
    locale,
    title,
    description: translation?.excerpt || post.excerpt,
    datePublished: post.published_at || post.date,
    dateModified: post.updated_at,
    image: post.cover_image,
    availableLocales,
    inLanguage: locale === "en" || translation ? locale : "en",
  };

  return (
    <main>
      <BlogPostingJsonLd {...jsonLdProps} />
      <BreadcrumbListJsonLd
        items={[
          { name: "Home", url: `${siteUrl}/${locale}` },
          { name: "Blogs", url: `${siteUrl}/${locale}/thoughts` },
          { name: title, url: `${siteUrl}/${locale}/thoughts/${slug}` },
        ]}
      />
      <BlogPost slug={slug} initialPost={post} />
    </main>
  );
}
