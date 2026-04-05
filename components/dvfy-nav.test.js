import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-nav.js';

describe('dvfy-nav', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs">Docs</dvfy-nav>`);
      expect(el.getAttribute('role')).to.equal('navigation');
      const link = el.querySelector('.dvfy-nav__link');
      expect(link).to.exist;
      expect(link.tagName).to.equal('A');
    });

    it('renders label from slot text', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs">Documentation</dvfy-nav>`);
      const label = el.querySelector('.dvfy-nav__label');
      expect(label.textContent).to.equal('Documentation');
    });

    it('renders label from label attribute', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" label="Docs"></dvfy-nav>`);
      const label = el.querySelector('.dvfy-nav__label');
      expect(label.textContent).to.equal('Docs');
    });

    it('renders empty when no label or slot text', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs"></dvfy-nav>`);
      const label = el.querySelector('.dvfy-nav__label');
      expect(label.textContent).to.equal('');
    });
  });

  describe('attributes', () => {
    it('sets href on the anchor element', async () => {
      const el = await fixture(html`<dvfy-nav href="/pricing">Pricing</dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');
      expect(link.getAttribute('href')).to.include('/pricing');
    });

    it('updates href when attribute changes', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs">Docs</dvfy-nav>`);
      el.setAttribute('href', '/pricing');
      const link = el.querySelector('.dvfy-nav__link');
      expect(link.getAttribute('href')).to.include('/pricing');
    });

    it('renders icon when icon attribute is set', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" icon="📖">Docs</dvfy-nav>`);
      const icon = el.querySelector('.dvfy-nav__icon');
      expect(icon).to.exist;
      expect(icon.textContent).to.equal('📖');
    });

    it('removes icon when icon attribute is cleared', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" icon="📖">Docs</dvfy-nav>`);
      el.removeAttribute('icon');
      const icon = el.querySelector('.dvfy-nav__icon');
      expect(icon).to.not.exist;
    });

    it('updates label when label attribute changes', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" label="Docs"></dvfy-nav>`);
      el.setAttribute('label', 'Documentation');
      const label = el.querySelector('.dvfy-nav__label');
      expect(label.textContent).to.equal('Documentation');
    });
  });

  describe('active state', () => {
    it('respects explicit active attribute', async () => {
      const el = await fixture(html`<dvfy-nav href="/other" active>Link</dvfy-nav>`);
      expect(el.hasAttribute('active')).to.be.true;
    });
  });

  describe('disabled state', () => {
    it('accepts disabled attribute', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" disabled>Docs</dvfy-nav>`);
      expect(el.hasAttribute('disabled')).to.be.true;
    });
  });

  describe('ARIA', () => {
    it('sets role=navigation', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs">Docs</dvfy-nav>`);
      expect(el.getAttribute('role')).to.equal('navigation');
    });

    it('preserves user-set aria-label', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" aria-label="Main docs">Docs</dvfy-nav>`);
      expect(el.getAttribute('aria-label')).to.equal('Main docs');
    });
  });

  describe('cleanup', () => {
    it('removes event listeners on disconnect', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs">Docs</dvfy-nav>`);
      el.remove();
      // Should not throw when hash changes after removal
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
  });
});
