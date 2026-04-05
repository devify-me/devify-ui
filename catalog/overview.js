/**
 * catalog/overview.js — Overview section renderers (5 pages)
 *
 * #overview        — Home: stats, tier viz, quick links
 * #overview/goal   — Goal & Purpose: mission, pillars, litmus test
 * #overview/stack  — Stack & Philosophy: WC + Light DOM + HTMX, why not React
 * #overview/start  — Getting Started: install, import, first component, theming
 * #overview/tiers  — Composition Model: 5-tier hierarchy, forcing function, decomposition
 */
import { COMPONENT_CATEGORIES, TOKEN_GROUPS, TIERS, getComponentsByTier, getServerComponents, COMPONENT_REGISTRY, DECOMPOSITION_BACKLOG } from './data.js';

// ─── Shared helpers ──────────────────────────────────────────────────────────

function heading(text, level = 1) {
  const el = document.createElement(`h${level}`);
  el.textContent = text;
  const sizes = { 1: 'var(--dvfy-text-4xl)', 2: 'var(--dvfy-text-xl)', 3: 'var(--dvfy-text-lg)' };
  el.style.cssText = `font-size: ${sizes[level] || 'var(--dvfy-text-base)'}; font-weight: var(--dvfy-weight-bold); margin-bottom: var(--dvfy-space-4); font-family: ${level === 1 ? 'var(--dvfy-font-brand)' : 'var(--dvfy-font-sans)'};`;
  return el;
}

function para(text, muted = false) {
  const el = document.createElement('p');
  el.textContent = text;
  el.style.cssText = `font-size: var(--dvfy-text-sm); line-height: var(--dvfy-leading-relaxed); color: var(${muted ? '--dvfy-text-muted' : '--dvfy-text-secondary'}); margin-bottom: var(--dvfy-space-4); max-width: 52rem;`;
  return el;
}

function section(spacing = '8') {
  const el = document.createElement('div');
  el.style.cssText = `margin-bottom: var(--dvfy-space-${spacing});`;
  return el;
}

function linkCard(title, desc, hash) {
  const card = document.createElement('dvfy-card');
  card.style.cssText = 'cursor: pointer; padding: var(--dvfy-space-4);';
  card.addEventListener('click', () => { location.hash = hash; });

  const h = document.createElement('h3');
  h.textContent = title;
  h.style.cssText = 'font-size: var(--dvfy-text-base); font-weight: var(--dvfy-weight-semibold); margin-bottom: var(--dvfy-space-1);';
  card.appendChild(h);

  const p = document.createElement('p');
  p.textContent = desc;
  p.style.cssText = 'font-size: var(--dvfy-text-sm); color: var(--dvfy-text-secondary); margin: 0;';
  card.appendChild(p);

  return card;
}

function codeBlock(code) {
  const pre = document.createElement('pre');
  pre.style.cssText = 'background: var(--dvfy-surface-sunken); border: var(--dvfy-border-1) solid var(--dvfy-border-muted); border-radius: var(--dvfy-radius-lg); padding: var(--dvfy-space-4); overflow-x: auto; margin-bottom: var(--dvfy-space-4); font-family: var(--dvfy-font-mono); font-size: var(--dvfy-text-sm); line-height: var(--dvfy-leading-relaxed); color: var(--dvfy-text-primary);';
  const codeEl = document.createElement('code');
  codeEl.textContent = code;
  pre.appendChild(codeEl);
  return pre;
}

function infoTable(rows) {
  const table = document.createElement('table');
  table.style.cssText = 'width: 100%; border-collapse: collapse; margin-bottom: var(--dvfy-space-6); font-size: var(--dvfy-text-sm);';
  for (const [label, value] of rows) {
    const tr = document.createElement('tr');
    tr.style.cssText = 'border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-muted);';

    const th = document.createElement('td');
    th.textContent = label;
    th.style.cssText = 'padding: var(--dvfy-space-3) var(--dvfy-space-4); font-weight: var(--dvfy-weight-semibold); color: var(--dvfy-text-primary); white-space: nowrap; width: 12rem;';
    tr.appendChild(th);

    const td = document.createElement('td');
    td.textContent = value;
    td.style.cssText = 'padding: var(--dvfy-space-3) var(--dvfy-space-4); color: var(--dvfy-text-secondary);';
    tr.appendChild(td);

    table.appendChild(tr);
  }
  return table;
}

