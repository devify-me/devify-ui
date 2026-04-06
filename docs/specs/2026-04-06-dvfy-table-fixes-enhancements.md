# Fix & Enhance dvfy-table

**Issue:** [#312](https://github.com/devify-me/devify-ui/issues/312)  
**Date:** 2026-04-06  
**Status:** Design approved

---

## Goal

Fix broken features in `dvfy-table` (filtering, sort indicator sizing) and add keyboard navigation + responsive design so it's production-ready for devify-cc dashboards (costs, decisions, studio aggregation).

## Current Problems

1. **Filter implementation broken** — checkboxes don't filter rows; filter panel opens but has no effect
2. **Sort indicator sizing unstable** — triangle grows/shrinks on click, disappears on other headers
3. **Z-index conflict with drawer** — table header floats above right sidebar (should stay within table bounds)
4. **Not responsive** — tables don't adapt to narrow viewports (shrinking container with drawer)
5. **Playground centering** — component not centered in preview
6. **No keyboard navigation** — only mouse interaction (click to sort/filter, no arrow keys or Tab)
7. **Limited accessibility** — sort state not announced to screen readers, filter count not announced

## Solution

### 1. Fix Filter Implementation

**Current state:** Filter checkboxes are rendered but don't filter rows.

**Fix:** Wire filter checkboxes to actually filter table rows.

```javascript
// In #toggleFilterPanel or new #applyColumnFilter method:
1. Get selected filter values from checkboxes
2. For each row in tbody:
   - Extract cell text from column being filtered
   - Show row if it matches ANY selected filter value
   - Hide row if it doesn't match
3. Dispatch filter-change event with filter state
4. Update filter icon to show --active class
```

**Test:** Apply filter to column, verify rows are hidden/shown correctly. Multi-column filters should AND together (row must match all active filters).

### 2. Fix Sort Indicator Sizing

**Current state:** Triangle grows/shrinks unpredictably; CSS conflicts with DOM updates.

**Fix:** Use fixed-size CSS instead of font-based indicator.

```css
.dvfy-table__sort {
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  margin-left: var(--dvfy-space-1);
  font-size: 0.75rem;  /* Fixed size */
  line-height: 1;      /* Prevent vertical stretching */
  color: var(--dvfy-text-muted);
  flex-shrink: 0;      /* Prevent squishing */
}

/* Sort indicator color on active sort */
.dvfy-table__sort--active {
  color: var(--dvfy-primary-bg);
}
```

**Test:** Click multiple column headers, verify triangle stays stable size and doesn't disappear.

### 3. Responsive Design (No Z-index Conflicts)

**Current state:** Table header floats above drawer at narrow viewports. Rather than fight z-index, make table responsive.

**Fix:** Add container-query breakpoints for responsive table behavior.

```css
/* Wide: normal table layout */
dvfy-table {
  width: 100%;
  container-type: inline-size;
  container-name: dvfy-table;
}

/* Narrow (< 48rem): enable horizontal scroll */
@container dvfy-table (max-width: 47.99rem) {
  .dvfy-table__wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border: 1px solid var(--dvfy-border-default);
    border-radius: var(--dvfy-radius-lg);
  }
  
  table {
    min-width: 100%;  /* Table larger than container, allows scroll */
  }
}

/* Extra narrow (< 32rem): optional card layout (Phase 2) */
@container dvfy-table (max-width: 31.99rem) {
  /* Switch to card view if needed later */
}
```

**Behavior:**
- Wide viewport (normal): table displays full width with fixed columns
- Narrow viewport (with drawer open): table scrolls horizontally within its bounds (no header floating above drawer)
- Header stays within table z-index context, no conflict with drawer

**Test:** Resize viewport, open drawer, verify table scrolls horizontally without overlapping.

### 4. Fix Playground Centering

**Current state:** Component preview not centered in playground.

**Fix:** Add `width: 100%` to dvfy-table if missing; adjust playground container centering.

```css
dvfy-table {
  display: block;
  width: 100%;
  font-family: var(--dvfy-font-sans);
  color: var(--dvfy-text-primary);
  container-type: inline-size;
  container-name: dvfy-table;
}
```

**Test:** Component should fill available space, not shrink or float left.

### 5. Add Keyboard Navigation

**Current:** Only mouse interaction (click headers to sort, click filter icons).

**New:** Full keyboard support:
- **Tab:** Navigate focus through sortable headers and filter icons
- **Enter/Space:** Activate sort (on header) or open filter panel (on filter icon)
- **Arrow Up/Down:** Navigate between rows (when focus inside tbody)
- **Arrow Left/Right:** Navigate between columns (when focus inside tbody)
- **Home/End:** Jump to first/last column in current row
- **Escape:** Close filter panel

**Implementation:**
```javascript
// On sortable headers
th[data-sort].addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    this.#handleSort(th);
  }
});

// On filter icons
filterIcon.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    this.#toggleFilterPanel(colIndex, th);
  }
});

// Optional: Row navigation (Tab to first cell, arrow keys move between cells)
tbody.addEventListener('keydown', (e) => {
  const cell = e.target.closest('td');
  if (!cell) return;
  
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      this.#navigateRow(cell, -1);
      break;
    case 'ArrowDown':
      e.preventDefault();
      this.#navigateRow(cell, 1);
      break;
    case 'ArrowLeft':
      e.preventDefault();
      this.#navigateColumn(cell, -1);
      break;
    case 'ArrowRight':
      e.preventDefault();
      this.#navigateColumn(cell, 1);
      break;
    case 'Home':
      e.preventDefault();
      this.#jumpToColumnInRow(cell, 0);
      break;
    case 'End':
      e.preventDefault();
      const row = cell.closest('tr');
      this.#jumpToColumnInRow(cell, row.cells.length - 1);
      break;
  }
});
```

**Test:** Keyboard-only user can sort all columns, apply filters, navigate table without mouse.

### 6. Verify & Add Accessibility

**Sort State Announcement:**
```html
<!-- When sorted asc: -->
<th data-sort aria-sort="ascending">Name</th>

<!-- When sorted desc: -->
<th data-sort aria-sort="descending">Name</th>

<!-- When not sorted: -->
<th data-sort aria-sort="none">Name</th>
```

**Filter Count:**
```javascript
// When filter is applied:
filterIcon.setAttribute('aria-label', `Filter by ${column} (${selectedCount} selected)`);
```

**Table Structure:**
```html
<table role="table">
  <thead role="rowgroup">
    <tr role="row">
      <th role="columnheader" scope="col">Name</th>
    </tr>
  </thead>
  <tbody role="rowgroup">
    <tr role="row">
      <td role="cell">Alice</td>
    </tr>
  </tbody>
</table>
```

**Test:** Screen reader announces sort state, filter state, table structure correctly.

---

## Tasks

### Phase 1: Bug Fixes
1. Fix filter implementation (wire checkboxes to row filtering)
2. Fix sort indicator sizing (CSS-based, stable)
3. Fix playground centering (width: 100%)

### Phase 2: Responsive + Keyboard + A11y
4. Add responsive design (container queries for horizontal scroll)
5. Add keyboard navigation (Tab, Enter, Arrow keys, Home/End)
6. Verify accessibility (ARIA, screen reader)

### Phase 3: Testing
7. Test with 50-row dataset + all features
8. Test with devify-cc costs table integration

---

## Success Criteria

- ✅ Filtering works: checkboxes filter rows correctly
- ✅ Sort indicator: stable size, visible on sort, hidden on unsorted
- ✅ Responsive: table scrolls horizontally on narrow viewports (no overlap with drawer)
- ✅ Centered: component fills available width, centered in playground
- ✅ Keyboard: Tab/Enter/Arrow keys fully navigate and control table
- ✅ Accessible: ARIA sort/filter state announced, screen reader works
- ✅ All tests pass (1371+ total)
- ✅ devify-cc costs table uses dvfy-table without custom workarounds

---

## Implementation Order

1. **Fix filter logic** — highest priority, currently broken
2. **Fix sort indicator** — visual stability
3. **Add responsive CSS** — fixes drawer conflict
4. **Add keyboard nav** — accessibility
5. **Verify ARIA** — accessibility completeness
6. **Test integration** — devify-cc readiness

