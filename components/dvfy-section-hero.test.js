import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-section-hero.js';
import './dvfy-carousel.js';

describe('dvfy-section-hero', () => {
  describe('rendering (text-centric, no media)', () => {
    it('renders slotted heading + body content', async () => {
      const el = await fixture(html`
        <dvfy-section-hero>
          <h1>Ship faster.</h1>
          <p>Production-ready UI in one line of HTML.</p>
        </dvfy-section-hero>
      `);
      expect(el.querySelector('h1').textContent).to.equal('Ship faster.');
      expect(el.querySelector('p').textContent).to.equal('Production-ready UI in one line of HTML.');
    });

    it('renders the trust slot', async () => {
      const el = await fixture(html`
        <dvfy-section-hero>
          <h1>Title</h1>
          <div slot="trust">Trusted by 1,000+ teams</div>
        </dvfy-section-hero>
      `);
      expect(el.querySelector('[slot="trust"]').textContent).to.equal('Trusted by 1,000+ teams');
    });
  });

  describe('attributes', () => {
    it('accepts align attribute', async () => {
      const el = await fixture(html`<dvfy-section-hero align="left"><h1>T</h1></dvfy-section-hero>`);
      expect(getComputedStyle(el).textAlign).to.equal('left');
    });

    it('defaults to centered text', async () => {
      const el = await fixture(html`<dvfy-section-hero><h1>T</h1></dvfy-section-hero>`);
      expect(getComputedStyle(el).textAlign).to.equal('center');
    });

    it('accepts padding + tone attributes without error', async () => {
      const el = await fixture(html`<dvfy-section-hero padding="lg" tone="brand"><h1>T</h1></dvfy-section-hero>`);
      expect(el.getAttribute('padding')).to.equal('lg');
      expect(el.getAttribute('tone')).to.equal('brand');
    });
  });

  describe('regression — no-media hero is unchanged', () => {
    it('does NOT introduce a media wrapper or grid layout when no media slot is present', async () => {
      const el = await fixture(html`
        <dvfy-section-hero>
          <h1>Ship faster.</h1>
          <p>Body.</p>
        </dvfy-section-hero>
      `);
      // No media slot → no two-column grid; host stays block, content rail centered.
      expect(getComputedStyle(el).display).to.equal('block');
      expect(el.querySelector('[slot="media"]')).to.equal(null);
      // Direct children remain the authored content, not an injected wrapper.
      const kids = Array.from(el.children).map(c => c.tagName.toLowerCase());
      expect(kids).to.deep.equal(['h1', 'p']);
    });
  });

  describe('media slot', () => {
    it('renders an <img> placed in the media slot', async () => {
      const el = await fixture(html`
        <dvfy-section-hero media-position="right">
          <h1>Title</h1>
          <p>Body</p>
          <img slot="media" src="/hero.jpg" alt="Hero" />
        </dvfy-section-hero>
      `);
      const media = el.querySelector('[slot="media"]');
      expect(media).to.exist;
      expect(media.tagName.toLowerCase()).to.equal('img');
      expect(media.getAttribute('alt')).to.equal('Hero');
    });

    it('renders a <dvfy-carousel> placed in the media slot', async () => {
      const el = await fixture(html`
        <dvfy-section-hero media-position="left">
          <h1>Title</h1>
          <dvfy-carousel slot="media" images='["/a.jpg","/b.jpg"]'></dvfy-carousel>
        </dvfy-section-hero>
      `);
      const media = el.querySelector('dvfy-carousel[slot="media"]');
      expect(media).to.exist;
      expect(media.tagName.toLowerCase()).to.equal('dvfy-carousel');
    });

    it('injects a two-cell grid (content + media) when media is present', async () => {
      const el = await fixture(html`
        <dvfy-section-hero media-position="right">
          <h1>Title</h1>
          <p>Body</p>
          <img slot="media" src="/hero.jpg" alt="Hero" />
        </dvfy-section-hero>
      `);
      const grid = el.querySelector(':scope > .dvfy-hero-grid');
      expect(grid).to.exist;
      expect(getComputedStyle(grid).display).to.equal('grid');
      // Content children collected into the content cell; media is the sibling cell.
      const content = grid.querySelector(':scope > .dvfy-hero-content');
      expect(content.querySelector('h1')).to.exist;
      expect(content.querySelector('p')).to.exist;
      expect(grid.querySelector(':scope > [slot="media"]')).to.exist;
    });

    it('renders two grid columns at full container width (>=48rem)', async () => {
      const el = await fixture(html`
        <div style="width: 60rem;">
          <dvfy-section-hero media-position="right">
            <h1>Title</h1>
            <img slot="media" src="/hero.jpg" alt="Hero" />
          </dvfy-section-hero>
        </div>
      `);
      const grid = el.querySelector('.dvfy-hero-grid');
      expect(getComputedStyle(grid).gridTemplateColumns.split(' ').length).to.equal(2);
    });

    it('collapses media layout to a single column below the 48rem container breakpoint', async () => {
      const el = await fixture(html`
        <div style="width: 30rem;">
          <dvfy-section-hero media-position="right">
            <h1>Title</h1>
            <img slot="media" src="/hero.jpg" alt="Hero" />
          </dvfy-section-hero>
        </div>
      `);
      const grid = el.querySelector('.dvfy-hero-grid');
      // Below breakpoint → single track (stacked).
      expect(getComputedStyle(grid).gridTemplateColumns.split(' ').length).to.equal(1);
    });

    it('orders media before content for media-position="left" at wide widths', async () => {
      const el = await fixture(html`
        <div style="width: 60rem;">
          <dvfy-section-hero media-position="left">
            <h1>Title</h1>
            <img slot="media" src="/hero.jpg" alt="Hero" />
          </dvfy-section-hero>
        </div>
      `);
      const hero = el.querySelector('dvfy-section-hero');
      const media = hero.querySelector('[slot="media"]');
      // media-position=left → media column rendered first (order < content order).
      expect(getComputedStyle(media).order).to.equal('-1');
    });

    it('does NOT pull media first for media-position="right"', async () => {
      const el = await fixture(html`
        <dvfy-section-hero media-position="right">
          <h1>Title</h1>
          <img slot="media" src="/hero.jpg" alt="Hero" />
        </dvfy-section-hero>
      `);
      const media = el.querySelector('[slot="media"]');
      expect(getComputedStyle(media).order).to.equal('0');
    });

    it('mirrors the aspect-ratio attribute into --dvfy-hero-media-aspect', async () => {
      const el = await fixture(html`
        <dvfy-section-hero media-position="right" aspect-ratio="16 / 9">
          <h1>Title</h1>
          <img slot="media" src="/hero.jpg" alt="Hero" />
        </dvfy-section-hero>
      `);
      expect(el.style.getPropertyValue('--dvfy-hero-media-aspect').trim()).to.equal('16 / 9');
    });

    it('updates the mirrored aspect-ratio when the attribute changes', async () => {
      const el = await fixture(html`
        <dvfy-section-hero media-position="right" aspect-ratio="16 / 9">
          <h1>Title</h1>
          <img slot="media" src="/hero.jpg" alt="Hero" />
        </dvfy-section-hero>
      `);
      el.setAttribute('aspect-ratio', '4 / 3');
      expect(el.style.getPropertyValue('--dvfy-hero-media-aspect').trim()).to.equal('4 / 3');
    });

    it('clears the mirrored aspect-ratio when the attribute is removed', async () => {
      const el = await fixture(html`
        <dvfy-section-hero media-position="right" aspect-ratio="16 / 9">
          <h1>Title</h1>
          <img slot="media" src="/hero.jpg" alt="Hero" />
        </dvfy-section-hero>
      `);
      el.removeAttribute('aspect-ratio');
      expect(el.style.getPropertyValue('--dvfy-hero-media-aspect')).to.equal('');
    });
  });
});