// ─── Page: Home (#overview) ──────────────────────────────────────────────────

export function renderOverview(mainEl) {
  const componentCount = Object.values(COMPONENT_CATEGORIES).flat().length;
  const serverCount = getServerComponents().length;
  const tokenGroupCount = Object.keys(TOKEN_GROUPS).length;

  mainEl.appendChild(heading('@devify/ui'));

  const subtitle = document.createElement('p');
  subtitle.textContent = 'HTML Web Component library with design tokens, HTMX patterns, and PWA support.';
  subtitle.style.cssText = 'font-size: var(--dvfy-text-lg); color: var(--dvfy-text-secondary); margin-bottom: var(--dvfy-space-4);';
  mainEl.appendChild(subtitle);

  mainEl.appendChild(para('A complete, tier-structured component library that enables any Devify product to ship a production-ready, accessible, themeable frontend using only HTML attributes \u2014 no framework, no build step, no client-side state management required.'));

  // Stats row
  const statsRow = document.createElement('div');
  statsRow.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: var(--dvfy-space-4); margin-bottom: var(--dvfy-space-8);';

  const stats = [
    { label: 'Components', value: componentCount, hash: '#components/dvfy-button' },
    { label: 'Server Components', value: serverCount, hash: '#components/dvfy-htmx-form' },
    { label: 'Token Groups', value: tokenGroupCount, hash: '#tokens/colors' },
    { label: 'Architecture Tiers', value: Object.keys(TIERS).length, hash: '#overview/tiers' },
  ];

  for (const stat of stats) {
    const card = document.createElement('dvfy-card');
    card.style.cssText = 'cursor: pointer; text-align: center; padding: var(--dvfy-space-6);';
    card.addEventListener('click', () => { location.hash = stat.hash; });

    const val = document.createElement('div');
    val.textContent = stat.value;
    val.style.cssText = 'font-size: var(--dvfy-text-4xl); font-weight: var(--dvfy-weight-bold); color: var(--dvfy-primary-bg);';
    card.appendChild(val);

    const lbl = document.createElement('div');
    lbl.textContent = stat.label;
    lbl.style.cssText = 'font-size: var(--dvfy-text-sm); color: var(--dvfy-text-secondary); margin-top: var(--dvfy-space-1);';
    card.appendChild(lbl);

    statsRow.appendChild(card);
  }
  mainEl.appendChild(statsRow);

  // Learn more cards — link to sub-pages
  mainEl.appendChild(heading('Learn', 2));

  const learnGrid = document.createElement('div');
  learnGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: var(--dvfy-space-4); margin-bottom: var(--dvfy-space-8);';
  learnGrid.appendChild(linkCard('Goal & Purpose', 'Mission, pillars, and litmus test for design decisions', '#overview/goal'));
  learnGrid.appendChild(linkCard('Stack & Philosophy', 'Web Components, Light DOM, HTMX \u2014 why this stack', '#overview/stack'));
  learnGrid.appendChild(linkCard('Getting Started', 'Install, import, first component, theming', '#overview/start'));
  learnGrid.appendChild(linkCard('Composition Model', '5-tier hierarchy, dependency rules, decomposition', '#overview/tiers'));
  mainEl.appendChild(learnGrid);

  // Explore cards — link to catalog sections
  mainEl.appendChild(heading('Explore', 2));

  const exploreGrid = document.createElement('div');
  exploreGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: var(--dvfy-space-4);';
  exploreGrid.appendChild(linkCard('Colors', '11 color families with full shade scale', '#tokens/colors'));
  exploreGrid.appendChild(linkCard('Typography', 'Font families, sizes, weights, and spacing', '#tokens/typography'));
  exploreGrid.appendChild(linkCard('Spacing', 'Base-4 spacing scale with visual bars', '#tokens/spacing'));
  exploreGrid.appendChild(linkCard('Elevation', '7-level shadow system with live preview', '#tokens/elevation'));
  exploreGrid.appendChild(linkCard('Components', `${componentCount} components with live playground`, '#components/dvfy-button'));
  exploreGrid.appendChild(linkCard('Brand Settings', 'Live-edit semantic tokens and export themes', '#tokens/themes'));
  mainEl.appendChild(exploreGrid);
}

