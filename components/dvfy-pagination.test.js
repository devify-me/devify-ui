import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-pagination.js';

describe('dvfy-pagination', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`<dvfy-pagination total="10"></dvfy-pagination>`);
      expect(el.getAttribute('role')).to.equal('navigation');
      expect(el.getAttribute('aria-label')).to.equal('Pagination');
    });

    it('renders prev and next buttons', async () => {
      const el = await fixture(html`<dvfy-pagination total="10"></dvfy-pagination>`);
      const btns = el.querySelectorAll('.dvfy-pagination__btn');
      // First is prev, last is next
      expect(btns[0].getAttribute('aria-label')).to.equal('Previous page');
      expect(btns[btns.length - 1].getAttribute('aria-label')).to.equal('Next page');
    });

    it('renders page buttons between prev and next', async () => {
      const el = await fixture(html`<dvfy-pagination total="5" current="1"></dvfy-pagination>`);
      const btns = el.querySelectorAll('.dvfy-pagination__btn');
      // prev + 5 pages + next = 7
      expect(btns.length).to.equal(7);
    });

    it('marks current page with aria-current', async () => {
      const el = await fixture(html`<dvfy-pagination total="5" current="3"></dvfy-pagination>`);
      const current = el.querySelector('[aria-current="page"]');
      expect(current).to.exist;
      expect(current.textContent).to.equal('3');
    });

    it('renders ellipsis for large page counts', async () => {
      const el = await fixture(html`<dvfy-pagination total="20" current="10" max-visible="5"></dvfy-pagination>`);
      const ellipses = el.querySelectorAll('.dvfy-pagination__ellipsis');
      expect(ellipses.length).to.be.greaterThan(0);
    });
  });

  describe('attributes', () => {
    it('defaults current to 1', async () => {
      const el = await fixture(html`<dvfy-pagination total="10"></dvfy-pagination>`);
      const current = el.querySelector('[aria-current="page"]');
      expect(current.textContent).to.equal('1');
    });

    it('defaults total to 1 when not set', async () => {
      const el = await fixture(html`<dvfy-pagination></dvfy-pagination>`);
      const btns = el.querySelectorAll('.dvfy-pagination__btn');
      // prev + 1 page + next = 3
      expect(btns.length).to.equal(3);
    });

    it('clamps current to total', async () => {
      const el = await fixture(html`<dvfy-pagination total="5" current="10"></dvfy-pagination>`);
      const current = el.querySelector('[aria-current="page"]');
      expect(current.textContent).to.equal('5');
    });

    it('re-renders when total changes', async () => {
      const el = await fixture(html`<dvfy-pagination total="3" current="1"></dvfy-pagination>`);
      el.setAttribute('total', '5');
      const btns = el.querySelectorAll('.dvfy-pagination__btn');
      // prev + 5 pages + next = 7
      expect(btns.length).to.equal(7);
    });

    it('re-renders when current changes', async () => {
      const el = await fixture(html`<dvfy-pagination total="5" current="1"></dvfy-pagination>`);
      el.setAttribute('current', '3');
      const current = el.querySelector('[aria-current="page"]');
      expect(current.textContent).to.equal('3');
    });

    it('respects max-visible attribute', async () => {
      const el = await fixture(html`<dvfy-pagination total="20" current="1" max-visible="3"></dvfy-pagination>`);
      // Should show fewer page buttons (plus ellipsis)
      const pageButtons = el.querySelectorAll('.dvfy-pagination__btn:not([aria-label])');
      expect(pageButtons.length).to.be.at.most(5);
    });
  });

  describe('disabled buttons', () => {
    it('disables prev button on first page', async () => {
      const el = await fixture(html`<dvfy-pagination total="5" current="1"></dvfy-pagination>`);
      const prev = el.querySelector('[aria-label="Previous page"]');
      expect(prev.disabled).to.be.true;
    });

    it('disables next button on last page', async () => {
      const el = await fixture(html`<dvfy-pagination total="5" current="5"></dvfy-pagination>`);
      const next = el.querySelector('[aria-label="Next page"]');
      expect(next.disabled).to.be.true;
    });

    it('enables both buttons on middle page', async () => {
      const el = await fixture(html`<dvfy-pagination total="5" current="3"></dvfy-pagination>`);
      const prev = el.querySelector('[aria-label="Previous page"]');
      const next = el.querySelector('[aria-label="Next page"]');
      expect(prev.disabled).to.be.false;
      expect(next.disabled).to.be.false;
    });
  });

  describe('events', () => {
    it('fires page-change on page button click', async () => {
      const el = await fixture(html`<dvfy-pagination total="5" current="1"></dvfy-pagination>`);
      const page2Btn = [...el.querySelectorAll('.dvfy-pagination__btn')].find(b => b.textContent === '2');
      setTimeout(() => page2Btn.click());
      const event = await oneEvent(el, 'page-change');
      expect(event.detail.page).to.equal(2);
    });

    it('fires page-change on next button click', async () => {
      const el = await fixture(html`<dvfy-pagination total="5" current="1"></dvfy-pagination>`);
      const next = el.querySelector('[aria-label="Next page"]');
      setTimeout(() => next.click());
      const event = await oneEvent(el, 'page-change');
      expect(event.detail.page).to.equal(2);
    });

    it('fires page-change on prev button click', async () => {
      const el = await fixture(html`<dvfy-pagination total="5" current="3"></dvfy-pagination>`);
      const prev = el.querySelector('[aria-label="Previous page"]');
      setTimeout(() => prev.click());
      const event = await oneEvent(el, 'page-change');
      expect(event.detail.page).to.equal(2);
    });

    it('updates current attribute after page-change', async () => {
      const el = await fixture(html`<dvfy-pagination total="5" current="1"></dvfy-pagination>`);
      const page3Btn = [...el.querySelectorAll('.dvfy-pagination__btn')].find(b => b.textContent === '3');
      setTimeout(() => page3Btn.click());
      await oneEvent(el, 'page-change');
      expect(el.getAttribute('current')).to.equal('3');
    });
  });

  describe('keyboard interaction', () => {
    it('navigates right with ArrowRight', async () => {
      const el = await fixture(html`<dvfy-pagination total="5" current="1"></dvfy-pagination>`);
      const btns = [...el.querySelectorAll('.dvfy-pagination__btn:not([disabled])')];
      btns[0].focus();
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      expect(document.activeElement).to.equal(btns[1]);
    });

    it('navigates left with ArrowLeft', async () => {
      const el = await fixture(html`<dvfy-pagination total="5" current="3"></dvfy-pagination>`);
      const btns = [...el.querySelectorAll('.dvfy-pagination__btn:not([disabled])')];
      btns[1].focus();
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      expect(document.activeElement).to.equal(btns[0]);
    });

    it('jumps to first with Home', async () => {
      const el = await fixture(html`<dvfy-pagination total="5" current="3"></dvfy-pagination>`);
      const btns = [...el.querySelectorAll('.dvfy-pagination__btn:not([disabled])')];
      btns[3].focus();
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      expect(document.activeElement).to.equal(btns[0]);
    });

    it('jumps to last with End', async () => {
      const el = await fixture(html`<dvfy-pagination total="5" current="3"></dvfy-pagination>`);
      const btns = [...el.querySelectorAll('.dvfy-pagination__btn:not([disabled])')];
      btns[0].focus();
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      expect(document.activeElement).to.equal(btns[btns.length - 1]);
    });
  });

  describe('ARIA', () => {
    it('sets role=navigation', async () => {
      const el = await fixture(html`<dvfy-pagination total="5"></dvfy-pagination>`);
      expect(el.getAttribute('role')).to.equal('navigation');
    });

    it('sets aria-label=Pagination', async () => {
      const el = await fixture(html`<dvfy-pagination total="5"></dvfy-pagination>`);
      expect(el.getAttribute('aria-label')).to.equal('Pagination');
    });
  });
});
