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
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
dvfy-button[size="xs"] { padding: var(--dvfy-space-1) var(--dvfy-space-2); font-size: var(--dvfy-text-xs); border-radius: var(--dvfy-radius-sm); }
/* Size: sm */
dvfy-button[size="sm"] { padding: var(--dvfy-space-1-5) var(--dvfy-space-3); font-size: var(--dvfy-text-sm); border-radius: var(--dvfy-radius-md); }
/* Size: md (default) */
dvfy-button:not([size]), dvfy-button[size="md"] { padding: var(--dvfy-space-2) var(--dvfy-space-4); font-size: var(--dvfy-text-sm); border-radius: var(--dvfy-radius-lg); }
/* Size: lg */
dvfy-button[size="lg"] { padding: var(--dvfy-space-2-5) var(--dvfy-space-5); font-size: var(--dvfy-text-base); border-radius: var(--dvfy-radius-lg); }
/* Size: xl */
dvfy-button[size="xl"] { padding: var(--dvfy-space-3) var(--dvfy-space-6); font-size: var(--dvfy-text-lg); border-radius: var(--dvfy-radius-xl); }

/* Icon-only — square aspect ratio */
dvfy-button[icon] { aspect-ratio: 1; padding: var(--dvfy-space-2); }
dvfy-button[icon][size="xs"] { padding: var(--dvfy-space-1); }
dvfy-button[icon][size="sm"] { padding: var(--dvfy-space-1-5); }
dvfy-button[icon][size="lg"] { padding: var(--dvfy-space-2-5); }
dvfy-button[icon][size="xl"] { padding: var(--dvfy-space-3); }

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
 * @attr {string} href - When set, the button behaves as a link (role="link") and navigates on click/Enter
 * @attr {string} target - Link target for href navigation (e.g. "_blank"); only applies when href is set
 * @attr {string} rel - Link relationship for href navigation; defaults to "noopener noreferrer" when target="_blank"
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
  connectedCallback() {
    injectStyles('dvfy-button', STYLES);

    if (this.hasAttribute('from')) this.style.setProperty('--dvfy-btn-grad-from', this.getAttribute('from'));
    if (this.hasAttribute('to')) this.style.setProperty('--dvfy-btn-grad-to', this.getAttribute('to'));

    this.#syncRole();
    if (!this.getAttribute('tabindex') && !this.hasAttribute('disabled')) {
      this.setAttribute('tabindex', '0');
    }
    this.#syncAria();

    this.addEventListener('keydown', this.#onKey);
    this.addEventListener('click', this.#onClick);
  }

  disconnectedCallback() {
    this.removeEventListener('keydown', this.#onKey);
    this.removeEventListener('click', this.#onClick);
  }

  #onKey = (e) => {
    // Links activate on Enter only (native anchor semantics); buttons also on Space.
    const isLink = this.hasAttribute('href');
    if (e.key === 'Enter' || (!isLink && e.key === ' ')) {
      e.preventDefault();
      this.click();
    }
  };

  #onClick = (e) => {
    if (this.hasAttribute('disabled') || this.hasAttribute('loading')) return;

    // Link behavior takes precedence: navigate when href is present.
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

  static get observedAttributes() { return ['disabled', 'loading', 'from', 'to', 'href']; }

  attributeChangedCallback(name, _old, value) {
    if (name === 'disabled') {
      const disabled = this.hasAttribute('disabled');
      this.setAttribute('tabindex', disabled ? '-1' : '0');
      this.setAttribute('aria-disabled', String(disabled));
    }
    if (name === 'loading') {
      this.setAttribute('aria-busy', String(this.hasAttribute('loading')));
    }
    if (name === 'href') {
      this.#syncRole();
    }
    if (name === 'from') {
      this.style.setProperty('--dvfy-btn-grad-from', value ?? '');
    }
    if (name === 'to') {
      this.style.setProperty('--dvfy-btn-grad-to', value ?? '');
    }
  }

  #syncRole() {
    const role = this.hasAttribute('href') ? 'link' : 'button';
    // Respect an author-supplied role only if it isn't the one we manage.
    const current = this.getAttribute('role');
    if (current === 'link' || current === 'button' || current === null) {
      this.setAttribute('role', role);
    }
  }

  #syncAria() {
    if (this.hasAttribute('disabled')) this.setAttribute('aria-disabled', 'true');
    if (this.hasAttribute('loading')) this.setAttribute('aria-busy', 'true');
  }
}

customElements.define('dvfy-button', DvfyButton);
