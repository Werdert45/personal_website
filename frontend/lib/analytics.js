"use client";

const STORAGE_KEY = "cookie-consent-v2";
const LEGACY_KEY = "consent.v1";

const DEFAULT_STATE = {
  analytics: false,
  marketing: false,
  decidedAt: null,
  version: 2,
  ready: false,
};

let state = { ...DEFAULT_STATE };
const listeners = new Set();

function readStored() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version === 2) return parsed;
    return null;
  } catch {
    return null;
  }
}

function migrateLegacy() {
  if (typeof window === "undefined") return null;
  try {
    const v1 = window.localStorage.getItem(LEGACY_KEY);
    if (v1 !== "accepted" && v1 !== "declined") return null;
    const migrated = {
      analytics: v1 === "accepted",
      marketing: v1 === "accepted",
      decidedAt: new Date().toISOString(),
      version: 2,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    window.localStorage.removeItem(LEGACY_KEY);
    return migrated;
  } catch {
    return null;
  }
}

function notify() {
  for (const fn of listeners) {
    try {
      fn(state);
    } catch {}
  }
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent("consentchange", { detail: state }));
    } catch {}
  }
}

let initialized = false;

export function initConsent() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  const stored = readStored() || migrateLegacy();
  if (stored) {
    state = { ...stored, ready: true };
  } else {
    state = { ...DEFAULT_STATE, ready: true };
  }
  notify();

  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    const next = readStored();
    if (next) {
      state = { ...next, ready: true };
      notify();
    }
  });
}

export function getConsent() {
  return state;
}

export function setConsent({ analytics, marketing }) {
  if (typeof window === "undefined") return;
  state = {
    analytics: !!analytics,
    marketing: !!marketing,
    decidedAt: new Date().toISOString(),
    version: 2,
    ready: true,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
  notify();
}

export function isBannerNeeded() {
  return state.ready && state.decidedAt === null;
}

export function reopenBanner() {
  if (typeof window === "undefined") return;
  state = { ...state, decidedAt: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.decidedAt = null;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch {}
  notify();
}

export function subscribeConsent(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function trackEvent(name, params = {}) {
  if (typeof window === "undefined") return;
  if (!state.ready || !state.analytics) return;
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
