import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-hamburger.js';

describe('dvfy-hamburger', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`<dvfy-hamburger></dvfy-hamburger>`);
      const btn = el.querySelector('.dvfy-hb__btn');
      expect(btn).to.exist;
      expect(btn.getAttribute('type')).to.equal('button');
    });

    it('renders three bars', async () => {
      const el = await fixture(html`<dvfy-hamburger></dvfy-hamburger>`);
      const bars = el.querySelectorAll('.dvfy-hb__bar');
      expect(bars.length).to.equal(3);
      expect(bars[0].classList.contains('dvfy-hb__bar--top')).to.be.true;
      expect(bars[1].classList.contains('dvfy-hb__bar--mid')).to.be.true;
      expect(bars[2].classList.contains('dvfy-hb__bar--bot')).to.be.true;
    });

    it('renders label when label attribute is set', async () => {
      const el = await fixture(html`<dvfy-hamburger label="Menu"></dvfy-hamburger>`);
      const lbl = el.querySelector('.dvfy-hb__label');
      expect(lbl).to.exist;
      expect(lbl.textContent).to.equal('Menu');
    });

    it('does not render label element when no label attribute', async () => {
      const el = await fixture(html`<dvfy-hamburger></dvfy-hamburger>`);
      const lbl = el.querySelector('.dvfy-hb__label');
      expect(lbl).to.not.exist;
    });
  });

  describe('attributes', () => {
    it('accepts size attribute', async () => {
      const el = await fixture(html`<dvfy-hamburger size="lg"></dvfy-hamburger>`);
      expect(el.getAttribute('size')).to.equal('lg');
    });

    it('accepts animation attribute', async () => {
      const el = await fixture(html`<dvfy-hamburger animation="x-rotate-r"></dvfy-hamburger>`);
      expect(el.getAttribute('animation')).to.equal('x-rotate-r');
    });

    it('accepts bordered attribute', async () => {
      const el = await fixture(html`<dvfy-hamburger bordered></dvfy-hamburger>`);
      expect(el.hasAttribute('bordered')).to.be.true;
    });

    it('accepts float attribute', async () => {
      const el = await fixture(html`<dvfy-hamburger float="top-right"></dvfy-hamburger>`);
      expect(el.getAttribute('float')).to.equal('top-right');
    });

    it('updates label text when attribute changes', async () => {
      const el = await fixture(html`<dvfy-hamburger label="Menu"></dvfy-hamburger>`);
      el.setAttribute('label', 'Navigation');
      const lbl = el.querySelector('.dvfy-hb__label');
      expect(lbl.textContent).to.equal('Navigation');
    });

    it('removes label element when label attribute is cleared', async () => {
      const el = await fixture(html`<dvfy-hamburger label="Menu"></dvfy-hamburger>`);
      el.removeAttribute('label');
      const lbl = el.querySelector('.dvfy-hb__label');
      expect(lbl).to.not.exist;
    });

    it('adds label element when label attribute is added after init', async () => {
      const el = await fixture(html`<dvfy-hamburger></dvfy-hamburger>`);
      el.setAttribute('label', 'Menu');
      const lbl = el.querySelector('.dvfy-hb__label');
      expect(lbl).to.exist;
      expect(lbl.textContent).to.equal('Menu');
    });
  });

  describe('open state', () => {
    it('starts closed by default', async () => {
      const el = await fixture(html`<dvfy-hamburger></dvfy-hamburger>`);
      expect(el.open).to.be.false;
      expect(el.hasAttribute('open')).to.be.false;
      const btn = el.querySelector('.dvfy-hb__btn');
      expect(btn.getAttribute('aria-expanded')).to.equal('false');
    });

    it('reflects open property to attribute', async () => {
      const el = await fixture(html`<dvfy-hamburger></dvfy-hamburger>`);
      el.open = true;
      expect(el.hasAttribute('open')).to.be.true;
      const btn = el.querySelector('.dvfy-hb__btn');
      expect(btn.getAttribute('aria-expanded')).to.equal('true');
    });

    it('reflects open attribute to property', async () => {
      const el = await fixture(html`<dvfy-hamburger open></dvfy-hamburger>`);
      expect(el.open).to.be.true;
    });

    it('closes when open is set to false', async () => {
      const el = await fixture(html`<dvfy-hamburger open></dvfy-hamburger>`);
      el.open = false;
      expect(el.hasAttribute('open')).to.be.false;
    });
  });

  describe('disabled state', () => {
    it('sets aria-disabled on button when disabled', async () => {
      const el = await fixture(html`<dvfy-hamburger disabled></dvfy-hamburger>`);
      const btn = el.querySelector('.dvfy-hb__btn');
      expect(btn.getAttribute('aria-disabled')).to.equal('true');
    });

    it('does not toggle when disabled', async () => {
      const el = await fixture(html`<dvfy-hamburger disabled></dvfy-hamburger>`);
      const btn = el.querySelector('.dvfy-hb__btn');
      btn.click();
      expect(el.open).to.be.false;
    });
  });

  describe('events', () => {
    it('fires toggle event on click', async () => {
      const el = await fixture(html`<dvfy-hamburger></dvfy-hamburger>`);
      const btn = el.querySelector('.dvfy-hb__btn');
      setTimeout(() => btn.click());
      const event = await oneEvent(el, 'toggle');
      expect(event.detail.open).to.be.true;
    });

    it('fires toggle event with open=false when closing', async () => {
      const el = await fixture(html`<dvfy-hamburger open></dvfy-hamburger>`);
      const btn = el.querySelector('.dvfy-hb__btn');
      setTimeout(() => btn.click());
      const event = await oneEvent(el, 'toggle');
      expect(event.detail.open).to.be.false;
    });

    it('does not fire toggle event when disabled', async () => {
      const el = await fixture(html`<dvfy-hamburger disabled></dvfy-hamburger>`);
      const btn = el.querySelector('.dvfy-hb__btn');
      let fired = false;
      el.addEventListener('toggle', () => { fired = true; });
      btn.click();
      expect(fired).to.be.false;
    });
  });

  describe('keyboard interaction', () => {
    it('toggles on Enter key', async () => {
      const el = await fixture(html`<dvfy-hamburger></dvfy-hamburger>`);
      const btn = el.querySelector('.dvfy-hb__btn');
      setTimeout(() => btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
      const event = await oneEvent(el, 'toggle');
      expect(event.detail.open).to.be.true;
    });

    it('toggles on Space key', async () => {
      const el = await fixture(html`<dvfy-hamburger></dvfy-hamburger>`);
      const btn = el.querySelector('.dvfy-hb__btn');
      setTimeout(() => btn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })));
      const event = await oneEvent(el, 'toggle');
      expect(event.detail.open).to.be.true;
    });
  });

  describe('ARIA', () => {
    it('sets aria-label on button', async () => {
      const el = await fixture(html`<dvfy-hamburger></dvfy-hamburger>`);
      const btn = el.querySelector('.dvfy-hb__btn');
      expect(btn.getAttribute('aria-label')).to.equal('Toggle menu');
    });

    it('uses label text as aria-label when provided', async () => {
      const el = await fixture(html`<dvfy-hamburger label="Navigation"></dvfy-hamburger>`);
      const btn = el.querySelector('.dvfy-hb__btn');
      expect(btn.getAttribute('aria-label')).to.equal('Navigation');
    });

    it('has aria-expanded reflecting open state', async () => {
      const el = await fixture(html`<dvfy-hamburger></dvfy-hamburger>`);
      const btn = el.querySelector('.dvfy-hb__btn');
      expect(btn.getAttribute('aria-expanded')).to.equal('false');
      el.open = true;
      expect(btn.getAttribute('aria-expanded')).to.equal('true');
    });
  });
});
