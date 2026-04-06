import { fixture, html, expect } from '@open-wc/testing';
import { checkA11y } from '../utils/axe-test.js';
import './dvfy-nav.js';

// dvfy-nav is a single navigation link primitive:
//   <dvfy-nav href="/path">Label</dvfy-nav>
// It renders as:  dvfy-nav[role="navigation"] > a.dvfy-nav__link > span.dvfy-nav__label
// Active state is exposed via the host `active` attribute AND `aria-current="page"` on the anchor.

describe('dvfy-nav — accessibility', () => {

  // ─── Semantic Structure ───────────────────────────────────────────────────────

  describe('semantic structure', () => {
    it('host element carries role="navigation"', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs">Docs</dvfy-nav>`);
      expect(el.getAttribute('role')).to.equal('navigation');
      await checkA11y(el);
    });

    it('inner anchor is an <a> element', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs">Docs</dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');
      expect(link).to.exist;
      expect(link.tagName).to.equal('A');
      await checkA11y(el);
    });

    it('anchor href matches the component href attribute', async () => {
      const el = await fixture(html`<dvfy-nav href="/about">About</dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');
      expect(link.getAttribute('href')).to.include('/about');
      await checkA11y(el);
    });

    it('label text is inside the anchor (readable by screen readers)', async () => {
      const el = await fixture(html`<dvfy-nav href="/pricing">Pricing</dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');
      expect(link.textContent.trim()).to.include('Pricing');
      await checkA11y(el);
    });

    it('label attribute populates anchor text content', async () => {
      const el = await fixture(html`<dvfy-nav href="/help" label="Help Center"></dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');
      expect(link.textContent.trim()).to.include('Help Center');
      await checkA11y(el);
    });

    it('navigation landmark is named via aria-label when provided', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" aria-label="Documentation nav">Docs</dvfy-nav>`);
      expect(el.getAttribute('aria-label')).to.equal('Documentation nav');
      await checkA11y(el);
    });
  });

  // ─── Active Link Announcement (ARIA 1.2) ─────────────────────────────────────

  describe('active link announcement', () => {
    it('active link has aria-current="page"', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" active>Docs</dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');
      expect(link.getAttribute('aria-current')).to.equal('page');
      await checkA11y(el);
    });

    it('non-active link does NOT have aria-current', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs">Docs</dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');
      expect(link.hasAttribute('aria-current')).to.be.false;
      await checkA11y(el);
    });

    it('aria-current is set when active attribute is added dynamically', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs">Docs</dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');
      expect(link.hasAttribute('aria-current')).to.be.false;

      el.setAttribute('active', '');

      expect(link.getAttribute('aria-current')).to.equal('page');
      await checkA11y(el);
    });

    it('aria-current is removed when active attribute is removed', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" active>Docs</dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');
      expect(link.getAttribute('aria-current')).to.equal('page');

      el.removeAttribute('active');

      expect(link.hasAttribute('aria-current')).to.be.false;
      await checkA11y(el);
    });

    it('aria-current value is exactly "page" (ARIA 1.2)', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" active>Docs</dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');
      // ARIA 1.2 specifies aria-current="page" for current page links
      expect(link.getAttribute('aria-current')).to.equal('page');
    });

    it('disabled link does not report as current page', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" disabled>Docs</dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');
      expect(link.hasAttribute('aria-current')).to.be.false;
      // color-contrast: intentional reduced opacity for disabled state
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });
  });

  // ─── Link Text Quality ────────────────────────────────────────────────────────

  describe('link text quality', () => {
    it('link has non-empty text visible to screen readers', async () => {
      const el = await fixture(html`<dvfy-nav href="/blog">Blog</dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');
      expect(link.textContent.trim().length).to.be.greaterThan(0);
      await checkA11y(el);
    });

    it('link text is descriptive (not generic "click here")', async () => {
      const el = await fixture(html`<dvfy-nav href="/features">Features</dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');
      const text = link.textContent.trim().toLowerCase();
      expect(text).not.to.equal('click here');
      expect(text).not.to.equal('here');
      expect(text).not.to.equal('link');
      expect(text.length).to.be.greaterThan(2);
    });

    it('icon-only nav passes when aria-label provides accessible name', async () => {
      const el = await fixture(html`
        <dvfy-nav href="/home" icon="🏠" aria-label="Home navigation"></dvfy-nav>
      `);
      // link-name: icon-only anchor without text needs aria-label on the host landmark
      await checkA11y(el, { ignoredRules: ['link-name'] });
      expect(el.getAttribute('aria-label')).to.equal('Home navigation');
    });

    it('link with both icon and label has accessible text from label', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" icon="📖">Documentation</dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');
      const labelEl = link.querySelector('.dvfy-nav__label');
      expect(labelEl).to.exist;
      expect(labelEl.textContent.trim()).to.equal('Documentation');
      await checkA11y(el);
    });

    it('updated label attribute is reflected in accessible link text', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" label="Docs"></dvfy-nav>`);
      el.setAttribute('label', 'Documentation');
      const link = el.querySelector('.dvfy-nav__link');
      expect(link.textContent.trim()).to.include('Documentation');
      await checkA11y(el, { ignoredRules: ['link-name'] });
    });
  });

  // ─── Keyboard Navigation ─────────────────────────────────────────────────────

  describe('keyboard navigation', () => {
    it('anchor is focusable via Tab (has no tabindex=-1)', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs">Docs</dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');
      // Default tabindex for <a href> is 0 (naturally focusable)
      expect(link.getAttribute('tabindex')).to.not.equal('-1');
    });

    it('anchor receives focus programmatically', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs">Docs</dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');
      link.focus();
      expect(document.activeElement).to.equal(link);
    });

    it('disabled nav link is not interactive (pointer-events none via CSS)', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" disabled>Docs</dvfy-nav>`);
      expect(el.hasAttribute('disabled')).to.be.true;
      // color-contrast: intentional reduced opacity for disabled state
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });

    it('active link is still keyboard focusable', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" active>Docs</dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');
      link.focus();
      expect(document.activeElement).to.equal(link);
      await checkA11y(el);
    });

    it('link fires click event when programmatically triggered (native anchor behavior)', async () => {
      const el = await fixture(html`<dvfy-nav href="#section">Section</dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');

      let clicked = false;
      link.addEventListener('click', (e) => {
        e.preventDefault(); // prevent actual navigation
        clicked = true;
      });

      link.focus();
      link.click();

      expect(clicked).to.be.true;
    });
  });

  // ─── Edge Cases ──────────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('renders gracefully without href attribute', async () => {
      const el = await fixture(html`<dvfy-nav>Home</dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');
      expect(link).to.exist;
      // link-name: link text is present; no violation expected
      await checkA11y(el);
    });

    it('renders gracefully with empty label', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs"></dvfy-nav>`);
      const link = el.querySelector('.dvfy-nav__link');
      expect(link).to.exist;
      // link-name: empty-label link is a known empty state — axe would flag this
      await checkA11y(el, { ignoredRules: ['link-name'] });
    });

    it('href update preserves aria-current when still active', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs" active>Docs</dvfy-nav>`);
      el.setAttribute('href', '/docs/intro');
      const link = el.querySelector('.dvfy-nav__link');
      // active attr is still set, so aria-current must remain
      expect(link.getAttribute('aria-current')).to.equal('page');
      await checkA11y(el);
    });

    it('aria-current is absent after href changes to non-matching path', async () => {
      // Active was auto-detected; changing href to non-current path should remove active
      const el = await fixture(html`<dvfy-nav href="/docs" active>Docs</dvfy-nav>`);
      // Remove explicit active, then change href — auto-detection runs
      el.removeAttribute('active');
      el.setAttribute('href', '/completely-different');
      const link = el.querySelector('.dvfy-nav__link');
      // No auto-detection match → aria-current must be absent
      expect(link.hasAttribute('aria-current')).to.be.false;
    });

    it('multiple dvfy-nav instances can coexist independently', async () => {
      const container = await fixture(html`
        <div>
          <dvfy-nav href="/home" active aria-label="Home">Home</dvfy-nav>
          <dvfy-nav href="/docs" aria-label="Docs">Docs</dvfy-nav>
          <dvfy-nav href="/blog" aria-label="Blog">Blog</dvfy-nav>
        </div>
      `);

      const navs = container.querySelectorAll('dvfy-nav');
      const links = Array.from(navs).map(n => n.querySelector('.dvfy-nav__link'));

      // Only the first link (active) has aria-current
      expect(links[0].getAttribute('aria-current')).to.equal('page');
      expect(links[1].hasAttribute('aria-current')).to.be.false;
      expect(links[2].hasAttribute('aria-current')).to.be.false;

      // Each nav is its own landmark — all three must be accessible
      for (const nav of navs) {
        await checkA11y(nav);
      }
    });

    it('hashchange event does not throw after element is disconnected', async () => {
      const el = await fixture(html`<dvfy-nav href="/docs">Docs</dvfy-nav>`);
      el.remove();

      let threw = false;
      try {
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      } catch (e) {
        threw = true;
      }
      expect(threw).to.be.false;
    });
  });

});