// ─── Page: Goal & Purpose (#overview/goal) ───────────────────────────────────

export function renderOverviewGoal(mainEl) {
  mainEl.appendChild(heading('Goal & Purpose'));

  const s1 = section();
  s1.appendChild(heading('Goal', 2));
  s1.appendChild(para('Provide a complete, tier-structured component library that enables any Devify product to ship a production-ready, accessible, themeable frontend using only HTML attributes \u2014 no framework, no build step, no client-side state management required.'));
  mainEl.appendChild(s1);

  const s2 = section();
  s2.appendChild(heading('Purpose', 2));
  s2.appendChild(para('@devify/ui is the shared visual language and UI engineering layer across all Devify products. It exists to:'));

  const pillars = [
    ['Eliminate per-product UI engineering', 'Products compose components, they don\u2019t build UI from scratch.'],
    ['Enforce consistency', 'One design language across the portfolio without mandating a frontend framework.'],
    ['Complement the server-first architecture', 'Go + Templ + HTMX keeps the frontend thin and declarative.'],
    ['Enable AI-assisted development', 'A predictable, attribute-driven API that Claude can generate, modify, and reason about reliably.'],
  ];

  for (const [title, desc] of pillars) {
    const card = document.createElement('dvfy-card');
    card.style.cssText = 'padding: var(--dvfy-space-4); margin-bottom: var(--dvfy-space-3);';
    const h = document.createElement('h3');
    h.textContent = title;
    h.style.cssText = 'font-size: var(--dvfy-text-sm); font-weight: var(--dvfy-weight-semibold); margin-bottom: var(--dvfy-space-1); color: var(--dvfy-primary-bg);';
    card.appendChild(h);
    const p = document.createElement('p');
    p.textContent = desc;
    p.style.cssText = 'font-size: var(--dvfy-text-sm); color: var(--dvfy-text-secondary); margin: 0;';
    card.appendChild(p);
    s2.appendChild(card);
  }
  mainEl.appendChild(s2);

  const s3 = section();
  s3.appendChild(heading('Litmus Test', 2));
  const litmus = document.createElement('dvfy-alert');
  litmus.setAttribute('status', 'info');
  litmus.setAttribute('title', 'Decision filter');
  litmus.textContent = 'Does this decision make it faster for a Devify product (built by humans + AI) to go from zero to production-ready frontend?';
  s3.appendChild(litmus);
  mainEl.appendChild(s3);
}

// ─── Page: Stack & Philosophy (#overview/stack) ──────────────────────────────

export function renderOverviewStack(mainEl) {
  mainEl.appendChild(heading('Stack & Philosophy'));

  mainEl.appendChild(para('Every technical decision in @devify/ui serves one principle: the simplest possible frontend that works with server-rendered HTML and AI-assisted development.'));

  mainEl.appendChild(heading('The Stack', 2));

  mainEl.appendChild(infoTable([
    ['Web Components', 'Native custom elements \u2014 works in any framework or none. No vendor lock-in.'],
    ['Light DOM', 'No Shadow DOM. Components render in the page DOM for HTMX compatibility and CSS inheritance.'],
    ['Zero Build Step', 'ES modules + CSS custom properties served directly. No webpack, no bundler, no transpiler.'],
    ['CSS Custom Properties', 'Three-tier token system: Primitives \u2192 Semantics \u2192 Component overrides. Themeable at runtime.'],
    ['HTMX Integration', 'Server components use hx-* attributes for dynamic behavior. The server is the state machine.'],
    ['Container Queries', 'Components respond to their parent width, not the viewport. Truly composable layouts.'],
  ]));

  mainEl.appendChild(heading('Why Not React / Vue / Svelte?', 2));
  mainEl.appendChild(para('Devify products use Go + Templ for server-side rendering. Adding a JavaScript framework would mean maintaining two rendering pipelines, two state models, and a build step. Web Components provide the component abstraction without the framework tax.'));
  mainEl.appendChild(para('The attribute-driven API means a Go template can render a complete UI without any client-side JavaScript knowledge. HTMX handles interactivity. The browser handles the rest.'));

  mainEl.appendChild(heading('What "Zero JS" Means', 2));
  mainEl.appendChild(para('Components are written in vanilla JavaScript \u2014 they have to be, they\u2019re Web Components. "Zero JS" means zero JS in the consuming project. Products don\u2019t write JavaScript to use @devify/ui. They write HTML attributes and let the components handle behavior.'));

  const clarify = document.createElement('dvfy-alert');
  clarify.setAttribute('status', 'warning');
  clarify.setAttribute('title', 'Clarification');
  clarify.textContent = 'The library itself is ~100% JavaScript. The products that consume it write ~0% JavaScript. That\u2019s the design.';
  clarify.style.marginBottom = 'var(--dvfy-space-4)';
  mainEl.appendChild(clarify);
}

