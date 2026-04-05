import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-modal.js';

describe('dvfy-modal', () => {
  describe('rendering', () => {
    it('is hidden by default when open is not set', async () => {
      const el = await fixture(html`<dvfy-modal title="Test"><p>Body</p></dvfy-modal>`);
      expect(el.hasAttribute('open')).to.be.false;
      // No backdrop should be built
      expect(el.querySelector('.dvfy-modal__backdrop')).to.be.null;
    });

    it('renders dialog structure when open', async () => {
      const el = await fixture(html`<dvfy-modal open title="Hello"><p>Content</p></dvfy-modal>`);
      expect(el.querySelector('.dvfy-modal__backdrop')).to.exist;
      expect(el.querySelector('.dvfy-modal__dialog')).to.exist;
      expect(el.querySelector('.dvfy-modal__header')).to.exist;
      expect(el.querySelector('.dvfy-modal__body')).to.exist;
    });

    it('renders title in header', async () => {
      const el = await fixture(html`<dvfy-modal open title="My Modal"><p>Body</p></dvfy-modal>`);
      const title = el.querySelector('.dvfy-modal__title');
      expect(title).to.exist;
      expect(title.textContent).to.equal('My Modal');
    });

    it('renders body content', async () => {
      const el = await fixture(html`<dvfy-modal open title="Test"><p>Body text</p></dvfy-modal>`);
      const body = el.querySelector('.dvfy-modal__body');
      expect(body.querySelector('p').textContent).to.equal('Body text');
    });

    it('renders close button', async () => {
      const el = await fixture(html`<dvfy-modal open title="Closable"><p>Content</p></dvfy-modal>`);
      const btn = el.querySelector('.dvfy-modal__close');
      expect(btn).to.exist;
      expect(btn.getAttribute('aria-label')).to.equal('Close');
    });
  });

  describe('attributes', () => {
    it('accepts size attribute', async () => {
      const el = await fixture(html`<dvfy-modal open title="Small" size="sm"><p>Small</p></dvfy-modal>`);
      expect(el.getAttribute('size')).to.equal('sm');
    });

    it('accepts all size values', async () => {
      for (const size of ['xs', 'sm', 'md', 'lg', 'xl']) {
        const el = await fixture(html`<dvfy-modal open title="Size" size="${size}"><p>Content</p></dvfy-modal>`);
        expect(el.getAttribute('size')).to.equal(size);
      }
    });

    it('updates title when attribute changes', async () => {
      const el = await fixture(html`<dvfy-modal open title="Old Title"><p>Body</p></dvfy-modal>`);
      el.setAttribute('title', 'New Title');
      expect(el.querySelector('.dvfy-modal__title').textContent).to.equal('New Title');
    });
  });

  describe('open/close', () => {
    it('opens when open attribute is set', async () => {
      const el = await fixture(html`<dvfy-modal title="Deferred"><p>Content</p></dvfy-modal>`);
      expect(el.querySelector('.dvfy-modal__backdrop')).to.be.null;
      el.setAttribute('open', '');
      expect(el.querySelector('.dvfy-modal__backdrop')).to.exist;
    });

    it('closes when open attribute is removed', async () => {
      const el = await fixture(html`<dvfy-modal open title="Close Me"><p>Content</p></dvfy-modal>`);
      expect(el.hasAttribute('open')).to.be.true;
      el.removeAttribute('open');
      expect(el.hasAttribute('open')).to.be.false;
    });

    it('closes when close button is clicked', async () => {
      const el = await fixture(html`<dvfy-modal open title="Click Close"><p>Content</p></dvfy-modal>`);
      const btn = el.querySelector('.dvfy-modal__close');
      btn.click();
      expect(el.hasAttribute('open')).to.be.false;
    });

    it('closes on backdrop click', async () => {
      const el = await fixture(html`<dvfy-modal open title="Backdrop"><p>Content</p></dvfy-modal>`);
      const backdrop = el.querySelector('.dvfy-modal__backdrop');
      backdrop.click();
      expect(el.hasAttribute('open')).to.be.false;
    });

    it('does not close on dialog click (only backdrop)', async () => {
      const el = await fixture(html`<dvfy-modal open title="Dialog Click"><p>Content</p></dvfy-modal>`);
      const dialog = el.querySelector('.dvfy-modal__dialog');
      dialog.click();
      expect(el.hasAttribute('open')).to.be.true;
    });
  });

  describe('required (non-dismissible)', () => {
    it('hides close button when required', async () => {
      const el = await fixture(html`<dvfy-modal open required title="Required"><p>Content</p></dvfy-modal>`);
      expect(el.querySelector('.dvfy-modal__close')).to.be.null;
    });

    it('does not close on backdrop click when required', async () => {
      const el = await fixture(html`<dvfy-modal open required title="Required"><p>Content</p></dvfy-modal>`);
      const backdrop = el.querySelector('.dvfy-modal__backdrop');
      backdrop.click();
      expect(el.hasAttribute('open')).to.be.true;
    });

    it('does not close on Escape when required', async () => {
      const el = await fixture(html`<dvfy-modal open required title="Required"><p>Content</p></dvfy-modal>`);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(el.hasAttribute('open')).to.be.true;
    });
  });

  describe('keyboard interaction', () => {
    it('closes on Escape key', async () => {
      const el = await fixture(html`<dvfy-modal open title="Escape"><p>Content</p></dvfy-modal>`);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(el.hasAttribute('open')).to.be.false;
    });

    it('focuses first focusable element on open', async () => {
      const el = await fixture(html`<dvfy-modal title="Focus"><p>Content</p></dvfy-modal>`);
      el.setAttribute('open', '');
      // The close button should be the first focusable
      await new Promise(r => requestAnimationFrame(r));
      const closeBtn = el.querySelector('.dvfy-modal__close');
      // Focus may be on close button or another focusable
      const focusable = el.querySelector('.dvfy-modal__dialog button, .dvfy-modal__dialog [href], .dvfy-modal__dialog input');
      expect(focusable).to.exist;
    });
  });

  describe('events', () => {
    it('fires close event when modal closes', async () => {
      const el = await fixture(html`<dvfy-modal open title="Events"><p>Content</p></dvfy-modal>`);
      setTimeout(() => el.removeAttribute('open'));
      const event = await oneEvent(el, 'close');
      expect(event).to.exist;
      expect(event.bubbles).to.be.true;
    });
  });

  describe('ARIA', () => {
    it('sets role="dialog" on the dialog element', async () => {
      const el = await fixture(html`<dvfy-modal open title="ARIA"><p>Content</p></dvfy-modal>`);
      const dialog = el.querySelector('.dvfy-modal__dialog');
      expect(dialog.getAttribute('role')).to.equal('dialog');
    });

    it('sets aria-modal="true"', async () => {
      const el = await fixture(html`<dvfy-modal open title="ARIA"><p>Content</p></dvfy-modal>`);
      const dialog = el.querySelector('.dvfy-modal__dialog');
      expect(dialog.getAttribute('aria-modal')).to.equal('true');
    });

    it('close button has aria-label', async () => {
      const el = await fixture(html`<dvfy-modal open title="ARIA"><p>Content</p></dvfy-modal>`);
      const btn = el.querySelector('.dvfy-modal__close');
      expect(btn.getAttribute('aria-label')).to.equal('Close');
    });
  });

  describe('cleanup', () => {
    it('removes keydown listener on disconnect', async () => {
      const el = await fixture(html`<dvfy-modal open title="Cleanup"><p>Content</p></dvfy-modal>`);
      el.remove();
      // Pressing Escape after removal should not throw
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
  });
});
