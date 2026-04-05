/**
 * catalog/data.js — All hardcoded maps for the Design System Explorer
 *
 * Taxonomy (tiers, domains, registry), HTMX patterns, token groups, and semantic tokens.
 */

/** Tier definitions — composition depth classification (see docs/taxonomy.md) */
export const TIERS = {
  1: {
    name: 'Primitives',
    label: 'Tier 1 — Primitives',
    description: 'Zero dvfy-* dependencies. Pure tokens + native HTML.',
    rules: 'Zero dvfy-* dependencies.',
  },
  2: {
    name: 'Composites',
    label: 'Tier 2 — Composites',
    description: 'Compose at least one Tier 1 component. Only Tier 1 dependencies allowed.',
    rules: '≥1 Tier 1 dep, only Tier 1 deps.',
  },
  3: {
    name: 'Organisms',
    label: 'Tier 3 — Organisms',
    description: 'Compose at least one Tier 2 component. Cross-component coordination.',
    rules: '≥1 Tier 2 dep. May also depend on Tier 1.',
  },
  4: {
    name: 'Widgets',
    label: 'Tier 4 — Widgets',
    description: 'Self-contained UX flows composing Tier 3+ components.',
    rules: '≥1 Tier 3 dep. Self-contained functional unit.',
  },
  5: {
    name: 'Layouts',
    label: 'Tier 5 — Layouts',
    description: 'Page-level scaffolds composing Tier 3+ components.',
    rules: '≥1 Tier 3+ dep. Defines page-level spatial layout.',
  },
};

/** Domain keys → display labels */
export const DOMAINS = {
  forms:      'Forms',
  display:    'Data Display',
  feedback:   'Feedback',
  navigation: 'Navigation',
  layout:     'Layout',
  utility:    'Utility',
};

