import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-component-playground.js';

// web-test-runner serves files from the project root, so an absolute path
// resolves the manifest reliably across nested URLs.
const MANIFEST = '/custom-elements.json';

describe('dvfy-component-playground — self-demo', () => {
  it('renders an inner playground for dvfy-button when navigated to itself', async () => {
    const el = await fixture(html`
      <dvfy-component-playground component="dvfy-component-playground" manifest="${MANIFEST}"></dvfy-component-playground>
    `);
    // Manifest load + #build + #selectComponent + #updatePreview are async
    await new Promise(r => setTimeout(r, 300));

    const area = el.querySelector('[data-sc-preview]');
    expect(area, 'preview area should exist').to.exist;
    const inner = area.querySelector('dvfy-component-playground');
    expect(inner, 'inner playground should be rendered in preview').to.exist;
    expect(inner.getAttribute('component')).to.equal('dvfy-button');
    expect(inner.hasAttribute('inner')).to.be.true;
  });

  it('does NOT recurse: inner instance renders a real dvfy-button, not another playground', async () => {
    const el = await fixture(html`
      <dvfy-component-playground component="dvfy-component-playground" manifest="${MANIFEST}"></dvfy-component-playground>
    `);
    await new Promise(r => setTimeout(r, 600));

    const inner = el.querySelector('[data-sc-preview] dvfy-component-playground');
    expect(inner).to.exist;
    // The inner playground's own preview area should contain a real dvfy-button,
    // not yet another playground.
    const innerArea = inner.querySelector('[data-sc-preview]');
    expect(innerArea, 'inner playground should build its own preview area').to.exist;
    expect(innerArea.querySelector('dvfy-button')).to.exist;
    expect(innerArea.querySelector('dvfy-component-playground')).to.be.null;
  });

  it('renders normal preview for a non-self component', async () => {
    const el = await fixture(html`
      <dvfy-component-playground component="dvfy-button" manifest="${MANIFEST}"></dvfy-component-playground>
    `);
    await new Promise(r => setTimeout(r, 300));

    const area = el.querySelector('[data-sc-preview]');
    expect(area, 'preview area should exist').to.exist;
    expect(area.querySelector('dvfy-button'), 'preview should contain dvfy-button').to.exist;
    expect(area.querySelector('dvfy-component-playground'), 'preview should NOT contain inner playground').to.be.null;
  });
});
