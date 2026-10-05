// Export the whole site as static HTML (relative links, forms in demo mode).
//   node scripts/export-static.mjs [outDir]    → ./dist by default
// Useful for previews and for hosting the marketing site on any static host. The quote
// forms need the Node server (or your own endpoint) to actually receive leads.
import { mkdirSync, writeFileSync, cpSync, rmSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPage, listRoutes, sitemapXml, robotsTxt } from '../lib/routes.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

export function exportStatic(outDir = path.join(ROOT, 'dist')) {
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  cpSync(path.join(ROOT, 'public'), outDir, {
    recursive: true,
    filter: (src) => !/admin\.(html|js|css)$/.test(src),
  });
  const routes = [...listRoutes(), '/404'];
  for (const route of routes) {
    const { html } = renderPage(route, { mode: 'static' });
    const file = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
    const target = path.join(outDir, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, html);
  }
  writeFileSync(path.join(outDir, 'sitemap.xml'), sitemapXml());
  writeFileSync(path.join(outDir, 'robots.txt'), robotsTxt().replace('Disallow: /api/\n', ''));
  return { outDir, pages: routes.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const out = process.argv[2] ? path.resolve(process.argv[2]) : undefined;
  const r = exportStatic(out);
  console.log(`Exported ${r.pages} pages to ${path.relative(process.cwd(), r.outDir) || '.'}`);
}
