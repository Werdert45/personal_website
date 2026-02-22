// Simple in-memory email cache for verified users
let emailCache = new Map();

export function addVerifiedEmail(email) {
  const timestamp = Date.now();
  emailCache.set(email, { timestamp, verified: true });
  // Keep cache entries for 30 days
  setTimeout(() => emailCache.delete(email), 30 * 24 * 60 * 60 * 1000);
}

export function isEmailVerified(email) {
  return emailCache.has(email);
}

export function getVerifiedEmails() {
  return Array.from(emailCache.keys());
}

export function clearCache() {
  emailCache.clear();
}
