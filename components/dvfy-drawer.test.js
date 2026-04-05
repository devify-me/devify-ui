import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-drawer.js';

// dvfy-drawer inserts a sibling reopen button before itself in the parent,
// so fixture() returns the wrong element if we create the drawer directly.
// Always wrap in a container and query for the drawer.

async function createDrawer(attrs = '', content = 'Content') {
  const container = await fixture(html`<div style="position:relative"><dvfy-drawer>${content}</dvfy-drawer></div>`);
  return container.querySelector('dvfy-drawer');
}

async function createDrawerHTML(template) {
  const container = await fixture(template);
  return container.querySelector('dvfy-drawer');
}

describe('dvfy-drawer', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await createDrawer();
      const body = el.querySelector('.dvfy-drawer__body');
      expect(body).to.exist;
    });

    it('renders header with default title', async () => {
      const el = await createDrawer();
      const title = el.querySelector('.dvfy-drawer__title');
      expect(title).to.exist;
      expect(title.textContent).to.equal('Panel');
    });

    it('renders header with custom title', async () => {
      const el = await createDrawerHTML(html`<div><dvfy-drawer header="Sidebar">Content</dvfy-drawer></div>`);
      const title = el.querySelector('.dvfy-drawer__title');
      expect(title.textContent).to.equal('Sidebar');
    });

    it('renders collapse toggle button', async () => {
      const el = await createDrawer();
      const toggle = el.querySelector('.dvfy-drawer__toggle');
      expect(toggle).to.exist;
      expect(toggle.getAttribute('aria-label')).to.equal('Collapse panel');
    });

    it('hides header when no-header is set', async () => {
      const el = await createDrawerHTML(html`<div><dvfy-drawer no-header>Content</dvfy-drawer></div>`);
      const header = el.querySelector('.dvfy-drawer__header');
      expect(header).to.not.exist;
    });

    it('wraps content in scrollable body', async () => {
      const container = await fixture(html`<div><dvfy-drawer><p>Hello</p></dvfy-drawer></div>`);
      const el = container.querySelector('dvfy-drawer');
      const body = el.querySelector('.dvfy-drawer__body');
      expect(body).to.exist;
      expect(body.querySelector('p').textContent).to.equal('Hello');
    });
  });

  describe('attributes', () => {
    it('applies width style from width attribute', async () => {
      const el = await createDrawerHTML(html`<div><dvfy-drawer width="300px">Content</dvfy-drawer></div>`);
      expect(el.style.width).to.equal('300px');
    });

    it('applies max-height for top position', async () => {
      const el = await createDrawerHTML(html`<div><dvfy-drawer position="top" width="200px">Content</dvfy-drawer></div>`);
      expect(el.style.maxHeight).to.equal('200px');
    });

    it('applies max-height for bottom position', async () => {
      const el = await createDrawerHTML(html`<div><dvfy-drawer position="bottom">Content</dvfy-drawer></div>`);
      expect(el.style.maxHeight).to.not.be.empty;
    });

    it('accepts position attribute', async () => {
      const el = await createDrawerHTML(html`<div><dvfy-drawer position="left">Content</dvfy-drawer></div>`);
      expect(el.getAttribute('position')).to.equal('left');
    });
  });

  describe('collapse behavior', () => {
    it('starts expanded by default', async () => {
      const el = await createDrawer();
      expect(el.hasAttribute('collapsed')).to.be.false;
    });

    it('starts collapsed when collapsed attribute is set', async () => {
      const el = await createDrawerHTML(html`<div><dvfy-drawer collapsed>Content</dvfy-drawer></div>`);
      expect(el.hasAttribute('collapsed')).to.be.true;
    });

    it('collapses when toggle button is clicked', async () => {
      const el = await createDrawer();
      const toggle = el.querySelector('.dvfy-drawer__toggle');
      setTimeout(() => toggle.click());
      const event = await oneEvent(el, 'toggle');
      expect(event.detail.collapsed).to.be.true;
      expect(el.hasAttribute('collapsed')).to.be.true;
    });

    it('exposes collapsed property', async () => {
      const el = await createDrawer();
      expect(el.collapsed).to.be.false;
      el.collapsed = true;
      expect(el.hasAttribute('collapsed')).to.be.true;
      el.collapsed = false;
      expect(el.hasAttribute('collapsed')).to.be.false;
    });

    it('hides toggle when fixed attribute is set', async () => {
      const el = await createDrawerHTML(html`<div><dvfy-drawer fixed>Content</dvfy-drawer></div>`);
      const toggle = el.querySelector('.dvfy-drawer__toggle');
      expect(toggle).to.not.exist;
    });
  });

  describe('events', () => {
    it('fires toggle event on collapse', async () => {
      const el = await createDrawer();
      setTimeout(() => el.setAttribute('collapsed', ''));
      const event = await oneEvent(el, 'toggle');
      expect(event.detail.collapsed).to.be.true;
    });

    it('fires toggle event on expand', async () => {
      const el = await createDrawerHTML(html`<div><dvfy-drawer collapsed>Content</dvfy-drawer></div>`);
      setTimeout(() => el.removeAttribute('collapsed'));
      const event = await oneEvent(el, 'toggle');
      expect(event.detail.collapsed).to.be.false;
    });
  });

  describe('keyboard', () => {
    it('collapses on Escape key', async () => {
      const el = await createDrawer();
      setTimeout(() => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
      const event = await oneEvent(el, 'toggle');
      expect(event.detail.collapsed).to.be.true;
    });

    it('does not collapse on Escape when fixed', async () => {
      const el = await createDrawerHTML(html`<div><dvfy-drawer fixed>Content</dvfy-drawer></div>`);
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(el.hasAttribute('collapsed')).to.be.false;
    });
  });

  describe('reopen tab', () => {
    it('creates a reopen button as sibling', async () => {
      const container = await fixture(html`<div style="position:relative"><dvfy-drawer>Content</dvfy-drawer></div>`);
      const reopen = container.querySelector('.dvfy-drawer__reopen');
      expect(reopen).to.exist;
      expect(reopen.getAttribute('data-position')).to.equal('right');
    });

    it('shows reopen tab when collapsed', async () => {
      const container = await fixture(html`<div style="position:relative"><dvfy-drawer collapsed>Content</dvfy-drawer></div>`);
      const reopen = container.querySelector('.dvfy-drawer__reopen');
      expect(reopen).to.exist;
      expect(reopen.hasAttribute('data-visible')).to.be.true;
    });

    it('does not create reopen when fixed', async () => {
      const container = await fixture(html`<div><dvfy-drawer fixed>Content</dvfy-drawer></div>`);
      const reopen = container.querySelector('.dvfy-drawer__reopen');
      expect(reopen).to.not.exist;
    });
  });
});
