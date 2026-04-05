import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-popover.js';

describe('dvfy-popover', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`
        <dvfy-popover>
          <button>Trigger</button>
          <div slot="content"><p>Popover content</p></div>
        </dvfy-popover>
      `);
      expect(el).to.exist;
      const panel = el.querySelector('.dvfy-popover__panel');
      expect(panel).to.exist;
    });

    it('is defined as a custom element', async () => {
      expect(customElements.get('dvfy-popover')).to.exist;
    });

    it('creates arrow element inside panel', async () => {
      const el = await fixture(html`
        <dvfy-popover>
          <button>Trigger</button>
          <div slot="content">Content</div>
        </dvfy-popover>
      `);
      const arrow = el.querySelector('.dvfy-popover__arrow');
      expect(arrow).to.exist;
    });

    it('moves slotted content into panel', async () => {
      const el = await fixture(html`
        <dvfy-popover>
          <button>Trigger</button>
          <div slot="content"><p>Inside</p></div>
        </dvfy-popover>
      `);
      const panel = el.querySelector('.dvfy-popover__panel');
      expect(panel.querySelector('p').textContent).to.equal('Inside');
    });
  });

  describe('attributes', () => {
    it('sets data-pos from position attribute', async () => {
      const el = await fixture(html`
        <dvfy-popover position="top">
          <button>Trigger</button>
          <div slot="content">Content</div>
        </dvfy-popover>
      `);
      expect(el.dataset.pos).to.equal('top');
    });

    it('defaults data-pos to bottom', async () => {
      const el = await fixture(html`
        <dvfy-popover>
          <button>Trigger</button>
          <div slot="content">Content</div>
        </dvfy-popover>
      `);
      expect(el.dataset.pos).to.equal('bottom');
    });

    it('updates data-pos when position changes', async () => {
      const el = await fixture(html`
        <dvfy-popover position="bottom">
          <button>Trigger</button>
          <div slot="content">Content</div>
        </dvfy-popover>
      `);
      el.setAttribute('position', 'left');
      expect(el.dataset.pos).to.equal('left');
    });
  });

  describe('click trigger', () => {
    it('opens on trigger click', async () => {
      const el = await fixture(html`
        <dvfy-popover>
          <button>Trigger</button>
          <div slot="content">Content</div>
        </dvfy-popover>
      `);
      const trigger = el.querySelector('button');
      setTimeout(() => trigger.click());
      await oneEvent(el, 'dvfy-popover-show');
      const panel = el.querySelector('.dvfy-popover__panel');
      expect(panel.hasAttribute('data-visible')).to.be.true;
    });

    it('closes on second trigger click', async () => {
      const el = await fixture(html`
        <dvfy-popover>
          <button>Trigger</button>
          <div slot="content">Content</div>
        </dvfy-popover>
      `);
      const trigger = el.querySelector('button');
      trigger.click();
      await new Promise(r => setTimeout(r, 10));
      setTimeout(() => trigger.click());
      await oneEvent(el, 'dvfy-popover-hide');
      const panel = el.querySelector('.dvfy-popover__panel');
      expect(panel.hasAttribute('data-visible')).to.be.false;
    });
  });

  describe('programmatic open', () => {
    it('opens when open attribute is added', async () => {
      const el = await fixture(html`
        <dvfy-popover>
          <button>Trigger</button>
          <div slot="content">Content</div>
        </dvfy-popover>
      `);
      setTimeout(() => el.setAttribute('open', ''));
      await oneEvent(el, 'dvfy-popover-show');
      const panel = el.querySelector('.dvfy-popover__panel');
      expect(panel.hasAttribute('data-visible')).to.be.true;
    });
  });

  describe('events', () => {
    it('fires dvfy-popover-show on open', async () => {
      const el = await fixture(html`
        <dvfy-popover>
          <button>Trigger</button>
          <div slot="content">Content</div>
        </dvfy-popover>
      `);
      const trigger = el.querySelector('button');
      setTimeout(() => trigger.click());
      const event = await oneEvent(el, 'dvfy-popover-show');
      expect(event).to.exist;
    });

    it('fires dvfy-popover-hide on close', async () => {
      const el = await fixture(html`
        <dvfy-popover>
          <button>Trigger</button>
          <div slot="content">Content</div>
        </dvfy-popover>
      `);
      const trigger = el.querySelector('button');
      trigger.click();
      await new Promise(r => setTimeout(r, 10));
      setTimeout(() => trigger.click());
      const event = await oneEvent(el, 'dvfy-popover-hide');
      expect(event).to.exist;
    });
  });

  describe('ARIA', () => {
    it('panel has role=dialog', async () => {
      const el = await fixture(html`
        <dvfy-popover>
          <button>Trigger</button>
          <div slot="content">Content</div>
        </dvfy-popover>
      `);
      const panel = el.querySelector('.dvfy-popover__panel');
      expect(panel.getAttribute('role')).to.equal('dialog');
      expect(panel.getAttribute('aria-modal')).to.equal('false');
    });

    it('trigger has aria-haspopup=dialog', async () => {
      const el = await fixture(html`
        <dvfy-popover>
          <button>Trigger</button>
          <div slot="content">Content</div>
        </dvfy-popover>
      `);
      const trigger = el.querySelector('button');
      expect(trigger.getAttribute('aria-haspopup')).to.equal('dialog');
    });

    it('trigger has aria-expanded=false initially', async () => {
      const el = await fixture(html`
        <dvfy-popover>
          <button>Trigger</button>
          <div slot="content">Content</div>
        </dvfy-popover>
      `);
      const trigger = el.querySelector('button');
      expect(trigger.getAttribute('aria-expanded')).to.equal('false');
    });

    it('trigger aria-expanded updates to true when opened', async () => {
      const el = await fixture(html`
        <dvfy-popover>
          <button>Trigger</button>
          <div slot="content">Content</div>
        </dvfy-popover>
      `);
      const trigger = el.querySelector('button');
      trigger.click();
      await new Promise(r => setTimeout(r, 10));
      expect(trigger.getAttribute('aria-expanded')).to.equal('true');
    });

    it('trigger has aria-controls pointing to panel id', async () => {
      const el = await fixture(html`
        <dvfy-popover>
          <button>Trigger</button>
          <div slot="content">Content</div>
        </dvfy-popover>
      `);
      const trigger = el.querySelector('button');
      const panel = el.querySelector('.dvfy-popover__panel');
      expect(trigger.getAttribute('aria-controls')).to.equal(panel.id);
    });
  });
});
