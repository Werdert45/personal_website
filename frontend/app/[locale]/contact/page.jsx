import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ContactContent } from "@/components/contact-content";

export const metadata = {
  title: "Contact",
  description:
    "Get in touch with Ian Ronk for data science, GIS development, real estate analytics, and machine learning projects across European markets.",
  openGraph: {
    title: "Contact | Ian Ronk",
    description:
      "Get in touch for data science, GIS development, and real estate analytics projects.",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <ContactContent />
      <Footer />
    </main>
  );
}
