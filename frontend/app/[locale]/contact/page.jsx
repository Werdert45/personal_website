import { ContactContent } from "@/components/contact-content";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ianronk.com";
  const url = `${siteUrl}/${locale}/contact`;
  return {
    title: "Contact",
    description:
      "Contact Ian Ronk — data lead and urban-dynamics researcher based in Amsterdam. Questions about the research, the pipelines, a role or a collaboration.",
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/en/contact`,
        nl: `${siteUrl}/nl/contact`,
        de: `${siteUrl}/de/contact`,
        it: `${siteUrl}/it/contact`,
        "x-default": `${siteUrl}/en/contact`,
      },
    },
    openGraph: {
      title: "Contact | Ian Ronk",
      description:
        "Contact Ian Ronk — data lead and urban-dynamics researcher based in Amsterdam. Questions about the research, the pipelines, a role or a collaboration.",
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
