/**
 * Strip HTML tags and normalize whitespace for short UI previews (e.g. cards).
 * Safe for untrusted content when only displaying text (no HTML injection).
 */
export function htmlToPlainText(html) {
  if (html == null || typeof html !== "string") return "";
  const trimmed = html.trim();
  if (!trimmed) return "";
  try {
    const doc = new DOMParser().parseFromString(trimmed, "text/html");
    const text = doc.body?.textContent ?? "";
    return text.replace(/\s+/g, " ").trim();
  } catch {
    return trimmed
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
}
