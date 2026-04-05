import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-badge.js';

describe('dvfy-badge', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`<dvfy-badge>Active</dvfy-badge>`);
      expect(el.textContent.trim()).to.equal('Active');
    });

    it('renders empty badge', async () => {
      const el = await fixture(html`<dvfy-badge></dvfy-badge>`);
      expect(el.textContent.trim()).to.equal('');
    });
  });

  describe('attributes', () => {
    it('accepts status attribute', async () => {
      const el = await fixture(html`<dvfy-badge status="success">OK</dvfy-badge>`);
      expect(el.getAttribute('status')).to.equal('success');
    });

    it('accepts variant attribute', async () => {
      const el = await fixture(html`<dvfy-badge variant="outline">Tag</dvfy-badge>`);
      expect(el.getAttribute('variant')).to.equal('outline');
    });

    it('accepts size attribute', async () => {
      const el = await fixture(html`<dvfy-badge size="sm">Small</dvfy-badge>`);
      expect(el.getAttribute('size')).to.equal('sm');
    });

    for (const status of ['neutral', 'success', 'warning', 'danger', 'info']) {
      it(`renders with status="${status}"`, async () => {
        const el = await fixture(html`<dvfy-badge status="${status}">Text</dvfy-badge>`);
        expect(el.getAttribute('status')).to.equal(status);
      });
    }

    for (const size of ['xs', 'sm', 'md', 'lg', 'xl']) {
      it(`renders with size="${size}"`, async () => {
        const el = await fixture(html`<dvfy-badge size="${size}">Text</dvfy-badge>`);
        expect(el.getAttribute('size')).to.equal(size);
      });
    }
  });

  describe('dot indicator', () => {
    it('shows dot element when dot attribute is set', async () => {
      const el = await fixture(html`<dvfy-badge dot>Active</dvfy-badge>`);
      const dot = el.querySelector('.dvfy-badge__dot');
      expect(dot).to.not.be.null;
    });

    it('does not show dot element without dot attribute', async () => {
      const el = await fixture(html`<dvfy-badge>Active</dvfy-badge>`);
      const dot = el.querySelector('.dvfy-badge__dot');
      expect(dot).to.be.null;
    });

    it('removes dot when attribute is removed', async () => {
      const el = await fixture(html`<dvfy-badge dot>Active</dvfy-badge>`);
      expect(el.querySelector('.dvfy-badge__dot')).to.not.be.null;
      el.removeAttribute('dot');
      expect(el.querySelector('.dvfy-badge__dot')).to.be.null;
    });

    it('adds dot when attribute is added dynamically', async () => {
      const el = await fixture(html`<dvfy-badge>Active</dvfy-badge>`);
      expect(el.querySelector('.dvfy-badge__dot')).to.be.null;
      el.setAttribute('dot', '');
      expect(el.querySelector('.dvfy-badge__dot')).to.not.be.null;
    });

    it('preserves text content when dot is added', async () => {
      const el = await fixture(html`<dvfy-badge>Active</dvfy-badge>`);
      el.setAttribute('dot', '');
      expect(el.textContent.trim()).to.equal('Active');
    });
  });

  describe('ARIA', () => {
    it('sets role="status"', async () => {
      const el = await fixture(html`<dvfy-badge>Info</dvfy-badge>`);
      expect(el.getAttribute('role')).to.equal('status');
    });

    it('accepts aria-label attribute', async () => {
      const el = await fixture(html`<dvfy-badge aria-label="3 notifications">3</dvfy-badge>`);
      expect(el.getAttribute('aria-label')).to.equal('3 notifications');
    });
  });
});
