import { sanitizeHref, sanitizeSrc } from '../utils/url.js';
import { injectStyles } from '../utils/styles.js';

/**
 * <dvfy-auth> — Authentication forms (sign-in, sign-up)
 *
 * Attributes:
 *   mode:         signin | signup (default: "signin")
 *   action:       form action URL
 *   method:       form method (default: "post")
 *   brand:        brand name text (hidden when logo is present)
 *   logo:         logo image URL (shown instead of brand text)
 *   modal:        boolean — wraps form in a modal (use with trigger button)
 *   forgot-url:   "Forgot password?" link URL
 *   signup-url:   "Create account" link URL (sign-in mode)
 *   signin-url:   "Already have an account?" link URL (sign-up mode)
 *   oauth-google: Google OAuth URL
 *   oauth-github: GitHub OAuth URL
 *
 * Events:
 *   auth-submit — { email, password, ... } form data as object
 *
 * Modal usage:
 *   <dvfy-auth mode="signin" modal action="/auth/login" logo="/logo.svg">
 *   </dvfy-auth>
 *   <!-- Opens via: document.querySelector('dvfy-auth').open() -->
 *
 * Usage:
 *   <dvfy-auth mode="signin" action="/auth/login" brand="Devify"
 *     logo="/logo.svg" forgot-url="/forgot" signup-url="/register"
 *     oauth-google="/auth/google" oauth-github="/auth/github">
 *   </dvfy-auth>
 */

const STYLES = `
.dvfy-auth {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--dvfy-space-4);
  font-family: var(--dvfy-font-sans);
  box-sizing: border-box;
}

.dvfy-auth__card {
  width: 100%;
  max-width: 24rem;
  background: var(--dvfy-elevation-lg-bg);
  border: 1px solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-xl);
  padding: var(--dvfy-space-8) var(--dvfy-space-6);
  box-shadow: var(--dvfy-shadow-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--dvfy-space-5);
  box-sizing: border-box;
}

.dvfy-auth__logo {
  max-width: 60%;
  max-height: 5rem;
  object-fit: contain;
}
.dvfy-auth__logo--hz {
  max-width: 80%;
}

.dvfy-auth__brand {
  font-size: var(--dvfy-text-xl);
  font-weight: var(--dvfy-weight-bold);
  color: var(--dvfy-text-primary);
  text-align: center;
  margin: 0;
}

.dvfy-auth__form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-4);
}

.dvfy-auth__field {
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-1-5);
}
.dvfy-auth__field label {
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  color: var(--dvfy-text-primary);
}
.dvfy-auth__input {
  width: 100%;
  font-family: inherit;
  font-size: var(--dvfy-text-sm);
  padding: var(--dvfy-space-2) var(--dvfy-space-3);
  color: var(--dvfy-text-primary);
  background: var(--dvfy-surface-page);
  border: 1px solid var(--dvfy-border-default);
  border-radius: var(--dvfy-radius-lg);
  outline: none;
  box-sizing: border-box;
  transition: border-color var(--dvfy-duration-fast) var(--dvfy-ease-out),
              box-shadow var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
.dvfy-auth__input::placeholder { color: var(--dvfy-text-muted); }
.dvfy-auth__input:hover { border-color: var(--dvfy-border-strong); }
.dvfy-auth__input:focus {
  border-color: var(--dvfy-border-focus);
  box-shadow: 0 0 0 var(--dvfy-ring-width) color-mix(in srgb, var(--dvfy-ring-color) 25%, transparent);
}

.dvfy-auth__forgot {
  align-self: flex-end;
  margin-top: calc(-1 * var(--dvfy-space-2));
}

.dvfy-auth__btn {
  width: 100%;
  font-family: inherit;
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-semibold);
  padding: var(--dvfy-space-2-5) var(--dvfy-space-4);
  border-radius: var(--dvfy-radius-lg);
  border: none;
  cursor: pointer;
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out);
  background: var(--dvfy-primary-bg);
  color: var(--dvfy-primary-text);
  box-sizing: border-box;
}
.dvfy-auth__btn:hover { background: var(--dvfy-primary-bg-hover, var(--dvfy-primary-hover)); }
.dvfy-auth__btn:active { background: var(--dvfy-primary-bg-active, var(--dvfy-primary-active)); }
.dvfy-auth__btn:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}

.dvfy-auth__divider {
  display: flex;
  align-items: center;
  gap: var(--dvfy-space-3);
  width: 100%;
  color: var(--dvfy-text-muted);
  font-size: var(--dvfy-text-xs);
}
.dvfy-auth__divider::before,
.dvfy-auth__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--dvfy-border-muted);
}

.dvfy-auth__oauth {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--dvfy-space-2-5);
}

.dvfy-auth__btn--oauth {
  width: 100%;
  font-family: inherit;
  font-size: var(--dvfy-text-sm);
  font-weight: var(--dvfy-weight-medium);
  padding: var(--dvfy-space-2) var(--dvfy-space-4);
  border-radius: var(--dvfy-radius-lg);
  border: 1px solid var(--dvfy-border-default);
  cursor: pointer;
  background: var(--dvfy-surface-page);
  color: var(--dvfy-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--dvfy-space-2);
  text-decoration: none;
  box-sizing: border-box;
  transition: background var(--dvfy-duration-fast) var(--dvfy-ease-out),
              border-color var(--dvfy-duration-fast) var(--dvfy-ease-out);
}
.dvfy-auth__btn--oauth:hover {
  background: var(--dvfy-hover-bg);
  border-color: var(--dvfy-border-strong);
}
.dvfy-auth__btn--oauth:focus-visible {
  outline: var(--dvfy-ring-width) solid var(--dvfy-ring-color);
  outline-offset: var(--dvfy-ring-offset);
}
.dvfy-auth__btn--oauth svg {
  width: 1.125rem;
  height: 1.125rem;
  flex-shrink: 0;
}

.dvfy-auth__link {
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-link);
  text-decoration: none;
  cursor: pointer;
}
.dvfy-auth__link:hover { text-decoration: underline; }

.dvfy-auth__footer {
  text-align: center;
  font-size: var(--dvfy-text-sm);
  color: var(--dvfy-text-secondary);
}

/* Modal variant — no min-height or centering, card has no shadow (modal provides it) */
.dvfy-auth--modal {
  min-height: auto;
  padding: 0;
}
.dvfy-auth--modal .dvfy-auth__card {
  box-shadow: none;
  border: none;
  padding: var(--dvfy-space-4) var(--dvfy-space-2);
}
`;

