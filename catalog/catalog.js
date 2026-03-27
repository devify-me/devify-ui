/**
 * catalog/catalog.js — Design System Explorer entry point
 *
 * Initializes sidebar, router, and theme change observer.
 */
import { buildSidebar, updateSidebarActive } from './sidebar.js';
import { initRouter, onRouteChange } from './router.js';
import { getFonts, getCustomThemes, setCustomThemes } from './storage.js';
import { loadGoogleFont } from './palette.js';
import { CURATED_FONTS } from './data.js';
import { generateTheme, injectThemeStyle } from '../tokens/theme-generator.js';
import { generatePalette } from '../tokens/palette-generator.js';

// Restore persisted fonts before rendering
const savedFonts = getFonts();
if (savedFonts) {
  const roleMap = {
    brand: { cssVar: '--dvfy-font-brand', category: 'display', fallback: 'sans-serif' },
    sans:  { cssVar: '--dvfy-font-sans',  category: 'sans',    fallback: 'system-ui, sans-serif' },
    serif: { cssVar: '--dvfy-font-serif', category: 'serif',   fallback: 'Georgia, serif' },
    mono:  { cssVar: '--dvfy-font-mono',  category: 'mono',    fallback: 'monospace' },
  };
  for (const [key, fontName] of Object.entries(savedFonts)) {
    if (!fontName || !roleMap[key]) continue;
    const { cssVar, category, fallback } = roleMap[key];
    const fonts = CURATED_FONTS[category] || [];
    const font = fonts.find(f => f.name === fontName);
    loadGoogleFont(fontName, font?.weights);
    document.documentElement.style.setProperty(cssVar, `"${fontName}", ${fallback}`);
  }
}

// ── Default Devify brand themes ──
// Generated programmatically from brand colors: Cyan #00E5E5, Pink #FF3CAC
const DEFAULT_THEMES = [
  { name: 'devify-blue', label: 'Devify Blue', brandColors: ['#00E5E5', '#FF3CAC'], brandIndex: 0 },
  { name: 'devify-pink', label: 'Devify Pink', brandColors: ['#FF3CAC', '#00E5E5'], brandIndex: 0 },
];

// Ensure default themes exist and are up-to-date.
// Bump THEME_VERSION when theme-generator output changes to force regeneration.
const THEME_VERSION = 3;
let savedCustomThemes = getCustomThemes() || [];
const storedVersion = parseInt(localStorage.getItem('dvfy-theme-version') || '0', 10);
const needsRegen = storedVersion < THEME_VERSION
  || !DEFAULT_THEMES.every(dt => savedCustomThemes.some(ct => ct.name === dt.name));
if (needsRegen) {
  // Regenerate defaults, keep user-created themes
  const userThemes = savedCustomThemes.filter(ct => !DEFAULT_THEMES.some(dt => dt.name === ct.name));
  const freshDefaults = DEFAULT_THEMES.map(dt => {
    const palette = generatePalette({ brandColors: dt.brandColors, supportCount: 6, prefix: '--brand' });
    const theme = generateTheme(palette, dt.brandIndex);
    return { name: dt.name, label: dt.label, brandIndex: dt.brandIndex, ...theme };
  });
  savedCustomThemes = [...freshDefaults, ...userThemes];
  setCustomThemes(savedCustomThemes);
  localStorage.setItem('dvfy-theme-version', String(THEME_VERSION));
}

// Inject all custom theme <style> blocks
for (const ct of savedCustomThemes) {
  injectThemeStyle(ct.name, ct);
}

const drawer = document.getElementById('catalog-drawer');
const mainContent = document.getElementById('main-content');

// Wait for dvfy-drawer to upgrade before querying internal structure
await customElements.whenDefined('dvfy-drawer');

// Create sidebar container inside the drawer body
const sidebarContainer = document.createElement('div');
sidebarContainer.id = 'catalog-sidebar';
const drawerBody = drawer.querySelector('.dvfy-drawer__body');
if (drawerBody) {
  drawerBody.appendChild(sidebarContainer);
} else {
  drawer.appendChild(sidebarContainer);
}

// Build sidebar
buildSidebar(sidebarContainer);

// Wire sidebar active state to route changes
onRouteChange((hash) => {
  const tree = sidebarContainer.querySelector('dvfy-tree-view');
  updateSidebarActive(tree, hash);
});

// Initialize router (renders initial view)
initRouter(mainContent);

// Wire hamburger to toggle drawer
const toggle = document.getElementById('nav-toggle');
toggle?.addEventListener('toggle', (e) => {
  if (e.detail.open) {
    drawer.setAttribute('open', '');
  } else {
    drawer.removeAttribute('open');
  }
});

// Sync hamburger state when drawer closes via its own close button
drawer.addEventListener('close', () => {
  if (toggle) toggle.open = false;
});

// Add all themes to the theme-switcher and set default
const switcher = document.querySelector('dvfy-theme-switcher');
if (switcher) {
  for (const ct of savedCustomThemes) {
    switcher.addTheme(ct.name, ct.label);
  }
  // Default: Devify Blue, mode from system preference (if no persisted choice)
  const hasSavedTheme = localStorage.getItem('dvfy-catalog-theme');
  if (!hasSavedTheme) {
    switcher.setTheme('devify-blue');
  }
}

// Re-render token views on theme change (they show computed values).
// Component/pattern views use CSS custom properties and don't need re-render.
const observer = new MutationObserver(() => {
  const section = (location.hash || '#overview').replace(/^#/, '').split('/')[0] || 'overview';
  if (section === 'tokens' || section === 'overview') {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }
});
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
});
