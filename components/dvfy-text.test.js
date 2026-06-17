import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-text.js';

describe('dvfy-text', () => {
  it('renders a real <p> by default and keeps the text', async () => {
    const el = await fixture(html`<dvfy-text>Chollo Score público</dvfy-text>`);
    const p = el.firstElementChild;
    expect(p.tagName.toLowerCase()).to.equal('p');
    expect(p.textContent).to.equal('Chollo Score público');
  });

  it('renders a <span> when inline is set', async () => {
    const el = await fixture(html`<dvfy-text inline>x</dvfy-text>`);
    expect(el.firstElementChild.tagName.toLowerCase()).to.equal('span');
  });

  it('accepts size and tone attributes', async () => {
    const el = await fixture(html`<dvfy-text size="sm" tone="muted">x</dvfy-text>`);
    expect(el.getAttribute('size')).to.equal('sm');
    expect(el.getAttribute('tone')).to.equal('muted');
  });

  it('produces exactly one wrapping element (no double-wrap)', async () => {
    const el = await fixture(html`<dvfy-text>Once</dvfy-text>`);
    expect(el.querySelectorAll('p,span').length).to.equal(1);
  });
});