/**
 * Authentication forms with sign-in and sign-up modes, OAuth support, and optional modal wrapping.
 *
 * @element dvfy-auth
 *
 * @attr {string} mode - Form mode: signin | signup (default: "signin")
 * @attr {string} action - Form action URL
 * @attr {string} method - Form method (default: "post")
 * @attr {string} brand - Brand name text (hidden when logo is present)
 * @attr {string} logo - Logo image URL (shown instead of brand text)
 * @attr {boolean} modal - Wrap form in a modal dialog
 * @attr {string} forgot-url - "Forgot password?" link URL
 * @attr {string} signup-url - "Create account" link URL (sign-in mode)
 * @attr {string} signin-url - "Already have an account?" link URL (sign-up mode)
 * @attr {string} oauth-google - Google OAuth URL
 * @attr {string} oauth-github - GitHub OAuth URL
 *
 * @event {CustomEvent} auth-submit - Form submitted, detail: { email, password, ... }
 *
 * @cssprop {color} --dvfy-primary-bg - Primary button background
 * @cssprop {color} --dvfy-primary-text - Primary button text color
 * @cssprop {color} --dvfy-surface-raised - Card background
 */
class DvfyAuth extends HTMLElement {
  static #STRUCTURAL = new Set(['mode', 'modal']);

  #pendingRender = false;
  #initialized = false;

  static get observedAttributes() {
    return ['mode', 'action', 'method', 'brand', 'logo', 'modal', 'forgot-url',
            'signup-url', 'signin-url', 'oauth-google', 'oauth-github'];
  }

  connectedCallback() {
    injectStyles('dvfy-auth', STYLES);
    this.setAttribute('role', 'form');
    if (!this.hasAttribute('aria-label')) {
      this.setAttribute('aria-label', 'Authentication');
    }
    this.#render();
    this.#initialized = true;
  }

  disconnectedCallback() {
    // DOM cleanup: child elements (form, event listeners) are removed with the tree.
    // Clear innerHTML to release references.
    this.textContent = '';
  }

