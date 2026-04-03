# Component Taxonomy

## Design Principle

The taxonomy is a **forcing function**: each tier earns its place by composing at least one component from the tier below. If a component feels too complex for its tier but has zero deps, that's the signal to decompose it — not to create an escape hatch.

HTMX server interaction is **orthogonal** — components are classified by composition depth, with a `server: true` flag for those requiring a backend.

## Decision Tree

```
Q1: Does it depend on any Tier 3+ component and define page-level spatial layout?
    YES → Tier 5 (Layout)

Q2: Does it depend on any Tier 3+ component and encapsulate a self-contained UX flow?
    YES → Tier 4 (Widget)

Q3: Does it depend on any Tier 2 component?
    YES → Tier 3 (Organism)

Q4: Does it depend on any Tier 1 component (and no Tier 2+)?
    YES → Tier 2 (Composite)

Q5: Zero dvfy-* dependencies?
    YES → Tier 1 (Primitive)

HTMX: Orthogonal. Set server: true in registry. Classify by composition depth above.
```

## Tiers

| Tier | Name       | Rule                          | Allowed deps    | Count |
|------|------------|-------------------------------|-----------------|-------|
| 1    | Primitive  | Zero dvfy-* deps              | None            | 45    |
| 2    | Composite  | ≥1 Tier 1 dep, only Tier 1    | Tier 1 only     | 7     |
| 3    | Organism   | ≥1 Tier 2 dep                 | Tier 1 + Tier 2 | 4     |
| 4    | Widget     | ≥1 Tier 3 dep, self-contained | Tier 1–3        | 0     |
| 5    | Layout     | ≥1 Tier 3+ dep, page scaffold | Any             | 0     |

## HTMX / Server Components

HTMX server interaction is not a composition tier — it's a property. Components that require a server backend are marked `server: true` in the registry and classified by their actual composition depth.

The catalog groups server components via the "Server Required" banner and sidebar indicators. They appear in their functional domain (Forms, Feedback, etc.), not a separate HTMX category.

**Current server components:**
- `dvfy-infinite-scroll` (Tier 1) — scroll-triggered loading
- `dvfy-live-search` (Tier 1) — debounced search input
- `dvfy-htmx-table` (Tier 1) — sortable, paginated table
- `dvfy-htmx-form` (Tier 3) — AJAX form submission with validation
- `dvfy-confirm` (Tier 3) — confirmation dialog for destructive actions

## Domain Assignment

| Domain Key   | Label          | Scope                                        |
|-------------|----------------|----------------------------------------------|
| forms       | Forms          | User input, selection, toggles               |
| display     | Data Display   | Presenting data, content, status              |
| feedback    | Feedback       | Alerts, loading, toasts, modals               |
| navigation  | Navigation     | Wayfinding, menus, breadcrumbs, pagination    |
| layout      | Layout         | Page structure, sections, containers          |
| utility     | Utility        | Theme, tooltips, auth — cross-cutting concerns|

## Dependency Constraints

| Rule                                          | Enforcement        |
|-----------------------------------------------|-------------------|
| Tier 1 must not import any `dvfy-*` component | `/new-component`  |
| Tier 2 must have ≥1 Tier 1 dep, only Tier 1   | `/new-component`  |
| Tier 3 must have ≥1 Tier 2 dep                | `/new-component`  |
| Tier 4 must have ≥1 Tier 3 dep                | Manual review     |
| Tier 5 must have ≥1 Tier 3+ dep               | Manual review     |
| No same-tier dependencies at any level         | `/new-component`  |

## Classification Reference

### Tier 1 — Primitives (45)

