import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-stagger-enter.js';

describe('dvfy-stagger-enter', () => {
  describe('rendering', () => {
    it('renders with child elements', async () => {
      const el = await fixture(html`
        <dvfy-stagger-enter>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </dvfy-stagger-enter>
      `);
      expect(el.children.length).to.equal(3);
    });

    it('is defined as a custom element', async () => {
      expect(customElements.get('dvfy-stagger-enter')).to.exist;
    });
  });

  describe('direction attribute', () => {
    it('sets data-direction=up by default', async () => {
      const el = await fixture(html`<dvfy-stagger-enter><div>Item</div></dvfy-stagger-enter>`);
      expect(el.getAttribute('data-direction')).to.equal('up');
    });

    it('sets data-direction from direction attribute', async () => {
      const el = await fixture(html`<dvfy-stagger-enter direction="left"><div>Item</div></dvfy-stagger-enter>`);
      expect(el.getAttribute('data-direction')).to.equal('left');
    });

    it('updates data-direction when direction changes', async () => {
      const el = await fixture(html`<dvfy-stagger-enter direction="up"><div>Item</div></dvfy-stagger-enter>`);
      el.setAttribute('direction', 'right');
      expect(el.getAttribute('data-direction')).to.equal('right');
    });

    it('removes data-direction when direction=none', async () => {
      const el = await fixture(html`<dvfy-stagger-enter direction="none"><div>Item</div></dvfy-stagger-enter>`);
      expect(el.hasAttribute('data-direction')).to.be.false;
    });

    it('accepts down direction', async () => {
      const el = await fixture(html`<dvfy-stagger-enter direction="down"><div>Item</div></dvfy-stagger-enter>`);
      expect(el.getAttribute('data-direction')).to.equal('down');
    });
  });

  describe('token attributes', () => {
    it('sets --dvfy-stagger-delay CSS property', async () => {
      const el = await fixture(html`<dvfy-stagger-enter delay="0.1"><div>Item</div></dvfy-stagger-enter>`);
      expect(el.style.getPropertyValue('--dvfy-stagger-delay')).to.equal('0.1s');
    });

    it('sets --dvfy-stagger-duration CSS property', async () => {
      const el = await fixture(html`<dvfy-stagger-enter duration="0.5"><div>Item</div></dvfy-stagger-enter>`);
      expect(el.style.getPropertyValue('--dvfy-stagger-duration')).to.equal('0.5s');
    });

    it('sets --dvfy-stagger-easing CSS property', async () => {
      const el = await fixture(html`<dvfy-stagger-enter easing="ease-in-out"><div>Item</div></dvfy-stagger-enter>`);
      expect(el.style.getPropertyValue('--dvfy-stagger-easing')).to.equal('ease-in-out');
    });

    it('sets --dvfy-stagger-distance CSS property', async () => {
      const el = await fixture(html`<dvfy-stagger-enter distance="30px"><div>Item</div></dvfy-stagger-enter>`);
      expect(el.style.getPropertyValue('--dvfy-stagger-distance')).to.equal('30px');
    });

    it('appends s to bare number for delay', async () => {
      const el = await fixture(html`<dvfy-stagger-enter delay="0.12"><div>Item</div></dvfy-stagger-enter>`);
      expect(el.style.getPropertyValue('--dvfy-stagger-delay')).to.equal('0.12s');
    });

    it('does not append s to non-bare-number values', async () => {
      const el = await fixture(html`<dvfy-stagger-enter distance="2rem"><div>Item</div></dvfy-stagger-enter>`);
      expect(el.style.getPropertyValue('--dvfy-stagger-distance')).to.equal('2rem');
    });

    it('removes CSS property when attribute is removed', async () => {
      const el = await fixture(html`<dvfy-stagger-enter delay="0.1"><div>Item</div></dvfy-stagger-enter>`);
      el.removeAttribute('delay');
      expect(el.style.getPropertyValue('--dvfy-stagger-delay')).to.equal('');
    });
  });

  describe('observed attributes', () => {
    it('observes all configurable attributes', () => {
      const observed = customElements.get('dvfy-stagger-enter').observedAttributes;
      expect(observed).to.include('direction');
      expect(observed).to.include('delay');
      expect(observed).to.include('duration');
      expect(observed).to.include('easing');
      expect(observed).to.include('distance');
    });
  });
});
