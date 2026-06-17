import { sanitizeHref } from '../utils/url.js';
import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-campaign-layout> — No-nav landing/campaign page scaffold (Tier 5 Layout).
 *
 * The reusable page shell for a landing page that honors Gardner's attention ratio of
 * 1:1 (one page, one goal) BY CONSTRUCTION. Unlike <dvfy-nav-bar>, it deliberately
 * OMITS the site navigation menu — no nav-menu, no link list, no hamburger/drawer
 * escape routes. Those extra clickable links leak attention (and conversions) off the
 * single conversion path, so a campaign page must not carry them.
 *
 * What it provides:
 *   - an optional non-navigational brand mark (a <header> bar) — plain text/logo, OR, if
 *     `home-href` is set, a SINGLE self-referential link back to the page's own top
 *     (e.g. "#top"). Never a multi-link nav.
 *   - a <main id="main-content"> landmark holding the default slot: the §8 page sections
 *     (compose from <dvfy-section-hero> + <dvfy-page-section> + the composition vocabulary).
 *   - an optional <footer> (the `footer` slot) for non-nav fine print (©, legal) only.
 *
 * Net effect: the layout itself adds ZERO clickable links beyond the one optional brand
 * self-link, so every other link on the page is a consumer CTA toward the one goal — the
 * page is 1:1 by default.
 *
 * Attributes:
 *   brand:     string — brand name text shown in the header (omit header entirely if absent + no logo)
 *   logo:      string — logo image URL shown in the header
 *   home-href: string — when set, the brand becomes a single self-link to this anchor
 *                       (intended for "#"/page-top only; sanitized). Omit → brand is plain text.
 *
 * Usage:
 *   <dvfy-campaign-layout brand="Renting Ideal" home-href="#top">
 *     <dvfy-section-hero tone="brand" align="center">
 *       <dvfy-heading level="1">Tu mejor renting</dvfy-heading>
 *       <dvfy-button variant="primary" size="lg" href="/empezar">Empezar</dvfy-button>
 *     </dvfy-section-hero>
 *     <dvfy-page-section> … </dvfy-page-section>
 *     <div slot="footer"><dvfy-text size="sm" tone="muted">© 2026 Renting Ideal</dvfy-text></div>
 *   </dvfy-campaign-layout>
 */

const STYLES = `
dvfy-campaign-layout {
  display: block;
  width: 100%;
  box-sizing: border-box;
  min-height: 100%;
  background: var(--dvfy-surface-page);
  color: var(--dvfy-text-primary);
  font-family: var(--dvfy-font-sans);
}

/* ── Skip link (a11y) — moves focus straight to the conversion content ── */
.dvfy-campaign-layout__skip {
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
.dvfy-campaign-layout__skip:focus { left: var(--dvfy-space-4); }

/* ── Brand bar (header) — a brand mark ONLY, never a nav menu ── */
.dvfy-campaign-layout__header {
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
.dvfy-campaign-layout__brand {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-2);
  width: 100%;
  max-width: var(--dvfy-container-7xl);
  margin-inline: auto;
  /* Plain (non-linked) brand inherits text color; the optional self-link resets below. */
  color: var(--dvfy-nav-brand-text, var(--dvfy-text-primary));
}

/* When the brand is a self-link, keep it visually identical to the plain mark. */
a.dvfy-campaign-layout__brand {
  text-decoration: none;
  color: var(--dvfy-nav-brand-text, var(--dvfy-text-primary));
}

.dvfy-campaign-layout__logo {
  height: 1.75rem;
  width: auto;
  display: block;
}
.dvfy-campaign-layout__brand-text {
  font-family: var(--dvfy-font-brand);
  font-size: var(--dvfy-text-lg);
  font-weight: var(--dvfy-weight-bold);
  line-height: 1.2;
  white-space: nowrap;
}

/* ── Main — the single conversion path lives here ── */
.dvfy-campaign-layout__main {
  display: block;
  width: 100%;
}

/* ── Footer — non-nav fine print only ── */
.dvfy-campaign-layout__footer {
  width: 100%;
  box-sizing: border-box;
  padding-block: var(--dvfy-space-8);
  padding-inline: clamp(var(--dvfy-space-5), 3vw, var(--dvfy-space-8));
  background: var(--dvfy-surface-muted);
  border-top: var(--dvfy-border-1) solid var(--dvfy-border-default);
  color: var(--dvfy-text-muted);
  font-size: var(--dvfy-text-sm);
}
.dvfy-campaign-layout__footer > * {
  max-width: var(--dvfy-container-7xl);
  margin-inline: auto;
}
`;

