"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    document.cookie = "cookie_consent=accepted;path=/;max-age=31536000;SameSite=Lax";
    setVisible(false);
    window.dispatchEvent(new Event("cookie-consent-change"));
  }

  function reject() {
    localStorage.setItem("cookie_consent", "rejected");
    document.cookie = "cookie_consent=rejected;path=/;max-age=31536000;SameSite=Lax";
    setVisible(false);
    window.dispatchEvent(new Event("cookie-consent-change"));
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-background border border-border rounded-lg shadow-lg p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-muted-foreground">
          <p>
            We use cookies to analyze site traffic and improve your experience.
            By clicking &quot;Accept&quot;, you consent to our use of analytics cookies.
            See our{" "}
            <Link href="/en/cookie-policy" className="underline hover:text-foreground">
              Cookie Policy
            </Link>{" "}
            and{" "}
            <Link href="/en/privacy-policy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={reject}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
          >
            Reject
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
