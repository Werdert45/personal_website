export function PersonJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Ian Ronk",
    jobTitle: "Head of Data",
    url: siteUrl,
    sameAs: ["https://www.linkedin.com/in/ian-ronk-7b054a120"],
    worksFor: {
      "@type": "Organization",
      name: "KR&A",
    },
    knowsAbout: [
      "Data Science",
      "Machine Learning",
      "Real Estate Analytics",
      "Geospatial Analysis",
      "Alternative Data",
      "Data Engineering",
    ],
    alumniOf: [
      {
        "@type": "CollegeOrUniversity",
        name: "Bocconi University",
      },
      {
        "@type": "CollegeOrUniversity",
        name: "University of Amsterdam",
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Amsterdam",
      addressCountry: "NL",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebSiteJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Ian Ronk",
    url: siteUrl,
    description:
      "Head of Data delivering AI-powered insights for European real estate investment.",
    author: {
      "@type": "Person",
      name: "Ian Ronk",
    },
    inLanguage: ["en", "nl", "it"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ArticleJsonLd({ title, description, slug, datePublished, dateModified, image }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    url: `${siteUrl}/en/research/${slug}`,
    author: {
      "@type": "Person",
      name: "Ian Ronk",
      url: siteUrl,
    },
    publisher: {
      "@type": "Person",
      name: "Ian Ronk",
    },
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    ...(image && {
      image: {
        "@type": "ImageObject",
        url: image,
      },
    }),
    inLanguage: "en",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/en/research/${slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
