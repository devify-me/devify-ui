# Task — Capture / validation funnel (factory instance #1)

## Goal & Purpose
Ship the thermometer / lead-capture funnel as reusable @devify/ui strata so any of the 3
target LPs (Renting Ideal, devify.me, sister-business) can build a 2-page capture flow
(capture + thank-you) from the library alone. Exercises the whole LP factory end-to-end:
a new Layout **category `chum`** (one shared no-nav shell) + two OR-set Widgets.

## Atomic items
- [x] utils/no-nav-shell.js — shared no-nav shell (skip link, brand mark, main, footer)
- [x] components/dvfy-optin.js — Widget (forms / capture): eyebrow+promise+form, optin-submit
- [x] components/dvfy-thank-you.js — Widget (feedback / confirmation): next-step + scheduler-ready slot
- [x] components/dvfy-chum-page.js — Layout (category chum, pageRole capture) via helper
- [x] tests: dvfy-optin.test.js, dvfy-thank-you.test.js, dvfy-chum-page.test.js (54 tests)
- [x] registry: catalog/data.js COMPONENT_REGISTRY (3 entries)
- [x] bundle: devify.js imports
- [x] docs/taxonomy.md Current classification summary
- [x] examples/chum-funnel/ (capture.html + thank-you.html) — neutral thermometer offer
- [x] regenerate custom-elements.json (npm run analyze)
- [x] npm run lint (all 5 gates) + npm run test (1563) green
- [x] real-Chromium e2e on both example pages — themed, 1:1, no dead CTA, submit navigates

## Notes / decisions
- Mirror dvfy-auth (Widget) + dvfy-campaign-layout (Layout) patterns exactly.
- Tokens only, Light DOM, dvfy- prefix, container queries. Honest copy (no fake urgency).
- optin composes dvfy-input (email + text qualifier), dvfy-select (options qualifier),
  dvfy-button (submit). autocomplete="email" patched on inner input post-connect.
- chum-page shares utils/no-nav-shell.js; campaign-layout LEFT UNTOUCHED (keep tests green).
