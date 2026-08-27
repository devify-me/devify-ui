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

  // Swallows the anchor's default navigation AFTER the component's own host handler has
  // run, so a test can dispatch a real click on a real link without the runner navigating.
  // Returns { prevented } — whether anything upstream of the wrapper called preventDefault.
  const guardNavigation = (el) => {
    const seen = { prevented: null };
    el.parentElement.addEventListener('click', (e) => {
      seen.prevented = e.defaultPrevented;
      e.preventDefault();
    }, { once: true });
    return seen;
  };

  // #408 — a button with an href must be a REAL anchor: crawlable by search engines,
  // cmd/middle-clickable, and visible to hx-boost. role="link" + location.assign() is a
  // fake link: it produces no link graph and swallows every modifier click.
  describe('real anchor (href)', () => {
    it('renders a real <a href> carrying the label', async () => {
      const el = await fixture(html`<dvfy-button href="/cuestionario">Go</dvfy-button>`);
      const a = el.querySelector('a');
      expect(a, 'no <a> rendered — the link is not crawlable').to.exist;
      expect(a.getAttribute('href')).to.equal('/cuestionario');
      expect(a.textContent.trim()).to.equal('Go');
      await checkA11y(el);
    });

    it('moves the existing label nodes into the anchor (no clone, listeners survive)', async () => {
      const el = await fixture(html`<dvfy-button href="/x"><span id="lbl">Go</span></dvfy-button>`);
      const span = el.querySelector('#lbl');
      let clicked = 0;
      span.addEventListener('click', () => { clicked += 1; });
      expect(span.parentElement.tagName).to.equal('A');
      guardNavigation(el);
      span.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      expect(clicked).to.equal(1);
    });

    it('makes the anchor the single tab stop — the host is not nested-interactive', async () => {
      const el = await fixture(html`<dvfy-button href="/cuestionario">Go</dvfy-button>`);
      expect(el.getAttribute('role'), 'host must not duplicate the anchor role').to.not.equal('link');
      expect(el.hasAttribute('tabindex'), 'host must not be a second tab stop').to.be.false;
      const a = el.querySelector('a');
      a.focus();
      expect(document.activeElement).to.equal(a);
      await checkA11y(el);
    });

    it('does not hijack a cmd/meta-click — the browser opens a new tab', async () => {
      const el = await fixture(html`<dvfy-button href="/cuestionario">Go</dvfy-button>`);
      let navigated = false;
      el._navigate = () => { navigated = true; };
      const a = el.querySelector('a');
      const seen = guardNavigation(el);
      a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, metaKey: true }));
      expect(navigated, 'component navigated the current tab on a cmd-click').to.be.false;
      expect(seen.prevented, 'component preventDefault-ed a modifier click').to.be.false;
    });

    it('does not preventDefault a plain click on the anchor (hx-boost sees it)', async () => {
      const el = await fixture(html`<dvfy-button href="/cuestionario">Go</dvfy-button>`);
      let navigated = false;
      el._navigate = () => { navigated = true; };
      const a = el.querySelector('a');
      const seen = guardNavigation(el);
      a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      expect(navigated, 'JS navigation ran alongside the native anchor').to.be.false;
      expect(seen.prevented, 'component preventDefault-ed a plain anchor click (hx-boost would never see it)').to.be.false;
    });

    it('sanitizes the anchor href (javascript: becomes #)', async () => {
      const el = await fixture(html`<dvfy-button href="javascript:alert(1)">Bad</dvfy-button>`);
      expect(el.querySelector('a').getAttribute('href')).to.equal('#');
    });

    it('passes target through and defaults rel for target=_blank', async () => {
      const el = await fixture(html`<dvfy-button href="https://example.com" target="_blank">Ext</dvfy-button>`);
      const a = el.querySelector('a');
      expect(a.getAttribute('target')).to.equal('_blank');
      expect(a.getAttribute('rel')).to.contain('noopener');
      expect(a.getAttribute('rel')).to.contain('noreferrer');
    });

    it('honors an explicit rel on the anchor', async () => {
      const el = await fixture(html`<dvfy-button href="https://example.com" target="_blank" rel="noopener">Ext</dvfy-button>`);
      expect(el.querySelector('a').getAttribute('rel')).to.equal('noopener');
    });

    it('creates the anchor when href is added dynamically', async () => {
      const el = await fixture(html`<dvfy-button>Plain</dvfy-button>`);
      expect(el.querySelector('a')).to.not.exist;
      el.setAttribute('href', '/later');
      const a = el.querySelector('a');
      expect(a).to.exist;
      expect(a.getAttribute('href')).to.equal('/later');
      expect(a.textContent.trim()).to.equal('Plain');
    });

    it('unwraps the anchor (keeping the label) when href is removed', async () => {
      const el = await fixture(html`<dvfy-button href="/x">Go</dvfy-button>`);
      el.removeAttribute('href');
      expect(el.querySelector('a')).to.not.exist;
      expect(el.textContent.trim()).to.equal('Go');
      expect(el.getAttribute('role')).to.equal('button');
      expect(el.getAttribute('tabindex')).to.equal('0');
    });

    it('updates the anchor href when the attribute changes', async () => {
      const el = await fixture(html`<dvfy-button href="/a">Go</dvfy-button>`);
      el.setAttribute('href', '/b');
      expect(el.querySelector('a').getAttribute('href')).to.equal('/b');
    });

    it('strips href from the anchor while disabled (not navigable, not focusable)', async () => {
      const el = await fixture(html`<dvfy-button href="/x" disabled>Go</dvfy-button>`);
      const a = el.querySelector('a');
      expect(a.hasAttribute('href')).to.be.false;
      expect(a.getAttribute('aria-disabled')).to.equal('true');
      el.removeAttribute('disabled');
      expect(el.querySelector('a').getAttribute('href')).to.equal('/x');
    });

    it('adopts label content appended after upgrade so it stays inside the anchor', async () => {
      const el = await fixture(html`<dvfy-button href="/x"></dvfy-button>`);
      el.appendChild(document.createTextNode('Late label'));
      await new Promise(r => setTimeout(r, 0));
      const a = el.querySelector('a');
      expect(a.textContent.trim()).to.equal('Late label');
      expect(el.childElementCount).to.equal(1);
    });
  });

  describe('href navigation', () => {
    it('keeps the host out of the accessibility tree as a link when href is present', async () => {
      const el = await fixture(html`<dvfy-button href="/cuestionario">Go</dvfy-button>`);
      expect(el.getAttribute('role')).to.not.equal('link');
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

    it('drops the button role when href is added dynamically', async () => {
      const el = await fixture(html`<dvfy-button>Plain</dvfy-button>`);
      expect(el.getAttribute('role')).to.equal('button');
      el.setAttribute('href', '/later');
      expect(el.getAttribute('role')).to.not.equal('button');
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
