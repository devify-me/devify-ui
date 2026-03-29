/**
 * @devify/ui — Service Worker
 *
 * Strategy:
 *  - App shell (HTML, JS, CSS, images): cache-first after install precache
 *  - Google Fonts: stale-while-revalidate, cached for 1 year
 *  - Everything else: network-first with cache fallback
 */

const CACHE_NAME = 'dvfy-v12';

// Critical app shell — precached on install
const PRECACHE_URLS = [
  '/catalog/',
  '/catalog/index.html',
  '/catalog/catalog.js',
  '/catalog/router.js',
  '/catalog/sidebar.js',
  '/catalog/data.js',
  '/catalog/tokens.js',
  '/catalog/brand.js',
  '/catalog/overview.js',
  '/catalog/favicon.svg',
  '/catalog/devify-hz-logo-cyan-pink.svg',
  '/devify.css',
  '/devify.js',
  // Token files
  '/tokens/colors.css',
  '/tokens/typography.css',
  '/tokens/spacing.css',
  '/tokens/borders.css',
  '/tokens/elevation.css',
  '/tokens/animation.css',
  '/tokens/layout.css',
  '/tokens/themes/light.css',
  '/tokens/themes/dark.css',
  // Components
  '/components/dvfy-accordion.js',
  '/components/dvfy-alert.js',
  '/components/dvfy-auth.js',
  '/components/dvfy-avatar.js',
  '/components/dvfy-badge.js',
  '/components/dvfy-breadcrumb.js',
  '/components/dvfy-button.js',
  '/components/dvfy-card.js',
  '/components/dvfy-carousel.js',
  '/components/dvfy-checkbox.js',
  '/components/dvfy-component-playground.js',
  '/components/dvfy-drawer.js',
  '/components/dvfy-dropdown.js',
  '/components/dvfy-empty.js',
  '/components/dvfy-gradient-card.js',
  '/components/dvfy-hamburger.js',
  '/components/dvfy-hovercard.js',
  '/components/dvfy-input.js',
  '/components/dvfy-loader.js',
  '/components/dvfy-modal.js',
  '/components/dvfy-nav.js',
  '/components/dvfy-nav-menu.js',
  '/components/dvfy-nav-bar.js',
  '/components/dvfy-page-transition.js',
  '/components/dvfy-pagination.js',
  '/components/dvfy-progress.js',
  '/components/dvfy-radio.js',
  '/components/dvfy-scramble-hover.js',
  '/components/dvfy-scroll-progress.js',
  '/components/dvfy-section.js',
  '/components/dvfy-select.js',
  '/components/dvfy-sidebar.js',
  '/components/dvfy-slider.js',
  '/components/dvfy-spotlight-card.js',
  '/components/dvfy-switch.js',
  '/components/dvfy-table.js',
  '/components/dvfy-tabs.js',
  '/components/dvfy-tag.js',
  '/components/dvfy-textarea.js',
  '/components/dvfy-text-vortex.js',
  '/components/dvfy-theme-switcher.js',
  '/components/dvfy-toast.js',
  '/components/dvfy-tooltip.js',
  '/components/dvfy-tree-view.js',
];

// ─── Install: precache app shell ───────────────────────────────────────────

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// ─── Activate: clean up old caches ─────────────────────────────────────────

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch: routing strategies ─────────────────────────────────────────────

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Google Fonts: stale-while-revalidate, 1-year cache
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(staleWhileRevalidate(request, 'dvfy-fonts-v1'));
    return;
  }

  // Only handle same-origin requests for other strategies
  if (url.origin !== self.location.origin) return;

  // HTML navigation: network-first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request, '/catalog/index.html'));
    return;
  }

  // Static assets (JS, CSS, images, fonts): cache-first
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }
});

// ─── Strategy helpers ──────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  return cached || networkPromise;
}

async function networkFirstWithFallback(request, fallbackUrl) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match(fallbackUrl);
  }
}
