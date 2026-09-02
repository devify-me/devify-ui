#!/usr/bin/env node

/**
 * build-design-sync.mjs — build the Claude Design (DesignSync) artboard bundle.
 *
 * G&P
 *   Goal:    Emit a self-contained directory of preview HTML "artboards" — one per
 *            registry entry plus token/brand foundations — that Claude Design can
 *            host as a design-system project.
 *   Purpose: Claude Design consumes standalone preview HTML carrying a first-line
 *            `<!-- @dsCard group="..." -->` marker. It does NOT read
 *            custom-elements.json or component sources. Without this step the
 *            library cannot be represented there at all.
 *
 * Single source of truth: every artboard is derived from COMPONENT_REGISTRY
 * (catalog/data.js) and the demo maps already maintained inside
 * dvfy-component-playground.js. Nothing about a component is restated here.
 *
 * Scope: Devify brand only. Project themes (renting-ideal) are excluded, and
 * project brand strings baked into DEFAULT_ATTRS are overridden — see
 * BRAND_OVERRIDES. Products earn their own brand equity; the shared substrate
 * is tokens + components, not visible brand.
 *
 * Usage:  npm run design-sync:build   (writes to .design-sync/, gitignored)
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '.design-sync');
const INPUTS = join(ROOT, 'scripts', 'design-sync');

const {
  COMPONENT_REGISTRY, DOMAINS, TIERS, STRATA, HTMX_PATTERNS, strataOf,
} = await import(`file://${join(ROOT, 'catalog', 'data.js')}`);

/* ── Extract the playground's demo maps ──────────────────────────────────────
 * These are plain data literals in a module that cannot be imported under Node
 * (it touches HTMLElement/customElements at load). Slicing + evaluating the
 * literal keeps ONE definition of the demo content rather than a second copy
 * that would silently drift from the catalog. */
const playgroundSrc = readFileSync(join(ROOT, 'components', 'dvfy-component-playground.js'), 'utf8');

function extractLiteral(name, open, close) {
  const start = playgroundSrc.indexOf(`const ${name} = ${open}`);
  if (start === -1) throw new Error(`build-design-sync: could not locate ${name} in dvfy-component-playground.js`);
  const from = start + `const ${name} = `.length;
  const end = playgroundSrc.indexOf(`\n${close};`, from);
  if (end === -1) throw new Error(`build-design-sync: could not find end of ${name}`);
  const literal = playgroundSrc.slice(from, end + 1 + close.length);
   
  return new Function(`return ${literal}`)();
}

const DEFAULT_CONTENT = extractLiteral('DEFAULT_CONTENT', '{', '}');
const DEFAULT_ATTRS = extractLiteral('DEFAULT_ATTRS', '{', '}');
const SKIP_TAGS = extractLiteral('SKIP_TAGS', 'new Set(', '])');

const manifest = JSON.parse(readFileSync(join(ROOT, 'custom-elements.json'), 'utf8'));
const TAGS = new Map((manifest.tags || []).map(t => [t.name, t]));

/* ── Devify-brand-only overrides ─────────────────────────────────────────────
 * DEFAULT_ATTRS carries project strings and 4MB PNG paths that must not ship in
 * a Devify-branded design system. Overridden here, not in the library, so the
 * catalog keeps working unchanged. */
/* Catalog tooling, not design-system surface: the playground fetches
 * custom-elements.json at runtime and exists to author components, not to
 * document them. It has no meaning as an artboard. */
const BUNDLE_SKIP = new Set(['dvfy-component-playground']);

const MASCOTS = ['Grob', 'Grobette', 'Grobby', 'Grobma', 'Grobpa'];
const BRAND_OVERRIDES = {
  'dvfy-campaign-layout': { brand: 'Devify' },
  'dvfy-nav-bar': { brand: '@devify/ui', logo: '../assets/devify-hz-logo-cyan-pink.svg' },
  'dvfy-carousel': {
    images: JSON.stringify(MASCOTS.map(m => ({ src: `../assets/mascots/${m}.webp`, alt: m }))),
  },
};

