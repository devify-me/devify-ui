import { injectStyles } from '../utils/styles.js';
import { sanitizeHref } from '../utils/url.js';

/* <dvfy-button> — Button component */

const STYLES = `
@property --dvfy-btn-grad-from {
  syntax: "<color>";
  inherits: false;
  initial-value: #7c3aed; /* allow-hardcoded: CSS spec @property initial-value must be a literal color */
}
@property --dvfy-btn-grad-to {
  syntax: "<color>";
  inherits: false;
  initial-value: #2563eb; /* allow-hardcoded: CSS spec @property initial-value must be a literal color */
}
@property --dvfy-btn-grad-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 135deg;
}

dvfy-button {
  /* Padding lives in custom properties so that, when an href renders a real inner
     <a>, the anchor can own the padding box and the whole button surface is a link. */
  --dvfy-btn-pad-y: var(--dvfy-space-2);
  --dvfy-btn-pad-x: var(--dvfy-space-4);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--dvfy-btn-pad-y) var(--dvfy-btn-pad-x);
  gap: var(--dvfy-space-2);
  font-family: var(--dvfy-font-sans);
  font-weight: var(--dvfy-weight-medium);
  line-height: var(--dvfy-leading-tight);
  border: var(--dvfy-border-1) solid transparent;
  cursor: pointer;
  transition: all var(--dvfy-duration-fast) var(--dvfy-ease-out);
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
}

/* Size: xs */
dvfy-button[size="xs"] { --dvfy-btn-pad-y: var(--dvfy-space-1); --dvfy-btn-pad-x: var(--dvfy-space-2); font-size: var(--dvfy-text-xs); border-radius: var(--dvfy-radius-sm); }
/* Size: sm */
dvfy-button[size="sm"] { --dvfy-btn-pad-y: var(--dvfy-space-1-5); --dvfy-btn-pad-x: var(--dvfy-space-3); font-size: var(--dvfy-text-sm); border-radius: var(--dvfy-radius-md); }
/* Size: md (default) */
dvfy-button:not([size]), dvfy-button[size="md"] { --dvfy-btn-pad-y: var(--dvfy-space-2); --dvfy-btn-pad-x: var(--dvfy-space-4); font-size: var(--dvfy-text-sm); border-radius: var(--dvfy-radius-lg); }
/* Size: lg */
dvfy-button[size="lg"] { --dvfy-btn-pad-y: var(--dvfy-space-2-5); --dvfy-btn-pad-x: var(--dvfy-space-5); font-size: var(--dvfy-text-base); border-radius: var(--dvfy-radius-lg); }
/* Size: xl */
dvfy-button[size="xl"] { --dvfy-btn-pad-y: var(--dvfy-space-3); --dvfy-btn-pad-x: var(--dvfy-space-6); font-size: var(--dvfy-text-lg); border-radius: var(--dvfy-radius-xl); }

/* Icon-only — square aspect ratio */
dvfy-button[icon] { aspect-ratio: 1; --dvfy-btn-pad-y: var(--dvfy-space-2); --dvfy-btn-pad-x: var(--dvfy-space-2); }
dvfy-button[icon][size="xs"] { --dvfy-btn-pad-y: var(--dvfy-space-1); --dvfy-btn-pad-x: var(--dvfy-space-1); }
dvfy-button[icon][size="sm"] { --dvfy-btn-pad-y: var(--dvfy-space-1-5); --dvfy-btn-pad-x: var(--dvfy-space-1-5); }
dvfy-button[icon][size="lg"] { --dvfy-btn-pad-y: var(--dvfy-space-2-5); --dvfy-btn-pad-x: var(--dvfy-space-2-5); }
dvfy-button[icon][size="xl"] { --dvfy-btn-pad-y: var(--dvfy-space-3); --dvfy-btn-pad-x: var(--dvfy-space-3); }

/* Link mode — a real <a> owns the whole padding box, so every pixel of the button is a
   genuine anchor: crawlable, cmd/middle-clickable, and boostable by htmx. The host keeps
   the visual chrome (background, border, radius) and gives its padding to the anchor. */
dvfy-button[href] { padding: 0; }
dvfy-button > a.dvfy-button__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  flex: 1 1 auto;
  min-width: 0;
  gap: inherit;
  padding: var(--dvfy-btn-pad-y) var(--dvfy-btn-pad-x);
  font: inherit;
  color: inherit;
  text-decoration: none;
  border-radius: inherit;
}
dvfy-button > a.dvfy-button__link:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}

/* Primary variant (default when no variant specified) — high specificity to resist overrides */
dvfy-button:not([variant]), dvfy-button[variant="primary"] {
  background: var(--dvfy-primary-bg);
  color: var(--dvfy-primary-text);
  border-color: var(--dvfy-primary-bg);
}
dvfy-button:not([variant]):hover:not([disabled]):not([loading]),
dvfy-button[variant="primary"]:hover:not([disabled]):not([loading]) {
  background: var(--dvfy-primary-bg-hover) !important;
  border-color: var(--dvfy-primary-bg-hover) !important;
}
dvfy-button:not([variant]):active:not([disabled]):not([loading]),
dvfy-button[variant="primary"]:active:not([disabled]):not([loading]) {
  background: var(--dvfy-primary-bg-active) !important;
}

/* Subtle */
dvfy-button[variant="subtle"] {
  background: var(--dvfy-primary-bg-subtle);
  color: var(--dvfy-text-link);
  border-color: transparent;
}
dvfy-button[variant="subtle"]:hover:not([disabled]):not([loading]) { background: var(--dvfy-hover-bg); }

/* Outline */
dvfy-button[variant="outline"] {
  background: transparent;
  color: var(--dvfy-text-primary);
  border-color: var(--dvfy-border-default);
}
dvfy-button[variant="outline"]:hover:not([disabled]):not([loading]) { background: var(--dvfy-hover-bg); border-color: var(--dvfy-border-strong); }

/* Ghost */
dvfy-button[variant="ghost"] {
  background: transparent;
  color: var(--dvfy-text-secondary);
  border-color: transparent;
}
dvfy-button[variant="ghost"]:hover:not([disabled]):not([loading]) { background: var(--dvfy-hover-bg); color: var(--dvfy-text-primary); }

/* Gradient */
dvfy-button[variant="gradient"] {
  background: linear-gradient(var(--dvfy-btn-grad-angle), var(--dvfy-btn-grad-from), var(--dvfy-btn-grad-to));
  color: var(--dvfy-text-inverse);
  border-color: transparent;
  transition:
    --dvfy-btn-grad-from var(--dvfy-duration-normal) var(--dvfy-ease-out),
    --dvfy-btn-grad-to var(--dvfy-duration-normal) var(--dvfy-ease-out),
    --dvfy-btn-grad-angle var(--dvfy-duration-normal) var(--dvfy-ease-out);
}
dvfy-button[variant="gradient"]:hover:not([disabled]):not([loading]) {
  animation: dvfy-gradient-spin 3s linear infinite;
}
@keyframes dvfy-gradient-spin {
  from { --dvfy-btn-grad-angle: 135deg; }
  to   { --dvfy-btn-grad-angle: 495deg; }
}

/* Danger */
dvfy-button[variant="danger"] {
  background: var(--dvfy-danger-bg);
  color: var(--dvfy-text-inverse);
  border-color: var(--dvfy-danger-bg);
}
dvfy-button[variant="danger"]:hover:not([disabled]):not([loading]) { opacity: 0.9; }

/* States */
dvfy-button:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}
dvfy-button[disabled] {
  background: var(--dvfy-disabled-bg);
  color: var(--dvfy-text-muted);
  border-color: var(--dvfy-border-default);
  cursor: not-allowed;
  pointer-events: none;
}
dvfy-button[loading] {
  position: relative;
  color: transparent;
  pointer-events: none;
}
dvfy-button[loading]::after {
  content: '';
  position: absolute;
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: var(--dvfy-radius-round);
  animation: dvfy-spin 0.6s linear infinite;
  color: var(--dvfy-text-muted);
}
@keyframes dvfy-spin { to { transform: rotate(360deg); } }
`;

