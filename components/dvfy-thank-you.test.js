import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-thank-you.js';

describe('dvfy-thank-you', () => {
  it('is defined as a custom element', () => {
    expect(customElements.get('dvfy-thank-you')).to.exist;
  });

  describe('rendering', () => {
    it('renders the default heading when none is set', async () => {
      const el = await fixture(html`<dvfy-thank-you></dvfy-thank-you>`);
      expect(el.querySelector('.dvfy-thank-you__heading').textContent).to.equal("You're in.");
    });

    it('renders a custom heading and subhead', async () => {
      const el = await fixture(html`
        <dvfy-thank-you heading="Check your inbox" subhead="Your guide is on the way."></dvfy-thank-you>
      `);
      expect(el.querySelector('.dvfy-thank-you__heading').textContent).to.equal('Check your inbox');
      expect(el.querySelector('.dvfy-thank-you__subhead').textContent).to.equal('Your guide is on the way.');
    });

    it('omits the subhead when not set', async () => {
      const el = await fixture(html`<dvfy-thank-you></dvfy-thank-you>`);
      expect(el.querySelector('.dvfy-thank-you__subhead')).to.not.exist;
    });

    it('renders a note when set', async () => {
      const el = await fixture(html`<dvfy-thank-you note="Not there? Check spam."></dvfy-thank-you>`);
      expect(el.querySelector('.dvfy-thank-you__note').textContent).to.equal('Not there? Check spam.');
    });
  });

  describe('avatar', () => {
    it('renders a dvfy-avatar with src + alt when avatar is set', async () => {
      const el = await fixture(html`
        <dvfy-thank-you avatar="/team/ana.jpg" avatar-alt="Ana, your advisor"></dvfy-thank-you>
      `);
      const av = el.querySelector('.dvfy-thank-you__avatar');
      expect(av).to.exist;
      expect(av.tagName.toLowerCase()).to.equal('dvfy-avatar');
      expect(av.getAttribute('src')).to.include('/team/ana.jpg');
      expect(av.getAttribute('name')).to.equal('Ana, your advisor');
    });

    it('omits the avatar when not set', async () => {
      const el = await fixture(html`<dvfy-thank-you></dvfy-thank-you>`);
      expect(el.querySelector('.dvfy-thank-you__avatar')).to.not.exist;
    });
  });

  describe('CTA (scheduler-ready slot)', () => {
    it('omits the CTA when cta is not set', async () => {
      const el = await fixture(html`<dvfy-thank-you></dvfy-thank-you>`);
      expect(el.querySelector('.dvfy-thank-you__cta')).to.not.exist;
    });

    it('renders a CTA button that links to cta-href', async () => {
      const el = await fixture(html`
        <dvfy-thank-you cta="Book a call" cta-href="/schedule"></dvfy-thank-you>
      `);
      const cta = el.querySelector('.dvfy-thank-you__cta');
      expect(cta).to.exist;
      expect(cta.textContent).to.equal('Book a call');
      expect(cta.getAttribute('href')).to.equal('/schedule');
    });

    it('renders a CTA without href when cta-href is absent', async () => {
      const el = await fixture(html`<dvfy-thank-you cta="Continue"></dvfy-thank-you>`);
      const cta = el.querySelector('.dvfy-thank-you__cta');
      expect(cta).to.exist;
      expect(cta.hasAttribute('href')).to.be.false;
    });

    it('sanitizes a hostile cta-href down to "#"', async () => {
      const el = await fixture(html`
        <dvfy-thank-you cta="Go" cta-href="javascript:alert(1)"></dvfy-thank-you>
      `);
      expect(el.querySelector('.dvfy-thank-you__cta').getAttribute('href')).to.equal('#');
    });
  });

  describe('default slot (scheduler-ready)', () => {
    it('preserves authored default-slot content in a slot wrapper', async () => {
      const el = await fixture(html`
        <dvfy-thank-you subhead="Next step">
          <div class="embed">SCHEDULER HERE</div>
        </dvfy-thank-you>
      `);
      const slot = el.querySelector('.dvfy-thank-you__slot');
      expect(slot).to.exist;
      expect(slot.querySelector('.embed')).to.exist;
      expect(slot.textContent).to.contain('SCHEDULER HERE');
    });

    it('preserves slot content across a re-render (attribute change)', async () => {
      const el = await fixture(html`
        <dvfy-thank-you><div class="embed">KEEP ME</div></dvfy-thank-you>
      `);
      el.setAttribute('heading', 'Updated');
      await Promise.resolve();
      expect(el.querySelector('.dvfy-thank-you__heading').textContent).to.equal('Updated');
      expect(el.querySelector('.dvfy-thank-you__slot .embed')).to.exist;
      expect(el.querySelectorAll('.embed').length).to.equal(1);
    });
  });
});
