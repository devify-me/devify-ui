import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-nav.js';
import './dvfy-nav-menu.js';

describe('dvfy-nav-menu', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`
        <dvfy-nav-menu>
          <dvfy-nav href="/docs">Docs</dvfy-nav>
          <dvfy-nav href="/pricing">Pricing</dvfy-nav>
        </dvfy-nav-menu>
      `);
      expect(el.getAttribute('role')).to.equal('navigation');
      const navs = el.querySelectorAll('dvfy-nav');
      expect(navs.length).to.equal(2);
    });

    it('renders empty without children', async () => {
      const el = await fixture(html`<dvfy-nav-menu></dvfy-nav-menu>`);
      expect(el.getAttribute('role')).to.equal('navigation');
      expect(el.children.length).to.equal(0);
    });
  });

  describe('attributes', () => {
    it('accepts orientation attribute', async () => {
      const el = await fixture(html`
        <dvfy-nav-menu orientation="vertical">
          <dvfy-nav href="/docs">Docs</dvfy-nav>
        </dvfy-nav-menu>
      `);
      expect(el.getAttribute('orientation')).to.equal('vertical');
    });

    it('defaults to horizontal (no orientation attribute)', async () => {
      const el = await fixture(html`<dvfy-nav-menu></dvfy-nav-menu>`);
      expect(el.hasAttribute('orientation')).to.be.false;
    });

    it('accepts label attribute', async () => {
      const el = await fixture(html`<dvfy-nav-menu label="Main Nav"></dvfy-nav-menu>`);
      expect(el.getAttribute('label')).to.equal('Main Nav');
    });

    it('accepts label-position attribute', async () => {
      const el = await fixture(html`<dvfy-nav-menu label="Nav" label-position="top"></dvfy-nav-menu>`);
      expect(el.getAttribute('label-position')).to.equal('top');
    });
  });

  describe('ARIA', () => {
    it('sets role=navigation by default', async () => {
      const el = await fixture(html`<dvfy-nav-menu></dvfy-nav-menu>`);
      expect(el.getAttribute('role')).to.equal('navigation');
    });

    it('preserves user-set role', async () => {
      const el = await fixture(html`<dvfy-nav-menu role="menubar"></dvfy-nav-menu>`);
      expect(el.getAttribute('role')).to.equal('menubar');
    });

    it('accepts aria-label', async () => {
      const el = await fixture(html`<dvfy-nav-menu aria-label="Primary navigation"></dvfy-nav-menu>`);
      expect(el.getAttribute('aria-label')).to.equal('Primary navigation');
    });
  });
});