  #scheduleRender() {
    if (!this.#pendingRender) {
      this.#pendingRender = true;
      queueMicrotask(() => {
        this.#pendingRender = false;
        this.#render();
        this.#initialized = true;
      });
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.isConnected) return;
    if (!this.#initialized) return;

    if (DvfyAuth.#STRUCTURAL.has(name)) {
      this.#scheduleRender();
      return;
    }

    // Presence toggle (null↔value) means the element must be added or removed → rebuild
    const wasPresent = oldValue !== null;
    const isPresent = newValue !== null;
    if (wasPresent !== isPresent) {
      this.#scheduleRender();
      return;
    }

    // Both present (value update) → in-place
    switch (name) {
      case 'action': {
        const form = this.querySelector('form.dvfy-auth__form');
        if (form) form.action = sanitizeHref(newValue);
        break;
      }
      case 'method': {
        const form = this.querySelector('form.dvfy-auth__form');
        if (form) form.method = newValue || 'post';
        break;
      }
      case 'brand': {
        const h = this.querySelector('.dvfy-auth__brand');
        if (h) h.textContent = newValue;
        const img = this.querySelector('.dvfy-auth__logo');
        if (img) img.alt = newValue;
        break;
      }
      case 'logo': {
        const img = this.querySelector('.dvfy-auth__logo');
        if (img) img.src = sanitizeSrc(newValue);
        break;
      }
      case 'forgot-url': {
        const a = this.querySelector('.dvfy-auth__forgot');
        if (a) a.href = sanitizeHref(newValue);
        break;
      }
      case 'signup-url':
      case 'signin-url': {
        const a = this.querySelector('.dvfy-auth__footer .dvfy-auth__link');
        if (a) a.href = sanitizeHref(newValue);
        break;
      }
      case 'oauth-google':
      case 'oauth-github': {
        const provider = name === 'oauth-google' ? 'google' : 'github';
        const a = this.querySelector(`[data-provider="${provider}"]`);
        if (a) a.href = sanitizeHref(newValue);
        break;
      }
    }
  }

  #attr(name) { return this.getAttribute(name) || ''; }

  #render() {
    this.textContent = '';
    const mode = this.#attr('mode') || 'signin';

    const root = document.createElement('div');
    root.className = 'dvfy-auth';

    const card = document.createElement('div');
    card.className = 'dvfy-auth__card';

    // Logo OR brand text (not both — logo takes precedence)
    const logoUrl = this.#attr('logo');
    const brand = this.#attr('brand');
    if (logoUrl) {
      const img = document.createElement('img');
      img.className = 'dvfy-auth__logo';
      img.src = sanitizeSrc(logoUrl);
      img.alt = brand || 'Logo';
      card.appendChild(img);
    } else if (brand) {
      const h = document.createElement('h1');
      h.className = 'dvfy-auth__brand';
      h.textContent = brand;
      card.appendChild(h);
    }

    this.#buildForm(card, mode);

    root.appendChild(card);