/**
 * Button component with multiple variants and sizes.
 *
 * @element dvfy-button
 *
 * @attr {string} variant - Button style: primary | subtle | outline | ghost | danger | gradient (default: "primary")
 * @attr {string} size - Size: xs | sm | md | lg | xl (default: "md")
 * @attr {boolean} icon - Icon-only mode with square aspect ratio
 * @attr {boolean} disabled - Disable button and prevent interaction
 * @attr {boolean} loading - Show loading state with spinner indicator
 * @attr {string} type - HTML button type: button | submit | reset (default: "button")
 * @attr {string} href - When set, the button renders a REAL inner `<a href>` (crawlable, cmd-clickable, hx-boostable) that fills the button box
 * @attr {string} target - Link target, passed through to the anchor (e.g. "_blank"); only applies when href is set
 * @attr {string} rel - Link relationship, passed through to the anchor; defaults to "noopener noreferrer" when target="_blank"
 * @attr {string} from - Gradient start color for variant="gradient" (default: "#7c3aed")
 * @attr {string} to - Gradient end color for variant="gradient" (default: "#2563eb")
 *
 * @cssprop {color} --dvfy-primary-bg - Primary background color
 * @cssprop {color} --dvfy-primary-text - Primary text color
 * @slot - Button label content
 *
 * @cssprop {color} --dvfy-danger-bg - Danger variant background
 */