/** Component registry — single source of truth for classification (see docs/taxonomy.md) */
export const COMPONENT_REGISTRY = {
  // ── Tier 1 — Primitives (zero dvfy-* deps) ────────────────────────────────
  // Forms
  'dvfy-button':       { tier: 1, domain: 'forms',      deps: [] },
  'dvfy-input':        { tier: 1, domain: 'forms',      deps: [] },
  'dvfy-textarea':     { tier: 1, domain: 'forms',      deps: [] },
  'dvfy-checkbox':     { tier: 1, domain: 'forms',      deps: [] },
  'dvfy-radio':        { tier: 1, domain: 'forms',      deps: [] },
  'dvfy-switch':       { tier: 1, domain: 'forms',      deps: [] },
  'dvfy-slider':       { tier: 1, domain: 'forms',      deps: [] },
  'dvfy-select':       { tier: 1, domain: 'forms',      deps: [] },
  'dvfy-file-upload':  { tier: 1, domain: 'forms',      deps: [] },
  'dvfy-date-picker':  { tier: 1, domain: 'forms',      deps: [] },
  'dvfy-live-search':  { tier: 1, domain: 'forms',      deps: [], server: true },
  // Data Display
  'dvfy-badge':           { tier: 1, domain: 'display',    deps: [] },
  'dvfy-tag':             { tier: 1, domain: 'display',    deps: [] },
  'dvfy-avatar':          { tier: 1, domain: 'display',    deps: [] },
  'dvfy-progress':        { tier: 1, domain: 'display',    deps: [] },
  'dvfy-card':            { tier: 1, domain: 'display',    deps: [] },
  'dvfy-gradient-card':   { tier: 1, domain: 'display',    deps: [] },
  'dvfy-spotlight-card':  { tier: 1, domain: 'display',    deps: [] },
  'dvfy-compare-slider':  { tier: 1, domain: 'display',    deps: [] },
  'dvfy-empty':           { tier: 1, domain: 'display',    deps: [] },
  'dvfy-carousel':        { tier: 1, domain: 'display',    deps: [] },
  'dvfy-scroll-progress': { tier: 1, domain: 'display',    deps: [] },
  'dvfy-marquee-scroll':  { tier: 1, domain: 'display',    deps: [] },
  'dvfy-description-list': { tier: 1, domain: 'display',   deps: [] },
  'dvfy-htmx-table':      { tier: 1, domain: 'display',    deps: [], server: true },
  // Feedback
  'dvfy-alert':     { tier: 1, domain: 'feedback',   deps: [] },
  'dvfy-loader':    { tier: 1, domain: 'feedback',   deps: [] },
  'dvfy-toast':     { tier: 1, domain: 'feedback',   deps: [] },
  'dvfy-hovercard': { tier: 1, domain: 'feedback',   deps: [] },
  'dvfy-card-glow': { tier: 1, domain: 'feedback',   deps: [] },
  // Navigation
  'dvfy-nav':        { tier: 1, domain: 'navigation', deps: [] },
  'dvfy-hamburger':  { tier: 1, domain: 'navigation', deps: [] },
  'dvfy-breadcrumb': { tier: 1, domain: 'navigation', deps: [] },
  'dvfy-pagination': { tier: 1, domain: 'navigation', deps: [] },
  'dvfy-tabs':       { tier: 1, domain: 'navigation', deps: [] },
  'dvfy-dropdown':   { tier: 1, domain: 'navigation', deps: [] },
  'dvfy-tree-node':  { tier: 1, domain: 'navigation', deps: [] },
  'dvfy-tree-view':  { tier: 1, domain: 'navigation', deps: [] },
  'dvfy-sidebar':    { tier: 1, domain: 'navigation', deps: [] },
  // Layout
  'dvfy-section': { tier: 1, domain: 'layout', deps: [] },
  // Utility
  'dvfy-tooltip':         { tier: 1, domain: 'utility', deps: [] },
  'dvfy-scroll-reveal':   { tier: 1, domain: 'utility', deps: [] },
  'dvfy-page-transition': { tier: 1, domain: 'utility', deps: [] },
  'dvfy-transition-root': { tier: 1, domain: 'utility', deps: [] },
  'dvfy-text-vortex':     { tier: 1, domain: 'utility', deps: [] },
  'dvfy-scramble-hover':  { tier: 1, domain: 'utility', deps: [] },
  'dvfy-infinite-scroll': { tier: 1, domain: 'utility', deps: [], server: true },
  'dvfy-popover':         { tier: 1, domain: 'utility', deps: [] },
  'dvfy-stagger-enter':   { tier: 1, domain: 'utility', deps: [] },
  'dvfy-command-palette':  { tier: 1, domain: 'navigation', deps: [] },
  'dvfy-stepper':          { tier: 1, domain: 'layout',     deps: [] },

  // ── Tier 2 — Composites (≥1 T1 dep, only T1 deps) ─────────────────────────
  'dvfy-drawer':              { tier: 2, domain: 'layout',     deps: ['dvfy-button'] },
  'dvfy-table':               { tier: 2, domain: 'display',    deps: ['dvfy-checkbox'] },
  'dvfy-modal':               { tier: 2, domain: 'feedback',   deps: ['dvfy-button'] },
  'dvfy-nav-menu':            { tier: 2, domain: 'navigation', deps: ['dvfy-nav'] },
  'dvfy-theme-switcher':      { tier: 2, domain: 'utility',    deps: ['dvfy-dropdown', 'dvfy-button'] },
  'dvfy-accordion':           { tier: 2, domain: 'layout',     deps: ['dvfy-section'] },
  'dvfy-component-playground': { tier: 2, domain: 'utility',   deps: ['dvfy-button', 'dvfy-section', 'dvfy-slider'] },
  // Billing & Payments
  'dvfy-usage-meter':       { tier: 2, domain: 'display', deps: ['dvfy-progress'] },
  'dvfy-invoice-list':      { tier: 2, domain: 'display', deps: ['dvfy-badge'] },
  'dvfy-subscription-card': { tier: 2, domain: 'display', deps: ['dvfy-badge', 'dvfy-button'] },
  'dvfy-plan-picker':       { tier: 2, domain: 'display', deps: ['dvfy-button', 'dvfy-badge'] },
  'dvfy-payment-methods':   { tier: 2, domain: 'forms',   deps: ['dvfy-button'] },
  'dvfy-payment-setup':     { tier: 2, domain: 'forms',   deps: ['dvfy-button', 'dvfy-loader'] },

  // ── Tier 3 — Organisms (≥1 T2 dep) ────────────────────────────────────────
  'dvfy-nav-bar':    { tier: 3, domain: 'navigation', deps: ['dvfy-nav-menu', 'dvfy-hamburger', 'dvfy-drawer'] },
  'dvfy-auth':       { tier: 3, domain: 'utility',    deps: ['dvfy-modal'] },
  'dvfy-htmx-form':  { tier: 3, domain: 'forms',      deps: ['dvfy-modal'], server: true },
  'dvfy-confirm':    { tier: 3, domain: 'feedback',    deps: ['dvfy-modal'], server: true },
};

