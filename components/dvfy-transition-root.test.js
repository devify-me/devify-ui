import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-transition-root.js';

describe('dvfy-transition-root', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`<dvfy-transition-root><p>Content</p></dvfy-transition-root>`);
      expect(el).to.exist;
      expect(el.querySelector('p').textContent).to.equal('Content');
    });

    it('is defined as a custom element', async () => {
      expect(customElements.get('dvfy-transition-root')).to.exist;
    });
  });

  describe('attributes', () => {
    it('accepts duration attribute', async () => {
      const el = await fixture(html`<dvfy-transition-root duration="500ms">Content</dvfy-transition-root>`);
      expect(el.getAttribute('duration')).to.equal('500ms');
    });

    it('accepts easing attribute', async () => {
      const el = await fixture(html`<dvfy-transition-root easing="ease-in">Content</dvfy-transition-root>`);
      expect(el.getAttribute('easing')).to.equal('ease-in');
    });

    it('accepts mpa attribute', async () => {
      const el = await fixture(html`<dvfy-transition-root mpa>Content</dvfy-transition-root>`);
      expect(el.hasAttribute('mpa')).to.be.true;
    });

    it('injects CSS variable overrides', async () => {
      const el = await fixture(html`<dvfy-transition-root duration="400ms" easing="linear">Content</dvfy-transition-root>`);
      const style = document.head.querySelector('[data-dvfy-tr-vars]');
      expect(style).to.exist;
      expect(style.textContent).to.include('--dvfy-tr-duration');
      expect(style.textContent).to.include('--dvfy-tr-easing');
      el.remove();
    });
  });

  describe('MPA mode', () => {
    it('injects @view-transition style when mpa is set', async () => {
      const el = await fixture(html`<dvfy-transition-root mpa>Content</dvfy-transition-root>`);
      const style = document.head.querySelector('[data-dvfy-tr-mpa]');
      expect(style).to.exist;
      expect(style.textContent).to.include('@view-transition');
      el.remove();
    });
  });

  describe('dvfy-transition-name processing', () => {
    it('applies view-transition-name from dvfy-transition-name attribute', async () => {
      const el = await fixture(html`
        <dvfy-transition-root>
          <div dvfy-transition-name="hero">Content</div>
        </dvfy-transition-root>
      `);
      const child = el.querySelector('[dvfy-transition-name]');
      expect(child.style.viewTransitionName).to.equal('hero');
    });

    it('handles multiple named elements', async () => {
      const el = await fixture(html`
        <dvfy-transition-root>
          <div dvfy-transition-name="hero">Hero</div>
          <div dvfy-transition-name="card">Card</div>
        </dvfy-transition-root>
      `);
      const hero = el.querySelector('[dvfy-transition-name="hero"]');
      const card = el.querySelector('[dvfy-transition-name="card"]');
      expect(hero.style.viewTransitionName).to.equal('hero');
      expect(card.style.viewTransitionName).to.equal('card');
    });
  });

  describe('observed attributes', () => {
    it('observes duration, easing, and mpa', () => {
      const observed = customElements.get('dvfy-transition-root').observedAttributes;
      expect(observed).to.include('duration');
      expect(observed).to.include('easing');
      expect(observed).to.include('mpa');
    });
  });

  describe('startTransition API', () => {
    it('exposes startTransition method', async () => {
      const el = await fixture(html`<dvfy-transition-root>Content</dvfy-transition-root>`);
      expect(el.startTransition).to.be.a('function');
    });

    it('calls updateFn directly when view transitions are unsupported', async () => {
      const el = await fixture(html`<dvfy-transition-root>Content</dvfy-transition-root>`);
      let called = false;
      await el.startTransition(() => { called = true; });
      expect(called).to.be.true;
    });
  });

  describe('cleanup', () => {
    it('removes injected styles on disconnect', async () => {
      const el = await fixture(html`<dvfy-transition-root mpa duration="200ms">Content</dvfy-transition-root>`);
      el.remove();
      // MPA style may or may not be removed depending on other instances,
      // but the var style should be removed
      const varStyle = document.head.querySelector('[data-dvfy-tr-vars]');
      expect(varStyle).to.not.exist;
    });
  });
});