/**
 * No-nav landing/campaign page scaffold that is 1:1 attention-ratio by construction.
 *
 * @element dvfy-campaign-layout
 *
 * @attr {string} brand - Brand name text shown in the header (header omitted if absent + no logo)
 * @attr {string} logo - Logo image URL shown in the header
 * @attr {string} home-href - When set, the brand becomes a single self-link to this anchor (page-top only; sanitized)
 *
 * @slot - Page sections (the §8 landing-page body): dvfy-section-hero, dvfy-page-section, etc.
 * @slot footer - Non-nav fine print (©, legal). Renders a <footer> landmark.
 *
 * @cssprop {color} --dvfy-surface-page - Page background
 * @cssprop {color} --dvfy-nav-bg - Brand-bar background (default: var(--dvfy-surface-raised))
 * @cssprop {color} --dvfy-nav-border - Brand-bar bottom border (default: var(--dvfy-border-default))
 * @cssprop {color} --dvfy-nav-brand-text - Brand text color (default: var(--dvfy-text-primary))
 * @cssprop {length} --dvfy-nav-height - Brand-bar min height (default: 3.5rem)
 *
 * @example
 * <dvfy-campaign-layout brand="Renting Ideal" home-href="#top">
 *   <dvfy-section-hero tone="brand" align="center">
 *     <dvfy-heading level="1">Tu mejor renting</dvfy-heading>
 *     <dvfy-button variant="primary" size="lg" href="/empezar">Empezar</dvfy-button>
 *   </dvfy-section-hero>
 *   <div slot="footer"><dvfy-text size="sm" tone="muted">© 2026 Renting Ideal</dvfy-text></div>
 * </dvfy-campaign-layout>
 */
class DvfyCampaignLayout extends HTMLElement {
  static get observedAttributes() { return ['brand', 'logo', 'home-href']; }

  connectedCallback() {
    injectStyles('dvfy-campaign-layout', STYLES);
    this.#build();
  }

  attributeChangedCallback() {
    // Rebuild from the canonical slotted content if already built.
    if (this.isConnected && this.#built) this.#rebuild();
  }

  #built = false;

  #build() {
    // Idempotent: if we already wrapped, do nothing (reconnection must not re-wrap).
    if (this.querySelector(':scope > .dvfy-campaign-layout__main')) {
      this.#built = true;
      return;
    }

    // Partition the authored children: [slot="footer"] → footer; everything else → main.
    const footerChildren = [];
    const mainChildren = [];
    for (const child of Array.from(this.childNodes)) {
      if (child.nodeType === Node.ELEMENT_NODE && child.getAttribute('slot') === 'footer') {
        footerChildren.push(child);
      } else {
        mainChildren.push(child);
      }
    }

    while (this.firstChild) this.removeChild(this.firstChild);

    // Skip-to-content link — the only structural <a> beyond the optional brand self-link,
    // and it targets the page's OWN content (never an off-page escape route).
    const skip = document.createElement('a');
    skip.className = 'dvfy-campaign-layout__skip';
    skip.href = '#main-content';
    skip.textContent = 'Skip to content';
    this.appendChild(skip);

    // Optional brand-mark header (no nav menu — ever).
    const header = this.#buildHeader();
    if (header) this.appendChild(header);

    // Main — the single conversion path.
    const main = document.createElement('main');
    main.id = 'main-content';
    main.className = 'dvfy-campaign-layout__main';
    for (const node of mainChildren) main.appendChild(node);
    this.appendChild(main);

    // Optional footer — non-nav fine print only.
    if (footerChildren.length) {
      const footer = document.createElement('footer');
      footer.className = 'dvfy-campaign-layout__footer';
      for (const node of footerChildren) footer.appendChild(node);
      this.appendChild(footer);
    }

    this.#built = true;
  }

  // Rebuild on a reactive attribute change: unwrap to the authored DOM, then build again.
  #rebuild() {
    const main = this.querySelector(':scope > .dvfy-campaign-layout__main');
    const footer = this.querySelector(':scope > .dvfy-campaign-layout__footer');
    const skip = this.querySelector(':scope > .dvfy-campaign-layout__skip');
    const header = this.querySelector(':scope > .dvfy-campaign-layout__header');

    // Lift footer children back out with their slot attribute, then main children.
    if (footer) { while (footer.firstChild) this.appendChild(footer.firstChild); footer.remove(); }
    if (main) { while (main.firstChild) this.insertBefore(main.firstChild, footer || null); main.remove(); }
    if (skip) skip.remove();
    if (header) header.remove();

    this.#built = false;
    this.#build();
  }

  #buildHeader() {
    const brandName = this.getAttribute('brand');
    const logoUrl = this.getAttribute('logo');
    if (!brandName && !logoUrl) return null;

    const header = document.createElement('header');
    header.className = 'dvfy-campaign-layout__header';

    // Brand mark: a self-link ONLY if home-href is set; otherwise a non-interactive span.
    const homeHref = this.getAttribute('home-href');
    const brand = document.createElement(homeHref ? 'a' : 'div');
    brand.className = 'dvfy-campaign-layout__brand';
    if (homeHref) brand.setAttribute('href', sanitizeHref(homeHref));

    if (logoUrl) {
      const img = document.createElement('img');
      img.className = 'dvfy-campaign-layout__logo';
      img.src = sanitizeHref(logoUrl);
      img.alt = brandName || 'Logo';
      brand.appendChild(img);
    }
    if (brandName) {
      const txt = document.createElement('span');
      txt.className = 'dvfy-campaign-layout__brand-text';
      txt.textContent = brandName;
      brand.appendChild(txt);
    }

    header.appendChild(brand);
    return header;
  }
}

customElements.define('dvfy-campaign-layout', DvfyCampaignLayout);
