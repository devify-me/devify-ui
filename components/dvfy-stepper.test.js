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

  describe('reconnect / bfcache idempotency', () => {
    // Regression: connectedCallback → #build() appended a fresh nav every time
    // without removing the prior one. On disconnect→reconnect (incl. browser
    // back/forward bfcache page restore, which fires connectedCallback again),
    // the nav rail STACKED — a real rueda quiz showed ~5 copies after a few
    // back/forward navigations. A rebuild must REPLACE, not append.

    it('keeps exactly one nav rail after a reconnect', async () => {
      const el = await fixture(html`
        <dvfy-stepper active="2">
          <dvfy-step label="One">1</dvfy-step>
          <dvfy-step label="Two">2</dvfy-step>
          <dvfy-step label="Three">3</dvfy-step>
        </dvfy-stepper>
      `);
      await new Promise(r => setTimeout(r, 0));
      expect(el.querySelectorAll('.dvfy-stepper__nav').length).to.equal(1);

      // Simulate bfcache page restore: detach then re-attach the element,
      // which re-fires disconnectedCallback → connectedCallback → #build().
      const parent = el.parentNode;
      parent.removeChild(el);
      parent.appendChild(el);
      await new Promise(r => setTimeout(r, 0));

      expect(el.querySelectorAll('.dvfy-stepper__nav').length).to.equal(1);
    });

    it('does not duplicate after several reconnects', async () => {
      const el = await fixture(html`
        <dvfy-stepper>
          <dvfy-step label="One">1</dvfy-step>
          <dvfy-step label="Two">2</dvfy-step>
        </dvfy-stepper>
      `);
      await new Promise(r => setTimeout(r, 0));

      const parent = el.parentNode;
      for (let i = 0; i < 4; i += 1) {
        parent.removeChild(el);
        parent.appendChild(el);
        await new Promise(r => setTimeout(r, 0));
      }

      expect(el.querySelectorAll('.dvfy-stepper__nav').length).to.equal(1);
      // Headers/connectors must not stack either.
      expect(el.querySelectorAll('.dvfy-stepper__header').length).to.equal(2);
      expect(el.querySelectorAll('.dvfy-stepper__connector').length).to.equal(1);
    });

    it('preserves active step and step count after reconnect', async () => {
      const el = await fixture(html`
        <dvfy-stepper active="2">
          <dvfy-step label="One">1</dvfy-step>
          <dvfy-step label="Two">2</dvfy-step>
          <dvfy-step label="Three">3</dvfy-step>
        </dvfy-stepper>
      `);
      await new Promise(r => setTimeout(r, 0));

      const parent = el.parentNode;
      parent.removeChild(el);
      parent.appendChild(el);
      await new Promise(r => setTimeout(r, 0));

      const steps = el.querySelectorAll('dvfy-step');
      expect(steps.length).to.equal(3);
      expect(steps[0].hasAttribute('active')).to.be.false;
      expect(steps[1].hasAttribute('active')).to.be.true;
      expect(steps[2].hasAttribute('active')).to.be.false;

      const headers = el.querySelectorAll('.dvfy-stepper__header');
      expect(headers.length).to.equal(3);
      expect(headers[1].getAttribute('data-state')).to.equal('active');
      expect(headers[1].getAttribute('aria-selected')).to.equal('true');
    });
  });
});
