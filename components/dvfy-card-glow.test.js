import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-card-glow.js';

describe('dvfy-card-glow', () => {
  describe('rendering', () => {
    it('renders with default state', async () => {
      const el = await fixture(html`<dvfy-card-glow>Content</dvfy-card-glow>`);
      expect(el.textContent.trim()).to.equal('Content');
    });

    it('renders slotted content', async () => {
      const el = await fixture(html`
        <dvfy-card-glow padded>
          <h3>Title</h3>
          <p>Description</p>
        </dvfy-card-glow>
      `);
      expect(el.querySelector('h3').textContent).to.equal('Title');
      expect(el.querySelector('p').textContent).to.equal('Description');
    });
  });

  describe('attributes', () => {
    it('accepts padded attribute', async () => {
      const el = await fixture(html`<dvfy-card-glow padded>Padded</dvfy-card-glow>`);
      expect(el.hasAttribute('padded')).to.be.true;
    });

    it('accepts elevated attribute', async () => {
      const el = await fixture(html`<dvfy-card-glow elevated>Elevated</dvfy-card-glow>`);
      expect(el.hasAttribute('elevated')).to.be.true;
    });

    it('accepts both padded and elevated', async () => {
      const el = await fixture(html`<dvfy-card-glow padded elevated>Both</dvfy-card-glow>`);
      expect(el.hasAttribute('padded')).to.be.true;
      expect(el.hasAttribute('elevated')).to.be.true;
    });
  });

  describe('interactive mode', () => {
    it('sets role=button and tabindex=0 when interactive', async () => {
      const el = await fixture(html`<dvfy-card-glow interactive>Clickable</dvfy-card-glow>`);
      expect(el.getAttribute('role')).to.equal('button');
      expect(el.getAttribute('tabindex')).to.equal('0');
    });

    it('removes role and tabindex when interactive is removed', async () => {
      const el = await fixture(html`<dvfy-card-glow interactive>Clickable</dvfy-card-glow>`);
      el.removeAttribute('interactive');
      expect(el.hasAttribute('role')).to.be.false;
      expect(el.hasAttribute('tabindex')).to.be.false;
    });

    it('does not set role or tabindex without interactive', async () => {
      const el = await fixture(html`<dvfy-card-glow>Static</dvfy-card-glow>`);
      expect(el.hasAttribute('role')).to.be.false;
      expect(el.hasAttribute('tabindex')).to.be.false;
    });

    it('does not override existing tabindex', async () => {
      const el = await fixture(html`<dvfy-card-glow interactive tabindex="0">Custom</dvfy-card-glow>`);
      expect(el.getAttribute('tabindex')).to.equal('0');
    });

    it('does not override existing role', async () => {
      const el = await fixture(html`<dvfy-card-glow interactive role="link">Custom</dvfy-card-glow>`);
      expect(el.getAttribute('role')).to.equal('link');
    });
  });

  describe('mouse tracking', () => {
    it('updates CSS custom properties on mousemove', async () => {
      const el = await fixture(html`<dvfy-card-glow>Glow</dvfy-card-glow>`);
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

    it('resets position on mouseleave', async () => {
      const el = await fixture(html`<dvfy-card-glow>Glow</dvfy-card-glow>`);
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

  describe('cleanup', () => {
    it('cancels animation frame on disconnect', async () => {
      const el = await fixture(html`<dvfy-card-glow>Cleanup</dvfy-card-glow>`);
      const rect = el.getBoundingClientRect();
      // Trigger a mousemove to schedule a rAF
      el.dispatchEvent(new MouseEvent('mousemove', {
        clientX: rect.left + 10,
        clientY: rect.top + 10,
        bubbles: true,
      }));
      // Remove before rAF fires — should not throw
      el.remove();
    });
  });
});
