import { makeCtx, layout } from './layout.js';
import { installers } from './installers.js';
import * as main from './pages-main.js';
import * as info from './pages-info.js';
import { GUIDES } from '../content/guides.js';
import { SITE } from './config.js';

const STATIC = {
  '/': main.home,
  '/solar-calculator': main.calculator,
  '/get-quotes': main.getQuotes,
  '/battery-storage': main.batteryStorage,
  '/battery-quote': main.batteryQuote,
  '/installers': main.installerDirectory,
  '/for-installers': main.forInstallers,
  '/contact': main.contact,
  '/thank-you': main.thankYou,
  '/guides': info.guidesIndex,
  '/how-it-works': info.howItWorks,
  '/methodology': info.methodology,
  '/about': info.about,
  '/privacy': (c) => info.legal(c, 'privacy'),
  '/terms': (c) => info.legal(c, 'terms'),
  '/cookies': (c) => info.legal(c, 'cookies'),
};

const NOT_INDEXED = new Set(['/thank-you', '/404']);

export function listRoutes() {
  return [
    ...Object.keys(STATIC),
    ...installers().map((i) => `/installers/${i.slug}`),
    ...GUIDES.map((g) => `/guides/${g.slug}`),
  ];
}

export function normalise(p) {
  let route = decodeURIComponent(p.split('?')[0].split('#')[0]);
  if (route.length > 1) route = route.replace(/\/+$/, '');
  return route || '/';
}

function build(route, ctx) {
  if (STATIC[route]) return STATIC[route](ctx);
  let m = /^\/installers\/([a-z0-9-]+)$/.exec(route);
  if (m) return main.installerProfile(ctx, m[1]);
  m = /^\/guides\/([a-z0-9-]+)$/.exec(route);
  if (m) return info.guide(ctx, m[1]);
  return null;
}

export function renderPage(rawRoute, { mode = 'server' } = {}) {
  const route = normalise(rawRoute);
  const ctx = makeCtx({ mode, route });
  const page = build(route, ctx);
  if (page) return { status: 200, route, html: layout(ctx, page) };
  const nfCtx = makeCtx({ mode, route: '/404' });
  return { status: 404, route: '/404', html: layout(nfCtx, main.notFound(nfCtx)) };
}

export function sitemapXml() {
  const urls = listRoutes().filter((r) => !NOT_INDEXED.has(r));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${SITE.url}${u === '/' ? '/' : u}</loc></url>`)
    .join('\n')}\n</urlset>\n`;
}

export const robotsTxt = () => `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nDisallow: /thank-you\n\nSitemap: ${SITE.url}/sitemap.xml\n`;
