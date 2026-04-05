import { fixture, html, expect } from '@open-wc/testing';
import './dvfy-tooltip.js';

describe('dvfy-tooltip', () => {
  describe('rendering', () => {
    it('renders with text attribute', async () => {
      const el = await fixture(html`<dvfy-tooltip text="Help"><button>Hover me</button></dvfy-tooltip>`);
      const tip = el.querySelector('.dvfy-tooltip__tip');
      expect(tip).to.exist;
      expect(tip.textContent).to.equal('Help');
    });

    it('is defined as a custom element', async () => {
      const el = await fixture(html`<dvfy-tooltip text="Test">Trigger</dvfy-tooltip>`);
      expect(customElements.get('dvfy-tooltip')).to.exist;
    });

    it('renders trigger content', async () => {
      const el = await fixture(html`<dvfy-tooltip text="Info"><span>Trigger</span></dvfy-tooltip>`);
      const span = el.querySelector('span');
      expect(span).to.exist;
      expect(span.textContent).to.equal('Trigger');
    });
  });

  describe('attributes', () => {
    it('updates tooltip text dynamically', async () => {
      const el = await fixture(html`<dvfy-tooltip text="Old"><button>Btn</button></dvfy-tooltip>`);
      el.setAttribute('text', 'New');
      const tip = el.querySelector('.dvfy-tooltip__tip');
      expect(tip.textContent).to.equal('New');
    });

    it('accepts position attribute', async () => {
      const el = await fixture(html`<dvfy-tooltip text="Tip" position="bottom"><button>Btn</button></dvfy-tooltip>`);
      expect(el.getAttribute('position')).to.equal('bottom');
    });

    it('accepts delay attribute', async () => {
      const el = await fixture(html`<dvfy-tooltip text="Tip" delay="500"><button>Btn</button></dvfy-tooltip>`);
      expect(el.getAttribute('delay')).to.equal('500');
    });
  });

  describe('visibility', () => {
    it('tooltip is hidden by default', async () => {
      const el = await fixture(html`<dvfy-tooltip text="Hidden"><button>Btn</button></dvfy-tooltip>`);
      const tip = el.querySelector('.dvfy-tooltip__tip');
      expect(tip.hasAttribute('data-visible')).to.be.false;
    });

    it('shows tooltip on focusin', async () => {
      const el = await fixture(html`<dvfy-tooltip text="Focus" delay="0"><button>Btn</button></dvfy-tooltip>`);
      const tip = el.querySelector('.dvfy-tooltip__tip');
      el.dispatchEvent(new Event('focusin', { bubbles: true }));
      // Wait for the 0ms delay setTimeout
      await new Promise(r => setTimeout(r, 10));
      expect(tip.hasAttribute('data-visible')).to.be.true;
    });

    it('hides tooltip on focusout', async () => {
      const el = await fixture(html`<dvfy-tooltip text="Focus" delay="0"><button>Btn</button></dvfy-tooltip>`);
      const tip = el.querySelector('.dvfy-tooltip__tip');
      el.dispatchEvent(new Event('focusin', { bubbles: true }));
      await new Promise(r => setTimeout(r, 10));
      el.dispatchEvent(new Event('focusout', { bubbles: true }));
      expect(tip.hasAttribute('data-visible')).to.be.false;
    });
  });

  describe('ARIA', () => {
    it('tip element has role=tooltip', async () => {
      const el = await fixture(html`<dvfy-tooltip text="Accessible"><button>Btn</button></dvfy-tooltip>`);
      const tip = el.querySelector('.dvfy-tooltip__tip');
      expect(tip.getAttribute('role')).to.equal('tooltip');
    });

    it('tip has a unique id', async () => {
      const el = await fixture(html`<dvfy-tooltip text="ID"><button>Btn</button></dvfy-tooltip>`);
      const tip = el.querySelector('.dvfy-tooltip__tip');
      expect(tip.id).to.match(/^dvfy-tip-/);
    });

    it('trigger element has aria-describedby pointing to tip', async () => {
      const el = await fixture(html`<dvfy-tooltip text="Described"><button>Btn</button></dvfy-tooltip>`);
      const trigger = el.querySelector('button');
      const tip = el.querySelector('.dvfy-tooltip__tip');
      expect(trigger.getAttribute('aria-describedby')).to.equal(tip.id);
    });
  });
});
