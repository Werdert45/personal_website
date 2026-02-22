import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Cookie Policy",
  description: "Cookie policy for Ian Ronk's website.",
};

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-24 md:py-32">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: February 21, 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              1. What Are Cookies
            </h2>
            <p>
              Cookies are small text files stored on your device when you visit a
              website. They are widely used to make websites work more efficiently and
              to provide information to the site owners.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              2. How We Use Cookies
            </h2>
            <p>This website uses the following types of cookies:</p>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
              2.1 Essential Cookies
            </h3>
            <p>
              These cookies are necessary for the website to function properly. They
              cannot be disabled.
            </p>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm border border-border rounded">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 border-b border-border font-medium text-foreground">Cookie</th>
                    <th className="text-left p-2 border-b border-border font-medium text-foreground">Purpose</th>
                    <th className="text-left p-2 border-b border-border font-medium text-foreground">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border-b border-border font-mono text-xs">cookie_consent</td>
                    <td className="p-2 border-b border-border">Stores your cookie consent preference</td>
                    <td className="p-2 border-b border-border">1 year</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b border-border font-mono text-xs">admin_token</td>
                    <td className="p-2 border-b border-border">Admin session authentication (admin users only)</td>
                    <td className="p-2 border-b border-border">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
              2.2 Analytics Cookies
            </h3>
            <p>
              These cookies help us understand how visitors interact with the website.
              They are only placed with your explicit consent.
            </p>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm border border-border rounded">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 border-b border-border font-medium text-foreground">Cookie</th>
                    <th className="text-left p-2 border-b border-border font-medium text-foreground">Purpose</th>
                    <th className="text-left p-2 border-b border-border font-medium text-foreground">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border-b border-border font-mono text-xs">_ga</td>
                    <td className="p-2 border-b border-border">Google Analytics - distinguishes unique users</td>
                    <td className="p-2 border-b border-border">2 years</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b border-border font-mono text-xs">_ga_*</td>
                    <td className="p-2 border-b border-border">Google Analytics - maintains session state</td>
                    <td className="p-2 border-b border-border">2 years</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
              2.3 Functional Cookies
            </h3>
            <p>
              These cookies enable enhanced functionality such as newsletter access.
            </p>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm border border-border rounded">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 border-b border-border font-medium text-foreground">Cookie</th>
                    <th className="text-left p-2 border-b border-border font-medium text-foreground">Purpose</th>
                    <th className="text-left p-2 border-b border-border font-medium text-foreground">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border-b border-border font-mono text-xs">map_access_token</td>
                    <td className="p-2 border-b border-border">Grants access to interactive map visualizations</td>
                    <td className="p-2 border-b border-border">Session</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b border-border font-mono text-xs">map_access_email</td>
                    <td className="p-2 border-b border-border">Stores subscriber email for map access verification</td>
                    <td className="p-2 border-b border-border">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              3. Managing Cookies
            </h2>
            <p>
              You can manage your cookie preferences through the cookie consent banner
              that appears when you first visit the website. You can also manage
              cookies through your browser settings:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>
                <strong>Chrome:</strong> Settings &gt; Privacy and Security &gt;
                Cookies
              </li>
              <li>
                <strong>Firefox:</strong> Settings &gt; Privacy &amp; Security &gt;
                Cookies
              </li>
              <li>
                <strong>Safari:</strong> Preferences &gt; Privacy &gt; Manage Website
                Data
              </li>
              <li>
                <strong>Edge:</strong> Settings &gt; Cookies and Site Permissions
              </li>
            </ul>
            <p className="mt-2">
              Please note that disabling essential cookies may affect the functionality
              of the website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              4. Third-Party Cookies
            </h2>
            <p>
              When you consent to analytics cookies, Google Analytics may set
              additional cookies. Google&apos;s privacy policy can be found at{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                policies.google.com/privacy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">
              5. Changes to This Policy
            </h2>
            <p>
              We may update this Cookie Policy from time to time. Changes will be
              posted on this page with an updated revision date.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
