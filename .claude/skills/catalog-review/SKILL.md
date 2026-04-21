---
name: catalog-review
model: sonnet
description: Review the @devify/ui component catalog for UX, visual, and performance issues
allowed-tools: ["Bash", "Read", "WebFetch", "WebSearch", "Agent", "mcp__plugin_playwright_playwright__*"]
---

# Catalog Review

On-demand UX/UI/performance review of the @devify/ui component catalog.

## Prerequisites

The catalog must be served locally. If not running, start it:
```bash
cd /tmp/devify-ui && python3 -m http.server 8090 --bind 100.85.49.73 &
```

Catalog URL: `http://100.85.49.73:8090/catalog/`

## Review Process

### 1. Visual Review (Playwright)

Navigate to the catalog. For each theme (devify-cyan, devify-cyan-dark, devify-pink, devify-pink-dark):

1. Set the theme via the theme switcher
2. Take a full-page screenshot
3. Analyze each component section for:
   - **Color contrast**: text readable against background in both themes?
   - **Consistency**: do similar components look like they belong together?
   - **Spacing**: consistent padding/margins across components?
   - **Dark mode**: do all components properly adapt? Any missing token overrides?
   - **Borders/shadows**: visible and appropriate in both themes?

### 2. Interaction Review (Playwright)

Test interactive components:
- Buttons: all variants hover correctly? Disabled state visible?
- Inputs: focus ring visible? Error state clear? Password toggle works?
- Dropdowns: open/close, hover states, mutual exclusion?
- Modal: open, close via backdrop, close via X, required mode?
- Tabs: click switching, keyboard navigation?
- Header hamburger: all 3 states cycle smoothly?
- Toast: all 4 status types trigger and auto-dismiss?
- Table: sort, filter, search, select?

### 3. Responsive Review

If device preview frames are available in the Header section, verify:
- Mobile frame: hamburger active, nav hidden
- Tablet frame: tab bar visible
- Desktop frame: full layout

### 4. Performance Check

```bash
# Check file sizes
du -sh /tmp/devify-ui/devify.css /tmp/devify-ui/devify.js
find /tmp/devify-ui/components -name "*.js" | xargs wc -l | tail -1
find /tmp/devify-ui/patterns -name "*.js" | xargs wc -l | tail -1
```

### 5. Report

Create a structured report with:
- **Critical**: issues that break usability
- **Major**: noticeable visual problems
- **Minor**: polish items
- **Suggestions**: enhancement ideas

If critical or major issues found, create GitHub issues on devify-me/devify-ui.
