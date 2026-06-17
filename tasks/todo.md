# @devify/ui Tasks

**Living task list. Use atomic, verifiable items. Commit after each logical step.**

Follow studio/ standards: G&P, Verification Before Completion, citations to `studio/docs/operating-model/`, learn/ for synthesis.

**Scope note**: This is "tools work" per `studio/shared/sergio-layout.md` Scope Rules. Coordinate with studio/ for VEmployee-impacting changes.

## Current Focus — devify-ui#372: Page-composition primitives (LP-Factory N1 / G2)

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
