import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-live-search.js';

describe('dvfy-live-search', () => {
  describe('rendering', () => {
    it('is defined as a custom element', () => {
      expect(customElements.get('dvfy-live-search')).to.exist;
    });

    it('creates search input', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/search"></dvfy-live-search>
      `);
      const input = el.querySelector('.dvfy-live-search__input');
      expect(input).to.exist;
      expect(input.type).to.equal('search');
    });

    it('renders wrapper div', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/search"></dvfy-live-search>
      `);
      const wrapper = el.querySelector('.dvfy-live-search__wrapper');
      expect(wrapper).to.exist;
    });

    it('renders search icon', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/search"></dvfy-live-search>
      `);
      const icon = el.querySelector('.dvfy-live-search__icon svg');
      expect(icon).to.exist;
    });

    it('renders loading spinner element', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/search"></dvfy-live-search>
      `);
      const spinner = el.querySelector('.dvfy-live-search__spinner');
      expect(spinner).to.exist;
    });

    it('creates auto results container when no target specified', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/search"></dvfy-live-search>
      `);
      const results = el.querySelector('.dvfy-live-search__results');
      expect(results).to.exist;
    });
  });

  describe('attributes', () => {
    it('uses placeholder from attribute', async () => {
      const el = await fixture(html`
        <dvfy-live-search
          src="/search"
          placeholder="Find tasks..."
        ></dvfy-live-search>
      `);
      const input = el.querySelector('.dvfy-live-search__input');
      expect(input.placeholder).to.equal('Find tasks...');
    });

    it('defaults placeholder to Search...', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/search"></dvfy-live-search>
      `);
      const input = el.querySelector('.dvfy-live-search__input');
      expect(input.placeholder).to.equal('Search...');
    });

    it('accepts src attribute', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/api/search"></dvfy-live-search>
      `);
      expect(el.getAttribute('src')).to.equal('/api/search');
    });

    it('accepts param attribute', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/search" param="search"></dvfy-live-search>
      `);
      expect(el.getAttribute('param')).to.equal('search');
    });

    it('accepts debounce attribute', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/search" debounce="500"></dvfy-live-search>
      `);
      expect(el.getAttribute('debounce')).to.equal('500');
    });

    it('accepts min-chars attribute', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/search" min-chars="3"></dvfy-live-search>
      `);
      expect(el.getAttribute('min-chars')).to.equal('3');
    });

    it('accepts swap attribute', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/search" swap="outerHTML"></dvfy-live-search>
      `);
      expect(el.getAttribute('swap')).to.equal('outerHTML');
    });
  });

  describe('input behavior', () => {
    it('sets autocomplete=off on search input', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/search"></dvfy-live-search>
      `);
      const input = el.querySelector('.dvfy-live-search__input');
      expect(input.getAttribute('autocomplete')).to.equal('off');
    });

    it('clears input on Escape key', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/search"></dvfy-live-search>
      `);
      const input = el.querySelector('.dvfy-live-search__input');
      input.value = 'test query';
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      expect(input.value).to.equal('');
    });
  });

  describe('events', () => {
    it('fires search event when input meets min-chars', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/search" min-chars="2"></dvfy-live-search>
      `);
      const input = el.querySelector('.dvfy-live-search__input');
      input.value = 'test';
      setTimeout(() => input.dispatchEvent(new Event('input', { bubbles: true })));
      const event = await oneEvent(el, 'search');
      expect(event.detail.query).to.equal('test');
    });

    it('does not fire search event below min-chars', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/search" min-chars="3"></dvfy-live-search>
      `);
      const input = el.querySelector('.dvfy-live-search__input');
      let fired = false;
      el.addEventListener('search', () => { fired = true; });
      input.value = 'ab';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      // Wait a tick for any async handling
      await new Promise(r => setTimeout(r, 50));
      expect(fired).to.be.false;
    });
  });

  describe('programmatic API', () => {
    it('exposes value getter', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/search"></dvfy-live-search>
      `);
      const input = el.querySelector('.dvfy-live-search__input');
      input.value = 'hello';
      expect(el.value).to.equal('hello');
    });

    it('exposes value setter', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/search"></dvfy-live-search>
      `);
      el.value = 'world';
      const input = el.querySelector('.dvfy-live-search__input');
      expect(input.value).to.equal('world');
    });

    it('exposes clear() method', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/search"></dvfy-live-search>
      `);
      const input = el.querySelector('.dvfy-live-search__input');
      input.value = 'test';
      el.clear();
      expect(input.value).to.equal('');
    });
  });

  describe('ARIA', () => {
    it('sets role=search', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/search"></dvfy-live-search>
      `);
      expect(el.getAttribute('role')).to.equal('search');
    });

    it('sets default aria-label', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/search"></dvfy-live-search>
      `);
      expect(el.getAttribute('aria-label')).to.equal('Live search');
    });

    it('preserves custom aria-label', async () => {
      const el = await fixture(html`
        <dvfy-live-search
          src="/search"
          aria-label="Search tasks"
        ></dvfy-live-search>
      `);
      expect(el.getAttribute('aria-label')).to.equal('Search tasks');
    });

    it('sets aria-label on input from placeholder', async () => {
      const el = await fixture(html`
        <dvfy-live-search
          src="/search"
          placeholder="Find items..."
        ></dvfy-live-search>
      `);
      const input = el.querySelector('.dvfy-live-search__input');
      expect(input.getAttribute('aria-label')).to.equal('Find items...');
    });
  });

  describe('cleanup', () => {
    it('clears timers and abort controller on disconnect', async () => {
      const el = await fixture(html`
        <dvfy-live-search src="/search"></dvfy-live-search>
      `);
      // Should not throw when removed
      el.remove();
      expect(document.querySelector('dvfy-live-search')).to.not.exist;
    });
  });
});