class DvfyButton extends HTMLElement {
  /** The real <a> rendered for `href` mode (null when the button is not a link). */
  #anchor = null;

  /** Watches for label content appended after upgrade so it lands inside the anchor. */
  #childWatcher = null;

  connectedCallback() {
    injectStyles('dvfy-button', STYLES);

    if (this.hasAttribute('from')) this.style.setProperty('--dvfy-btn-grad-from', this.getAttribute('from'));
    if (this.hasAttribute('to')) this.style.setProperty('--dvfy-btn-grad-to', this.getAttribute('to'));

    this.#syncLink();
    this.#syncAria();

    this.addEventListener('keydown', this.#onKey);
    this.addEventListener('click', this.#onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.#onKey);
    this.removeEventListener('click', this.#onClick);
    this.#childWatcher?.disconnect();
    this.#childWatcher = null;
  }

  /** True when the event originated on (or inside) the rendered anchor, i.e. the browser
   *  is already doing the navigation natively and the JS path must stay out of the way. */
  #fromAnchor(e) {
    const a = this.#anchor;
    return !!a && !!e?.target && (e.target === a || (e.target.nodeType === 1 && a.contains(e.target)));
  }

  #onKey = (e) => {
    // A real anchor handles its own Enter; intervening would double-navigate and would
    // also swallow the modifier keys the browser uses for "open in new tab/window".
    if (this.#fromAnchor(e)) return;

    // Links activate on Enter only (native anchor semantics); buttons also on Space.
    const isLink = this.hasAttribute('href');
    if (e.key === 'Enter' || (!isLink && e.key === ' ')) {
      e.preventDefault();
      this.click();
    }
  };

  #onClick = (e) => {
    if (this.hasAttribute('disabled') || this.hasAttribute('loading')) return;

    // The anchor is a real link: let the browser own the click. This is what preserves
    // cmd/middle-click, "open in new tab", and hx-boost interception.
    if (this.#fromAnchor(e)) return;

    // Fallback for a click on the host itself (a programmatic .click(), or the 1px border
    // ring the anchor does not cover, or a consumer that tore the anchor out of the DOM).
    if (this.hasAttribute('href')) {
      this.#navigateFromHref(e);
      return;
    }

    const type = this.getAttribute('type');
    if (!type || type === 'button') return;
    const form = this.closest('form');
    if (!form) return;
    if (type === 'submit') form.requestSubmit();
    else if (type === 'reset') form.reset();
  };

  #navigateFromHref(e) {
    const url = sanitizeHref(this.getAttribute('href'));
    const target = this.getAttribute('target');
    if (target === '_blank') {
      // Safe defaults: opener-isolated + no referrer unless the author overrides rel.
      const features = this.getAttribute('rel') || 'noopener noreferrer';
      this._openTab(url, features);
    } else {
      this._navigate(url);
    }
    // A synthetic .click() has no default to prevent; guard for real events.
    e?.preventDefault?.();
  }

  // Overridable seams (kept on the instance so tests can stub navigation).
  _navigate(url) { window.location.assign(url); }
  _openTab(url, features) { window.open(url, '_blank', features); }

  static get observedAttributes() { return ['disabled', 'loading', 'from', 'to', 'href', 'target', 'rel']; }

  attributeChangedCallback(name, _old, value) {
    if (name === 'disabled') {
      const disabled = this.hasAttribute('disabled');
      this.setAttribute('aria-disabled', String(disabled));
      // In link mode the anchor is the tab stop, so the host stays out of the tab order.
      if (!this.hasAttribute('href')) this.setAttribute('tabindex', disabled ? '-1' : '0');
    }
    if (name === 'loading') {
      this.setAttribute('aria-busy', String(this.hasAttribute('loading')));
    }
    if (name === 'from') {
      this.style.setProperty('--dvfy-btn-grad-from', value ?? '');
    }
    if (name === 'to') {
      this.style.setProperty('--dvfy-btn-grad-to', value ?? '');
    }
    // Anchor presence and the host's own focusability both depend on href + inert state.
    if (this.isConnected && ['href', 'target', 'rel', 'disabled', 'loading'].includes(name)) {
      this.#syncLink();
    }
  }

  // ── Link mode ───────────────────────────────────────────────────────────────
  // `href` renders a REAL <a> instead of faking one with role="link" +
  // location.assign(). A fake link is invisible to crawlers (the page ships no link
  // graph at all), swallows every modifier click, and bypasses hx-boost. See #408.

  #syncLink() {
    if (this.hasAttribute('href')) this.#renderAnchor(); else this.#removeAnchor();
    this.#syncHostFocus();
  }

