# @devify/ui Tasks

**Living task list. Use atomic, verifiable items. Commit after each logical step.**

Follow studio/ standards: G&P, Verification Before Completion, citations to `studio/docs/operating-model/`, learn/ for synthesis.

**Scope note**: This is "tools work" per `studio/shared/sergio-layout.md` Scope Rules. Coordinate with studio/ for VEmployee-impacting changes.

## Current Focus — devify-ui#375: optional media slot on dvfy-section-hero (WS-2a)

G&P: Add an optional `media` slot to `dvfy-section-hero` accepting `<img>` / `<dvfy-carousel>` /
`<dvfy-compare-slider>`, with `media-position` (left|right|above|below) + `aspect-ratio` layout
control — enabling the `hero.media` A/B variant axis. No-media usage renders byte-identical to
today (text-centric hero). Branch: `feat/375-hero-media-slot`.

Design decision (design-thinking, EXISTING tokens only): CSS-only layout (component logic stays
injectStyles + an aspect-ratio attr mirror, since CSS can't read attr values inside aspect-ratio).
Two-column (left/right) collapses to single column below 48rem container width — reuse the
library's `@container (min-width: 48rem)` convention (same as dvfy-grid). Column gap =
`--dvfy-space-8` (fluid clamp like the hero's padding); media radius = `--dvfy-radius-lg`;
aspect mirrored into `--dvfy-hero-media-aspect`.

- [x] TDD: no-media regression, img render, carousel render, position attr, aspect mirror (16 tests)
- [x] Implement: CSS layout (left|right|above|below) + container-query collapse + aspect mirror
- [x] JSDoc @slot media + @attr media-position / aspect-ratio + @cssprop
- [x] npm run analyze (manifest), test (1476 pass), lint, contrast:ci (120 pass) green
- [ ] PR Closes #375

## Prior Focus — devify-ui#363: dvfy-button native href navigation

G&P: Give `dvfy-button` first-class `href` support so the host renders/behaves as a real
link (navigates on click + Enter, `role="link"`, supports `target`/`rel` with safe `rel`
defaults for `target=_blank`). When `href` is absent, behavior is unchanged (a real button).
All existing variant/size/state styling (targets the host directly) preserved — no wrapper.
Removes the `<a pointer-events:none>` hack rueda's N5 rebuild must not carry.
Branch: `feat/363-button-href`.

- [ ] TDD: tests for href click-nav, Enter-nav, target/rel + _blank rel defaults, a11y role=link, no-href regression
- [ ] Implement: href → role=link, navigation on click/Enter respecting target; sanitizeHref; disabled/loading suppress nav
- [ ] JSDoc @attr for href/target/rel
- [ ] npm run analyze (manifest), test, lint, contrast:ci green
- [ ] PR Closes #363

## Prior Focus — devify-ui#372: Page-composition primitives (LP-Factory N1 / G2)

G&P: Replace rueda's ~24 invented utility classes with 4 sanctioned, manifest-declared
light-DOM primitive families bound to EXISTING tokens — the composition vocabulary the
LP factory's `ui:verify` gate (#305) validates against. Spec: studio
`roadmaps/lp-factory-poc/session-2-seam-set.md` §2. Branch: `feat/372-composition-primitives`.

Build (4 families, light-DOM injectStyles pattern, tokens only):
- [ ] `dvfy-page-section` — padding=md|lg|xl (fluid clamp), align=left|center, tone=default|muted|brand, width=prose|wide|full
- [ ] `dvfy-grid` — cols=1|2|3|4, min (auto-fit), gap=sm|md|lg; collapse to 1col below md via @container
- [ ] `dvfy-stack` — direction=column|row, gap=sm|md|lg, justify, align
- [ ] `dvfy-heading` (level=1|2|3) + `dvfy-text` (size=lg|md|sm, tone=muted|default) bound to type/text tokens
- [ ] Register in devify.js + per-family .test.js

Verify (Verification Before Completion):
- [ ] `npm run analyze` → 4 families + attrs in custom-elements.json
- [ ] Demo page composed ONLY from primitives → zero dead/unresolved classes (real-browser e2e)
- [ ] `npm run lint` + `npm run test` + `npm run contrast:ci` green

Scope guard: ONLY the 4 families + manifest + demo. NOT #363 (button href), NOT #367 (contract artifact).

Token decision (design-thinking — all EXISTING, no new scales): space-* (clamps/gaps),
type-h1/2/3-* + type-body-* + text-* (typography), surface-page/muted + primary-bg-subtle +
text-primary/secondary/muted (tone), container-* + prose-* (width), 48rem @container collapse.

## Backlog

- [ ] ...

## Standing Rules (from studio Operational DNA)

- Atomic items only.
- Verify with fresh evidence in this session.
- Cite standards.
- Escalate per criteria.
- After work: use `studio/skills/learn/SKILL.md` for studio-valuable.

See `studio/` for full constitution. This tool supports studio-scoped VEmployees.
