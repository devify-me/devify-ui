#!/usr/bin/env node
/**
 * @devify/ui — CDN dist bundle builder
 *
 * Generates minified bundles in dist/:
 *   dist/devify.min.js   — IIFE bundle (all components, CDN-ready)
 *   dist/devify.esm.min.js — ESM bundle (tree-shakeable via CDN)
 *   dist/devify.min.css  — Flattened + minified token bundle
 *
 * Usage: npm run build
 */

import * as esbuild from 'esbuild';
import { readFileSync, mkdirSync } from 'fs';
import { gzipSync } from 'zlib';

const fmtSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

mkdirSync('dist', { recursive: true });

// IIFE bundle — works via <script src="..."> without type="module"
await esbuild.build({
  entryPoints: ['devify.js'],
  bundle: true,
  minify: true,
  outfile: 'dist/devify.min.js',
  format: 'iife',
  target: ['es2020'],
});

// ESM bundle — works via <script type="module"> or import()
await esbuild.build({
  entryPoints: ['devify.js'],
  bundle: true,
  minify: true,
  outfile: 'dist/devify.esm.min.js',
  format: 'esm',
  target: ['es2020'],
});

// CSS bundle — resolves all @import, minifies
await esbuild.build({
  entryPoints: ['devify.css'],
  bundle: true,
  minify: true,
  outfile: 'dist/devify.min.css',
});

// Report bundle sizes
const artifacts = [
  'dist/devify.min.js',
  'dist/devify.esm.min.js',
  'dist/devify.min.css',
];

const rows = artifacts.map((file) => {
  const raw = readFileSync(file);
  const gz = gzipSync(raw);
  return { file, raw: fmtSize(raw.length), gz: fmtSize(gz.length) };
});

const maxFile = Math.max(...rows.map((r) => r.file.length));
const maxRaw  = Math.max(...rows.map((r) => r.raw.length));

console.log('\n\x1b[1mBundle sizes:\x1b[0m\n');
for (const { file, raw, gz } of rows) {
  console.log(
    `  ${file.padEnd(maxFile)}  ${raw.padStart(maxRaw)}  (gzip: ${gz})`
  );
}
console.log();
