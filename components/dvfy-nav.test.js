import { fixture, html, expect } from '@open-wc/testing';
import { checkA11y } from '../utils/axe-test.js';
import './dvfy-nav.js';

describe('dvfy-nav', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs">Docs</dvfy-nav>`);
      expect(el.getAttribute('role')).to.equal('navigation');
      const link = el.querySelector('.dvfy-nav__link');
      expect(link).to.exist;
      expect(link.tagName).to.equal('A');
      await checkA11y(el);
    });

    it('renders label from slot text', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs">Documentation</dvfy-nav>`);
      const label = el.querySelector('.dvfy-nav__label');
      expect(label.textContent).to.equal('Documentation');
      await checkA11y(el);
    });

    it('renders label from label attribute', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" label="Docs"></dvfy-nav>`);
      const label = el.querySelector('.dvfy-nav__label');
      expect(label.textContent).to.equal('Docs');
      await checkA11y(el);
    });

    it('renders empty when no label or slot text', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs"></dvfy-nav>`);
      const label = el.querySelector('.dvfy-nav__label');
      expect(label.textContent).to.equal('');
      // link-name: Link without text needs aria-label (expected test case for empty label state)
      await checkA11y(el, { ignoredRules: ['link-name'] });
    });
  });

  describe('attributes', () => {
    it('sets href on the anchor element', async () => {
      const el = await fixture(html`<dvfy-nav href="/pricing">Pricing</dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');
      expect(link.getAttribute('href')).to.include('/pricing');
      await checkA11y(el);
    });

    it('updates href when attribute changes', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs">Docs</dvfy-nav>`);
      el.setAttribute('href', '/pricing');
      const link = el.querySelector('.dvfy-nav__link');
      expect(link.getAttribute('href')).to.include('/pricing');
      await checkA11y(el);
    });

    it('renders icon when icon attribute is set', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" icon="📖">Docs</dvfy-nav>`);
      const icon = el.querySelector('.dvfy-nav__icon');
      expect(icon).to.exist;
      expect(icon.textContent).to.equal('📖');
      await checkA11y(el);
    });

    it('removes icon when icon attribute is cleared', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" icon="📖">Docs</dvfy-nav>`);
      el.removeAttribute('icon');
      const icon = el.querySelector('.dvfy-nav__icon');
      expect(icon).to.not.exist;
      await checkA11y(el);
    });

    it('updates label when label attribute changes', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" label="Docs"></dvfy-nav>`);
      el.setAttribute('label', 'Documentation');
      const label = el.querySelector('.dvfy-nav__label');
      expect(label.textContent).to.equal('Documentation');
      await checkA11y(el);
    });
  });

  describe('active state', () => {
    it('respects explicit active attribute', async () => {
      const el = await fixture(html`<dvfy-nav href="/other" active>Link</dvfy-nav>`);
      expect(el.hasAttribute('active')).to.be.true;
      await checkA11y(el);
    });
  });

  describe('disabled state', () => {
    it('accepts disabled attribute', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" disabled>Docs</dvfy-nav>`);
      expect(el.hasAttribute('disabled')).to.be.true;
      // color-contrast: Disabled nav link intentionally has reduced opacity (component-level design)
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });
  });

  describe('ARIA', () => {
    it('sets role=navigation', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs">Docs</dvfy-nav>`);
      expect(el.getAttribute('role')).to.equal('navigation');
      await checkA11y(el);
    });

    it('preserves user-set aria-label', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" aria-label="Main docs">Docs</dvfy-nav>`);
      expect(el.getAttribute('aria-label')).to.equal('Main docs');
      await checkA11y(el);
    });
  });

  describe('cleanup', () => {
    it('removes event listeners on disconnect', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs">Docs</dvfy-nav>`);
      await checkA11y(el);
      el.remove();
      // Should not throw when hash changes after removal
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
  });
});
