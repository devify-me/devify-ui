import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-scramble-hover.js';

describe('dvfy-scramble-hover', () => {
  describe('rendering', () => {
    it('renders and splits text into character spans', async () => {
      const el = await fixture(html`<dvfy-scramble-hover>Hello</dvfy-scramble-hover>`);
      const chars = el.querySelectorAll('.dvfy-scramble-char');
      expect(chars.length).to.equal(5);
    });

    it('is defined as a custom element', async () => {
      expect(customElements.get('dvfy-scramble-hover')).to.exist;
    });

    it('preserves original text in data-original', async () => {
      const el = await fixture(html`<dvfy-scramble-hover>AB</dvfy-scramble-hover>`);
      const chars = el.querySelectorAll('.dvfy-scramble-char');
      expect(chars[0].dataset.original).to.equal('A');
      expect(chars[1].dataset.original).to.equal('B');
    });

    it('replaces spaces with non-breaking spaces', async () => {
      const el = await fixture(html`<dvfy-scramble-hover>A B</dvfy-scramble-hover>`);
      const chars = el.querySelectorAll('.dvfy-scramble-char');
      expect(chars[1].textContent).to.equal('\u00A0');
      expect(chars[1].dataset.original).to.equal(' ');
    });

    it('handles empty content gracefully', async () => {
      const el = await fixture(html`<dvfy-scramble-hover></dvfy-scramble-hover>`);
      const chars = el.querySelectorAll('.dvfy-scramble-char');
      expect(chars.length).to.equal(0);
    });
  });

  describe('attributes', () => {
    it('accepts speed attribute', async () => {
      const el = await fixture(html`<dvfy-scramble-hover speed="40">Text</dvfy-scramble-hover>`);
      expect(el.getAttribute('speed')).to.equal('40');
    });

    it('accepts duration attribute', async () => {
      const el = await fixture(html`<dvfy-scramble-hover duration="600">Text</dvfy-scramble-hover>`);
      expect(el.getAttribute('duration')).to.equal('600');
    });

    it('accepts charset attribute', async () => {
      const el = await fixture(html`<dvfy-scramble-hover charset="abc">Text</dvfy-scramble-hover>`);
      expect(el.getAttribute('charset')).to.equal('abc');
    });

    it('accepts trigger attribute', async () => {
      const el = await fixture(html`<dvfy-scramble-hover trigger="visible">Text</dvfy-scramble-hover>`);
      expect(el.getAttribute('trigger')).to.equal('visible');
    });
  });

  describe('accessibility', () => {
    it('sets aria-label with original text', async () => {
      const el = await fixture(html`<dvfy-scramble-hover>Hello World</dvfy-scramble-hover>`);
      expect(el.getAttribute('aria-label')).to.equal('Hello World');
    });

    it('character spans have aria-hidden=true', async () => {
      const el = await fixture(html`<dvfy-scramble-hover>AB</dvfy-scramble-hover>`);
      const chars = el.querySelectorAll('.dvfy-scramble-char');
      expect(chars[0].getAttribute('aria-hidden')).to.equal('true');
      expect(chars[1].getAttribute('aria-hidden')).to.equal('true');
    });

    it('contains a visually hidden span with full text', async () => {
      const el = await fixture(html`<dvfy-scramble-hover>Screen Reader</dvfy-scramble-hover>`);
      // SR-only span is the first child span without dvfy-scramble-char class
      const spans = el.querySelectorAll('span:not(.dvfy-scramble-char)');
      const srSpan = Array.from(spans).find(s => s.textContent === 'Screen Reader');
      expect(srSpan).to.exist;
    });
  });

  describe('play API', () => {
    it('exposes play() method', async () => {
      const el = await fixture(html`<dvfy-scramble-hover>Text</dvfy-scramble-hover>`);
      expect(el.play).to.be.a('function');
    });
  });

  describe('observed attributes', () => {
    it('observes speed, duration, charset, and trigger', () => {
      const observed = customElements.get('dvfy-scramble-hover').observedAttributes;
      expect(observed).to.include('speed');
      expect(observed).to.include('duration');
      expect(observed).to.include('charset');
      expect(observed).to.include('trigger');
    });
  });
});
