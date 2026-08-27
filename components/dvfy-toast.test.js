import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import { checkA11y } from '../utils/axe-test.js';
import './dvfy-toast.js';

describe('dvfy-toast', () => {
  // Clean up toast containers between tests
  afterEach(() => {
    document.querySelectorAll('.dvfy-toast-container').forEach(c => c.remove());
  });

  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`<dvfy-toast>Hello</dvfy-toast>`);
      expect(el.getAttribute('role')).to.equal('alert');
      expect(el.querySelector('.dvfy-toast__msg').textContent).to.equal('Hello');
      await checkA11y(el);
    });

    it('renders the status icon', async () => {
      const el = await fixture(html`<dvfy-toast>Test</dvfy-toast>`);
      const icon = el.querySelector('.dvfy-toast__icon');
      expect(icon).to.exist;
      expect(icon.getAttribute('aria-hidden')).to.equal('true');
      await checkA11y(el);
    });

    it('renders progress bar for auto-dismiss', async () => {
      const el = await fixture(html`<dvfy-toast duration="3000">Timed</dvfy-toast>`);
      expect(el.querySelector('.dvfy-toast__progress')).to.exist;
      await checkA11y(el);
    });

    it('does not render progress bar when duration is 0', async () => {
      const el = await fixture(html`<dvfy-toast duration="0">Persistent</dvfy-toast>`);
      expect(el.querySelector('.dvfy-toast__progress')).to.be.null;
      await checkA11y(el);
    });
  });

  describe('attributes', () => {
    it('accepts status="success"', async () => {
      const el = await fixture(html`<dvfy-toast status="success">Saved</dvfy-toast>`);
      expect(el.getAttribute('status')).to.equal('success');
      await checkA11y(el);
    });

    it('accepts status="warning"', async () => {
      const el = await fixture(html`<dvfy-toast status="warning">Warning</dvfy-toast>`);
      expect(el.getAttribute('status')).to.equal('warning');
      await checkA11y(el);
    });

    it('accepts status="danger"', async () => {
      const el = await fixture(html`<dvfy-toast status="danger">Error</dvfy-toast>`);
      expect(el.getAttribute('status')).to.equal('danger');
      await checkA11y(el);
    });

    it('updates icon when status changes', async () => {
      const el = await fixture(html`<dvfy-toast status="info">Test</dvfy-toast>`);
      const iconBefore = el.querySelector('.dvfy-toast__icon').textContent;
      el.setAttribute('status', 'success');
      const iconAfter = el.querySelector('.dvfy-toast__icon').textContent;
      expect(iconAfter).to.not.equal(iconBefore);
      await checkA11y(el);
    });

    it('defaults duration to 4000ms', async () => {
      const el = await fixture(html`<dvfy-toast>Default timer</dvfy-toast>`);
      // Progress bar should exist (duration > 0)
      expect(el.querySelector('.dvfy-toast__progress')).to.exist;
      await checkA11y(el);
    });
  });

  describe('static show()', () => {
    it('creates a toast element in a container', () => {
      const toast = DvfyToast.show({ message: 'Created', status: 'success' });
      expect(toast).to.be.instanceOf(HTMLElement);
      expect(toast.tagName.toLowerCase()).to.equal('dvfy-toast');
      expect(toast.getAttribute('status')).to.equal('success');
      const container = toast.parentElement;
      expect(container.classList.contains('dvfy-toast-container')).to.be.true;
    });

    it('uses top-right position by default', () => {
      const toast = DvfyToast.show({ message: 'Position test' });
      const container = toast.parentElement;
      expect(container.getAttribute('data-position')).to.equal('top-right');
    });

    it('respects custom position', () => {
      const toast = DvfyToast.show({ message: 'Bottom left', position: 'bottom-left' });
      const container = toast.parentElement;
      expect(container.getAttribute('data-position')).to.equal('bottom-left');
    });

    it('sets aria-live on the container', () => {
      const toast = DvfyToast.show({ message: 'Accessible' });
      const container = toast.parentElement;
      expect(container.getAttribute('aria-live')).to.equal('polite');
    });
  });

  describe('dismiss', () => {
    it('removes element on click via dismiss()', async () => {
      const toast = DvfyToast.show({ message: 'Click to dismiss', duration: 0 });
      await new Promise(r => requestAnimationFrame(r));
      toast.dismiss();
      expect(toast.classList.contains('dvfy-toast--hiding')).to.be.true;
      expect(toast.classList.contains('dvfy-toast--visible')).to.be.false;
    });

    it('adds hiding class on dismiss', async () => {
      const toast = DvfyToast.show({ message: 'Hiding', duration: 0 });
      await new Promise(r => requestAnimationFrame(r));
      toast.dismiss();
      expect(toast.classList.contains('dvfy-toast--hiding')).to.be.true;
    });
  });

  // devify-ui#401 — the module documents `DvfyToast.show()` as its entry point but never
  // exported the class, so the documented import was `undefined` and every consumer had to
  // rediscover the `customElements.get('dvfy-toast')` workaround. The tests below did not
  // catch it because the rest of this file reaches DvfyToast through the `window` global.
  //
  // Identity assertions use `=== ... to.be.true` rather than `to.equal(SomeClass)`: on
  // failure chai inspects both operands to build a diff, and inspecting a custom-element
  // constructor wedges the runner (the test file times out instead of failing).
  describe('module exports (#401)', () => {
    it('exports the class as a named export', async () => {
      const mod = await import('./dvfy-toast.js');
      expect(mod.DvfyToast).to.be.a('function');
    });

    it('exports the class as the default export', async () => {
      const mod = await import('./dvfy-toast.js');
      expect(mod.default).to.be.a('function');
      expect(mod.default === mod.DvfyToast).to.be.true;
    });

    it('exports the same class the registry holds', async () => {
      const mod = await import('./dvfy-toast.js');
      expect(mod.DvfyToast === customElements.get('dvfy-toast')).to.be.true;
    });

    // Asserts the element and its container, not the rendered message: this suite's
    // afterEach removes the containers from the DOM but getContainer() keeps handing back
    // the cached, now-detached one, so a toast created after the first test never connects
    // and never renders. That is a real component bug, filed separately -- not this one.
    it('the documented DvfyToast.show() call works through the import', async () => {
      const mod = await import('./dvfy-toast.js');
      const toast = mod.DvfyToast.show({ message: 'From the import', status: 'success' });
      expect(toast.tagName).to.equal('DVFY-TOAST');
      expect(toast.getAttribute('status')).to.equal('success');
      expect(toast.parentElement.classList.contains('dvfy-toast-container')).to.be.true;
      toast.remove();
    });

    it('still registers the element as a side effect of importing', async () => {
      await import('./dvfy-toast.js');
      expect(customElements.get('dvfy-toast')).to.exist;
    });

    it('still exposes the window global that dvfy-htmx-form relies on', async () => {
      const mod = await import('./dvfy-toast.js');
      expect(window.DvfyToast === mod.DvfyToast).to.be.true;
    });
  });

  describe('ARIA', () => {
    it('sets role="alert"', async () => {
      const el = await fixture(html`<dvfy-toast>ARIA test</dvfy-toast>`);
      expect(el.getAttribute('role')).to.equal('alert');
      await checkA11y(el);
    });

    it('hides the icon from assistive technology', async () => {
      const el = await fixture(html`<dvfy-toast>Test</dvfy-toast>`);
      expect(el.querySelector('.dvfy-toast__icon').getAttribute('aria-hidden')).to.equal('true');
      await checkA11y(el);
    });
  });
});
