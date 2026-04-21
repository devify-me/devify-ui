import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-avatar.js';

describe('dvfy-avatar', () => {
  describe('rendering', () => {
    it('renders initials from name', async () => {
      const el = await fixture(html`<dvfy-avatar name="Jorge Garcia"></dvfy-avatar>`);
      const initials = el.querySelector('.dvfy-avatar__initials');
      expect(initials).to.not.be.null;
      expect(initials.textContent).to.equal('JG');
    });

    it('renders single initial for single-word name', async () => {
      const el = await fixture(html`<dvfy-avatar name="Jorge"></dvfy-avatar>`);
      const initials = el.querySelector('.dvfy-avatar__initials');
      expect(initials.textContent).to.equal('J');
    });

    it('renders ? when no name is provided', async () => {
      const el = await fixture(html`<dvfy-avatar></dvfy-avatar>`);
      const initials = el.querySelector('.dvfy-avatar__initials');
      expect(initials.textContent).to.equal('?');
    });

    it('renders image when src is provided', async () => {
      const el = await fixture(html`<dvfy-avatar src="https://picsum.photos/40" name="Test"></dvfy-avatar>`);
      const img = el.querySelector('.dvfy-avatar__img');
      expect(img).to.not.be.null;
      expect(img.alt).to.equal('Test');
    });

    it('renders visual wrapper', async () => {
      const el = await fixture(html`<dvfy-avatar name="AB"></dvfy-avatar>`);
      const visual = el.querySelector('.dvfy-avatar__visual');
      expect(visual).to.not.be.null;
    });
  });

  describe('attributes', () => {
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl']) {
      it(`accepts size="${size}"`, async () => {
        const el = await fixture(html`<dvfy-avatar size="${size}" name="A B"></dvfy-avatar>`);
        expect(el.getAttribute('size')).to.equal(size);
      });
    }

    it('updates initials when name changes', async () => {
      const el = await fixture(html`<dvfy-avatar name="Jane Doe"></dvfy-avatar>`);
      expect(el.querySelector('.dvfy-avatar__initials').textContent).to.equal('JD');
      el.setAttribute('name', 'Alice Bob');
      expect(el.querySelector('.dvfy-avatar__initials').textContent).to.equal('AB');
    });
  });

  describe('status indicator', () => {
    it('shows status dot when status is set', async () => {
      const el = await fixture(html`<dvfy-avatar name="A" status="online"></dvfy-avatar>`);
      const dot = el.querySelector('.dvfy-avatar__status');
      expect(dot).to.not.be.null;
      expect(dot.dataset.status).to.equal('online');
    });

    it('does not show status dot without status attr', async () => {
      const el = await fixture(html`<dvfy-avatar name="A"></dvfy-avatar>`);
      expect(el.querySelector('.dvfy-avatar__status')).to.be.null;
    });

    for (const status of ['online', 'offline', 'busy']) {
      it(`renders status="${status}" dot`, async () => {
        const el = await fixture(html`<dvfy-avatar name="A" status="${status}"></dvfy-avatar>`);
        const dot = el.querySelector('.dvfy-avatar__status');
        expect(dot.dataset.status).to.equal(status);
      });
    }
  });

  describe('label', () => {
    it('renders label when set', async () => {
      const el = await fixture(html`<dvfy-avatar name="A B" label="Alice Bob"></dvfy-avatar>`);
      const lbl = el.querySelector('.dvfy-avatar__label');
      expect(lbl).to.not.be.null;
      expect(lbl.textContent).to.equal('Alice Bob');
    });

    it('does not render label element without label attr', async () => {
      const el = await fixture(html`<dvfy-avatar name="A B"></dvfy-avatar>`);
      expect(el.querySelector('.dvfy-avatar__label')).to.be.null;
    });
  });

  describe('stability', () => {
    it('preserves visual element reference on size change', async () => {
      const el = await fixture(html`<dvfy-avatar name="A B" size="md"></dvfy-avatar>`);
      const visual = el.querySelector('.dvfy-avatar__visual');
      el.setAttribute('size', 'lg');
      expect(el.querySelector('.dvfy-avatar__visual')).to.equal(visual);
    });

    it('preserves initials element reference on name change', async () => {
      const el = await fixture(html`<dvfy-avatar name="Jane Doe"></dvfy-avatar>`);
      const initials = el.querySelector('.dvfy-avatar__initials');
      el.setAttribute('name', 'Alice Bob');
      expect(el.querySelector('.dvfy-avatar__initials')).to.equal(initials);
      expect(initials.textContent).to.equal('AB');
    });

    it('preserves visual element reference when adding status dot', async () => {
      const el = await fixture(html`<dvfy-avatar name="A"></dvfy-avatar>`);
      const visual = el.querySelector('.dvfy-avatar__visual');
      el.setAttribute('status', 'online');
      expect(el.querySelector('.dvfy-avatar__visual')).to.equal(visual);
      expect(el.querySelector('.dvfy-avatar__status').dataset.status).to.equal('online');
    });
  });

  describe('interactive mode', () => {
    it('sets role=button and tabindex=0 when interactive', async () => {
      const el = await fixture(html`<dvfy-avatar name="Test" interactive></dvfy-avatar>`);
      expect(el.getAttribute('role')).to.equal('button');
      expect(el.getAttribute('tabindex')).to.equal('0');
    });

    it('sets aria-label from name when interactive', async () => {
      const el = await fixture(html`<dvfy-avatar name="Jorge" interactive></dvfy-avatar>`);
      expect(el.getAttribute('aria-label')).to.equal('Jorge');
    });

    it('dispatches avatar-click on click', async () => {
      const el = await fixture(html`<dvfy-avatar name="Jorge" src="test.jpg" interactive></dvfy-avatar>`);
      setTimeout(() => el.click());
      const ev = await oneEvent(el, 'avatar-click');
      expect(ev.detail.name).to.equal('Jorge');
      expect(ev.detail.src).to.equal('test.jpg');
    });

    it('dispatches avatar-click on Enter key', async () => {
      const el = await fixture(html`<dvfy-avatar name="Jorge" interactive></dvfy-avatar>`);
      setTimeout(() => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
      const ev = await oneEvent(el, 'avatar-click');
      expect(ev.detail.name).to.equal('Jorge');
    });

    it('dispatches avatar-click on Space key', async () => {
      const el = await fixture(html`<dvfy-avatar name="Jorge" interactive></dvfy-avatar>`);
      setTimeout(() => el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })));
      const ev = await oneEvent(el, 'avatar-click');
      expect(ev.detail.name).to.equal('Jorge');
    });

    it('does not set role/tabindex without interactive', async () => {
      const el = await fixture(html`<dvfy-avatar name="Test"></dvfy-avatar>`);
      expect(el.hasAttribute('role')).to.be.false;
      expect(el.hasAttribute('tabindex')).to.be.false;
    });
  });
});

