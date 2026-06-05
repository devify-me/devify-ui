# @devify/ui — Tool Operating Context

A Claude session with `cwd` here is **working on `@devify/ui`**, the Devify design system: a zero-build HTML Web Component library (~54 components + HTMX patterns) and the three-tier design-token system that every Devify project themes against. No framework, no bundler — just HTML, CSS, and ES modules. This file is the always-loaded spine; load the docs below on demand (Precision Context).

## Status

Active and maintained (v0.2.0, recent component work through 2026-06). This is `tools/` (shared platform tooling), not `studio/` — standards are governed by `studio/`; this repo builds the components everything else consumes.

## Where knowledge lives (load on need)

- `README.md` — what it is, install/usage, full component list, theming, file structure. Start here.
- **Live catalog** — `npm run serve` → `http://localhost:8090/catalog/` for interactive examples + the API viewer (driven by `custom-elements.json`).
- `docs/` — durable knowledge: `taxonomy.md` (component categories), `conventions.md` (cross-component design decisions + static-check allowlisting), `new-component-checklist.md`, `component-review-checklist.md`, `consuming-projects.md`, `a11y-testing-guide.md` / `wcag-compliance.md` / `wcag-contrast-audit.md`, `pwa.md`, `releasing.md`, `migration.md`, `specs/`.
- `CONTRIBUTING.md`, `FORM_VALIDATION_PATTERN.md` — contribution + form patterns.
- `.claude/skills/` — project skills: `new-component`, `catalog-review`.
- `tasks/todo.md` — current work item / scope.

## Architecture & gotchas (know before you change things)

- **Three-tier tokens:** primitives (`tokens/*.css`) → semantics (`tokens/themes/*.css`: light, dark, devify-cyan, devify-pink) → component-scoped overrides. **All color must flow through `--dvfy-*` semantic tokens** — no hardcoded literals. This is the contract that makes theming work, and it is the same token system the studio `design-thinking` skill requires *consuming* projects (rueda etc.) to design against.
- **Light DOM only** (no Shadow DOM) — required for HTMX compatibility. Attributes are the component API.
- **Zero build step** — ES modules served directly; `devify.css` + `devify.js` are the bundles consumers import.
- **`dvfy-` prefix** on all element + class names. Container queries (parent width), not viewport, on responsive components.
- **Static gates enforce the above:** `npm run lint` runs eslint + stylelint + `check:tokens` (no hardcoded colors) + `check:dvfy-pref` (prefer `<dvfy-*>` over native). Tests: `npm run test` (web-test-runner + Playwright). Regenerate the manifest after API changes: `npm run analyze` → `custom-elements.json`. See `docs/conventions.md` for the allowlisting mechanisms.

## Conventions

Devify standards apply — see root `~/devify/CLAUDE.md` + `studio/`: G&P before building, Verification-Before-Completion, branch+PR (never push to main), commit author = Jorge, no AI attribution in git, never read secret files. Repo-specific component/contribution rules live in `docs/` (above), not here.
