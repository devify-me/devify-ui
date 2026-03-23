# Issue #31: Tier 1 component audit — 15 primitives

**Type:** chore
**Branch:** chore/31-tier1-component-audit
**Labels:** enhancement

## Audit Results

5 pass cleanly: switch, avatar, loader, progress, hamburger.
10 fixes across 9 files, organized in 6 batches.

## Implementation

- [x] Batch 1: Add disconnectedCallback to dvfy-input, dvfy-radio, dvfy-textarea, dvfy-section, dvfy-tag, dvfy-alert
- [x] Batch 2: Add aria-checked to dvfy-checkbox and dvfy-radio
- [x] Batch 3: Migrate dvfy-tooltip from primitives to Tier 3 component tokens
- [x] Batch 4: Remove duplicate @cssprop in dvfy-button JSDoc
- [x] Batch 5: Fix dvfy-checkbox DEFAULT_CONTENT to single instance
- [x] Batch 6: Create GitHub issues for container queries (#25 comment) + label gaps (#169)
- [x] Verify: `npm run analyze` succeeds
- [x] Ship: push and create PR

## Future
<!-- Unrelated issues discovered during implementation — do NOT fix inline -->
