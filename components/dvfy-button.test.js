import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import { checkA11y } from '../utils/axe-test.js';
import './dvfy-button.js';

describe('dvfy-button', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`<dvfy-button>Click me</dvfy-button>`);
      expect(el.textContent.trim()).to.equal('Click me');
      expect(el.getAttribute('role')).to.equal('button');
      expect(el.getAttribute('tabindex')).to.equal('0');
      await checkA11y(el);
    });

    it('accepts variant attribute', async () => {
      const el = await fixture(html`<dvfy-button variant="danger">Delete</dvfy-button>`);
      expect(el.getAttribute('variant')).to.equal('danger');
      await checkA11y(el);
    });

    it('accepts size attribute', async () => {
      const el = await fixture(html`<dvfy-button size="lg">Large</dvfy-button>`);
      expect(el.getAttribute('size')).to.equal('lg');
      await checkA11y(el);
    });
  });

  describe('disabled state', () => {
    it('sets aria-disabled and tabindex=-1 when disabled', async () => {
      const el = await fixture(html`<dvfy-button disabled>Disabled</dvfy-button>`);
      expect(el.getAttribute('aria-disabled')).to.equal('true');
      expect(el.getAttribute('tabindex')).to.equal('-1');
      await checkA11y(el);
    });

    it('restores tabindex when disabled is removed', async () => {
      const el = await fixture(html`<dvfy-button disabled>Test</dvfy-button>`);
      el.removeAttribute('disabled');
      expect(el.getAttribute('tabindex')).to.equal('0');
      expect(el.getAttribute('aria-disabled')).to.equal('false');
      await checkA11y(el);
    });
  });

  describe('loading state', () => {
    it('sets aria-busy when loading', async () => {
      const el = await fixture(html`<dvfy-button loading>Loading</dvfy-button>`);
      expect(el.getAttribute('aria-busy')).to.equal('true');
      await checkA11y(el);
    });

    it('clears aria-busy when loading is removed', async () => {
      const el = await fixture(html`<dvfy-button loading>Test</dvfy-button>`);
      el.removeAttribute('loading');
      expect(el.getAttribute('aria-busy')).to.equal('false');
      await checkA11y(el);
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

  describe('href navigation', () => {
    it('sets role=link (not button) when href is present', async () => {
      const el = await fixture(html`<dvfy-button href="/cuestionario">Go</dvfy-button>`);
      expect(el.getAttribute('role')).to.equal('link');
      expect(el.getAttribute('tabindex')).to.equal('0');
      await checkA11y(el);
    });

    it('navigates same-tab on click when href is set', async () => {
      const el = await fixture(html`<dvfy-button href="/cuestionario">Go</dvfy-button>`);
      let navigated = null;
      el._navigate = (url) => { navigated = url; };
      el.click();
      expect(navigated).to.equal('/cuestionario');
    });

    it('navigates on Enter key when href is set', async () => {
      const el = await fixture(html`<dvfy-button href="/cuestionario">Go</dvfy-button>`);
      let navigated = null;
      el._navigate = (url) => { navigated = url; };
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(navigated).to.equal('/cuestionario');
    });

    it('sanitizes a javascript: href to # (no navigation to script)', async () => {
      const el = await fixture(html`<dvfy-button href="javascript:alert(1)">Bad</dvfy-button>`);
      let navigated = null;
      el._navigate = (url) => { navigated = url; };
      el.click();
      expect(navigated).to.equal('#');
    });

    it('opens a new tab for target=_blank', async () => {
      const el = await fixture(html`<dvfy-button href="https://example.com" target="_blank">Ext</dvfy-button>`);
      let opened = null;
      el._openTab = (url, features) => { opened = { url, features }; };
      el.click();
      expect(opened.url).to.equal('https://example.com');
      expect(opened.features).to.contain('noopener');
      expect(opened.features).to.contain('noreferrer');
    });

    it('honors an explicit rel attribute for target=_blank', async () => {
      const el = await fixture(html`<dvfy-button href="https://example.com" target="_blank" rel="noopener">Ext</dvfy-button>`);
      let opened = null;
      el._openTab = (url, features) => { opened = { url, features }; };
      el.click();
      expect(opened.features).to.contain('noopener');
      expect(opened.features).to.not.contain('noreferrer');
    });

    it('does not navigate when disabled', async () => {
      const el = await fixture(html`<dvfy-button href="/x" disabled>Go</dvfy-button>`);
      let navigated = false;
      el._navigate = () => { navigated = true; };
      el.click();
      expect(navigated).to.equal(false);
    });

    it('does not navigate when loading', async () => {
      const el = await fixture(html`<dvfy-button href="/x" loading>Go</dvfy-button>`);
      let navigated = false;
      el._navigate = () => { navigated = true; };
      el.click();
      expect(navigated).to.equal(false);
    });

    it('keeps role=button and does not navigate when href is absent (regression)', async () => {
      const el = await fixture(html`<dvfy-button>Plain</dvfy-button>`);
      expect(el.getAttribute('role')).to.equal('button');
      let navigated = false;
      el._navigate = () => { navigated = true; };
      el.click();
      expect(navigated).to.equal(false);
    });

    it('switches role from button to link when href is added dynamically', async () => {
      const el = await fixture(html`<dvfy-button>Plain</dvfy-button>`);
      expect(el.getAttribute('role')).to.equal('button');
      el.setAttribute('href', '/later');
      expect(el.getAttribute('role')).to.equal('link');
    });
  });

  describe('gradient attributes', () => {
    it('sets CSS custom properties from from/to attributes', async () => {
      const el = await fixture(html`<dvfy-button variant="gradient" from="#ff0000" to="#00ff00">Gradient</dvfy-button>`);
      expect(el.style.getPropertyValue('--dvfy-btn-grad-from')).to.equal('#ff0000');
      expect(el.style.getPropertyValue('--dvfy-btn-grad-to')).to.equal('#00ff00');
      await checkA11y(el);
    });

    it('updates CSS properties when attributes change', async () => {
      const el = await fixture(html`<dvfy-button variant="gradient" from="#ff0000" to="#00ff00">Gradient</dvfy-button>`);
      el.setAttribute('from', '#0000ff');
      expect(el.style.getPropertyValue('--dvfy-btn-grad-from')).to.equal('#0000ff');
      await checkA11y(el);
    });
  });
});
