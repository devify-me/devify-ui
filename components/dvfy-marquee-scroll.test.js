import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-marquee-scroll.js';

describe('dvfy-marquee-scroll', () => {
  describe('rendering', () => {
    it('renders track with two content copies', async () => {
      const el = await fixture(html`
        <dvfy-marquee-scroll>
          <span>Hello</span>
          <span>World</span>
        </dvfy-marquee-scroll>
      `);
      const track = el.querySelector('.dvfy-marquee-track');
      expect(track).to.not.be.null;
      const items = track.querySelectorAll('.dvfy-marquee-item');
      expect(items.length).to.equal(2);
    });

    it('renders screen-reader label', async () => {
      const el = await fixture(html`
        <dvfy-marquee-scroll>
          <span>Design Systems</span>
        </dvfy-marquee-scroll>
      `);
      // The SR-only span is visually hidden but present
      const srSpan = el.querySelector('span[style*="clip"]');
      expect(srSpan).to.not.be.null;
      expect(srSpan.textContent).to.include('Design Systems');
    });

    it('hides track from assistive technology', async () => {
      const el = await fixture(html`
        <dvfy-marquee-scroll><span>Text</span></dvfy-marquee-scroll>
      `);
      const track = el.querySelector('.dvfy-marquee-track');
      expect(track.getAttribute('aria-hidden')).to.equal('true');
    });
  });

  describe('attributes', () => {
    it('accepts speed attribute', async () => {
      const el = await fixture(html`
        <dvfy-marquee-scroll speed="2"><span>Fast</span></dvfy-marquee-scroll>
      `);
      expect(el.getAttribute('speed')).to.equal('2');
    });

    it('accepts direction attribute', async () => {
      const el = await fixture(html`
        <dvfy-marquee-scroll direction="right"><span>Right</span></dvfy-marquee-scroll>
      `);
      expect(el.getAttribute('direction')).to.equal('right');
    });

    it('accepts multiplier attribute', async () => {
      const el = await fixture(html`
        <dvfy-marquee-scroll multiplier="5"><span>Boost</span></dvfy-marquee-scroll>
      `);
      expect(el.getAttribute('multiplier')).to.equal('5');
    });

    it('applies gap as CSS custom property', async () => {
      const el = await fixture(html`
        <dvfy-marquee-scroll gap="2rem"><span>Spaced</span></dvfy-marquee-scroll>
      `);
      expect(el.style.getPropertyValue('--dvfy-marquee-gap')).to.equal('2rem');
    });

    it('removes gap custom property when attribute is removed', async () => {
      const el = await fixture(html`
        <dvfy-marquee-scroll gap="2rem"><span>Text</span></dvfy-marquee-scroll>
      `);
      el.removeAttribute('gap');
      expect(el.style.getPropertyValue('--dvfy-marquee-gap')).to.equal('');
    });
  });

  describe('content duplication', () => {
    it('duplicates all child nodes into both marquee items', async () => {
      const el = await fixture(html`
        <dvfy-marquee-scroll>
          <span>A</span>
          <span>B</span>
          <span>C</span>
        </dvfy-marquee-scroll>
      `);
      const items = el.querySelectorAll('.dvfy-marquee-item');
      expect(items[0].querySelectorAll('span').length).to.equal(3);
      expect(items[1].querySelectorAll('span').length).to.equal(3);
    });
  });
});
