# Stratified UI Taxonomy — Components / Widgets / Layouts

**Status:** Design (approved in brainstorming, pending spec review)
**Date:** 2026-07-23
**Repos:** `@devify/ui` (taxonomy + widgets/layouts), `rueda` (first consumer + page runtime)
**Related:** rueda#84 (authoring-surface refactor, origin), rueda#83 (variant-readiness), studio#33 (onboarding taxonomy), studio#34 (pattern registry)

## Goal & Purpose

**Goal:** Evolve `@devify/ui`'s single 5-tier composition ladder into three honest strata — **Components** (classified by composition depth), **Widgets** (self-contained sections, classified by role), and **Layouts** (page/flow scaffolds, classified by flow-category) — and define how a funnel page is assembled and A/B-tested from them.

**Purpose:** The Devify funnel factory needs funnel pages to be *data-describable* so machine-generated variants can render without code, and needs a library structure that maps cleanly onto how funnels are actually built and tested. The current taxonomy forces two orthogonal questions — *"what is it built from?"* (depth) and *"what job does it do?"* (role) — onto one ladder; that conflation is why Tiers 4–5 stayed under-defined — even though a Layout-shaped component (`dvfy-campaign-layout`) already ships, the taxonomy never named it as one. Separating the axes makes the library legible, gives A/B testing a coherent shape, and turns the taxonomy into the funnel-onboarding intake structure itself.

## Context & motivation

