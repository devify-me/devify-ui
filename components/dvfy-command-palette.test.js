import { fixture, html, expect, oneEvent, waitUntil } from '@open-wc/testing';
import './dvfy-command-palette.js';

describe('dvfy-command-palette', () => {
  describe('rendering', () => {
    it('renders hidden by default', async () => {
      const el = await fixture(html`
        <dvfy-command-palette>
          <dvfy-cmd-group label="Nav">
            <dvfy-cmd-item value="home">Home</dvfy-cmd-item>
          </dvfy-cmd-group>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      expect(el.hasAttribute('open')).to.be.false;
      expect(getComputedStyle(el).display).to.equal('none');
    });

    it('sets role and aria attributes', async () => {
      const el = await fixture(html`
        <dvfy-command-palette>
          <dvfy-cmd-item value="a">Item</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      expect(el.getAttribute('role')).to.equal('dialog');
      expect(el.getAttribute('aria-modal')).to.equal('true');
    });

    it('renders search input', async () => {
      const el = await fixture(html`
        <dvfy-command-palette>
          <dvfy-cmd-item value="a">Item</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      expect(el.querySelector('.dvfy-cmd__input')).to.exist;
    });

    it('renders footer with navigation hints', async () => {
      const el = await fixture(html`
        <dvfy-command-palette>
          <dvfy-cmd-item value="a">Item</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      expect(el.querySelector('.dvfy-cmd__footer')).to.exist;
    });

    it('uses custom placeholder', async () => {
      const el = await fixture(html`
        <dvfy-command-palette placeholder="Find stuff...">
          <dvfy-cmd-item value="a">Item</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      const input = el.querySelector('.dvfy-cmd__input');
      expect(input.placeholder).to.equal('Find stuff...');
    });
  });

  describe('groups and items', () => {
    it('renders group labels', async () => {
      const el = await fixture(html`
        <dvfy-command-palette>
          <dvfy-cmd-group label="Navigation">
            <dvfy-cmd-item value="home">Home</dvfy-cmd-item>
          </dvfy-cmd-group>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      const groupLabel = el.querySelector('.dvfy-cmd-group__label');
      expect(groupLabel).to.exist;
      expect(groupLabel.textContent).to.equal('Navigation');
    });

    it('renders item text', async () => {
      const el = await fixture(html`
        <dvfy-command-palette>
          <dvfy-cmd-item value="home">Go Home</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      const textEl = el.querySelector('.dvfy-cmd-item__text');
      expect(textEl).to.exist;
      expect(textEl.textContent).to.equal('Go Home');
    });

    it('renders item icon', async () => {
      const el = await fixture(html`
        <dvfy-command-palette>
          <dvfy-cmd-item value="home" icon="H">Home</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      const iconEl = el.querySelector('.dvfy-cmd-item__icon');
      expect(iconEl).to.exist;
      expect(iconEl.textContent).to.equal('H');
    });

    it('renders item hint', async () => {
      const el = await fixture(html`
        <dvfy-command-palette>
          <dvfy-cmd-item value="save" hint="Ctrl+S">Save</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      const hintEl = el.querySelector('.dvfy-cmd-item__hint');
      expect(hintEl).to.exist;
      expect(hintEl.textContent).to.equal('Ctrl+S');
    });

    it('sets role=option on items', async () => {
      const el = await fixture(html`
        <dvfy-command-palette>
          <dvfy-cmd-item value="a">A</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      const item = el.querySelector('dvfy-cmd-item');
      expect(item.getAttribute('role')).to.equal('option');
    });

    it('sets role=group on groups', async () => {
      const el = await fixture(html`
        <dvfy-command-palette>
          <dvfy-cmd-group label="Test">
            <dvfy-cmd-item value="a">A</dvfy-cmd-item>
          </dvfy-cmd-group>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      const group = el.querySelector('dvfy-cmd-group');
      expect(group.getAttribute('role')).to.equal('group');
    });
  });

  describe('open/close', () => {
    it('opens when open attribute is set', async () => {
      const el = await fixture(html`
        <dvfy-command-palette>
          <dvfy-cmd-item value="a">A</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      el.setAttribute('open', '');
      expect(el.hasAttribute('open')).to.be.true;
    });

    it('fires dvfy-cmd-open event', async () => {
      const el = await fixture(html`
        <dvfy-command-palette>
          <dvfy-cmd-item value="a">A</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      setTimeout(() => el.setAttribute('open', ''));
      const ev = await oneEvent(el, 'dvfy-cmd-open');
      expect(ev).to.exist;
    });

    it('fires dvfy-cmd-close event', async () => {
      const el = await fixture(html`
        <dvfy-command-palette open>
          <dvfy-cmd-item value="a">A</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      setTimeout(() => el.removeAttribute('open'));
      const ev = await oneEvent(el, 'dvfy-cmd-close');
      expect(ev).to.exist;
    });

    it('closes on backdrop click', async () => {
      const el = await fixture(html`
        <dvfy-command-palette open>
          <dvfy-cmd-item value="a">A</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      const backdrop = el.querySelector('.dvfy-cmd__backdrop');
      backdrop.click();
      expect(el.hasAttribute('open')).to.be.false;
    });

    it('closes on Escape key', async () => {
      const el = await fixture(html`
        <dvfy-command-palette open>
          <dvfy-cmd-item value="a">A</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      const input = el.querySelector('.dvfy-cmd__input');
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(el.hasAttribute('open')).to.be.false;
    });
  });

  describe('filtering', () => {
    it('filters items by search query', async () => {
      const el = await fixture(html`
        <dvfy-command-palette open>
          <dvfy-cmd-item value="home">Home</dvfy-cmd-item>
          <dvfy-cmd-item value="settings">Settings</dvfy-cmd-item>
          <dvfy-cmd-item value="help">Help</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      const input = el.querySelector('.dvfy-cmd__input');
      input.value = 'hom';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      const visible = el.querySelectorAll('dvfy-cmd-item:not([hidden])');
      expect(visible.length).to.equal(1);
      expect(visible[0].getAttribute('value')).to.equal('home');
    });

    it('shows empty message when no results', async () => {
      const el = await fixture(html`
        <dvfy-command-palette open>
          <dvfy-cmd-item value="home">Home</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      const input = el.querySelector('.dvfy-cmd__input');
      input.value = 'zzz';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      expect(el.querySelector('.dvfy-cmd__empty')).to.exist;
    });

    it('hides empty groups', async () => {
      const el = await fixture(html`
        <dvfy-command-palette open>
          <dvfy-cmd-group label="Nav">
            <dvfy-cmd-item value="home">Home</dvfy-cmd-item>
          </dvfy-cmd-group>
          <dvfy-cmd-group label="Actions">
            <dvfy-cmd-item value="save">Save</dvfy-cmd-item>
          </dvfy-cmd-group>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      const input = el.querySelector('.dvfy-cmd__input');
      input.value = 'save';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      const groups = el.querySelectorAll('dvfy-cmd-group');
      expect(groups[0].hasAttribute('hidden')).to.be.true;
      expect(groups[1].hasAttribute('hidden')).to.be.false;
    });
  });

  describe('keyboard navigation', () => {
    it('navigates items with ArrowDown', async () => {
      const el = await fixture(html`
        <dvfy-command-palette open>
          <dvfy-cmd-item value="a">A</dvfy-cmd-item>
          <dvfy-cmd-item value="b">B</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      const input = el.querySelector('.dvfy-cmd__input');
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await waitUntil(() => el.querySelector('dvfy-cmd-item[data-active]'));
      const active = el.querySelector('dvfy-cmd-item[data-active]');
      expect(active).to.exist;
    });

    it('navigates items with ArrowUp', async () => {
      const el = await fixture(html`
        <dvfy-command-palette open>
          <dvfy-cmd-item value="a">A</dvfy-cmd-item>
          <dvfy-cmd-item value="b">B</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      const input = el.querySelector('.dvfy-cmd__input');
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      const active = el.querySelector('dvfy-cmd-item[data-active]');
      expect(active).to.exist;
      expect(active.getAttribute('value')).to.equal('a');
    });

    it('wraps around on ArrowDown past last', async () => {
      const el = await fixture(html`
        <dvfy-command-palette open>
          <dvfy-cmd-item value="a">A</dvfy-cmd-item>
          <dvfy-cmd-item value="b">B</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      const input = el.querySelector('.dvfy-cmd__input');
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      const active = el.querySelector('dvfy-cmd-item[data-active]');
      expect(active.getAttribute('value')).to.equal('a');
    });

    it('selects active item on Enter', async () => {
      const el = await fixture(html`
        <dvfy-command-palette open>
          <dvfy-cmd-item value="home">Home</dvfy-cmd-item>
          <dvfy-cmd-item value="settings">Settings</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      const input = el.querySelector('.dvfy-cmd__input');
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      setTimeout(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
      const ev = await oneEvent(el, 'dvfy-cmd-select');
      expect(ev.detail.value).to.equal('home');
    });
  });

  describe('selection', () => {
    it('fires dvfy-cmd-select on item click', async () => {
      const el = await fixture(html`
        <dvfy-command-palette open>
          <dvfy-cmd-item value="settings">Settings</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      const item = el.querySelector('dvfy-cmd-item');
      setTimeout(() => item.click());
      const ev = await oneEvent(el, 'dvfy-cmd-select');
      expect(ev.detail.value).to.equal('settings');
      expect(ev.detail.label).to.equal('Settings');
    });

    it('closes palette after selection', async () => {
      const el = await fixture(html`
        <dvfy-command-palette open>
          <dvfy-cmd-item value="a">A</dvfy-cmd-item>
        </dvfy-command-palette>
      `);
      await new Promise(r => setTimeout(r, 0));
      el.querySelector('dvfy-cmd-item').click();
      expect(el.hasAttribute('open')).to.be.false;
    });
  });
});
