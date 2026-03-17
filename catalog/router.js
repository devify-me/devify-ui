/**
 * catalog/router.js — Hash-based routing + view dispatch
 */
import { HTMX_PATTERNS } from './data.js';
import { renderOverview } from './overview.js';
import { renderTokenView } from './tokens.js';
import { renderBrandSettings } from './brand.js';

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
      renderTokenView(mainEl, item || 'colors');
      break;

    case 'components':
      renderComponentView(mainEl, item);
      break;

    case 'patterns':
      renderPatternView(mainEl, item);
      break;

    case 'brand':
      renderBrandSettings(mainEl);
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

  const heading = document.createElement('h2');
  heading.textContent = `<${tagName}>`;
  heading.style.cssText = 'font-size: var(--dvfy-text-2xl); font-weight: var(--dvfy-weight-bold); margin-bottom: var(--dvfy-space-4);';
  mainEl.appendChild(heading);

  const playground = document.createElement('dvfy-component-playground');
  playground.setAttribute('component', tagName);
  playground.setAttribute('src', '../custom-elements.json');
  mainEl.appendChild(playground);
}

function renderPatternView(mainEl, tagName) {
  if (!tagName) {
    const p = document.createElement('p');
    p.textContent = 'Select a pattern from the sidebar.';
    p.style.color = 'var(--dvfy-text-muted)';
    mainEl.appendChild(p);
    return;
  }

  const heading = document.createElement('h2');
  heading.textContent = `<${tagName}>`;
  heading.style.cssText = 'font-size: var(--dvfy-text-2xl); font-weight: var(--dvfy-weight-bold); margin-bottom: var(--dvfy-space-4);';
  mainEl.appendChild(heading);

  // Info banner
  const alert = document.createElement('dvfy-alert');
  alert.setAttribute('status', 'info');
  alert.setAttribute('title', 'Server Required');
  alert.textContent = 'HTMX patterns require a server backend. The preview below shows the component structure — actual HTMX behavior requires a running server with proper endpoints.';
  alert.style.marginBottom = 'var(--dvfy-space-4)';
  mainEl.appendChild(alert);

  if (HTMX_PATTERNS[tagName]) {
    const desc = document.createElement('p');
    desc.textContent = HTMX_PATTERNS[tagName];
    desc.style.cssText = 'color: var(--dvfy-text-secondary); font-size: var(--dvfy-text-sm); margin-bottom: var(--dvfy-space-4);';
    mainEl.appendChild(desc);
  }

  const playground = document.createElement('dvfy-component-playground');
  playground.setAttribute('component', tagName);
  playground.setAttribute('src', '../custom-elements.json');
  mainEl.appendChild(playground);
}
