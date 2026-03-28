/**
 * catalog/router.js — Hash-based routing + view dispatch
 */
import { HTMX_PATTERNS, TIERS, COMPONENT_REGISTRY, DOMAINS, getComponentsByTier, getServerComponents } from './data.js';
import { renderOverview } from './overview.js';
import { renderTokenView } from './tokens.js';
import { renderThemes } from './brand.js';
import { renderColorsPage, renderTypographyPage } from './palette.js';

/** @type {function[]} */
const listeners = [];

/**
 * Parse hash into {section, item}.
 * "#tokens/colors" → { section: "tokens", item: "colors" }
 * "#overview"      → { section: "overview", item: null }
 */
function parseHash(hash) {
  const raw = (hash || '#overview').replace(/^#/, '');
  const [section, ...rest] = raw.split('/');
  return { section: section || 'overview', item: rest.join('/') || null };
}

/**
 * Initialize the hash router.
 * @param {HTMLElement} mainEl — main content container to swap views into
 */
export function initRouter(mainEl) {
  const navigate = () => {
    const hash = location.hash || '#overview';
    const { section, item } = parseHash(hash);
    render(mainEl, section, item);
    listeners.forEach(fn => fn(hash));
  };

  window.addEventListener('hashchange', navigate);
  navigate();
}

/**
 * Register a callback to fire on every route change.
 * @param {function} fn — receives the current hash string
 */
export function onRouteChange(fn) {
  listeners.push(fn);
}

/**
 * Render the appropriate view into mainEl.
 */
function render(mainEl, section, item) {
  mainEl.textContent = '';

  switch (section) {
    case 'overview':
      renderOverview(mainEl);
      break;

    case 'tokens':
      if (item === 'colors' || item === 'palette') renderColorsPage(mainEl);
      else if (item === 'themes') renderThemes(mainEl);
      else if (item === 'typography') renderTypographyPage(mainEl);
      else renderTokenView(mainEl, item || 'typography');
      break;

    case 'brand':
      // Legacy routes — redirect to tokens
      if (item === 'colors' || item === 'palette') { location.hash = '#tokens/colors'; return; }
      if (item === 'fonts') { location.hash = '#tokens/typography'; return; }
      if (item === 'themes') { location.hash = '#tokens/themes'; return; }
      location.hash = '#tokens/colors';
      return;

    case 'components':
      renderComponentView(mainEl, item);
      break;

    case 'patterns':
      // Legacy route — redirect to components
      if (item) { location.hash = `#components/${item}`; return; }
      location.hash = '#overview';
      return;

    case 'tier':
      renderTierView(mainEl, item);
      break;

    default:
      renderOverview(mainEl);
      break;
  }
}

function renderComponentView(mainEl, tagName) {
  if (!tagName) {
    const p = document.createElement('p');
    p.textContent = 'Select a component from the sidebar.';
    p.style.color = 'var(--dvfy-text-muted)';
    mainEl.appendChild(p);
    return;
  }

  const reg = COMPONENT_REGISTRY[tagName];

  const heading = document.createElement('h2');
  heading.textContent = `<${tagName}>`;
  heading.style.cssText = 'font-size: var(--dvfy-text-2xl); font-weight: var(--dvfy-weight-bold); margin-bottom: var(--dvfy-space-4);';
  mainEl.appendChild(heading);

  // Server Required banner for HTMX components
  if (reg?.server) {
    const alert = document.createElement('dvfy-alert');
    alert.setAttribute('status', 'info');
    alert.setAttribute('title', 'Server Required');
    alert.textContent = 'This component requires a server backend. The preview below shows the component structure — actual HTMX behavior requires a running server with proper endpoints.';
    alert.style.marginBottom = 'var(--dvfy-space-4)';
    mainEl.appendChild(alert);

    if (HTMX_PATTERNS[tagName]) {
      const desc = document.createElement('p');
      desc.textContent = HTMX_PATTERNS[tagName];
      desc.style.cssText = 'color: var(--dvfy-text-secondary); font-size: var(--dvfy-text-sm); margin-bottom: var(--dvfy-space-4);';
      mainEl.appendChild(desc);
    }
  }

  const playground = document.createElement('dvfy-component-playground');
  playground.setAttribute('component', tagName);
  playground.setAttribute('src', '../custom-elements.json');
  if (reg?.layout) playground.setAttribute('layout', reg.layout);
  mainEl.appendChild(playground);
}

function renderTierView(mainEl, tierNum) {
  const n = parseInt(tierNum, 10);
  const tier = TIERS[n];

  if (!tier) {
    const p = document.createElement('p');
    p.textContent = 'Unknown tier.';
    p.style.color = 'var(--dvfy-text-muted)';
    mainEl.appendChild(p);
    return;
  }

  // Header
  const heading = document.createElement('h2');
  heading.textContent = tier.label;
  heading.style.cssText = 'font-size: var(--dvfy-text-2xl); font-weight: var(--dvfy-weight-bold); margin-bottom: var(--dvfy-space-2);';
  mainEl.appendChild(heading);

  const desc = document.createElement('p');
  desc.textContent = tier.description;
  desc.style.cssText = 'color: var(--dvfy-text-secondary); margin-bottom: var(--dvfy-space-2);';
  mainEl.appendChild(desc);

  // Dependency rules
  const rulesAlert = document.createElement('dvfy-alert');
  rulesAlert.setAttribute('status', 'info');
  rulesAlert.setAttribute('title', 'Dependency Rules');
  rulesAlert.textContent = tier.rules;
  rulesAlert.style.marginBottom = 'var(--dvfy-space-6)';
  mainEl.appendChild(rulesAlert);

  // Tier nav
  const tierNav = document.createElement('div');
  tierNav.style.cssText = 'display: flex; gap: var(--dvfy-space-2); margin-bottom: var(--dvfy-space-6);';
  for (const tn of [1, 2, 3, 4, 5]) {
    const tags = getComponentsByTier(tn);
    const btn = document.createElement('dvfy-button');
    btn.textContent = `T${tn}: ${TIERS[tn].name} (${tags.length})`;
    btn.setAttribute('variant', tn === n ? 'primary' : 'outline');
    btn.setAttribute('size', 'sm');
    btn.addEventListener('click', () => { location.hash = `#tier/${tn}`; });
    tierNav.appendChild(btn);
  }
  mainEl.appendChild(tierNav);

  // Component grid
  const tags = getComponentsByTier(n);
  const grid = document.createElement('div');
  grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr)); gap: var(--dvfy-space-4);';

  for (const tag of tags) {
    const meta = COMPONENT_REGISTRY[tag];
    const card = document.createElement('dvfy-card');
    card.style.cssText = 'cursor: pointer; padding: var(--dvfy-space-4);';
    card.addEventListener('click', () => {
      location.hash = `#components/${tag}`;
    });

    // Component name
    const name = document.createElement('div');
    name.textContent = `<${tag}>`;
    name.style.cssText = 'font-weight: var(--dvfy-weight-semibold); font-family: var(--dvfy-font-mono); font-size: var(--dvfy-text-sm); margin-bottom: var(--dvfy-space-2);';
    card.appendChild(name);

    // Domain badge
    const domainLabel = DOMAINS[meta.domain] || meta.domain;
    const badge = document.createElement('dvfy-badge');
    badge.textContent = domainLabel;
    badge.setAttribute('variant', 'secondary');
    badge.style.cssText = 'margin-bottom: var(--dvfy-space-2); display: inline-block;';
    card.appendChild(badge);

    // Dependencies
    if (meta.deps.length > 0) {
      const depsRow = document.createElement('div');
      depsRow.style.cssText = 'display: flex; flex-wrap: wrap; gap: var(--dvfy-space-1); margin-top: var(--dvfy-space-1);';
      const depsLabel = document.createElement('span');
      depsLabel.textContent = 'Deps:';
      depsLabel.style.cssText = 'font-size: var(--dvfy-text-xs); color: var(--dvfy-text-muted); margin-right: var(--dvfy-space-1);';
      depsRow.appendChild(depsLabel);
      for (const dep of meta.deps) {
        const depTag = document.createElement('dvfy-tag');
        depTag.textContent = dep.replace('dvfy-', '');
        depTag.setAttribute('size', 'sm');
        depsRow.appendChild(depTag);
      }
      card.appendChild(depsRow);
    }

    grid.appendChild(card);
  }
  mainEl.appendChild(grid);
}
