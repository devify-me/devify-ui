#!/usr/bin/env node
/**
 * Taxonomy composition-law check for @devify/ui.
 *
 * Validates the stratified taxonomy (Components / Widgets / Layouts) declared in
 * `catalog/COMPONENT_REGISTRY` against the strict-downward composition law and
 * per-stratum classification rules (see docs/taxonomy.md).
 *
 * Rules enforced:
 *   Integrity  — every listed dependency is a registered component.
 *   Presence   — components declare `tier` (1–3); widgets declare `role`;
 *                layouts declare `category` + `pageRole`.
 *   Header drift — a component's own JSDoc/prose header (and its custom-elements.json
 *                echo) may not state a classification that contradicts the registry.
 *   Composition (strict downward, never sideways/up):
 *     • component → depends only on components of a LOWER tier.
 *         Tier 1 has no deps; Tier N (2,3) needs ≥1 Tier N-1 dep and no
 *         same-tier / higher-tier deps.
 *     • widget    → depends only on components (no widget/layout deps).
 *     • layout    → depends only on widgets or components (no layout deps).
 *
 * Usage:
 *   node scripts/check-taxonomy.mjs        # report mode (always exit 0)
 *   node scripts/check-taxonomy.mjs --ci   # exit 1 on any violation
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { COMPONENT_REGISTRY, strataOf, TIERS } from '../catalog/data.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STRATA_RANK = { component: 0, widget: 1, layout: 2 };

/** Tier depth → the noun the taxonomy uses for it (see TIERS in catalog/data.js). */
const TIER_ALIASES = { primitive: 1, composite: 2, organism: 3 };

/** Comment text only — prose drifts, code does not. Captures block comments (JSDoc and the
 *  CSS comments inside the STYLES template) plus `//` lines, skipping `https://`. */
