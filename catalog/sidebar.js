/**
 * catalog/sidebar.js — Sidebar construction with tree-view navigation
 */
import {
  COMPONENT_CATEGORIES, HTMX_PATTERNS, TOKEN_GROUPS,
  TIERS, COMPONENT_REGISTRY, getComponentsByTier,
} from './data.js';

const SIDEBAR_VIEW_KEY = 'dvfy-catalog-sidebar-view';

/**
 * Build the sidebar navigation into the given container element.
 * @param {HTMLElement} containerEl
 * @returns {HTMLElement} the dvfy-tree-view element
 */
export function buildSidebar(containerEl) {
  // ── Search ──
  const searchWrap = document.createElement('div');
  searchWrap.style.cssText = 'padding: var(--dvfy-space-2);';
  const searchInput = document.createElement('dvfy-input');
  searchInput.setAttribute('placeholder', 'Search...');
  searchInput.setAttribute('size', 'sm');
  searchInput.setAttribute('clearable', '');
  searchWrap.appendChild(searchInput);

  // ── Toggle control (Tier / Domain) ──
  const toggle = document.createElement('div');
  toggle.className = 'catalog-sidebar__view-toggle';
  toggle.style.cssText = `
    display: flex; gap: 2px; padding: var(--dvfy-space-1) var(--dvfy-space-2);
    background: var(--dvfy-surface-sunken); border-radius: var(--dvfy-radius-md);
    margin: 0 var(--dvfy-space-2) var(--dvfy-space-2);
  `;
  const btnTier = createToggleBtn('Tier');
  const btnDomain = createToggleBtn('Domain');
  toggle.appendChild(btnTier);
  toggle.appendChild(btnDomain);

  // ── State ──
  let currentView = localStorage.getItem(SIDEBAR_VIEW_KEY) || 'tier';
  let tree = null;

  function buildTree(view) {
    const t = document.createElement('dvfy-tree-view');
    t.style.cssText = 'flex: 1; overflow-y: auto; padding: 0 var(--dvfy-space-1);';

    // Overview
    t.appendChild(createNode('Overview', '#overview'));

    // Tokens
    const tokensNode = createNode(`Tokens (${Object.keys(TOKEN_GROUPS).length})`);
    tokensNode.setAttribute('expanded', '');
    for (const key of Object.keys(TOKEN_GROUPS)) {
      tokensNode.appendChild(createNode(TOKEN_GROUPS[key].label, `#tokens/${key}`));
    }
    t.appendChild(tokensNode);

    // Components
    const totalComponents = Object.keys(COMPONENT_REGISTRY).filter(t => COMPONENT_REGISTRY[t].tier <= 3).length;
    const componentsNode = createNode(`Components (${totalComponents})`);
    componentsNode.setAttribute('expanded', '');

    if (view === 'tier') {
      for (const n of [1, 2, 3]) {
        const tier = TIERS[n];
        const tags = getComponentsByTier(n);
        const tierNode = createNode(`${tier.name} (${tags.length})`);
        tierNode.setAttribute('expanded', '');
        for (const tag of tags) {
          tierNode.appendChild(createNode(tag.replace('dvfy-', ''), `#components/${tag}`));
        }
        componentsNode.appendChild(tierNode);
      }
    } else {
      for (const [category, tags] of Object.entries(COMPONENT_CATEGORIES)) {
        const catNode = createNode(`${category} (${tags.length})`);
        catNode.setAttribute('expanded', '');
        for (const tag of tags) {
          catNode.appendChild(createNode(tag.replace('dvfy-', ''), `#components/${tag}`));
        }
        componentsNode.appendChild(catNode);
      }
    }
    t.appendChild(componentsNode);

    // HTMX Patterns
    const patternsNode = createNode(`HTMX Patterns (${Object.keys(HTMX_PATTERNS).length})`);
    for (const tag of Object.keys(HTMX_PATTERNS)) {
      patternsNode.appendChild(createNode(tag.replace('dvfy-', ''), `#patterns/${tag}`));
    }
    t.appendChild(patternsNode);

    // Brand Settings
    t.appendChild(createNode('Brand Settings', '#brand'));

    // Navigate on select
    t.addEventListener('select', (e) => {
      const { href } = e.detail;
      if (href) {
        location.hash = href.startsWith('#') ? href.slice(1) : href;
      }
    });

    return t;
  }

  function setView(view) {
    currentView = view;
    localStorage.setItem(SIDEBAR_VIEW_KEY, view);

    // Replace tree
    const newTree = buildTree(view);
    if (tree) {
      tree.replaceWith(newTree);
    } else {
      containerEl.appendChild(newTree);
    }
    tree = newTree;

    // Highlight active
    const hash = location.hash || '#overview';
    queueMicrotask(() => tree.selectByHref(hash));

    // Update toggle button styles
    if (view === 'tier') {
      btnTier.style.background = 'var(--dvfy-primary-bg)';
      btnTier.style.color = 'var(--dvfy-primary-text)';
      btnDomain.style.background = 'transparent';
      btnDomain.style.color = 'var(--dvfy-text-secondary)';
    } else {
      btnDomain.style.background = 'var(--dvfy-primary-bg)';
      btnDomain.style.color = 'var(--dvfy-primary-text)';
      btnTier.style.background = 'transparent';
      btnTier.style.color = 'var(--dvfy-text-secondary)';
    }
  }

  btnTier.addEventListener('click', () => setView('tier'));
  btnDomain.addEventListener('click', () => setView('domain'));

  // ── Search filtering ──
  searchInput.addEventListener('input', (e) => {
    const query = (e.target?.value ?? searchInput.querySelector('input')?.value ?? '');
    if (tree) tree.filter(query);
  });

  // Assemble
  containerEl.appendChild(searchWrap);
  containerEl.appendChild(toggle);
  setView(currentView);

  return tree;
}

/**
 * Update active node in tree based on current hash.
 * @param {HTMLElement} tree — dvfy-tree-view element
 * @param {string} hash — current location.hash
 */
export function updateSidebarActive(tree, hash) {
  if (tree && tree.selectByHref) {
    tree.selectByHref(hash);
  }
}

function createNode(label, href) {
  const node = document.createElement('dvfy-tree-node');
  node.setAttribute('label', label);
  if (href) node.setAttribute('href', href);
  return node;
}

function createToggleBtn(label) {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.style.cssText = `
    flex: 1; border: none; padding: var(--dvfy-space-1) var(--dvfy-space-2);
    border-radius: var(--dvfy-radius-sm); cursor: pointer;
    font-size: var(--dvfy-text-xs); font-weight: var(--dvfy-weight-medium);
    font-family: inherit; transition: all var(--dvfy-duration-fast) var(--dvfy-ease-out);
  `;
  return btn;
}
