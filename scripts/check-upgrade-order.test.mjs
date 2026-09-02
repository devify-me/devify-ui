/**
 * Tests for the upgrade-order gate.
 *
 * A control nobody has proven red is not a control. Each case below asserts the
 * gate FIRES on a real defect shape, or STAYS SILENT on a legitimate pattern —
 * the false-positive cases matter just as much, because a noisy gate gets muted
 * and then protects nothing.
 *
 * Run: npm run test:scripts
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSource } from './check-upgrade-order.mjs';

const wrap = body => `class C extends HTMLElement {\n${body}\n}`;
const fields = src => analyzeSource(wrap(src)).flatMap(r => r.fields);
const doubles = src => analyzeSource(wrap(src)).flatMap(r => r.dbl.map(d => d.field));

/* ── Must FIRE ───────────────────────────────────────────────────────────── */

test('fires on the dvfy-popover shape: isConnected guard, deref of a connectedCallback artifact', () => {
  assert.deepEqual(fields(`
  #panel = null;
  connectedCallback() { this.#panel = document.createElement('div'); }
  attributeChangedCallback(name) {
    if (!this.isConnected) return;
    this.#panel.id = 'x';
  }`), ['panel']);
});

test('fires when the deref is inside a private method called from attributeChangedCallback', () => {
  assert.deepEqual(fields(`
  #panel = null;
  connectedCallback() { this.#panel = document.createElement('div'); }
  #bind() { this.#panel.id = 'x'; }
  attributeChangedCallback() { this.#bind(); }`), ['panel']);
});

test('fires on a field with no initialiser at all', () => {
  assert.deepEqual(fields(`
  #el;
  connectedCallback() { this.#el = document.createElement('div'); }
  attributeChangedCallback() { this.#el.remove(); }`), ['el']);
});

test('fires on the dvfy-scramble-hover shape: shared method allocates a resource, no teardown', () => {
  assert.deepEqual(doubles(`
  #observer = null;
  connectedCallback() { this.#attach(); }
  #attach() { this.#observer = new IntersectionObserver(() => {}); this.#observer.observe(this); }
  attributeChangedCallback() { this.#attach(); }`), ['observer']);
});

/* ── Must STAY SILENT ────────────────────────────────────────────────────── */

test('silent when guarded on the built artifact (the recommended fix)', () => {
  assert.deepEqual(fields(`
  #panel = null;
  connectedCallback() { this.#panel = document.createElement('div'); }
  attributeChangedCallback(name) {
    if (!this.isConnected || !this.#panel) return;
    this.#panel.id = 'x';
  }`), []);
});

test('silent on optional chaining', () => {
  assert.deepEqual(fields(`
  #panel = null;
  connectedCallback() { this.#panel = document.createElement('div'); }
  attributeChangedCallback() { this.#panel?.remove(); }`), []);
});

test('silent on an `if (this.#x)` truthiness guard', () => {
  assert.deepEqual(fields(`
  #ctrl = null;
  connectedCallback() { this.#ctrl = new AbortController(); }
  attributeChangedCallback() { if (this.#ctrl) this.#ctrl.abort(); }`), []);
});

test('silent on a `this.#x?.y` test guarding the consequent (ChainExpression)', () => {
  assert.deepEqual(fields(`
  #el = null;
  connectedCallback() { this.#el = document.createElement('div'); }
  attributeChangedCallback() { if (this.#el?.isConnected) this.#el.remove(); }`), []);
});

test('silent on lazy init — `if (!this.#x) { this.#x = … }` then use', () => {
  assert.deepEqual(fields(`
  #style = null;
  connectedCallback() { this.#style = document.createElement('style'); }
  attributeChangedCallback() {
    if (!this.#style) { this.#style = document.createElement('style'); }
    this.#style.textContent = 'a{}';
  }`), []);
});

test('silent when the callback invokes the builder itself before using the field', () => {
  assert.deepEqual(fields(`
  #grid = null;
  connectedCallback() { this.#build(); }
  #build() { this.#grid = document.createElement('div'); }
  attributeChangedCallback() { this.#build(); this.#grid.replaceChildren(); }`), []);
});

test('silent on a field with a non-nullish class initialiser', () => {
  assert.deepEqual(fields(`
  #spans = [];
  connectedCallback() { this.#spans = [1]; }
  attributeChangedCallback() { if (!this.#spans.length) return; }`), []);
});

test('silent when the allocation is preceded by a teardown call', () => {
  assert.deepEqual(doubles(`
  #observer = null;
  connectedCallback() { this.#attach(); }
  #detach() { if (this.#observer) { this.#observer.disconnect(); this.#observer = null; } }
  #attach() { this.#detach(); this.#observer = new IntersectionObserver(() => {}); }
  attributeChangedCallback() { this.#attach(); }`), []);
});

test('silent when the shared method early-returns if already allocated (idempotent)', () => {
  assert.deepEqual(doubles(`
  #watcher = null;
  connectedCallback() { this.#watch(); }
  #watch() { if (this.#watcher) return; this.#watcher = new MutationObserver(() => {}); }
  attributeChangedCallback() { this.#watch(); }`), []);
});

test('silent on a bare read that never member-accesses', () => {
  assert.deepEqual(fields(`
  #val = null;
  connectedCallback() { this.#val = 1; }
  attributeChangedCallback() { const v = this.#val; this.#val = v; }`), []);
});

test('silent when there is no connectedCallback to race with', () => {
  assert.deepEqual(analyzeSource(wrap(`
  #panel = null;
  attributeChangedCallback() { this.#panel.id = 'x'; }`)), []);
});