// ─── Page: Getting Started (#overview/start) ─────────────────────────────────

export function renderOverviewStart(mainEl) {
  mainEl.appendChild(heading('Getting Started'));

  mainEl.appendChild(para('Get a Devify-styled frontend running in under 5 minutes. No build tools required.'));

  // Step 1: Install
  mainEl.appendChild(heading('1. Install', 2));
  mainEl.appendChild(codeBlock('npm install @devify/ui'));

  // Step 2: Import
  mainEl.appendChild(heading('2. Import Tokens + Components', 2));
  mainEl.appendChild(para('Add two imports to your HTML \u2014 one for design tokens (CSS), one for components (JS):'));
  mainEl.appendChild(codeBlock(`<link rel="stylesheet" href="node_modules/@devify/ui/devify.css">
<script type="module" src="node_modules/@devify/ui/devify.js"></script>`));

  // Step 3: First component
  mainEl.appendChild(heading('3. Use a Component', 2));
  mainEl.appendChild(para('Components are plain HTML elements with a dvfy- prefix. All configuration is via attributes:'));
  mainEl.appendChild(codeBlock(`<dvfy-button variant="primary" size="md">
  Get Started
</dvfy-button>

<dvfy-input label="Email" type="email" placeholder="you@example.com"></dvfy-input>

<dvfy-alert status="success" title="Done!">
  Your account has been created.
</dvfy-alert>`));

  // Step 4: Theming
  mainEl.appendChild(heading('4. Apply a Theme', 2));
  mainEl.appendChild(para('Themes are CSS files that override semantic tokens. Set the data-theme attribute on any container:'));
  mainEl.appendChild(codeBlock(`<!-- Use a built-in theme -->
<body data-theme="devify-cyan">

<!-- Or define your own by overriding CSS custom properties -->
<style>
  [data-theme="my-brand"] {
    --dvfy-primary-bg: #6366f1;
    --dvfy-primary-text: #ffffff;
    --dvfy-accent-bg: #f59e0b;
  }
</style>`));

  // Step 5: HTMX
  mainEl.appendChild(heading('5. Add Interactivity with HTMX', 2));
  mainEl.appendChild(para('For dynamic behavior, add HTMX. Server components like dvfy-htmx-form handle AJAX, validation, and loading states automatically:'));
  mainEl.appendChild(codeBlock(`<script src="https://unpkg.com/htmx.org@2"></script>

<dvfy-htmx-form hx-post="/api/contact" hx-swap="outerHTML">
  <dvfy-input label="Name" name="name" required></dvfy-input>
  <dvfy-input label="Email" name="email" type="email" required></dvfy-input>
  <dvfy-button type="submit" variant="primary">Send</dvfy-button>
</dvfy-htmx-form>`));
}

// ─── Page: Composition Model (#overview/tiers) ───────────────────────────────