/* ── Parsers (mirror of the playground's, applied to the same manifest) ── */
const parseEnumValues = (d) => {
  const m = (d || '').match(/(?:^|:\s*)([\w-]+(?:\s*\|\s*[\w-]+)+)/);
  return m ? m[1].split(/\s*\|\s*/).map(v => v.trim()).filter(Boolean) : null;
};
const parseDefault = (d) => {
  const m = (d || '').match(/\(default:\s*"?([^")]+)"?\)/i);
  return m ? m[1].trim() : null;
};
const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ── Artboard shell ── */
const FRAME_CSS = `
  body { margin:0; background:var(--dvfy-surface-page); color:var(--dvfy-text-primary);
         font-family:var(--dvfy-font-sans); line-height:var(--dvfy-leading-normal); }
  .ab { padding:var(--dvfy-space-8); max-width:1100px; margin:0 auto; }
  .ab__eyebrow { font-family:var(--dvfy-font-mono); font-size:var(--dvfy-text-xs);
         letter-spacing:.08em; text-transform:uppercase; color:var(--dvfy-text-muted); }
  .ab__title { font-size:var(--dvfy-text-3xl); font-weight:var(--dvfy-weight-bold);
         margin:var(--dvfy-space-1) 0 var(--dvfy-space-2); }
  .ab__desc { color:var(--dvfy-text-secondary); max-width:64ch; margin:0 0 var(--dvfy-space-4); }
  .ab__meta { display:flex; flex-wrap:wrap; gap:var(--dvfy-space-2); margin-bottom:var(--dvfy-space-6); }
  .ab__chip { font-family:var(--dvfy-font-mono); font-size:var(--dvfy-text-xs);
         padding:.2rem .5rem; border-radius:var(--dvfy-radius-full);
         background:var(--dvfy-surface-sunken); color:var(--dvfy-text-secondary);
         border:1px solid var(--dvfy-border-muted); }
  .ab__sec { margin-bottom:var(--dvfy-space-8); }
  .ab__h { font-size:var(--dvfy-text-sm); font-weight:var(--dvfy-weight-semibold);
         text-transform:uppercase; letter-spacing:.06em; color:var(--dvfy-text-muted);
         padding-bottom:var(--dvfy-space-2); border-bottom:1px solid var(--dvfy-border-muted);
         margin-bottom:var(--dvfy-space-4); }
  .ab__stage { padding:var(--dvfy-space-6); border:1px solid var(--dvfy-border-muted);
         border-radius:var(--dvfy-radius-lg); background:var(--dvfy-surface-raised);
         display:flex; flex-wrap:wrap; gap:var(--dvfy-space-4); align-items:center; }
  .ab__stage--block { display:block; }
  .ab__row { display:flex; flex-wrap:wrap; gap:var(--dvfy-space-4); align-items:center; }
  .ab__cell { display:flex; flex-direction:column; gap:var(--dvfy-space-2); align-items:flex-start; }
  .ab__lab { font-family:var(--dvfy-font-mono); font-size:var(--dvfy-text-xs); color:var(--dvfy-text-muted); }
  .ab__grid { display:grid; gap:var(--dvfy-space-3);
         grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); }
  .sw { border-radius:var(--dvfy-radius-md); border:1px solid var(--dvfy-border-muted); overflow:hidden; }
  .sw__c { height:56px; }
  .sw__m { padding:var(--dvfy-space-2); background:var(--dvfy-surface-raised); }
  .sw__n { font-family:var(--dvfy-font-mono); font-size:var(--dvfy-text-xs); }
  .sw__v { font-family:var(--dvfy-font-mono); font-size:var(--dvfy-text-xs); color:var(--dvfy-text-muted); }
`;

function artboard({ path, group, name, subtitle, eyebrow, title, desc, chips = [], body }) {
  const depth = path.split('/').length - 1;
  const up = '../'.repeat(depth);
  return {
    path,
    html: `<!-- @dsCard group="${esc(group)}" name="${esc(name)}" subtitle="${esc(subtitle || '')}" -->
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Saira+Stencil+One&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${up}assets/devify.min.css">
<style>${FRAME_CSS}</style>
</head>
<body>
<div class="ab">
  <div class="ab__eyebrow">${esc(eyebrow)}</div>
  <h1 class="ab__title">${esc(title)}</h1>
  ${desc ? `<p class="ab__desc">${esc(desc)}</p>` : ''}
  ${chips.length ? `<div class="ab__meta">${chips.map(c => `<span class="ab__chip">${esc(c)}</span>`).join('')}</div>` : ''}
${body}
</div>
<script src="${up}assets/devify.min.js"></script>
</body>
</html>
`,
  };
}

