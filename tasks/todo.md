# Task: Calmer devify-dark surfaces (header/footer)

## G&P
- **Goal:** Darken the devify-dark theme's non-brand blue SURFACES (`--dvfy-surface-raised`,
  `--dvfy-surface-muted`) so the chum-page header/footer sit closer to the deep-indigo page
  background (`--dvfy-surface-page` = indigo-950 #1a1040), keeping WCAG-AA. Brand cyan/pink
  untouched.
- **Purpose:** Header + footer currently use indigo-900 (#1f1558), noticeably brighter than the
  page — they pop too much. A tighter elevation step reads calmer / more premium.
- **Doctrine:** `devify-dark` currently exists ONLY as a page-local Tier-2 theme in devify-me.
  Per token discipline (no local overrides that belong in devify-ui; fix upstream) and the
  `renting-ideal.css` precedent, PROMOTE it into `@devify/ui/tokens/themes/devify-dark.css`
  (faithful port) and apply the surface darkening there. devify-me re-vendors downstream (not me).

## Atomic items
- [x] Locate devify-dark (page-local in devify-me; indigo primitives exist upstream)
- [ ] Create tokens/themes/devify-dark.css (verbatim port + darkened raised/muted)
- [ ] Register devify-dark in scripts/check-contrast.js (real AA CI coverage)
- [ ] Browser e2e (Playwright/chromium, this session): chum page under devify-dark
- [ ] npm run lint + npm run test + npm run contrast green
- [ ] Commit (Jorge, no AI attribution), push, open PR w/ before/after + AA evidence

## Scope guard
- ONLY surface-raised + surface-muted change value. NO brand/primary/accent changes.
- NO devify.css @import (brand themes are by-name, per renting-ideal). NO devify-me edits.
