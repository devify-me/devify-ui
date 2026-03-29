import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-button.js';

describe('dvfy-button', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`<dvfy-button>Click me</dvfy-button>`);
      expect(el.textContent.trim()).to.equal('Click me');
      expect(el.getAttribute('role')).to.equal('button');
      expect(el.getAttribute('tabindex')).to.equal('0');
    });

    it('accepts variant attribute', async () => {
      const el = await fixture(html`<dvfy-button variant="danger">Delete</dvfy-button>`);
      expect(el.getAttribute('variant')).to.equal('danger');
    });

    it('accepts size attribute', async () => {
      const el = await fixture(html`<dvfy-button size="lg">Large</dvfy-button>`);
      expect(el.getAttribute('size')).to.equal('lg');
    });
  });

  describe('disabled state', () => {
    it('sets aria-disabled and tabindex=-1 when disabled', async () => {
      const el = await fixture(html`<dvfy-button disabled>Disabled</dvfy-button>`);
      expect(el.getAttribute('aria-disabled')).to.equal('true');
      expect(el.getAttribute('tabindex')).to.equal('-1');
    });

    it('restores tabindex when disabled is removed', async () => {
      const el = await fixture(html`<dvfy-button disabled>Test</dvfy-button>`);
      el.removeAttribute('disabled');
      expect(el.getAttribute('tabindex')).to.equal('0');
      expect(el.getAttribute('aria-disabled')).to.equal('false');
    });
  });

  describe('loading state', () => {
    it('sets aria-busy when loading', async () => {
      const el = await fixture(html`<dvfy-button loading>Loading</dvfy-button>`);
      expect(el.getAttribute('aria-busy')).to.equal('true');
    });

    it('clears aria-busy when loading is removed', async () => {
      const el = await fixture(html`<dvfy-button loading>Test</dvfy-button>`);
      el.removeAttribute('loading');
      expect(el.getAttribute('aria-busy')).to.equal('false');
    });
  });

  describe('keyboard interaction', () => {
    it('fires click on Enter key', async () => {
      const el = await fixture(html`<dvfy-button>Press me</dvfy-button>`);
      setTimeout(() => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
      const event = await oneEvent(el, 'click');
      expect(event).to.exist;
    });

    it('fires click on Space key', async () => {
      const el = await fixture(html`<dvfy-button>Press me</dvfy-button>`);
      setTimeout(() => el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })));
      const event = await oneEvent(el, 'click');
      expect(event).to.exist;
    });
  });

  describe('gradient attributes', () => {
    it('sets CSS custom properties from from/to attributes', async () => {
      const el = await fixture(html`<dvfy-button variant="gradient" from="#ff0000" to="#00ff00">Gradient</dvfy-button>`);
      expect(el.style.getPropertyValue('--dvfy-btn-grad-from')).to.equal('#ff0000');
      expect(el.style.getPropertyValue('--dvfy-btn-grad-to')).to.equal('#00ff00');
    });

    it('updates CSS properties when attributes change', async () => {
      const el = await fixture(html`<dvfy-button variant="gradient" from="#ff0000" to="#00ff00">Gradient</dvfy-button>`);
      el.setAttribute('from', '#0000ff');
      expect(el.style.getPropertyValue('--dvfy-btn-grad-from')).to.equal('#0000ff');
    });
  });
});
