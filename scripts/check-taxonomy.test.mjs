/**
 * Regression tests for the header/manifest classification-drift guard (#389).
 *
 * The drift class bit twice in review — #387 shipped `dvfy-campaign-layout` describing
 * itself as "Tier 5 Layout" and #388 left `dvfy-nav-bar` calling itself a "Tier 3 organism"
 * after it was reclassified into the Widgets stratum. Both were caught by a human reading
 * the diff. These cases pin the deterministic gate that replaces that luck.
 *
 * Run: npm run test:scripts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classificationClaims, commentText, headerDrift } from './check-taxonomy.mjs';

const COMPONENT_T1 = { tier: 1, domain: 'forms', deps: [] };
const WIDGET = { strata: 'widget', domain: 'navigation', role: 'header', deps: ['dvfy-button'] };
const LAYOUT = { strata: 'layout', domain: 'layout', category: 'chum', pageRole: 'capture', deps: ['dvfy-optin'] };

test('#387 — a layout claiming a tier is a violation', () => {
  const found = headerDrift(LAYOUT, '<dvfy-campaign-layout> — page scaffold (Tier 5 Layout).', 'source header');
  assert.equal(found.length >= 1, true, 'expected a violation');
  assert.match(found.join('\n'), /Tier 5/);
  assert.match(found.join('\n'), /layout/);
});

test('#388 — a widget still calling itself a Tier 3 organism is a violation', () => {
  const found = headerDrift(WIDGET, 'Tier 3 organism — full responsive navigation bar.', 'source header');
  assert.equal(found.length, 1);
  assert.match(found[0], /Tier 3/);
  assert.match(found[0], /not depth-tiered|are not depth-tiered/);
});

test('a component naming the wrong tier is a violation', () => {
  const found = headerDrift(COMPONENT_T1, 'Tier 2 composite — button.', 'source header');
  assert.equal(found.length, 1);
  assert.match(found[0], /registry says Tier 1/);
});

test('a header that contradicts itself (Tier 1 organism) is a violation', () => {
  const found = headerDrift(COMPONENT_T1, 'Tier 1 organism — button.', 'source header');
  assert.equal(found.length, 1);
  assert.match(found[0], /contradicts itself/);
});

test('a stratum claim that contradicts the registry is a violation', () => {
  const found = headerDrift(COMPONENT_T1, 'Button (Layout stratum; domain: forms).', 'source header');
  assert.equal(found.length, 1);
  assert.match(found[0], /"layout".*classifies it as a component/);
});

test('the manifest echo is guarded too, and names itself in the message', () => {
  const found = headerDrift(WIDGET, 'Tier 3 organism — nav bar.', 'custom-elements.json description');
  assert.match(found[0], /^custom-elements\.json description/);
});

test('correct headers produce no violations', () => {
  assert.deepEqual(headerDrift(COMPONENT_T1, 'Tier 1 primitive — a styled anchor.', 'source header'), []);
  assert.deepEqual(headerDrift(WIDGET, 'Widget (navigation / role: header) — brand + menu.', 'source header'), []);
  assert.deepEqual(headerDrift(LAYOUT, 'No-nav lead-magnet page scaffold (Layout stratum).', 'source header'), []);
  assert.deepEqual(headerDrift(COMPONENT_T1, 'Composition primitive that replaces invented utilities.', 'source header'), []);
});

test('claims are read from comments only, not from code or URLs', () => {
  const src = [
    "const label = 'Tier 9 Layout';",
    "// see https://example.com/tier-docs",
    "/* Tier 2 composite */",
  ].join('\n');
  const text = commentText(src);
  assert.equal(text.includes('Tier 9'), false, 'a string literal is not a classification claim');
  assert.deepEqual(classificationClaims(text).tiers, [2]);
});

test('prose that merely uses the words is not a claim', () => {
  const claims = classificationClaims('Hardware-accelerated — no layout shifts. Knobs are the primitive.');
  assert.deepEqual(claims.tiers, []);
  assert.deepEqual(claims.strata, []);
});
