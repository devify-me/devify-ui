/**
 * catalog/sidebar.js — Sidebar construction + search filtering
 */
import {
  COMPONENT_CATEGORIES, HTMX_PATTERNS, TOKEN_GROUPS,
  TIERS, COMPONENT_REGISTRY, getComponentsByTier,
} from './data.js';

const SIDEBAR_VIEW_KEY = 'dvfy-catalog-sidebar-view';

/**
 * Build the sidebar navigation into the given container element.
 * @param {HTMLElement} containerEl
 */
export function buildSidebar(containerEl) {
  const sidebar = document.createElement('dvfy-sidebar');
  sidebar.setAttribute('width', '15rem');

  // ── Search ──
  const searchWrap = document.createElement('div');
  searchWrap.style.cssText = 'padding: var(--dvfy-space-2) var(--dvfy-space-2);';
  const searchInput = document.createElement('dvfy-input');
  searchInput.setAttribute('placeholder', 'Search...');
  searchInput.setAttribute('size', 'sm');
  searchInput.setAttribute('clearable', '');
  searchWrap.appendChild(searchInput);

  // ── Overview ──
  const overviewSection = createSection('Explorer');
  overviewSection.appendChild(createLink('#overview', 'Overview'));

  // ── Tokens ──
  const tokensSection = createSection('Tokens');
  for (const key of Object.keys(TOKEN_GROUPS)) {
    tokensSection.appendChild(createLink(`#tokens/${key}`, TOKEN_GROUPS[key].label));
  }

  // ── Components — dual-view (Tier / Domain) ──
  const componentsSection = createSection('Components');

  // Toggle control
  const toggle = document.createElement('div');
  toggle.className = 'catalog-sidebar__view-toggle';
  toggle.style.cssText = `
    display: flex; gap: 2px; padding: var(--dvfy-space-1) var(--dvfy-space-2);
    background: var(--dvfy-surface-sunken); border-radius: var(--dvfy-radius-md);
    margin: var(--dvfy-space-1) var(--dvfy-space-2) var(--dvfy-space-2);
  `;

  const btnTier = createToggleBtn('Tier');
  const btnDomain = createToggleBtn('Domain');
  toggle.appendChild(btnTier);
  toggle.appendChild(btnDomain);
  componentsSection.appendChild(toggle);

  // Tier view
  const tierView = document.createElement('div');
  tierView.className = 'catalog-sidebar__tier-view';
  for (const n of [1, 2, 3]) {
    const tier = TIERS[n];
    const tags = getComponentsByTier(n);
    const catLabel = createCatLabel(`${tier.name} (${tags.length})`);
    tierView.appendChild(catLabel);
    for (const tag of tags) {
      tierView.appendChild(createLink(`#components/${tag}`, tag.replace('dvfy-', '')));
    }
  }

  // Domain view
  const domainView = document.createElement('div');
  domainView.className = 'catalog-sidebar__domain-view';
  for (const [category, tags] of Object.entries(COMPONENT_CATEGORIES)) {
    domainView.appendChild(createCatLabel(category));
    for (const tag of tags) {
      domainView.appendChild(createLink(`#components/${tag}`, tag.replace('dvfy-', '')));
    }
  }

  componentsSection.appendChild(tierView);
  componentsSection.appendChild(domainView);

  // Toggle logic
  const savedView = localStorage.getItem(SIDEBAR_VIEW_KEY) || 'tier';
  setView(savedView);

  btnTier.addEventListener('click', () => setView('tier'));
  btnDomain.addEventListener('click', () => setView('domain'));

  function setView(view) {
    localStorage.setItem(SIDEBAR_VIEW_KEY, view);
    tierView.style.display = view === 'tier' ? '' : 'none';
    domainView.style.display = view === 'domain' ? '' : 'none';
    btnTier.setAttribute('data-active', view === 'tier' ? '' : null);
    btnDomain.setAttribute('data-active', view === 'domain' ? '' : null);
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

  // ── HTMX Patterns ──
  const patternsSection = createSection('HTMX Patterns');
  for (const tag of Object.keys(HTMX_PATTERNS)) {
    const label = tag.replace('dvfy-', '');
    patternsSection.appendChild(createLink(`#patterns/${tag}`, label));
  }

  // ── Brand Settings ──
  const brandSection = createSection('Theming');
  brandSection.appendChild(createLink('#brand', 'Brand Settings'));

  // Assemble — search goes before sidebar nav
  containerEl.appendChild(searchWrap);
  sidebar.appendChild(overviewSection);
  sidebar.appendChild(tokensSection);
  sidebar.appendChild(componentsSection);
  sidebar.appendChild(patternsSection);
  sidebar.appendChild(brandSection);
  containerEl.appendChild(sidebar);

  // ── Search filtering ──
  searchInput.addEventListener('input', (e) => {
    const query = (e.target?.value ?? searchInput.querySelector('input')?.value ?? '').toLowerCase();
    const links = sidebar.querySelectorAll('a');
    const catLabels = sidebar.querySelectorAll('.catalog-sidebar__cat');

    links.forEach(a => {
      const match = !query || a.textContent.toLowerCase().includes(query);
      a.style.display = match ? '' : 'none';
    });

    // Hide category labels if all their following links are hidden
    catLabels.forEach(label => {
      let next = label.nextElementSibling;
      let anyVisible = false;
      while (next && !next.classList.contains('catalog-sidebar__cat') && next.tagName !== 'DVY-SIDEBAR-SECTION') {
        if (next.tagName === 'A' && next.style.display !== 'none') anyVisible = true;
        next = next.nextElementSibling;
      }
      label.style.display = anyVisible ? '' : 'none';
    });

    // Hide sections if all their children are hidden
    sidebar.querySelectorAll('dvfy-sidebar-section').forEach(section => {
      const visibleLinks = section.querySelectorAll('a:not([style*="display: none"])');
      const visibleCats = section.querySelectorAll('.catalog-sidebar__cat:not([style*="display: none"])');
      const sectionLabel = section.querySelector('.dvfy-sidebar__section-label');
      if (visibleLinks.length === 0 && visibleCats.length === 0) {
        section.style.display = 'none';
        if (sectionLabel) sectionLabel.style.display = 'none';
      } else {
        section.style.display = '';
        if (sectionLabel) sectionLabel.style.display = '';
      }
    });
  });

  return sidebar;
}

/**
 * Update active link in sidebar based on current hash.
 * @param {HTMLElement} sidebar
 * @param {string} hash — current location.hash
 */
export function updateSidebarActive(sidebar, hash) {
  sidebar.querySelectorAll('a[data-active]').forEach(a => a.removeAttribute('data-active'));
  const target = sidebar.querySelector(`a[href="${hash}"]`);
  if (target) target.setAttribute('data-active', '');
}

function createSection(label) {
  const section = document.createElement('dvfy-sidebar-section');
  section.setAttribute('label', label);
  return section;
}

function createLink(href, text) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  return a;
}

function createCatLabel(text) {
  const catLabel = document.createElement('div');
  catLabel.className = 'catalog-sidebar__cat';
  catLabel.textContent = text;
  catLabel.style.cssText = `
    font-size: var(--dvfy-text-xs);
    color: var(--dvfy-text-muted);
    padding: var(--dvfy-space-2) var(--dvfy-space-2-5) var(--dvfy-space-0-5);
    font-weight: var(--dvfy-weight-medium);
  `;
  return catLabel;
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
