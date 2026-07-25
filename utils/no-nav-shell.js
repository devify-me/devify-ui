import { sanitizeHref } from './url.js';

/**
 * Shared no-nav page-shell for Layout-stratum campaign/capture scaffolds.
 *
 * Provides the 1:1-attention-by-construction shell that a landing/capture page needs,
 * with the SAME guarantees as <dvfy-campaign-layout>:
 *   - a skip-to-content link (the one same-page a11y anchor — never an off-page escape);
 *   - an optional non-navigational brand mark (<header>) — plain text/logo, OR, if
 *     `home-href` is set, a SINGLE self-referential link back to the page's own top.
 *     Never a nav menu, never a link list, never a hamburger/drawer escape route;
 *   - a <main id="main-content"> landmark holding the default slot (the page body);
 *   - an optional <footer> (the `footer` slot) for non-nav fine print only.
 *
 * Net effect: the shell adds ZERO clickable links beyond the one optional brand self-link
 * and the same-page skip link, so every other link on the page is a consumer CTA toward
 * the single goal — the page is 1:1 by construction.
 *
 * Parameterized by a BEM block name (which equals the host element's tag name) so each
 * Layout keeps its own scoped class names / CSS while sharing this structure verbatim.
 *
 * @typedef {Object} NoNavShellOptions
 * @property {string} block    - BEM block name / host tag (e.g. "dvfy-chum-page")
 * @property {?string} brand   - brand name text (header omitted if absent + no logo)
 * @property {?string} logo    - logo image URL
 * @property {?string} homeHref - when set, the brand becomes a single self-link (page-top only; sanitized)
 * @property {?boolean} logoOnly - when set WITH a logo, render the logo mark only and drop
 *                                 the brand-text span (the logo `alt` still carries the brand name)
 */

/**
 * Scoped stylesheet for a no-nav shell, keyed to the given block/tag.
 * @param {string} block - BEM block name (also the host element's tag name)
 * @returns {string} CSS
 */
export function noNavShellStyles(block) {
  return `
${block} {
  display: block;
  width: 100%;
  box-sizing: border-box;
  min-height: 100%;
  background: var(--dvfy-surface-page);
  color: var(--dvfy-text-primary);
  font-family: var(--dvfy-font-sans);
}

/* ── Skip link (a11y) — moves focus straight to the conversion content ── */
.${block}__skip {
  position: absolute;
  left: -9999px;
  top: var(--dvfy-space-2);
  z-index: calc(var(--dvfy-z-sticky) + 1);
  padding: var(--dvfy-space-2) var(--dvfy-space-4);
  background: var(--dvfy-surface-raised);
  color: var(--dvfy-text-primary);
  font-weight: var(--dvfy-weight-semibold);
  border-radius: 0 0 var(--dvfy-radius-md) var(--dvfy-radius-md);
  text-decoration: none;
}
.${block}__skip:focus { left: var(--dvfy-space-4); }

/* ── Brand bar (header) — a brand mark ONLY, never a nav menu ── */
.${block}__header {
  display: flex;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  min-height: var(--dvfy-nav-height, 3.5rem);
  padding-block: var(--dvfy-space-3);
  padding-inline: clamp(var(--dvfy-space-5), 3vw, var(--dvfy-space-8));
  background: var(--dvfy-nav-bg, var(--dvfy-surface-raised));
  border-bottom: var(--dvfy-border-1) solid var(--dvfy-nav-border, var(--dvfy-border-default));
}

/* Inner rail caps the header content width, matching the page rail. */
.${block}__brand {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  width: 100%;
  max-width: var(--dvfy-container-7xl);
  margin-inline: auto;
  color: var(--dvfy-nav-brand-text, var(--dvfy-text-primary));
}

/* When the brand is a self-link, keep it visually identical to the plain mark. */
a.${block}__brand {
  text-decoration: none;
  color: var(--dvfy-nav-brand-text, var(--dvfy-text-primary));
}

.${block}__logo {
  height: 1.75rem;
  width: auto;
  display: block;
}
.${block}__brand-text {
  font-family: var(--dvfy-font-brand);
  font-size: var(--dvfy-text-lg);
  font-weight: var(--dvfy-weight-bold);
  line-height: 1.2;
  white-space: nowrap;
}

/* ── Main — the single conversion path lives here ── */
.${block}__main {
  display: block;
  width: 100%;
}

/* ── Footer — non-nav fine print only ── */
.${block}__footer {
  width: 100%;
  box-sizing: border-box;
  padding-block: var(--dvfy-space-8);
  padding-inline: clamp(var(--dvfy-space-5), 3vw, var(--dvfy-space-8));
  background: var(--dvfy-surface-muted);
  border-top: var(--dvfy-border-1) solid var(--dvfy-border-default);
  color: var(--dvfy-text-muted);
  font-size: var(--dvfy-text-sm);
}
.${block}__footer > * {
  max-width: var(--dvfy-container-7xl);
  margin-inline: auto;
}
`;
}

