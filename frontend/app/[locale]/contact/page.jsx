import { ContactContent } from "@/components/contact-content";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.com";
  const url = `${siteUrl}/${locale}/contact`;
  return {
    title: "Contact",
    description:
      "Get in touch with Ian Ronk for data science, GIS development, real estate analytics, and machine learning projects across European markets.",
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/en/contact`,
        nl: `${siteUrl}/nl/contact`,
        it: `${siteUrl}/it/contact`,
        de: `${siteUrl}/de/contact`,
        "x-default": `${siteUrl}/en/contact`,
      },
    },
    openGraph: {
      title: "Contact | Ian Ronk",
      description:
        "Get in touch for data science, GIS development, and real estate analytics projects.",
      url,
      type: "website",
    },
  };
}

export default function ContactPage() {
  return (
    <main>
      <ContactContent />
    </main>
  );
}
