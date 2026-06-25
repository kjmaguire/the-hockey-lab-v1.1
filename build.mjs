#!/usr/bin/env node
/*
 * Precompile build — removes the runtime in-browser Babel transformer.
 *
 *   npm run build
 *
 * What it does:
 *  1. Reads public/app.html and finds every <script type="text/babel" src="…​.jsx">.
 *  2. Compiles each referenced .jsx → a sibling .compiled.js with esbuild
 *     (JSX → React.createElement, minified), then wraps each module in an
 *     IIFE. The wrap is REQUIRED: the modules share top-level names (T, card,
 *     Badge, Spark, …) that collide as global `const`s once Babel's per-script
 *     isolation is gone. They communicate via window.* (E_TOK/E_UI/E_PAGES/BC),
 *     so function-scoping each module is safe and prevents the collision.
 *  3. Writes public/app.prod.html — identical to app.html but with the Babel
 *     CDN <script> dropped and each .jsx swapped for its .compiled.js, and
 *     React/ReactDOM switched to their production builds.
 *
 * The original public/app.html (runtime Babel) is left untouched, so local
 * preview keeps working with zero build step. Deploy app.prod.html for speed.
 */
import { transform } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.join(ROOT, 'public');
const SRC = path.join(PUB, 'app.html');

const html = await readFile(SRC, 'utf8');

// match: <script type="text/babel" src="redesign/x.jsx?v=…"></script>
const RE = /<script\s+type="text\/babel"\s+src="([^"?]+\.jsx)(\?[^"]*)?"><\/script>/g;

const compiled = [];
let m;
while ((m = RE.exec(html)) !== null) {
  const rel = m[1];                       // e.g. redesign/editorial-app.jsx
  const code = await readFile(path.join(PUB, rel), 'utf8');
  const res = await transform(code, {
    loader: 'jsx',
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    target: 'es2019',
    minify: true,
    legalComments: 'none',
  });
  const outRel = rel.replace(/\.jsx$/, '.compiled.js');
  // Wrap in an IIFE so the modules' shared top-level names don't collide in the
  // single global script scope (see header note). They wire up through window.*.
  await writeFile(path.join(PUB, outRel), `(function(){\n${res.code}\n})();\n`, 'utf8');
  compiled.push(outRel);
}

if (!compiled.length) {
  console.warn('No <script type="text/babel"> JSX modules found in app.html — nothing to compile.');
}

// Build the production HTML.
let prod = html
  // jsx babel scripts → plain compiled scripts (same load order)
  .replace(RE, (_full, rel, q) => `<script src="${rel.replace(/\.jsx$/, '.compiled.js')}${q || ''}"></script>`)
  // drop the in-browser Babel transformer entirely
  .replace(/\n?\s*<script src="https:\/\/unpkg\.com\/@babel\/standalone[^"]*"[^>]*><\/script>/g, '')
  // React + ReactDOM → production builds (smaller, faster); integrity hashes differ so drop them
  .replace(/<script src="https:\/\/unpkg\.com\/react@([\d.]+)\/umd\/react\.development\.js"[^>]*><\/script>/,
           '<script src="https://unpkg.com/react@$1/umd/react.production.min.js" crossorigin="anonymous"></script>')
  .replace(/<script src="https:\/\/unpkg\.com\/react-dom@([\d.]+)\/umd\/react-dom\.development\.js"[^>]*><\/script>/,
           '<script src="https://unpkg.com/react-dom@$1/umd/react-dom.production.min.js" crossorigin="anonymous"></script>');

await writeFile(path.join(PUB, 'app.prod.html'), prod, 'utf8');

console.log(`✓ Compiled ${compiled.length} JSX module(s):`);
compiled.forEach((f) => console.log(`    ${f}`));
console.log('✓ Wrote public/app.prod.html (Babel-free, production React)');
