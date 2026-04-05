import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-text-vortex.js';

describe('dvfy-text-vortex', () => {
  describe('rendering', () => {
    it('renders and splits text into character spans', async () => {
      const el = await fixture(html`<dvfy-text-vortex>Hello</dvfy-text-vortex>`);
      const chars = el.querySelectorAll('.dvfy-char');
      expect(chars.length).to.equal(5);
    });

    it('is defined as a custom element', async () => {
      expect(customElements.get('dvfy-text-vortex')).to.exist;
    });

    it('creates vortex container', async () => {
      const el = await fixture(html`<dvfy-text-vortex>Spiral</dvfy-text-vortex>`);
      const container = el.querySelector('.dvfy-vortex-container');
      expect(container).to.exist;
    });

    it('creates chars wrapper', async () => {
      const el = await fixture(html`<dvfy-text-vortex>Test</dvfy-text-vortex>`);
      const wrapper = el.querySelector('.dvfy-vortex-chars');
      expect(wrapper).to.exist;
    });

    it('replaces spaces with non-breaking spaces', async () => {
      const el = await fixture(html`<dvfy-text-vortex>A B</dvfy-text-vortex>`);
      const chars = el.querySelectorAll('.dvfy-char');
      // 'A', ' ', 'B' = 3 spans
      expect(chars.length).to.equal(3);
      expect(chars[1].textContent).to.equal('\u00A0');
    });

    it('handles empty content gracefully', async () => {
      const el = await fixture(html`<dvfy-text-vortex></dvfy-text-vortex>`);
      const chars = el.querySelectorAll('.dvfy-char');
      expect(chars.length).to.equal(0);
    });
  });

  describe('attributes', () => {
    it('applies depth as CSS custom property', async () => {
      const el = await fixture(html`<dvfy-text-vortex depth="5">Spin</dvfy-text-vortex>`);
      expect(el.style.getPropertyValue('--dvfy-vortex-depth')).to.equal('5');
    });

    it('applies font-size as CSS custom property', async () => {
      const el = await fixture(html`<dvfy-text-vortex font-size="3rem">Big</dvfy-text-vortex>`);
      expect(el.style.getPropertyValue('--dvfy-vortex-font-size')).to.equal('3rem');
    });

    it('applies color as CSS custom property', async () => {
      const el = await fixture(html`<dvfy-text-vortex color="red">Red</dvfy-text-vortex>`);
      expect(el.style.getPropertyValue('--dvfy-vortex-color')).to.equal('red');
    });

    it('removes CSS property when attribute is removed', async () => {
      const el = await fixture(html`<dvfy-text-vortex depth="5">Spin</dvfy-text-vortex>`);
      el.removeAttribute('depth');
      expect(el.style.getPropertyValue('--dvfy-vortex-depth')).to.equal('');
    });
  });

  describe('accessibility', () => {
    it('vortex container has aria-hidden=true', async () => {
      const el = await fixture(html`<dvfy-text-vortex>Accessible</dvfy-text-vortex>`);
      const container = el.querySelector('.dvfy-vortex-container');
      expect(container.getAttribute('aria-hidden')).to.equal('true');
    });

    it('preserves screen-reader text in visually hidden span', async () => {
      const el = await fixture(html`<dvfy-text-vortex>Screen Reader</dvfy-text-vortex>`);
      // First child should be the SR span
      const srSpan = el.firstElementChild;
      expect(srSpan.textContent).to.equal('Screen Reader');
    });
  });

  describe('observed attributes', () => {
    it('observes depth, font-size, and color', () => {
      const observed = customElements.get('dvfy-text-vortex').observedAttributes;
      expect(observed).to.include('depth');
      expect(observed).to.include('font-size');
      expect(observed).to.include('color');
    });
  });
});
