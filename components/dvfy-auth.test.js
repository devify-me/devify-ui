import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-modal.js';
import './dvfy-auth.js';

describe('dvfy-auth', () => {
  describe('rendering', () => {
    it('is defined as a custom element', () => {
      expect(customElements.get('dvfy-auth')).to.exist;
    });

    it('renders sign-in form by default', async () => {
      const el = await fixture(
        html`<dvfy-auth action="/auth/login"></dvfy-auth>`
      );
      const form = el.querySelector('.dvfy-auth__form');
      expect(form).to.exist;
      const btn = el.querySelector('.dvfy-auth__btn');
      expect(btn.textContent).to.equal('Sign in');
    });

    it('renders email and password fields for sign-in', async () => {
      const el = await fixture(
        html`<dvfy-auth action="/auth/login"></dvfy-auth>`
      );
      const email = el.querySelector('#dvfy-auth-email');
      const password = el.querySelector('#dvfy-auth-password');
      expect(email).to.exist;
      expect(email.type).to.equal('email');
      expect(password).to.exist;
      expect(password.type).to.equal('password');
    });

    it('renders sign-up form with name and confirm password', async () => {
      const el = await fixture(
        html`<dvfy-auth mode="signup" action="/auth/register"></dvfy-auth>`
      );
      const name = el.querySelector('#dvfy-auth-name');
      const confirm = el.querySelector('#dvfy-auth-password_confirmation');
      expect(name).to.exist;
      expect(name.type).to.equal('text');
      expect(confirm).to.exist;
      const btn = el.querySelector('.dvfy-auth__btn');
      expect(btn.textContent).to.equal('Create account');
    });

    it('renders brand text when brand attr is set', async () => {
      const el = await fixture(
        html`<dvfy-auth brand="Devify" action="/login"></dvfy-auth>`
      );
      const brand = el.querySelector('.dvfy-auth__brand');
      expect(brand).to.exist;
      expect(brand.textContent).to.equal('Devify');
    });

    it('renders logo image when logo attr is set', async () => {
      const el = await fixture(
        html`<dvfy-auth logo="/logo.svg" brand="Devify" action="/login"></dvfy-auth>`
      );
      const img = el.querySelector('.dvfy-auth__logo');
      expect(img).to.exist;
      expect(img.src).to.include('/logo.svg');
      expect(img.alt).to.equal('Devify');
      // Logo takes precedence over brand text
      const brand = el.querySelector('.dvfy-auth__brand');
      expect(brand).to.not.exist;
    });

    it('renders forgot password link in sign-in mode', async () => {
      const el = await fixture(
        html`<dvfy-auth
          action="/login"
          forgot-url="/forgot"
        ></dvfy-auth>`
      );
      const forgot = el.querySelector('.dvfy-auth__forgot');
      expect(forgot).to.exist;
      expect(forgot.textContent).to.equal('Forgot password?');
      expect(forgot.href).to.include('/forgot');
    });

    it('does not render forgot link in sign-up mode', async () => {
      const el = await fixture(
        html`<dvfy-auth
          mode="signup"
          action="/register"
          forgot-url="/forgot"
        ></dvfy-auth>`
      );
      const forgot = el.querySelector('.dvfy-auth__forgot');
      expect(forgot).to.not.exist;
    });

    it('renders sign-up link in sign-in mode', async () => {
      const el = await fixture(
        html`<dvfy-auth
          action="/login"
          signup-url="/register"
        ></dvfy-auth>`
      );
      const footer = el.querySelector('.dvfy-auth__footer');
      expect(footer).to.exist;
      expect(footer.textContent).to.include('Create account');
    });

    it('renders sign-in link in sign-up mode', async () => {
      const el = await fixture(
        html`<dvfy-auth
          mode="signup"
          action="/register"
          signin-url="/login"
        ></dvfy-auth>`
      );
      const footer = el.querySelector('.dvfy-auth__footer');
      expect(footer).to.exist;
      expect(footer.textContent).to.include('Sign in');
    });
  });

  describe('OAuth', () => {
    it('renders Google OAuth button', async () => {
      const el = await fixture(
        html`<dvfy-auth
          action="/login"
          oauth-google="/auth/google"
        ></dvfy-auth>`
      );
      const oauthGroup = el.querySelector('.dvfy-auth__oauth');
      expect(oauthGroup).to.exist;
      const btn = oauthGroup.querySelector('.dvfy-auth__btn--oauth');
      expect(btn).to.exist;
      expect(btn.textContent).to.include('Google');
      expect(btn.href).to.include('/auth/google');
    });

    it('renders GitHub OAuth button', async () => {
      const el = await fixture(
        html`<dvfy-auth
          action="/login"
          oauth-github="/auth/github"
        ></dvfy-auth>`
      );
      const btn = el.querySelector('.dvfy-auth__btn--oauth');
      expect(btn.textContent).to.include('GitHub');
    });

    it('renders divider when OAuth is present', async () => {
      const el = await fixture(
        html`<dvfy-auth
          action="/login"
          oauth-google="/auth/google"
        ></dvfy-auth>`
      );
      const divider = el.querySelector('.dvfy-auth__divider');
      expect(divider).to.exist;
      expect(divider.textContent).to.include('or continue with');
    });

    it('omits OAuth section when no OAuth URLs', async () => {
      const el = await fixture(
        html`<dvfy-auth action="/login"></dvfy-auth>`
      );
      const oauthGroup = el.querySelector('.dvfy-auth__oauth');
      expect(oauthGroup).to.not.exist;
    });
  });

  describe('modal mode', () => {
    it('wraps form in dvfy-modal when modal attr is set', async () => {
      const el = await fixture(
        html`<dvfy-auth modal action="/login"></dvfy-auth>`
      );
      const modal = el.querySelector('dvfy-modal');
      expect(modal).to.exist;
      expect(modal.getAttribute('title')).to.equal('Sign In');
    });

    it('sets modal title to Create Account in signup mode', async () => {
      const el = await fixture(
        html`<dvfy-auth modal mode="signup" action="/register"></dvfy-auth>`
      );
      const modal = el.querySelector('dvfy-modal');
      expect(modal.getAttribute('title')).to.equal('Create Account');
    });

    it('exposes open() and close() methods', async () => {
      const el = await fixture(
        html`<dvfy-auth modal action="/login"></dvfy-auth>`
      );
      expect(typeof el.open).to.equal('function');
      expect(typeof el.close).to.equal('function');
    });

    it('open() sets open attribute on modal', async () => {
      const el = await fixture(
        html`<dvfy-auth modal action="/login"></dvfy-auth>`
      );
      el.open();
      const modal = el.querySelector('dvfy-modal');
      expect(modal.hasAttribute('open')).to.be.true;
    });

    it('close() removes open attribute from modal', async () => {
      const el = await fixture(
        html`<dvfy-auth modal action="/login"></dvfy-auth>`
      );
      el.open();
      el.close();
      const modal = el.querySelector('dvfy-modal');
      expect(modal.hasAttribute('open')).to.be.false;
    });

    it('applies modal variant CSS class', async () => {
      const el = await fixture(
        html`<dvfy-auth modal action="/login"></dvfy-auth>`
      );
      const root = el.querySelector('.dvfy-auth--modal');
      expect(root).to.exist;
    });
  });

  describe('form submission', () => {
    it('sets form action and method', async () => {
      const el = await fixture(
        html`<dvfy-auth action="/auth/login" method="post"></dvfy-auth>`
      );
      const form = el.querySelector('form');
      expect(form.action).to.include('/auth/login');
      expect(form.method).to.equal('post');
    });

    it('copies hx-* attributes to form', async () => {
      const el = await fixture(
        html`<dvfy-auth
          action="/login"
          hx-boost="true"
          hx-target="#main"
        ></dvfy-auth>`
      );
      const form = el.querySelector('form');
      expect(form.getAttribute('hx-boost')).to.equal('true');
      expect(form.getAttribute('hx-target')).to.equal('#main');
    });

    it('fires auth-submit event on form submit', async () => {
      const el = await fixture(
        html`<dvfy-auth action="/login"></dvfy-auth>`
      );
      const form = el.querySelector('form');
      setTimeout(() => form.dispatchEvent(new Event('submit', { bubbles: true })));
      const event = await oneEvent(el, 'auth-submit');
      expect(event.detail).to.be.an('object');
      expect(event.detail).to.have.property('email');
      expect(event.detail).to.have.property('password');
    });

    it('marks all inputs as required', async () => {
      const el = await fixture(
        html`<dvfy-auth action="/login"></dvfy-auth>`
      );
      const inputs = el.querySelectorAll('.dvfy-auth__input');
      for (const input of inputs) {
        expect(input.required).to.be.true;
      }
    });
  });

  describe('password visibility toggle', () => {
    it('renders toggle button for password fields', async () => {
      const el = await fixture(
        html`<dvfy-auth action="/login"></dvfy-auth>`
      );
      const toggles = el.querySelectorAll('[aria-label="Show password"]');
      expect(toggles.length).to.be.greaterThan(0);
    });

    it('toggles input type on click', async () => {
      const el = await fixture(
        html`<dvfy-auth action="/login"></dvfy-auth>`
      );
      const toggle = el.querySelector('[aria-label="Show password"]');
      const input = el.querySelector('#dvfy-auth-password');
      expect(input.type).to.equal('password');

      toggle.click();
      expect(input.type).to.equal('text');
      expect(toggle.getAttribute('aria-label')).to.equal('Hide password');

      toggle.click();
      expect(input.type).to.equal('password');
      expect(toggle.getAttribute('aria-label')).to.equal('Show password');
    });
  });

  describe('ARIA', () => {
    it('sets role=form', async () => {
      const el = await fixture(
        html`<dvfy-auth action="/login"></dvfy-auth>`
      );
      expect(el.getAttribute('role')).to.equal('form');
    });

    it('sets default aria-label', async () => {
      const el = await fixture(
        html`<dvfy-auth action="/login"></dvfy-auth>`
      );
      expect(el.getAttribute('aria-label')).to.equal('Authentication');
    });

    it('preserves custom aria-label', async () => {
      const el = await fixture(
        html`<dvfy-auth
          action="/login"
          aria-label="Login form"
        ></dvfy-auth>`
      );
      expect(el.getAttribute('aria-label')).to.equal('Login form');
    });

    it('associates labels with inputs via for/id', async () => {
      const el = await fixture(
        html`<dvfy-auth action="/login"></dvfy-auth>`
      );
      const labels = el.querySelectorAll('label');
      for (const label of labels) {
        const forAttr = label.getAttribute('for');
        expect(forAttr).to.exist;
        const input = el.querySelector('#' + forAttr);
        expect(input).to.exist;
      }
    });
  });

  describe('attributes', () => {
    it('observes mode attribute', () => {
      expect(
        customElements.get('dvfy-auth').observedAttributes
      ).to.include('mode');
    });

    it('re-renders when mode changes', async () => {
      const el = await fixture(
        html`<dvfy-auth action="/login"></dvfy-auth>`
      );
      expect(el.querySelector('.dvfy-auth__btn').textContent).to.equal('Sign in');

      el.setAttribute('mode', 'signup');
      expect(el.querySelector('.dvfy-auth__btn').textContent).to.equal('Create account');
    });
  });
});