export function commentText(src) {
  const parts = [];
  for (const m of src.matchAll(/\/\*[\s\S]*?\*\//g)) parts.push(m[0]);
  for (const m of src.matchAll(/(?:^|[^:/])\/\/(.*)$/gm)) parts.push(m[1]);
  return parts.join('\n');
}

/**
 * Extract the classification a piece of prose CLAIMS. Recognised forms — the ones this
 * repo actually uses — are `Tier N`, `Tier N <noun>`, `<Stratum> stratum`, and a comment
 * line opening with `<Stratum> (`.
 *
 * @param {string} text
 * @returns {{tiers: number[], strata: string[], aliasMismatches: string[]}}
 */
export function classificationClaims(text) {
  const tiers = [];
  const strata = [];
  const aliasMismatches = [];

  for (const m of text.matchAll(/\bTier\s+(\d+)\s*[-–—]?\s*([A-Za-z]+)?/g)) {
    const tier = Number(m[1]);
    tiers.push(tier);
    const noun = m[2]?.toLowerCase().replace(/s$/, '');
    if (noun && noun in TIER_ALIASES && TIER_ALIASES[noun] !== tier) {
      aliasMismatches.push(`"Tier ${tier} ${m[2]}" — Tier ${tier} is ${TIERS[tier] ? TIERS[tier].name : 'not a valid tier'}`);
    }
  }
  for (const m of text.matchAll(/\b(component|widget|layout)\s+stratum\b/gi)) strata.push(m[1].toLowerCase());
  for (const m of text.matchAll(/(?:^|\n)[\s*]*(Component|Widget|Layout)\s*\(/g)) strata.push(m[1].toLowerCase());

  return { tiers: [...new Set(tiers)], strata: [...new Set(strata)], aliasMismatches };
}

/**
 * Cross-check one prose surface against the registry entry that owns the classification.
 *
 * @param {object} meta - registry entry
 * @param {string} text - prose to inspect
 * @param {string} where - surface name, for the message
 * @returns {string[]} violation messages
 */
export function headerDrift(meta, text, where) {
  const out = [];
  const strata = strataOf(meta);
  const { tiers, strata: claimed, aliasMismatches } = classificationClaims(text);

  for (const tier of tiers) {
    if (strata !== 'component') {
      out.push(`${where} states "Tier ${tier}" but the registry classifies it as a ${strata} — ${strata}s are not depth-tiered`);
    } else if (tier !== meta.tier) {
      out.push(`${where} states "Tier ${tier}" but the registry says Tier ${meta.tier}`);
    }
  }
  for (const mismatch of aliasMismatches) out.push(`${where} contradicts itself: ${mismatch}`);
  for (const claim of claimed) {
    if (claim !== strata) out.push(`${where} calls it a "${claim}" but the registry classifies it as a ${strata}`);
  }
  return out;
}

/** Source file backing a tag, or null when it has none. */
function sourceFor(tag) {
  for (const dir of ['components', 'patterns']) {
    const file = path.join(ROOT, dir, `${tag}.js`);
    if (existsSync(file)) return file;
  }
  return null;
}

/** Manifest descriptions keyed by tag (the custom-elements.json echo of the header). */
function manifestDescriptions() {
  const file = path.join(ROOT, 'custom-elements.json');
  if (!existsSync(file)) return {};
  const manifest = JSON.parse(readFileSync(file, 'utf8'));
  return Object.fromEntries((manifest.tags || []).map(t => [t.name, t.description || '']));
}

/** Run the full check. Exported so the CLI body doesn't execute on import (tests). */
export function runCli() {
  const CI_MODE = process.argv.includes('--ci');
  const violations = [];

  const fail = (tag, msg) => violations.push(`${tag}: ${msg}`);

  for (const [tag, meta] of Object.entries(COMPONENT_REGISTRY)) {
    const strata = strataOf(meta);
    const deps = meta.deps || [];

    // Integrity — every dep is registered.
    for (const dep of deps) {
      if (!COMPONENT_REGISTRY[dep]) {
        fail(tag, `depends on "${dep}" which is not in the registry`);
      }
    }

    // Presence — declared fields per stratum.
    if (strata === 'component') {
      if (![1, 2, 3].includes(meta.tier)) fail(tag, `component must declare tier 1–3 (got ${JSON.stringify(meta.tier)})`);
    } else if (strata === 'widget') {
      if (!meta.role) fail(tag, 'widget must declare a `role`');
      if (meta.tier != null) fail(tag, 'widget must not declare a depth `tier`');
    } else if (strata === 'layout') {
      if (!meta.category) fail(tag, 'layout must declare a `category`');
      if (!meta.pageRole) fail(tag, 'layout must declare a `pageRole`');
      if (meta.tier != null) fail(tag, 'layout must not declare a depth `tier`');
    } else {
      fail(tag, `unknown strata "${strata}"`);
    }

    // Composition law — strict downward, never sideways/up.
    for (const dep of deps) {
      const depMeta = COMPONENT_REGISTRY[dep];
      if (!depMeta) continue; // already reported by integrity check
      const depStrata = strataOf(depMeta);

      if (strata === 'component') {
        if (depStrata !== 'component') {
          fail(tag, `component may only depend on components (dep "${dep}" is a ${depStrata})`);
        } else if (!(depMeta.tier < meta.tier)) {
          fail(tag, `Tier ${meta.tier} component may only depend on lower tiers (dep "${dep}" is Tier ${depMeta.tier})`);
        }
      } else {
        // widget / layout — deps must be a STRICTLY lower stratum (no sideways/up).
        if (!(STRATA_RANK[depStrata] < STRATA_RANK[strata])) {
          fail(tag, `${strata} may only depend on strictly lower strata (dep "${dep}" is a ${depStrata})`);
        }
      }
    }

    // Component tier forcing-function: Tier N (2,3) needs ≥1 Tier N-1 dep.
    if (strata === 'component' && meta.tier > 1) {
      const hasLowerAdjacent = deps.some(d => COMPONENT_REGISTRY[d]?.tier === meta.tier - 1);
      if (!hasLowerAdjacent) fail(tag, `Tier ${meta.tier} component must compose ≥1 Tier ${meta.tier - 1} component`);
    }

    // Widget/Layout forcing-function: a self-contained section/scaffold must
    // actually compose ≥1 lower-stratum piece (no content-free widget/layout).
    if ((strata === 'widget' || strata === 'layout') && deps.length === 0) {
      fail(tag, `${strata} must compose ≥1 ${strata === 'widget' ? 'Component' : 'Widget/Component'}`);
    }
  }

  // ── Header drift ────────────────────────────────────────────────────────────────
  // Classification lives in the registry; component headers restate it in prose and the
  // manifest echoes that prose into the catalog API viewer. Both drifted silently before
  // (#387 "Tier 5 Layout", #388 "Tier 3 organism"), caught only by human review. (#389)
  const DESCRIPTIONS = manifestDescriptions();

  for (const [tag, meta] of Object.entries(COMPONENT_REGISTRY)) {
    const file = sourceFor(tag);
    if (file) {
      for (const msg of headerDrift(meta, commentText(readFileSync(file, 'utf8')), 'source header')) fail(tag, msg);
    }
    const description = DESCRIPTIONS[tag];
    if (description) {
      for (const msg of headerDrift(meta, description, 'custom-elements.json description')) fail(tag, msg);
    }
  }

  if (violations.length) {
    console.error(`✗ taxonomy check: ${violations.length} violation(s)`);
    for (const v of violations) console.error(`  - ${v}`);
    process.exit(CI_MODE ? 1 : 0);
  }

  console.log('✓ taxonomy check: composition law, stratum rules and header classifications hold');
}

const IS_MAIN = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (IS_MAIN) runCli();
