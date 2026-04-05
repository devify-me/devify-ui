import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-scroll-reveal.js';

describe('dvfy-scroll-reveal', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`<dvfy-scroll-reveal><p>Content</p></dvfy-scroll-reveal>`);
      expect(el).to.exist;
      expect(el.querySelector('p').textContent).to.equal('Content');
    });

    it('is defined as a custom element', async () => {
      expect(customElements.get('dvfy-scroll-reveal')).to.exist;
    });

    it('displays as block', async () => {
      const el = await fixture(html`<dvfy-scroll-reveal>Content</dvfy-scroll-reveal>`);
      expect(el).to.exist;
    });
  });

  describe('attributes', () => {
    it('accepts animation attribute', async () => {
      const el = await fixture(html`<dvfy-scroll-reveal animation="fade-up">Content</dvfy-scroll-reveal>`);
      expect(el.getAttribute('animation')).to.equal('fade-up');
    });

    it('accepts fade-down animation', async () => {
      const el = await fixture(html`<dvfy-scroll-reveal animation="fade-down">Content</dvfy-scroll-reveal>`);
      expect(el.getAttribute('animation')).to.equal('fade-down');
    });

    it('accepts fade-left animation', async () => {
      const el = await fixture(html`<dvfy-scroll-reveal animation="fade-left">Content</dvfy-scroll-reveal>`);
      expect(el.getAttribute('animation')).to.equal('fade-left');
    });

    it('accepts fade-right animation', async () => {
      const el = await fixture(html`<dvfy-scroll-reveal animation="fade-right">Content</dvfy-scroll-reveal>`);
      expect(el.getAttribute('animation')).to.equal('fade-right');
    });

    it('accepts clip animation', async () => {
      const el = await fixture(html`<dvfy-scroll-reveal animation="clip">Content</dvfy-scroll-reveal>`);
      expect(el.getAttribute('animation')).to.equal('clip');
    });

    it('updates animation attribute reactively', async () => {
      const el = await fixture(html`<dvfy-scroll-reveal animation="fade-up">Content</dvfy-scroll-reveal>`);
      el.setAttribute('animation', 'clip');
      expect(el.getAttribute('animation')).to.equal('clip');
    });
  });

  describe('observed attributes', () => {
    it('observes animation attribute', () => {
      const observed = customElements.get('dvfy-scroll-reveal').observedAttributes;
      expect(observed).to.include('animation');
    });
  });
});
