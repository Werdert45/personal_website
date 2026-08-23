const PERSON_SAME_AS = [
  "https://www.linkedin.com/in/ian-ronk-7b054a120/",
  "https://github.com/Werdert45",
];

const SCHOLARLY_CATEGORIES = ["working-paper", "preprint", "thesis", "paper"];

const MONTH_NUMBERS = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

export function toIsoDate(value) {
  if (!value) return undefined;
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s;
  if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`;
  if (/^\d{4}$/.test(s)) return `${s}-01-01`;
  const named = s.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (named) {
    const month = MONTH_NUMBERS[named[1].toLowerCase()];
    if (month) return `${named[2]}-${month}-01`;
  }
  return undefined;
}

export function isScholarlyCategory(category) {
  return SCHOLARLY_CATEGORIES.includes(String(category || "").toLowerCase());
}

function firstSentences(text, count = 2) {
  if (!text) return text;
  const sentences = text.split(/(?<=[.!?][)\]"”']*)\s+(?=[A-Z])/);
  return sentences.slice(0, count).join(" ");
}

function personRef(siteUrl) {
  return {
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: "Ian Ronk",
    url: siteUrl,
    sameAs: PERSON_SAME_AS,
  };
}

function fullPersonNode(siteUrl) {
  return {
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: "Ian Ronk",
    jobTitle: "Head of Data: data systems, analytics, and urban-dynamics research",
    description: "Ian Ronk is Head of Data in Amsterdam. He builds and leads production data systems and the analytics on top: web-scraped market data, official statistics and time series, document pipelines on LLMs and OCR, and spatial and network data, with a research specialization in urban dynamics.",
    url: siteUrl,
    image: `${siteUrl}/profile.jpg`,
    sameAs: PERSON_SAME_AS,
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
}

export function PersonJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.nl";

  const jsonLd = {
    "@context": "https://schema.org",
    ...fullPersonNode(siteUrl),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebSiteJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.nl";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "Ian Ronk",
    url: siteUrl,
    description:
      "Ian Ronk is Head of Data in Amsterdam. He builds and leads production data systems and the analytics on top: web-scraped market data, official statistics and time series, document pipelines on LLMs and OCR, and spatial and network data, with a research specialization in urban dynamics.",
    author: { "@id": `${siteUrl}/#person` },
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
  category,
  locale = "en",
  inLanguage,
  availableLocales = ["en"],
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ianronk.nl";
  const url = `${siteUrl}/${locale}/research/${slug}`;

  const sameAs = availableLocales
    .filter((l) => l !== locale)
    .map((l) => `${siteUrl}/${l}/research/${slug}`);

  const scholarly = isScholarlyCategory(category);
  const published = toIsoDate(datePublished);
  const modified = toIsoDate(dateModified) ?? published;

  const data = {
    "@context": "https://schema.org",
    "@type": scholarly ? "ScholarlyArticle" : "Article",
    headline: title,
    description: scholarly ? firstSentences(description) : description,
    ...(scholarly && description && { abstract: description }),
    ...(image && { image }),
    ...(published && { datePublished: published }),
    ...(modified && { dateModified: modified }),
    author: personRef(siteUrl),
    publisher: personRef(siteUrl),
    inLanguage: inLanguage ?? locale,
    isPartOf: { "@id": `${siteUrl}/#website` },
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
  inLanguage,
  availableLocales = ["en"],
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ianronk.nl";
  const url = `${siteUrl}/${locale}/thoughts/${slug}`;

  const sameAs = availableLocales
    .filter((l) => l !== locale)
    .map((l) => `${siteUrl}/${l}/thoughts/${slug}`);

  const published = toIsoDate(datePublished);
  const modified = toIsoDate(dateModified) ?? published;

  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    ...(image && { image }),
    ...(published && { datePublished: published }),
    ...(modified && { dateModified: modified }),
    author: personRef(siteUrl),
    publisher: personRef(siteUrl),
    inLanguage: inLanguage ?? locale,
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

export function BreadcrumbListJsonLd({ items }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function ProfilePageJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.nl";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: fullPersonNode(siteUrl),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
