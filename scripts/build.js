#!/usr/bin/env node

/**
 * Build script — produces CDN-ready minified bundles.
 *
 * Output:
 *   dist/devify.min.js   — all components (IIFE, self-registering)
 *   dist/devify.min.css  — all tokens inlined
 */

import { build } from 'esbuild';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const banner = `/* @devify/ui v${pkg.version} — https://devify.me */`;

async function run() {
  const [js, css] = await Promise.all([
    build({
      entryPoints: ['devify.js'],
      bundle: true,
      minify: true,
      format: 'iife',
      outfile: 'dist/devify.min.js',
      banner: { js: banner },
      metafile: true,
    }),
    build({
      entryPoints: ['devify.css'],
      bundle: true,
      minify: true,
      outfile: 'dist/devify.min.css',
      banner: { css: banner },
      metafile: true,
    }),
  ]);

  const jsSize = Object.values(js.metafile.outputs)[0].bytes;
  const cssSize = Object.values(css.metafile.outputs)[0].bytes;

  console.log(`dist/devify.min.js   ${fmt(jsSize)}`);
  console.log(`dist/devify.min.css  ${fmt(cssSize)}`);
  console.log(`total                ${fmt(jsSize + cssSize)}`);
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
