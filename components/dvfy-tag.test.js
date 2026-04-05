import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-tag.js';

describe('dvfy-tag', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`<dvfy-tag>Label</dvfy-tag>`);
      expect(el.textContent).to.include('Label');
    });

    it('renders empty tag', async () => {
      const el = await fixture(html`<dvfy-tag></dvfy-tag>`);
      expect(el).to.exist;
    });
  });

  describe('attributes', () => {
    it('accepts status attribute', async () => {
      const el = await fixture(html`<dvfy-tag status="success">OK</dvfy-tag>`);
      expect(el.getAttribute('status')).to.equal('success');
    });

    it('accepts variant attribute', async () => {
      const el = await fixture(html`<dvfy-tag variant="outline">Tag</dvfy-tag>`);
      expect(el.getAttribute('variant')).to.equal('outline');
    });

    it('accepts size attribute', async () => {
      const el = await fixture(html`<dvfy-tag size="sm">Small</dvfy-tag>`);
      expect(el.getAttribute('size')).to.equal('sm');
    });

    for (const status of ['neutral', 'success', 'warning', 'danger', 'info']) {
      it(`renders with status="${status}"`, async () => {
        const el = await fixture(html`<dvfy-tag status="${status}">Text</dvfy-tag>`);
        expect(el.getAttribute('status')).to.equal(status);
      });
    }

    for (const size of ['xs', 'sm', 'md', 'lg', 'xl']) {
      it(`renders with size="${size}"`, async () => {
        const el = await fixture(html`<dvfy-tag size="${size}">Text</dvfy-tag>`);
        expect(el.getAttribute('size')).to.equal(size);
      });
    }
  });

  describe('removable', () => {
    it('shows remove button when removable is set', async () => {
      const el = await fixture(html`<dvfy-tag removable>Tag</dvfy-tag>`);
      const btn = el.querySelector('.dvfy-tag__remove');
      expect(btn).to.not.be.null;
      expect(btn.getAttribute('aria-label')).to.equal('Remove');
    });

    it('does not show remove button without removable', async () => {
      const el = await fixture(html`<dvfy-tag>Tag</dvfy-tag>`);
      expect(el.querySelector('.dvfy-tag__remove')).to.be.null;
    });

    it('sets tabindex when removable', async () => {
      const el = await fixture(html`<dvfy-tag removable>Tag</dvfy-tag>`);
      expect(el.getAttribute('tabindex')).to.equal('0');
    });

    it('removes tabindex when removable is removed', async () => {
      const el = await fixture(html`<dvfy-tag removable>Tag</dvfy-tag>`);
      el.removeAttribute('removable');
      expect(el.hasAttribute('tabindex')).to.be.false;
    });

    it('removes the remove button when removable is removed', async () => {
      const el = await fixture(html`<dvfy-tag removable>Tag</dvfy-tag>`);
      el.removeAttribute('removable');
      expect(el.querySelector('.dvfy-tag__remove')).to.be.null;
    });
  });

  describe('events', () => {
    it('dispatches remove event on button click', async () => {
      const el = await fixture(html`<dvfy-tag removable>Tag</dvfy-tag>`);
      const btn = el.querySelector('.dvfy-tag__remove');
      setTimeout(() => btn.click());
      const ev = await oneEvent(el, 'remove');
      expect(ev).to.exist;
      expect(ev.bubbles).to.be.true;
    });

    it('dispatches remove event on Enter key', async () => {
      const el = await fixture(html`<dvfy-tag removable>Tag</dvfy-tag>`);
      setTimeout(() => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
      const ev = await oneEvent(el, 'remove');
      expect(ev).to.exist;
    });

    it('dispatches remove event on Delete key', async () => {
      const el = await fixture(html`<dvfy-tag removable>Tag</dvfy-tag>`);
      setTimeout(() => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true })));
      const ev = await oneEvent(el, 'remove');
      expect(ev).to.exist;
    });

    it('dispatches remove event on Backspace key', async () => {
      const el = await fixture(html`<dvfy-tag removable>Tag</dvfy-tag>`);
      setTimeout(() => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true })));
      const ev = await oneEvent(el, 'remove');
      expect(ev).to.exist;
    });

    it('does not dispatch remove on keydown without removable', async () => {
      const el = await fixture(html`<dvfy-tag>Tag</dvfy-tag>`);
      let fired = false;
      el.addEventListener('remove', () => { fired = true; });
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(fired).to.be.false;
    });
  });
});
