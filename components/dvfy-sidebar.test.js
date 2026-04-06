import { fixture, html, expect } from '@open-wc/testing';
import { checkA11y } from '../utils/axe-test.js';
import './dvfy-sidebar.js';

describe('dvfy-sidebar', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`
        <dvfy-sidebar>
          <dvfy-sidebar-section label="Main">
            <a href="/">Dashboard</a>
          </dvfy-sidebar-section>
        </dvfy-sidebar>
      `);
      expect(el.getAttribute('role')).to.equal('navigation');
      expect(el.getAttribute('aria-label')).to.equal('Sidebar');
      await checkA11y(el);
    });

    it('renders toggle button', async () => {
      const el = await fixture(html`<dvfy-sidebar></dvfy-sidebar>`);
      const toggle = el.querySelector('.dvfy-sidebar__toggle');
      expect(toggle).to.exist;
      expect(toggle.getAttribute('aria-label')).to.equal('Toggle sidebar');
      await checkA11y(el);
    });

    it('renders nav wrapper', async () => {
      const el = await fixture(html`<dvfy-sidebar></dvfy-sidebar>`);
      const nav = el.querySelector('.dvfy-sidebar__nav');
      expect(nav).to.exist;
      await checkA11y(el);
    });

    it('moves children into nav wrapper', async () => {
      const el = await fixture(html`
        <dvfy-sidebar>
          <dvfy-sidebar-section label="Main">
            <a href="/">Dashboard</a>
          </dvfy-sidebar-section>
        </dvfy-sidebar>
      `);
      const nav = el.querySelector('.dvfy-sidebar__nav');
      const section = nav.querySelector('dvfy-sidebar-section');
      expect(section).to.exist;
      await checkA11y(el);
    });
  });

  describe('attributes', () => {
    it('accepts collapsed attribute', async () => {
      const el = await fixture(html`<dvfy-sidebar collapsed></dvfy-sidebar>`);
      expect(el.hasAttribute('collapsed')).to.be.true;
      await checkA11y(el);
    });

    it('accepts collapsible attribute', async () => {
      const el = await fixture(html`<dvfy-sidebar collapsible></dvfy-sidebar>`);
      expect(el.hasAttribute('collapsible')).to.be.true;
      await checkA11y(el);
    });

    it('sets custom width via CSS property', async () => {
      const el = await fixture(html`<dvfy-sidebar width="20rem"></dvfy-sidebar>`);
      expect(el.style.getPropertyValue('--dvfy-sidebar-width')).to.equal('20rem');
      await checkA11y(el);
    });

    it('updates CSS property when width attribute changes', async () => {
      const el = await fixture(html`<dvfy-sidebar width="16rem"></dvfy-sidebar>`);
      el.setAttribute('width', '24rem');
      expect(el.style.getPropertyValue('--dvfy-sidebar-width')).to.equal('24rem');
      await checkA11y(el);
    });
  });

  describe('collapse toggle', () => {
    it('toggles collapsed state on button click', async () => {
      const el = await fixture(html`<dvfy-sidebar collapsible></dvfy-sidebar>`);
      const toggle = el.querySelector('.dvfy-sidebar__toggle');
      expect(el.hasAttribute('collapsed')).to.be.false;
      toggle.click();
      expect(el.hasAttribute('collapsed')).to.be.true;
      toggle.click();
      expect(el.hasAttribute('collapsed')).to.be.false;
      await checkA11y(el);
    });

    it('updates aria-expanded on toggle', async () => {
      const el = await fixture(html`<dvfy-sidebar collapsible></dvfy-sidebar>`);
      const toggle = el.querySelector('.dvfy-sidebar__toggle');
      // Initially not collapsed, so aria-expanded="true"
      expect(toggle.getAttribute('aria-expanded')).to.equal('true');
      toggle.click();
      // After collapsing: collapsed was false, sets collapsed attr, aria-expanded = String(false)
      expect(toggle.getAttribute('aria-expanded')).to.equal('false');
      toggle.click();
      // After expanding: collapsed was true, removes collapsed attr, aria-expanded = String(true)
      expect(toggle.getAttribute('aria-expanded')).to.equal('true');
      await checkA11y(el);
    });
  });

  describe('ARIA', () => {
    it('sets role=navigation', async () => {
      const el = await fixture(html`<dvfy-sidebar></dvfy-sidebar>`);
      expect(el.getAttribute('role')).to.equal('navigation');
      await checkA11y(el);
    });

    it('sets default aria-label', async () => {
      const el = await fixture(html`<dvfy-sidebar></dvfy-sidebar>`);
      expect(el.getAttribute('aria-label')).to.equal('Sidebar');
      await checkA11y(el);
    });

    it('preserves custom aria-label', async () => {
      const el = await fixture(html`<dvfy-sidebar aria-label="Admin navigation"></dvfy-sidebar>`);
      expect(el.getAttribute('aria-label')).to.equal('Admin navigation');
      await checkA11y(el);
    });
  });

  describe('edge cases', () => {
    it('renders empty sidebar without errors', async () => {
      const el = await fixture(html`<dvfy-sidebar></dvfy-sidebar>`);
      expect(el).to.exist;
      expect(el.getAttribute('role')).to.equal('navigation');
      await checkA11y(el);
    });

    it('starts collapsed when collapsed attribute is set', async () => {
      const el = await fixture(html`<dvfy-sidebar collapsed></dvfy-sidebar>`);
      expect(el.hasAttribute('collapsed')).to.be.true;
      await checkA11y(el);
    });
  });
});

describe('dvfy-sidebar-section', () => {
  describe('rendering', () => {
    it('renders section label', async () => {
      const el = await fixture(html`
        <dvfy-sidebar>
          <dvfy-sidebar-section label="Settings">
            <a href="/config">Config</a>
          </dvfy-sidebar-section>
        </dvfy-sidebar>
      `);
      const section = el.querySelector('dvfy-sidebar-section');
      const label = section.querySelector('.dvfy-sidebar__section-label');
      expect(label).to.exist;
      expect(label.textContent).to.equal('Settings');
      await checkA11y(el);
    });

    it('does not render label element when label attribute is missing', async () => {
      const el = await fixture(html`
        <dvfy-sidebar>
          <dvfy-sidebar-section>
            <a href="/config">Config</a>
          </dvfy-sidebar-section>
        </dvfy-sidebar>
      `);
      const section = el.querySelector('dvfy-sidebar-section');
      const label = section.querySelector('.dvfy-sidebar__section-label');
      expect(label).to.not.exist;
      await checkA11y(el);
    });

    it('updates label text when attribute changes', async () => {
      const el = await fixture(html`
        <dvfy-sidebar>
          <dvfy-sidebar-section label="Old">
            <a href="/config">Config</a>
          </dvfy-sidebar-section>
        </dvfy-sidebar>
      `);
      const section = el.querySelector('dvfy-sidebar-section');
      section.setAttribute('label', 'New');
      const label = section.querySelector('.dvfy-sidebar__section-label');
      expect(label.textContent).to.equal('New');
      await checkA11y(el);
    });
  });
});
