import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-badge.js';
import './dvfy-button.js';
import './dvfy-subscription-card.js';

describe('dvfy-subscription-card', () => {
  const activeSub = JSON.stringify({
    status: 'active',
    plan_name: 'Pro',
    price_cents: 2500,
    currency: 'usd',
    interval: 'month',
    current_period_start: 1700000000,
    current_period_end: 1702592000,
  });

  const trialingSub = JSON.stringify({
    status: 'trialing',
    plan_name: 'Pro',
    trial_end: 1702592000,
  });

  const cancelingSub = JSON.stringify({
    status: 'canceling',
    plan_name: 'Pro',
    cancel_at: 1702592000,
  });

  const canceledSub = JSON.stringify({
    status: 'canceled',
    plan_name: 'Pro',
    canceled_at: 1700000000,
  });

  describe('active subscription', () => {
    it('renders plan name', async () => {
      const el = await fixture(html`<dvfy-subscription-card data='${activeSub}'></dvfy-subscription-card>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const planName = el.querySelector('.dvfy-subscription-card__plan-name');
      expect(planName).to.not.be.null;
      expect(planName.textContent).to.equal('Pro');
    });

    it('renders Active badge', async () => {
      const el = await fixture(html`<dvfy-subscription-card data='${activeSub}'></dvfy-subscription-card>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const badge = el.querySelector('dvfy-badge');
      expect(badge).to.not.be.null;
      expect(badge.getAttribute('status')).to.equal('success');
      expect(badge.textContent).to.include('Active');
    });

    it('renders amount with interval', async () => {
      const el = await fixture(html`<dvfy-subscription-card data='${activeSub}'></dvfy-subscription-card>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const amount = el.querySelector('.dvfy-subscription-card__amount');
      expect(amount).to.not.be.null;
      expect(amount.textContent).to.include('25');
      const period = el.querySelector('.dvfy-subscription-card__period');
      expect(period.textContent).to.include('month');
    });

    it('renders Change plan and Cancel buttons', async () => {
      const el = await fixture(html`<dvfy-subscription-card data='${activeSub}'></dvfy-subscription-card>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const buttons = el.querySelectorAll('dvfy-button');
      const texts = Array.from(buttons).map(b => b.textContent.trim());
      expect(texts).to.include('Change plan');
      expect(texts).to.include('Cancel');
    });

    it('renders next billing date', async () => {
      const el = await fixture(html`<dvfy-subscription-card data='${activeSub}'></dvfy-subscription-card>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const labels = el.querySelectorAll('.dvfy-subscription-card__label');
      const labelTexts = Array.from(labels).map(l => l.textContent);
      expect(labelTexts).to.include('Next billing');
    });
  });

  describe('trialing subscription', () => {
    it('renders Trial badge', async () => {
      const el = await fixture(html`<dvfy-subscription-card data='${trialingSub}'></dvfy-subscription-card>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const badge = el.querySelector('dvfy-badge');
      expect(badge.getAttribute('status')).to.equal('info');
      expect(badge.textContent).to.include('Trial');
    });

    it('shows trial end date', async () => {
      const el = await fixture(html`<dvfy-subscription-card data='${trialingSub}'></dvfy-subscription-card>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const labels = el.querySelectorAll('.dvfy-subscription-card__label');
      const labelTexts = Array.from(labels).map(l => l.textContent);
      expect(labelTexts).to.include('Trial ends');
    });
  });

  describe('canceling subscription', () => {
    it('renders Canceling badge', async () => {
      const el = await fixture(html`<dvfy-subscription-card data='${cancelingSub}'></dvfy-subscription-card>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const badge = el.querySelector('dvfy-badge');
      expect(badge.getAttribute('status')).to.equal('warning');
      expect(badge.textContent).to.include('Canceling');
    });

    it('shows cancellation notice', async () => {
      const el = await fixture(html`<dvfy-subscription-card data='${cancelingSub}'></dvfy-subscription-card>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const notice = el.querySelector('.dvfy-subscription-card__cancel-notice');
      expect(notice).to.not.be.null;
      expect(notice.textContent).to.include('will end on');
    });

    it('shows Reactivate button', async () => {
      const el = await fixture(html`<dvfy-subscription-card data='${cancelingSub}'></dvfy-subscription-card>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const buttons = el.querySelectorAll('dvfy-button');
      const texts = Array.from(buttons).map(b => b.textContent.trim());
      expect(texts).to.include('Reactivate');
    });
  });

  describe('canceled subscription', () => {
    it('renders Canceled badge', async () => {
      const el = await fixture(html`<dvfy-subscription-card data='${canceledSub}'></dvfy-subscription-card>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const badge = el.querySelector('dvfy-badge');
      expect(badge.getAttribute('status')).to.equal('danger');
      expect(badge.textContent).to.include('Canceled');
    });

    it('shows ended notice', async () => {
      const el = await fixture(html`<dvfy-subscription-card data='${canceledSub}'></dvfy-subscription-card>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const notice = el.querySelector('.dvfy-subscription-card__cancel-notice');
      expect(notice).to.not.be.null;
      expect(notice.textContent).to.include('ended on');
    });

    it('shows Choose a plan button', async () => {
      const el = await fixture(html`<dvfy-subscription-card data='${canceledSub}'></dvfy-subscription-card>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const buttons = el.querySelectorAll('dvfy-button');
      const texts = Array.from(buttons).map(b => b.textContent.trim());
      expect(texts).to.include('Choose a plan');
    });
  });

  describe('no subscription', () => {
    it('shows empty state without data or tenant-id', async () => {
      const el = await fixture(html`<dvfy-subscription-card></dvfy-subscription-card>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const empty = el.querySelector('.dvfy-subscription-card__empty');
      expect(empty).to.not.be.null;
      expect(empty.textContent).to.include('No active subscription');
    });

    it('shows Choose a plan button in empty state', async () => {
      const el = await fixture(html`<dvfy-subscription-card></dvfy-subscription-card>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const btn = el.querySelector('.dvfy-subscription-card__empty dvfy-button');
      expect(btn).to.not.be.null;
      expect(btn.textContent.trim()).to.equal('Choose a plan');
    });
  });

  describe('error state', () => {
    it('shows error on invalid JSON', async () => {
      const el = await fixture(html`<dvfy-subscription-card data='bad-json'></dvfy-subscription-card>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const error = el.querySelector('.dvfy-subscription-card__error');
      expect(error).to.not.be.null;
      expect(error.textContent).to.include('Invalid data format');
    });
  });

  describe('events', () => {
    it('dispatches dvfy-subscription-loaded after data renders', async () => {
      const el = document.createElement('dvfy-subscription-card');
      el.setAttribute('data', activeSub);
      setTimeout(() => document.body.appendChild(el));
      const ev = await oneEvent(el, 'dvfy-subscription-loaded');
      expect(ev.detail).to.have.property('status', 'active');
      el.remove();
    });

    it('dispatches dvfy-subscription-change-plan on Change plan click', async () => {
      const el = await fixture(html`<dvfy-subscription-card data='${activeSub}'></dvfy-subscription-card>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const changeBtn = Array.from(el.querySelectorAll('dvfy-button')).find(b => b.textContent.trim() === 'Change plan');
      setTimeout(() => changeBtn.click());
      const ev = await oneEvent(el, 'dvfy-subscription-change-plan');
      expect(ev).to.exist;
    });

    it('dispatches dvfy-subscription-cancel on Cancel click', async () => {
      const el = await fixture(html`<dvfy-subscription-card data='${activeSub}'></dvfy-subscription-card>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const cancelBtn = Array.from(el.querySelectorAll('dvfy-button')).find(b => b.textContent.trim() === 'Cancel');
      setTimeout(() => cancelBtn.click());
      const ev = await oneEvent(el, 'dvfy-subscription-cancel');
      expect(ev).to.exist;
    });

    it('dispatches dvfy-subscription-reactivate on Reactivate click', async () => {
      const el = await fixture(html`<dvfy-subscription-card data='${cancelingSub}'></dvfy-subscription-card>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const reactivateBtn = Array.from(el.querySelectorAll('dvfy-button')).find(b => b.textContent.trim() === 'Reactivate');
      setTimeout(() => reactivateBtn.click());
      const ev = await oneEvent(el, 'dvfy-subscription-reactivate');
      expect(ev).to.exist;
    });

    it('dispatches dvfy-subscription-choose-plan from empty state', async () => {
      const el = await fixture(html`<dvfy-subscription-card></dvfy-subscription-card>`);
      await new Promise(resolve => queueMicrotask(resolve));
      await new Promise(resolve => setTimeout(resolve, 0));
      const btn = el.querySelector('dvfy-button');
      setTimeout(() => btn.click());
      const ev = await oneEvent(el, 'dvfy-subscription-choose-plan');
      expect(ev).to.exist;
    });
  });

  describe('ARIA', () => {
    it('sets role="region"', async () => {
      const el = await fixture(html`<dvfy-subscription-card></dvfy-subscription-card>`);
      expect(el.getAttribute('role')).to.equal('region');
    });

    it('sets aria-label', async () => {
      const el = await fixture(html`<dvfy-subscription-card></dvfy-subscription-card>`);
      expect(el.getAttribute('aria-label')).to.equal('Subscription status');
    });

    it('preserves custom aria-label', async () => {
      const el = await fixture(html`<dvfy-subscription-card aria-label="My sub"></dvfy-subscription-card>`);
      expect(el.getAttribute('aria-label')).to.equal('My sub');
    });
  });
});
