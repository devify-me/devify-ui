# Contributing to @devify/ui

Welcome! This guide covers everything you need to contribute a new component, fix a bug, or improve the design system.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Architecture](#project-architecture)
- [Component Naming Conventions](#component-naming-conventions)
- [File Structure](#file-structure)
- [Token Usage](#token-usage)
- [Adding a New Component](#adding-a-new-component)
- [PR Process](#pr-process)
- [Code Style](#code-style)

---

## Development Setup

```bash
git clone git@github.com:devify-me/devify-ui.git
cd devify-ui
npm install
npm run serve       # catalog at http://localhost:8090/catalog/
npm run analyze     # regenerate custom-elements.json manifest
```

---

## Project Architecture

**Core principles:**

- **Zero build step** — ES modules + CSS custom properties served directly
- **Light DOM only** — no Shadow DOM; required for HTMX compatibility
- **Attributes as API** — all state is exposed via HTML attributes
- **Three-tier tokens** — Primitives → Semantics → Component overrides
- **Container Queries** — components respond to parent width, not viewport

See `docs/taxonomy.md` for component tier classification rules.

---

## Component Naming Conventions

| Concern | Convention | Example |
|---------|-----------|---------|
| Element name | `dvfy-` prefix, kebab-case | `dvfy-spinner-ring` |
| CSS classes | `dvfy-` prefix, kebab-case | `.dvfy-spinner-ring` |
| CSS custom properties | `--dvfy-` prefix | `--dvfy-spinner-size` |
| JS class | PascalCase, no prefix | `SpinnerRing` |
| JS file | matches element name | `dvfy-spinner-ring.js` |

**Never** use Shadow DOM. **Never** use framework imports. **Never** hardcode colors, spacing, or font sizes — always reference a design token.

---

## File Structure

```
components/dvfy-<name>.js     # Component implementation
devify.js                     # Add barrel import here
catalog/data.js               # Add COMPONENT_REGISTRY entry + COMPONENT_CATEGORIES
components/dvfy-component-playground.js  # Add DEFAULT_CONTENT entry
docs/                         # Taxonomy, checklists, migration guide
custom-elements.json          # Auto-generated — do not edit by hand
```

---

## Token Usage

Always use **semantic tokens** (Tier 2), never primitives (Tier 1) inside component CSS:

```css
/* Correct */
color: var(--dvfy-text-primary);
background: var(--dvfy-surface-card);
border-color: var(--dvfy-border-subtle);

/* Wrong — breaks theming */
color: var(--dvfy-slate-900);
background: var(--dvfy-cyan-100);
```

Available semantic tokens are defined in `tokens/themes/light.css` and `tokens/themes/dark.css`.

---

## Adding a New Component

Use the `/new-component dvfy-<name>` Claude Code skill which automates all steps. To do it manually:

### 1. Plan the component

Before writing code, answer:
- What tier does it belong to? (see `docs/taxonomy.md`)
- What attributes does it expose?
- What events does it fire?
- What slots does it have?
- What existing components does it depend on?

### 2. Create the component file

`components/dvfy-<name>.js` — follow this structure:

```javascript
/**
 * Brief one-line description.
 *
 * @attr {string} variant - primary | secondary | ghost
 * @attr {boolean} disabled - Disable the component
 *
 * @event {CustomEvent} change - Fires when value changes, detail: { value }
 *
 * @slot - Default slot for content
 *
 * @cssProperty {color} --dvfy-<name>-bg - Background color override
 *
 * @example
 * <dvfy-<name> variant="primary">Content</dvfy-<name>>
 */
class DvfyName extends HTMLElement {
  static #styleInjected = false;

  static get observedAttributes() {
    return ['variant', 'disabled'];
  }

  connectedCallback() {
    DvfyName.#injectStyles();
    this.#render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal) this.#render();
  }

  disconnectedCallback() {
    // Remove event listeners, observers, timers
  }

  static #injectStyles() {
    if (DvfyName.#styleInjected) return;
    DvfyName.#styleInjected = true;
    const style = document.createElement('style');
    style.textContent = `/* component CSS using --dvfy-* tokens */`;
    document.head.appendChild(style);
  }

  #render() {
    // Build innerHTML
  }
}

customElements.define('dvfy-<name>', DvfyName);
```

### 3. Add to barrel file

`devify.js`:
```javascript
import './components/dvfy-<name>.js';
```

### 4. Add catalog entry

`catalog/data.js` — add to `COMPONENT_REGISTRY`:
```javascript
'dvfy-<name>': {
  tier: 1,           // 1–5, see docs/taxonomy.md
  domain: 'display', // forms | display | feedback | navigation | layout | utility
  deps: [],          // other dvfy-* components this depends on
  // server: true,   // add if component requires HTMX/server backend
},
```

Also add to the relevant `COMPONENT_CATEGORIES` array.

### 5. Add playground demo

`components/dvfy-component-playground.js` — add to `DEFAULT_CONTENT`:
```javascript
'dvfy-<name>': `<dvfy-<name>>Demo content</dvfy-<name>>`,
```

Show a single, representative instance. No multiple variants.

### 6. Regenerate manifest

```bash
npm run analyze
```

Check that your component appears correctly in `custom-elements.json`.

### 7. Self-review

Use `docs/component-review-checklist.md` to verify the component before opening a PR. Also see `docs/new-component-checklist.md` for a creation-focused checklist.

---

## PR Process

1. **Branch** — use conventional branch names: `feat/dvfy-<name>`, `fix/dvfy-<name>-<issue>`, `refactor/<area>`
2. **Commits** — use [Conventional Commits](https://www.conventionalcommits.org/): `feat(components): add dvfy-<name>`
3. **PR title** — keep under 70 characters, use present tense
4. **PR body** — describe what changed and why; include screenshot/demo if visual
5. **Checklist** — all items in `docs/component-review-checklist.md` must pass
6. **No build artifacts** — do not commit `custom-elements.json` changes unless they are part of the feature (run `npm run analyze` and include the output)

### Commit message format

```
feat(components): add dvfy-spinner-ring — animated ring loader
fix(dvfy-modal): restore focus on close
refactor(tokens): consolidate border radius scale
docs: add migration guide for v1 → v2
```

---

## Code Style

- **ES2022+** — use private class fields (`#field`), static blocks, optional chaining
- **No TypeScript** — plain JS with JSDoc for type hints; WCA reads the JSDoc
- **No external dependencies** — zero runtime deps; dev deps only for tooling
- **CSS in JS** — component styles live in the JS file, injected once via static flag
- **Attribute names** — kebab-case (`scroll-shrink`); JS property accessors use camelCase
- **Boolean attributes** — presence = true, absence = false (like `disabled`, `hidden`)
- **Events** — always `bubbles: true`; name with past tense verb (`change`, `select`, `close`)

---

## Resources

- `docs/taxonomy.md` — component tier classification and dependency rules
- `docs/component-review-checklist.md` — audit checklist for production readiness
- `docs/new-component-checklist.md` — step-by-step checklist for new components
- `docs/migration.md` — upgrade paths between library versions
- `catalog/data.js` — `COMPONENT_REGISTRY` and `TIERS` reference