- The A/B/LP engine is already built and wired (typed axes copy/media/theme/`component-layout`, sticky bucketing, source-attributed beacons, z-test + two-gate validity). `KindComponentLayout`/`ComponentLayoutPayload` exists (a composition-tree payload) but is **unused by any live axis** — this design gives it its job.
- Renting Ideal's frontend is high-ceremony (a testable element is smeared across ~5 files/2 repos; only the hero is variant-ready). The origin issue rueda#84 was "collapse the ceremony"; the brainstorming grew it into a data-driven page whose sections are `@devify/ui` widgets.
- RI **is** a Quiz/Advisor funnel (landing → questionnaire steps → results), so it is the natural first instance from which the Quiz layout-category and the widget roles are *extracted* (Principle #11: pulled by a live instance, never anticipated).

## The model — three strata

| Stratum | What it is | Grouped by (Axis A) | Sub-classified by (Axis B) | Members | Grouping purpose |
|---|---|---|---|---|---|
| **Components** | Generic, reuse-anywhere building blocks | **Domain** (forms, display, feedback, navigation, layout, utility) | **Tier** (composition depth 1–3, extensible) | individual components | building material to **compose** |
| **Widgets** | Self-contained functional sections | **Domain** (navigation, conversion, social-proof, content, input) | **Role** (header, hero, how-it-works, trust-strip, faq, footer, cta-band, quiz-step…) | **instances** (header-1/2/3) | **OR-set** — choose / A/B-test **one** |
| **Layouts** | Page/flow scaffolds | **Category / Flow** (landing, quiz, form, about, dashboard, checkout) | **Page-role** (landing, step, result, thank-you…) | layout instances | **AND-set** — build **all** required pages |

Widgets and Layouts carry the same cross-cutting flags Components do (e.g. `server: true` for HTMX-backed pieces).

### The OR vs AND distinction (the crux)

- **Widget groups are OR-sets.** `header-1 / header-2 / header-3` are interchangeable alternatives for one role. You group them **to select — or A/B-test — one.**
- **Layout groups are AND-sets.** `quiz-landing + quiz-step + quiz-result` are the pages a flow *requires*. You group them **to ensure you build all of them** (a bill-of-materials).

This maps directly onto funnel onboarding: choosing a **Layout-category** yields the AND-set of pages to build; choosing a **Widget** per slot is the OR-set to pick/test. The taxonomy is the intake structure (see studio#33).

## The composition law (the one cross-stratum rule)

Preserves the acyclic, layered guarantee the old forcing-function gave us:

> **Layouts** compose **Widgets** (+ Components for glue). **Widgets** compose **Components** only. **Components** compose lower-tier **Components** only. **Never sideways, never up.**

Consequences: a Widget never depends on another Widget (roles are siblings); a Layout never depends on another Layout; nothing depends upward. This is the enforcement contract for `/new-component`.

## Enforcement & registry schema

Classification today is *dependency-derived* and mechanically checked by `/new-component`. Under the new model, **stratum and role/category are human-declared, not derivable** from dependencies — a hero and a footer have similar deps but different roles. Therefore:

- Add declared fields to each component's registry metadata / `custom-elements.json` entry: `stratum` (`component` | `widget` | `layout`), plus `domain`+`tier` (components), `domain`+`role` (widgets), or `category`+`page-role` (layouts).
- `/new-component` records these declared fields and continues to **auto-derive and enforce the composition-law dependency checks** (Layouts→Widgets→Components, no sideways/up, component sub-tier rules). Only the composition constraints are dependency-derived; stratum/role/category are declared and validated for *presence*, not inferred.
- **Widget content API:** widgets are manifest symbols whose **attribute/slot content API is declared** in `custom-elements.json`, so a slot's `copy`/`media` variants can be validated against the widget's declared content slots by the existing admission gate.

## Classification guide (which stratum?)

1. **Generic building block, reusable in any context** (button, card, `dvfy-section-hero` shell, accordion) → **Component** (classify by Domain × Tier).
2. **Self-contained section tied to a functional role**, content flows in via its attribute API (header, hero, faq, quiz-step) → **Widget** (classify by Domain × Role).
3. **A page/flow scaffold composed of widgets** → **Layout** (classify by Category × Page-role).

**Discriminator (decidable).** A piece is a **Widget** iff (i) it serves **one** page/funnel role AND (ii) it receives its *content* through an attribute/slot API (a container you pour content into). It is a **Component** if it is reused **structurally across unrelated contexts** and is not tied to a single page role (raw material). It is a **Layout** if it arranges widgets into a page.

Applied to today's ambiguous cases (pre-decided, not "to review"): `dvfy-nav-bar` → **Widget** (serves the header/nav role, takes items via API); `dvfy-auth` → **Widget** (self-contained auth flow); `dvfy-command-palette`, `dvfy-sidebar` → **Component** (generic overlay/structure reused across unrelated contexts, no single funnel role); `dvfy-campaign-layout` → **Layout** (already-shipping page scaffold).

## A/B mapping

The contract (`lp-variant-list/v1`, `devify-framework/modules/lp/types.go`) has two load-bearing invariants the model must respect: **one axis == one §8 slot** (page-global `theme` is the sole `*` exception) and **exactly one control per axis**. `ComponentLayoutPayload` is a **composition tree** (`Node{Root, Attrs, Children}`, each `Root` validated against the pinned manifest), *not* a flat "registry key."

Three variant granularities, phased by what RI actually needs:

| Granularity | What changes | Contract axis | Status |
|---|---|---|---|
| **Content** | same widget, different headline/image | `copy` / `media` — one axis per slot, data flows into the widget | **Build now** (RI already does this for hero) |
| **Widget** | a different section *design* (hero-1 vs hero-2) | `component-layout` — a self-contained structural variant for the slot | **Deferred** (until an instance tests two designs) |
| **Layout** | a different page *arrangement* of widgets | `component-layout`, page-global | **Deferred** (needs a page-global-slot convention; design when pulled) |

(The `offer` axis is upstream/non-render — it feeds copy, it is not a rendered slot — so it is excluded from this render-time table.)

**Coherence rule (resolves the cross-product trap).** A widget-selection or layout-selection variant is **self-contained**: its `ComponentLayoutPayload` carries the widget/layout *with its content*. We do **not** put an independent widget-selection axis and independent `copy`/`media` axes on the **same** slot — their independent sticky bucketing would yield incoherent combinations (hero-2 structure rendered with copy authored for hero-1's structure). So per slot, exactly one of: (a) content A/B within a fixed widget (copy/media axes), or (b) a structural A/B whose variants each bundle their own content — never both crossed.

**Why widget/layout selection is deferred, not dropped.** RI's real need today is content A/B within fixed widgets + theme, which the contract already supports cleanly one-axis-per-slot. Structural (widget) and page (layout) selection are the model's declared *direction*, but their mechanics — the page-global slot convention for layout selection, and the self-contained-variant encoding for widget selection — are specified and built only when a live instance pulls them (#11). No new contract kind is introduced now; `fwlp.ParseTOML`/`fwlp.Validate` are reused unchanged.

## Boundary: library is descriptive; the app owns runtime

A Layout-category names *which* page-roles exist and their intended *order* (landing → step → result), but the **runtime flow** (routing, "next step", session/state) is **application** logic (rueda), not the library's. `@devify/ui` stays presentational: components/widgets/layouts are shared and catalog-visible; the page **runtime** (section-model resolution, render loop, contract-derived experiment registration, typed payload resolver) is **rueda-local**, extractable to the framework only when a second funnel pulls it (#11).

## Application to Renting Ideal (first instance)

- **Layout category:** Quiz/Advisor funnel. Page-roles (AND-set) extracted from RI's real pages: `landing`, `quiz-step`, `results` (+ `transparency` asset page).
- **Widget roles (OR-sets) extracted from RI's real sections:** header, hero, how-it-works, trust-strip, faq, footer-cta, quiz-step-form, results-card.
- **rueda page runtime (rueda-local):** authored TOML describes an ordered list of section slots (each: role + content, content fields A/B-able) → the render loop maps each slot to a **fixed base `@devify/ui` widget** (the section-model — a single-control `component-layout` assignment that carries **no variants**, so it is not an experiment and does not trip the one-axis-one-slot/coherence rules) and feeds it campaign-resolved `copy`/`media` content. **The only live experiment axes at build-now are `copy`, `media`, and `theme`;** widget-selection (a *varied* `component-layout` axis) stays deferred until an instance pulls it. Then: `WithExperiments` derived from the contract (deletes the hand-restated list at `cmd/app/main.go:~158-162`) → per-*kind* typed payload resolvers replace per-axis accessors in `modules/lp/variants.go`.

Result: adding a variant or a slot of a known role = **TOML only**; a genuinely new role/design = create/reuse a `@devify/ui` widget (catalog-visible), then reference it in TOML.

## Migration & scope

**Bounded re-classification audit** (NOT a full re-litigation): the Tier-1 primitives stay Components. Pre-decided movers: `dvfy-nav-bar` → **Widget** (header/nav), `dvfy-auth` → **Widget** (self-contained flow), `dvfy-campaign-layout` → **Layout** (it already ships as a page scaffold but the current taxonomy omits it entirely — absent from all tiers — while reporting Tier 5 = 0; the audit corrects this). Staying Components: `dvfy-command-palette`, `dvfy-sidebar`. **Note:** the current `taxonomy.md` counts (52/13/4, Tiers 4–5 = 0) are already stale given `dvfy-campaign-layout`; the audit re-derives accurate per-stratum counts. Estimated ~5–15 move.

**Touch points:** `docs/taxonomy.md` (the model), the catalog top-level navigation/grouping (three sections), `/new-component` enforcement checks (per-stratum rules), and `custom-elements.json` grouping. A studio ADR records the governed-standard change.

## Non-goals / discipline (#11)

- Do **not** build a widget zoo. Build only the widgets RI renders now; fan out alternate instances (hero-2, header-2…) only when an A/B test names a specific challenger (Phase 2 research→variants loop).
- Do **not** promote the page runtime to `devify-framework` yet — rueda-local until funnel #2.
- Do **not** re-classify the 52 primitives; the audit is bounded to self-contained/role units.
- No new A/B contract kind; reuse `lp-variant-list/v1`.

## Phased plan

1. **Lock the model** — update `docs/taxonomy.md` to the three strata + Domain×Tier / Domain×Role / Category×Page-role scheme + the composition law; studio ADR. Update catalog IA + `/new-component` enforcement + manifest grouping.
2. **Bounded audit** — re-classify the ~5–15 Widget/Layout candidates.
3. **rueda page runtime** (rueda#84) — section-model + render loop + contract-derived registration + typed resolvers.
4. **Build RI's widgets + Quiz layout** (feeds rueda#83) — the section widgets RI actually renders, in `@devify/ui`; assemble the RI layout from them.

## Testing / verification

- **Taxonomy:** `/new-component` enforces the composition law per stratum; `npm run lint` + `npm run test` green; `npm run analyze` regenerates `custom-elements.json`; catalog shows three strata correctly grouped.
- **Widgets:** each new widget has a `.test.js` (web-test-runner + `@open-wc/testing`), passes contrast/a11y gates, renders in the catalog with its role/domain metadata.
- **rueda runtime:** `templ generate` + `make build` + `make test` green; at `127.0.0.1:8090` (via `make dev`), each slot renders its assigned widget + resolved content, beacon fires impression on render + conversion on `data-campaign-cta` click, counts visible via `GET /lp/track/results/{experiment_id}`.
- **Ergonomics acceptance (rueda#84):** adding N variants to a slot is a single-file TOML diff proven by a passing test + a visible swap; `main.go` and per-axis Go do not grow.

## Open questions / risks

- **Widget-domain granularity:** start with 5 widget domains (navigation/conversion/social-proof/content/input); refine if the catalog needs finer grouping. Tags (vibe/industry) deferred until a real need pulls them.
- **Layout flow-order representation:** the library records page-roles + intended order descriptively; if a richer flow-graph is later needed, add it when a second flow-category demands it.
- **`dvfy-section-hero` vs a `hero` widget:** the former is a reusable *component* (hero shell); the latter is the opinionated *widget* that composes it. Keep both; document the relationship in the audit.

## Cross-references

- `docs/taxonomy.md` — the standard this updates.
- `tools/devify-framework/modules/lp/` (`lp-variant-list/v1`, `KindComponentLayout`), `modules/lptrack/`, `modules/campaign/` — the A/B contract + runtime consumed.
- studio#33 (onboarding taxonomy — the intake this feeds), studio#34 (pattern registry — where won widgets/variants promote).
