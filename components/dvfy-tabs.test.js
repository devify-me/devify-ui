import { fixture, html, expect } from '@open-wc/testing';
import { checkA11y } from '../utils/axe-test.js';
import './dvfy-tabs.js';

describe('dvfy-tabs', () => {
  describe('rendering', () => {
    it('renders tab list and panels', async () => {
      const el = await fixture(html`
        <dvfy-tabs>
          <dvfy-tab label="One">Content 1</dvfy-tab>
          <dvfy-tab label="Two">Content 2</dvfy-tab>
        </dvfy-tabs>
      `);
      const list = el.querySelector('.dvfy-tabs__list');
      expect(list).to.exist;
      expect(list.getAttribute('role')).to.equal('tablist');
      const triggers = list.querySelectorAll('.dvfy-tabs__trigger');
      expect(triggers.length).to.equal(2);
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });

    it('renders trigger text from tab label attribute', async () => {
      const el = await fixture(html`
        <dvfy-tabs>
          <dvfy-tab label="General">Content</dvfy-tab>
          <dvfy-tab label="Settings">Settings</dvfy-tab>
        </dvfy-tabs>
      `);
      const triggers = el.querySelectorAll('.dvfy-tabs__trigger');
      expect(triggers[0].textContent).to.equal('General');
      expect(triggers[1].textContent).to.equal('Settings');
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });

    it('uses fallback label when label attribute is missing', async () => {
      const el = await fixture(html`
        <dvfy-tabs>
          <dvfy-tab>Content</dvfy-tab>
        </dvfy-tabs>
      `);
      const trigger = el.querySelector('.dvfy-tabs__trigger');
      expect(trigger.textContent).to.equal('Tab 1');
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });
  });

  describe('attributes', () => {
    it('defaults to first tab active', async () => {
      const el = await fixture(html`
        <dvfy-tabs>
          <dvfy-tab label="One">Content 1</dvfy-tab>
          <dvfy-tab label="Two">Content 2</dvfy-tab>
        </dvfy-tabs>
      `);
      const tabs = el.querySelectorAll('dvfy-tab');
      expect(tabs[0].hasAttribute('active')).to.be.true;
      expect(tabs[1].hasAttribute('active')).to.be.false;
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });

    it('activates tab specified by active attribute', async () => {
      const el = await fixture(html`
        <dvfy-tabs active="1">
          <dvfy-tab label="One">Content 1</dvfy-tab>
          <dvfy-tab label="Two">Content 2</dvfy-tab>
        </dvfy-tabs>
      `);
      const tabs = el.querySelectorAll('dvfy-tab');
      expect(tabs[0].hasAttribute('active')).to.be.false;
      expect(tabs[1].hasAttribute('active')).to.be.true;
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });

    it('changes active tab when active attribute updates', async () => {
      const el = await fixture(html`
        <dvfy-tabs active="0">
          <dvfy-tab label="One">Content 1</dvfy-tab>
          <dvfy-tab label="Two">Content 2</dvfy-tab>
        </dvfy-tabs>
      `);
      el.setAttribute('active', '1');
      const tabs = el.querySelectorAll('dvfy-tab');
      expect(tabs[0].hasAttribute('active')).to.be.false;
      expect(tabs[1].hasAttribute('active')).to.be.true;
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });
  });

  describe('tab switching', () => {
    it('switches active tab on trigger click', async () => {
      const el = await fixture(html`
        <dvfy-tabs>
          <dvfy-tab label="One">Content 1</dvfy-tab>
          <dvfy-tab label="Two">Content 2</dvfy-tab>
        </dvfy-tabs>
      `);
      const triggers = el.querySelectorAll('.dvfy-tabs__trigger');
      triggers[1].click();
      const tabs = el.querySelectorAll('dvfy-tab');
      expect(tabs[0].hasAttribute('active')).to.be.false;
      expect(tabs[1].hasAttribute('active')).to.be.true;
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });

    it('updates aria-selected on triggers', async () => {
      const el = await fixture(html`
        <dvfy-tabs>
          <dvfy-tab label="One">Content 1</dvfy-tab>
          <dvfy-tab label="Two">Content 2</dvfy-tab>
        </dvfy-tabs>
      `);
      const triggers = el.querySelectorAll('.dvfy-tabs__trigger');
      expect(triggers[0].getAttribute('aria-selected')).to.equal('true');
      expect(triggers[1].getAttribute('aria-selected')).to.equal('false');

      triggers[1].click();
      expect(triggers[0].getAttribute('aria-selected')).to.equal('false');
      expect(triggers[1].getAttribute('aria-selected')).to.equal('true');
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });

    it('updates tabindex on triggers', async () => {
      const el = await fixture(html`
        <dvfy-tabs>
          <dvfy-tab label="One">Content 1</dvfy-tab>
          <dvfy-tab label="Two">Content 2</dvfy-tab>
        </dvfy-tabs>
      `);
      const triggers = el.querySelectorAll('.dvfy-tabs__trigger');
      expect(triggers[0].getAttribute('tabindex')).to.equal('0');
      expect(triggers[1].getAttribute('tabindex')).to.equal('-1');

      triggers[1].click();
      expect(triggers[0].getAttribute('tabindex')).to.equal('-1');
      expect(triggers[1].getAttribute('tabindex')).to.equal('0');
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });
  });

  describe('keyboard interaction', () => {
    it('moves to next tab on ArrowRight', async () => {
      const el = await fixture(html`
        <dvfy-tabs>
          <dvfy-tab label="One">Content 1</dvfy-tab>
          <dvfy-tab label="Two">Content 2</dvfy-tab>
          <dvfy-tab label="Three">Content 3</dvfy-tab>
        </dvfy-tabs>
      `);
      const triggers = el.querySelectorAll('.dvfy-tabs__trigger');
      const list = el.querySelector('.dvfy-tabs__list');
      triggers[0].focus();
      list.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      expect(el.getAttribute('active')).to.equal('1');
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });

    it('moves to previous tab on ArrowLeft', async () => {
      const el = await fixture(html`
        <dvfy-tabs active="2">
          <dvfy-tab label="One">Content 1</dvfy-tab>
          <dvfy-tab label="Two">Content 2</dvfy-tab>
          <dvfy-tab label="Three">Content 3</dvfy-tab>
        </dvfy-tabs>
      `);
      const triggers = el.querySelectorAll('.dvfy-tabs__trigger');
      const list = el.querySelector('.dvfy-tabs__list');
      triggers[2].focus();
      list.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      expect(el.getAttribute('active')).to.equal('1');
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });

    it('wraps around on ArrowRight from last tab', async () => {
      const el = await fixture(html`
        <dvfy-tabs active="2">
          <dvfy-tab label="One">Content 1</dvfy-tab>
          <dvfy-tab label="Two">Content 2</dvfy-tab>
          <dvfy-tab label="Three">Content 3</dvfy-tab>
        </dvfy-tabs>
      `);
      const triggers = el.querySelectorAll('.dvfy-tabs__trigger');
      const list = el.querySelector('.dvfy-tabs__list');
      triggers[2].focus();
      list.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      expect(el.getAttribute('active')).to.equal('0');
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });

    it('wraps around on ArrowLeft from first tab', async () => {
      const el = await fixture(html`
        <dvfy-tabs active="0">
          <dvfy-tab label="One">Content 1</dvfy-tab>
          <dvfy-tab label="Two">Content 2</dvfy-tab>
          <dvfy-tab label="Three">Content 3</dvfy-tab>
        </dvfy-tabs>
      `);
      const triggers = el.querySelectorAll('.dvfy-tabs__trigger');
      const list = el.querySelector('.dvfy-tabs__list');
      triggers[0].focus();
      list.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      expect(el.getAttribute('active')).to.equal('2');
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });

    it('jumps to first tab on Home', async () => {
      const el = await fixture(html`
        <dvfy-tabs active="2">
          <dvfy-tab label="One">Content 1</dvfy-tab>
          <dvfy-tab label="Two">Content 2</dvfy-tab>
          <dvfy-tab label="Three">Content 3</dvfy-tab>
        </dvfy-tabs>
      `);
      const triggers = el.querySelectorAll('.dvfy-tabs__trigger');
      const list = el.querySelector('.dvfy-tabs__list');
      triggers[2].focus();
      list.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      expect(el.getAttribute('active')).to.equal('0');
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });

    it('jumps to last tab on End', async () => {
      const el = await fixture(html`
        <dvfy-tabs active="0">
          <dvfy-tab label="One">Content 1</dvfy-tab>
          <dvfy-tab label="Two">Content 2</dvfy-tab>
          <dvfy-tab label="Three">Content 3</dvfy-tab>
        </dvfy-tabs>
      `);
      const triggers = el.querySelectorAll('.dvfy-tabs__trigger');
      const list = el.querySelector('.dvfy-tabs__list');
      triggers[0].focus();
      list.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      expect(el.getAttribute('active')).to.equal('2');
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });
  });

  describe('ARIA', () => {
    it('sets role=tablist on list', async () => {
      const el = await fixture(html`
        <dvfy-tabs>
          <dvfy-tab label="One">Content</dvfy-tab>
        </dvfy-tabs>
      `);
      const list = el.querySelector('.dvfy-tabs__list');
      expect(list.getAttribute('role')).to.equal('tablist');
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });

    it('sets role=tab on triggers', async () => {
      const el = await fixture(html`
        <dvfy-tabs>
          <dvfy-tab label="One">Content</dvfy-tab>
        </dvfy-tabs>
      `);
      const trigger = el.querySelector('.dvfy-tabs__trigger');
      expect(trigger.getAttribute('role')).to.equal('tab');
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });

    it('sets role=tabpanel on dvfy-tab elements', async () => {
      const el = await fixture(html`
        <dvfy-tabs>
          <dvfy-tab label="One">Content</dvfy-tab>
        </dvfy-tabs>
      `);
      const tab = el.querySelector('dvfy-tab');
      expect(tab.getAttribute('role')).to.equal('tabpanel');
      await checkA11y(el, { ignoredRules: ['color-contrast'] });
    });
  });
});
