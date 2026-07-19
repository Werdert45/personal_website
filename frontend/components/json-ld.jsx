export function PersonJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Ian Ronk",
    jobTitle: "Data Lead & Engineer",
    description: "Ian Ronk is a data lead and engineer in Amsterdam who builds and runs production data systems — big data pipelines, forecasting, network analysis — with a research specialization in urban dynamics.",
    url: siteUrl,
    sameAs: ["https://www.linkedin.com/in/ian-ronk-7b054a120/", "https://github.com/Werdert45"],
    hasOccupation: [
      { "@type": "Occupation", name: "Data Lead" },
      {
        "@type": "Occupation",
        name: "Geodata Specialist",
        occupationLocation: { "@type": "City", name: "Amsterdam" },
      },
    ],
    worksFor: {
      "@type": "Organization",
      name: "KR&A",
    },
    knowsAbout: [
      "Data Engineering", "Big Data Pipelines", "Network Science",
      "Time Series Forecasting", "Nowcasting", "Spatial Analysis",
      "Geospatial Engineering", "Urban Dynamics", "Gentrification",
      "Housing Markets", "Accessibility", "PostGIS", "Machine Learning",
      "Product Ownership",
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
      "Ian Ronk is a data lead and engineer in Amsterdam who builds and runs production data systems — big data pipelines, forecasting, network analysis — with a research specialization in urban dynamics.",
    author: {
      "@type": "Person",
      name: "Ian Ronk",
    },
    inLanguage: ["en", "nl", "it", "de"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  slug,
  datePublished,
  dateModified,
  image,
  locale = "en",
  availableLocales = ["en"],
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ianronk.com";
  const url = `${siteUrl}/${locale}/research/${slug}`;

  const sameAs = availableLocales
    .filter((l) => l !== locale)
    .map((l) => `${siteUrl}/${l}/research/${slug}`);

  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    ...(image && { image }),
    ...(datePublished && { datePublished }),
    dateModified: dateModified ?? datePublished,
    author: { "@type": "Person", name: "Ian Ronk", url: siteUrl },
    publisher: { "@type": "Person", name: "Ian Ronk", url: siteUrl },
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", "@id": `${siteUrl}/${locale}` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    ...(sameAs.length > 0 && { sameAs }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BlogPostingJsonLd({
  title,
  description,
  slug,
  datePublished,
  dateModified,
  image,
  locale = "en",
  availableLocales = ["en"],
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ianronk.com";
  const url = `${siteUrl}/${locale}/thoughts/${slug}`;

  const sameAs = availableLocales
    .filter((l) => l !== locale)
    .map((l) => `${siteUrl}/${l}/thoughts/${slug}`);

  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    ...(image && { image }),
    ...(datePublished && { datePublished }),
    dateModified: dateModified ?? datePublished,
    author: { "@type": "Person", name: "Ian Ronk", url: siteUrl },
    publisher: { "@type": "Person", name: "Ian Ronk", url: siteUrl },
    inLanguage: locale,
    isPartOf: { "@type": "Blog", "@id": `${siteUrl}/${locale}/thoughts` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    ...(sameAs.length > 0 && { sameAs }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ProfilePageJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: "Ian Ronk",
      jobTitle: "Data Lead & Engineer",
      description:
        "Ian Ronk is a data lead and engineer in Amsterdam who builds and runs production data systems — big data pipelines, forecasting, network analysis — with a research specialization in urban dynamics.",
      url: siteUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
