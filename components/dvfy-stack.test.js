import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-stack.js';

describe('dvfy-stack', () => {
  it('renders slotted children', async () => {
    const el = await fixture(html`
      <dvfy-stack><span>a</span><span>b</span></dvfy-stack>
    `);
    expect(el.children.length).to.equal(2);
  });

  it('uses display:flex, column by default', async () => {
    const el = await fixture(html`<dvfy-stack><span>a</span></dvfy-stack>`);
    const cs = getComputedStyle(el);
    expect(cs.display).to.equal('flex');
    expect(cs.flexDirection).to.equal('column');
  });

  it('switches to row direction', async () => {
    const el = await fixture(html`<dvfy-stack direction="row"><span>a</span></dvfy-stack>`);
    expect(getComputedStyle(el).flexDirection).to.equal('row');
  });

  it('applies justify and align', async () => {
    const el = await fixture(html`
      <dvfy-stack justify="center" align="center"><span>a</span></dvfy-stack>
    `);
    const cs = getComputedStyle(el);
    expect(cs.justifyContent).to.equal('center');
    expect(cs.alignItems).to.equal('center');
  });
});
