import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-grid.js';

describe('dvfy-grid', () => {
  it('renders slotted cells', async () => {
    const el = await fixture(html`
      <dvfy-grid cols="3"><div>a</div><div>b</div><div>c</div></dvfy-grid>
    `);
    expect(el.children.length).to.equal(3);
  });

  it('uses display:grid', async () => {
    const el = await fixture(html`<dvfy-grid cols="2"><div>a</div></dvfy-grid>`);
    expect(getComputedStyle(el).display).to.equal('grid');
  });

  it('accepts cols and gap attributes', async () => {
    const el = await fixture(html`<dvfy-grid cols="4" gap="lg"><div>a</div></dvfy-grid>`);
    expect(el.getAttribute('cols')).to.equal('4');
    expect(el.getAttribute('gap')).to.equal('lg');
  });

  it('mirrors the min attribute into --dvfy-grid-min', async () => {
    const el = await fixture(html`<dvfy-grid min="16rem"><div>a</div></dvfy-grid>`);
    expect(el.style.getPropertyValue('--dvfy-grid-min')).to.equal('16rem');
  });

  it('clears --dvfy-grid-min when min is removed', async () => {
    const el = await fixture(html`<dvfy-grid min="16rem"><div>a</div></dvfy-grid>`);
    el.removeAttribute('min');
    expect(el.style.getPropertyValue('--dvfy-grid-min')).to.equal('');
  });
});
