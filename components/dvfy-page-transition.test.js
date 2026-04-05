import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-page-transition.js';

describe('dvfy-page-transition', () => {
  // Clean up any injected styles between tests
  afterEach(() => {
    document.head.querySelectorAll('[data-dvfy-pt-mpa]').forEach(s => s.remove());
    document.head.querySelectorAll('[data-dvfy-pt-anim]').forEach(s => s.remove());
  });

  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`<dvfy-page-transition><p>Content</p></dvfy-page-transition>`);
      expect(el).to.exist;
      expect(el.querySelector('p').textContent).to.equal('Content');
    });

    it('is defined as a custom element', async () => {
      expect(customElements.get('dvfy-page-transition')).to.exist;
    });
  });

  describe('attributes', () => {
    it('accepts animation attribute', async () => {
      const el = await fixture(html`<dvfy-page-transition animation="slide-left">Content</dvfy-page-transition>`);
      expect(el.getAttribute('animation')).to.equal('slide-left');
    });

    it('accepts duration attribute', async () => {
      const el = await fixture(html`<dvfy-page-transition duration="fast">Content</dvfy-page-transition>`);
      expect(el.getAttribute('duration')).to.equal('fast');
    });

    it('accepts mpa attribute', async () => {
      const el = await fixture(html`<dvfy-page-transition mpa>Content</dvfy-page-transition>`);
      expect(el.hasAttribute('mpa')).to.be.true;
    });

    it('accepts htmx attribute', async () => {
      const el = await fixture(html`<dvfy-page-transition htmx>Content</dvfy-page-transition>`);
      expect(el.hasAttribute('htmx')).to.be.true;
    });

    it('sets view-transition-name from name attribute', async () => {
      const el = await fixture(html`<dvfy-page-transition name="hero">Content</dvfy-page-transition>`);
      expect(el.style.viewTransitionName).to.equal('hero');
    });

    it('updates view-transition-name when name changes', async () => {
      const el = await fixture(html`<dvfy-page-transition name="hero">Content</dvfy-page-transition>`);
      el.setAttribute('name', 'card');
      expect(el.style.viewTransitionName).to.equal('card');
    });

    it('removes view-transition-name when name is removed', async () => {
      const el = await fixture(html`<dvfy-page-transition name="hero">Content</dvfy-page-transition>`);
      el.removeAttribute('name');
      expect(el.style.viewTransitionName).to.equal('');
    });
  });

  describe('MPA styles', () => {
    it('injects @view-transition style when mpa is set', async () => {
      const el = await fixture(html`<dvfy-page-transition mpa>Content</dvfy-page-transition>`);
      const style = document.head.querySelector('[data-dvfy-pt-mpa]');
      expect(style).to.exist;
      expect(style.textContent).to.include('@view-transition');
    });
  });

  describe('animation styles', () => {
    it('injects animation override styles for fade', async () => {
      const el = await fixture(html`<dvfy-page-transition animation="fade">Content</dvfy-page-transition>`);
      const style = document.head.querySelector('[data-dvfy-pt-anim]');
      expect(style).to.exist;
      expect(style.textContent).to.include('dvfy-pt-fade');
    });

    it('injects animation override styles for scale', async () => {
      const el = await fixture(html`<dvfy-page-transition animation="scale">Content</dvfy-page-transition>`);
      const style = document.head.querySelector('[data-dvfy-pt-anim]');
      expect(style).to.exist;
      expect(style.textContent).to.include('dvfy-pt-scale');
    });
  });

  describe('observed attributes', () => {
    it('observes all relevant attributes', () => {
      const observed = customElements.get('dvfy-page-transition').observedAttributes;
      expect(observed).to.include('animation');
      expect(observed).to.include('duration');
      expect(observed).to.include('mpa');
      expect(observed).to.include('htmx');
      expect(observed).to.include('name');
    });
  });

  describe('startTransition API', () => {
    it('exposes startTransition method', async () => {
      const el = await fixture(html`<dvfy-page-transition>Content</dvfy-page-transition>`);
      expect(el.startTransition).to.be.a('function');
    });

    it('calls updateFn directly when view transitions are unsupported', async () => {
      const el = await fixture(html`<dvfy-page-transition>Content</dvfy-page-transition>`);
      let called = false;
      await el.startTransition(() => { called = true; });
      expect(called).to.be.true;
    });
  });
});
