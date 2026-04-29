import { BlogPost } from "@/components/blog-post";
import { BlogPostingJsonLd } from "@/components/json-ld";

async function fetchBlogPost(slug) {
  try {
    const djangoUrl = process.env.DJANGO_API_URL || "http://backend:8001";
    const res = await fetch(`${djangoUrl}/api/blog/${slug}/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug, locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.com";
  const post = await fetchBlogPost(slug);

  let title;
  let description;
  let image;
  let updatedAt;

  if (post) {
    const translation = (post.translations || []).find((t) => t.language === locale);
    title = translation?.title || post.title;
    description = translation?.excerpt || post.excerpt || `Blog post: ${title}`;
    image = post.cover_image;
    updatedAt = post.updated_at;
  } else {
    title = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    description = `Blog post: ${title}`;
  }

  const url = `${siteUrl}/${locale}/thoughts/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/en/thoughts/${slug}`,
        nl: `${siteUrl}/nl/thoughts/${slug}`,
        it: `${siteUrl}/it/thoughts/${slug}`,
        de: `${siteUrl}/de/thoughts/${slug}`,
        "x-default": `${siteUrl}/en/thoughts/${slug}`,
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

export default async function BlogPostPage({ params }) {
  const { slug, locale } = await params;
  const post = await fetchBlogPost(slug);

  let jsonLdProps = { slug, locale };
  if (post) {
    const translation = (post.translations || []).find((t) => t.language === locale);
    const availableLocales = [
      "en",
      ...(post.translations || [])
        .map((t) => t.language)
        .filter((l) => l !== "en"),
    ];
    jsonLdProps = {
      slug,
      locale,
      title: translation?.title || post.title,
      description: translation?.excerpt || post.excerpt,
      datePublished: post.published_at || post.date,
      dateModified: post.updated_at,
      image: post.cover_image,
      availableLocales,
    };
  }

  return (
    <main>
      <BlogPostingJsonLd {...jsonLdProps} />
      <BlogPost slug={slug} />
    </main>
  );
}
