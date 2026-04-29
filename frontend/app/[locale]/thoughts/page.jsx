import { BlogList } from "@/components/blog-list";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.com";
  const url = `${siteUrl}/${locale}/thoughts`;
  return {
    title: "Thoughts — essays on data engineering & geospatial",
    description:
      "Essays, tutorials and field notes on data engineering, geospatial methods and real-estate analytics by Ian Ronk.",
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/en/thoughts`,
        nl: `${siteUrl}/nl/thoughts`,
        it: `${siteUrl}/it/thoughts`,
        de: `${siteUrl}/de/thoughts`,
        "x-default": `${siteUrl}/en/thoughts`,
      },
    },
    openGraph: {
      title: "Thoughts | Ian Ronk",
      description:
        "Essays, tutorials and field notes on data engineering, geospatial methods and real-estate analytics.",
      url,
      type: "website",
    },
  };
}

export default function BlogPage() {
  return (
    <main>
      <BlogList />
    </main>
  );
}