| Component             | Domain     | Server |
|----------------------|------------|--------|
| dvfy-button          | Forms      |        |
| dvfy-input           | Forms      |        |
| dvfy-textarea        | Forms      |        |
| dvfy-checkbox        | Forms      |        |
| dvfy-radio           | Forms      |        |
| dvfy-switch          | Forms      |        |
| dvfy-slider          | Forms      |        |
| dvfy-select          | Forms      |        |
| dvfy-file-upload     | Forms      |        |
| dvfy-date-picker     | Forms      |        |
| dvfy-live-search     | Forms      | server |
| dvfy-badge           | Display    |        |
| dvfy-tag             | Display    |        |
| dvfy-avatar          | Display    |        |
| dvfy-progress        | Display    |        |
| dvfy-card            | Display    |        |
| dvfy-gradient-card   | Display    |        |
| dvfy-spotlight-card  | Display    |        |
| dvfy-compare-slider  | Display    |        |
| dvfy-empty           | Display    |        |
| dvfy-carousel        | Display    |        |
| dvfy-scroll-progress | Display    |        |
| dvfy-marquee-scroll  | Display    |        |
| dvfy-htmx-table      | Display    | server |
| dvfy-alert           | Feedback   |        |
| dvfy-loader          | Feedback   |        |
| dvfy-toast           | Feedback   |        |
| dvfy-hovercard       | Feedback   |        |
| dvfy-nav             | Navigation |        |
| dvfy-hamburger       | Navigation |        |
| dvfy-breadcrumb      | Navigation |        |
| dvfy-pagination      | Navigation |        |
| dvfy-tabs            | Navigation |        |
| dvfy-dropdown        | Navigation |        |
| dvfy-tree-node       | Navigation |        |
| dvfy-tree-view       | Navigation |        |
| dvfy-sidebar         | Navigation |        |
| dvfy-section         | Layout     |        |
| dvfy-tooltip         | Utility    |        |
| dvfy-scroll-reveal   | Utility    |        |
| dvfy-page-transition | Utility    |        |
| dvfy-transition-root | Utility    |        |
| dvfy-text-vortex     | Utility    |        |
| dvfy-scramble-hover  | Utility    |        |
| dvfy-infinite-scroll | Utility    | server |

### Tier 2 — Composites (7)

| Component                | Domain     | Dependencies                       |
|-------------------------|------------|------------------------------------|
| dvfy-drawer             | Layout     | dvfy-button                        |
| dvfy-table              | Display    | dvfy-checkbox                      |
| dvfy-modal              | Feedback   | dvfy-button                        |
| dvfy-nav-menu           | Navigation | dvfy-nav                           |
| dvfy-theme-switcher     | Utility    | dvfy-dropdown, dvfy-button         |
| dvfy-accordion          | Layout     | dvfy-section                       |
| dvfy-component-playground | Utility  | dvfy-button, dvfy-section, dvfy-slider |

### Tier 3 — Organisms (4)

| Component        | Domain     | Dependencies                              | Server |
|-----------------|------------|-------------------------------------------|--------|
| dvfy-nav-bar    | Navigation | dvfy-nav-menu, dvfy-hamburger, dvfy-drawer |        |
| dvfy-auth       | Utility    | dvfy-modal                                |        |
| dvfy-htmx-form  | Forms      | dvfy-modal                                | server |
| dvfy-confirm    | Feedback   | dvfy-modal                                | server |

### Tier 4 — Widgets (0)

No components yet. Future target for self-contained functional units (e.g., decomposed auth flow, notification center).

### Tier 5 — Layouts (0)

No components yet. Future target for page-level scaffolds (e.g., app shell with nav + sidebar + content + footer).

## Decomposition Backlog

The following Tier 1 components were reclassified from higher tiers because they have zero dvfy-* dependencies. Each is a candidate for future decomposition to earn a higher tier through genuine composition:

- **dvfy-select** — could compose dvfy-button (trigger), dvfy-dropdown (menu)
- **dvfy-date-picker** — decompose into day/week/month/calendar primitives
- **dvfy-tabs** — could compose dvfy-button (tab triggers)
- **dvfy-pagination** — could compose dvfy-button (page buttons)
- **dvfy-dropdown** — could compose dvfy-button (trigger)
- **dvfy-toast** — could compose dvfy-alert internally
- **dvfy-file-upload** — could compose dvfy-button, dvfy-progress
- **dvfy-carousel** — could compose dvfy-button (prev/next)
- **dvfy-sidebar** — could compose dvfy-drawer or dvfy-section
- **dvfy-card, dvfy-gradient-card, dvfy-spotlight-card** — evaluate composition hierarchy
- **dvfy-tree-view** — already has dvfy-tree-node; verify composition reflected in deps

See GitHub issues labeled `taxonomy` + `decomposition` for tracked work.
