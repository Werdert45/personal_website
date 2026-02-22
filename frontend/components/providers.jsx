"use client";

import { NewsletterProvider } from "@/components/newsletter-gate";

export function Providers({ children }) {
  return (
    <NewsletterProvider>
      {children}
    </NewsletterProvider>
  );
}
