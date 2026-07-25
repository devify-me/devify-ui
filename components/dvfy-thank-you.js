import { injectStyles } from '../utils/styles.js';
import { sanitizeHref, sanitizeSrc } from '../utils/url.js';
import './dvfy-avatar.js';
import './dvfy-button.js';

/**
 * <dvfy-thank-you> — Post-opt-in confirmation section (Widget stratum; domain: feedback,
 * role: confirmation).
 *
 * The body of a capture funnel's thank-you page: it confirms the opt-in and gives the ONE
 * next-step instruction (e.g. "check your inbox"). An optional human-face avatar warms the
 * message; an optional CTA button is the scheduler-READY slot (the scheduler itself is
 * deferred — this only provides the link seam). The default slot is preserved for future
 * embedded content (e.g. an inline scheduler) placed AFTER the next-step copy.
 *
 * Attributes:
 *   heading:       confirmation headline (default: "You're in.")
 *   heading-level: heading tag — h1 | h2 | h3 (default: "h1"; it carries the thank-you
 *                  page's primary heading, so it IS the page <h1> unless dropped to h2/h3)
 *   subhead:       the next-step instruction (optional)
 *   avatar:     human-face image URL (optional)
 *   avatar-alt: alt text for the avatar image (optional)
 *   cta:        CTA button text (optional)
 *   cta-href:   CTA link — the scheduler-ready slot (optional; sanitized)
 *   note:       small secondary line (optional)
 *
 * Usage:
 *   <dvfy-thank-you
 *     heading="You're in — check your inbox"
 *     subhead="We just emailed your energy checklist. It lands within a minute."
 *     avatar="/team/ana.jpg" avatar-alt="Ana, your advisor"
 *     note="Not there? Check spam, or reply and we'll resend.">
 *   </dvfy-thank-you>
 */

const STYLES = `
dvfy-thank-you {
  display: block;
  width: 100%;
  box-sizing: border-box;
  container-type: inline-size;
  font-family: var(--dvfy-font-sans);
  color: var(--dvfy-text-primary);
}

.dvfy-thank-you__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dvfy-space-5);
  width: 100%;
  max-width: var(--dvfy-container-2xl);
  margin-inline: auto;
  padding-block: clamp(var(--dvfy-space-10), 8cqi, var(--dvfy-space-24));
  padding-inline: var(--dvfy-space-5);
  text-align: center;
  box-sizing: border-box;
}

.dvfy-thank-you__heading {
  font-family: var(--dvfy-font-brand);
  font-size: clamp(var(--dvfy-text-3xl), 6cqi, var(--dvfy-text-5xl));
  font-weight: var(--dvfy-weight-bold);
  line-height: var(--dvfy-leading-tight);
  color: var(--dvfy-text-primary);
  margin: 0;
  max-width: 20ch;
}

.dvfy-thank-you__subhead {
  font-size: var(--dvfy-text-lg);
  line-height: var(--dvfy-leading-relaxed);
  color: var(--dvfy-text-secondary);
  margin: 0;
  max-width: 46ch;
}

.dvfy-thank-you__slot {
  width: 100%;
}
.dvfy-thank-you__slot:empty { display: none; }

.dvfy-thank-you__cta {
  justify-content: center;
}

.dvfy-thank-you__note {
  font-size: var(--dvfy-text-sm);
  line-height: var(--dvfy-leading-normal);
  color: var(--dvfy-text-muted);
  margin: 0;
  max-width: 46ch;
}
`;

/**
 * Post-opt-in confirmation section with a next-step instruction and a scheduler-ready CTA slot.
 *
 * @element dvfy-thank-you
 *
 * @attr {string} heading - Confirmation headline (default: "You're in.")
 * @attr {"h1"|"h2"|"h3"} heading-level - Heading tag (default: "h1" — the widget owns the page's single primary heading on a chum thank-you page)
 * @attr {string} subhead - The next-step instruction
 * @attr {string} avatar - Human-face image URL
 * @attr {string} avatar-alt - Alt text for the avatar image
 * @attr {string} cta - CTA button text
 * @attr {string} cta-href - CTA link — the scheduler-ready slot (sanitized)
 * @attr {string} note - Small secondary line
 *
 * @slot - Future embedded content (e.g. an inline scheduler), placed after the next-step copy.
 *
 * @cssprop {color} --dvfy-text-primary - Heading color
 * @cssprop {color} --dvfy-text-secondary - Subhead color
 * @cssprop {color} --dvfy-text-muted - Note color
 *
 * @example
 * <dvfy-thank-you subhead="Check your inbox — your guide is on the way."></dvfy-thank-you>
 */
