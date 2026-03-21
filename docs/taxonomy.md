# Component Taxonomy

## Decision Tree

```
Q1: Does it orchestrate HTMX server interactions?
    YES → Tier 4 (Pattern)

Q2: Does it compose 2+ dvfy-* components or manage cross-component state?
    YES → Tier 3 (Organism)

Q3: Does it use 1-2 Tier 1 components or provide enhanced behavior over native?
    YES → Tier 2 (Composite)

Q4: None of the above (pure tokens + native HTML only)?
    YES → Tier 1 (Primitive)
```

## Tiers

| Tier | Name       | Max dvfy-* deps | Allowed dep tiers | Count |
|------|------------|-----------------|-------------------|-------|
| 1    | Primitive  | 0               | None              | 19    |
| 2    | Composite  | 2               | Tier 1 only       | 13    |
| 3    | Organism   | Unlimited       | Tier 1 + Tier 2   | 3     |
| 4    | Pattern    | Unlimited       | Any               | 5     |

## Domain Assignment

| Domain Key   | Label          | Scope                                        |
|-------------|----------------|----------------------------------------------|
| forms       | Forms          | User input, selection, toggles               |
| display     | Data Display   | Presenting data, content, status              |
| feedback    | Feedback       | Alerts, loading, toasts, modals               |
| navigation  | Navigation     | Wayfinding, menus, breadcrumbs, pagination    |
| layout      | Layout         | Page structure, sections, containers          |
| utility     | Utility        | Theme, tooltips, auth — cross-cutting concerns|
| htmx        | HTMX Patterns  | Server-interaction orchestration              |

## Dependency Constraints

| Rule                                          | Enforcement        |
|-----------------------------------------------|-------------------|
| Tier 1 must not import any `dvfy-*` component | `/new-component`  |
| Tier 2 may import up to 2 Tier 1 components   | `/new-component`  |
| Tier 2 must NOT depend on Tier 2+             | `/new-component`  |
| Tier 3 may depend on Tier 1 and Tier 2        | `/new-component`  |
| Tier 4 may depend on any tier                 | Manual review     |

## Classification Reference

### Tier 1 — Primitives (19)

| Component          | Domain     |
|-------------------|------------|
| dvfy-button       | Forms      |
| dvfy-input        | Forms      |
| dvfy-textarea     | Forms      |
| dvfy-checkbox     | Forms      |
| dvfy-radio        | Forms      |
| dvfy-switch       | Forms      |
| dvfy-slider       | Forms      |
| dvfy-badge        | Display    |
| dvfy-tag          | Display    |
| dvfy-avatar       | Display    |
| dvfy-progress     | Display    |
| dvfy-alert        | Feedback   |
| dvfy-loader       | Feedback   |
| dvfy-hamburger    | Navigation |
| dvfy-tree-node    | Navigation |
| dvfy-drawer       | Layout     |
| dvfy-section      | Layout     |
| dvfy-tooltip      | Utility    |
| dvfy-scroll-reveal| Utility    |

### Tier 2 — Composites (13)

| Component            | Domain     | Dependencies                  |
|---------------------|------------|-------------------------------|
| dvfy-select         | Forms      | —                             |
| dvfy-card           | Display    | —                             |
| dvfy-empty          | Display    | dvfy-button                   |
| dvfy-table          | Display    | dvfy-checkbox                 |
| dvfy-modal          | Feedback   | dvfy-button                   |
| dvfy-toast          | Feedback   | —                             |
| dvfy-breadcrumb     | Navigation | —                             |
| dvfy-pagination     | Navigation | dvfy-button                   |
| dvfy-tabs           | Navigation | —                             |
| dvfy-dropdown       | Navigation | dvfy-button                   |
| dvfy-nav            | Navigation | dvfy-hamburger, dvfy-drawer   |
| dvfy-tree-view      | Navigation | —                             |
| dvfy-theme-switcher | Utility    | —                             |

### Tier 3 — Organisms (3)

| Component      | Domain     | Dependencies              |
|---------------|------------|---------------------------|
| dvfy-accordion| Layout     | dvfy-section              |
| dvfy-sidebar  | Navigation | —                         |
| dvfy-auth     | Utility    | dvfy-input, dvfy-button   |

### Tier 4 — HTMX Patterns (5)

| Component             | Description                                    |
|----------------------|------------------------------------------------|
| dvfy-htmx-form       | AJAX form submission with validation           |
| dvfy-confirm         | Confirmation dialog for destructive actions    |
| dvfy-infinite-scroll | Infinite scroll with hx-trigger="revealed"     |
| dvfy-live-search     | Live search with debounced hx-trigger          |
| dvfy-htmx-table      | Sortable, paginated table with HTMX updates    |
