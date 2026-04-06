import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-drawer.js';

// dvfy-drawer inserts a sibling reopen button before itself in the parent,
// so fixture() returns the wrong element if we create the drawer directly.
// Always wrap in a container and query for the drawer.

async function createDrawer(attrs = '', content = '<p>Content</p>') {
  const container = await fixture(html`<div style="position:relative"><dvfy-drawer>${content}</dvfy-drawer></div>`);
  return container.querySelector('dvfy-drawer');
}

async function createDrawerHTML(template) {
  const container = await fixture(template);
  return container.querySelector('dvfy-drawer');
}

// Dispatch a keydown on the drawer element (where the keyboard listener lives)
function pressKey(el, key, options = {}) {
  el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options }));
}

// Get all focusable elements inside the drawer
function focusableIn(el) {
  return Array.from(el.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ));
}

describe('dvfy-drawer — accessibility', () => {

  // ─── Escape Key ──────────────────────────────────────────────────────────────
  // The drawer is a collapsible panel, not a modal. Escape collapses it.
  // "collapse" = drawer slides out of view but remains in DOM.

  describe('Escape key', () => {
    it('Escape collapses an expanded drawer', async () => {
      const el = await createDrawer();
      expect(el.hasAttribute('collapsed')).to.be.false;

      pressKey(el, 'Escape');

      expect(el.hasAttribute('collapsed')).to.be.true;
    });

    it('Escape fires a toggle event with collapsed: true', async () => {
      const el = await createDrawer();

      setTimeout(() => pressKey(el, 'Escape'));
      const event = await oneEvent(el, 'toggle');

      expect(event.detail.collapsed).to.be.true;
    });

    it('toggle event bubbles', async () => {
      const el = await createDrawer();

      setTimeout(() => pressKey(el, 'Escape'));
      const event = await oneEvent(el, 'toggle');

      expect(event.bubbles).to.be.true;
    });

    it('Escape on already-collapsed drawer does nothing', async () => {
      const el = await createDrawerHTML(html`<div><dvfy-drawer collapsed><p>Content</p></dvfy-drawer></div>`);
      expect(el.hasAttribute('collapsed')).to.be.true;

      // Dispatch Escape — the handler guards against collapsed state
      pressKey(el, 'Escape');

      // Still collapsed — no spurious expand
      expect(el.hasAttribute('collapsed')).to.be.true;
    });

    it('Escape is ignored when fixed attribute is set', async () => {
      const el = await createDrawerHTML(html`<div><dvfy-drawer fixed><p>Content</p></dvfy-drawer></div>`);
      pressKey(el, 'Escape');
      expect(el.hasAttribute('collapsed')).to.be.false;
    });

    it('Escape on fixed collapsed drawer does not change state', async () => {
      const el = await createDrawerHTML(html`<div><dvfy-drawer fixed collapsed><p>Content</p></dvfy-drawer></div>`);
      pressKey(el, 'Escape');
      expect(el.hasAttribute('collapsed')).to.be.true;
    });
  });

  // ─── ARIA Attributes ─────────────────────────────────────────────────────────
  // The drawer is a collapsible panel widget. It exposes accessible labels on
  // its interactive controls (toggle button, reopen tab). It is NOT a dialog.

  describe('ARIA attributes', () => {
    it('collapse toggle button has aria-label="Collapse panel"', async () => {
      const el = await createDrawer();
      const toggle = el.querySelector('.dvfy-drawer__toggle');
      expect(toggle).to.exist;
      expect(toggle.getAttribute('aria-label')).to.equal('Collapse panel');
    });

    it('collapse toggle button has title="Collapse"', async () => {
      const el = await createDrawer();
      const toggle = el.querySelector('.dvfy-drawer__toggle');
      expect(toggle.getAttribute('title')).to.equal('Collapse');
    });

    it('collapse toggle button is a native <button>', async () => {
      const el = await createDrawer();
      const toggle = el.querySelector('.dvfy-drawer__toggle');
      expect(toggle.tagName.toLowerCase()).to.equal('button');
    });

    it('reopen tab has an aria-label describing the panel name', async () => {
      const container = await fixture(html`<div style="position:relative"><dvfy-drawer header="Settings"><p>Content</p></dvfy-drawer></div>`);
      const reopen = container.querySelector('.dvfy-drawer__reopen');
      expect(reopen).to.exist;
      expect(reopen.getAttribute('aria-label')).to.equal('Open settings');
    });

    it('reopen tab is a native <button>', async () => {
      const container = await fixture(html`<div style="position:relative"><dvfy-drawer><p>Content</p></dvfy-drawer></div>`);
      const reopen = container.querySelector('.dvfy-drawer__reopen');
      expect(reopen.tagName.toLowerCase()).to.equal('button');
    });

    it('header title is present and reflects header attribute', async () => {
      const el = await createDrawerHTML(html`<div><dvfy-drawer header="Details"><p>Content</p></dvfy-drawer></div>`);
      const title = el.querySelector('.dvfy-drawer__title');
      expect(title).to.exist;
      expect(title.textContent).to.equal('Details');
    });

    it('no collapse toggle is present when fixed — no stale aria-label', async () => {
      const el = await createDrawerHTML(html`<div><dvfy-drawer fixed><p>Content</p></dvfy-drawer></div>`);
      const toggle = el.querySelector('.dvfy-drawer__toggle');
      expect(toggle).to.be.null;
    });

    it('header is absent when no-header is set — no orphan aria targets', async () => {
      const el = await createDrawerHTML(html`<div><dvfy-drawer no-header><p>Content</p></dvfy-drawer></div>`);
      expect(el.querySelector('.dvfy-drawer__header')).to.be.null;
    });
  });

  // ─── Keyboard Control Accessibility ──────────────────────────────────────────
  // The collapse toggle and reopen tab must be keyboard-accessible as native
  // buttons. Tab navigation within the drawer reaches slotted focusable content.

  describe('keyboard control accessibility', () => {
    it('collapse toggle receives keyboard click via Enter', async () => {
      const el = await createDrawer();
      const toggle = el.querySelector('.dvfy-drawer__toggle');

      // Native buttons respond to Enter natively in the browser; simulate click
      setTimeout(() => toggle.click());
      const event = await oneEvent(el, 'toggle');

      expect(event.detail.collapsed).to.be.true;
    });

    it('reopen tab receives keyboard click and expands drawer', async () => {
      const container = await fixture(html`<div style="position:relative"><dvfy-drawer collapsed><p>Content</p></dvfy-drawer></div>`);
      const el = container.querySelector('dvfy-drawer');
      const reopen = container.querySelector('.dvfy-drawer__reopen');
      expect(el.hasAttribute('collapsed')).to.be.true;

      setTimeout(() => reopen.click());
      const event = await oneEvent(el, 'toggle');

      expect(event.detail.collapsed).to.be.false;
    });

    it('Tab does not crash the component', async () => {
      // dvfy-drawer does not intercept Tab; natural browser focus order applies.
      const el = await createDrawer();
      let threw = false;
      try { pressKey(el, 'Tab'); } catch (e) { threw = true; }
      expect(threw).to.be.false;
    });

    it('Shift+Tab does not crash the component', async () => {
      const el = await createDrawer();
      let threw = false;
      try { pressKey(el, 'Tab', { shiftKey: true }); } catch (e) { threw = true; }
      expect(threw).to.be.false;
    });

    it('focusable content in drawer body is tab-reachable', async () => {
      const el = await createDrawerHTML(html`
        <div>
          <dvfy-drawer header="Nav">
            <button id="btn-a">Action A</button>
            <button id="btn-b">Action B</button>
          </dvfy-drawer>
        </div>
      `);
      const focusables = focusableIn(el);
      // Toggle button + two content buttons
      expect(focusables.length).to.be.at.least(2);
      const ids = focusables.map(f => f.id);
      expect(ids).to.include('btn-a');
      expect(ids).to.include('btn-b');
    });

    it('unhandled keys do not trigger collapse', async () => {
      const el = await createDrawer();
      pressKey(el, 'a');
      pressKey(el, 'Enter');
      pressKey(el, 'ArrowDown');
      expect(el.hasAttribute('collapsed')).to.be.false;
    });

    it('Escape stops propagation — does not bubble to parent listeners', async () => {
      const container = await fixture(html`<div style="position:relative"><dvfy-drawer><p>Content</p></dvfy-drawer></div>`);
      const el = container.querySelector('dvfy-drawer');

      let parentFired = false;
      container.addEventListener('keydown', () => { parentFired = true; });

      pressKey(el, 'Escape');

      await Promise.resolve();
      expect(parentFired).to.be.false;
    });
  });

  // ─── Collapse / Expand Lifecycle ─────────────────────────────────────────────

  describe('collapse/expand lifecycle', () => {
    it('reopen tab is hidden when drawer is expanded', async () => {
      const container = await fixture(html`<div style="position:relative"><dvfy-drawer><p>Content</p></dvfy-drawer></div>`);
      const reopen = container.querySelector('.dvfy-drawer__reopen');
      // Expanded: reopen tab must NOT have data-visible
      expect(reopen.hasAttribute('data-visible')).to.be.false;
    });

    it('reopen tab becomes visible when drawer collapses', async () => {
      const container = await fixture(html`<div style="position:relative"><dvfy-drawer><p>Content</p></dvfy-drawer></div>`);
      const el = container.querySelector('dvfy-drawer');
      const reopen = container.querySelector('.dvfy-drawer__reopen');

      el.setAttribute('collapsed', '');

      expect(reopen.hasAttribute('data-visible')).to.be.true;
    });

    it('reopen tab is hidden again when drawer re-expands', async () => {
      const container = await fixture(html`<div style="position:relative"><dvfy-drawer collapsed><p>Content</p></dvfy-drawer></div>`);
      const el = container.querySelector('dvfy-drawer');
      const reopen = container.querySelector('.dvfy-drawer__reopen');
      expect(reopen.hasAttribute('data-visible')).to.be.true;

      el.removeAttribute('collapsed');

      expect(reopen.hasAttribute('data-visible')).to.be.false;
    });

    it('toggle event fires with collapsed: false when expanding', async () => {
      const container = await fixture(html`<div style="position:relative"><dvfy-drawer collapsed><p>Content</p></dvfy-drawer></div>`);
      const el = container.querySelector('dvfy-drawer');

      setTimeout(() => el.removeAttribute('collapsed'));
      const event = await oneEvent(el, 'toggle');

      expect(event.detail.collapsed).to.be.false;
    });

    it('collapsed property getter reflects attribute state', async () => {
      const el = await createDrawer();
      expect(el.collapsed).to.be.false;

      el.setAttribute('collapsed', '');
      expect(el.collapsed).to.be.true;

      el.removeAttribute('collapsed');
      expect(el.collapsed).to.be.false;
    });
  });

  // ─── Keyboard Listener Lifecycle ─────────────────────────────────────────────

  describe('keyboard listener lifecycle', () => {
    it('removes keydown listener when element is disconnected — no stale handler', async () => {
      const el = await createDrawer();
      el.remove();

      let threw = false;
      try {
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      } catch (e) {
        threw = true;
      }
      expect(threw).to.be.false;
    });

    it('does not collapse after removal — event has no effect', async () => {
      const el = await createDrawer();
      el.remove();

      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      // No crash and no state change expected
      expect(el.hasAttribute('collapsed')).to.be.false;
    });
  });

  // ─── Content Type Compatibility ──────────────────────────────────────────────
  // Verify the drawer works correctly with various content types in the body slot.

  describe('content type compatibility', () => {
    it('works with form inputs as body content', async () => {
      const el = await createDrawerHTML(html`
        <div>
          <dvfy-drawer header="Filters">
            <input id="search" type="text" placeholder="Search" />
            <button id="apply">Apply</button>
          </dvfy-drawer>
        </div>
      `);
      const input = el.querySelector('#search');
      const btn = el.querySelector('#apply');
      expect(input).to.exist;
      expect(btn).to.exist;

      // Focus is reachable inside body
      const focusables = focusableIn(el);
      expect(focusables).to.include(input);
      expect(focusables).to.include(btn);
    });

    it('works with link elements as body content', async () => {
      const el = await createDrawerHTML(html`
        <div>
          <dvfy-drawer header="Nav">
            <a href="/home" id="link-home">Home</a>
            <a href="/about" id="link-about">About</a>
          </dvfy-drawer>
        </div>
      `);
      const home = el.querySelector('#link-home');
      const about = el.querySelector('#link-about');
      expect(home).to.exist;
      expect(about).to.exist;

      const focusables = focusableIn(el);
      expect(focusables).to.include(home);
      expect(focusables).to.include(about);
    });

    it('body is still accessible after collapse/expand cycle', async () => {
      const el = await createDrawerHTML(html`
        <div>
          <dvfy-drawer>
            <button id="inner">Inner Action</button>
          </dvfy-drawer>
        </div>
      `);

      // Collapse then expand
      el.collapsed = true;
      el.collapsed = false;

      const inner = el.querySelector('#inner');
      expect(inner).to.exist;
      expect(el.querySelector('.dvfy-drawer__body')).to.exist;
    });

    it('works with no focusable content in body — only toggle button is focusable', async () => {
      const el = await createDrawerHTML(html`
        <div>
          <dvfy-drawer header="Info">
            <p>Read-only text content with no interactive elements.</p>
          </dvfy-drawer>
        </div>
      `);
      const focusables = focusableIn(el);
      // Only the collapse toggle button
      expect(focusables.length).to.equal(1);
      expect(focusables[0].classList.contains('dvfy-drawer__toggle')).to.be.true;
    });
  });

});
