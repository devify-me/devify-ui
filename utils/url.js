/**
 * Characters a browser removes or ignores while parsing a URL: leading/trailing
 * ASCII whitespace plus C0 controls, and tab/LF/CR *anywhere* in the string.
 * `java<TAB>script:alert(1)` navigates as `javascript:`, so the scheme must be
 * decided on the stripped form, not the raw one.
 */
const IGNORED_URL_CHARS = /[\u0000-\u0020\u007f]/g;

/** A URL scheme per RFC 3986: ALPHA *( ALPHA / DIGIT / "+" / "-" / "." ) ":" */
const SCHEME = /^([a-z][a-z0-9+.-]*):/i;

/**
 * Validate a URL scheme to prevent javascript: and data: URI injection.
 *
 * A value with no scheme is a relative reference and is passed through — this
 * includes bare same-directory paths (`assets/x.svg`, `thank-you.html`), which
 * an earlier prefix-allowlist implementation collapsed to '#' (devify-ui#381).
 * A value *with* a scheme is passed through only for http/https; every other
 * scheme (javascript:, data:, vbscript:, file:, blob:, about:, …) becomes '#'.
 *
 * @param {string} url - URL to validate
 * @returns {string} Sanitized URL
 */
export function sanitizeHref(url) {
  if (!url) return '#';
  const stripped = String(url).replace(IGNORED_URL_CHARS, '');
  if (!stripped) return '#';
  const scheme = stripped.match(SCHEME);
  if (!scheme) return url; // relative reference: bare, /, ./, ../, #frag, ?query
  return /^https?$/i.test(scheme[1]) ? url : '#';
}

/**
 * Validate a PayPal redirect URL — must be HTTPS on a known PayPal domain.
 *
 * @param {string} url - URL to validate
 * @returns {string} Sanitized URL or '#' if invalid
 */
export function sanitizePayPalUrl(url) {
  if (!url) return '#';
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return '#';
    const host = parsed.hostname;
    if (host === 'www.paypal.com' || host === 'paypal.com' || host === 'www.sandbox.paypal.com' || host === 'sandbox.paypal.com') return url;
    return '#';
  } catch {
    return '#';
  }
}

/**
 * Validate a URL for image src — allows http(s) and relative paths only.
 * Alias for sanitizeHref with identical behavior.
 *
 * @param {string} url - URL to validate
 * @returns {string} Sanitized URL
 */
export function sanitizeSrc(url) {
  return sanitizeHref(url);
}