export function renderOverviewTiers(mainEl) {
  mainEl.appendChild(heading('Composition Model'));

  const tierKeys = Object.keys(TIERS).map(Number).sort((a, b) => a - b);
  const tierCount = tierKeys.length;

  mainEl.appendChild(para(`Every component in @devify/ui is classified into one of ${tierCount} tiers based on its dependency depth. This isn\u2019t arbitrary categorization \u2014 it\u2019s a forcing function that prevents complexity from hiding inside components.`));

  // ── Tier table ──
  mainEl.appendChild(heading(`The ${tierCount} Tiers`, 2));

  const table = document.createElement('table');
  table.style.cssText = 'width: 100%; border-collapse: collapse; margin-bottom: var(--dvfy-space-6); font-size: var(--dvfy-text-sm);';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.style.cssText = 'border-bottom: 2px solid var(--dvfy-border-default);';
  for (const label of ['Tier', 'Name', 'Rule', 'Count']) {
    const th = document.createElement('th');
    th.textContent = label;
    th.style.cssText = 'padding: var(--dvfy-space-3) var(--dvfy-space-4); text-align: left; font-weight: var(--dvfy-weight-semibold); color: var(--dvfy-text-primary);';
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (const n of tierKeys) {
    const tier = TIERS[n];
    if (!tier) continue;
    const count = getComponentsByTier(n).length;
    const tr = document.createElement('tr');
    tr.style.cssText = 'border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-muted); cursor: pointer;';
    tr.addEventListener('click', () => { location.hash = `#tier/${n}`; });

    const cells = [`T${n}`, tier.name, tier.rules, `${count}`];
    for (let i = 0; i < cells.length; i++) {
      const td = document.createElement('td');
      td.textContent = cells[i];
      td.style.cssText = `padding: var(--dvfy-space-3) var(--dvfy-space-4); color: var(${i === 0 ? '--dvfy-primary-bg' : '--dvfy-text-secondary'});${i === 0 ? ' font-weight: var(--dvfy-weight-bold);' : ''}`;
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  mainEl.appendChild(table);

  // ── Decision tree (built from TIERS data) ──
  mainEl.appendChild(heading('Decision Tree', 2));
  mainEl.appendChild(para('To classify a component, walk through the tiers from highest to lowest:'));

  const decisionLines = [...tierKeys].reverse().map((n, i) => {
    const tier = TIERS[n];
    return `Q${i + 1}: ${tier.rules}\n    YES \u2192 Tier ${n} (${tier.name})`;
  });
  mainEl.appendChild(codeBlock(decisionLines.join('\n\n')));

  // ── Dependency flow (built from TIERS data) ──
  mainEl.appendChild(heading('Dependency Flow', 2));

  const flowLines = tierKeys.map((n) => {
    const tier = TIERS[n];
    return `T${n} ${tier.name.padEnd(14)} (${tier.rules.toLowerCase()})`;
  });
  mainEl.appendChild(codeBlock(flowLines.join('\n  \u2193 composed by\n')));

  // ── Dependency constraints ──
  mainEl.appendChild(heading('Dependency Constraints', 2));

  const constraintRows = tierKeys.map((n) => {
    const tier = TIERS[n];
    return [`Tier ${n} \u2014 ${tier.name}`, tier.rules];
  });
  constraintRows.push(['All tiers', 'No same-tier dependencies at any level.']);
  mainEl.appendChild(infoTable(constraintRows));

  // ── Forcing function ──
  mainEl.appendChild(heading('The Forcing Function', 2));
  mainEl.appendChild(para('The tier system answers one question for every component: "How deep is this component\u2019s dependency chain?" A button has zero dvfy-* dependencies (Tier 1). A nav-bar composes nav-menu, hamburger, and drawer (Tier 3). An auth form composes modal, button, and input (Tier 3).'));
  mainEl.appendChild(para('If a component is "too complex" for its current tier, that\u2019s a signal to decompose it. Extract the reusable piece into a lower tier, then compose it. This is how the library grows without accumulating accidental complexity.'));

  // ── Decomposition principle ──
  mainEl.appendChild(heading('Decomposition Principle', 2));

  const decompAlert = document.createElement('dvfy-alert');
  decompAlert.setAttribute('status', 'info');
  decompAlert.setAttribute('title', 'Rule');
  decompAlert.textContent = 'If a component at Tier N contains logic that could be reused by other Tier N components, extract that logic into a Tier N-1 primitive and compose it.';
  decompAlert.style.marginBottom = 'var(--dvfy-space-4)';
  mainEl.appendChild(decompAlert);

  mainEl.appendChild(para('Example: dvfy-nav was a 521-line monolith that handled brand display, nav links, mobile drawer, and hamburger toggle. It was decomposed into three components: dvfy-nav (T1 link primitive), dvfy-nav-menu (T2 link group), and dvfy-nav-bar (T3 full bar). Each piece is independently reusable.'));

  // ── Domain assignment ──
  mainEl.appendChild(heading('Domain Assignment', 2));
  mainEl.appendChild(para('Every component belongs to one functional domain, independent of its tier:'));
  mainEl.appendChild(infoTable([
    ['Forms', 'User input, selection, toggles \u2014 button, input, select, checkbox, etc.'],
    ['Data Display', 'Presenting data, content, status \u2014 card, badge, table, progress, etc.'],
    ['Feedback', 'Alerts, loading, toasts, modals \u2014 alert, loader, toast, modal, etc.'],
    ['Navigation', 'Wayfinding, menus, breadcrumbs \u2014 nav, tabs, pagination, dropdown, etc.'],
    ['Layout', 'Page structure, sections \u2014 section, drawer, accordion, etc.'],
    ['Utility', 'Cross-cutting concerns \u2014 theme-switcher, tooltip, auth, transitions, etc.'],
  ]));

  // ── HTMX / Server components ──
  mainEl.appendChild(heading('Server Components (HTMX)', 2));
  mainEl.appendChild(para('HTMX server interaction is orthogonal to the tier system. Components that require a backend are flagged with server: true and a [server] badge in the catalog, but classified by their composition depth \u2014 not their server dependency.'));

  const serverComponents = getServerComponents();
  if (serverComponents.length) {
    const serverList = document.createElement('div');
    serverList.style.cssText = 'display: flex; flex-wrap: wrap; gap: var(--dvfy-space-2); margin-bottom: var(--dvfy-space-6);';
    for (const tag of serverComponents) {
      const meta = COMPONENT_REGISTRY[tag];
      const chip = document.createElement('dvfy-tag');
      chip.textContent = `${tag.replace('dvfy-', '')} (T${meta?.tier || '?'})`;
      chip.setAttribute('size', 'sm');
      chip.style.cursor = 'pointer';
      chip.addEventListener('click', () => { location.hash = `#components/${tag}`; });
      serverList.appendChild(chip);
    }
    mainEl.appendChild(serverList);
  }

  // ── Decomposition backlog ──
  mainEl.appendChild(heading('Decomposition Backlog', 2));
  mainEl.appendChild(para('Several Tier 1 components are candidates for future decomposition \u2014 they have zero dvfy-* dependencies but contain logic that could be extracted into reusable primitives:'));

  const backlogTable = document.createElement('table');
  backlogTable.style.cssText = 'width: 100%; border-collapse: collapse; margin-bottom: var(--dvfy-space-4); font-size: var(--dvfy-text-sm);';
  for (const [comp, plan] of DECOMPOSITION_BACKLOG) {
    const tr = document.createElement('tr');
    tr.style.cssText = 'border-bottom: var(--dvfy-border-1) solid var(--dvfy-border-muted); cursor: pointer;';
    tr.addEventListener('click', () => { location.hash = `#components/${comp}`; });

    const td1 = document.createElement('td');
    td1.textContent = comp;
    td1.style.cssText = 'padding: var(--dvfy-space-2) var(--dvfy-space-4); font-family: var(--dvfy-font-mono); font-size: var(--dvfy-text-xs); color: var(--dvfy-primary-bg); white-space: nowrap;';
    tr.appendChild(td1);

    const td2 = document.createElement('td');
    td2.textContent = plan;
    td2.style.cssText = 'padding: var(--dvfy-space-2) var(--dvfy-space-4); color: var(--dvfy-text-secondary);';
    tr.appendChild(td2);

    backlogTable.appendChild(tr);
  }
  mainEl.appendChild(backlogTable);

  mainEl.appendChild(para('See GitHub issues labeled "taxonomy" + "decomposition" for tracked work.', true));
}
