// Helpers for the ```map fenced-block integration (MapFigure design spec,
// docs/superpowers/specs/2026-08-11-map-figure-design.md).
//
// A fenced code block with language `map` carries a JSON config for
// MapFigure. Detection happens on the hast <pre> node so every other
// language keeps its normal <pre><code> rendering (rehype-highlight etc.).

function collectText(node) {
  if (!node) return "";
  if (node.type === "text") return node.value;
  return (node.children || []).map(collectText).join("");
}

/**
 * Given the hast node of a <pre> element, return the raw source of a
 * ```map fence inside it, or null when this is not a map fence.
 */
export function getMapFenceSource(node) {
  const code = (node?.children || []).find((c) => c.tagName === "code");
  if (!code) return null;
  const cls = code.properties?.className;
  const classes = Array.isArray(cls)
    ? cls
    : typeof cls === "string"
      ? cls.split(" ")
      : [];
  if (!classes.includes("language-map")) return null;
  return collectText(code);
}

/**
 * Parse a map fence body. Returns { config } on success or { error } when
 * the body is not a JSON object — the caller hands the error to MapFigure,
 * which renders its quiet placeholder (never a crashed post body).
 */
export function parseMapFence(source) {
  try {
    const config = JSON.parse(source);
    if (!config || typeof config !== "object" || Array.isArray(config)) {
      return { error: "map fence must contain a JSON object" };
    }
    return { config };
  } catch (err) {
    return { error: `invalid JSON in map fence: ${err.message}` };
  }
}