const section = (heading, inner, block = false) => `  <section class="ab__sec">
    <h2 class="ab__h">${esc(heading)}</h2>
    <div class="ab__stage${block ? ' ab__stage--block' : ''}">
${inner}
    </div>
  </section>
`;

/* ── Component artboards ─────────────────────────────────────────────────── */
const attrsFor = (tag, extra = {}) => {
  const merged = { ...(DEFAULT_ATTRS[tag] || {}), ...(BRAND_OVERRIDES[tag] || {}), ...extra };
  return Object.entries(merged)
    .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${esc(v)}"`)).join('');
};

const instance = (tag, extra) => {
  const content = tag in DEFAULT_CONTENT ? DEFAULT_CONTENT[tag] : 'Sample content';
  return `<${tag}${attrsFor(tag, extra)}>${content}</${tag}>`;
};

function componentBody(tag, meta) {
  const t = TAGS.get(tag);
  const out = [];

  if (meta.server) {
    out.push(section('Server required', `      <dvfy-alert status="info" title="Server required">${esc(HTMX_PATTERNS[tag] || 'Structure shown; HTMX behaviour needs a backend.')}</dvfy-alert>`, true));
  }

  out.push(section('Default', `      ${instance(tag)}`, true));

  const attrs = (t?.attributes || []).filter(a => !['class', 'style', 'id'].includes(a.name));

  // One row per enum attribute — the real variant surface.
  for (const a of attrs) {
    const values = parseEnumValues(a.description);
    if (!values || values.length < 2 || values.length > 8) continue;
    const def = parseDefault(a.description);
    const cells = values.map(v => `        <div class="ab__cell">
          <span class="ab__lab">${esc(a.name)}="${esc(v)}"${v === def ? ' ·default' : ''}</span>
          ${instance(tag, { [a.name]: v })}
        </div>`).join('\n');
    out.push(section(`${a.name}`, `      <div class="ab__row">\n${cells}\n      </div>`, true));
  }

  // Boolean flags, shown on.
  const bools = attrs.filter(a => a.type === 'boolean' && !parseEnumValues(a.description));
  if (bools.length) {
    const cells = bools.map(a => `        <div class="ab__cell">
          <span class="ab__lab">${esc(a.name)}</span>
          ${instance(tag, { [a.name]: true })}
        </div>`).join('\n');
    out.push(section('Flags', `      <div class="ab__row">\n${cells}\n      </div>`, true));
  }

  // API table — the contract, not just the picture.
  if (attrs.length) {
    const rows = attrs.map(a => `          <tr><td><code>${esc(a.name)}</code></td><td>${esc(a.type || 'string')}</td><td>${esc(a.description || '')}</td></tr>`).join('\n');
    out.push(section('Attributes', `      <table style="width:100%;border-collapse:collapse;font-size:var(--dvfy-text-sm)">
        <thead><tr style="text-align:left;color:var(--dvfy-text-muted)"><th>Attribute</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
${rows}
        </tbody>
      </table>`, true));
  }

  return out.join('\n');
}

/* ── Build ───────────────────────────────────────────────────────────────── */
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const files = [];
const skipped = [];

for (const [tag, meta] of Object.entries(COMPONENT_REGISTRY)) {
  if (SKIP_TAGS.has(tag)) { skipped.push(`${tag} (SKIP_TAGS)`); continue; }
  if (BUNDLE_SKIP.has(tag)) { skipped.push(`${tag} (catalog tooling)`); continue; }
  const strata = strataOf(meta);
  const domainLabel = DOMAINS[meta.domain] || meta.domain;

  let dir; let group; let chips;
  if (meta.server) {
    dir = 'patterns'; group = 'Patterns · HTMX';
    chips = ['HTMX pattern', domainLabel, `deps: ${meta.deps.length}`];
  } else if (strata === 'widget') {
    dir = 'widgets'; group = `Widgets · ${domainLabel}`;
    chips = ['Widget (OR-set)', domainLabel, `role: ${meta.role}`, `deps: ${meta.deps.length}`];
  } else if (strata === 'layout') {
    dir = 'layouts'; group = `Layouts · ${meta.category}`;
    chips = ['Layout (AND-set)', `category: ${meta.category}`, `page-role: ${meta.pageRole}`, `deps: ${meta.deps.length}`];
  } else {
    dir = 'components'; group = `Components · ${domainLabel}`;
    chips = [TIERS[meta.tier]?.label || `Tier ${meta.tier}`, domainLabel, `deps: ${meta.deps.length}`];
  }

  const t = TAGS.get(tag);
  files.push(artboard({
    path: `${dir}/${tag}.html`,
    group,
    name: `<${tag}>`,
    subtitle: chips.slice(0, 2).join(' · '),
    eyebrow: group,
    title: `<${tag}>`,
    desc: t?.description || '',
    chips,
    body: componentBody(tag, meta),
  }));
}

