import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-file-upload.js';

/**
 * Helper to create a mock File object.
 */
function createFile(name, size, type) {
  const content = new Uint8Array(size);
  return new File([content], name, { type });
}

describe('dvfy-file-upload', () => {
  describe('rendering', () => {
    it('renders drop zone', async () => {
      const el = await fixture(html`<dvfy-file-upload></dvfy-file-upload>`);
      expect(el.querySelector('.dvfy-fu__zone')).to.exist;
    });

    it('renders with idle state by default', async () => {
      const el = await fixture(html`<dvfy-file-upload></dvfy-file-upload>`);
      expect(el.getAttribute('state')).to.equal('idle');
    });

    it('renders heading and browse text', async () => {
      const el = await fixture(html`<dvfy-file-upload></dvfy-file-upload>`);
      expect(el.querySelector('.dvfy-fu__heading')).to.exist;
      expect(el.querySelector('.dvfy-fu__browse')).to.exist;
    });

    it('renders subtext with accept info', async () => {
      const el = await fixture(html`<dvfy-file-upload accept="image/*" max-size="5"></dvfy-file-upload>`);
      const sub = el.querySelector('.dvfy-fu__sub');
      expect(sub.textContent).to.include('image');
      expect(sub.textContent).to.include('5');
    });

    it('renders subtext with default when no constraints', async () => {
      const el = await fixture(html`<dvfy-file-upload></dvfy-file-upload>`);
      const sub = el.querySelector('.dvfy-fu__sub');
      expect(sub.textContent).to.include('Any file type');
    });

    it('renders hidden file input', async () => {
      const el = await fixture(html`<dvfy-file-upload></dvfy-file-upload>`);
      const input = el.querySelector('.dvfy-fu__input');
      expect(input).to.exist;
      expect(input.type).to.equal('file');
    });

    it('sets multiple on input when attribute present', async () => {
      const el = await fixture(html`<dvfy-file-upload multiple></dvfy-file-upload>`);
      const input = el.querySelector('.dvfy-fu__input');
      expect(input.multiple).to.be.true;
    });

    it('sets accept on input from attribute', async () => {
      const el = await fixture(html`<dvfy-file-upload accept=".pdf,.doc"></dvfy-file-upload>`);
      const input = el.querySelector('.dvfy-fu__input');
      expect(input.accept).to.equal('.pdf,.doc');
    });

    it('renders progress bar elements', async () => {
      const el = await fixture(html`<dvfy-file-upload></dvfy-file-upload>`);
      expect(el.querySelector('.dvfy-fu__progress')).to.exist;
      expect(el.querySelector('.dvfy-fu__progress-fill')).to.exist;
    });

    it('renders file list container', async () => {
      const el = await fixture(html`<dvfy-file-upload></dvfy-file-upload>`);
      expect(el.querySelector('.dvfy-fu__list')).to.exist;
    });
  });

  describe('accessibility', () => {
    it('zone has role=button and tabindex', async () => {
      const el = await fixture(html`<dvfy-file-upload></dvfy-file-upload>`);
      const zone = el.querySelector('.dvfy-fu__zone');
      expect(zone.getAttribute('role')).to.equal('button');
      expect(zone.getAttribute('tabindex')).to.equal('0');
    });

    it('zone has aria-label', async () => {
      const el = await fixture(html`<dvfy-file-upload></dvfy-file-upload>`);
      const zone = el.querySelector('.dvfy-fu__zone');
      expect(zone.getAttribute('aria-label')).to.exist;
    });

    it('custom label overrides default aria-label', async () => {
      const el = await fixture(html`<dvfy-file-upload label="Upload your photo"></dvfy-file-upload>`);
      const zone = el.querySelector('.dvfy-fu__zone');
      expect(zone.getAttribute('aria-label')).to.equal('Upload your photo');
    });

    it('disabled zone has aria-disabled and tabindex -1', async () => {
      const el = await fixture(html`<dvfy-file-upload disabled></dvfy-file-upload>`);
      const zone = el.querySelector('.dvfy-fu__zone');
      expect(zone.getAttribute('aria-disabled')).to.equal('true');
      expect(zone.getAttribute('tabindex')).to.equal('-1');
    });

    it('file list has aria-label', async () => {
      const el = await fixture(html`<dvfy-file-upload></dvfy-file-upload>`);
      const list = el.querySelector('.dvfy-fu__list');
      expect(list.getAttribute('aria-label')).to.equal('Selected files');
    });
  });

  describe('attribute reactivity', () => {
    it('updates progress bar on progress change', async () => {
      const el = await fixture(html`<dvfy-file-upload state="uploading" progress="0"></dvfy-file-upload>`);
      el.setAttribute('progress', '50');
      const fill = el.querySelector('.dvfy-fu__progress-fill');
      expect(fill.style.width).to.equal('50%');
    });

    it('clamps progress between 0 and 100', async () => {
      const el = await fixture(html`<dvfy-file-upload state="uploading" progress="0"></dvfy-file-upload>`);
      el.setAttribute('progress', '150');
      const fill = el.querySelector('.dvfy-fu__progress-fill');
      expect(fill.style.width).to.equal('100%');
    });

    it('setProgress method works', async () => {
      const el = await fixture(html`<dvfy-file-upload state="uploading"></dvfy-file-upload>`);
      el.setProgress(75);
      expect(el.getAttribute('progress')).to.equal('75');
    });

    it('updates accept on input dynamically', async () => {
      const el = await fixture(html`<dvfy-file-upload></dvfy-file-upload>`);
      el.setAttribute('accept', 'image/*');
      const input = el.querySelector('.dvfy-fu__input');
      expect(input.accept).to.equal('image/*');
    });

    it('updates multiple on input dynamically', async () => {
      const el = await fixture(html`<dvfy-file-upload></dvfy-file-upload>`);
      el.setAttribute('multiple', '');
      const input = el.querySelector('.dvfy-fu__input');
      expect(input.multiple).to.be.true;
    });
  });

  describe('drag and drop', () => {
    it('sets dragover state on dragenter', async () => {
      const el = await fixture(html`<dvfy-file-upload></dvfy-file-upload>`);
      const zone = el.querySelector('.dvfy-fu__zone');
      zone.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
      expect(el.getAttribute('state')).to.equal('dragover');
    });

    it('resets to idle on dragleave', async () => {
      const el = await fixture(html`<dvfy-file-upload></dvfy-file-upload>`);
      const zone = el.querySelector('.dvfy-fu__zone');
      zone.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
      zone.dispatchEvent(new DragEvent('dragleave', { bubbles: true, relatedTarget: document.body }));
      expect(el.getAttribute('state')).to.equal('idle');
    });

    it('does not enter dragover when disabled', async () => {
      const el = await fixture(html`<dvfy-file-upload disabled></dvfy-file-upload>`);
      const zone = el.querySelector('.dvfy-fu__zone');
      zone.dispatchEvent(new DragEvent('dragenter', { bubbles: true }));
      expect(el.getAttribute('state')).to.equal('idle');
    });
  });

  describe('keyboard interaction', () => {
    it('activates file input on Enter', async () => {
      const el = await fixture(html`<dvfy-file-upload></dvfy-file-upload>`);
      const zone = el.querySelector('.dvfy-fu__zone');
      let clicked = false;
      const input = el.querySelector('.dvfy-fu__input');
      const origClick = input.click.bind(input);
      input.click = () => { clicked = true; origClick(); };
      zone.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(clicked).to.be.true;
    });

    it('activates file input on Space', async () => {
      const el = await fixture(html`<dvfy-file-upload></dvfy-file-upload>`);
      const zone = el.querySelector('.dvfy-fu__zone');
      let clicked = false;
      const input = el.querySelector('.dvfy-fu__input');
      const origClick = input.click.bind(input);
      input.click = () => { clicked = true; origClick(); };
      zone.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(clicked).to.be.true;
    });
  });

  describe('public API', () => {
    it('files property returns empty array initially', async () => {
      const el = await fixture(html`<dvfy-file-upload></dvfy-file-upload>`);
      expect(el.files).to.deep.equal([]);
    });

    it('reset clears files and state', async () => {
      const el = await fixture(html`<dvfy-file-upload state="success"></dvfy-file-upload>`);
      el.reset();
      expect(el.files).to.deep.equal([]);
      expect(el.getAttribute('state')).to.equal('idle');
    });
  });

  describe('state variations', () => {
    it('accepts state=uploading', async () => {
      const el = await fixture(html`<dvfy-file-upload state="uploading" progress="30"></dvfy-file-upload>`);
      expect(el.getAttribute('state')).to.equal('uploading');
    });

    it('accepts state=success', async () => {
      const el = await fixture(html`<dvfy-file-upload state="success"></dvfy-file-upload>`);
      expect(el.getAttribute('state')).to.equal('success');
    });

    it('accepts state=error', async () => {
      const el = await fixture(html`<dvfy-file-upload state="error"></dvfy-file-upload>`);
      expect(el.getAttribute('state')).to.equal('error');
    });
  });
});
