---
name: new-component
model: sonnet
description: Scaffold a new @devify/ui Web Component. Plans from existing components and issue context, creates component file, registers in barrel/catalog, runs analyzer.
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash(npm run *)
  - AskUserQuestion
---

# /new-component — Scaffold a @devify/ui Web Component

You are creating a new HTML Web Component for the @devify/ui library. You will study existing components to match project patterns, then build a real, functional component — not an empty skeleton.

## Input

The user invokes `/new-component dvfy-{name}`. The argument is the tag name. An optional GitHub issue number may follow (e.g. `dvfy-accordion 12`).

## Step 1: Parse and Validate

- Extract the tag name from `$ARGUMENTS` (e.g. `dvfy-foo-bar`). If a number follows the tag name, treat it as a GitHub issue number.
- **Validate** it starts with `dvfy-`. If not, print an error and stop.
- **Derive class name**: strip `dvfy-` prefix, split on `-`, PascalCase each segment, prepend `Dvfy`. Examples:
  - `dvfy-foo` → `DvfyFoo`
  - `dvfy-foo-bar` → `DvfyFooBar`
  - `dvfy-data-grid` → `DvfyDataGrid`
- Check that `components/dvfy-{name}.js` does not already exist. If it does, print an error and stop.

## Step 2: Research and Plan

Before writing any code, study the codebase to understand conventions and plan the component.

### 2a: Gather context

- If a GitHub issue number was provided, read the issue for requirements (attributes, behavior, acceptance criteria). Do NOT use MCP GitHub tools — just use the information the user provides or that you already have.
- Read 1-2 existing components that are **most similar** to the new one. Choose based on behavioral similarity:
  - Wraps child elements? → Read `dvfy-section.js`, `dvfy-tabs.js`, or `dvfy-dropdown.js`
  - Form control? → Read `dvfy-input.js`, `dvfy-select.js`, or `dvfy-switch.js`
  - Feedback/overlay? → Read `dvfy-modal.js`, `dvfy-toast.js`, or `dvfy-alert.js`
  - Data display? → Read `dvfy-card.js`, `dvfy-table.js`, or `dvfy-badge.js`
  - Navigation? → Read `dvfy-nav.js`, `dvfy-breadcrumb.js`, or `dvfy-tabs.js`
- Read `catalog/data.js` to see the category list.

### 2b: Plan the component

Present a brief plan to the user via AskUserQuestion before building:

1. **Category** — which of the 6 domains (Forms, Data Display, Feedback, Navigation, Layout, Utility)
2. **Server flag** — does it require HTMX/server interaction? (`server: true`)
3. **One-line description**
3. **Planned attributes** — list with types and defaults (derived from issue + similar components)
4. **Key behavior** — 2-3 bullet points on what the component does
5. **Child elements** — what goes inside it (slots, expected children)
6. **Reference component** — which existing component's pattern you're following

Ask the user to confirm or adjust. This is a single AskUserQuestion with options like:
- "Looks good, build it"
- "Let me adjust" (user types corrections)

## Step 3: Create Component File

Write `components/dvfy-{name}.js` as a **complete, functional component** — not a skeleton. Follow these patterns exactly (learned from existing components):

### Required patterns

1. **STYLES const** at top — real CSS using semantic tokens (`--dvfy-*`), not placeholders/TODOs
2. **Two JSDoc blocks**:
   - First: usage comment with attributes list and HTML examples
   - Second: WCA-compatible JSDoc with `@element`, `@attr`, `@event`, `@slot`, `@cssprop`
3. **Class structure**:
   - `static #styled = false` — one-time style injection
   - `connectedCallback()` — inject styles, build DOM
   - `static get observedAttributes()` — return real attribute names
   - `attributeChangedCallback()` — react to attribute changes
   - Private methods for DOM construction and behavior
4. **ARIA** — roles, aria-expanded, aria-labels as appropriate
5. **Keyboard** — handle Tab, Enter, Space, Escape, Arrow keys as appropriate
6. **Event listeners** — add in `connectedCallback`, remove in `disconnectedCallback`

### Do NOT

- Leave TODO comments in attributes or styles
- Use `variant` as a placeholder attribute
- Create an empty `attributeChangedCallback`
- Omit keyboard navigation
- Use viewport media queries (use Container Queries if responsive behavior is needed)

## Step 4: Add Import to devify.js

Read `devify.js` and add the import line at the end of the **Wave 3** section — immediately **before** the `// HTMX Integration Patterns` comment line.

Insert: `import './components/{tagName}.js';`

## Step 5: Add DEFAULT_CONTENT Entry

Read `components/dvfy-component-playground.js` and add an entry to the `DEFAULT_CONTENT` object.

The value MUST be **actual HTML** that demonstrates the component in the playground — not a description string. Look at existing entries for the pattern:
- `'dvfy-tabs'` has child `<dvfy-tab>` elements with content
- `'dvfy-dropdown'` has a trigger button and menu items
- `'dvfy-breadcrumb'` has anchor and span children
- `'dvfy-section'` has paragraph content

Add as the last entry before the closing `};`.

## Step 6: Verify Catalog Registration

`COMPONENT_CATEGORIES` is derived from `COMPONENT_REGISTRY` — no separate step needed. Verify the component appears in the correct domain by checking the registry entry added in Step 2b. If the component requires server interaction, ensure `server: true` is set in the registry entry.

## Step 7: Run Analyzer

Run `npm run analyze` in the project root (`/home/grob/devify/devify-ui`).

Verify it completes without errors. If it fails, diagnose and fix.

## Step 8: Report

Print a summary:

```
## Component created: {tagName}

**Files created:**
- `components/{tagName}.js` — {brief description of what was built}

**Files modified:**
- `devify.js` — import added
- `components/dvfy-component-playground.js` — DEFAULT_CONTENT with demo HTML
- `catalog/data.js` — added to {Category}

**Attributes:** {list the attrs}
**Keyboard:** {list key interactions}

**What to verify:**
1. Run `npm run serve` and check the catalog
2. Test keyboard navigation
3. Test exclusive/interactive behavior
4. Review ARIA roles in browser DevTools
```