/* ── Foundations: tokens read straight from the CSS, never restated ── */
const TOKEN_FILES = [
  ['colors', 'Color primitives', 'Tier 1 raw values. Scale 50–950; oklch-derived, hex-authored.'],
  ['typography', 'Typography', 'Font stacks, size scale (xs–6xl), fluid sizes, line heights, weights.'],
  ['spacing', 'Spacing', 'The spacing scale every component composes against.'],
  ['borders', 'Borders & radii', 'Border widths and corner radii.'],
  ['elevation', 'Elevation', 'Shadow scale.'],
  ['animation', 'Motion', 'Durations and easing curves.'],
  ['layout', 'Layout', 'Container widths, z-index scale, breakpoints.'],
];

function parseTokens(css) {
  const out = [];
  for (const m of css.matchAll(/(--dvfy-[\w-]+)\s*:\s*([^;]+);/g)) {
    out.push({ name: m[1], value: m[2].trim() });
  }
  return out;
}

for (const [file, title, desc] of TOKEN_FILES) {
  const css = readFileSync(join(ROOT, 'tokens', `${file}.css`), 'utf8');
  const tokens = parseTokens(css);
  const isColor = file === 'colors';
  const cells = tokens.map(tk => `        <div class="sw">
          ${isColor ? `<div class="sw__c" style="background:${esc(tk.value)}"></div>` : ''}
          <div class="sw__m"><div class="sw__n">${esc(tk.name.replace('--dvfy-', ''))}</div><div class="sw__v">${esc(tk.value)}</div></div>
        </div>`).join('\n');
  files.push(artboard({
    path: `foundations/${file}.html`,
    group: 'Foundations',
    name: title,
    subtitle: `${tokens.length} tokens`,
    eyebrow: 'Foundations',
    title,
    desc,
    chips: [`${tokens.length} tokens`, `tokens/${file}.css`],
    body: section(`${tokens.length} tokens`, `      <div class="ab__grid">\n${cells}\n      </div>`, true),
  }));
}

/* Semantic themes — Devify only, project themes excluded by construction. */
const THEME_FILES = ['light', 'dark', 'devify-cyan', 'devify-dark', 'devify-pink'];
const themeBody = THEME_FILES.map((th) => {
  const tokens = parseTokens(readFileSync(join(ROOT, 'tokens', 'themes', `${th}.css`), 'utf8'));
  const cells = tokens.map(tk => `        <div class="sw">
          <div class="sw__c" style="background:${esc(tk.value)}"></div>
          <div class="sw__m"><div class="sw__n">${esc(tk.name.replace('--dvfy-', ''))}</div><div class="sw__v">${esc(tk.value)}</div></div>
        </div>`).join('\n');
  return section(`${th} — ${tokens.length} semantic tokens`, `      <div class="ab__grid">\n${cells}\n      </div>`, true);
}).join('\n');

files.push(artboard({
  path: 'foundations/themes.html',
  group: 'Foundations',
  name: 'Semantic themes',
  subtitle: THEME_FILES.join(' · '),
  eyebrow: 'Foundations',
  title: 'Semantic themes',
  desc: 'Tier 2: role-based aliases over the primitives. Devify themes only — project themes are deliberately excluded from the shared system.',
  chips: THEME_FILES,
  body: themeBody,
}));

/* ── Brand ── */
files.push(artboard({
  path: 'brand/logo.html',
  group: 'Brand',
  name: 'Logo & mark',
  subtitle: 'Horizontal lockup, mark',
  eyebrow: 'Brand',
  title: 'Logo & mark',
  desc: 'The canonical Devify lockup and mark. Note: the SVGs hardcode #fa3aab/#fa3cac and #00e1e2, which do NOT match --dvfy-brand-500 (#ff3cac) or --dvfy-cyan-500 (#00e5e5). Shipped as-is; see the tracking issue.',
  chips: ['SVG', 'off-token colours', 'no stacked/mono variant'],
  body: [
    section('Horizontal lockup', '      <img src="../assets/devify-hz-logo-cyan-pink.svg" alt="Devify" style="width:min(420px,100%)">', true),
    section('Mark', '      <img src="../assets/favicon.svg" alt="Devify mark" style="width:140px">', true),
    section('On dark', '      <div style="background:var(--dvfy-neutral-950);padding:var(--dvfy-space-8);border-radius:var(--dvfy-radius-lg)"><img src="../assets/devify-hz-logo-cyan-pink.svg" alt="Devify" style="width:min(420px,100%)"></div>', true),
  ].join('\n'),
}));

