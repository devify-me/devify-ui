/**
 * catalog/catalog.js — Design System Explorer entry point
 *
 * Initializes sidebar, router, and theme change observer.
 */
import { buildSidebar, updateSidebarActive } from './sidebar.js';
import { initRouter, onRouteChange } from './router.js';

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

// Re-render active view on theme change
const observer = new MutationObserver(() => {
  const hash = location.hash || '#overview';
  window.dispatchEvent(new HashChangeEvent('hashchange'));
});
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
});
