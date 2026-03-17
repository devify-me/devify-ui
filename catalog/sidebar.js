/**
 * catalog/sidebar.js — Sidebar construction + search filtering
 */
import { COMPONENT_CATEGORIES, HTMX_PATTERNS, TOKEN_GROUPS } from './data.js';

/**
 * Build the sidebar navigation into the given container element.
 * @param {HTMLElement} containerEl
 * @param {function} onRouteChange — callback receiving (callback) to register for route changes
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

  // ── Components ──
  const componentsSection = createSection('Components');
  for (const [category, tags] of Object.entries(COMPONENT_CATEGORIES)) {
    const catLabel = document.createElement('div');
    catLabel.className = 'catalog-sidebar__cat';
    catLabel.textContent = category;
    catLabel.style.cssText = `
      font-size: var(--dvfy-text-xs);
      color: var(--dvfy-text-muted);
      padding: var(--dvfy-space-2) var(--dvfy-space-2-5) var(--dvfy-space-0-5);
      font-weight: var(--dvfy-weight-medium);
    `;
    componentsSection.appendChild(catLabel);
    for (const tag of tags) {
      const label = tag.replace('dvfy-', '');
      componentsSection.appendChild(createLink(`#components/${tag}`, label));
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
