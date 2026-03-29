import { fixture, html, expect, waitUntil } from '@open-wc/testing';
import './dvfy-button.js';
import './dvfy-dropdown.js';

describe('dvfy-dropdown', () => {
  describe('rendering', () => {
    it('renders trigger and builds menu', async () => {
      const el = await fixture(html`
        <dvfy-dropdown>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">Item One</a>
          <a href="/two">Item Two</a>
        </dvfy-dropdown>
      `);
      const menu = el.querySelector('.dvfy-dropdown__menu');
      expect(menu).to.exist;
      expect(menu.getAttribute('role')).to.equal('menu');
      const items = menu.querySelectorAll('.dvfy-dropdown__item');
      expect(items.length).to.equal(2);
    });

    it('assigns menuitem role to items', async () => {
      const el = await fixture(html`
        <dvfy-dropdown>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">Item</a>
        </dvfy-dropdown>
      `);
      const item = el.querySelector('.dvfy-dropdown__item');
      expect(item.getAttribute('role')).to.equal('menuitem');
      expect(item.getAttribute('tabindex')).to.equal('-1');
    });
  });

  describe('open/close', () => {
    it('opens when trigger is clicked', async () => {
      const el = await fixture(html`
        <dvfy-dropdown>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">Item</a>
        </dvfy-dropdown>
      `);
      expect(el.hasAttribute('open')).to.be.false;
      el.querySelector('dvfy-button').click();
      expect(el.hasAttribute('open')).to.be.true;
    });

    it('closes when trigger is clicked again', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">Item</a>
        </dvfy-dropdown>
      `);
      el.querySelector('dvfy-button').click();
      expect(el.hasAttribute('open')).to.be.false;
    });

    it('closes on click outside', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">Item</a>
        </dvfy-dropdown>
      `);
      document.body.click();
      expect(el.hasAttribute('open')).to.be.false;
    });
  });

  describe('keyboard navigation', () => {
    it('opens and focuses first item on ArrowDown', async () => {
      const el = await fixture(html`
        <dvfy-dropdown>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">First</a>
          <a href="/two">Second</a>
        </dvfy-dropdown>
      `);
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      expect(el.hasAttribute('open')).to.be.true;
      await waitUntil(() => el.querySelector('.dvfy-dropdown__item[data-active]'));
      const active = el.querySelector('.dvfy-dropdown__item[data-active]');
      expect(active.textContent).to.equal('First');
    });

    it('navigates items with ArrowDown/ArrowUp', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">First</a>
          <a href="/two">Second</a>
        </dvfy-dropdown>
      `);
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await waitUntil(() => el.querySelector('.dvfy-dropdown__item[data-active]'));
      const active = el.querySelector('.dvfy-dropdown__item[data-active]');
      expect(active.textContent).to.equal('Second');
    });

    it('closes on Escape and returns focus to trigger', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">Item</a>
        </dvfy-dropdown>
      `);
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(el.hasAttribute('open')).to.be.false;
    });

    it('wraps around when navigating past last item', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">First</a>
          <a href="/two">Second</a>
        </dvfy-dropdown>
      `);
      // Navigate to first, then second, then wrap to first
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await waitUntil(() => el.querySelector('.dvfy-dropdown__item[data-active]'));
      const active = el.querySelector('.dvfy-dropdown__item[data-active]');
      expect(active.textContent).to.equal('First');
    });
  });
});
