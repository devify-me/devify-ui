# Migration Guide

This document covers upgrade paths between `@devify/ui` versions. Before the first tagged release, this guide tracks **breaking changes in `main`** that may affect projects consuming the library directly from the repository.

---

## Upgrading to a New Version

### General steps

1. Pull the latest changes (or update the npm version in `package.json`)
2. Read the relevant version section below for breaking changes
3. Update any renamed attributes, tokens, or imports
4. Run `npm run analyze` to regenerate your local `custom-elements.json` if you use the playground
5. Clear browser cache — ES module graphs cache aggressively; removing a file without clearing cache aborts the entire import graph

### Checking for breaking changes

```bash
# See what changed since you last updated
git log --oneline <your-last-commit>..origin/main
git diff <your-last-commit>..origin/main -- components/ tokens/
```

---

## Pre-Release (main branch)

> No stable version has been tagged yet. The sections below will be filled in as versioned releases are cut.

### Breaking changes in main (unreleased)

#### Container Query migration (Issue #25)

All responsive components were migrated from viewport `@media` queries to CSS Container Queries. Components now respond to their **parent container width**, not the viewport.

**Impact:** If you rely on the old viewport-based breakpoints for layout decisions, you may see different behavior.

**Action required:** Wrap responsive components in a container that has a defined width. No attribute or API changes.

```html
<!-- Ensure a wrapping container exists -->
<div class="site-header">
  <dvfy-header brand="My App">...</dvfy-header>
</div>
```

---

## Future Version Sections

Each tagged release will add a section here following this template:

---

## v{N} → v{N+1}

**Released:** YYYY-MM-DD

### Breaking Changes

#### Changed: `<component>` attribute `<old-name>` renamed to `<new-name>`

**Before:**
```html
<dvfy-example old-attr="value">
```

**After:**
```html
<dvfy-example new-attr="value">
```

#### Removed: `<component>` attribute `<name>`

Replaced by `<new-behavior>`. Update any usage before upgrading.

### Token Renames

| Old token | New token | Notes |
|-----------|-----------|-------|
| `--dvfy-old-token` | `--dvfy-new-token` | Reason for rename |

### New Features

Brief list of additions that require opt-in or have behavioral notes.

### Deprecation Notices

List features that are deprecated and will be removed in the next major version.

---

## Design Principles for Versioning

Once versioning is active, `@devify/ui` follows these rules:

- **Patch** (`0.0.x`) — bug fixes, token value tweaks, documentation
- **Minor** (`0.x.0`) — new components, new attributes, new tokens (non-breaking)
- **Major** (`x.0.0`) — removed or renamed attributes, changed event signatures, removed components, token renames

All breaking changes are listed in the relevant migration section before the release is tagged.
