import { injectStyles } from '../utils/styles.js';
import { sanitizeHref } from '../utils/url.js';
import './dvfy-input.js';
import './dvfy-select.js';
import './dvfy-button.js';

/**
 * <dvfy-optin> — Lead-magnet opt-in section (Widget stratum; domain: forms, role: capture).
 *
 * The self-contained body of a capture-funnel page: an eyebrow call-out, the narrow-problem
 * promise (heading), an optional supporting line, and a short email-first form with an
 * optional single qualifier field for lead-scoring. Drop it inside <dvfy-capture-page>.
 *
 * Form handling mirrors <dvfy-auth>: the fields are @devify/ui form Components styled via
 * tokens, submit dispatches a CustomEvent AND lets the native/HTMX submit proceed, and any
 * hx-* attributes on the element are copied onto the <form> for HTMX server posts.
 *
 * Field order is easy → hard (email first, qualifier after) per the nurture playbook.
 *
 * Attributes:
 *   eyebrow:            small call-out text above the heading (optional)
 *   heading:           main headline — the narrow-problem promise
 *   subhead:           supporting line under the heading (optional)
 *   action:            form action URL (where the form submits)
 *   method:            post | get (default: "post")
 *   email-label:       email field label (default: "Email")
 *   email-placeholder: email field placeholder (default: "you@example.com")
 *   cta:               submit button text (default: "Get instant access")
 *   qualifier-label:   if set, render ONE optional qualifier field for lead-scoring
 *   qualifier-name:    qualifier field name (default: "qualifier")
 *   qualifier-options: comma-separated → render a <dvfy-select>; absent + label set → text input
 *   qualifier-required: boolean — mark the qualifier field required
 *   trust:             small honest no-spam/trust microcopy under the button (optional)
 *   hx-*:              copied onto the <form> (HTMX passthrough)
 *
 * Events:
 *   optin-submit — { email, [qualifier], ... } form data as object (bubbles)
 *
 * Usage:
 *   <dvfy-optin
 *     eyebrow="Free guide"
 *     heading="Know your home's real energy score in 60 seconds"
 *     subhead="A plain-English report — no installer visit, no sales call."
 *     action="/capture" cta="Send me the guide"
 *     qualifier-label="Home type" qualifier-options="Flat, Terraced, Semi-detached, Detached"
 *     trust="One email with your guide. Unsubscribe anytime.">
 *   </dvfy-optin>
 */

const STYLES = `
dvfy-optin {
  display: block;
  width: 100%;
  box-sizing: border-box;
  container-type: inline-size;
  font-family: var(--dvfy-font-sans);
  color: var(--dvfy-text-primary);
}

.dvfy-optin__inner {
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

.dvfy-optin__eyebrow {
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-semibold);
  letter-spacing: var(--dvfy-tracking-wide);
  text-transform: uppercase;
  color: var(--dvfy-text-link);
  margin: 0;
}

.dvfy-optin__heading {
  font-family: var(--dvfy-font-brand);
  font-size: clamp(var(--dvfy-text-3xl), 6cqi, var(--dvfy-text-5xl));
  font-weight: var(--dvfy-weight-bold);
  line-height: var(--dvfy-leading-tight);
  color: var(--dvfy-text-primary);
  margin: 0;
  max-width: 20ch;
}

.dvfy-optin__subhead {
  font-size: var(--dvfy-text-lg);
  line-height: var(--dvfy-leading-relaxed);
  color: var(--dvfy-text-secondary);
  margin: 0;
  max-width: 46ch;
}

.dvfy-optin__form {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-4);
  width: 100%;
  max-width: var(--dvfy-container-md);
  margin-inline: auto;
  text-align: left;
}

.dvfy-optin__submit {
  width: 100%;
  justify-content: center;
}

.dvfy-optin__trust {
  font-size: var(--dvfy-text-xs);
  line-height: var(--dvfy-leading-normal);
  color: var(--dvfy-text-muted);
  text-align: center;
  margin: 0;
}
`;

/**
 * Self-contained lead-magnet opt-in section carrying the whole capture-page body.
 *
 * @element dvfy-optin
 *
 * @attr {string} eyebrow - Small call-out text above the heading
 * @attr {string} heading - Main headline — the narrow-problem promise
 * @attr {string} subhead - Supporting line under the heading
 * @attr {string} action - Form action URL (where the form submits)
 * @attr {string} method - Form method: post | get (default: "post")
 * @attr {string} email-label - Email field label (default: "Email")
 * @attr {string} email-placeholder - Email field placeholder (default: "you@example.com")
 * @attr {string} cta - Submit button text (default: "Get instant access")
 * @attr {string} qualifier-label - If set, render one optional qualifier field for lead-scoring
 * @attr {string} qualifier-name - Qualifier field name (default: "qualifier")
 * @attr {string} qualifier-options - Comma-separated → render a dvfy-select; absent + label set → text input
 * @attr {boolean} qualifier-required - Mark the qualifier field required
 * @attr {string} trust - Small honest no-spam/trust microcopy under the button
 *
 * @event {CustomEvent} optin-submit - Form submitted, detail: { email, [qualifier], ... }
 *
 * @cssprop {color} --dvfy-text-link - Eyebrow color
 * @cssprop {color} --dvfy-text-primary - Heading color
 * @cssprop {color} --dvfy-text-secondary - Subhead color
 *
 * @example
 * <dvfy-optin heading="Get the free checklist" action="/capture" cta="Send it to me"></dvfy-optin>
 */
