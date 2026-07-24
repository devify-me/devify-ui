# Component Taxonomy

`@devify/ui` is organized into **three strata**, each answering a different question:

| Stratum | Question it answers | Classified by | Grouping semantics |
|---------|---------------------|---------------|--------------------|
| **Components** | *What is it built from?* | **Domain × Tier** (composition depth 1–3) | building material — you **compose** them |
| **Widgets** | *What section-role does it play?* | **Domain × Role** | **OR-set** — choose / A/B-test **one** (hero-1 vs hero-2) |
| **Layouts** | *What page/flow is it?* | **Category × Page-role** | **AND-set** — build **all** pages a flow requires |

Strata is the **primary axis**; Tier depth applies **only within Components**. Full design rationale: `docs/specs/2026-07-23-stratified-ui-taxonomy-widgets-layouts-design.md`.

## Design principle

The taxonomy is a **forcing function**. Within Components, each Tier earns its place by composing at least one component from the Tier below — a component that feels too complex for its Tier but has zero deps is a signal to decompose, not to create an escape hatch. Across strata, composition flows strictly downward (below).

HTMX server interaction is **orthogonal** — components are classified by composition/role, with a `server: true` flag for those requiring a backend.

## The composition law (strict downward, never sideways/up)

> **Layouts** compose **Widgets** (+ Components for glue). **Widgets** compose **Components** only. **Components** compose lower-Tier **Components** only.

Consequences: a Widget never depends on another Widget (roles are siblings); a Layout never depends on another Layout; nothing depends upward. This preserves an acyclic, clearly-layered dependency graph.

## OR-sets vs AND-sets (why the two role/category groupings differ)

- **Widget groups are OR-sets.** `header-1 / header-2 / header-3` are interchangeable alternatives for one role. You group them **to select — or A/B-test — one.**
- **Layout groups are AND-sets.** `quiz-landing + quiz-step + quiz-result` are the pages a flow *requires*. You group them **to ensure you build all of them** (a bill-of-materials).

This maps onto funnel onboarding: choosing a Layout-category yields the AND-set of pages to build; choosing a Widget per slot is the OR-set to pick/test.

## Classification decision tree

```
Q1: Is it a page/flow scaffold arranging widgets?           → Layout  (declare category + pageRole)
Q2: Is it a self-contained section serving ONE role,
    receiving content via an attribute/slot API?            → Widget  (declare domain + role)
Q3: Otherwise — a generic building block reused
    structurally across unrelated contexts:                 → Component (declare domain + tier)
      Q3a: Zero dvfy-* deps?              → Tier 1 (Primitive)
      Q3b: Composes only Tier 1?         → Tier 2 (Composite)
      Q3c: Composes ≥1 Tier 2?           → Tier 3 (Organism)
```

Decidable discriminator: a piece is a **Widget** iff (i) it serves **one** page/funnel role AND (ii) it receives its content through an attribute/slot API. It is a **Component** if it is reused structurally across unrelated contexts and is not tied to a single role. It is a **Layout** if it arranges widgets into a page.

## Registry schema (the single source of truth)

Classification is declared in `catalog/data.js` → `COMPONENT_REGISTRY` (NOT in `custom-elements.json`, which is a generated API manifest). Per-entry fields by stratum:

| Stratum | Declares | Example |
|---------|----------|---------|
| Component | `tier` (1–3), `domain`, `deps[]`, `server?` | `{ tier: 2, domain: 'forms', deps: ['dvfy-input'] }` |
| Widget | `strata:'widget'`, `domain`, `role`, `deps[]`, `server?` | `{ strata:'widget', domain:'navigation', role:'header', deps:[...] }` |
| Layout | `strata:'layout'`, `category`, `pageRole`, `domain`, `deps[]` | `{ strata:'layout', category:'landing', pageRole:'landing', deps:[...] }` |

Components imply `strata:'component'` (they carry `tier`) — read the effective stratum via `strataOf(meta)`.

**Catalog surfaces (keep in sync).** A classification change touches four catalog files that mirror the taxonomy: `catalog/data.js` (the registry — source of truth), `catalog/sidebar.js` (the nav grouping), `catalog/overview.js` (the *Composition Model* page), and `catalog/router.js` (the tier/component detail views). Any code iterating tiers must derive from `Object.keys(TIERS)`, never a hardcoded `[1..5]`. Update all four; this doc is the human mirror.

## Enforcement

`scripts/check-taxonomy.mjs` (wired into `npm run lint` as `check:taxonomy`) is a **deterministic gate** validating, from the registry: dependency integrity (every dep is registered), per-stratum presence rules (component→tier, widget→role, layout→category+pageRole), the strict-downward composition law, and the Component Tier forcing-function (Tier N composes ≥1 Tier N-1). Violations fail CI. This replaces the previous manual-only review for Tiers 4/5.

`/new-component` records the declared stratum/role/category; the composition-law checks are auto-derived by the gate above.

## Domains

`forms` · `display` (Data Display) · `feedback` · `navigation` · `layout` · `utility`. Domains apply to Components and Widgets; Layouts use **Category** (landing, quiz, form, about, dashboard, …) × **Page-role** (landing, step, result, …) instead.

## Current classification

The live, authoritative listing is the catalog (Strata / Tier / Domain views) and `COMPONENT_REGISTRY`. Summary:

- **Components** — the building blocks, Tiers 1–3 (Primitives / Composites / Organisms) across the six domains. This is the bulk of the library.
- **Widgets** — `dvfy-nav-bar` (navigation / role: header) and `dvfy-auth` (utility / role: auth), reclassified from Tier 3 in #386. Renting Ideal's section widgets (hero, how-it-works, trust-strip, faq, footer-cta, quiz-step) land here as they are built.
- **Layouts** — `dvfy-campaign-layout` (category: landing, page-role: landing) — the no-nav 1:1-attention LP shell; the first Layout.

### HTMX / server components

`server: true` is a property, not a stratum. Current: `dvfy-infinite-scroll`, `dvfy-live-search`, `dvfy-htmx-table` (Tier 1), `dvfy-htmx-form`, `dvfy-confirm` (Tier 3). The catalog surfaces these via a "server" suffix; they appear in their functional domain, not a separate HTMX category.

## A/B testing (how strata map to the LP variant contract)

Widgets and Layouts are what the funnel A/B engine selects between. Three variant granularities map onto the `lp-variant-list/v1` contract:

- **Content** (same widget, different copy/image) → `copy` / `media` axis. *(Live today.)*
- **Widget selection** (hero-1 vs hero-2) → `component-layout` axis, self-contained variant. *(Deferred until a live instance pulls it — see the design spec.)*
- **Layout selection** (page arrangement) → page-global `component-layout`. *(Deferred.)*

No A/B contract change is introduced by this taxonomy; widget/layout-selection axes are designed but not built yet (Instance Gate #11).

## Decomposition backlog

Tier-1 components that are candidates for future decomposition to earn a higher Tier through genuine composition (tracked in `catalog/data.js` `DECOMPOSITION_BACKLOG` and GitHub issues labeled `taxonomy` + `decomposition`): `dvfy-select`, `dvfy-date-picker`, `dvfy-tabs`, `dvfy-pagination`, `dvfy-dropdown`, `dvfy-toast`, `dvfy-file-upload`, `dvfy-carousel`, `dvfy-sidebar`, `dvfy-card` / `dvfy-gradient-card` / `dvfy-spotlight-card` (hierarchy), `dvfy-tree-view`.
