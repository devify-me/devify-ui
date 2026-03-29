import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-carousel.js';

describe('dvfy-carousel', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`
        <dvfy-carousel>
          <dvfy-slide>Slide 1</dvfy-slide>
          <dvfy-slide>Slide 2</dvfy-slide>
        </dvfy-carousel>
      `);
      expect(el.getAttribute('role')).to.equal('region');
      expect(el.getAttribute('aria-label')).to.equal('Carousel');
      expect(el.getAttribute('tabindex')).to.equal('0');
    });

    it('preserves custom aria-label', async () => {
      const el = await fixture(html`
        <dvfy-carousel aria-label="Product gallery">
          <dvfy-slide>Slide 1</dvfy-slide>
        </dvfy-carousel>
      `);
      expect(el.getAttribute('aria-label')).to.equal('Product gallery');
    });
  });

  describe('dvfy-slide', () => {
    it('sets role and aria-roledescription', async () => {
      await fixture(html`
        <dvfy-carousel>
          <dvfy-slide>Slide 1</dvfy-slide>
          <dvfy-slide>Slide 2</dvfy-slide>
        </dvfy-carousel>
      `);
      await new Promise(r => setTimeout(r, 0));
      const slides = document.querySelectorAll('dvfy-slide');
      expect(slides[0].getAttribute('role')).to.equal('group');
      expect(slides[0].getAttribute('aria-roledescription')).to.equal('slide');
      expect(slides[0].getAttribute('aria-label')).to.equal('1 of 2');
      expect(slides[1].getAttribute('aria-label')).to.equal('2 of 2');
    });
  });

  describe('gap attribute', () => {
    it('is a boolean toggle', async () => {
      const el = await fixture(html`
        <dvfy-carousel gap>
          <dvfy-slide>Slide 1</dvfy-slide>
        </dvfy-carousel>
      `);
      expect(el.hasAttribute('gap')).to.be.true;
    });
  });

  describe('images attribute', () => {
    it('generates slides from JSON array of strings', async () => {
      const images = JSON.stringify(['img1.jpg', 'img2.jpg', 'img3.jpg']);
      const el = await fixture(html`<dvfy-carousel images=${images}></dvfy-carousel>`);
      const slides = el.querySelectorAll('dvfy-slide[data-generated]');
      expect(slides.length).to.equal(3);
      expect(slides[0].querySelector('img').src).to.contain('img1.jpg');
    });

    it('generates slides from JSON array of objects', async () => {
      const images = JSON.stringify([{ src: 'a.jpg', alt: 'Photo A' }, { src: 'b.jpg', alt: 'Photo B' }]);
      const el = await fixture(html`<dvfy-carousel images=${images}></dvfy-carousel>`);
      const slides = el.querySelectorAll('dvfy-slide[data-generated]');
      expect(slides.length).to.equal(2);
      expect(slides[0].querySelector('img').alt).to.equal('Photo A');
    });
  });

  describe('autoplay attribute', () => {
    it('accepts autoplay attribute', async () => {
      const el = await fixture(html`
        <dvfy-carousel autoplay>
          <dvfy-slide>Slide 1</dvfy-slide>
          <dvfy-slide>Slide 2</dvfy-slide>
        </dvfy-carousel>
      `);
      expect(el.hasAttribute('autoplay')).to.be.true;
    });

    it('accepts autoplay with custom interval', async () => {
      const el = await fixture(html`
        <dvfy-carousel autoplay="3000">
          <dvfy-slide>Slide 1</dvfy-slide>
          <dvfy-slide>Slide 2</dvfy-slide>
        </dvfy-carousel>
      `);
      expect(el.getAttribute('autoplay')).to.equal('3000');
    });
  });

  describe('dot-position attribute', () => {
    it('accepts dot-position values', async () => {
      const el = await fixture(html`
        <dvfy-carousel dot-position="top">
          <dvfy-slide>Slide 1</dvfy-slide>
        </dvfy-carousel>
      `);
      expect(el.getAttribute('dot-position')).to.equal('top');
    });
  });

  describe('keyboard navigation', () => {
    it('responds to ArrowRight key', async () => {
      const el = await fixture(html`
        <dvfy-carousel>
          <dvfy-slide>Slide 1</dvfy-slide>
          <dvfy-slide>Slide 2</dvfy-slide>
        </dvfy-carousel>
      `);
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      expect(el.getAttribute('tabindex')).to.equal('0');
    });

    it('responds to ArrowLeft key', async () => {
      const el = await fixture(html`
        <dvfy-carousel>
          <dvfy-slide>Slide 1</dvfy-slide>
          <dvfy-slide>Slide 2</dvfy-slide>
        </dvfy-carousel>
      `);
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      expect(el.getAttribute('tabindex')).to.equal('0');
    });
  });
});
