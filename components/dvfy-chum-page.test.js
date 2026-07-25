import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-chum-page.js';

describe('dvfy-chum-page', () => {
  it('is defined as a custom element', () => {
    expect(customElements.get('dvfy-chum-page')).to.exist;
  });

  describe('page scaffold', () => {
    it('projects default-slot content into a <main id="main-content"> landmark', async () => {
      const el = await fixture(html`
        <dvfy-chum-page>
          <dvfy-optin heading="Get the guide"></dvfy-optin>
        </dvfy-chum-page>
      `);
      const main = el.querySelector('main#main-content');
      expect(main, 'a single <main id="main-content"> landmark').to.exist;
      expect(main.querySelector('dvfy-optin')).to.exist;
    });

    it('renders exactly one <main> (skip-link target / single conversion path)', async () => {
      const el = await fixture(html`<dvfy-chum-page><p>body</p></dvfy-chum-page>`);
      expect(el.querySelectorAll('main').length).to.equal(1);
    });

    it('is a block-level element', async () => {
      const el = await fixture(html`<dvfy-chum-page>x</dvfy-chum-page>`);
      expect(getComputedStyle(el).display).to.equal('block');
    });
  });

  describe('1:1 attention ratio — NO navigation menu', () => {
    it('renders zero <dvfy-nav-menu> / <dvfy-nav> escape routes', async () => {
      const el = await fixture(html`
        <dvfy-chum-page brand="Renting Ideal"><dvfy-optin></dvfy-optin></dvfy-chum-page>
      `);
      expect(el.querySelectorAll('dvfy-nav-menu, dvfy-nav').length).to.equal(0);
    });

    it('the brand bar emits zero links when no home-href is given', async () => {
      const el = await fixture(html`
        <dvfy-chum-page brand="Renting Ideal"><dvfy-optin></dvfy-optin></dvfy-chum-page>
      `);
      expect(el.querySelectorAll('header a').length).to.equal(0);
    });

    it('the only layout-owned <a> is the same-page skip link to #main-content', async () => {
      const el = await fixture(html`
        <dvfy-chum-page brand="Renting Ideal"><dvfy-optin></dvfy-optin></dvfy-chum-page>
      `);
      const layoutLinks = [...el.querySelectorAll('a')].filter(a => !a.closest('main'));
      expect(layoutLinks.length).to.equal(1);
      expect(layoutLinks[0].getAttribute('href')).to.equal('#main-content');
    });

    it('a plain-text brand is NOT a link', async () => {
      const el = await fixture(html`<dvfy-chum-page brand="Renting Ideal"><p>x</p></dvfy-chum-page>`);
      const brandText = el.querySelector('.dvfy-chum-page__brand-text');
      expect(brandText).to.exist;
      expect(brandText.closest('a')).to.equal(null);
    });
  });

  describe('optional brand mark', () => {
    it('renders no <header> when neither brand nor logo is set', async () => {
      const el = await fixture(html`<dvfy-chum-page><p>x</p></dvfy-chum-page>`);
      expect(el.querySelector('header')).to.equal(null);
    });

    it('renders a <header> with the brand text when brand is set', async () => {
      const el = await fixture(html`<dvfy-chum-page brand="Renting Ideal"><p>x</p></dvfy-chum-page>`);
      const header = el.querySelector('header');
      expect(header).to.exist;
      expect(header.textContent).to.contain('Renting Ideal');
    });

    it('renders a logo <img> with alt text when logo is set', async () => {
      const el = await fixture(html`
        <dvfy-chum-page brand="Renting Ideal" logo="/logo.svg"><p>x</p></dvfy-chum-page>
      `);
      const img = el.querySelector('header img');
      expect(img).to.exist;
      expect(img.getAttribute('alt')).to.equal('Renting Ideal');
    });
  });

  describe('home-href — single self-referential link only', () => {
    it('wraps the brand in exactly one self-link when home-href is set', async () => {
      const el = await fixture(html`
        <dvfy-chum-page brand="Renting Ideal" home-href="#top"><p>x</p></dvfy-chum-page>
      `);
      const links = el.querySelectorAll('header a');
      expect(links.length).to.equal(1);
      expect(links[0].getAttribute('href')).to.equal('#top');
      expect(links[0].textContent).to.contain('Renting Ideal');
    });

    it('sanitizes a hostile home-href down to "#"', async () => {
      const el = await fixture(html`
        <dvfy-chum-page brand="X" home-href="javascript:alert(1)"><p>x</p></dvfy-chum-page>
      `);
      expect(el.querySelector('header a').getAttribute('href')).to.equal('#');
    });
  });

  describe('footer slot — non-nav fine print only', () => {
    it('projects footer slot content into a <footer> landmark', async () => {
      const el = await fixture(html`
        <dvfy-chum-page brand="X">
          <dvfy-optin></dvfy-optin>
          <div slot="footer"><dvfy-text size="sm">© 2026 Renting Ideal</dvfy-text></div>
        </dvfy-chum-page>
      `);
      const footer = el.querySelector('footer');
      expect(footer).to.exist;
      expect(footer.textContent).to.contain('© 2026 Renting Ideal');
    });

    it('renders no <footer> when the footer slot is empty', async () => {
      const el = await fixture(html`<dvfy-chum-page><p>x</p></dvfy-chum-page>`);
      expect(el.querySelector('footer')).to.equal(null);
    });
  });

  describe('theming', () => {
    it('brand bar background is bound to a semantic surface token', async () => {
      document.documentElement.style.setProperty('--dvfy-surface-raised', 'rgb(1, 2, 3)');
      const el = await fixture(html`<dvfy-chum-page brand="X"><p>y</p></dvfy-chum-page>`);
      const bg = getComputedStyle(el.querySelector('header')).backgroundColor;
      document.documentElement.style.removeProperty('--dvfy-surface-raised');
      expect(bg).to.equal('rgb(1, 2, 3)');
    });
  });

  describe('robustness', () => {
    it('does not double-wrap on reconnection', async () => {
      const el = await fixture(html`<dvfy-chum-page brand="X"><p>once</p></dvfy-chum-page>`);
      el.remove();
      document.body.appendChild(el);
      await el.updateComplete?.catch(() => {});
      expect(el.querySelectorAll('main').length).to.equal(1);
      expect(el.querySelectorAll('header').length).to.equal(1);
      expect(el.querySelectorAll('p').length).to.equal(1);
    });
  });
});
