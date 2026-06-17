import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-campaign-layout.js';

describe('dvfy-campaign-layout', () => {
  it('is defined as a custom element', () => {
    expect(customElements.get('dvfy-campaign-layout')).to.exist;
  });

  describe('page scaffold', () => {
    it('projects default-slot content into a <main id="main-content"> landmark', async () => {
      const el = await fixture(html`
        <dvfy-campaign-layout>
          <dvfy-section-hero><h1>Hero</h1></dvfy-section-hero>
        </dvfy-campaign-layout>
      `);
      const main = el.querySelector('main#main-content');
      expect(main, 'a single <main id="main-content"> landmark').to.exist;
      expect(main.querySelector('dvfy-section-hero h1').textContent).to.equal('Hero');
    });

    it('renders exactly one <main> (skip-link target / single conversion path)', async () => {
      const el = await fixture(html`
        <dvfy-campaign-layout><p>body</p></dvfy-campaign-layout>
      `);
      expect(el.querySelectorAll('main').length).to.equal(1);
    });

    it('is a block-level element', async () => {
      const el = await fixture(html`<dvfy-campaign-layout>x</dvfy-campaign-layout>`);
      expect(getComputedStyle(el).display).to.equal('block');
    });
  });

  describe('1:1 attention ratio — NO navigation menu (the whole point)', () => {
    it('renders zero <dvfy-nav-menu> / <dvfy-nav> escape routes', async () => {
      const el = await fixture(html`
        <dvfy-campaign-layout brand="Renting Ideal">
          <dvfy-button>CTA</dvfy-button>
        </dvfy-campaign-layout>
      `);
      expect(el.querySelectorAll('dvfy-nav-menu, dvfy-nav').length).to.equal(0);
    });

    it('the brand bar (header) emits zero links when no home-href is given (brand is non-navigational)', async () => {
      const el = await fixture(html`
        <dvfy-campaign-layout brand="Renting Ideal">
          <dvfy-button>CTA</dvfy-button>
        </dvfy-campaign-layout>
      `);
      // With no consumer link and no home-href, the header adds ZERO anchors — no escape routes.
      expect(el.querySelectorAll('header a').length).to.equal(0);
    });

    it('the only layout-owned <a> is the same-page skip link to #main-content (a11y, not a nav escape)', async () => {
      const el = await fixture(html`
        <dvfy-campaign-layout brand="Renting Ideal">
          <dvfy-button>CTA</dvfy-button>
        </dvfy-campaign-layout>
      `);
      // Skip link is an a11y affordance pointing at the page's OWN content — never off-page.
      // It is the single layout-owned anchor; every other link must be a consumer CTA.
      const layoutLinks = [...el.querySelectorAll('a')].filter(a => !a.closest('main'));
      expect(layoutLinks.length).to.equal(1);
      expect(layoutLinks[0].getAttribute('href')).to.equal('#main-content');
    });

    it('a plain-text brand is NOT a link', async () => {
      const el = await fixture(html`
        <dvfy-campaign-layout brand="Renting Ideal"><p>x</p></dvfy-campaign-layout>
      `);
      const brandText = el.querySelector('.dvfy-campaign-layout__brand-text');
      expect(brandText).to.exist;
      expect(brandText.closest('a')).to.equal(null);
    });
  });

  describe('optional brand mark', () => {
    it('renders no <header> when neither brand nor logo is set', async () => {
      const el = await fixture(html`<dvfy-campaign-layout><p>x</p></dvfy-campaign-layout>`);
      expect(el.querySelector('header')).to.equal(null);
    });

    it('renders a <header> with the brand text when brand is set', async () => {
      const el = await fixture(html`<dvfy-campaign-layout brand="Renting Ideal"><p>x</p></dvfy-campaign-layout>`);
      const header = el.querySelector('header');
      expect(header).to.exist;
      expect(header.textContent).to.contain('Renting Ideal');
    });

    it('renders a logo <img> with alt text when logo is set', async () => {
      const el = await fixture(html`
        <dvfy-campaign-layout brand="Renting Ideal" logo="/logo.svg"><p>x</p></dvfy-campaign-layout>
      `);
      const img = el.querySelector('header img');
      expect(img).to.exist;
      expect(img.getAttribute('alt')).to.equal('Renting Ideal');
    });
  });

  describe('home-href — single self-referential link only', () => {
    it('wraps the brand in exactly one self-link (header) when home-href is set', async () => {
      const el = await fixture(html`
        <dvfy-campaign-layout brand="Renting Ideal" home-href="#top"><p>x</p></dvfy-campaign-layout>
      `);
      const links = el.querySelectorAll('header a');
      expect(links.length).to.equal(1);
      expect(links[0].getAttribute('href')).to.equal('#top');
      expect(links[0].textContent).to.contain('Renting Ideal');
    });

    it('sanitizes a hostile home-href down to "#" (no off-page escape)', async () => {
      const el = await fixture(html`
        <dvfy-campaign-layout brand="X" home-href="javascript:alert(1)"><p>x</p></dvfy-campaign-layout>
      `);
      const link = el.querySelector('header a');
      expect(link.getAttribute('href')).to.equal('#');
    });
  });

  describe('footer slot — non-nav fine print only', () => {
    it('projects footer slot content into a <footer> landmark', async () => {
      const el = await fixture(html`
        <dvfy-campaign-layout brand="X">
          <p>body</p>
          <div slot="footer"><dvfy-text size="sm">© 2026 Renting Ideal</dvfy-text></div>
        </dvfy-campaign-layout>
      `);
      const footer = el.querySelector('footer');
      expect(footer).to.exist;
      expect(footer.textContent).to.contain('© 2026 Renting Ideal');
    });

    it('renders no <footer> when the footer slot is empty', async () => {
      const el = await fixture(html`<dvfy-campaign-layout><p>x</p></dvfy-campaign-layout>`);
      expect(el.querySelector('footer')).to.equal(null);
    });
  });

  describe('theming', () => {
    it('brand bar background is bound to a semantic surface token (theme-able)', async () => {
      // Bind the semantic token (themes supply this on <html>); assert the header consumes it.
      document.documentElement.style.setProperty('--dvfy-surface-raised', 'rgb(1, 2, 3)');
      const el = await fixture(html`<dvfy-campaign-layout brand="X"><p>y</p></dvfy-campaign-layout>`);
      const bg = getComputedStyle(el.querySelector('header')).backgroundColor;
      document.documentElement.style.removeProperty('--dvfy-surface-raised');
      expect(bg).to.equal('rgb(1, 2, 3)');
    });
  });

  describe('robustness', () => {
    it('does not double-wrap on reconnection', async () => {
      const el = await fixture(html`<dvfy-campaign-layout brand="X"><p>once</p></dvfy-campaign-layout>`);
      el.remove();
      document.body.appendChild(el);
      await el.updateComplete?.catch(() => {});
      expect(el.querySelectorAll('main').length).to.equal(1);
      expect(el.querySelectorAll('header').length).to.equal(1);
      expect(el.querySelectorAll('p').length).to.equal(1);
    });
  });
});
