import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-section.js';

describe('dvfy-section', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`<dvfy-section label="Test">Content</dvfy-section>`);
      const label = el.querySelector('.dvfy-section__label');
      expect(label.textContent).to.equal('Test');
    });

    it('is open by default when no collapsed attribute', async () => {
      const el = await fixture(html`<dvfy-section label="Open">Content</dvfy-section>`);
      expect(el.hasAttribute('open')).to.be.true;
    });

    it('starts collapsed when collapsed attribute is set', async () => {
      const el = await fixture(html`<dvfy-section label="Closed" collapsed>Content</dvfy-section>`);
      expect(el.hasAttribute('open')).to.be.false;
    });

    it('renders icon when icon attribute is set', async () => {
      const el = await fixture(html`<dvfy-section label="Icons" icon="⚙">Content</dvfy-section>`);
      const icon = el.querySelector('.dvfy-section__icon');
      expect(icon).to.exist;
      expect(icon.textContent).to.equal('⚙');
    });

    it('renders arrow indicator', async () => {
      const el = await fixture(html`<dvfy-section label="Arrow">Content</dvfy-section>`);
      const arrow = el.querySelector('.dvfy-section__arrow');
      expect(arrow).to.exist;
      expect(arrow.getAttribute('aria-hidden')).to.equal('true');
    });

    it('wraps children in body element', async () => {
      const el = await fixture(html`<dvfy-section label="Body"><p>Hello</p></dvfy-section>`);
      const body = el.querySelector('.dvfy-section__body');
      expect(body).to.exist;
      expect(body.querySelector('p').textContent).to.equal('Hello');
    });
  });

  describe('attributes', () => {
    it('updates label dynamically', async () => {
      const el = await fixture(html`<dvfy-section label="Old">Content</dvfy-section>`);
      el.setAttribute('label', 'New');
      const label = el.querySelector('.dvfy-section__label');
      expect(label.textContent).to.equal('New');
    });

    it('updates icon dynamically', async () => {
      const el = await fixture(html`<dvfy-section label="Test" icon="A">Content</dvfy-section>`);
      el.setAttribute('icon', 'B');
      const icon = el.querySelector('.dvfy-section__icon');
      expect(icon.textContent).to.equal('B');
    });
  });

  describe('toggle behavior', () => {
    it('toggles open attribute on click', async () => {
      const el = await fixture(html`<dvfy-section label="Toggle">Content</dvfy-section>`);
      const summary = el.querySelector('.dvfy-section__summary');
      expect(el.hasAttribute('open')).to.be.true;
      summary.click();
      expect(el.hasAttribute('open')).to.be.false;
      summary.click();
      expect(el.hasAttribute('open')).to.be.true;
    });

    it('exposes toggle() method', async () => {
      const el = await fixture(html`<dvfy-section label="Method">Content</dvfy-section>`);
      expect(el.hasAttribute('open')).to.be.true;
      el.toggle();
      expect(el.hasAttribute('open')).to.be.false;
    });
  });

  describe('keyboard', () => {
    it('toggles on Enter key', async () => {
      const el = await fixture(html`<dvfy-section label="Key">Content</dvfy-section>`);
      const summary = el.querySelector('.dvfy-section__summary');
      expect(el.hasAttribute('open')).to.be.true;
      summary.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(el.hasAttribute('open')).to.be.false;
    });

    it('toggles on Space key', async () => {
      const el = await fixture(html`<dvfy-section label="Key">Content</dvfy-section>`);
      const summary = el.querySelector('.dvfy-section__summary');
      expect(el.hasAttribute('open')).to.be.true;
      summary.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(el.hasAttribute('open')).to.be.false;
    });
  });

  describe('ARIA', () => {
    it('summary has role=button and tabindex=0', async () => {
      const el = await fixture(html`<dvfy-section label="ARIA">Content</dvfy-section>`);
      const summary = el.querySelector('.dvfy-section__summary');
      expect(summary.getAttribute('role')).to.equal('button');
      expect(summary.getAttribute('tabindex')).to.equal('0');
    });

    it('summary has aria-expanded matching open state', async () => {
      const el = await fixture(html`<dvfy-section label="Expanded">Content</dvfy-section>`);
      const summary = el.querySelector('.dvfy-section__summary');
      expect(summary.getAttribute('aria-expanded')).to.equal('true');
      el.toggle();
      expect(summary.getAttribute('aria-expanded')).to.equal('false');
    });

    it('summary has aria-controls pointing to body id', async () => {
      const el = await fixture(html`<dvfy-section label="Controls">Content</dvfy-section>`);
      const summary = el.querySelector('.dvfy-section__summary');
      const body = el.querySelector('.dvfy-section__body');
      expect(summary.getAttribute('aria-controls')).to.equal(body.id);
    });
  });
});
