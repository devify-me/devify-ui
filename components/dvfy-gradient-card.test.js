import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-gradient-card.js';

describe('dvfy-gradient-card', () => {
  describe('rendering', () => {
    it('renders with default state', async () => {
      const el = await fixture(html`<dvfy-gradient-card>Content</dvfy-gradient-card>`);
      expect(el.textContent.trim()).to.equal('Content');
    });

    it('renders slotted content', async () => {
      const el = await fixture(html`
        <dvfy-gradient-card padded>
          <h3>Title</h3>
          <p>Description</p>
        </dvfy-gradient-card>
      `);
      expect(el.querySelector('h3').textContent).to.equal('Title');
      expect(el.querySelector('p').textContent).to.equal('Description');
    });
  });

  describe('attributes', () => {
    it('accepts padded attribute', async () => {
      const el = await fixture(html`<dvfy-gradient-card padded>Padded</dvfy-gradient-card>`);
      expect(el.hasAttribute('padded')).to.be.true;
    });

    it('accepts elevated attribute', async () => {
      const el = await fixture(html`<dvfy-gradient-card elevated>Elevated</dvfy-gradient-card>`);
      expect(el.hasAttribute('elevated')).to.be.true;
    });
  });

  describe('interactive mode', () => {
    it('sets role=button and tabindex=0 when interactive', async () => {
      const el = await fixture(html`<dvfy-gradient-card interactive>Click</dvfy-gradient-card>`);
      expect(el.getAttribute('role')).to.equal('button');
      expect(el.getAttribute('tabindex')).to.equal('0');
    });

    it('removes role and tabindex when interactive is removed', async () => {
      const el = await fixture(html`<dvfy-gradient-card interactive>Click</dvfy-gradient-card>`);
      el.removeAttribute('interactive');
      expect(el.hasAttribute('role')).to.be.false;
      expect(el.hasAttribute('tabindex')).to.be.false;
    });

    it('does not set role or tabindex without interactive', async () => {
      const el = await fixture(html`<dvfy-gradient-card>Static</dvfy-gradient-card>`);
      expect(el.hasAttribute('role')).to.be.false;
      expect(el.hasAttribute('tabindex')).to.be.false;
    });
  });

  describe('mouse tracking', () => {
    it('updates CSS custom properties on mousemove', async () => {
      const el = await fixture(html`<dvfy-gradient-card>Content</dvfy-gradient-card>`);
      const rect = el.getBoundingClientRect();
      el.dispatchEvent(new MouseEvent('mousemove', {
        clientX: rect.left + 100,
        clientY: rect.top + 50,
        bubbles: true,
      }));
      expect(el.style.getPropertyValue('--x')).to.equal('100px');
      expect(el.style.getPropertyValue('--y')).to.equal('50px');
    });
  });
});
