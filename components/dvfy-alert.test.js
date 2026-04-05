import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-alert.js';

describe('dvfy-alert', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`<dvfy-alert>Something happened.</dvfy-alert>`);
      expect(el.getAttribute('role')).to.equal('alert');
      expect(el.querySelector('.dvfy-alert__content').textContent).to.equal('Something happened.');
    });

    it('renders the info status icon by default', async () => {
      const el = await fixture(html`<dvfy-alert>Info message</dvfy-alert>`);
      const icon = el.querySelector('.dvfy-alert__icon');
      expect(icon).to.exist;
      expect(icon.getAttribute('aria-hidden')).to.equal('true');
      expect(icon.textContent).to.equal('\u24D8');
    });

    it('renders title when provided', async () => {
      const el = await fixture(html`<dvfy-alert title="Heads up">Body text</dvfy-alert>`);
      const title = el.querySelector('.dvfy-alert__title');
      expect(title).to.exist;
      expect(title.textContent).to.equal('Heads up');
    });

    it('renders without title when not provided', async () => {
      const el = await fixture(html`<dvfy-alert>No title here</dvfy-alert>`);
      expect(el.querySelector('.dvfy-alert__title')).to.be.null;
    });

    it('renders with empty content', async () => {
      const el = await fixture(html`<dvfy-alert title="Title only"></dvfy-alert>`);
      expect(el.querySelector('.dvfy-alert__title').textContent).to.equal('Title only');
      expect(el.querySelector('.dvfy-alert__content')).to.be.null;
    });
  });

  describe('attributes', () => {
    it('accepts status="success" and shows check icon', async () => {
      const el = await fixture(html`<dvfy-alert status="success">Saved</dvfy-alert>`);
      expect(el.getAttribute('status')).to.equal('success');
      expect(el.querySelector('.dvfy-alert__icon').textContent).to.equal('\u2713');
    });

    it('accepts status="warning" and shows warning icon', async () => {
      const el = await fixture(html`<dvfy-alert status="warning">Careful</dvfy-alert>`);
      expect(el.querySelector('.dvfy-alert__icon').textContent).to.equal('\u26A0');
    });

    it('accepts status="danger" and shows x icon', async () => {
      const el = await fixture(html`<dvfy-alert status="danger">Error</dvfy-alert>`);
      expect(el.querySelector('.dvfy-alert__icon').textContent).to.equal('\u2716');
    });

    it('falls back to info icon for unknown status', async () => {
      const el = await fixture(html`<dvfy-alert status="unknown">Hmm</dvfy-alert>`);
      expect(el.querySelector('.dvfy-alert__icon').textContent).to.equal('\u24D8');
    });

    it('updates icon when status changes', async () => {
      const el = await fixture(html`<dvfy-alert status="info">Test</dvfy-alert>`);
      expect(el.querySelector('.dvfy-alert__icon').textContent).to.equal('\u24D8');
      el.setAttribute('status', 'danger');
      expect(el.querySelector('.dvfy-alert__icon').textContent).to.equal('\u2716');
    });

    it('updates title when title attribute changes', async () => {
      const el = await fixture(html`<dvfy-alert title="Old">Body</dvfy-alert>`);
      el.setAttribute('title', 'New');
      expect(el.querySelector('.dvfy-alert__title').textContent).to.equal('New');
    });
  });

  describe('dismissible', () => {
    it('shows close button when dismissible', async () => {
      const el = await fixture(html`<dvfy-alert dismissible>Dismiss me</dvfy-alert>`);
      const btn = el.querySelector('.dvfy-alert__close');
      expect(btn).to.exist;
      expect(btn.getAttribute('aria-label')).to.equal('Dismiss');
    });

    it('does not show close button without dismissible', async () => {
      const el = await fixture(html`<dvfy-alert>No dismiss</dvfy-alert>`);
      expect(el.querySelector('.dvfy-alert__close')).to.be.null;
    });

    it('removes element when close button is clicked', async () => {
      const wrapper = await fixture(html`
        <div>
          <dvfy-alert dismissible>Remove me</dvfy-alert>
        </div>
      `);
      const alert = wrapper.querySelector('dvfy-alert');
      const btn = alert.querySelector('.dvfy-alert__close');
      btn.click();
      expect(wrapper.querySelector('dvfy-alert')).to.be.null;
    });
  });

  describe('ARIA', () => {
    it('sets role="alert"', async () => {
      const el = await fixture(html`<dvfy-alert>ARIA test</dvfy-alert>`);
      expect(el.getAttribute('role')).to.equal('alert');
    });

    it('hides the icon from assistive technology', async () => {
      const el = await fixture(html`<dvfy-alert>Test</dvfy-alert>`);
      expect(el.querySelector('.dvfy-alert__icon').getAttribute('aria-hidden')).to.equal('true');
    });
  });
});
