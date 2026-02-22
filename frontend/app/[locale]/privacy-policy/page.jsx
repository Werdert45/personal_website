import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Ian Ronk's website.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-24 md:py-32">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: February 21, 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              1. Introduction
            </h2>
            <p>
              Welcome to ianronk.com (&quot;the Website&quot;), operated by Ian Ronk
              (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We are committed to
              protecting your privacy and personal data in accordance with the General
              Data Protection Regulation (GDPR) and other applicable data protection
              laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              2. Data Controller
            </h2>
            <p>
              The data controller for this website is Ian Ronk, based in Amsterdam,
              the Netherlands. For privacy-related inquiries, please contact us via the
              contact form on this website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              3. Information We Collect
            </h2>
            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
              3.1 Information You Provide
            </h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Contact form submissions:</strong> name, email address, phone
                number (optional), subject, and message content.
              </li>
              <li>
                <strong>Newsletter subscriptions:</strong> email address.
              </li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
              3.2 Information Collected Automatically
            </h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Analytics data:</strong> page views, referring pages, browser
                type, device type, and approximate geographic location (via Google
                Analytics, only with your consent).
              </li>
              <li>
                <strong>Cookies:</strong> essential cookies for site functionality and
                analytics cookies (with consent). See our Cookie Policy for details.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              4. How We Use Your Information
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To respond to your contact form inquiries.</li>
              <li>
                To send newsletter updates (only if you have explicitly subscribed).
              </li>
              <li>
                To analyze website traffic and improve user experience (with your
                consent).
              </li>
              <li>To ensure the security and proper functioning of the website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              5. Legal Basis for Processing
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Consent:</strong> for analytics cookies, newsletter
                subscriptions, and non-essential data processing.
              </li>
              <li>
                <strong>Legitimate interest:</strong> for essential website
                functionality and security.
              </li>
              <li>
                <strong>Contract performance:</strong> for responding to contact form
                inquiries.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              6. Third-Party Services
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Google Analytics:</strong> for website analytics (data
                processed with IP anonymization enabled). Only activated upon consent.
              </li>
              <li>
                <strong>Vercel Analytics:</strong> for performance monitoring (privacy-focused, no personal data collected).
              </li>
              <li>
                <strong>Mapbox:</strong> for interactive map visualizations.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              7. Data Retention
            </h2>
            <p>
              Contact form submissions are retained for up to 12 months. Analytics
              data is retained according to Google Analytics default settings (14
              months). Newsletter subscriber data is retained until you unsubscribe.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              8. Your Rights (GDPR)
            </h2>
            <p>Under the GDPR, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal data.</li>
              <li>Rectify inaccurate personal data.</li>
              <li>Erase your personal data (&quot;right to be forgotten&quot;).</li>
              <li>Restrict processing of your personal data.</li>
              <li>Data portability.</li>
              <li>Object to processing of your personal data.</li>
              <li>Withdraw consent at any time.</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, please contact us via the contact form.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              9. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to protect
              your personal data, including encrypted data transmission (HTTPS),
              secure server infrastructure, and access controls.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this privacy policy from time to time. Any changes will be
              posted on this page with an updated revision date.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
