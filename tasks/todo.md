# Task — chum header/heading factory-friction (#396 + #397)

**G&P:** Smooth two reuse-proof frictions found by chum instance #2, in the library, so
instance #3 doesn't re-pay them. Additive, backward-compatible, tokens-only, light-DOM, a11y intact.

## #396 — chum widgets render no `<h1>`
- [ ] `dvfy-optin`: add `heading-level` attr (h1|h2|h3, default **h1**); render hero heading with that tag
- [ ] `dvfy-thank-you`: same `heading-level` attr (default **h1**)
- [ ] Design note: widget owns the h1 (it carries the page's primary promise text) — not the shell
- [ ] Tests: correct tag renders; default is h1; invalid → h1; single-h1 on shell+widget page

## #397 — logo-only header mode
- [ ] `dvfy-chum-page`: add `logo-only` boolean attr
- [ ] `utils/no-nav-shell.js` buildHeader: when `logoOnly && logo`, drop brand-text span, keep logo + alt=brand
- [ ] Tests: logo-only hides brand text, keeps logo + alt; default still shows brand text

## Quality bar
- [ ] JSDoc `@attr` updated (both widgets + shell + NoNavShellOptions typedef)
- [ ] examples/chum-funnel/ — confirm h1 now auto-rendered; drop any now-unneeded markup
- [ ] `npm run analyze` → custom-elements.json
- [ ] `npm run lint` (incl check:taxonomy) PASS
- [ ] `npm run test` PASS (existing chum/campaign tests stay green)
- [ ] One PR, Fixes #396 + #397
