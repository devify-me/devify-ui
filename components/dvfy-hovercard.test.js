import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-hovercard.js';

describe('dvfy-hovercard', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`<dvfy-hovercard id="hc1">Tooltip text</dvfy-hovercard>`);
      expect(el.getAttribute('role')).to.equal('tooltip');
    });

    it('preserves slotted content', async () => {
      const el = await fixture(html`
        <dvfy-hovercard id="hc2">
          <strong>Alice</strong>
          <p>Engineer</p>
        </dvfy-hovercard>
      `);
      expect(el.querySelector('strong').textContent).to.equal('Alice');
      expect(el.querySelector('p').textContent).to.equal('Engineer');
    });
  });

  describe('attributes', () => {
    it('accepts position attribute', async () => {
      const el = await fixture(html`<dvfy-hovercard id="hc3" position="bottom">Content</dvfy-hovercard>`);
      expect(el.getAttribute('position')).to.equal('bottom');
    });

    it('accepts delay attribute', async () => {
      const el = await fixture(html`<dvfy-hovercard id="hc4" delay="200">Content</dvfy-hovercard>`);
      expect(el.getAttribute('delay')).to.equal('200');
    });

    it('accepts all position values', async () => {
      for (const pos of ['top', 'bottom', 'left', 'right']) {
        const el = await fixture(html`<dvfy-hovercard id="hc-${pos}" position="${pos}">Tip</dvfy-hovercard>`);
        expect(el.getAttribute('position')).to.equal(pos);
      }
    });
  });

  describe('popover setup', () => {
    it('sets popover or fallback attribute on connect', async () => {
      const el = await fixture(html`<dvfy-hovercard id="hc5">Content</dvfy-hovercard>`);
      // Should have either popover="hint" (native) or data-hc-fallback (JS fallback)
      const hasPopover = el.hasAttribute('popover');
      const hasFallback = el.hasAttribute('data-hc-fallback');
      expect(hasPopover || hasFallback).to.be.true;
    });
  });

  describe('ARIA', () => {
    it('sets role="tooltip"', async () => {
      const el = await fixture(html`<dvfy-hovercard id="hc6">ARIA test</dvfy-hovercard>`);
      expect(el.getAttribute('role')).to.equal('tooltip');
    });

    it('links trigger aria-describedby to hovercard id', async () => {
      const wrapper = await fixture(html`
        <div>
          <button interestfor="hc-aria">Hover</button>
          <dvfy-hovercard id="hc-aria">Details here</dvfy-hovercard>
        </div>
      `);
      // aria linking is deferred via setTimeout
      await new Promise(r => setTimeout(r, 50));
      const trigger = wrapper.querySelector('button');
      expect(trigger.getAttribute('aria-describedby')).to.include('hc-aria');
    });

    it('does not duplicate aria-describedby on existing value', async () => {
      const wrapper = await fixture(html`
        <div>
          <button interestfor="hc-nodup" aria-describedby="other">Hover</button>
          <dvfy-hovercard id="hc-nodup">Details</dvfy-hovercard>
        </div>
      `);
      await new Promise(r => setTimeout(r, 50));
      const trigger = wrapper.querySelector('button');
      const describedBy = trigger.getAttribute('aria-describedby');
      expect(describedBy).to.include('other');
      expect(describedBy).to.include('hc-nodup');
    });
  });

  describe('fallback behavior', () => {
    it('is hidden by default in fallback mode', async () => {
      const el = await fixture(html`<dvfy-hovercard id="hc7">Hidden</dvfy-hovercard>`);
      if (el.hasAttribute('data-hc-fallback')) {
        expect(el.style.display).to.equal('none');
      }
    });

    it('cleans up on disconnect', async () => {
      const wrapper = await fixture(html`
        <div>
          <button interestfor="hc-cleanup">Hover</button>
          <dvfy-hovercard id="hc-cleanup">Content</dvfy-hovercard>
        </div>
      `);
      const hovercard = wrapper.querySelector('dvfy-hovercard');
      // Should not throw on removal
      hovercard.remove();
    });
  });
});
