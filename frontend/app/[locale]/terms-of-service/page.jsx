import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Terms of Service",
  description: "Terms of service for Ian Ronk's website.",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-24 md:py-32">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: February 21, 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using ianronk.com (&quot;the Website&quot;), you accept
              and agree to be bound by these Terms of Service. If you do not agree to
              these terms, please do not use the Website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              2. Description of Service
            </h2>
            <p>
              This Website serves as a professional portfolio and blog for Ian Ronk,
              showcasing expertise in data science, geospatial analysis, and real
              estate analytics. The Website includes research articles, interactive
              data visualizations, and a contact form.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              3. Intellectual Property
            </h2>
            <p>
              All content on this Website, including but not limited to text, graphics,
              data visualizations, code samples, logos, and design elements, is the
              intellectual property of Ian Ronk unless otherwise stated. You may not
              reproduce, distribute, or create derivative works from this content
              without explicit written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              4. Research & Blog Content
            </h2>
            <p>
              Articles, research papers, and case studies published on this Website are
              provided for informational and educational purposes only. While we strive
              for accuracy, we make no guarantees regarding the completeness or
              applicability of the information. Content should not be considered as
              professional investment, financial, or legal advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              5. Interactive Visualizations
            </h2>
            <p>
              The interactive maps and data visualizations on this Website are provided
              for demonstration and educational purposes. The underlying data may be
              sourced from third parties and is subject to their respective terms of
              use. We do not guarantee the accuracy or timeliness of the displayed
              data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              6. User Conduct
            </h2>
            <p>When using this Website, you agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Submit false, misleading, or spam content through the contact form.
              </li>
              <li>
                Attempt to gain unauthorized access to any part of the Website or its
                systems.
              </li>
              <li>
                Use automated tools (bots, scrapers) to access the Website without
                prior written consent.
              </li>
              <li>
                Interfere with or disrupt the Website&apos;s functionality or
                infrastructure.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              7. Third-Party Links & Services
            </h2>
            <p>
              This Website may contain links to third-party websites and services
              (e.g., LinkedIn, GitHub, Mapbox). We are not responsible for the content
              or privacy practices of these external sites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              8. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Ian Ronk shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages
              arising out of or relating to your use of the Website. The Website is
              provided &quot;as is&quot; without any warranties, express or implied.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              9. Governing Law
            </h2>
            <p>
              These Terms of Service are governed by and construed in accordance with
              the laws of the Netherlands. Any disputes shall be subject to the
              exclusive jurisdiction of the courts of Amsterdam, the Netherlands.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              10. Changes to These Terms
            </h2>
            <p>
              We reserve the right to modify these Terms of Service at any time.
              Changes will be posted on this page with an updated revision date.
              Continued use of the Website after changes constitutes acceptance of the
              modified terms.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
