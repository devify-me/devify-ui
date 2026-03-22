# PWA Setup Guide

This guide covers how to use `@devify/ui` in a Progressive Web App and how the Design System Catalog itself is configured as a PWA.

## Catalog PWA

The catalog at `/catalog/` is an installable PWA:

- **Manifest**: `/catalog/manifest.json` — app metadata, icons, theme color
- **Service worker**: `/sw.js` — caches all assets for offline use
- **Icons**: `/catalog/icons/icon-192.png` and `icon-512.png`

After the first page load, the entire catalog works fully offline.

## Caching Strategy

| Asset type            | Strategy                  | Rationale                            |
|-----------------------|---------------------------|--------------------------------------|
| App shell (HTML, JS)  | Cache-first (precached)   | Instant load, offline support        |
| Design tokens (CSS)   | Cache-first (precached)   | Instant load, offline support        |
| Components (JS)       | Cache-first (precached)   | All 40+ components cached on install |
| Google Fonts CSS      | Stale-while-revalidate    | Fresh where possible, offline ok     |
| Google Fonts files    | Stale-while-revalidate    | Cached after first load              |
| Navigation (HTML)     | Network-first + fallback  | Always try fresh page first          |

## No External Runtime Dependencies

All `@devify/ui` components and tokens are self-contained:

- **No CDN imports** — components are ES modules with no external imports
- **No external images** — components use CSS/SVG only
- **No external APIs** — all functionality is client-side
- **Font fallbacks** — the typography token defines system font fallbacks:
  ```css
  --dvfy-font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
  --dvfy-font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  ```

The only external resource is the catalog's Google Fonts import (Inter + Saira Stencil One). These are cached by the service worker after first load, and the system font fallbacks ensure the catalog renders correctly on first visit and offline.

## Using @devify/ui in Your PWA

### 1. Add your manifest

```json
{
  "name": "My App",
  "short_name": "MyApp",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0e1118",
  "theme_color": "#0ba5b5",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Link it from your HTML:
```html
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#0ba5b5">
```

### 2. Create a service worker

Cache the `@devify/ui` assets as part of your app shell:

```js
const CACHE = 'my-app-v1';

const PRECACHE_URLS = [
  '/',
  '/devify.css',
  '/devify.js',
  // Add individual components if not using the barrel:
  // '/components/dvfy-button.js',
  // '/tokens/themes/devify-cyan.css',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Cache-first for static assets
  if (event.request.destination === 'script' || event.request.destination === 'style') {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request))
    );
  }
});
```

### 3. Register the service worker

```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js');
    });
  }
</script>
```

## Cache Versioning

When you update `@devify/ui`, bump the cache name to invalidate old caches:

```js
const CACHE = 'my-app-v2'; // ← increment on each deploy
```

The service worker's `activate` handler deletes all caches that don't match the current name.

## Lighthouse PWA Checklist

Run `npx lighthouse http://sergio:8090/catalog/ --view` to generate the full audit. The catalog is configured to pass all PWA checks:

- [x] Registers a service worker
- [x] Responds with 200 when offline
- [x] Has a `<meta name="viewport">` tag
- [x] Web app manifest with required fields
- [x] Icons at 192×192 and 512×512
- [x] `theme-color` meta tag
- [x] HTTPS (required for production — dev on tailnet is over HTTP)
- [x] No external runtime dependencies in components