describe('dvfy-avatar-group', () => {
  describe('rendering', () => {
    it('renders child avatars', async () => {
      const el = await fixture(html`
        <dvfy-avatar-group>
          <dvfy-avatar name="A B"></dvfy-avatar>
          <dvfy-avatar name="C D"></dvfy-avatar>
        </dvfy-avatar-group>
      `);
      const avatars = el.querySelectorAll('dvfy-avatar');
      expect(avatars.length).to.equal(2);
    });
  });

  describe('max overflow', () => {
    it('shows overflow badge when avatars exceed max', async () => {
      const el = await fixture(html`
        <dvfy-avatar-group max="2">
          <dvfy-avatar name="A B"></dvfy-avatar>
          <dvfy-avatar name="C D"></dvfy-avatar>
          <dvfy-avatar name="E F"></dvfy-avatar>
          <dvfy-avatar name="G H"></dvfy-avatar>
        </dvfy-avatar-group>
      `);
      // Wait for rAF used in #arrange
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const overflow = el.querySelector('.dvfy-avatar-group__overflow');
      expect(overflow).to.not.be.null;
      expect(overflow.textContent).to.equal('+2');
    });

    it('hides excess avatars beyond max', async () => {
      const el = await fixture(html`
        <dvfy-avatar-group max="1">
          <dvfy-avatar name="A B"></dvfy-avatar>
          <dvfy-avatar name="C D"></dvfy-avatar>
          <dvfy-avatar name="E F"></dvfy-avatar>
        </dvfy-avatar-group>
      `);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const avatars = el.querySelectorAll('dvfy-avatar');
      expect(avatars[0].style.display).to.equal('');
      expect(avatars[1].style.display).to.equal('none');
      expect(avatars[2].style.display).to.equal('none');
    });

    it('shows all avatars when count is within max', async () => {
      const el = await fixture(html`
        <dvfy-avatar-group max="5">
          <dvfy-avatar name="A B"></dvfy-avatar>
          <dvfy-avatar name="C D"></dvfy-avatar>
        </dvfy-avatar-group>
      `);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      expect(el.querySelector('.dvfy-avatar-group__overflow')).to.be.null;
    });
  });
});
