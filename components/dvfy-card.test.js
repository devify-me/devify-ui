import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-card.js';

describe('dvfy-card', () => {
  describe('rendering', () => {
    it('renders with default state', async () => {
      const el = await fixture(html`<dvfy-card>Content here</dvfy-card>`);
      expect(el.textContent.trim()).to.equal('Content here');
    });

    it('renders slotted content', async () => {
      const el = await fixture(html`
        <dvfy-card padded>
          <h3>Title</h3>
          <p>Body text</p>
        </dvfy-card>
      `);
      expect(el.querySelector('h3').textContent).to.equal('Title');
      expect(el.querySelector('p').textContent).to.equal('Body text');
    });
  });

  describe('attributes', () => {
    it('accepts padded attribute', async () => {
      const el = await fixture(html`<dvfy-card padded>Padded</dvfy-card>`);
      expect(el.hasAttribute('padded')).to.be.true;
    });

    it('accepts elevated attribute', async () => {
      const el = await fixture(html`<dvfy-card elevated>Elevated</dvfy-card>`);
      expect(el.hasAttribute('elevated')).to.be.true;
    });
  });

  describe('interactive mode', () => {
    it('sets role=button and tabindex=0 when interactive', async () => {
      const el = await fixture(html`<dvfy-card interactive>Clickable</dvfy-card>`);
      expect(el.getAttribute('role')).to.equal('button');
      expect(el.getAttribute('tabindex')).to.equal('0');
    });

    it('removes role and tabindex when interactive is removed', async () => {
      const el = await fixture(html`<dvfy-card interactive>Clickable</dvfy-card>`);
      el.removeAttribute('interactive');
      expect(el.hasAttribute('role')).to.be.false;
      expect(el.hasAttribute('tabindex')).to.be.false;
    });

    it('does not set role or tabindex without interactive', async () => {
      const el = await fixture(html`<dvfy-card>Static</dvfy-card>`);
      expect(el.hasAttribute('role')).to.be.false;
      expect(el.hasAttribute('tabindex')).to.be.false;
    });
  });

  describe('spotlight mode', () => {
    it('accepts spotlight attribute', async () => {
      const el = await fixture(html`<dvfy-card spotlight>Spotlight</dvfy-card>`);
      expect(el.hasAttribute('spotlight')).to.be.true;
    });

    it('tracks mouse position via CSS custom properties', async () => {
      const el = await fixture(html`<dvfy-card spotlight>Spotlight</dvfy-card>`);
      const rect = el.getBoundingClientRect();
      el.dispatchEvent(new MouseEvent('mousemove', {
        clientX: rect.left + 50,
        clientY: rect.top + 30,
        bubbles: true,
      }));
      await new Promise(resolve => requestAnimationFrame(resolve));
      expect(el.style.getPropertyValue('--x')).to.equal('50px');
      expect(el.style.getPropertyValue('--y')).to.equal('30px');
    });

    it('resets position on mouse leave', async () => {
      const el = await fixture(html`<dvfy-card spotlight>Spotlight</dvfy-card>`);
      const rect = el.getBoundingClientRect();
      el.dispatchEvent(new MouseEvent('mousemove', {
        clientX: rect.left + 50,
        clientY: rect.top + 30,
        bubbles: true,
      }));
      await new Promise(resolve => requestAnimationFrame(resolve));
      el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      expect(el.style.getPropertyValue('--x')).to.equal('-999px');
      expect(el.style.getPropertyValue('--y')).to.equal('-999px');
    });
  });
});
