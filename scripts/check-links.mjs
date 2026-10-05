// Link checker: no missing pages, assets or #anchors, in both server and static modes.
//   node scripts/check-links.mjs
import { existsSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPage, listRoutes, normalise } from '../lib/routes.js';
import { exportStatic } from './export-static.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');

const ATTR = /\b(?:href|src|action)="([^"]*)"/g;
const IDS = /\bid="([^"]+)"/g;

const refsIn = (html) => [...html.matchAll(ATTR)].map((m) => m[1].replace(/&amp;/g, '&'));
const idsIn = (html) => new Set([...html.matchAll(IDS)].map((m) => m[1]));
const isExternal = (u) => /^(https?:|mailto:|tel:|data:|javascript:)/i.test(u) || u === '';

const problems = [];
const problem = (page, ref, why) => problems.push(`${page}  →  ${ref}  (${why})`);

// ---- Server mode: root-relative links must be real routes or public files ----
const knownRoutes = new Set(listRoutes());
const serverPages = new Map(); // route → html
for (const r of [...knownRoutes]) serverPages.set(r, renderPage(r).html);
serverPages.set('/404', renderPage('/this-page-does-not-exist').html);

for (const [route, html] of serverPages) {
  for (const ref of refsIn(html)) {
    if (isExternal(ref)) continue;
    const [urlPath, hash] = ref.split('#');
    let target = urlPath;
    if (target === '') {
      // "#anchor" on the same page
      if (hash && !idsIn(html).has(hash)) problem(route, ref, `anchor #${hash} not found`);
      continue;
    }
    if (!target.startsWith('/')) { problem(route, ref, 'not root-relative in server mode'); continue; }
    const clean = normalise(target);
    const asset = path.join(PUBLIC, clean);
    if (path.extname(clean)) {
      if (!asset.startsWith(PUBLIC) || !existsSync(asset)) problem(route, ref, 'missing file');
      continue;
    }
    if (clean === '/admin') continue; // exists, behind a password
    if (!knownRoutes.has(clean)) { problem(route, ref, 'unknown route'); continue; }
    if (hash) {
      const ids = idsIn(serverPages.get(clean));
      if (!ids.has(hash) && !['top'].includes(hash)) problem(route, ref, `anchor #${hash} not found`);
    }
  }
}

// ---- Static mode: every relative link must resolve to an exported file ----
const tmp = mkdtempSync(path.join(tmpdir(), 'rw-export-'));
exportStatic(tmp);
let staticFiles = 0;
for (const route of [...knownRoutes, '/404']) {
  const file = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
  const html = readFileSync(path.join(tmp, file), 'utf8');
  staticFiles++;
  for (const ref of refsIn(html)) {
    if (isExternal(ref)) continue;
    const [urlPath, hash] = ref.split('#');
    const targetFile = urlPath === '' ? file : path.posix.normalize(path.posix.join(path.posix.dirname(file), urlPath));
    const abs = path.join(tmp, targetFile);
    if (!abs.startsWith(tmp) || !existsSync(abs)) { problem(`static:${file}`, ref, 'missing file'); continue; }
    if (hash && abs.endsWith('.html')) {
      const ids = idsIn(readFileSync(abs, 'utf8'));
      if (!ids.has(hash)) problem(`static:${file}`, ref, `anchor #${hash} not found`);
    }
  }
}
rmSync(tmp, { recursive: true, force: true });

const nav = serverPages.get('/');
console.log(`Checked ${serverPages.size} pages in server mode and ${staticFiles} in static mode.`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n` + [...new Set(problems)].map((p) => ' - ' + p).join('\n'));
  process.exit(1);
}
console.log('No broken links, assets or anchors.');