/** Get tags for a given tier number */
export function getComponentsByTier(n) {
  return Object.entries(COMPONENT_REGISTRY)
    .filter(([, meta]) => meta.tier === n)
    .map(([tag]) => tag);
}

/** Get tags for a given domain key */
export function getComponentsByDomain(key) {
  return Object.entries(COMPONENT_REGISTRY)
    .filter(([, meta]) => meta.domain === key)
    .map(([tag]) => tag);
}

/** Get tier metadata for a component tag */
export function getTierForComponent(tag) {
  const meta = COMPONENT_REGISTRY[tag];
  return meta ? TIERS[meta.tier] : null;
}

/** Components grouped by domain for sidebar navigation — derived from registry */
export const COMPONENT_CATEGORIES = Object.fromEntries(
  Object.entries(DOMAINS)
    .map(([key, label]) => [label, getComponentsByDomain(key)])
    .filter(([, tags]) => tags.length)
);

/** Get server component tags (server: true flag — HTMX is orthogonal to tiers) */
export function getServerComponents() {
  return Object.entries(COMPONENT_REGISTRY)
    .filter(([, meta]) => meta.server)
    .map(([tag]) => tag);
}

/** Decomposition backlog — T1 components that are candidates for future composition */
export const DECOMPOSITION_BACKLOG = [
  ['dvfy-select',       'Compose dvfy-button (trigger) + dvfy-dropdown (menu)'],
  ['dvfy-date-picker',  'Decompose into day/week/month/calendar primitives'],
  ['dvfy-tabs',         'Compose dvfy-button (tab triggers)'],
  ['dvfy-pagination',   'Compose dvfy-button (page buttons)'],
  ['dvfy-dropdown',     'Compose dvfy-button (trigger)'],
  ['dvfy-toast',        'Compose dvfy-alert internally'],
  ['dvfy-file-upload',  'Compose dvfy-button + dvfy-progress'],
  ['dvfy-carousel',     'Compose dvfy-button (prev/next)'],
  ['dvfy-sidebar',      'Compose dvfy-drawer or dvfy-section'],
  ['dvfy-card',           'Evaluate composition hierarchy with gradient-card and spotlight-card'],
  ['dvfy-gradient-card',  'Evaluate composition hierarchy with card'],
  ['dvfy-spotlight-card', 'Evaluate composition hierarchy with card'],
  ['dvfy-tree-view',    'Verify composition with dvfy-tree-node reflected in deps'],
];

