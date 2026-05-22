import { fixture, html, expect } from '@open-wc/testing';
import { checkA11y } from '../utils/axe-test.js';
import './dvfy-dropdown.js';
import './dvfy-button.js';
import './dvfy-theme-switcher.js';

describe('dvfy-theme-switcher', () => {
  // Clean up localStorage and data-theme between tests
  beforeEach(() => {
    localStorage.removeItem('dvfy-catalog-theme');
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    localStorage.removeItem('dvfy-catalog-theme');
    document.documentElement.removeAttribute('data-theme');
  });

  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      expect(el).to.exist;
      await checkA11y(el);
    });

    it('is defined as a custom element', async () => {
      expect(customElements.get('dvfy-theme-switcher')).to.exist;
    });

    it('renders dark/light toggle button', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      const toggle = el.querySelector('.dvfy-ts__toggle');
      expect(toggle).to.exist;
      await checkA11y(el);
    });

    it('renders thumb inside toggle', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      const thumb = el.querySelector('.dvfy-ts__thumb');
      expect(thumb).to.exist;
      await checkA11y(el);
    });
  });

  describe('theme options', () => {
    it('parses option children as themes', async () => {
      const el = await fixture(html`
        <dvfy-theme-switcher>
          <option value="blue">Blue</option>
          <option value="green">Green</option>
        </dvfy-theme-switcher>
      `);
      // With ≥1 custom themes, the palette dropdown is rendered
      const dropdown = el.querySelector('dvfy-dropdown');
      expect(dropdown).to.exist;
      await checkA11y(el);
    });

    it('hides theme selector with only one theme', async () => {
      const el = await fixture(html`
        <dvfy-theme-switcher>
          <option value="blue">Blue</option>
        </dvfy-theme-switcher>
      `);
      const select = el.querySelector('dvfy-select');
      expect(select).to.not.exist;
      await checkA11y(el);
    });

    it('hides theme selector with no themes', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      const select = el.querySelector('dvfy-select');
      expect(select).to.not.exist;
      await checkA11y(el);
    });
  });

  describe('dark/light toggle', () => {
    it('defaults to light mode', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      expect(el.getAttribute('data-mode')).to.equal('light');
      await checkA11y(el);
    });

    it('accepts default-mode=dark', async () => {
      const el = await fixture(html`<dvfy-theme-switcher default-mode="dark"></dvfy-theme-switcher>`);
      expect(el.getAttribute('data-mode')).to.equal('dark');
      await checkA11y(el);
    });

    it('toggles mode on click', async () => {
      const el = await fixture(html`
        <dvfy-theme-switcher default-mode="light">
          <option value="test">Test</option>
        </dvfy-theme-switcher>
      `);
      const toggle = el.querySelector('.dvfy-ts__toggle');
      expect(el.getAttribute('data-mode')).to.equal('light');
      toggle.click();
      expect(el.getAttribute('data-mode')).to.equal('dark');
      toggle.click();
      expect(el.getAttribute('data-mode')).to.equal('light');
      await checkA11y(el);
    });
  });

  describe('ARIA', () => {
    it('toggle has role=switch', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      const toggle = el.querySelector('.dvfy-ts__toggle');
      expect(toggle.getAttribute('role')).to.equal('switch');
      await checkA11y(el);
    });

    it('toggle has aria-label', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      const toggle = el.querySelector('.dvfy-ts__toggle');
      expect(toggle.getAttribute('aria-label')).to.equal('Dark mode');
      await checkA11y(el);
    });

    it('toggle aria-checked reflects mode', async () => {
      const el = await fixture(html`<dvfy-theme-switcher default-mode="light"></dvfy-theme-switcher>`);
      const toggle = el.querySelector('.dvfy-ts__toggle');
      expect(toggle.getAttribute('aria-checked')).to.equal('false');
      toggle.click();
      expect(toggle.getAttribute('aria-checked')).to.equal('true');
      await checkA11y(el);
    });
  });

  describe('addTheme API', () => {
    it('exposes addTheme method', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      expect(el.addTheme).to.be.a('function');
      await checkA11y(el);
    });

    it('adds a theme dynamically', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      el.addTheme('custom', 'Custom Theme');
      el.addTheme('another', 'Another Theme');
      // After adding themes, palette dropdown appears
      const dropdown = el.querySelector('dvfy-dropdown');
      expect(dropdown).to.exist;
      await checkA11y(el);
    });

    it('does not add duplicate themes', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      el.addTheme('custom', 'Custom');
      el.addTheme('custom', 'Custom Duplicate');
      el.addTheme('second', 'Second');
      // Theme items in dropdown: one per registered theme (dark/light row is in dvfy-ts__mode-row)
      const themeItems = el.querySelectorAll('dvfy-dropdown dvfy-button[data-value]');
      expect(themeItems.length).to.equal(2);
      await checkA11y(el);
    });

    it('transitions from switch-only to palette dropdown when first theme is added', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      // Initially: just the dark/light toggle, no dropdown
      expect(el.querySelector('dvfy-dropdown')).to.be.null;
      expect(el.querySelector('.dvfy-ts__toggle')).to.exist;
      // After first addTheme: palette dropdown appears
      el.addTheme('custom', 'Custom Theme');
      expect(el.querySelector('dvfy-dropdown')).to.exist;
      // Mode toggle moved into the dropdown's mode-row
      expect(el.querySelector('.dvfy-ts__mode-row .dvfy-ts__toggle')).to.exist;
    });
  });

  describe('removeTheme API', () => {
    it('exposes removeTheme method', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      expect(el.removeTheme).to.be.a('function');
      await checkA11y(el);
    });
  });

  describe('setTheme API', () => {
    it('exposes setTheme method', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      expect(el.setTheme).to.be.a('function');
      await checkA11y(el);
    });
  });

  describe('adaptive UI', () => {
    it('renders only the dark/light toggle when no custom themes are registered', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      // No dropdown, no select — just the mode toggle directly on the element
      expect(el.querySelector('dvfy-dropdown')).to.be.null;
      expect(el.querySelector('dvfy-select')).to.be.null;
      expect(el.querySelector(':scope > .dvfy-ts__toggle')).to.exist;
      await checkA11y(el);
    });

    it('renders palette dropdown with mode toggle on top when ≥1 custom themes exist', async () => {
      const el = await fixture(html`
        <dvfy-theme-switcher>
          <option value="a">A</option>
          <option value="b">B</option>
        </dvfy-theme-switcher>
      `);
      const dropdown = el.querySelector('dvfy-dropdown');
      expect(dropdown).to.exist;
      // The mode toggle is wrapped in the first menu row
      expect(dropdown.querySelector('.dvfy-ts__mode-row .dvfy-ts__toggle')).to.exist;
      // Theme items follow after the divider
      expect(dropdown.querySelector('.dvfy-ts__divider')).to.exist;
      expect(dropdown.querySelectorAll('dvfy-button[data-value]').length).to.equal(2);
      await checkA11y(el);
    });
  });

  describe('observed attributes', () => {
    it('observes expected attributes', () => {
      const observed = customElements.get('dvfy-theme-switcher').observedAttributes;
      expect(observed).to.include('default-theme');
      expect(observed).to.include('default-mode');
      expect(observed).to.include('round');
      // `variant` was removed in favor of auto-adapt
      expect(observed).to.not.include('variant');
    });
  });
});
