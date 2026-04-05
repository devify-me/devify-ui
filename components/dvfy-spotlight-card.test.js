import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-spotlight-card.js';

describe('dvfy-spotlight-card', () => {
  describe('rendering', () => {
    it('renders with default state', async () => {
      const el = await fixture(html`<dvfy-spotlight-card>Content</dvfy-spotlight-card>`);
      expect(el.textContent.trim()).to.equal('Content');
    });

    it('renders slotted content', async () => {
      const el = await fixture(html`
        <dvfy-spotlight-card padded>
          <h3>Title</h3>
        </dvfy-spotlight-card>
      `);
      expect(el.querySelector('h3').textContent).to.equal('Title');
    });
  });

  describe('attributes', () => {
    it('accepts padded attribute', async () => {
      const el = await fixture(html`<dvfy-spotlight-card padded>Padded</dvfy-spotlight-card>`);
      expect(el.hasAttribute('padded')).to.be.true;
    });

    it('accepts elevated attribute', async () => {
      const el = await fixture(html`<dvfy-spotlight-card elevated>Elevated</dvfy-spotlight-card>`);
      expect(el.hasAttribute('elevated')).to.be.true;
    });
  });

  describe('interactive mode', () => {
    it('sets role=button and tabindex=0 when interactive', async () => {
      const el = await fixture(html`<dvfy-spotlight-card interactive>Click</dvfy-spotlight-card>`);
      expect(el.getAttribute('role')).to.equal('button');
      expect(el.getAttribute('tabindex')).to.equal('0');
    });

    it('removes role and tabindex when interactive is removed', async () => {
      const el = await fixture(html`<dvfy-spotlight-card interactive>Click</dvfy-spotlight-card>`);
      el.removeAttribute('interactive');
      expect(el.hasAttribute('role')).to.be.false;
      expect(el.hasAttribute('tabindex')).to.be.false;
    });

    it('does not set role or tabindex without interactive', async () => {
      const el = await fixture(html`<dvfy-spotlight-card>Static</dvfy-spotlight-card>`);
      expect(el.hasAttribute('role')).to.be.false;
      expect(el.hasAttribute('tabindex')).to.be.false;
    });
  });

  describe('mouse tracking', () => {
    it('updates CSS custom properties on mousemove', async () => {
      const el = await fixture(html`<dvfy-spotlight-card>Content</dvfy-spotlight-card>`);
      const rect = el.getBoundingClientRect();
      el.dispatchEvent(new MouseEvent('mousemove', {
        clientX: rect.left + 75,
        clientY: rect.top + 25,
        bubbles: true,
      }));
      await new Promise(resolve => requestAnimationFrame(resolve));
      expect(el.style.getPropertyValue('--x')).to.equal('75px');
      expect(el.style.getPropertyValue('--y')).to.equal('25px');
    });

    it('resets position on mouseleave', async () => {
      const el = await fixture(html`<dvfy-spotlight-card>Content</dvfy-spotlight-card>`);
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