/** HTMX integration patterns with descriptions */
export const HTMX_PATTERNS = {
  'dvfy-htmx-form':       'AJAX form submission with validation and loading states',
  'dvfy-infinite-scroll':  'Infinite scroll pagination with hx-trigger="revealed"',
  'dvfy-live-search':      'Live search with debounced hx-trigger',
  'dvfy-htmx-table':       'Sortable, paginated table with HTMX-powered updates',
  'dvfy-confirm':          'Confirmation dialog for destructive HTMX actions',
};

/** Token groups — metadata for each token file driving the token views */
export const TOKEN_GROUPS = {
  colors: {
    label: 'Colors',
    description: '11 color families × 11 steps (50–950)',
    families: {
      'Neutral':  { prefix: '--dvfy-neutral', steps: ['0','50','100','200','300','400','500','600','700','800','900','950','1000'] },
      'Brand':    { prefix: '--dvfy-brand',   steps: ['50','100','200','300','400','500','600','700','800','900','950'] },
      'Cyan':     { prefix: '--dvfy-cyan',    steps: ['50','100','200','300','400','500','600','700','800','900','950'] },
      'Indigo':   { prefix: '--dvfy-indigo',  steps: ['50','100','200','300','400','500','600','700','800','900','950'] },
      'Blue':     { prefix: '--dvfy-blue',    steps: ['50','100','200','300','400','500','600','700','800','900','950'] },
      'Green':    { prefix: '--dvfy-green',   steps: ['50','100','200','300','400','500','600','700','800','900','950'] },
      'Red':      { prefix: '--dvfy-red',     steps: ['50','100','200','300','400','500','600','700','800','900','950'] },
      'Amber':    { prefix: '--dvfy-amber',   steps: ['50','100','200','300','400','500','600','700','800','900','950'] },
      'Purple':   { prefix: '--dvfy-purple',  steps: ['50','100','200','300','400','500','600','700','800','900','950'] },
      'Teal':     { prefix: '--dvfy-teal',    steps: ['50','100','200','300','400','500','600','700','800','900','950'] },
      'Orange':   { prefix: '--dvfy-orange',  steps: ['50','100','200','300','400','500','600','700','800','900','950'] },
      'Pink':     { prefix: '--dvfy-pink',    steps: ['50','100','200','300','400','500','600','700','800','900','950'] },
    },
  },
  typography: {
    label: 'Typography',
    description: 'Font families, sizes, weights, line heights, and letter spacing',
    tokens: {
      'Font Families': [
        { name: '--dvfy-font-sans',  type: 'font',   desc: 'Sans-serif stack (Inter)' },
        { name: '--dvfy-font-serif', type: 'font',   desc: 'Serif stack' },
        { name: '--dvfy-font-mono',  type: 'font',   desc: 'Monospace stack (JetBrains Mono)' },
        { name: '--dvfy-font-brand', type: 'font',   desc: 'Brand display font (Saira Stencil One)' },
      ],
      'Font Sizes': [
        { name: '--dvfy-text-xs',   type: 'size', desc: '0.75rem (12px)' },
        { name: '--dvfy-text-sm',   type: 'size', desc: '0.875rem (14px)' },
        { name: '--dvfy-text-base', type: 'size', desc: '1rem (16px)' },
        { name: '--dvfy-text-lg',   type: 'size', desc: '1.125rem (18px)' },
        { name: '--dvfy-text-xl',   type: 'size', desc: '1.25rem (20px)' },
        { name: '--dvfy-text-2xl',  type: 'size', desc: '1.5rem (24px)' },
        { name: '--dvfy-text-3xl',  type: 'size', desc: '1.875rem (30px)' },
        { name: '--dvfy-text-4xl',  type: 'size', desc: '2.25rem (36px)' },
        { name: '--dvfy-text-5xl',  type: 'size', desc: '3rem (48px)' },
        { name: '--dvfy-text-6xl',  type: 'size', desc: '3.75rem (60px)' },
      ],
      'Font Weights': [
        { name: '--dvfy-weight-light',    type: 'weight', desc: '300' },
        { name: '--dvfy-weight-normal',   type: 'weight', desc: '400' },
        { name: '--dvfy-weight-medium',   type: 'weight', desc: '500' },
        { name: '--dvfy-weight-semibold', type: 'weight', desc: '600' },
        { name: '--dvfy-weight-bold',     type: 'weight', desc: '700' },
        { name: '--dvfy-weight-black',    type: 'weight', desc: '900' },
      ],
      'Line Heights': [
        { name: '--dvfy-leading-none',    type: 'number', desc: '1' },
        { name: '--dvfy-leading-tight',   type: 'number', desc: '1.25' },
        { name: '--dvfy-leading-snug',    type: 'number', desc: '1.375' },
        { name: '--dvfy-leading-normal',  type: 'number', desc: '1.5' },
        { name: '--dvfy-leading-relaxed', type: 'number', desc: '1.625' },
        { name: '--dvfy-leading-loose',   type: 'number', desc: '2' },
      ],
      'Letter Spacing': [
        { name: '--dvfy-tracking-tighter', type: 'length', desc: '-0.05em' },
        { name: '--dvfy-tracking-tight',   type: 'length', desc: '-0.025em' },
        { name: '--dvfy-tracking-normal',  type: 'length', desc: '0em' },
        { name: '--dvfy-tracking-wide',    type: 'length', desc: '0.025em' },
        { name: '--dvfy-tracking-wider',   type: 'length', desc: '0.05em' },
      ],
    },
  },
  spacing: {
    label: 'Spacing',
    description: 'Base-4 scale (4px increments) + semantic names',
    tokens: [
      { name: '--dvfy-space-0',    desc: '0' },
      { name: '--dvfy-space-0-5',  desc: '0.125rem (2px)' },
      { name: '--dvfy-space-1',    desc: '0.25rem (4px)' },
      { name: '--dvfy-space-1-5',  desc: '0.375rem (6px)' },
      { name: '--dvfy-space-2',    desc: '0.5rem (8px)' },
      { name: '--dvfy-space-2-5',  desc: '0.625rem (10px)' },
      { name: '--dvfy-space-3',    desc: '0.75rem (12px)' },
      { name: '--dvfy-space-3-5',  desc: '0.875rem (14px)' },
      { name: '--dvfy-space-4',    desc: '1rem (16px)' },
      { name: '--dvfy-space-5',    desc: '1.25rem (20px)' },
      { name: '--dvfy-space-6',    desc: '1.5rem (24px)' },
      { name: '--dvfy-space-7',    desc: '1.75rem (28px)' },
      { name: '--dvfy-space-8',    desc: '2rem (32px)' },
      { name: '--dvfy-space-9',    desc: '2.25rem (36px)' },
      { name: '--dvfy-space-10',   desc: '2.5rem (40px)' },
      { name: '--dvfy-space-12',   desc: '3rem (48px)' },
      { name: '--dvfy-space-14',   desc: '3.5rem (56px)' },
      { name: '--dvfy-space-16',   desc: '4rem (64px)' },
      { name: '--dvfy-space-20',   desc: '5rem (80px)' },
      { name: '--dvfy-space-24',   desc: '6rem (96px)' },
      { name: '--dvfy-space-32',   desc: '8rem (128px)' },
      { name: '--dvfy-space-40',   desc: '10rem (160px)' },
    ],
  },
  borders: {
    label: 'Borders',
    description: 'Border radius, width, and focus ring tokens',
    tokens: {
      'Border Radius': [
        { name: '--dvfy-radius-none', desc: '0' },
        { name: '--dvfy-radius-xs',   desc: '0.125rem (2px)' },
        { name: '--dvfy-radius-sm',   desc: '0.25rem (4px)' },
        { name: '--dvfy-radius-md',   desc: '0.375rem (6px)' },
        { name: '--dvfy-radius-lg',   desc: '0.5rem (8px)' },
        { name: '--dvfy-radius-xl',   desc: '0.75rem (12px)' },
        { name: '--dvfy-radius-2xl',  desc: '1rem (16px)' },
        { name: '--dvfy-radius-3xl',  desc: '1.5rem (24px)' },
        { name: '--dvfy-radius-full', desc: '9999px (pill)' },
        { name: '--dvfy-radius-round', desc: '50% (circle)' },
      ],
      'Border Width': [
        { name: '--dvfy-border-0', desc: '0' },
        { name: '--dvfy-border-1', desc: '1px' },
        { name: '--dvfy-border-2', desc: '2px' },
        { name: '--dvfy-border-4', desc: '4px' },
        { name: '--dvfy-border-8', desc: '8px' },
      ],
      'Focus Ring': [
        { name: '--dvfy-ring-width',  desc: '3px' },
        { name: '--dvfy-ring-offset', desc: '2px' },
      ],
    },
  },
  elevation: {
    label: 'Elevation',
    description: '7-level shadow scale using --dvfy-shadow-color for dark mode',
    tokens: [
      { name: '--dvfy-shadow-2xs',  desc: 'Subtle — form inputs' },
      { name: '--dvfy-shadow-xs',   desc: 'Cards at rest' },
      { name: '--dvfy-shadow-sm',   desc: 'Raised cards' },
      { name: '--dvfy-shadow-md',   desc: 'Dropdowns, popovers' },
      { name: '--dvfy-shadow-lg',   desc: 'Modals, dialogs' },
      { name: '--dvfy-shadow-xl',   desc: 'Toasts, notifications' },
      { name: '--dvfy-shadow-2xl',  desc: 'Dramatic emphasis' },
    ],
  },
  animation: {
    label: 'Animation',
    description: 'Durations and easing curves — respects prefers-reduced-motion',
    tokens: {
      'Durations': [
        { name: '--dvfy-duration-fastest', desc: '50ms' },
        { name: '--dvfy-duration-fast',    desc: '150ms' },
        { name: '--dvfy-duration-normal',  desc: '250ms' },
        { name: '--dvfy-duration-slow',    desc: '400ms' },
        { name: '--dvfy-duration-slowest', desc: '700ms' },
      ],
      'Easing Curves': [
        { name: '--dvfy-ease-in',     desc: 'cubic-bezier(0.4, 0, 1, 1)' },
        { name: '--dvfy-ease-out',    desc: 'cubic-bezier(0, 0, 0.2, 1)' },
        { name: '--dvfy-ease-in-out', desc: 'cubic-bezier(0.4, 0, 0.2, 1)' },
        { name: '--dvfy-ease-bounce', desc: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
        { name: '--dvfy-ease-spring', desc: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
      ],
    },
  },
  layout: {
    label: 'Layout',
    description: 'Breakpoints, container widths, z-index scale, and aspect ratios',
    tokens: {
      'Breakpoints': [
        { name: '--dvfy-screen-xs',  desc: '22.5rem (360px) — mobile' },
        { name: '--dvfy-screen-sm',  desc: '30rem (480px) — large phone' },
        { name: '--dvfy-screen-md',  desc: '48rem (768px) — tablet' },
        { name: '--dvfy-screen-lg',  desc: '64rem (1024px) — desktop' },
        { name: '--dvfy-screen-xl',  desc: '90rem (1440px) — wide' },
        { name: '--dvfy-screen-2xl', desc: '120rem (1920px) — ultrawide' },
      ],
      'Container Widths': [
        { name: '--dvfy-container-xs',  desc: '20rem (320px)' },
        { name: '--dvfy-container-sm',  desc: '24rem (384px)' },
        { name: '--dvfy-container-md',  desc: '28rem (448px)' },
        { name: '--dvfy-container-lg',  desc: '32rem (512px)' },
        { name: '--dvfy-container-xl',  desc: '36rem (576px)' },
        { name: '--dvfy-container-2xl', desc: '42rem (672px)' },
        { name: '--dvfy-container-3xl', desc: '48rem (768px)' },
        { name: '--dvfy-container-4xl', desc: '56rem (896px)' },
        { name: '--dvfy-container-5xl', desc: '64rem (1024px)' },
        { name: '--dvfy-container-6xl', desc: '72rem (1152px)' },
        { name: '--dvfy-container-7xl', desc: '80rem (1280px)' },
      ],
      'Z-Index Scale': [
        { name: '--dvfy-z-hide',     desc: '-1' },
        { name: '--dvfy-z-base',     desc: '0' },
        { name: '--dvfy-z-raised',   desc: '1' },
        { name: '--dvfy-z-dropdown', desc: '10' },
        { name: '--dvfy-z-sticky',   desc: '20' },
        { name: '--dvfy-z-overlay',  desc: '30' },
        { name: '--dvfy-z-modal',    desc: '40' },
        { name: '--dvfy-z-popover',  desc: '50' },
        { name: '--dvfy-z-toast',    desc: '60' },
        { name: '--dvfy-z-tooltip',  desc: '70' },
      ],
    },
  },
};

/** Theme presets available in the brand settings view */
export const THEMES = [];

/** Curated Google Fonts for brand identity picker */
export const CURATED_FONTS = {
  sans: [
    { name: 'Inter', weights: [300, 400, 500, 600, 700] },
    { name: 'Roboto', weights: [300, 400, 500, 700] },
    { name: 'Open Sans', weights: [300, 400, 600, 700] },
    { name: 'Lato', weights: [300, 400, 700] },
    { name: 'Poppins', weights: [300, 400, 500, 600, 700] },
    { name: 'Nunito', weights: [300, 400, 600, 700] },
    { name: 'Manrope', weights: [300, 400, 500, 600, 700] },
    { name: 'DM Sans', weights: [400, 500, 700] },
    { name: 'Plus Jakarta Sans', weights: [300, 400, 500, 600, 700] },
    { name: 'Work Sans', weights: [300, 400, 500, 600, 700] },
    { name: 'Source Sans 3', weights: [300, 400, 600, 700] },
    { name: 'Outfit', weights: [300, 400, 500, 600, 700] },
    { name: 'Figtree', weights: [300, 400, 500, 600, 700] },
    { name: 'Geist', weights: [300, 400, 500, 600, 700] },
  ],
  serif: [
    { name: 'Merriweather', weights: [300, 400, 700] },
    { name: 'Playfair Display', weights: [400, 500, 600, 700] },
    { name: 'Lora', weights: [400, 500, 600, 700] },
    { name: 'Source Serif 4', weights: [300, 400, 600, 700] },
    { name: 'DM Serif Display', weights: [400] },
    { name: 'Libre Baskerville', weights: [400, 700] },
    { name: 'Crimson Text', weights: [400, 600, 700] },
    { name: 'EB Garamond', weights: [400, 500, 600, 700] },
  ],
  mono: [
    { name: 'JetBrains Mono', weights: [300, 400, 500, 600, 700] },
    { name: 'Fira Code', weights: [300, 400, 500, 600, 700] },
    { name: 'Source Code Pro', weights: [300, 400, 500, 600, 700] },
    { name: 'IBM Plex Mono', weights: [300, 400, 500, 600, 700] },
    { name: 'Roboto Mono', weights: [300, 400, 500, 700] },
    { name: 'Space Mono', weights: [400, 700] },
    { name: 'Inconsolata', weights: [300, 400, 500, 600, 700] },
    { name: 'Geist Mono', weights: [300, 400, 500, 600, 700] },
  ],
  display: [
    { name: 'Saira Stencil One', weights: [400] },
    { name: 'Righteous', weights: [400] },
    { name: 'Fredoka', weights: [300, 400, 500, 600, 700] },
    { name: 'Archivo Black', weights: [400] },
    { name: 'Bebas Neue', weights: [400] },
    { name: 'Oswald', weights: [300, 400, 500, 600, 700] },
    { name: 'Raleway', weights: [300, 400, 500, 600, 700] },
    { name: 'Montserrat', weights: [300, 400, 500, 600, 700] },
    { name: 'Sora', weights: [300, 400, 500, 600, 700] },
    { name: 'Space Grotesk', weights: [300, 400, 500, 600, 700] },
  ],
};

/** Semantic tokens organized by role — drives Brand Settings view */
export const SEMANTIC_TOKENS = {
  'Surface': [
    { name: '--dvfy-surface-page',    type: 'color', desc: 'Page background' },
    { name: '--dvfy-surface-raised',  type: 'color', desc: 'Raised card/panel background' },
    { name: '--dvfy-surface-overlay', type: 'color', desc: 'Modal/overlay background' },
    { name: '--dvfy-surface-sunken',  type: 'color', desc: 'Recessed area background' },
    { name: '--dvfy-surface-muted',   type: 'color', desc: 'Subtle background fills' },
  ],
  'Text': [
    { name: '--dvfy-text-primary',   type: 'color', desc: 'Main body text' },
    { name: '--dvfy-text-secondary', type: 'color', desc: 'Supporting text' },
    { name: '--dvfy-text-muted',     type: 'color', desc: 'Placeholder, captions' },
    { name: '--dvfy-text-disabled',  type: 'color', desc: 'Disabled text' },
    { name: '--dvfy-text-inverse',   type: 'color', desc: 'Text on dark backgrounds' },
    { name: '--dvfy-text-link',      type: 'color', desc: 'Link color' },
    { name: '--dvfy-text-link-hover', type: 'color', desc: 'Link hover color' },
  ],
  'Border': [
    { name: '--dvfy-border-default', type: 'color', desc: 'Default border' },
    { name: '--dvfy-border-strong',  type: 'color', desc: 'Emphasized border' },
    { name: '--dvfy-border-muted',   type: 'color', desc: 'Subtle border' },
    { name: '--dvfy-border-focus',   type: 'color', desc: 'Focus ring border' },
  ],
  'Primary': [
    { name: '--dvfy-primary-bg',        type: 'color', desc: 'Primary button background' },
    { name: '--dvfy-primary-bg-hover',  type: 'color', desc: 'Primary hover' },
    { name: '--dvfy-primary-bg-active', type: 'color', desc: 'Primary active/pressed' },
    { name: '--dvfy-primary-bg-subtle', type: 'color', desc: 'Primary subtle background' },
    { name: '--dvfy-primary-text',      type: 'color', desc: 'Text on primary background' },
    { name: '--dvfy-primary-border',    type: 'color', desc: 'Primary border' },
  ],
  'Accent': [
    { name: '--dvfy-accent-bg',        type: 'color', desc: 'Accent background' },
    { name: '--dvfy-accent-bg-hover',  type: 'color', desc: 'Accent hover' },
    { name: '--dvfy-accent-bg-subtle', type: 'color', desc: 'Accent subtle background' },
    { name: '--dvfy-accent-text',      type: 'color', desc: 'Accent text' },
    { name: '--dvfy-accent-border',    type: 'color', desc: 'Accent border' },
  ],
  'Interactive': [
    { name: '--dvfy-selected-bg',  type: 'color', desc: 'Selected item background' },
    { name: '--dvfy-ring-color',   type: 'color', desc: 'Focus ring color' },
  ],
  'Input': [
    { name: '--dvfy-input-border-focus', type: 'color', desc: 'Input focus border' },
  ],
  'Elevation': [
    { name: '--dvfy-shadow-color', type: 'string', desc: 'HSL components for shadow color (e.g. "220 3% 15%")' },
  ],
};
