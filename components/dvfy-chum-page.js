import { injectStyles } from '../utils/styles.js';
import { noNavShellStyles, buildNoNavShell, rebuildNoNavShell } from '../utils/no-nav-shell.js';

/**
 * <dvfy-chum-page> — No-nav lead-magnet page scaffold (Layout stratum).
 *
 * The short, single-goal page shell for a lead-capture / validation funnel. "Chum" is the
 * lead magnet — the free value offered to draw the visitor in; this is its page template.
 * It honors Gardner's attention ratio of 1:1 (one page, one goal) BY CONSTRUCTION — exactly
 * like <dvfy-campaign-layout>, it deliberately OMITS the site navigation menu (no nav-menu,
 * no link list, no hamburger/drawer escape routes) so nothing leaks attention off the
 * single conversion path.
 *
 * It is the shared shell for BOTH page-roles of the `chum` Layout category (an AND-set):
 *   - the capture page  = <dvfy-chum-page> + <dvfy-optin>     (email opt-in body)
 *   - the thank-you page = <dvfy-chum-page> + <dvfy-thank-you> (post-opt-in confirmation)
 *
 * What it provides (via the shared utils/no-nav-shell helper):
 *   - a skip-to-content link (the one same-page a11y anchor);
 *   - an optional non-navigational brand mark (a <header>) — plain text/logo, OR, if
 *     `home-href` is set, a SINGLE self-referential link back to the page's own top;
 *   - a <main id="main-content"> landmark holding the default slot (the capture body);
 *   - an optional <footer> (the `footer` slot) for non-nav fine print only.
 *
 * Attributes:
 *   brand:     string — brand name text shown in the header (omit header if absent + no logo)
 *   logo:      string — logo image URL shown in the header
 *   home-href: string — when set, the brand becomes a single self-link to this anchor
 *                       (intended for "#"/page-top only; sanitized). Omit → brand is plain text.
 *
 * Usage:
 *   <dvfy-chum-page brand="Renting Ideal" home-href="#top">
 *     <dvfy-optin
 *       eyebrow="Guía gratuita"
 *       heading="Los 7 errores que encarecen tu renting"
 *       cta="Enviarme la guía">
 *     </dvfy-optin>
 *     <div slot="footer"><dvfy-text size="sm" tone="muted">© 2026 Renting Ideal</dvfy-text></div>
 *   </dvfy-chum-page>
 */

/**
 * No-nav lead-magnet page scaffold that is 1:1 attention-ratio by construction.
 *
 * @element dvfy-chum-page
 *
 * @attr {string} brand - Brand name text shown in the header (header omitted if absent + no logo)
 * @attr {string} logo - Logo image URL shown in the header
 * @attr {string} home-href - When set, the brand becomes a single self-link to this anchor (page-top only; sanitized)
 *
 * @slot - The capture body: a <dvfy-optin> (capture page) or a <dvfy-thank-you> (thank-you page).
 * @slot footer - Non-nav fine print (©, legal). Renders a <footer> landmark.
 *
 * @cssprop {color} --dvfy-surface-page - Page background
 * @cssprop {color} --dvfy-nav-bg - Brand-bar background (default: var(--dvfy-surface-raised))
 * @cssprop {color} --dvfy-nav-border - Brand-bar bottom border (default: var(--dvfy-border-default))
 * @cssprop {color} --dvfy-nav-brand-text - Brand text color (default: var(--dvfy-text-primary))
 * @cssprop {length} --dvfy-nav-height - Brand-bar min height (default: 3.5rem)
 *
 * @example
 * <dvfy-chum-page brand="Renting Ideal" home-href="#top">
 *   <dvfy-thank-you subhead="Revisa tu correo: te hemos enviado la guía."></dvfy-thank-you>
 * </dvfy-chum-page>
 */
class DvfyChumPage extends HTMLElement {
  static #BLOCK = 'dvfy-chum-page';

  static get observedAttributes() { return ['brand', 'logo', 'home-href']; }

  #built = false;

  connectedCallback() {
    injectStyles(DvfyChumPage.#BLOCK, noNavShellStyles(DvfyChumPage.#BLOCK));
    this.#build();
  }

  attributeChangedCallback() {
    // Rebuild from the canonical slotted content if already built.
    if (this.isConnected && this.#built) {
      rebuildNoNavShell(this, this.#opts());
    }
  }

  #opts() {
    return {
      block: DvfyChumPage.#BLOCK,
      brand: this.getAttribute('brand'),
      logo: this.getAttribute('logo'),
      homeHref: this.getAttribute('home-href'),
    };
  }

  #build() {
    if (buildNoNavShell(this, this.#opts())) this.#built = true;
  }
}

customElements.define('dvfy-chum-page', DvfyChumPage);
