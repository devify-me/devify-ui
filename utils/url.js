/**
 * Validate a URL scheme to prevent javascript: and data: URI injection.
 * Returns the URL if it uses http(s) or is a relative path, otherwise returns '#'.
 *
 * @param {string} url - URL to validate
 * @returns {string} Sanitized URL
 */
export function sanitizeHref(url) {
  if (!url) return '#';
  if (/^https?:\/\//.test(url) || url.startsWith('/') || url.startsWith('#') || url.startsWith('.')) return url;
  return '#';
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
