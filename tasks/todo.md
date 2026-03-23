# Issue #32: Tier 2 component audit — 12 composites

**Type:** fix (audit)
**Branch:** feat/32-tier-2-component-audit-12
**Labels:** enhancement

## Components (priority order from checklist)

1. dvfy-select
2. dvfy-dropdown (→ button)
3. dvfy-modal (→ button)
4. dvfy-table (→ checkbox)
5. dvfy-tabs
6. dvfy-card
7. dvfy-empty (→ button)
8. dvfy-toast
9. dvfy-breadcrumb
10. dvfy-pagination (→ button)
11. dvfy-nav
12. dvfy-theme-switcher

## Plan

- [ ] Audit each component against docs/component-review-checklist.md
- [ ] Fix issues in-place (tokens, a11y, disconnectedCallback, JSDoc, keyboard nav)
- [ ] Verify dependency compliance against COMPONENT_REGISTRY
- [ ] Log out-of-scope findings as separate GitHub issues
- [ ] Verify: `npm run analyze` succeeds
- [ ] Ship: push and create PR

## Future
<!-- Unrelated issues discovered during implementation — do NOT fix inline -->
