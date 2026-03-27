/**
 * catalog/brand-state.js — Shared brand override state
 *
 * Extracted from brand.js so both the palette generator and themes page
 * can read/write the same overrides map.
 */

/** @type {Map<string, Map<string, string>>} themeName → tokenName → value */
const themeOverrides = new Map();

/** Active custom palette overrides (applied to :root as inline styles) */
const activeOverrides = new Map();

// ── Per-theme overrides (for multi-theme comparison view) ──

export function getThemeOverrides(themeName) {
  if (!themeOverrides.has(themeName)) themeOverrides.set(themeName, new Map());
  return themeOverrides.get(themeName);
}

export function setThemeOverride(themeName, tokenName, value) {
  getThemeOverrides(themeName).set(tokenName, value);
}

export function clearThemeOverrides(themeName) {
  if (themeOverrides.has(themeName)) themeOverrides.get(themeName).clear();
}

export function getAllThemeOverrides() {
  return themeOverrides;
}

// ── Active overrides (applied to document root) ──

export function getActiveOverrides() {
  return activeOverrides;
}

export function setActiveOverrides(overridesMap) {
  activeOverrides.clear();
  for (const [k, v] of overridesMap) {
    activeOverrides.set(k, v);
  }
}

/**
 * Apply all active overrides to documentElement inline styles.
 */
export function applyActiveOverrides() {
  for (const [name, value] of activeOverrides) {
    document.documentElement.style.setProperty(name, value);
  }
}

/**
 * Remove all active overrides from documentElement inline styles.
 */
export function clearActiveOverrides() {
  for (const name of activeOverrides.keys()) {
    document.documentElement.style.removeProperty(name);
  }
  activeOverrides.clear();
}
