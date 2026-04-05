import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-button.js';
import './dvfy-badge.js';
import './dvfy-plan-picker.js';

describe('dvfy-plan-picker', () => {
  const samplePlans = JSON.stringify([
    {
      name: 'starter',
      display_name: 'Starter',
      price_cents: 0,
      currency: 'usd',
      interval: 'month',
      features: { 'API Calls': '1,000/mo', 'Storage': '1 GB' },
    },
    {
      name: 'pro',
      display_name: 'Pro',
      price_cents: 2500,
      currency: 'usd',
      interval: 'month',
      features: { 'API Calls': '50,000/mo', 'Storage': '50 GB', 'Support': 'Priority' },
    },
    {
      name: 'enterprise',
      display_name: 'Enterprise',
      price_cents: 10000,
      currency: 'usd',
      interval: 'month',
      features: { 'API Calls': 'Unlimited', 'Storage': '500 GB', 'Support': 'Dedicated' },
    },
  ]);

  describe('rendering', () => {
    it('renders plan cards from data attribute', async () => {
      const el = await fixture(html`<dvfy-plan-picker data='${samplePlans}'></dvfy-plan-picker>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const cards = el.querySelectorAll('.dvfy-plan-picker__plan');
      expect(cards.length).to.equal(3);
    });

    it('renders plan names', async () => {
      const el = await fixture(html`<dvfy-plan-picker data='${samplePlans}'></dvfy-plan-picker>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const names = el.querySelectorAll('.dvfy-plan-picker__plan-name');
      expect(names[0].textContent).to.equal('Starter');
      expect(names[1].textContent).to.equal('Pro');
      expect(names[2].textContent).to.equal('Enterprise');
    });

    it('renders "Free" for zero-price plans', async () => {
      const el = await fixture(html`<dvfy-plan-picker data='${samplePlans}'></dvfy-plan-picker>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const amounts = el.querySelectorAll('.dvfy-plan-picker__amount');
      expect(amounts[0].textContent).to.equal('Free');
    });

    it('renders price with interval for paid plans', async () => {
      const el = await fixture(html`<dvfy-plan-picker data='${samplePlans}'></dvfy-plan-picker>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const amounts = el.querySelectorAll('.dvfy-plan-picker__amount');
      expect(amounts[1].textContent).to.include('25');
      const intervals = el.querySelectorAll('.dvfy-plan-picker__interval');
      expect(intervals[0].textContent).to.include('month');
    });

    it('does not render interval for free plans', async () => {
      const el = await fixture(html`<dvfy-plan-picker data='${samplePlans}'></dvfy-plan-picker>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      // Free plan card should not have interval span
      const firstCard = el.querySelector('.dvfy-plan-picker__plan');
      const interval = firstCard.querySelector('.dvfy-plan-picker__interval');
      expect(interval).to.be.null;
    });

    it('renders feature list', async () => {
      const el = await fixture(html`<dvfy-plan-picker data='${samplePlans}'></dvfy-plan-picker>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const features = el.querySelectorAll('.dvfy-plan-picker__feature');
      expect(features.length).to.be.greaterThan(0);
    });

    it('renders CTA buttons', async () => {
      const el = await fixture(html`<dvfy-plan-picker data='${samplePlans}'></dvfy-plan-picker>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const buttons = el.querySelectorAll('dvfy-button');
      expect(buttons.length).to.equal(3);
      // Without current-plan, all buttons say "Get started"
      expect(buttons[0].textContent.trim()).to.equal('Get started');
    });
  });

  describe('current plan highlight', () => {
    it('highlights current plan card', async () => {
      const el = await fixture(html`<dvfy-plan-picker data='${samplePlans}' current-plan="pro"></dvfy-plan-picker>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const currentCard = el.querySelector('.dvfy-plan-picker__plan--current');
      expect(currentCard).to.not.be.null;
      const name = currentCard.querySelector('.dvfy-plan-picker__plan-name');
      expect(name.textContent).to.equal('Pro');
    });

    it('shows Current badge on current plan', async () => {
      const el = await fixture(html`<dvfy-plan-picker data='${samplePlans}' current-plan="pro"></dvfy-plan-picker>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const currentCard = el.querySelector('.dvfy-plan-picker__plan--current');
      const badge = currentCard.querySelector('dvfy-badge');
      expect(badge).to.not.be.null;
      expect(badge.textContent).to.include('Current');
    });

    it('disables CTA button for current plan', async () => {
      const el = await fixture(html`<dvfy-plan-picker data='${samplePlans}' current-plan="pro"></dvfy-plan-picker>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const currentCard = el.querySelector('.dvfy-plan-picker__plan--current');
      const btn = currentCard.querySelector('dvfy-button');
      expect(btn.hasAttribute('disabled')).to.be.true;
      expect(btn.textContent.trim()).to.equal('Current plan');
    });

    it('shows "Switch to this plan" for non-current plans when current-plan is set', async () => {
      const el = await fixture(html`<dvfy-plan-picker data='${samplePlans}' current-plan="pro"></dvfy-plan-picker>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const cards = el.querySelectorAll('.dvfy-plan-picker__plan:not(.dvfy-plan-picker__plan--current)');
      const btn = cards[0].querySelector('dvfy-button');
      expect(btn.textContent.trim()).to.equal('Switch to this plan');
    });
  });

  describe('grid columns', () => {
    it('auto-sets columns based on plan count', async () => {
      const el = await fixture(html`<dvfy-plan-picker data='${samplePlans}'></dvfy-plan-picker>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const grid = el.querySelector('.dvfy-plan-picker__grid');
      expect(grid.dataset.cols).to.equal('3');
    });

    it('respects explicit columns attribute', async () => {
      const el = await fixture(html`<dvfy-plan-picker data='${samplePlans}' columns="2"></dvfy-plan-picker>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const grid = el.querySelector('.dvfy-plan-picker__grid');
      expect(grid.dataset.cols).to.equal('2');
    });

    it('caps auto columns at 4', async () => {
      const fivePlans = JSON.stringify([
        { name: 'a', display_name: 'A', price_cents: 0, features: {} },
        { name: 'b', display_name: 'B', price_cents: 0, features: {} },
        { name: 'c', display_name: 'C', price_cents: 0, features: {} },
        { name: 'd', display_name: 'D', price_cents: 0, features: {} },
        { name: 'e', display_name: 'E', price_cents: 0, features: {} },
      ]);
      const el = await fixture(html`<dvfy-plan-picker data='${fivePlans}'></dvfy-plan-picker>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const grid = el.querySelector('.dvfy-plan-picker__grid');
      expect(grid.dataset.cols).to.equal('4');
    });
  });

  describe('empty state', () => {
    it('shows empty state without data or tenant-id', async () => {
      const el = await fixture(html`<dvfy-plan-picker></dvfy-plan-picker>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const empty = el.querySelector('.dvfy-plan-picker__empty');
      expect(empty).to.not.be.null;
      expect(empty.textContent).to.include('No plans available');
    });

    it('shows empty state with empty array', async () => {
      const el = await fixture(html`<dvfy-plan-picker data='[]'></dvfy-plan-picker>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(el.querySelector('.dvfy-plan-picker__empty')).to.not.be.null;
    });
  });

  describe('error state', () => {
    it('shows error on invalid JSON', async () => {
      const el = await fixture(html`<dvfy-plan-picker data='not-json'></dvfy-plan-picker>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const error = el.querySelector('.dvfy-plan-picker__error');
      expect(error).to.not.be.null;
      expect(error.textContent).to.include('Invalid data format');
    });
  });

  describe('events', () => {
    it('dispatches dvfy-plans-loaded after data renders', async () => {
      const el = document.createElement('dvfy-plan-picker');
      el.setAttribute('data', samplePlans);
      setTimeout(() => document.body.appendChild(el));
      const ev = await oneEvent(el, 'dvfy-plans-loaded');
      expect(ev.detail).to.be.an('array');
      expect(ev.detail.length).to.equal(3);
      el.remove();
    });

    it('dispatches dvfy-plan-select when a plan CTA is clicked', async () => {
      const el = await fixture(html`<dvfy-plan-picker data='${samplePlans}'></dvfy-plan-picker>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const buttons = el.querySelectorAll('dvfy-button');
      setTimeout(() => buttons[0].click());
      const ev = await oneEvent(el, 'dvfy-plan-select');
      expect(ev.detail).to.have.property('name', 'starter');
      expect(ev.detail).to.have.property('display_name', 'Starter');
    });
  });

  describe('ARIA', () => {
    it('sets role="region"', async () => {
      const el = await fixture(html`<dvfy-plan-picker></dvfy-plan-picker>`);
      expect(el.getAttribute('role')).to.equal('region');
    });

    it('sets aria-label', async () => {
      const el = await fixture(html`<dvfy-plan-picker></dvfy-plan-picker>`);
      expect(el.getAttribute('aria-label')).to.equal('Choose a plan');
    });

    it('preserves custom aria-label', async () => {
      const el = await fixture(html`<dvfy-plan-picker aria-label="Plans"></dvfy-plan-picker>`);
      expect(el.getAttribute('aria-label')).to.equal('Plans');
    });
  });
});
