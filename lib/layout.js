import path from 'node:path';
import { SITE, FONTS_URL } from './config.js';
import { esc } from './markup.js';

// ---------------------------------------------------------------------------
// Link helpers. In "server" mode links are clean URLs (/guides/x). In "static"
// mode (export for preview/hosting without a server) every page is a .html file and
// links are relative, so the exported folder works from anywhere.

const fileFor = (route) => {
  const p = route.replace(/^\/+|\/+$/g, '');
  return p === '' ? 'index.html' : `${p}.html`;
};

export function makeCtx({ mode = 'server', route = '/' } = {}) {
  const here = fileFor(route);
  const dir = path.posix.dirname(here);
  const rel = (file) => (mode === 'server' ? null : path.posix.relative(dir, file) || path.posix.basename(file));
  return {
    mode,
    route,
    href(target) {
      const m = /^([^?#]*)([?#].*)?$/.exec(target);
      const base = m[1] || '/';
      const tail = m[2] || '';
      if (mode === 'server') return (base === '' ? '/' : base) + tail;
      return rel(fileFor(base)) + tail;
    },
    asset(p) {
      return mode === 'server' ? p : rel(p.replace(/^\//, ''));
    },
    api: mode === 'server' ? '/api' : null,
  };
}

// ---------------------------------------------------------------------------

export const NAV = [
  { href: '/solar-calculator', label: 'Calculator' },
  { href: '/battery-storage', label: 'Battery storage' },
  { href: '/installers', label: 'Installers' },
  { href: '/guides', label: 'Guides' },
  { href: '/how-it-works', label: 'How it works' },
];

const FOOTER = [
  {
    title: 'Solar',
    links: [
      ['/solar-calculator', 'Solar savings calculator'],
      ['/battery-storage', 'Battery storage'],
      ['/battery-quote', 'Battery quotes'],
      ['/installers', 'Find an installer'],
      ['/guides', 'Guides'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['/about', 'About us'],
      ['/how-it-works', 'How it works'],
      ['/methodology', 'How we calculate'],
      ['/for-installers', 'For installers'],
      ['/contact', 'Contact'],
    ],
  },
  {
    title: 'Legal',
    links: [
      ['/privacy', 'Privacy notice'],
      ['/terms', 'Terms of use'],
      ['/cookies', 'Cookies'],
    ],
  },
];

const MARK = `<svg class="mark-icon" viewBox="0 0 36 36" aria-hidden="true" focusable="false"><rect width="36" height="36" rx="10" fill="#111111"/><circle cx="18" cy="12.5" r="6" fill="#ffd000"/><path d="M7 28.5 18 18.8l11 9.7" fill="none" stroke="#fff" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
const FAVICON = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><rect width="36" height="36" rx="10" fill="#111111"/><circle cx="18" cy="12.5" r="6" fill="#ffd000"/><path d="M7 28.5 18 18.8l11 9.7" fill="none" stroke="#fff" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
)}`;

export const wordmark = () => `${MARK}<span class="wordmark-text">${esc(SITE.name.toLowerCase())}</span>`;

const jsonForScript = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

export function layout(ctx, page) {
  const { title, description, body, bodyClass = '', scripts = [], noindex = false, config = {} } = page;
  const fullTitle = page.rawTitle ? title : title === SITE.name ? `${SITE.name}: ${SITE.tagline}` : `${title} · ${SITE.name}`;
  const canonical = ctx.mode === 'server' ? `${SITE.url}${ctx.route === '/' ? '/' : ctx.route}` : '';
  const siteConfig = {
    mode: ctx.mode,
    api: ctx.api,
    route: ctx.route,
    consentVersion: SITE.consentVersion,
    brand: SITE.name,
    postcodeLookup: SITE.postcodeLookup,
    links: {
      thankYou: ctx.href('/thank-you'),
      calculator: ctx.href('/solar-calculator'),
      installers: ctx.href('/installers'),
      privacy: ctx.href('/privacy'),
      terms: ctx.href('/terms'),
      guideQuotes: ctx.href('/guides/how-to-compare-solar-quotes'),
      methodology: ctx.href('/methodology'),
    },
    ...config,
  };

  const nav = NAV.map((n) => {
    const current = ctx.route === n.href || (n.href !== '/' && ctx.route.startsWith(n.href + '/'));
    return `<li><a href="${esc(ctx.href(n.href))}"${current ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`;
  }).join('');

  const footerCols = FOOTER.map(
    (col) => `<div class="footer-col"><h2 class="eyebrow">${esc(col.title)}</h2><ul>${col.links
      .map(([h, l]) => `<li><a href="${esc(ctx.href(h))}">${esc(l)}</a></li>`)
      .join('')}</ul></div>`,
  ).join('');

  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex, nofollow">' : ''}
${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ''}
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#ffffff">
<meta name="color-scheme" content="light">
<link rel="icon" href="${FAVICON}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS_URL}">
<link rel="stylesheet" href="${esc(ctx.asset('/css/site.css'))}">
<script type="application/json" id="site-config">${jsonForScript(siteConfig)}</script>
</head>
<body class="${esc(bodyClass)}">
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-row">
    <a class="wordmark" href="${esc(ctx.href('/'))}" aria-label="${esc(SITE.name)} home">${wordmark()}</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-bar" aria-hidden="true"></span><span class="visually-hidden">Menu</span></button>
    <nav class="site-nav" id="site-nav" aria-label="Main"><ul>${nav}</ul>
      <a class="btn btn-small" href="${esc(ctx.href('/solar-calculator'))}"><span>Get my number</span><span class="arrow" aria-hidden="true">→</span></a>
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="footer-top">
      <div class="footer-brand">
        <a class="wordmark wordmark-xl" href="${esc(ctx.href('/'))}">${wordmark()}</a>
        <p class="footer-line">Honest solar maths for UK homes, and up to three quotes only when you ask for them.</p>
      </div>
      <div class="footer-cols">${footerCols}</div>
    </div>
    <div class="footer-small">
      <p><strong>How we’re paid.</strong> Installers pay ${esc(SITE.name)} when we introduce a homeowner who has asked for quotes. It costs you nothing, and it never changes the numbers in your estimate.</p>
      <p>Estimates are indicative, not a quote or a guarantee. ${esc(SITE.name)} is a trading name of ${esc(SITE.company)} (company no. ${esc(SITE.companyNumber)}), ${esc(SITE.address)}. © ${new Date().getFullYear()}</p>
    </div>
  </div>
</footer>
<script type="module" src="${esc(ctx.asset('/js/site.js'))}"></script>
${scripts.map((s) => `<script type="module" src="${esc(ctx.asset(s))}"></script>`).join('\n')}
</body>
</html>`;
}
