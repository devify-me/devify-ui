# Changelog

All notable changes to `@devify/ui` are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Pre-1.0 policy:** Minor bumps (`0.x.0`) may include breaking changes. Patch bumps (`0.0.x`) are backwards-compatible fixes. Each breaking change includes a migration note.

---

## [Unreleased]

### Added

- `dvfy-checkbox` — `error`, `warning`, `help`, and `state` attributes wired through the shared form-messages helper with `aria-describedby` for screen readers.
- `dvfy-section-hero` — opinionated landing-page hero section with `align`, `padding`, `tone` attributes and `trust` slot. Tier 1 layout primitive, mobile-first, token-driven.
- `dvfy-component-playground` — WIP mode. New `src` attribute dynamically imports a component module before rendering; new `tag` attribute (preferred name; `component` retained as alias). Companion `catalog/wip.html` route reads `?src&tag&manifest` from the URL for shareable preview links. Enables previewing project-local and authoring-in-progress components through the same UI as the library catalog. See `docs/conventions.md` for the three modes.

### Changed (breaking, pre-1.0)

- `dvfy-component-playground` — the `src` attribute no longer points to the manifest. It now points to a component JS module to dynamically import. Use the new `manifest` attribute for the manifest path. Internal catalog router updated accordingly; external consumers using the playground directly must rename `src="..../custom-elements.json"` → `manifest="..../custom-elements.json"`.

### Fixed

- `dvfy-alert`, `dvfy-avatar`, `dvfy-auth`, `dvfy-checkbox` — no longer rebuild their internal DOM on every observed attribute change. Non-structural changes (`status`, `title`, `name`, `label`, `action`, `checked`, `disabled`, OAuth URLs, etc.) now update in place, preserving focus, typed input values, and element references. Fixes flicker during rapid attribute updates such as theme switches or live-edit sandboxes.

---

## [0.2.0] — 2026-04-02

### Breaking Changes

#### `dvfy-button` — `variant="default"` renamed to `variant="primary"`

**Before:**
```html
<dvfy-button variant="default">Click</dvfy-button>
```

**After:**
```html
<dvfy-button variant="primary">Click</dvfy-button>
```

Buttons with no `variant` attribute are unaffected — they continue to render as primary.

### Fixed

- **`dvfy-select`** — Native `<select>` fallback `change` event no longer bubbles past the component's own CustomEvent, fixing broken enum controls in narrow containers (caused by container query migration)

---

## [0.1.0] — 2026-03-22

Initial public release of `@devify/ui`.

### Added

**Design Token System**
- Three-tier token architecture: Primitives → Semantics → Component overrides
- 11 color families × 11 steps (`colors.css`)
- Typography scale, spacing (base-4), borders, elevation (7 levels), animation, layout tokens
- Light and dark semantic themes; `devify-cyan` and `devify-pink` brand themes
- `devify.css` bundle entry point

**Web Components (48 total, all `dvfy-` prefixed, Light DOM)**
- Forms: `dvfy-button`, `dvfy-input`, `dvfy-textarea`, `dvfy-select`, `dvfy-checkbox`, `dvfy-radio`, `dvfy-slider`, `dvfy-switch`, `dvfy-date-picker`, `dvfy-file-upload`
- Data display: `dvfy-badge`, `dvfy-tag`, `dvfy-avatar`, `dvfy-card`, `dvfy-gradient-card`, `dvfy-spotlight-card`, `dvfy-table`, `dvfy-empty`, `dvfy-progress`, `dvfy-scroll-progress`, `dvfy-compare`, `dvfy-marquee-scroll`, `dvfy-carousel`
- Feedback & overlays: `dvfy-alert`, `dvfy-loader`, `dvfy-toast`, `dvfy-modal`, `dvfy-hovercard`
- Navigation: `dvfy-dropdown`, `dvfy-tooltip`, `dvfy-tabs`, `dvfy-breadcrumb`, `dvfy-pagination`, `dvfy-hamburger`, `dvfy-sidebar`, `dvfy-nav`, `dvfy-tree-view`
- Layout: `dvfy-drawer`, `dvfy-section`, `dvfy-accordion`
- Visual effects: `dvfy-scroll-reveal`, `dvfy-scramble-hover`, `dvfy-text-vortex`, `dvfy-page-transition`, `dvfy-transition-root`
- Utility: `dvfy-theme-switcher`, `dvfy-auth`, `dvfy-component-playground`
- `devify.js` barrel entry point

**HTMX Patterns (5)**
- `dvfy-form`, `dvfy-infinite-scroll`, `dvfy-live-search`, `dvfy-table` (server-driven), `dvfy-confirm`

**Design System Catalog**
- Hash-based routing Design System Explorer (`catalog/index.html`)
- Sidebar navigation with search, organized by Tokens / Components / HTMX Patterns / Brand Settings
- Live token showcases (colors, typography, spacing, elevation, animation)
- `dvfy-component-playground` — interactive playground driven by WCA manifest
- Brand Settings sandbox with live-editable semantic tokens and CSS export
- `custom-elements.json` manifest via `web-component-analyzer`

**Tooling**
- `npm run analyze` — generates `custom-elements.json` from JSDoc
- `npm run serve` — catalog at `localhost:8090`
- Container Query-based responsive layouts (parent-width, not viewport)
- Full keyboard navigation and ARIA support across all components

---

## Breaking Changes

None — this is the initial release.

---

[Unreleased]: https://github.com/devify-me/devify-ui/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/devify-me/devify-ui/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/devify-me/devify-ui/releases/tag/v0.1.0
