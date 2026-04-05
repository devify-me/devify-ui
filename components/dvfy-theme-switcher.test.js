import { fixture, html, expect } from '@open-wc/testing';
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
    });

    it('is defined as a custom element', async () => {
      expect(customElements.get('dvfy-theme-switcher')).to.exist;
    });

    it('renders dark/light toggle button', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      const toggle = el.querySelector('.dvfy-ts__toggle');
      expect(toggle).to.exist;
    });

    it('renders thumb inside toggle', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      const thumb = el.querySelector('.dvfy-ts__thumb');
      expect(thumb).to.exist;
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
      // With multiple themes, a select or dropdown should appear
      const select = el.querySelector('dvfy-select');
      expect(select).to.exist;
    });

    it('hides theme selector with only one theme', async () => {
      const el = await fixture(html`
        <dvfy-theme-switcher>
          <option value="blue">Blue</option>
        </dvfy-theme-switcher>
      `);
      const select = el.querySelector('dvfy-select');
      expect(select).to.not.exist;
    });

    it('hides theme selector with no themes', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      const select = el.querySelector('dvfy-select');
      expect(select).to.not.exist;
    });
  });

  describe('dark/light toggle', () => {
    it('defaults to light mode', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      expect(el.getAttribute('data-mode')).to.equal('light');
    });

    it('accepts default-mode=dark', async () => {
      const el = await fixture(html`<dvfy-theme-switcher default-mode="dark"></dvfy-theme-switcher>`);
      expect(el.getAttribute('data-mode')).to.equal('dark');
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
    });
  });

  describe('ARIA', () => {
    it('toggle has role=switch', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      const toggle = el.querySelector('.dvfy-ts__toggle');
      expect(toggle.getAttribute('role')).to.equal('switch');
    });

    it('toggle has aria-label', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      const toggle = el.querySelector('.dvfy-ts__toggle');
      expect(toggle.getAttribute('aria-label')).to.equal('Dark mode');
    });

    it('toggle aria-checked reflects mode', async () => {
      const el = await fixture(html`<dvfy-theme-switcher default-mode="light"></dvfy-theme-switcher>`);
      const toggle = el.querySelector('.dvfy-ts__toggle');
      expect(toggle.getAttribute('aria-checked')).to.equal('false');
      toggle.click();
      expect(toggle.getAttribute('aria-checked')).to.equal('true');
    });
  });

  describe('addTheme API', () => {
    it('exposes addTheme method', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      expect(el.addTheme).to.be.a('function');
    });

    it('adds a theme dynamically', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      el.addTheme('custom', 'Custom Theme');
      el.addTheme('another', 'Another Theme');
      // After adding 2 themes, select should appear
      const select = el.querySelector('dvfy-select');
      expect(select).to.exist;
    });

    it('does not add duplicate themes', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      el.addTheme('custom', 'Custom');
      el.addTheme('custom', 'Custom Duplicate');
      el.addTheme('second', 'Second');
      const options = el.querySelectorAll('dvfy-select option');
      expect(options.length).to.equal(2);
    });
  });

  describe('removeTheme API', () => {
    it('exposes removeTheme method', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      expect(el.removeTheme).to.be.a('function');
    });
  });

  describe('setTheme API', () => {
    it('exposes setTheme method', async () => {
      const el = await fixture(html`<dvfy-theme-switcher></dvfy-theme-switcher>`);
      expect(el.setTheme).to.be.a('function');
    });
  });

  describe('variant attribute', () => {
    it('uses select variant by default', async () => {
      const el = await fixture(html`
        <dvfy-theme-switcher>
          <option value="a">A</option>
          <option value="b">B</option>
        </dvfy-theme-switcher>
      `);
      const select = el.querySelector('dvfy-select');
      expect(select).to.exist;
    });

    it('uses dropdown variant when specified', async () => {
      const el = await fixture(html`
        <dvfy-theme-switcher variant="dropdown">
          <option value="a">A</option>
          <option value="b">B</option>
        </dvfy-theme-switcher>
      `);
      const dropdown = el.querySelector('dvfy-dropdown');
      expect(dropdown).to.exist;
    });
  });

  describe('observed attributes', () => {
    it('observes expected attributes', () => {
      const observed = customElements.get('dvfy-theme-switcher').observedAttributes;
      expect(observed).to.include('default-theme');
      expect(observed).to.include('default-mode');
      expect(observed).to.include('round');
      expect(observed).to.include('variant');
    });
  });
});
