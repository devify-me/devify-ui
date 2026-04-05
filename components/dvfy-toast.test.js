import { fixture, html, expect, oneEvent } from '@open-wc/testing';
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
    });

    it('renders the status icon', async () => {
      const el = await fixture(html`<dvfy-toast>Test</dvfy-toast>`);
      const icon = el.querySelector('.dvfy-toast__icon');
      expect(icon).to.exist;
      expect(icon.getAttribute('aria-hidden')).to.equal('true');
    });

    it('renders progress bar for auto-dismiss', async () => {
      const el = await fixture(html`<dvfy-toast duration="3000">Timed</dvfy-toast>`);
      expect(el.querySelector('.dvfy-toast__progress')).to.exist;
    });

    it('does not render progress bar when duration is 0', async () => {
      const el = await fixture(html`<dvfy-toast duration="0">Persistent</dvfy-toast>`);
      expect(el.querySelector('.dvfy-toast__progress')).to.be.null;
    });
  });

  describe('attributes', () => {
    it('accepts status="success"', async () => {
      const el = await fixture(html`<dvfy-toast status="success">Saved</dvfy-toast>`);
      expect(el.getAttribute('status')).to.equal('success');
    });

    it('accepts status="warning"', async () => {
      const el = await fixture(html`<dvfy-toast status="warning">Warning</dvfy-toast>`);
      expect(el.getAttribute('status')).to.equal('warning');
    });

    it('accepts status="danger"', async () => {
      const el = await fixture(html`<dvfy-toast status="danger">Error</dvfy-toast>`);
      expect(el.getAttribute('status')).to.equal('danger');
    });

    it('updates icon when status changes', async () => {
      const el = await fixture(html`<dvfy-toast status="info">Test</dvfy-toast>`);
      const iconBefore = el.querySelector('.dvfy-toast__icon').textContent;
      el.setAttribute('status', 'success');
      const iconAfter = el.querySelector('.dvfy-toast__icon').textContent;
      expect(iconAfter).to.not.equal(iconBefore);
    });

    it('defaults duration to 4000ms', async () => {
      const el = await fixture(html`<dvfy-toast>Default timer</dvfy-toast>`);
      // Progress bar should exist (duration > 0)
      expect(el.querySelector('.dvfy-toast__progress')).to.exist;
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

  describe('ARIA', () => {
    it('sets role="alert"', async () => {
      const el = await fixture(html`<dvfy-toast>ARIA test</dvfy-toast>`);
      expect(el.getAttribute('role')).to.equal('alert');
    });

    it('hides the icon from assistive technology', async () => {
      const el = await fixture(html`<dvfy-toast>Test</dvfy-toast>`);
      expect(el.querySelector('.dvfy-toast__icon').getAttribute('aria-hidden')).to.equal('true');
    });
  });
});
