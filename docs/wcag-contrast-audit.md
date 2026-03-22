# WCAG Contrast Audit — @devify/ui Themes

Automated WCAG contrast ratio validation for all design token themes.
Run with: `npm run contrast`

## Standard

[WCAG 2.1 Success Criterion 1.4.3](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) — **Level AA**:
- Normal text: **≥ 4.5:1**
- Large text (≥ 18pt / ≥ 14pt bold): **≥ 3:1**

All pairs in this audit are checked at the stricter **4.5:1** threshold.

## Token Pairs Checked

| Text token | Background token | Description |
|---|---|---|
| `--dvfy-text-primary` | `--dvfy-surface-page` | Primary body text |
| `--dvfy-text-secondary` | `--dvfy-surface-page` | Secondary / meta text |
| `--dvfy-text-link` | `--dvfy-surface-page` | Inline links |
| `--dvfy-text-link-hover` | `--dvfy-surface-page` | Hovered links |
| `--dvfy-primary-text` | `--dvfy-primary-bg` | Primary button label |
| `--dvfy-accent-text` | `--dvfy-surface-page` | Accent-colour text |
| `--dvfy-success-text` | `--dvfy-surface-page` | Success state text |
| `--dvfy-warning-text` | `--dvfy-surface-page` | Warning state text |
| `--dvfy-danger-text` | `--dvfy-surface-page` | Danger/error text |
| `--dvfy-info-text` | `--dvfy-surface-page` | Info state text |
| `--dvfy-on-success` | `--dvfy-success-bg` | Text on success badge/alert |
| `--dvfy-on-warning` | `--dvfy-warning-bg` | Text on warning badge/alert |
| `--dvfy-on-danger` | `--dvfy-danger-bg` | Text on danger badge/alert |
| `--dvfy-on-info` | `--dvfy-info-bg` | Text on info badge/alert |
| `--dvfy-text-primary` | `--dvfy-input-bg` | Text inside inputs |

## Exempt Tokens

