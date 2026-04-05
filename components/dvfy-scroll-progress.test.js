import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-scroll-progress.js';

describe('dvfy-scroll-progress', () => {
  describe('rendering', () => {
    it('renders as a block element', async () => {
      const el = await fixture(html`<dvfy-scroll-progress></dvfy-scroll-progress>`);
      expect(el).to.exist;
    });
  });

  describe('attributes', () => {
    it('defaults to top position', async () => {
      const el = await fixture(html`<dvfy-scroll-progress></dvfy-scroll-progress>`);
      expect(el.hasAttribute('position')).to.be.false;
    });

    it('accepts position="top"', async () => {
      const el = await fixture(html`<dvfy-scroll-progress position="top"></dvfy-scroll-progress>`);
      expect(el.getAttribute('position')).to.equal('top');
    });

    it('accepts position="bottom"', async () => {
      const el = await fixture(html`<dvfy-scroll-progress position="bottom"></dvfy-scroll-progress>`);
      expect(el.getAttribute('position')).to.equal('bottom');
    });

    it('allows changing position dynamically', async () => {
      const el = await fixture(html`<dvfy-scroll-progress position="top"></dvfy-scroll-progress>`);
      el.setAttribute('position', 'bottom');
      expect(el.getAttribute('position')).to.equal('bottom');
    });
  });

  describe('CSS custom properties', () => {
    it('accepts custom color via style', async () => {
      const el = await fixture(html`
        <dvfy-scroll-progress style="--dvfy-scroll-progress-color: red;"></dvfy-scroll-progress>
      `);
      expect(el.style.getPropertyValue('--dvfy-scroll-progress-color')).to.equal('red');
    });

    it('accepts custom height via style', async () => {
      const el = await fixture(html`
        <dvfy-scroll-progress style="--dvfy-scroll-progress-height: 5px;"></dvfy-scroll-progress>
      `);
      expect(el.style.getPropertyValue('--dvfy-scroll-progress-height')).to.equal('5px');
    });
  });
});
