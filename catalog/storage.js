/**
 * catalog/storage.js — localStorage helpers for catalog persistence
 *
 * All keys use `dvfy-catalog-` prefix (matches existing sidebar-view key).
 */

const PREFIX = 'dvfy-catalog-';

function get(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function set(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch { /* quota exceeded — silent */ }
}

// ── Palette choices ──

/** @returns {{ brandColors: string[], supportCount: number } | null} */
export function getPalette() { return get('palette'); }

/** @param {{ brandColors: string[], supportCount: number }} state */
export function setPalette(state) { set('palette', state); }

// ── Theme selection ──

/** @returns {{ theme: string, mode: string } | null} */
export function getTheme() { return get('theme'); }

/** @param {{ theme: string, mode: string }} state */
export function setTheme(state) { set('theme', state); }

// ── Font selections ──

/** @returns {{ brand: string, sans: string, serif: string, mono: string } | null} */
export function getFonts() { return get('fonts'); }

/** @param {{ brand?: string, sans?: string, serif?: string, mono?: string }} state */
export function setFonts(state) { set('fonts', state); }

// ── Custom themes (generated from palette) ──

/** @returns {Array<{ name: string, label: string, brandIndex: number, light: Object, dark: Object }>|null} */
export function getCustomThemes() { return get('custom-themes'); }

/** @param {Array} themes */
export function setCustomThemes(themes) { set('custom-themes', themes); }
