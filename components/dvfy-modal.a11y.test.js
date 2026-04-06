import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-modal.js';

// Helper: dispatch a keyboard event on document (where the modal listener lives)
function pressKey(key, options = {}) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options }));
}

// Helper: get all focusable elements inside the modal dialog
function focusableIn(el) {
  const dialog = el.querySelector('.dvfy-modal__dialog');
  if (!dialog) return [];
  return Array.from(dialog.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ));
}

// Helper: open a modal via setAttribute (triggers attributeChangedCallback after connectedCallback,
// so focus actually lands). rAF gives the browser one tick to move focus.
async function openModal(el) {
  el.setAttribute('open', '');
  await new Promise(r => requestAnimationFrame(r));
}

describe('dvfy-modal — accessibility', () => {

  // ─── Focus Trap ──────────────────────────────────────────────────────────────

  describe('focus trap', () => {
    it('moves focus inside the modal when opened via setAttribute', async () => {
      const el = await fixture(html`
        <dvfy-modal title="Focus Test">
          <button id="first">First</button>
          <button id="second">Second</button>
        </dvfy-modal>
      `);

      await openModal(el);

      const dialog = el.querySelector('.dvfy-modal__dialog');
      // Use contains() — avoid chai include() on DOM nodes (hangs on serialization failure)
      expect(dialog.contains(document.activeElement)).to.be.true;
    });

    it('focuses the close button as first focusable element', async () => {
      const el = await fixture(html`
        <dvfy-modal title="Close Focus">
          <p>No interactive content</p>
        </dvfy-modal>
      `);

      await openModal(el);

      const closeBtn = el.querySelector('.dvfy-modal__close');
      expect(document.activeElement).to.equal(closeBtn);
    });

    it('wraps Tab forward from last focusable to first', async () => {
      const el = await fixture(html`
        <dvfy-modal title="Tab Wrap">
          <button id="one">One</button>
          <button id="two">Two</button>
        </dvfy-modal>
      `);

      await openModal(el);

      const focusables = focusableIn(el);
      const last = focusables[focusables.length - 1];

      last.focus();
      expect(document.activeElement).to.equal(last);

      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false, bubbles: true, cancelable: true })
      );

      expect(document.activeElement).to.equal(focusables[0]);
    });

    it('wraps Shift+Tab backward from first focusable to last', async () => {
      const el = await fixture(html`
        <dvfy-modal title="Shift Tab Wrap">
          <button id="alpha">Alpha</button>
          <button id="beta">Beta</button>
        </dvfy-modal>
      `);

      await openModal(el);

      const focusables = focusableIn(el);
      const first = focusables[0];

      first.focus();
      expect(document.activeElement).to.equal(first);

      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })
      );

      expect(document.activeElement).to.equal(focusables[focusables.length - 1]);
    });

    it('does not wrap Tab when focus is on a middle element', async () => {
      const el = await fixture(html`
        <dvfy-modal title="Mid Tab">
          <button id="a">A</button>
          <button id="b">B</button>
          <button id="c">C</button>
        </dvfy-modal>
      `);

      await openModal(el);

      const focusables = focusableIn(el);
      // Focus first element (not last) — Tab should NOT wrap
      focusables[0].focus();
      const before = document.activeElement;

      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false, bubbles: true, cancelable: true })
      );

      // Trap only fires when on last element — focus unchanged
      expect(document.activeElement).to.equal(before);
    });

    it('returns focus to trigger element after modal closes', async () => {
      const container = await fixture(html`
        <div>
          <button id="trigger">Open Modal</button>
          <dvfy-modal title="Return Focus">
            <p>Content</p>
          </dvfy-modal>
        </div>
      `);

      const trigger = container.querySelector('#trigger');
      const modal = container.querySelector('dvfy-modal');

      trigger.focus();
      expect(document.activeElement).to.equal(trigger);

      await openModal(modal);

      // Close — #prevFocus was trigger
      modal.removeAttribute('open');
      await Promise.resolve();

      expect(document.activeElement).to.equal(trigger);
    });
  });

  // ─── Escape Key ──────────────────────────────────────────────────────────────

  describe('Escape key', () => {
    it('closes the modal when Escape is pressed', async () => {
      const el = await fixture(html`<dvfy-modal title="Escape Me"><p>Content</p></dvfy-modal>`);
      await openModal(el);

      expect(el.hasAttribute('open')).to.be.true;
      pressKey('Escape');
      expect(el.hasAttribute('open')).to.be.false;
    });

    it('emits a close event when modal closes via Escape', async () => {
      const el = await fixture(html`<dvfy-modal title="Escape Event"><p>Content</p></dvfy-modal>`);
      await openModal(el);

      const closePromise = oneEvent(el, 'close');
      pressKey('Escape');
      const event = await closePromise;

      expect(event).to.exist;
      expect(event.type).to.equal('close');
    });

    it('close event bubbles', async () => {
      const el = await fixture(html`<dvfy-modal title="Bubble"><p>Content</p></dvfy-modal>`);
      await openModal(el);

      const closePromise = oneEvent(el, 'close');
      pressKey('Escape');
      const event = await closePromise;

      expect(event.bubbles).to.be.true;
    });

    it('does not close when required attr is set', async () => {
      const el = await fixture(html`<dvfy-modal required title="Required"><p>Content</p></dvfy-modal>`);
      await openModal(el);

      pressKey('Escape');
      expect(el.hasAttribute('open')).to.be.true;
    });

    it('does not fire close event when required modal ignores Escape', async () => {
      const el = await fixture(html`<dvfy-modal required title="Required"><p>Content</p></dvfy-modal>`);
      await openModal(el);

      let fired = false;
      el.addEventListener('close', () => { fired = true; });
      pressKey('Escape');

      await Promise.resolve();
      expect(fired).to.be.false;
    });

    it('ignores Escape when modal is already closed', async () => {
      const el = await fixture(html`<dvfy-modal title="Closed"><p>Content</p></dvfy-modal>`);

      // Should not throw or produce side effects when no open attr
      pressKey('Escape');
      expect(el.hasAttribute('open')).to.be.false;
    });
  });

  // ─── ARIA Attributes ─────────────────────────────────────────────────────────

  describe('ARIA attributes', () => {
    it('inner dialog element has role="dialog"', async () => {
      const el = await fixture(html`<dvfy-modal title="ARIA Role"><p>Content</p></dvfy-modal>`);
      await openModal(el);

      const dialog = el.querySelector('.dvfy-modal__dialog');
      expect(dialog).to.exist;
      expect(dialog.getAttribute('role')).to.equal('dialog');
    });

    it('inner dialog element has aria-modal="true" when open', async () => {
      const el = await fixture(html`<dvfy-modal title="ARIA Modal"><p>Content</p></dvfy-modal>`);
      await openModal(el);

      const dialog = el.querySelector('.dvfy-modal__dialog');
      expect(dialog.getAttribute('aria-modal')).to.equal('true');
    });

    it('close button has aria-label="Close"', async () => {
      const el = await fixture(html`<dvfy-modal title="ARIA Label"><p>Content</p></dvfy-modal>`);
      await openModal(el);

      const closeBtn = el.querySelector('.dvfy-modal__close');
      expect(closeBtn).to.exist;
      expect(closeBtn.getAttribute('aria-label')).to.equal('Close');
    });

    it('title text is rendered in the header', async () => {
      const el = await fixture(html`<dvfy-modal title="Accessible Title"><p>Content</p></dvfy-modal>`);
      await openModal(el);

      const titleEl = el.querySelector('.dvfy-modal__title');
      expect(titleEl).to.exist;
      expect(titleEl.textContent).to.equal('Accessible Title');
    });

    it('title element is h2 for correct heading hierarchy', async () => {
      const el = await fixture(html`<dvfy-modal title="H2 Test"><p>Content</p></dvfy-modal>`);
      await openModal(el);

      const titleEl = el.querySelector('.dvfy-modal__title');
      expect(titleEl.tagName.toLowerCase()).to.equal('h2');
    });

    it('no close button present when required', async () => {
      const el = await fixture(html`<dvfy-modal required title="No Close"><p>Content</p></dvfy-modal>`);
      await openModal(el);

      expect(el.querySelector('.dvfy-modal__close')).to.be.null;
    });

    it('title updates live without losing ARIA structure', async () => {
      const el = await fixture(html`<dvfy-modal title="Original"><p>Content</p></dvfy-modal>`);
      await openModal(el);

      el.setAttribute('title', 'Updated Title');

      const titleEl = el.querySelector('.dvfy-modal__title');
      expect(titleEl.textContent).to.equal('Updated Title');

      // role and aria-modal must survive the title update
      const dialog = el.querySelector('.dvfy-modal__dialog');
      expect(dialog.getAttribute('role')).to.equal('dialog');
      expect(dialog.getAttribute('aria-modal')).to.equal('true');
    });
  });

  // ─── Backdrop Interaction ────────────────────────────────────────────────────

  describe('backdrop interaction', () => {
    it('closes modal when backdrop is clicked', async () => {
      const el = await fixture(html`<dvfy-modal title="Backdrop Close"><p>Content</p></dvfy-modal>`);
      await openModal(el);

      const backdrop = el.querySelector('.dvfy-modal__backdrop');
      backdrop.click();
      expect(el.hasAttribute('open')).to.be.false;
    });

    it('emits close event on backdrop click', async () => {
      const el = await fixture(html`<dvfy-modal title="Backdrop Event"><p>Content</p></dvfy-modal>`);
      await openModal(el);

      const closePromise = oneEvent(el, 'close');
      const backdrop = el.querySelector('.dvfy-modal__backdrop');
      backdrop.click();
      const event = await closePromise;

      expect(event).to.exist;
      expect(event.type).to.equal('close');
    });

    it('does not close on dialog click — only true backdrop click closes', async () => {
      const el = await fixture(html`<dvfy-modal title="Dialog Click"><p>Content</p></dvfy-modal>`);
      await openModal(el);

      const dialog = el.querySelector('.dvfy-modal__dialog');
      dialog.click();
      expect(el.hasAttribute('open')).to.be.true;
    });

    it('does not close on backdrop click when required', async () => {
      const el = await fixture(html`<dvfy-modal required title="Required Backdrop"><p>Content</p></dvfy-modal>`);
      await openModal(el);

      const backdrop = el.querySelector('.dvfy-modal__backdrop');
      backdrop.click();
      expect(el.hasAttribute('open')).to.be.true;
    });

    it('returns focus to previous element after backdrop close', async () => {
      const container = await fixture(html`
        <div>
          <button id="trigger">Open</button>
          <dvfy-modal title="Backdrop Return Focus">
            <p>Content</p>
          </dvfy-modal>
        </div>
      `);

      const trigger = container.querySelector('#trigger');
      const modal = container.querySelector('dvfy-modal');

      trigger.focus();
      await openModal(modal);

      const backdrop = modal.querySelector('.dvfy-modal__backdrop');
      backdrop.click();
      await Promise.resolve();

      expect(document.activeElement).to.equal(trigger);
    });
  });

  // ─── Keyboard Listener Lifecycle ────────────────────────────────────────────

  describe('keyboard listener lifecycle', () => {
    it('removes keydown listener when modal closes — no stale handler', async () => {
      const el = await fixture(html`<dvfy-modal title="Cleanup"><p>Content</p></dvfy-modal>`);
      await openModal(el);

      el.removeAttribute('open');

      let threw = false;
      try {
        pressKey('Escape');
      } catch (e) {
        threw = true;
      }
      expect(threw).to.be.false;
      expect(el.hasAttribute('open')).to.be.false;
    });

    it('removes keydown listener when element is disconnected', async () => {
      const el = await fixture(html`<dvfy-modal title="Disconnect"><p>Content</p></dvfy-modal>`);
      await openModal(el);

      el.remove();

      let threw = false;
      try {
        pressKey('Escape');
      } catch (e) {
        threw = true;
      }
      expect(threw).to.be.false;
    });
  });

});
