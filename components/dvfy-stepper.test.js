import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-stepper.js';

describe('dvfy-stepper', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`
        <dvfy-stepper>
          <dvfy-step label="One">Content 1</dvfy-step>
          <dvfy-step label="Two">Content 2</dvfy-step>
        </dvfy-stepper>
      `);
      await new Promise(r => setTimeout(r, 0));
      expect(el.getAttribute('role')).to.equal('navigation');
      expect(el.getAttribute('aria-label')).to.equal('Progress steps');
      const headers = el.querySelectorAll('.dvfy-stepper__header');
      expect(headers.length).to.equal(2);
    });

    it('shows step labels and descriptions', async () => {
      const el = await fixture(html`
        <dvfy-stepper>
          <dvfy-step label="Account" description="Create account">Content</dvfy-step>
        </dvfy-stepper>
      `);
      await new Promise(r => setTimeout(r, 0));
      expect(el.querySelector('.dvfy-stepper__label-text').textContent).to.equal('Account');
      expect(el.querySelector('.dvfy-stepper__label-desc').textContent).to.equal('Create account');
    });

    it('renders connector lines between steps', async () => {
      const el = await fixture(html`
        <dvfy-stepper>
          <dvfy-step label="One">1</dvfy-step>
          <dvfy-step label="Two">2</dvfy-step>
          <dvfy-step label="Three">3</dvfy-step>
        </dvfy-stepper>
      `);
      await new Promise(r => setTimeout(r, 0));
      const connectors = el.querySelectorAll('.dvfy-stepper__connector');
      expect(connectors.length).to.equal(2);
    });
  });

  describe('active step', () => {
    it('activates first step by default', async () => {
      const el = await fixture(html`
        <dvfy-stepper>
          <dvfy-step label="One">Content 1</dvfy-step>
          <dvfy-step label="Two">Content 2</dvfy-step>
        </dvfy-stepper>
      `);
      await new Promise(r => setTimeout(r, 0));
      const steps = el.querySelectorAll('dvfy-step');
      expect(steps[0].hasAttribute('active')).to.be.true;
      expect(steps[1].hasAttribute('active')).to.be.false;
    });

    it('respects active attribute', async () => {
      const el = await fixture(html`
        <dvfy-stepper active="2">
          <dvfy-step label="One">Content 1</dvfy-step>
          <dvfy-step label="Two">Content 2</dvfy-step>
        </dvfy-stepper>
      `);
      await new Promise(r => setTimeout(r, 0));
      const steps = el.querySelectorAll('dvfy-step');
      expect(steps[0].hasAttribute('active')).to.be.false;
      expect(steps[1].hasAttribute('active')).to.be.true;
    });

    it('changes active step via attribute', async () => {
      const el = await fixture(html`
        <dvfy-stepper active="1">
          <dvfy-step label="One">Content 1</dvfy-step>
          <dvfy-step label="Two">Content 2</dvfy-step>
        </dvfy-stepper>
      `);
      await new Promise(r => setTimeout(r, 0));
      el.setAttribute('active', '2');
      const steps = el.querySelectorAll('dvfy-step');
      expect(steps[1].hasAttribute('active')).to.be.true;
    });
  });

  describe('step states', () => {
    it('shows completed state with checkmark', async () => {
      const el = await fixture(html`
        <dvfy-stepper active="2">
          <dvfy-step label="One" completed>Done</dvfy-step>
          <dvfy-step label="Two">Current</dvfy-step>
        </dvfy-stepper>
      `);
      await new Promise(r => setTimeout(r, 0));
      const headers = el.querySelectorAll('.dvfy-stepper__header');
      expect(headers[0].getAttribute('data-state')).to.equal('completed');
      expect(headers[0].querySelector('.dvfy-stepper__indicator').textContent).to.equal('✓');
    });

    it('shows error state', async () => {
      const el = await fixture(html`
        <dvfy-stepper active="2">
          <dvfy-step label="One" error>Error</dvfy-step>
          <dvfy-step label="Two">Current</dvfy-step>
        </dvfy-stepper>
      `);
      await new Promise(r => setTimeout(r, 0));
      const headers = el.querySelectorAll('.dvfy-stepper__header');
      expect(headers[0].getAttribute('data-state')).to.equal('error');
    });
  });

  describe('events', () => {
    it('fires change event on step click', async () => {
      const el = await fixture(html`
        <dvfy-stepper active="1">
          <dvfy-step label="One">1</dvfy-step>
          <dvfy-step label="Two">2</dvfy-step>
        </dvfy-stepper>
      `);
      await new Promise(r => setTimeout(r, 0));
      const headers = el.querySelectorAll('.dvfy-stepper__header');
      setTimeout(() => headers[1].click());
      const ev = await oneEvent(el, 'change');
      expect(ev.detail.index).to.equal(2);
    });
  });

  describe('linear mode', () => {
    it('prevents skipping ahead', async () => {
      const el = await fixture(html`
        <dvfy-stepper active="1" linear>
          <dvfy-step label="One">1</dvfy-step>
          <dvfy-step label="Two">2</dvfy-step>
          <dvfy-step label="Three">3</dvfy-step>
        </dvfy-stepper>
      `);
      await new Promise(r => setTimeout(r, 0));
      // Click step 3 — should not activate (step 1 not completed)
      const headers = el.querySelectorAll('.dvfy-stepper__header');
      headers[2].click();
      expect(el.getAttribute('active')).to.equal('1');
    });

    it('allows advancing to next after completing current', async () => {
      const el = await fixture(html`
        <dvfy-stepper active="1" linear>
          <dvfy-step label="One" completed>1</dvfy-step>
          <dvfy-step label="Two">2</dvfy-step>
        </dvfy-stepper>
      `);
      await new Promise(r => setTimeout(r, 0));
      const headers = el.querySelectorAll('.dvfy-stepper__header');
      headers[1].click();
      expect(el.getAttribute('active')).to.equal('2');
    });
  });

  describe('vertical mode', () => {
    it('accepts vertical attribute', async () => {
      const el = await fixture(html`
        <dvfy-stepper vertical>
          <dvfy-step label="One">1</dvfy-step>
          <dvfy-step label="Two">2</dvfy-step>
        </dvfy-stepper>
      `);
      expect(el.hasAttribute('vertical')).to.be.true;
    });
  });
});
