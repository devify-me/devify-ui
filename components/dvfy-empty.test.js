import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-empty.js';

describe('dvfy-empty', () => {
  describe('rendering', () => {
    it('renders with all attributes', async () => {
      const el = await fixture(html`
        <dvfy-empty title="No results" description="Try again" icon="X"></dvfy-empty>
      `);
      expect(el.querySelector('.dvfy-empty__title').textContent).to.equal('No results');
      expect(el.querySelector('.dvfy-empty__desc').textContent).to.equal('Try again');
      expect(el.querySelector('.dvfy-empty__icon').textContent).to.equal('X');
    });

    it('renders with no attributes', async () => {
      const el = await fixture(html`<dvfy-empty></dvfy-empty>`);
      expect(el.querySelector('.dvfy-empty__title')).to.be.null;
      expect(el.querySelector('.dvfy-empty__desc')).to.be.null;
      expect(el.querySelector('.dvfy-empty__icon')).to.be.null;
    });
  });

  describe('attributes', () => {
    it('renders title when set', async () => {
      const el = await fixture(html`<dvfy-empty title="Empty state"></dvfy-empty>`);
      const title = el.querySelector('.dvfy-empty__title');
      expect(title).to.not.be.null;
      expect(title.textContent).to.equal('Empty state');
    });

    it('renders description when set', async () => {
      const el = await fixture(html`<dvfy-empty description="Nothing here"></dvfy-empty>`);
      const desc = el.querySelector('.dvfy-empty__desc');
      expect(desc).to.not.be.null;
      expect(desc.textContent).to.equal('Nothing here');
    });

    it('renders icon when set', async () => {
      const el = await fixture(html`<dvfy-empty icon="!"></dvfy-empty>`);
      const icon = el.querySelector('.dvfy-empty__icon');
      expect(icon).to.not.be.null;
      expect(icon.textContent).to.equal('!');
      expect(icon.getAttribute('aria-hidden')).to.equal('true');
    });

    it('updates title when changed dynamically', async () => {
      const el = await fixture(html`<dvfy-empty title="Old"></dvfy-empty>`);
      el.setAttribute('title', 'New');
      expect(el.querySelector('.dvfy-empty__title').textContent).to.equal('New');
    });

    it('updates description when changed dynamically', async () => {
      const el = await fixture(html`<dvfy-empty description="Old"></dvfy-empty>`);
      el.setAttribute('description', 'New');
      expect(el.querySelector('.dvfy-empty__desc').textContent).to.equal('New');
    });
  });

  describe('action slot', () => {
    it('preserves child elements in actions area', async () => {
      const el = await fixture(html`
        <dvfy-empty title="Empty">
          <button>Retry</button>
        </dvfy-empty>
      `);
      const actions = el.querySelector('.dvfy-empty__actions');
      expect(actions).to.not.be.null;
      expect(actions.querySelector('button')).to.not.be.null;
      expect(actions.querySelector('button').textContent).to.equal('Retry');
    });

    it('does not render actions wrapper without children', async () => {
      const el = await fixture(html`<dvfy-empty title="Empty"></dvfy-empty>`);
      expect(el.querySelector('.dvfy-empty__actions')).to.be.null;
    });
  });

  describe('ARIA', () => {
    it('sets role="status"', async () => {
      const el = await fixture(html`<dvfy-empty title="Empty"></dvfy-empty>`);
      expect(el.getAttribute('role')).to.equal('status');
    });
  });
});
