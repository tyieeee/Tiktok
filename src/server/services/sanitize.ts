/**
 * Lightweight server-side HTML sanitizer.
 * Strips all HTML tags to produce plain text.
 * Use a full sanitizer (e.g. sanitize-html) if rich HTML output is needed.
 */
export function sanitizeHtml(dirty: string): string {
  return dirty
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .trim();
}
