import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-nav.js';
import './dvfy-nav-menu.js';
import './dvfy-hamburger.js';
import './dvfy-drawer.js';
import './dvfy-nav-bar.js';

describe('dvfy-nav-bar', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`<dvfy-nav-bar brand="Devify"></dvfy-nav-bar>`);
      const bar = el.querySelector('.dvfy-nav-bar__bar');
      expect(bar).to.exist;
      expect(bar.getAttribute('role')).to.equal('navigation');
      expect(bar.getAttribute('aria-label')).to.equal('Main navigation');
    });

    it('renders brand text', async () => {
      const el = await fixture(html`<dvfy-nav-bar brand="Devify"></dvfy-nav-bar>`);
      const brandText = el.querySelector('.dvfy-nav-bar__brand-text');
      expect(brandText).to.exist;
      expect(brandText.textContent).to.equal('Devify');
    });

    it('renders logo image when logo attribute is set', async () => {
      const el = await fixture(html`<dvfy-nav-bar logo="https://example.com/logo.png" brand="Test"></dvfy-nav-bar>`);
      const img = el.querySelector('.dvfy-nav-bar__logo');
      expect(img).to.exist;
      expect(img.src).to.include('logo.png');
    });

    it('renders skip-to-content link', async () => {
      const el = await fixture(html`<dvfy-nav-bar brand="Test"></dvfy-nav-bar>`);
      const skip = el.querySelector('.dvfy-nav-bar__skip');
      expect(skip).to.exist;
      expect(skip.getAttribute('href')).to.equal('#main-content');
      expect(skip.textContent).to.equal('Skip to content');
    });

    it('renders tagline when set', async () => {
      const el = await fixture(html`<dvfy-nav-bar brand="Devify" tagline="Build Fast"></dvfy-nav-bar>`);
      const tagline = el.querySelector('.dvfy-nav-bar__tagline');
      expect(tagline).to.exist;
      expect(tagline.textContent).to.equal('Build Fast');
    });
  });

  describe('attributes', () => {
    it('updates brand text when attribute changes', async () => {
      const el = await fixture(html`<dvfy-nav-bar brand="Old"></dvfy-nav-bar>`);
      el.setAttribute('brand', 'New');
      const brandText = el.querySelector('.dvfy-nav-bar__brand-text');
      expect(brandText.textContent).to.equal('New');
    });

    it('updates logo src when attribute changes', async () => {
      const el = await fixture(html`<dvfy-nav-bar logo="https://example.com/a.png" brand="Test"></dvfy-nav-bar>`);
      el.setAttribute('logo', 'https://example.com/b.png');
      const img = el.querySelector('.dvfy-nav-bar__logo');
      expect(img.src).to.include('b.png');
    });

    it('accepts sticky attribute', async () => {
      const el = await fixture(html`<dvfy-nav-bar brand="Test" sticky></dvfy-nav-bar>`);
      expect(el.hasAttribute('sticky')).to.be.true;
    });

    it('accepts custom breakpoint', async () => {
      const el = await fixture(html`<dvfy-nav-bar brand="Test" breakpoint="1024"></dvfy-nav-bar>`);
      expect(el.getAttribute('breakpoint')).to.equal('1024');
    });

    it('sets default brand link to /', async () => {
      const el = await fixture(html`<dvfy-nav-bar brand="Test"></dvfy-nav-bar>`);
      const brand = el.querySelector('.dvfy-nav-bar__brand');
      expect(brand.getAttribute('href')).to.equal('/');
    });

    it('sets custom brand link from href attribute', async () => {
      const el = await fixture(html`<dvfy-nav-bar brand="Test" href="/home"></dvfy-nav-bar>`);
      const brand = el.querySelector('.dvfy-nav-bar__brand');
      expect(brand.getAttribute('href')).to.include('/home');
    });
  });

  describe('slot handling', () => {
    it('places dvfy-nav-menu in the bar', async () => {
      const el = await fixture(html`
        <dvfy-nav-bar brand="Test">
          <dvfy-nav-menu>
            <dvfy-nav href="/docs">Docs</dvfy-nav>
          </dvfy-nav-menu>
        </dvfy-nav-bar>
      `);
      const bar = el.querySelector('.dvfy-nav-bar__bar');
      const menu = bar.querySelector('dvfy-nav-menu');
      expect(menu).to.exist;
    });

    it('places non-menu children in actions container', async () => {
      const el = await fixture(html`
        <dvfy-nav-bar brand="Test">
          <button>Sign In</button>
        </dvfy-nav-bar>
      `);
      const actions = el.querySelector('.dvfy-nav-bar__actions');
      expect(actions).to.exist;
      expect(actions.querySelector('button')).to.exist;
    });
  });

  describe('mobile drawer', () => {
    it('creates hamburger button', async () => {
      const el = await fixture(html`<dvfy-nav-bar brand="Test"></dvfy-nav-bar>`);
      const hamburger = el.querySelector('.dvfy-nav-bar__hamburger');
      expect(hamburger).to.exist;
      expect(hamburger.tagName).to.equal('DVFY-HAMBURGER');
    });

    it('creates overlay', async () => {
      const el = await fixture(html`<dvfy-nav-bar brand="Test"></dvfy-nav-bar>`);
      const overlay = el.querySelector('.dvfy-nav-bar__overlay');
      expect(overlay).to.exist;
    });

    it('creates mobile drawer wrapper', async () => {
      const el = await fixture(html`<dvfy-nav-bar brand="Test"></dvfy-nav-bar>`);
      const drawer = el.querySelector('.dvfy-nav-bar__mobile-drawer');
      expect(drawer).to.exist;
    });

    it('passes animation attribute to hamburger', async () => {
      const el = await fixture(html`<dvfy-nav-bar brand="Test" animation="x-rotate-r"></dvfy-nav-bar>`);
      const hamburger = el.querySelector('.dvfy-nav-bar__hamburger');
      expect(hamburger.getAttribute('animation')).to.equal('x-rotate-r');
    });
  });

  describe('keyboard', () => {
    it('closes menu on Escape key', async () => {
      const el = await fixture(html`
        <dvfy-nav-bar brand="Test">
          <dvfy-nav-menu>
            <dvfy-nav href="/docs">Docs</dvfy-nav>
          </dvfy-nav-menu>
        </dvfy-nav-bar>
      `);
      // Open the overlay manually
      const overlay = el.querySelector('.dvfy-nav-bar__overlay');
      const drawerWrap = el.querySelector('.dvfy-nav-bar__mobile-drawer');
      overlay.setAttribute('data-open', '');
      drawerWrap.setAttribute('data-open', '');
      const hamburger = el.querySelector('.dvfy-nav-bar__hamburger');
      hamburger.open = true;

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      expect(overlay.hasAttribute('data-open')).to.be.false;
      expect(drawerWrap.hasAttribute('data-open')).to.be.false;
    });
  });

  describe('cleanup', () => {
    it('removes responsive style on disconnect', async () => {
      const el = await fixture(html`<dvfy-nav-bar brand="Test"></dvfy-nav-bar>`);
      const barId = el.getAttribute('data-nav-bar-id');
      expect(document.getElementById(`dvfy-nav-bar-responsive-${barId}`)).to.exist;
      el.remove();
      el.disconnectedCallback();
      expect(document.getElementById(`dvfy-nav-bar-responsive-${barId}`)).to.not.exist;
    });
  });
});
