import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-heading.js';

describe('dvfy-heading', () => {
  it('renders a real <h2> by default and keeps the text', async () => {
    const el = await fixture(html`<dvfy-heading>Cómo funciona</dvfy-heading>`);
    const h = el.firstElementChild;
    expect(h.tagName.toLowerCase()).to.equal('h2');
    expect(h.textContent).to.equal('Cómo funciona');
  });

  it('renders an <h1> for level=1 (SEO single-h1 target)', async () => {
    const el = await fixture(html`<dvfy-heading level="1">Title</dvfy-heading>`);
    expect(el.firstElementChild.tagName.toLowerCase()).to.equal('h1');
  });

  it('renders an <h3> for level=3', async () => {
    const el = await fixture(html`<dvfy-heading level="3">Sub</dvfy-heading>`);
    expect(el.firstElementChild.tagName.toLowerCase()).to.equal('h3');
  });

  it('falls back to <h2> for an invalid level', async () => {
    const el = await fixture(html`<dvfy-heading level="9">x</dvfy-heading>`);
    expect(el.firstElementChild.tagName.toLowerCase()).to.equal('h2');
  });

  it('produces exactly one semantic heading element (no double-wrap)', async () => {
    const el = await fixture(html`<dvfy-heading level="2">Once</dvfy-heading>`);
    expect(el.querySelectorAll('h1,h2,h3').length).to.equal(1);
  });
});
