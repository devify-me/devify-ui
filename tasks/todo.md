# Task: Fix dvfy-stepper bfcache duplication bug

**G&P:** Make `dvfy-stepper.#build()` idempotent + bfcache-safe so a reconnect
(disconnect→reconnect, double lifecycle, or bfcache `pageshow`/persisted) yields
exactly ONE `.dvfy-stepper__nav` rail with the correct active step preserved —
without changing the public API, keyboard nav, a11y roles, or active-step behavior.

## Atomic items
- [x] Read component + existing test, understand build/lifecycle
- [x] TDD: add failing test — reconnect → assert exactly one nav (was N), active step/count intact
- [x] Fix: make `#build()` remove any prior generated nav before appending (idempotent)
- [x] Verify: npm test (1502), lint, contrast:ci (120), analyze — green; manifest unchanged (API intact)
- [x] Commit (author Jorge, no AI attribution), push, open PR vs main

## Scope guard
ONLY dvfy-stepper (+ its test). Stop & surface if >3 files or cross-cutting change.
