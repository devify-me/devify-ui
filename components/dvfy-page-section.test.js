import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-page-section.js';

describe('dvfy-page-section', () => {
  it('renders slotted content', async () => {
    const el = await fixture(html`
      <dvfy-page-section><h2>Section title</h2></dvfy-page-section>
    `);
    expect(el.querySelector('h2').textContent).to.equal('Section title');
  });

  it('is defined as a custom element', () => {
    expect(customElements.get('dvfy-page-section')).to.exist;
  });

  it('accepts padding / align / tone / width attributes', async () => {
    const el = await fixture(html`
      <dvfy-page-section padding="xl" align="center" tone="muted" width="prose">
        content
      </dvfy-page-section>
    `);
    expect(el.getAttribute('padding')).to.equal('xl');
    expect(el.getAttribute('align')).to.equal('center');
    expect(el.getAttribute('tone')).to.equal('muted');
    expect(el.getAttribute('width')).to.equal('prose');
  });

  it('is a block-level container query host', async () => {
    const el = await fixture(html`<dvfy-page-section>x</dvfy-page-section>`);
    const cs = getComputedStyle(el);
    expect(cs.display).to.equal('block');
  });
});
