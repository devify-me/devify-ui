/**
 * catalog/clipboard.js — Clipboard utility with fallback
 *
 * navigator.clipboard requires Secure Context (HTTPS or localhost).
 * Falls back to execCommand('copy') for HTTP contexts like Tailscale URLs.
 */

/**
 * Copy text to clipboard with automatic fallback.
 * @param {string} text
 * @returns {Promise<void>}
 */
export function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  }
  return fallbackCopy(text);
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
  return Promise.resolve();
}

/**
 * Copy text to clipboard and show "Copied!" feedback.
 * @param {HTMLElement} el — Element to show "Copied!" in
 * @param {string} text — Text to copy
 * @param {string} resetText — Text to restore after delay
 * @param {number} delay — How long to show "Copied!" (default: 1500ms)
 */
export function copyWithReset(el, text, resetText, delay = 1500) {
  copyToClipboard(text);
  el.textContent = 'Copied!';
  setTimeout(() => { el.textContent = resetText; }, delay);
}