class DvfyThankYou extends HTMLElement {
  #pendingRender = false;
  #initialized = false;
  #captured = false;
  /** @type {Node[]} authored default-slot children, preserved across re-renders */
  #slotNodes = [];

  static get observedAttributes() {
    return ['heading', 'heading-level', 'subhead', 'avatar', 'avatar-alt', 'cta', 'cta-href', 'note'];
  }

  connectedCallback() {
    injectStyles('dvfy-thank-you', STYLES);
    // Capture authored slot content ONCE (before the first build wraps it).
    if (!this.#captured) {
      this.#slotNodes = Array.from(this.childNodes);
      this.#captured = true;
    }
    this.#render();
    this.#initialized = true;
  }

  attributeChangedCallback() {
    if (!this.isConnected) return;
    if (!this.#initialized) return;
    this.#scheduleRender();
  }

  #scheduleRender() {
    if (this.#pendingRender) return;
    this.#pendingRender = true;
    queueMicrotask(() => {
      this.#pendingRender = false;
      this.#render();
      this.#initialized = true;
    });
  }

  #attr(name) { return this.getAttribute(name) || ''; }

  /**
   * Resolved heading tag — h1|h2|h3, defaulting to h1 (invalid/empty → h1).
   * On a chum thank-you page this widget carries the page's primary heading, so it IS the
   * page <h1> by default; an author drops the level only when it isn't the top heading.
   */
  #headingTag() {
    const lvl = this.#attr('heading-level').toLowerCase();
    return ['h1', 'h2', 'h3'].includes(lvl) ? lvl : 'h1';
  }

  #render() {
    // Detach the preserved slot nodes so clearing generated DOM never destroys them.
    for (const node of this.#slotNodes) {
      if (node.parentNode) node.parentNode.removeChild(node);
    }
    this.textContent = '';

    const inner = document.createElement('div');
    inner.className = 'dvfy-thank-you__inner';

    const avatar = this.#attr('avatar');
    if (avatar) {
      const av = document.createElement('dvfy-avatar');
      av.className = 'dvfy-thank-you__avatar';
      av.setAttribute('src', sanitizeSrc(avatar));
      av.setAttribute('size', 'lg');
      const alt = this.#attr('avatar-alt');
      if (alt) av.setAttribute('name', alt);
      inner.appendChild(av);
    }

    const h = document.createElement(this.#headingTag());
    h.className = 'dvfy-thank-you__heading';
    h.textContent = this.#attr('heading') || "You're in.";
    inner.appendChild(h);

    const subhead = this.#attr('subhead');
    if (subhead) {
      const p = document.createElement('p');
      p.className = 'dvfy-thank-you__subhead';
      p.textContent = subhead;
      inner.appendChild(p);
    }

    // Default slot — preserved authored content (e.g. a future inline scheduler).
    const slot = document.createElement('div');
    slot.className = 'dvfy-thank-you__slot';
    for (const node of this.#slotNodes) slot.appendChild(node);
    inner.appendChild(slot);

    // Optional CTA — the scheduler-ready link seam.
    const cta = this.#attr('cta');
    if (cta) {
      const btn = document.createElement('dvfy-button');
      btn.className = 'dvfy-thank-you__cta';
      btn.setAttribute('variant', 'primary');
      btn.setAttribute('size', 'lg');
      const href = this.#attr('cta-href');
      if (href) btn.setAttribute('href', sanitizeHref(href));
      btn.textContent = cta;
      inner.appendChild(btn);
    }

    const note = this.#attr('note');
    if (note) {
      const n = document.createElement('p');
      n.className = 'dvfy-thank-you__note';
      n.textContent = note;
      inner.appendChild(n);
    }

    this.appendChild(inner);
  }
}

customElements.define('dvfy-thank-you', DvfyThankYou);