    // Modal wrapping
    if (this.hasAttribute('modal')) {
      const modal = document.createElement('dvfy-modal');
      modal.setAttribute('title', mode === 'signup' ? 'Create Account' : 'Sign In');
      modal.setAttribute('size', 'sm');
      // Remove min-height and centering from root — modal handles positioning
      root.classList.remove('dvfy-auth');
      root.classList.add('dvfy-auth--modal');
      modal.appendChild(root);
      this.appendChild(modal);
      // Expose open/close methods
      this._modal = modal;
    } else {
      this.appendChild(root);
    }
  }

  /** Open the auth modal (only works when modal attribute is set) */
  open() { if (this._modal) this._modal.setAttribute('open', ''); }

  /** Close the auth modal */
  close() { if (this._modal) this._modal.removeAttribute('open'); }

  #buildForm(card, mode) {
    const isSignUp = mode === 'signup';
    const form = document.createElement('form');
    form.className = 'dvfy-auth__form';
    form.action = sanitizeHref(this.#attr('action'));
    form.method = this.#attr('method') || 'post';
    this.#copyHxAttrs(form);
    form.addEventListener('submit', e => this.#handleSubmit(e, form));

    if (isSignUp) {
      form.appendChild(this.#field('Name', 'text', 'name', 'Your name'));
    }

    form.appendChild(this.#field('Email', 'email', 'email', 'you@example.com'));
    form.appendChild(this.#field('Password', 'password', 'password', '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'));

    if (isSignUp) {
      form.appendChild(this.#field('Confirm password', 'password', 'password_confirmation', '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'));
    }

    // Forgot password link (sign-in only)
    const forgotUrl = this.#attr('forgot-url');
    if (!isSignUp && forgotUrl) {
      const a = document.createElement('a');
      a.className = 'dvfy-auth__link dvfy-auth__forgot';
      a.href = sanitizeHref(forgotUrl);
      a.textContent = 'Forgot password?';
      form.appendChild(a);
    }

    // Submit button
    const btn = document.createElement('button');
    btn.type = 'submit';
    btn.className = 'dvfy-auth__btn';
    btn.textContent = isSignUp ? 'Create account' : 'Sign in';
    form.appendChild(btn);

    card.appendChild(form);

    // OAuth
    const googleUrl = this.#attr('oauth-google');
    const githubUrl = this.#attr('oauth-github');
    if (googleUrl || githubUrl) {
      const divider = document.createElement('div');
      divider.className = 'dvfy-auth__divider';
      divider.appendChild(document.createTextNode('or continue with'));
      card.appendChild(divider);

      const oauthGroup = document.createElement('div');
      oauthGroup.className = 'dvfy-auth__oauth';

      if (googleUrl) oauthGroup.appendChild(this.#oauthBtn('Google', sanitizeHref(googleUrl), 'google'));
      if (githubUrl) oauthGroup.appendChild(this.#oauthBtn('GitHub', sanitizeHref(githubUrl), 'github'));

      card.appendChild(oauthGroup);
    }

    // Footer link
    const footer = document.createElement('div');
    footer.className = 'dvfy-auth__footer';

    if (isSignUp) {
      const url = this.#attr('signin-url');
      if (url) {
        footer.appendChild(document.createTextNode('Already have an account? '));
        const a = document.createElement('a');
        a.className = 'dvfy-auth__link';
        a.href = sanitizeHref(url);
        a.textContent = 'Sign in';
        footer.appendChild(a);
        card.appendChild(footer);
      }
    } else {
      const url = this.#attr('signup-url');
      if (url) {
        footer.appendChild(document.createTextNode("Don\u2019t have an account? "));
        const a = document.createElement('a');
        a.className = 'dvfy-auth__link';
        a.href = sanitizeHref(url);
        a.textContent = 'Create account';
        footer.appendChild(a);
        card.appendChild(footer);
      }
    }
  }

  #field(label, type, name, placeholder) {
    const wrapper = document.createElement('div');
    wrapper.className = 'dvfy-auth__field';

    const lbl = document.createElement('label');
    lbl.setAttribute('for', `dvfy-auth-${name}`);
    lbl.textContent = label;
    wrapper.appendChild(lbl);

    const inputWrap = document.createElement('div');
    inputWrap.style.cssText = 'position:relative;display:flex;align-items:center';

    const input = document.createElement('input');
    input.className = 'dvfy-auth__input';
    input.id = `dvfy-auth-${name}`;
    input.type = type;
    input.name = name;
    input.placeholder = placeholder || '';
    input.required = true;
    input.autocomplete = type === 'password' ? (name === 'password_confirmation' ? 'new-password' : 'current-password') : name;

    if (type === 'password') {
      input.style.paddingRight = '2.5rem';
      inputWrap.appendChild(input);
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.style.cssText = 'position:absolute;right:0.5rem;top:50%;transform:translateY(-50%);background:none;border:none;padding:0.25rem;cursor:pointer;color:var(--dvfy-text-muted);line-height:1';
      toggle.setAttribute('aria-label', 'Show password');
      toggle.setAttribute('tabindex', '-1');
      let visible = false;
      const eyeOpen = 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z';
      const eyeSlash1 = 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94';
      const eyeSlash2 = 'M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19';
      const eyeSlash3 = 'M14.12 14.12a3 3 0 1 1-4.24-4.24';
      const setEye = () => {
        toggle.textContent = '';
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '16'); svg.setAttribute('height', '16');
        svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
        if (visible) {
          const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          p.setAttribute('d', eyeOpen); svg.appendChild(p);
          const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          c.setAttribute('cx','12'); c.setAttribute('cy','12'); c.setAttribute('r','3'); svg.appendChild(c);
        } else {
          for (const d of [eyeSlash1, eyeSlash2, eyeSlash3]) {
            const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            p.setAttribute('d', d); svg.appendChild(p);
          }
          const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          l.setAttribute('x1','1'); l.setAttribute('y1','1'); l.setAttribute('x2','23'); l.setAttribute('y2','23');
          svg.appendChild(l);
        }
        toggle.appendChild(svg);
      };
      setEye();
      toggle.addEventListener('click', () => {
        visible = !visible;
        input.type = visible ? 'text' : 'password';
        toggle.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
        setEye();
        input.focus();
      });
      inputWrap.appendChild(toggle);
    } else {
      inputWrap.appendChild(input);
    }

    wrapper.appendChild(inputWrap);
    return wrapper;
  }

  #oauthBtn(provider, url, type) {
    const a = document.createElement('a');
    a.className = 'dvfy-auth__btn--oauth';
    a.href = url;
    a.dataset.provider = type;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('aria-hidden', 'true');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    if (type === 'google') {
      path.setAttribute('d', 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z');
    } else {
      path.setAttribute('d', 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12');
    }
    svg.appendChild(path);
    a.appendChild(svg);

    const span = document.createElement('span');
    span.textContent = `Continue with ${provider}`;
    a.appendChild(span);

    return a;
  }

  #handleSubmit(e, form) {
    const data = Object.fromEntries(new FormData(form));
    this.dispatchEvent(new CustomEvent('auth-submit', {
      detail: data,
      bubbles: true
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

customElements.define('dvfy-auth', DvfyAuth);