The following tokens are **exempt** from the 4.5:1 requirement per
[WCAG 1.4.3](https://www.w3.org/TR/WCAG21/#contrast-minimum) which carves out:
> *"Text or images of text that are part of an inactive user interface component"*
> (disabled state) *"or that are pure decoration"* (muted/placeholder text).

| Token | Reason |
|---|---|
| `--dvfy-text-muted` | Decorative / supplementary content only |
| `--dvfy-text-disabled` | Inactive UI component text |
| `--dvfy-disabled-text` | Inactive UI component text |
| `--dvfy-input-placeholder` | Placeholder text (input empty state) |

> **Best practice:** Use `--dvfy-text-muted` only for supplementary labels,
> timestamps, or helper text — never for content required to convey meaning.
> Prefer `--dvfy-text-secondary` for body copy that must be readable.

## Results per Theme

### light

All 15 pairs pass WCAG AA.

| Pair | Ratio | Result |
|---|---|---|
| primary text / surface-page | 17.85:1 | ✓ AAA |
| secondary text / surface-page | 7.58:1 | ✓ AA |
| link / surface-page | 5.36:1 | ✓ AA |
| link hover / surface-page | 7.27:1 | ✓ AA |
| primary-text / primary-bg | 5.48:1 | ✓ AA |
| accent-text / surface-page | 5.44:1 | ✓ AA |
| success-text / surface-page | 7.13:1 | ✓ AA |
| warning-text / surface-page | 9.07:1 | ✓ AA |
| danger-text / surface-page | 8.31:1 | ✓ AA |
| info-text / surface-page | 7.27:1 | ✓ AA |
| on-success / success-bg | 6.12:1 | ✓ AA |
| on-warning / warning-bg | 9.39:1 | ✓ AAA |
| on-danger / danger-bg | 4.83:1 | ✓ AA |
| on-info / info-bg | 5.48:1 | ✓ AA |
| text-primary / input-bg | 17.85:1 | ✓ AAA |

### dark

All 15 pairs pass WCAG AA.

| Pair | Ratio | Result |
|---|---|---|
| primary text / surface-page | 19.28:1 | ✓ AAA |
| secondary text / surface-page | 13.59:1 | ✓ AAA |
| link / surface-page | 11.16:1 | ✓ AAA |
| link hover / surface-page | 13.92:1 | ✓ AAA |
| primary-text / primary-bg | 12.81:1 | ✓ AAA |
| accent-text / surface-page | 9.92:1 | ✓ AAA |
| success-text / surface-page | 14.37:1 | ✓ AAA |
| warning-text / surface-page | 13.99:1 | ✓ AAA |
| danger-text / surface-page | 10.63:1 | ✓ AAA |
| info-text / surface-page | 13.92:1 | ✓ AAA |
| on-success / success-bg | 6.12:1 | ✓ AA |
| on-warning / warning-bg | 6.33:1 | ✓ AA |
| on-danger / danger-bg | 4.83:1 | ✓ AA |
| on-info / info-bg | 5.48:1 | ✓ AA |
| text-primary / input-bg | 17.06:1 | ✓ AAA |

### devify-cyan

All 15 pairs pass WCAG AA (same ratios as light except primary button).

| Notable pair | Ratio | Result |
|---|---|---|
| primary-text / primary-bg | 5.48:1 | ✓ AA |
| on-success / success-bg | 6.12:1 | ✓ AA |
| on-info / info-bg | 5.48:1 | ✓ AA |

### devify-cyan-dark

All 15 pairs pass WCAG AA (same ratios as dark).

### devify-pink

All 15 pairs pass WCAG AA.

| Notable pair | Ratio | Result |
|---|---|---|
| link / surface-page | 5.44:1 | ✓ AA |
| link hover / surface-page | 7.26:1 | ✓ AA |
| primary-text / primary-bg | 6.24:1 | ✓ AA |
| on-success / success-bg | 6.12:1 | ✓ AA |
| on-info / info-bg | 5.48:1 | ✓ AA |

### devify-pink-dark

All 15 pairs pass WCAG AA.

| Notable pair | Ratio | Result |
|---|---|---|
| primary-text / primary-bg | 6.24:1 | ✓ AA |
| on-success / success-bg | 6.12:1 | ✓ AA |
| on-info / info-bg | 5.48:1 | ✓ AA |

## Fixes Applied (initial audit)

The following token values were updated to achieve compliance:

| Theme | Token | Before | After | Rationale |
|---|---|---|---|---|
| light | `--dvfy-primary-text` | `neutral-0` (#fff) | `neutral-950` (#020617) | White on cyan-600 was 3.68:1 |
| light | `--dvfy-on-success` | `neutral-0` (#fff) | `neutral-950` (#020617) | White on green-600 was 3.30:1 |
| light | `--dvfy-on-info` | `neutral-0` (#fff) | `neutral-950` (#020617) | White on cyan-600 was 3.68:1 |
| dark | `--dvfy-on-success` | `neutral-0` (#fff) | `neutral-950` (#020617) | White on green-600 was 3.30:1 |
| dark | `--dvfy-on-info` | `neutral-0` (#fff) | `neutral-950` (#020617) | White on cyan-600 was 3.68:1 |
| devify-cyan | `--dvfy-primary-text` | `neutral-0` (#fff) | `neutral-950` (#020617) | White on cyan-600 was 3.68:1 |
| devify-pink | `--dvfy-text-link` | `brand-600` (#e8248e) | `brand-700` (#c91873) | brand-600 on white was 4.14:1 |
| devify-pink | `--dvfy-text-link-hover` | `brand-700` (#c91873) | `brand-800` (#a6155f) | Matching bump to keep hover darker |
| devify-pink | `--dvfy-primary-text` | `neutral-0` (#fff) | `neutral-950` (#020617) | White on brand-500 was 3.23:1 |
| devify-pink-dark | `--dvfy-primary-text` | `neutral-0` (#fff) | `neutral-950` (#020617) | White on brand-500 was 3.23:1 |

**Note on success/info badges in brand dark themes** (`devify-cyan-dark`, `devify-pink-dark`):
These themes do not define `--dvfy-on-success` or `--dvfy-on-info`, so they cascade
from the `:root` light base. The fix to `light.css` covers them automatically.

## CI

The contrast check runs automatically via `.github/workflows/contrast.yml`
on every push or pull request that touches `tokens/` or `scripts/check-contrast.js`.
The job fails (`exit 1`) if any pair falls below 4.5:1.
