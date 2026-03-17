/**
 * catalog/catalog.js — Design System Explorer entry point
 *
 * Initializes sidebar, router, and theme change observer.
 */
import { buildSidebar, updateSidebarActive } from './sidebar.js';
import { initRouter, onRouteChange } from './router.js';

const sidebarContainer = document.getElementById('catalog-sidebar');
const mainContent = document.getElementById('main-content');

// Build sidebar
const sidebar = buildSidebar(sidebarContainer);

// Wire sidebar active state to route changes
onRouteChange((hash) => {
  updateSidebarActive(sidebar, hash);
});

// Initialize router (renders initial view)
initRouter(mainContent);

// Re-render active view on theme change
const observer = new MutationObserver(() => {
  // Theme changed — re-trigger current route to update computed values
  const hash = location.hash || '#overview';
  window.dispatchEvent(new HashChangeEvent('hashchange'));
});
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
});
