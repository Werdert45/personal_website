"use client";

const CONSENT_KEY = "consent.v1";

export function getConsent() {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    if (v === "accepted" || v === "declined") return v;
    return null;
  } catch {
    return null;
  }
}

export function setConsent(value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CONSENT_KEY, value);
    window.dispatchEvent(new CustomEvent("consentchange", { detail: { value } }));
  } catch {}
}

export function trackEvent(name, params = {}) {
  if (typeof window === "undefined") return;
  if (getConsent() !== "accepted") return;
  if (typeof window.gtag !== "function") return;
  try {
    window.gtag("event", name, params);
  } catch {}
}

export function buildShareUrl(platform, articleUrl, slug, title) {
  const url = new URL(articleUrl);
  url.searchParams.set("utm_source", platform);
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", slug);
  const tagged = url.toString();
  const encoded = encodeURIComponent(tagged);
  const text = encodeURIComponent(title || "");
  switch (platform) {
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${encoded}&text=${text}`;
    default:
      return tagged;
  }
}