files.push(artboard({
  path: 'brand/mascots.html',
  group: 'Brand',
  name: 'Mascots — the Grob family',
  subtitle: 'Optional brand pets',
  eyebrow: 'Brand',
  title: 'Mascots — the Grob family',
  desc: 'Optional brand pets: two parents, one child, two grandparents. Three sit in the cyan family and one (Grobette) in the pink; Grobma is off-palette rose-gold.',
  chips: ['optional', '5 characters', 'WebP 600px'],
  body: section('The family', `      <div class="ab__grid" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr))">
${[['Grob', 'parent'], ['Grobette', 'parent'], ['Grobby', 'child'], ['Grobma', 'grandparent'], ['Grobpa', 'grandparent']].map(([n, r]) => `        <div class="ab__cell">
          <img src="../assets/mascots/${n}.webp" alt="${n}" style="width:100%;border-radius:var(--dvfy-radius-lg)">
          <span class="ab__lab">${n} · ${r}</span>
        </div>`).join('\n')}
      </div>`, true),
}));

/* ── Overview ── */
const counts = Object.entries(COMPONENT_REGISTRY).reduce((acc, [tag, m]) => {
  if (SKIP_TAGS.has(tag) || BUNDLE_SKIP.has(tag)) return acc;
  const k = m.server ? 'patterns' : strataOf(m);
  acc[k] = (acc[k] || 0) + 1; return acc;
}, {});

files.push(artboard({
  path: 'index.html',
  group: 'Foundations',
  name: '@devify/ui — overview',
  subtitle: 'Taxonomy & composition law',
  eyebrow: 'Design system',
  title: '@devify/ui',
  desc: 'Zero-build HTML Web Components, light DOM only, three-tier design tokens. Every colour flows through a --dvfy-* semantic token.',
  chips: Object.entries(counts).map(([k, v]) => `${v} ${k}`),
  body: [
    section('Strata', Object.values(STRATA).map(s => `      <div class="ab__cell"><span class="ab__lab">${esc(s.label)}</span><p style="max-width:28ch;margin:0;font-size:var(--dvfy-text-sm)">${esc(s.description)}</p></div>`).join('\n')),
    section('Composition law', '      <p style="margin:0">Layouts compose Widgets (+ Components for glue). Widgets compose Components only. Components compose lower-Tier Components only. Strictly downward — never sideways or up.</p>', true),
    section('Brand', '      <img src="assets/devify-hz-logo-cyan-pink.svg" alt="Devify" style="width:min(360px,100%)">', true),
  ].join('\n'),
}));

/* ── Emit ── */
for (const f of files) {
  const dest = join(OUT, f.path);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, f.html, 'utf8');
}

mkdirSync(join(OUT, 'assets', 'mascots'), { recursive: true });
copyFileSync(join(ROOT, 'dist', 'devify.min.css'), join(OUT, 'assets', 'devify.min.css'));
copyFileSync(join(ROOT, 'dist', 'devify.min.js'), join(OUT, 'assets', 'devify.min.js'));
copyFileSync(join(ROOT, 'catalog', 'devify-hz-logo-cyan-pink.svg'), join(OUT, 'assets', 'devify-hz-logo-cyan-pink.svg'));
copyFileSync(join(ROOT, 'catalog', 'favicon.svg'), join(OUT, 'assets', 'favicon.svg'));
for (const m of readdirSync(join(INPUTS, 'assets', 'mascots'))) {
  copyFileSync(join(INPUTS, 'assets', 'mascots', m), join(OUT, 'assets', 'mascots', m));
}

console.log(`artboards: ${files.length}`);
for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(12)} ${v}`);
console.log(`  foundations  ${TOKEN_FILES.length + 1}`);
console.log(`  brand        2`);
if (skipped.length) console.log(`skipped: ${skipped.join(', ')}`);
console.log(`output: ${OUT}`);