  #renderAnchor() {
    let a = this.#anchor;
    if (!a || a.parentNode !== this) {
      a = document.createElement('a');
      a.className = 'dvfy-button__link';
      // MOVE the label (never clone) so nodes, listeners and IDs survive intact.
      while (this.firstChild) a.appendChild(this.firstChild);
      this.appendChild(a);
      this.#anchor = a;
      this.#watchChildren();
    }
    this.#syncAnchorAttrs();
  }

  #syncAnchorAttrs() {
    const a = this.#anchor;
    if (!a) return;

    // disabled/loading must not leave a navigable, focusable link behind.
    if (this.hasAttribute('disabled') || this.hasAttribute('loading')) {
      a.removeAttribute('href');
      a.removeAttribute('target');
      a.removeAttribute('rel');
      a.setAttribute('aria-disabled', 'true');
      return;
    }
    a.removeAttribute('aria-disabled');
    a.setAttribute('href', sanitizeHref(this.getAttribute('href')));

    const target = this.getAttribute('target');
    if (target) a.setAttribute('target', target); else a.removeAttribute('target');

    // Safe default for _blank: opener-isolated + no referrer unless the author overrides.
    const rel = this.getAttribute('rel') || (target === '_blank' ? 'noopener noreferrer' : null);
    if (rel) a.setAttribute('rel', rel); else a.removeAttribute('rel');
  }

  #removeAnchor() {
    const a = this.#anchor;
    if (a && a.parentNode === this) {
      while (a.firstChild) this.insertBefore(a.firstChild, a);
      a.remove();
    }
    this.#anchor = null;
    this.#childWatcher?.disconnect();
    this.#childWatcher = null;
  }

  /** Consumers commonly set `.textContent` after appending the element. Re-home any stray
   *  direct child into the anchor (and rebuild the anchor if it was wiped) so the link
   *  never silently loses its text — which would leave an anchor with no accessible name. */
  #watchChildren() {
    if (this.#childWatcher) return;
    this.#childWatcher = new MutationObserver(() => {
      if (!this.hasAttribute('href')) return;
      this.#childWatcher.disconnect();
      try {
        this.#renderAnchor();
        for (const node of [...this.childNodes]) {
          if (node !== this.#anchor) this.#anchor.appendChild(node);
        }
      } finally {
        if (this.#childWatcher) this.#childWatcher.observe(this, { childList: true });
      }
    });
    this.#childWatcher.observe(this, { childList: true });
  }

  /** The anchor is the interactive element in link mode, so the host must NOT be a second
   *  tab stop or a second `link` in the a11y tree (axe: nested-interactive). */
  #syncHostFocus() {
    const managedRole = r => r === 'link' || r === 'button' || r === null;
    if (this.#anchor) {
      if (managedRole(this.getAttribute('role'))) this.removeAttribute('role');
      const t = this.getAttribute('tabindex');
      if (t === '0' || t === '-1') this.removeAttribute('tabindex');
      return;
    }
    if (managedRole(this.getAttribute('role'))) this.setAttribute('role', 'button');
    // Respect an author-supplied tabindex (e.g. -1 on decorative in-field toggles).
    if (!this.getAttribute('tabindex')) {
      this.setAttribute('tabindex', this.hasAttribute('disabled') ? '-1' : '0');
    }
  }

  #syncAria() {
    if (this.hasAttribute('disabled')) this.setAttribute('aria-disabled', 'true');
    if (this.hasAttribute('loading')) this.setAttribute('aria-busy', 'true');
  }
}

customElements.define('dvfy-button', DvfyButton);
