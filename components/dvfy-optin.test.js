import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-optin.js';

describe('dvfy-optin', () => {
  describe('rendering', () => {
    it('is defined as a custom element', () => {
      expect(customElements.get('dvfy-optin')).to.exist;
    });

    it('renders a form with a required email field', async () => {
      const el = await fixture(html`<dvfy-optin action="/capture"></dvfy-optin>`);
      const form = el.querySelector('form.dvfy-optin__form');
      expect(form).to.exist;
      const emailInput = el.querySelector('.dvfy-optin__email input');
      expect(emailInput).to.exist;
      expect(emailInput.type).to.equal('email');
      expect(emailInput.name).to.equal('email');
      expect(emailInput.required).to.be.true;
    });

    it('uses the default CTA text', async () => {
      const el = await fixture(html`<dvfy-optin action="/capture"></dvfy-optin>`);
      const btn = el.querySelector('.dvfy-optin__submit');
      expect(btn).to.exist;
      expect(btn.getAttribute('type')).to.equal('submit');
      expect(btn.textContent).to.equal('Get instant access');
    });

    it('renders a custom CTA', async () => {
      const el = await fixture(html`<dvfy-optin action="/x" cta="Send me the guide"></dvfy-optin>`);
      expect(el.querySelector('.dvfy-optin__submit').textContent).to.equal('Send me the guide');
    });

    it('renders eyebrow, heading, and subhead when set', async () => {
      const el = await fixture(html`
        <dvfy-optin eyebrow="Free guide" heading="Know your score" subhead="No sales call." action="/x">
        </dvfy-optin>
      `);
      expect(el.querySelector('.dvfy-optin__eyebrow').textContent).to.equal('Free guide');
      expect(el.querySelector('.dvfy-optin__heading').textContent).to.equal('Know your score');
      expect(el.querySelector('.dvfy-optin__subhead').textContent).to.equal('No sales call.');
    });

    it('omits eyebrow/subhead when not set', async () => {
      const el = await fixture(html`<dvfy-optin heading="H" action="/x"></dvfy-optin>`);
      expect(el.querySelector('.dvfy-optin__eyebrow')).to.not.exist;
      expect(el.querySelector('.dvfy-optin__subhead')).to.not.exist;
    });

    it('applies email-label and email-placeholder', async () => {
      const el = await fixture(html`
        <dvfy-optin action="/x" email-label="Work email" email-placeholder="name@company.com"></dvfy-optin>
      `);
      const dvfyInput = el.querySelector('.dvfy-optin__email');
      expect(dvfyInput.getAttribute('label')).to.equal('Work email');
      expect(el.querySelector('.dvfy-optin__email input').placeholder).to.equal('name@company.com');
    });
  });

  describe('qualifier field', () => {
    it('renders NO qualifier by default', async () => {
      const el = await fixture(html`<dvfy-optin action="/x"></dvfy-optin>`);
      expect(el.querySelector('.dvfy-optin__qualifier')).to.not.exist;
    });

    it('renders a text input qualifier when qualifier-label is set (no options)', async () => {
      const el = await fixture(html`
        <dvfy-optin action="/x" qualifier-label="Company" qualifier-name="company"></dvfy-optin>
      `);
      const q = el.querySelector('.dvfy-optin__qualifier');
      expect(q.tagName.toLowerCase()).to.equal('dvfy-input');
      expect(q.getAttribute('label')).to.equal('Company');
      expect(q.getAttribute('name')).to.equal('company');
    });

    it('renders a dvfy-select qualifier when qualifier-options is set', async () => {
      const el = await fixture(html`
        <dvfy-optin action="/x" qualifier-label="Home type" qualifier-options="Flat, Detached"></dvfy-optin>
      `);
      const q = el.querySelector('.dvfy-optin__qualifier');
      expect(q.tagName.toLowerCase()).to.equal('dvfy-select');
      expect(q.getAttribute('name')).to.equal('qualifier');
      // native named <select> is emitted for form submission
      const native = q.querySelector('select');
      expect(native).to.exist;
      expect(native.name).to.equal('qualifier');
    });

    it('marks the qualifier required only when qualifier-required is set', async () => {
      const el = await fixture(html`
        <dvfy-optin action="/x" qualifier-label="Company" qualifier-required></dvfy-optin>
      `);
      expect(el.querySelector('.dvfy-optin__qualifier').hasAttribute('required')).to.be.true;
    });

    it('orders the email field before the qualifier (easy → hard)', async () => {
      const el = await fixture(html`
        <dvfy-optin action="/x" qualifier-label="Company"></dvfy-optin>
      `);
      const fields = el.querySelectorAll('.dvfy-optin__field');
      expect(fields[0].classList.contains('dvfy-optin__email')).to.be.true;
      expect(fields[1].classList.contains('dvfy-optin__qualifier')).to.be.true;
    });
  });

  describe('trust microcopy', () => {
    it('renders trust text when set', async () => {
      const el = await fixture(html`
        <dvfy-optin action="/x" trust="One email. Unsubscribe anytime."></dvfy-optin>
      `);
      expect(el.querySelector('.dvfy-optin__trust').textContent).to.equal('One email. Unsubscribe anytime.');
    });

    it('omits trust text when not set', async () => {
      const el = await fixture(html`<dvfy-optin action="/x"></dvfy-optin>`);
      expect(el.querySelector('.dvfy-optin__trust')).to.not.exist;
    });
  });

  describe('form submission', () => {
    it('sets form action and normalizes method to post by default', async () => {
      const el = await fixture(html`<dvfy-optin action="/capture"></dvfy-optin>`);
      const form = el.querySelector('form');
      expect(form.action).to.include('/capture');
      expect(form.method).to.equal('post');
    });

    it('normalizes method to get|post (invalid → post)', async () => {
      const a = await fixture(html`<dvfy-optin action="/x" method="GET"></dvfy-optin>`);
      expect(a.querySelector('form').method).to.equal('get');
      const b = await fixture(html`<dvfy-optin action="/x" method="bogus"></dvfy-optin>`);
      expect(b.querySelector('form').method).to.equal('post');
    });

    it('copies hx-* attributes onto the form', async () => {
      const el = await fixture(html`
        <dvfy-optin action="/capture" hx-post="/capture" hx-target="#main"></dvfy-optin>
      `);
      const form = el.querySelector('form');
      expect(form.getAttribute('hx-post')).to.equal('/capture');
      expect(form.getAttribute('hx-target')).to.equal('#main');
    });

    it('fires optin-submit with a form-data object on submit', async () => {
      const el = await fixture(html`<dvfy-optin action="/capture"></dvfy-optin>`);
      const form = el.querySelector('form');
      setTimeout(() => form.dispatchEvent(new Event('submit', { bubbles: true })));
      const event = await oneEvent(el, 'optin-submit');
      expect(event.detail).to.be.an('object');
      expect(event.detail).to.have.property('email');
    });
  });

  describe('accessibility', () => {
    it('sets role=form', async () => {
      const el = await fixture(html`<dvfy-optin action="/x"></dvfy-optin>`);
      expect(el.getAttribute('role')).to.equal('form');
    });

    it('defaults aria-label to the heading', async () => {
      const el = await fixture(html`<dvfy-optin heading="Get the checklist" action="/x"></dvfy-optin>`);
      expect(el.getAttribute('aria-label')).to.equal('Get the checklist');
    });

    it('preserves an author-supplied aria-label across re-render', async () => {
      const el = await fixture(html`<dvfy-optin heading="H" aria-label="Newsletter opt-in" action="/x"></dvfy-optin>`);
      expect(el.getAttribute('aria-label')).to.equal('Newsletter opt-in');
      el.setAttribute('heading', 'Changed');
      await Promise.resolve();
      expect(el.getAttribute('aria-label')).to.equal('Newsletter opt-in');
    });

    it('sets autocomplete="email" on the email input', async () => {
      const el = await fixture(html`<dvfy-optin action="/x"></dvfy-optin>`);
      const input = el.querySelector('.dvfy-optin__email input');
      expect(input.getAttribute('autocomplete')).to.equal('email');
    });

    it('associates the email label with its input via for/id', async () => {
      const el = await fixture(html`<dvfy-optin action="/x"></dvfy-optin>`);
      const label = el.querySelector('.dvfy-optin__email label');
      const input = el.querySelector('.dvfy-optin__email input');
      expect(label.getAttribute('for')).to.equal(input.id);
    });
  });

  describe('reactivity', () => {
    it('re-renders when heading changes', async () => {
      const el = await fixture(html`<dvfy-optin heading="Before" action="/x"></dvfy-optin>`);
      expect(el.querySelector('.dvfy-optin__heading').textContent).to.equal('Before');
      el.setAttribute('heading', 'After');
      await Promise.resolve();
      expect(el.querySelector('.dvfy-optin__heading').textContent).to.equal('After');
    });
  });
});
