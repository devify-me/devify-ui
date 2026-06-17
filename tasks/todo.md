# Task: Fix responsive-sizing bug in dvfy-section-hero media slot

## G&P
- Goal: Stacked (above/below) hero media must not span full hero width; cap to a centered,
  token-backed max-width that scales DOWN on narrow viewports without overflow. left/right
  bounded too. No-media text hero byte-identical.
- Purpose: rueda reported "the image is extremely large" — desktop above/below renders a
  full-bleed banner because the media cell inherits max-width:none from the grid override.

## Decision (design-thinking)
- New cssprop --dvfy-hero-media-max, default var(--dvfy-container-md) = 28rem.
  Flows through token system (no raw hardcoded value). ~half the 56rem text rail.
  width:100% fluid + margin-inline:auto centered + max-width cap → never overflows.

## DONE
- [x] Tests first (TDD): above/below bounded (not none); narrow scales down no overflow; left/right bounded; centered; override knob; no-media regression intact
- [x] Implement CSS: cap stacked + 2-col media cell; stop resetting media to max-width:none; expose --dvfy-hero-media-max; update @cssprop docs
- [x] npm test (1499 pass), lint incl check:tokens (OK), contrast:ci (120 pass), analyze (manifest +5 lines, new cssprop)
- [x] Real-bundle browser e2e (scripts/verify-hero-media-size.mjs): desktop 448px on 1280px hero + centered; mobile 320px in content box, no page overflow
- [ ] Commit (Jorge, no AI attrib), push, open PR vs main
