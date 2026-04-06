import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-button.js';
import './dvfy-dropdown.js';

// Helper: dispatch a keydown on the dropdown element (where the listener lives)
function pressKey(el, key) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

// Helper: get the currently active (focused) menu item
function getActiveItem(el) {
  return el.querySelector('.dvfy-dropdown__item[data-active]');
}

// Helper: get all menu items inside the dropdown
function getItems(el) {
  return Array.from(el.querySelectorAll('.dvfy-dropdown__item'));
}

describe('dvfy-dropdown — accessibility', () => {

  // ─── Arrow Key Navigation ─────────────────────────────────────────────────

  describe('arrow key navigation', () => {
    it('ArrowDown on open dropdown focuses the first item', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">First</a>
          <a href="/two">Second</a>
        </dvfy-dropdown>
      `);
      pressKey(el, 'ArrowDown');
      const active = getActiveItem(el);
      expect(active).to.exist;
      expect(active.textContent.trim()).to.equal('First');
    });

    it('ArrowDown moves focus to the next item', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">First</a>
          <a href="/two">Second</a>
        </dvfy-dropdown>
      `);
      pressKey(el, 'ArrowDown'); // First (index 0)
      pressKey(el, 'ArrowDown'); // Second (index 1)
      const active = getActiveItem(el);
      expect(active.textContent.trim()).to.equal('Second');
    });

    it('ArrowUp moves focus to the previous item', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">First</a>
          <a href="/two">Second</a>
        </dvfy-dropdown>
      `);
      pressKey(el, 'ArrowDown'); // First
      pressKey(el, 'ArrowDown'); // Second
      pressKey(el, 'ArrowUp');   // back to First
      const active = getActiveItem(el);
      expect(active.textContent.trim()).to.equal('First');
    });

    it('wraps from last item to first on ArrowDown', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">First</a>
          <a href="/two">Second</a>
        </dvfy-dropdown>
      `);
      pressKey(el, 'ArrowDown'); // First (0)
      pressKey(el, 'ArrowDown'); // Second (1)
      pressKey(el, 'ArrowDown'); // wraps to First (0)
      const active = getActiveItem(el);
      expect(active.textContent.trim()).to.equal('First');
    });

    it('wraps from first item to last on ArrowUp', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">First</a>
          <a href="/two">Second</a>
          <a href="/three">Third</a>
        </dvfy-dropdown>
      `);
      pressKey(el, 'ArrowDown'); // First (0)
      pressKey(el, 'ArrowUp');   // wraps to Third (2)
      const active = getActiveItem(el);
      expect(active.textContent.trim()).to.equal('Third');
    });

    it('Home key is not intercepted — menu stays open', async () => {
      // dvfy-dropdown uses role="menu" (not listbox); Home/End are outside its
      // keyboard contract. Pressing Home must not throw or close the menu.
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">First</a>
          <a href="/two">Second</a>
        </dvfy-dropdown>
      `);
      pressKey(el, 'ArrowDown');
      pressKey(el, 'Home');
      expect(el.hasAttribute('open')).to.be.true;
    });

    it('End key is not intercepted — menu stays open', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">First</a>
        </dvfy-dropdown>
      `);
      pressKey(el, 'ArrowDown');
      pressKey(el, 'End');
      expect(el.hasAttribute('open')).to.be.true;
    });
  });

  // ─── Selection & Activation ───────────────────────────────────────────────

  describe('selection and activation', () => {
    it('Enter key activates (clicks) the focused item', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <button id="first">First</button>
          <button id="second">Second</button>
        </dvfy-dropdown>
      `);
      let clicked = null;
      getItems(el).forEach(item => { item.addEventListener('click', () => { clicked = item.id; }); });
      pressKey(el, 'ArrowDown'); // focus First
      pressKey(el, 'Enter');
      expect(clicked).to.equal('first');
    });

    it('Space key activates (clicks) the focused item', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <button id="first">First</button>
          <button id="second">Second</button>
        </dvfy-dropdown>
      `);
      let clicked = null;
      getItems(el).forEach(item => { item.addEventListener('click', () => { clicked = item.id; }); });
      pressKey(el, 'ArrowDown'); // focus First
      pressKey(el, ' ');
      expect(clicked).to.equal('first');
    });

    it('Enter activates the correct focused item, not others', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <button id="first">First</button>
          <button id="second">Second</button>
          <button id="third">Third</button>
        </dvfy-dropdown>
      `);
      const clicks = [];
      getItems(el).forEach(item => { item.addEventListener('click', () => { clicks.push(item.id); }); });
      pressKey(el, 'ArrowDown'); // First (0)
      pressKey(el, 'ArrowDown'); // Second (1)
      pressKey(el, 'Enter');
      expect(clicks).to.deep.equal(['second']);
    });

    it('Enter closes the dropdown after activation', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <button>Item</button>
        </dvfy-dropdown>
      `);
      pressKey(el, 'ArrowDown');
      pressKey(el, 'Enter');
      expect(el.hasAttribute('open')).to.be.false;
    });

    it('Space closes the dropdown after activation', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <button>Item</button>
        </dvfy-dropdown>
      `);
      pressKey(el, 'ArrowDown');
      pressKey(el, ' ');
      expect(el.hasAttribute('open')).to.be.false;
    });
  });

  // ─── ARIA State ───────────────────────────────────────────────────────────

  describe('ARIA state', () => {
    it('menu container has role="menu"', async () => {
      const el = await fixture(html`
        <dvfy-dropdown>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">Item</a>
        </dvfy-dropdown>
      `);
      expect(el.querySelector('.dvfy-dropdown__menu').getAttribute('role')).to.equal('menu');
    });

    it('each item has role="menuitem"', async () => {
      const el = await fixture(html`
        <dvfy-dropdown>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">First</a>
          <a href="/two">Second</a>
        </dvfy-dropdown>
      `);
      for (const item of getItems(el)) {
        expect(item.getAttribute('role')).to.equal('menuitem');
      }
    });

    it('items have tabindex="-1" (focusable but outside tab order)', async () => {
      const el = await fixture(html`
        <dvfy-dropdown>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">First</a>
          <a href="/two">Second</a>
        </dvfy-dropdown>
      `);
      for (const item of getItems(el)) {
        expect(item.getAttribute('tabindex')).to.equal('-1');
      }
    });

    it('focused item receives data-active attribute', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">First</a>
          <a href="/two">Second</a>
        </dvfy-dropdown>
      `);
      pressKey(el, 'ArrowDown');
      const active = getActiveItem(el);
      expect(active).to.exist;
      expect(active.textContent.trim()).to.equal('First');
    });

    it('only one item has data-active at a time', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">First</a>
          <a href="/two">Second</a>
          <a href="/three">Third</a>
        </dvfy-dropdown>
      `);
      pressKey(el, 'ArrowDown'); // First
      pressKey(el, 'ArrowDown'); // Second
      expect(el.querySelectorAll('.dvfy-dropdown__item[data-active]').length).to.equal(1);
    });

    it('data-active is cleared when dropdown closes', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">First</a>
        </dvfy-dropdown>
      `);
      pressKey(el, 'ArrowDown');
      expect(getActiveItem(el)).to.exist;
      pressKey(el, 'Escape');
      expect(getActiveItem(el)).to.be.null;
    });
  });

  // ─── Focus Management ─────────────────────────────────────────────────────

  describe('focus management', () => {
    it('ArrowDown on closed dropdown opens it and focuses first item', async () => {
      const el = await fixture(html`
        <dvfy-dropdown>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">First</a>
          <a href="/two">Second</a>
        </dvfy-dropdown>
      `);
      expect(el.hasAttribute('open')).to.be.false;
      pressKey(el, 'ArrowDown');
      expect(el.hasAttribute('open')).to.be.true;
      const active = getActiveItem(el);
      expect(active).to.exist;
      expect(document.activeElement).to.equal(active);
    });

    it('focused item receives actual DOM focus', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">First</a>
          <a href="/two">Second</a>
        </dvfy-dropdown>
      `);
      pressKey(el, 'ArrowDown');
      expect(document.activeElement).to.equal(getActiveItem(el));
    });

    it('focus returns to trigger after Escape', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">Item</a>
        </dvfy-dropdown>
      `);
      const trigger = el.querySelector('dvfy-button');
      pressKey(el, 'Escape');
      expect(document.activeElement).to.equal(trigger);
    });

    it('focus returns to trigger after Enter activation', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <button>Item</button>
        </dvfy-dropdown>
      `);
      const trigger = el.querySelector('dvfy-button');
      pressKey(el, 'ArrowDown');
      pressKey(el, 'Enter');
      expect(document.activeElement).to.equal(trigger);
    });

    it('focus returns to trigger after Space activation', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <button>Item</button>
        </dvfy-dropdown>
      `);
      const trigger = el.querySelector('dvfy-button');
      pressKey(el, 'ArrowDown');
      pressKey(el, ' ');
      expect(document.activeElement).to.equal(trigger);
    });
  });

  // ─── Keyboard Edge Cases ──────────────────────────────────────────────────

  describe('keyboard edge cases', () => {
    it('Escape closes the dropdown', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">Item</a>
        </dvfy-dropdown>
      `);
      pressKey(el, 'Escape');
      expect(el.hasAttribute('open')).to.be.false;
    });

    it('Escape on already-closed dropdown does not throw', async () => {
      const el = await fixture(html`
        <dvfy-dropdown>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">Item</a>
        </dvfy-dropdown>
      `);
      let threw = false;
      try { pressKey(el, 'Escape'); } catch (e) { threw = true; }
      expect(threw).to.be.false;
      expect(el.hasAttribute('open')).to.be.false;
    });

    it('Tab does not throw or crash the component', async () => {
      // dvfy-dropdown does not intercept Tab; natural browser focus applies.
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">Item</a>
        </dvfy-dropdown>
      `);
      let threw = false;
      try { pressKey(el, 'Tab'); } catch (e) { threw = true; }
      expect(threw).to.be.false;
    });

    it('unhandled keys do not close the dropdown', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">Item</a>
        </dvfy-dropdown>
      `);
      pressKey(el, 'a');
      pressKey(el, 'b');
      pressKey(el, 'Shift');
      expect(el.hasAttribute('open')).to.be.true;
    });

    it('Enter on closed dropdown opens it and focuses first item', async () => {
      const el = await fixture(html`
        <dvfy-dropdown>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">First</a>
          <a href="/two">Second</a>
        </dvfy-dropdown>
      `);
      pressKey(el, 'Enter');
      expect(el.hasAttribute('open')).to.be.true;
      const active = getActiveItem(el);
      expect(active).to.exist;
      expect(active.textContent.trim()).to.equal('First');
    });

    it('Space on closed dropdown opens it and focuses first item', async () => {
      const el = await fixture(html`
        <dvfy-dropdown>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">First</a>
          <a href="/two">Second</a>
        </dvfy-dropdown>
      `);
      pressKey(el, ' ');
      expect(el.hasAttribute('open')).to.be.true;
      const active = getActiveItem(el);
      expect(active).to.exist;
      expect(active.textContent.trim()).to.equal('First');
    });

    it('ArrowDown on already-open dropdown does not close it', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">First</a>
        </dvfy-dropdown>
      `);
      pressKey(el, 'ArrowDown');
      expect(el.hasAttribute('open')).to.be.true;
    });
  });

  // ─── Keyboard Listener Lifecycle ─────────────────────────────────────────

  describe('keyboard listener lifecycle', () => {
    it('no stale handler after element is removed from DOM', async () => {
      const el = await fixture(html`
        <dvfy-dropdown open>
          <dvfy-button>Menu</dvfy-button>
          <a href="/one">Item</a>
        </dvfy-dropdown>
      `);
      el.remove();
      // Dispatch to detached element — must not throw
      let threw = false;
      try {
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      } catch (e) {
        threw = true;
      }
      expect(threw).to.be.false;
    });
  });

});
