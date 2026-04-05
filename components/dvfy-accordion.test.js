import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-section.js';
import './dvfy-accordion.js';

describe('dvfy-accordion', () => {
  describe('rendering', () => {
    it('renders with child sections', async () => {
      const el = await fixture(html`
        <dvfy-accordion>
          <dvfy-section label="One" collapsed>Content 1</dvfy-section>
          <dvfy-section label="Two" collapsed>Content 2</dvfy-section>
        </dvfy-accordion>
      `);
      const sections = el.querySelectorAll('dvfy-section');
      expect(sections.length).to.equal(2);
    });

    it('is defined as a custom element', async () => {
      const el = await fixture(html`<dvfy-accordion></dvfy-accordion>`);
      expect(el).to.be.instanceOf(HTMLElement);
      expect(customElements.get('dvfy-accordion')).to.exist;
    });
  });

  describe('ARIA', () => {
    it('sets role=region', async () => {
      const el = await fixture(html`<dvfy-accordion></dvfy-accordion>`);
      expect(el.getAttribute('role')).to.equal('region');
    });

    it('sets default aria-label', async () => {
      const el = await fixture(html`<dvfy-accordion></dvfy-accordion>`);
      expect(el.getAttribute('aria-label')).to.equal('Accordion');
    });

    it('preserves custom aria-label', async () => {
      const el = await fixture(html`<dvfy-accordion aria-label="FAQ"></dvfy-accordion>`);
      expect(el.getAttribute('aria-label')).to.equal('FAQ');
    });
  });

  describe('exclusive mode', () => {
    it('accepts exclusive attribute', async () => {
      const el = await fixture(html`
        <dvfy-accordion exclusive>
          <dvfy-section label="One" collapsed>Content 1</dvfy-section>
          <dvfy-section label="Two" collapsed>Content 2</dvfy-section>
        </dvfy-accordion>
      `);
      expect(el.hasAttribute('exclusive')).to.be.true;
    });

    it('closes other sections when one is opened in exclusive mode', async () => {
      const el = await fixture(html`
        <dvfy-accordion exclusive>
          <dvfy-section label="One">Content 1</dvfy-section>
          <dvfy-section label="Two" collapsed>Content 2</dvfy-section>
        </dvfy-accordion>
      `);
      const sections = el.querySelectorAll('dvfy-section');
      const secondSummary = sections[1].querySelector('.dvfy-section__summary');

      // Open second section by clicking its summary
      secondSummary.click();

      // Wait for rAF used by the exclusive enforcement
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

      expect(sections[1].hasAttribute('open')).to.be.true;
      expect(sections[0].hasAttribute('open')).to.be.false;
    });
  });

  describe('keyboard navigation', () => {
    it('moves focus down with ArrowDown', async () => {
      const el = await fixture(html`
        <dvfy-accordion>
          <dvfy-section label="One" collapsed>Content 1</dvfy-section>
          <dvfy-section label="Two" collapsed>Content 2</dvfy-section>
          <dvfy-section label="Three" collapsed>Content 3</dvfy-section>
        </dvfy-accordion>
      `);
      const sections = el.querySelectorAll('dvfy-section');
      const firstSummary = sections[0].querySelector('.dvfy-section__summary');
      const secondSummary = sections[1].querySelector('.dvfy-section__summary');

      firstSummary.focus();
      firstSummary.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      expect(document.activeElement).to.equal(secondSummary);
    });

    it('moves focus up with ArrowUp', async () => {
      const el = await fixture(html`
        <dvfy-accordion>
          <dvfy-section label="One" collapsed>Content 1</dvfy-section>
          <dvfy-section label="Two" collapsed>Content 2</dvfy-section>
        </dvfy-accordion>
      `);
      const sections = el.querySelectorAll('dvfy-section');
      const firstSummary = sections[0].querySelector('.dvfy-section__summary');
      const secondSummary = sections[1].querySelector('.dvfy-section__summary');

      secondSummary.focus();
      secondSummary.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      expect(document.activeElement).to.equal(firstSummary);
    });

    it('moves focus to first section with Home', async () => {
      const el = await fixture(html`
        <dvfy-accordion>
          <dvfy-section label="One" collapsed>Content 1</dvfy-section>
          <dvfy-section label="Two" collapsed>Content 2</dvfy-section>
          <dvfy-section label="Three" collapsed>Content 3</dvfy-section>
        </dvfy-accordion>
      `);
      const sections = el.querySelectorAll('dvfy-section');
      const firstSummary = sections[0].querySelector('.dvfy-section__summary');
      const lastSummary = sections[2].querySelector('.dvfy-section__summary');

      lastSummary.focus();
      lastSummary.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      expect(document.activeElement).to.equal(firstSummary);
    });

    it('moves focus to last section with End', async () => {
      const el = await fixture(html`
        <dvfy-accordion>
          <dvfy-section label="One" collapsed>Content 1</dvfy-section>
          <dvfy-section label="Two" collapsed>Content 2</dvfy-section>
          <dvfy-section label="Three" collapsed>Content 3</dvfy-section>
        </dvfy-accordion>
      `);
      const sections = el.querySelectorAll('dvfy-section');
      const firstSummary = sections[0].querySelector('.dvfy-section__summary');
      const lastSummary = sections[2].querySelector('.dvfy-section__summary');

      firstSummary.focus();
      firstSummary.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      expect(document.activeElement).to.equal(lastSummary);
    });

    it('wraps focus from last to first on ArrowDown', async () => {
      const el = await fixture(html`
        <dvfy-accordion>
          <dvfy-section label="One" collapsed>Content 1</dvfy-section>
          <dvfy-section label="Two" collapsed>Content 2</dvfy-section>
        </dvfy-accordion>
      `);
      const sections = el.querySelectorAll('dvfy-section');
      const firstSummary = sections[0].querySelector('.dvfy-section__summary');
      const lastSummary = sections[1].querySelector('.dvfy-section__summary');

      lastSummary.focus();
      lastSummary.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      expect(document.activeElement).to.equal(firstSummary);
    });
  });
});
