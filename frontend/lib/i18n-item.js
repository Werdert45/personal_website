// Resolve a localized field on a content item that may carry `translations`.
// English uses the base field; other locales prefer the matching translation,
// falling back to the base field. An optional `fallback` is returned when both
// are empty (matches the blog-list call site; harmless for callers that omit it).
export function getItemField(item, field, locale, fallback) {
  if (locale === "en") return item[field] ?? fallback;
  const trans = item.translations?.find((t) => t.language === locale);
  return trans?.[field] || item[field] || fallback;
}