/**
 * Build the no-nav shell into `host`, wrapping its authored children.
 *
 * Idempotent: if the shell is already built (a `.${block}__main` exists), it no-ops and
 * returns true — safe across reconnection.
 *
 * @param {HTMLElement} host
 * @param {NoNavShellOptions} opts
 * @returns {boolean} true once the host is (or was already) wrapped
 */
export function buildNoNavShell(host, opts) {
  const { block } = opts;

  // Idempotent: if we already wrapped, do nothing (reconnection must not re-wrap).
  if (host.querySelector(`:scope > .${block}__main`)) return true;

  // Partition authored children: [slot="footer"] → footer; everything else → main.
  const footerChildren = [];
  const mainChildren = [];
  for (const child of Array.from(host.childNodes)) {
    if (child.nodeType === Node.ELEMENT_NODE && child.getAttribute('slot') === 'footer') {
      footerChildren.push(child);
    } else {
      mainChildren.push(child);
    }
  }

  while (host.firstChild) host.removeChild(host.firstChild);

  // Skip-to-content link — the only structural <a> beyond the optional brand self-link,
  // and it targets the page's OWN content (never an off-page escape route).
  const skip = document.createElement('a');
  skip.className = `${block}__skip`;
  skip.href = '#main-content';
  skip.textContent = 'Skip to content';
  host.appendChild(skip);

  // Optional brand-mark header (no nav menu — ever).
  const header = buildHeader(opts);
  if (header) host.appendChild(header);

  // Main — the single conversion path.
  const main = document.createElement('main');
  main.id = 'main-content';
  main.className = `${block}__main`;
  for (const node of mainChildren) main.appendChild(node);
  host.appendChild(main);

  // Optional footer — non-nav fine print only.
  if (footerChildren.length) {
    const footer = document.createElement('footer');
    footer.className = `${block}__footer`;
    for (const node of footerChildren) footer.appendChild(node);
    host.appendChild(footer);
  }

  return true;
}

/**
 * Rebuild the shell on a reactive attribute change: unwrap to the authored DOM
 * (preserving children + their `slot` attributes), then build again.
 *
 * @param {HTMLElement} host
 * @param {NoNavShellOptions} opts
 * @returns {boolean} true once rebuilt
 */
export function rebuildNoNavShell(host, opts) {
  const { block } = opts;
  const main = host.querySelector(`:scope > .${block}__main`);
  const footer = host.querySelector(`:scope > .${block}__footer`);
  const skip = host.querySelector(`:scope > .${block}__skip`);
  const header = host.querySelector(`:scope > .${block}__header`);

  // Lift authored children back out (main first, then footer children which keep slot="footer");
  // re-partitioning on the next build restores correct placement regardless of order.
  if (main) { while (main.firstChild) host.appendChild(main.firstChild); main.remove(); }
  if (footer) { while (footer.firstChild) host.appendChild(footer.firstChild); footer.remove(); }
  if (skip) skip.remove();
  if (header) header.remove();

  return buildNoNavShell(host, opts);
}

/**
 * Build the optional brand-mark header. Returns null when neither brand nor logo is set.
 * The brand is a self-link ONLY when `homeHref` is set (sanitized, page-top intent);
 * otherwise it is a non-interactive mark. Never a nav menu.
 *
 * When `logoOnly` is set AND a logo is present, the brand-text span is dropped so the header
 * shows the logo mark alone — the logo `alt` still carries the brand name, so the accessible
 * name is unchanged. (With no logo, `logoOnly` is a no-op: the brand text is the only mark.)
 * @param {NoNavShellOptions} opts
 * @returns {?HTMLElement}
 */
function buildHeader({ block, brand, logo, homeHref, logoOnly }) {
  if (!brand && !logo) return null;

  const header = document.createElement('header');
  header.className = `${block}__header`;

  const mark = document.createElement(homeHref ? 'a' : 'div');
  mark.className = `${block}__brand`;
  if (homeHref) mark.setAttribute('href', sanitizeHref(homeHref));

  if (logo) {
    const img = document.createElement('img');
    img.className = `${block}__logo`;
    img.src = sanitizeHref(logo);
    img.alt = brand || 'Logo';
    mark.appendChild(img);
  }
  // Brand text shows by default; hidden only in logo-only mode when a logo is present
  // (the logo alt preserves the accessible brand name).
  const showBrandText = brand && !(logoOnly && logo);
  if (showBrandText) {
    const txt = document.createElement('span');
    txt.className = `${block}__brand-text`;
    txt.textContent = brand;
    mark.appendChild(txt);
  }

  header.appendChild(mark);
  return header;
}
