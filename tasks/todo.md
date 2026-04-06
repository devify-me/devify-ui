# Task 2: Fix Sort Indicator Sizing in dvfy-table (Issue #312)

## Issue Summary
Sort indicator triangle grows/shrinks unpredictably when headers are clicked. Root cause: CSS uses font-based sizing (font-size: var(--dvfy-text-xs)), which varies with DOM updates.

## Steps

- [x] Understand current implementation
  - [x] Read dvfy-table.js (line 121-125 shows current CSS)
  - [x] Found sort indicator created in #addSortIndicator (line 909-925)
  - [x] Current CSS: font-size dependent, no fixed width/height

- [x] Update CSS for fixed sizing
  - [x] Replace font-based sizing with fixed width/height (0.75rem)
  - [x] Add display: inline-block
  - [x] Add line-height: 1 (prevents vertical stretching)
  - [x] Add flex-shrink: 0 (prevents squishing)
  - [x] Update selector to use .dvfy-table__sort directly
  - [x] Add .dvfy-table__sort--active class styling

- [x] Update indicator styling in #addSortIndicator
  - [x] Ensure sorted headers get --active class on sort indicator
  - [x] Ensure unsorted headers don't have --active class

- [x] Add tests for sort indicator sizing stability
  - [x] Test: sort indicator size stays consistent (maintains stable size when sorting)
  - [x] Test: indicator gets --active class when sorted
  - [x] Test: --active class removed from inactive indicators when switching columns

- [x] Run tests and verify
  - [x] npm test -- components/dvfy-table.test.js: 28 tests pass
  - [x] npm test (full suite): 1378 tests pass
  - [x] No regressions in other components

- [x] Commit changes
  - [x] fix(dvfy-table): stabilize sort indicator sizing with fixed dimensions (commit 91483fb)

## Success Criteria
- Sort indicator CSS uses fixed width/height (0.75rem)
- Sort indicator has line-height: 1
- Sort indicator has flex-shrink: 0
- Sort indicator gets --active class when sorted
- All 1375+ tests pass