class DvfyOptin extends HTMLElement {
  #pendingRender = false;
  #initialized = false;
  #hasCustomAriaLabel = false;

  static get observedAttributes() {
    return ['eyebrow', 'heading', 'subhead', 'action', 'method',
            'email-label', 'email-placeholder', 'cta',
            'qualifier-label', 'qualifier-name', 'qualifier-options', 'qualifier-required',
            'trust'];
  }

  connectedCallback() {
    injectStyles('dvfy-optin', STYLES);
    this.setAttribute('role', 'form');
    // Remember an author-supplied accessible name so re-renders never clobber it.
    this.#hasCustomAriaLabel = this.hasAttribute('aria-label');
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

  /** Normalized form method — get|post (invalid/empty → post). */
  #method() {
    return this.#attr('method').toLowerCase() === 'get' ? 'get' : 'post';
  }

  #render() {
    this.textContent = '';

    const inner = document.createElement('div');
    inner.className = 'dvfy-optin__inner';

    const eyebrow = this.#attr('eyebrow');
    if (eyebrow) {
      const el = document.createElement('p');
      el.className = 'dvfy-optin__eyebrow';
      el.textContent = eyebrow;
      inner.appendChild(el);
    }

    const heading = this.#attr('heading');
    if (heading) {
      const h = document.createElement('h2');
      h.className = 'dvfy-optin__heading';
      h.textContent = heading;
      inner.appendChild(h);
    }

    const subhead = this.#attr('subhead');
    if (subhead) {
      const p = document.createElement('p');
      p.className = 'dvfy-optin__subhead';
      p.textContent = subhead;
      inner.appendChild(p);
    }

    inner.appendChild(this.#buildForm());
    this.appendChild(inner);

    // a11y: mark the email field for browser autofill (dvfy-input has no autocomplete
    // passthrough, so patch the inner native input once it is connected + built).
    const emailInput = this.querySelector('.dvfy-optin__email input');
    if (emailInput) emailInput.setAttribute('autocomplete', 'email');

    // Default the accessible name to the promise — but never override an author-set one.
    if (!this.#hasCustomAriaLabel) this.setAttribute('aria-label', heading || 'Sign up');
  }

  #buildForm() {
    const form = document.createElement('form');
    form.className = 'dvfy-optin__form';
    form.action = sanitizeHref(this.#attr('action'));
    form.method = this.#method();
    this.#copyHxAttrs(form);
    form.addEventListener('submit', e => this.#handleSubmit(e, form));

    // Email — first (easy field), required, typed for native validation.
    const email = document.createElement('dvfy-input');
    email.className = 'dvfy-optin__field dvfy-optin__email';
    email.setAttribute('label', this.#attr('email-label') || 'Email');
    email.setAttribute('type', 'email');
    email.setAttribute('name', 'email');
    email.setAttribute('placeholder', this.#attr('email-placeholder') || 'you@example.com');
    email.setAttribute('required', '');
    form.appendChild(email);

    // Optional qualifier — after email (harder field), for lead-scoring.
    const qualifier = this.#buildQualifier();
    if (qualifier) form.appendChild(qualifier);

    // Submit — the single primary action.
    const btn = document.createElement('dvfy-button');
    btn.className = 'dvfy-optin__submit';
    btn.setAttribute('type', 'submit');
    btn.setAttribute('variant', 'primary');
    btn.setAttribute('size', 'lg');
    btn.textContent = this.#attr('cta') || 'Get instant access';
    form.appendChild(btn);

    // Honest trust microcopy.
    const trust = this.#attr('trust');
    if (trust) {
      const t = document.createElement('p');
      t.className = 'dvfy-optin__trust';
      t.textContent = trust;
      form.appendChild(t);
    }

    return form;
  }

  /** Build the optional single qualifier field. Returns null when no qualifier-label is set. */
  #buildQualifier() {
    const label = this.#attr('qualifier-label');
    if (!label) return null;

    const name = this.#attr('qualifier-name') || 'qualifier';
    const required = this.hasAttribute('qualifier-required');
    const optionsRaw = this.#attr('qualifier-options');
    const options = optionsRaw
      ? optionsRaw.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    if (options.length) {
      // Choice qualifier → dvfy-select (emits a native named <select> for form submission).
      const select = document.createElement('dvfy-select');
      select.className = 'dvfy-optin__field dvfy-optin__qualifier';
      select.setAttribute('label', label);
      select.setAttribute('name', name);
      if (required) select.setAttribute('required', '');
      for (const value of options) {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = value;
        select.appendChild(opt);
      }
      return select;
    }

    // Free-text qualifier → dvfy-input.
    const input = document.createElement('dvfy-input');
    input.className = 'dvfy-optin__field dvfy-optin__qualifier';
    input.setAttribute('label', label);
    input.setAttribute('type', 'text');
    input.setAttribute('name', name);
    if (required) input.setAttribute('required', '');
    return input;
  }

  #handleSubmit(e, form) {
    // Mirror <dvfy-auth>: dispatch the data event for JS consumers and let the native /
    // HTMX submission proceed (the server, or hx-*, handles the actual post).
    const data = Object.fromEntries(new FormData(form));
    this.dispatchEvent(new CustomEvent('optin-submit', {
      detail: data,
      bubbles: true,
    }));
  }

  #copyHxAttrs(form) {
    for (const attr of this.attributes) {
      if (attr.name.startsWith('hx-')) {
        form.setAttribute(attr.name, attr.value);
      }
    }
  }
}

customElements.define('dvfy-optin', DvfyOptin);
