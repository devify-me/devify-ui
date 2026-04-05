import { fixture, html, expect, oneEvent } from '@open-wc/testing';
import './dvfy-tree-view.js';

describe('dvfy-tree-view', () => {
  describe('rendering', () => {
    it('renders with default attributes', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Root">
            <dvfy-tree-node label="Child" href="#child"></dvfy-tree-node>
          </dvfy-tree-node>
        </dvfy-tree-view>
      `);
      expect(el.getAttribute('role')).to.equal('tree');
      expect(el.getAttribute('tabindex')).to.equal('0');
    });

    it('renders branch nodes with chevron', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Branch">
            <dvfy-tree-node label="Leaf" href="#leaf"></dvfy-tree-node>
          </dvfy-tree-node>
        </dvfy-tree-view>
      `);
      const branch = el.querySelector('dvfy-tree-node');
      const chevron = branch.querySelector('.dvfy-tree__chevron');
      expect(chevron).to.exist;
    });

    it('renders leaf nodes with spacer instead of chevron', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Leaf" href="#leaf"></dvfy-tree-node>
        </dvfy-tree-view>
      `);
      const node = el.querySelector('dvfy-tree-node');
      const spacer = node.querySelector('.dvfy-tree__chevron-spacer');
      expect(spacer).to.exist;
    });

    it('renders node labels', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="My Node" href="#test"></dvfy-tree-node>
        </dvfy-tree-view>
      `);
      const label = el.querySelector('.dvfy-tree__label');
      expect(label.textContent).to.equal('My Node');
    });

    it('renders node icon when set', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Colors" icon="🎨" href="#colors"></dvfy-tree-node>
        </dvfy-tree-view>
      `);
      const icon = el.querySelector('.dvfy-tree__icon');
      expect(icon).to.exist;
      expect(icon.textContent).to.equal('🎨');
    });
  });

  describe('expand/collapse', () => {
    it('starts collapsed by default', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Branch">
            <dvfy-tree-node label="Child" href="#child"></dvfy-tree-node>
          </dvfy-tree-node>
        </dvfy-tree-view>
      `);
      const branch = el.querySelector('dvfy-tree-node');
      expect(branch.hasAttribute('expanded')).to.be.false;
      const children = branch.querySelector('.dvfy-tree__children');
      expect(children.hasAttribute('data-collapsed')).to.be.true;
    });

    it('starts expanded when expanded attribute is set', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Branch" expanded>
            <dvfy-tree-node label="Child" href="#child"></dvfy-tree-node>
          </dvfy-tree-node>
        </dvfy-tree-view>
      `);
      const branch = el.querySelector('dvfy-tree-node');
      expect(branch.hasAttribute('expanded')).to.be.true;
      const children = branch.querySelector('.dvfy-tree__children');
      expect(children.hasAttribute('data-collapsed')).to.be.false;
    });

    it('toggles expanded state on click', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Branch">
            <dvfy-tree-node label="Child" href="#child"></dvfy-tree-node>
          </dvfy-tree-node>
        </dvfy-tree-view>
      `);
      const branch = el.querySelector('dvfy-tree-node');
      const row = branch.querySelector('.dvfy-tree__row');
      row.click();
      expect(branch.hasAttribute('expanded')).to.be.true;
      row.click();
      expect(branch.hasAttribute('expanded')).to.be.false;
    });
  });

  describe('selection', () => {
    it('selects leaf node on click', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Leaf" href="#leaf"></dvfy-tree-node>
        </dvfy-tree-view>
      `);
      // Wait for cache to build
      await new Promise(r => requestAnimationFrame(r));
      const node = el.querySelector('dvfy-tree-node');
      const row = node.querySelector('.dvfy-tree__row');
      setTimeout(() => row.click());
      const event = await oneEvent(el, 'select');
      expect(event.detail.href).to.equal('#leaf');
      expect(event.detail.label).to.equal('Leaf');
      expect(node.hasAttribute('selected')).to.be.true;
    });

    it('clears previous selection on new select', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="A" href="#a"></dvfy-tree-node>
          <dvfy-tree-node label="B" href="#b"></dvfy-tree-node>
        </dvfy-tree-view>
      `);
      await new Promise(r => requestAnimationFrame(r));
      const [a, b] = el.querySelectorAll('dvfy-tree-node');
      a.querySelector('.dvfy-tree__row').click();
      expect(a.hasAttribute('selected')).to.be.true;
      b.querySelector('.dvfy-tree__row').click();
      expect(a.hasAttribute('selected')).to.be.false;
      expect(b.hasAttribute('selected')).to.be.true;
    });
  });

  describe('selectByHref', () => {
    it('selects node by href', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Branch">
            <dvfy-tree-node label="Child" href="#child"></dvfy-tree-node>
          </dvfy-tree-node>
        </dvfy-tree-view>
      `);
      await new Promise(r => requestAnimationFrame(r));
      el.selectByHref('#child');
      const child = el.querySelector('[href="#child"]');
      expect(child.hasAttribute('selected')).to.be.true;
    });

    it('expands parent nodes when selecting deep node', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Branch">
            <dvfy-tree-node label="Child" href="#child"></dvfy-tree-node>
          </dvfy-tree-node>
        </dvfy-tree-view>
      `);
      await new Promise(r => requestAnimationFrame(r));
      el.selectByHref('#child');
      const branch = el.querySelector('dvfy-tree-node');
      expect(branch.hasAttribute('expanded')).to.be.true;
    });

    it('clears selection when called with empty href', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Leaf" href="#leaf"></dvfy-tree-node>
        </dvfy-tree-view>
      `);
      await new Promise(r => requestAnimationFrame(r));
      el.selectByHref('#leaf');
      el.selectByHref('');
      const node = el.querySelector('dvfy-tree-node');
      expect(node.hasAttribute('selected')).to.be.false;
    });
  });

  describe('filter', () => {
    it('hides non-matching nodes', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Colors" href="#colors"></dvfy-tree-node>
          <dvfy-tree-node label="Typography" href="#typo"></dvfy-tree-node>
        </dvfy-tree-view>
      `);
      await new Promise(r => requestAnimationFrame(r));
      el.filter('color');
      const colors = el.querySelector('[label="Colors"]');
      const typo = el.querySelector('[label="Typography"]');
      expect(colors.hasAttribute('data-hidden')).to.be.false;
      expect(typo.hasAttribute('data-hidden')).to.be.true;
    });

    it('clears filter restores all nodes', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Colors" href="#colors"></dvfy-tree-node>
          <dvfy-tree-node label="Typography" href="#typo"></dvfy-tree-node>
        </dvfy-tree-view>
      `);
      await new Promise(r => requestAnimationFrame(r));
      el.filter('color');
      el.clearFilter();
      const typo = el.querySelector('[label="Typography"]');
      expect(typo.hasAttribute('data-hidden')).to.be.false;
    });

    it('expands parents of matching nodes', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Tokens">
            <dvfy-tree-node label="Colors" href="#colors"></dvfy-tree-node>
          </dvfy-tree-node>
        </dvfy-tree-view>
      `);
      await new Promise(r => requestAnimationFrame(r));
      el.filter('colors');
      const parent = el.querySelector('[label="Tokens"]');
      expect(parent.hasAttribute('expanded')).to.be.true;
      expect(parent.hasAttribute('data-hidden')).to.be.false;
    });

    it('clears filter on empty query', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Colors" href="#colors"></dvfy-tree-node>
          <dvfy-tree-node label="Typography" href="#typo"></dvfy-tree-node>
        </dvfy-tree-view>
      `);
      await new Promise(r => requestAnimationFrame(r));
      el.filter('color');
      el.filter('');
      const typo = el.querySelector('[label="Typography"]');
      expect(typo.hasAttribute('data-hidden')).to.be.false;
    });
  });

  describe('keyboard interaction', () => {
    it('moves focus down with ArrowDown', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="A" href="#a"></dvfy-tree-node>
          <dvfy-tree-node label="B" href="#b"></dvfy-tree-node>
        </dvfy-tree-view>
      `);
      await new Promise(r => requestAnimationFrame(r));
      const [a, b] = el.querySelectorAll('dvfy-tree-node');
      // Set initial focus
      a.querySelector('.dvfy-tree__row').click();
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      const focusedRow = b.querySelector('.dvfy-tree__row');
      expect(focusedRow.hasAttribute('data-focused')).to.be.true;
    });

    it('moves focus up with ArrowUp', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="A" href="#a"></dvfy-tree-node>
          <dvfy-tree-node label="B" href="#b"></dvfy-tree-node>
        </dvfy-tree-view>
      `);
      await new Promise(r => requestAnimationFrame(r));
      const [a, b] = el.querySelectorAll('dvfy-tree-node');
      b.querySelector('.dvfy-tree__row').click();
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      const focusedRow = a.querySelector('.dvfy-tree__row');
      expect(focusedRow.hasAttribute('data-focused')).to.be.true;
    });

    it('expands branch with ArrowRight', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Branch">
            <dvfy-tree-node label="Child" href="#child"></dvfy-tree-node>
          </dvfy-tree-node>
        </dvfy-tree-view>
      `);
      await new Promise(r => requestAnimationFrame(r));
      const branch = el.querySelector('dvfy-tree-node');
      branch.querySelector('.dvfy-tree__row').click();
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      expect(branch.hasAttribute('expanded')).to.be.true;
    });

    it('collapses branch with ArrowLeft', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Branch" expanded>
            <dvfy-tree-node label="Child" href="#child"></dvfy-tree-node>
          </dvfy-tree-node>
        </dvfy-tree-view>
      `);
      await new Promise(r => requestAnimationFrame(r));
      const branch = el.querySelector('dvfy-tree-node');
      branch.querySelector('.dvfy-tree__row').click();
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      expect(branch.hasAttribute('expanded')).to.be.false;
    });

    it('activates leaf with Enter', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Leaf" href="#leaf"></dvfy-tree-node>
        </dvfy-tree-view>
      `);
      await new Promise(r => requestAnimationFrame(r));
      const node = el.querySelector('dvfy-tree-node');
      node.querySelector('.dvfy-tree__row').click();
      // Clear selection to test Enter activates
      node.removeAttribute('selected');
      setTimeout(() => el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })));
      const event = await oneEvent(el, 'select');
      expect(event.detail.href).to.equal('#leaf');
    });

    it('activates leaf with Space', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Leaf" href="#leaf"></dvfy-tree-node>
        </dvfy-tree-view>
      `);
      await new Promise(r => requestAnimationFrame(r));
      const node = el.querySelector('dvfy-tree-node');
      node.querySelector('.dvfy-tree__row').click();
      node.removeAttribute('selected');
      setTimeout(() => el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true })));
      const event = await oneEvent(el, 'select');
      expect(event.detail.href).to.equal('#leaf');
    });

    it('jumps to first node on Home', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="A" href="#a"></dvfy-tree-node>
          <dvfy-tree-node label="B" href="#b"></dvfy-tree-node>
          <dvfy-tree-node label="C" href="#c"></dvfy-tree-node>
        </dvfy-tree-view>
      `);
      await new Promise(r => requestAnimationFrame(r));
      const nodes = el.querySelectorAll('dvfy-tree-node');
      nodes[2].querySelector('.dvfy-tree__row').click();
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      const firstRow = nodes[0].querySelector('.dvfy-tree__row');
      expect(firstRow.hasAttribute('data-focused')).to.be.true;
    });

    it('jumps to last node on End', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="A" href="#a"></dvfy-tree-node>
          <dvfy-tree-node label="B" href="#b"></dvfy-tree-node>
          <dvfy-tree-node label="C" href="#c"></dvfy-tree-node>
        </dvfy-tree-view>
      `);
      await new Promise(r => requestAnimationFrame(r));
      const nodes = el.querySelectorAll('dvfy-tree-node');
      nodes[0].querySelector('.dvfy-tree__row').click();
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      const lastRow = nodes[2].querySelector('.dvfy-tree__row');
      expect(lastRow.hasAttribute('data-focused')).to.be.true;
    });
  });

  describe('ARIA', () => {
    it('sets role=tree on container', async () => {
      const el = await fixture(html`<dvfy-tree-view></dvfy-tree-view>`);
      expect(el.getAttribute('role')).to.equal('tree');
    });

    it('sets default aria-label', async () => {
      const el = await fixture(html`<dvfy-tree-view></dvfy-tree-view>`);
      expect(el.getAttribute('aria-label')).to.equal('Tree navigation');
    });

    it('preserves custom aria-label', async () => {
      const el = await fixture(html`<dvfy-tree-view aria-label="File explorer"></dvfy-tree-view>`);
      expect(el.getAttribute('aria-label')).to.equal('File explorer');
    });

    it('sets role=treeitem on nodes', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Item" href="#item"></dvfy-tree-node>
        </dvfy-tree-view>
      `);
      const node = el.querySelector('dvfy-tree-node');
      expect(node.getAttribute('role')).to.equal('treeitem');
    });

    it('sets aria-level on nodes', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Branch" expanded>
            <dvfy-tree-node label="Child" href="#child"></dvfy-tree-node>
          </dvfy-tree-node>
        </dvfy-tree-view>
      `);
      const branch = el.querySelector('dvfy-tree-node');
      expect(branch.getAttribute('aria-level')).to.equal('1');
      const child = branch.querySelector('dvfy-tree-node');
      expect(child.getAttribute('aria-level')).to.equal('2');
    });

    it('sets aria-expanded on branch nodes', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Branch">
            <dvfy-tree-node label="Child" href="#child"></dvfy-tree-node>
          </dvfy-tree-node>
        </dvfy-tree-view>
      `);
      const branch = el.querySelector('dvfy-tree-node');
      expect(branch.getAttribute('aria-expanded')).to.equal('false');
    });

    it('sets role=group on children container', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Branch" expanded>
            <dvfy-tree-node label="Child" href="#child"></dvfy-tree-node>
          </dvfy-tree-node>
        </dvfy-tree-view>
      `);
      const container = el.querySelector('.dvfy-tree__children');
      expect(container.getAttribute('role')).to.equal('group');
    });
  });

  describe('dvfy-tree-node', () => {
    it('toggle method fires toggle event', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Branch">
            <dvfy-tree-node label="Child" href="#child"></dvfy-tree-node>
          </dvfy-tree-node>
        </dvfy-tree-view>
      `);
      const branch = el.querySelector('dvfy-tree-node');
      setTimeout(() => branch.toggle());
      const event = await oneEvent(branch, 'toggle');
      expect(event.detail.expanded).to.be.true;
    });

    it('updates label when attribute changes', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Old" href="#test"></dvfy-tree-node>
        </dvfy-tree-view>
      `);
      const node = el.querySelector('dvfy-tree-node');
      node.setAttribute('label', 'New');
      const label = node.querySelector('.dvfy-tree__label');
      expect(label.textContent).to.equal('New');
    });

    it('isBranch returns true for nodes with children', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Branch">
            <dvfy-tree-node label="Child" href="#child"></dvfy-tree-node>
          </dvfy-tree-node>
        </dvfy-tree-view>
      `);
      const branch = el.querySelector('dvfy-tree-node');
      expect(branch.isBranch).to.be.true;
    });

    it('isBranch returns false for leaf nodes', async () => {
      const el = await fixture(html`
        <dvfy-tree-view>
          <dvfy-tree-node label="Leaf" href="#leaf"></dvfy-tree-node>
        </dvfy-tree-view>
      `);
      const node = el.querySelector('dvfy-tree-node');
      expect(node.isBranch).to.be.false;
    });
  });
});
