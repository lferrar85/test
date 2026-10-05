// Zero-dependency Node server: pages, JSON API for forms, and a small admin.
//   npm start             → http://localhost:3000
//   ADMIN_PASSWORD=...    → enables /admin (disabled when unset)
//   WEBHOOK_URL=...       → forwards each submission (Zapier, Make, Slack, CRM)
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { timingSafeEqual } from 'node:crypto';
import { renderPage, sitemapXml, robotsTxt } from './lib/routes.js';
import { openDb } from './lib/db.js';
import { validate, KINDS } from './lib/validate.js';
import { matchInstallers, installerBySlug } from './lib/installers.js';
import { notify } from './lib/notify.js';
import { SITE } from './lib/config.js';
import { REGIONS } from './public/js/data.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, 'public');
const PROD = process.env.NODE_ENV === 'production';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2',
};

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  "img-src 'self' data:",
  `connect-src 'self'${SITE.postcodeLookup ? ' https://api.postcodes.io' : ''}`,
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const SECURITY_HEADERS = {
  'Content-Security-Policy': CSP,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  ...(PROD ? { 'Strict-Transport-Security': 'max-age=31536000' } : {}),
};

// ---------------------------------------------------------------------------

export function createApp({ db = openDb() } = {}) {
  const hits = new Map(); // ip -> [timestamps]
  const RATE = { max: Number(process.env.RATE_LIMIT_PER_HOUR || 8), windowMs: 3600_000 };

  const clientIp = (req) => (process.env.TRUST_PROXY === '1' ? String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() : '') || req.socket.remoteAddress || 'unknown';
  function limited(ip) {
    const now = Date.now();
    if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < RATE.windowMs)) hits.delete(k);
    const recent = (hits.get(ip) || []).filter((t) => now - t < RATE.windowMs);
    if (recent.length >= RATE.max) {
      hits.set(ip, recent);
      return true;
    }
    recent.push(now);
    hits.set(ip, recent);
    return false;
  }

  const send = (res, status, body, headers = {}) => {
    res.writeHead(status, { ...SECURITY_HEADERS, ...headers });
    res.end(body);
  };
  const json = (res, status, obj, extra = {}) => send(res, status, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra });

  async function readJson(req, limit = 64 * 1024) {
    let size = 0;
    const chunks = [];
    for await (const c of req) {
      size += c.length;
      if (size > limit) throw Object.assign(new Error('Too large'), { status: 413 });
      chunks.push(c);
    }
    try {
      return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
    } catch {
      throw Object.assign(new Error('Invalid JSON'), { status: 400 });
    }
  }

  // ---- admin auth ----------------------------------------------------------
  function adminOk(req) {
    const pass = process.env.ADMIN_PASSWORD;
    if (!pass) return false;
    const user = process.env.ADMIN_USER || 'admin';
    const m = /^Basic (.+)$/.exec(req.headers.authorization || '');
    if (!m) return false;
    const [u, ...rest] = Buffer.from(m[1], 'base64').toString('utf8').split(':');
    const p = rest.join(':');
    const eq = (a, b) => {
      const A = Buffer.from(String(a));
      const B = Buffer.from(String(b));
      return A.length === B.length && timingSafeEqual(A, B);
    };
    const userOk = eq(u, user);
    const passOk = eq(p, pass);
    return userOk && passOk;
  }
  function requireAdmin(req, res) {
    if (!process.env.ADMIN_PASSWORD) {
      send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
      return false;
    }
    if (!adminOk(req)) {
      send(res, 401, 'Authentication required', { 'WWW-Authenticate': 'Basic realm="Admin", charset="UTF-8"', 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
      return false;
    }
    return true;
  }

  const csvCell = (v) => {
    let s = v == null ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
    return `"${s.replace(/"/g, '""')}"`;
  };

  // ---- submissions ---------------------------------------------------------
  const ENDPOINTS = { quote: 'quote', battery: 'battery', contact: 'contact', 'installer-apply': 'installer' };

  async function handleSubmit(req, res, kind) {
    if (limited(clientIp(req))) return json(res, 429, { ok: false, error: 'Too many requests. Please try again later.' });
    let body;
    try {
      body = await readJson(req);
    } catch (e) {
      return json(res, e.status || 400, { ok: false, error: e.message });
    }
    const result = validate(kind, body);
    if (result.spam) return json(res, 201, { ok: true, ref: 'RW-00000000', matched: [] }); // quietly drop bots
    if (Object.keys(result.errors).length) return json(res, 422, { ok: false, errors: result.errors });

    const data = result.data;
    let matched = [];
    if (kind === 'quote' || kind === 'battery') {
      const service = kind === 'battery' ? 'battery' : 'solar';
      const direct = data.installer ? installerBySlug(data.installer) : null;
      // The visitor agreed to share details with the installers they were shown, so use exactly
      // those, provided each really covers their area and offers the service. Otherwise match afresh.
      const shown = Array.isArray(body.installers) ? body.installers.slice(0, 3).map(installerBySlug).filter(Boolean) : [];
      const valid = new Set(matchInstallers(data.region, { service, limit: 99 }).map((i) => i.slug));
      const shownValid = shown.filter((i) => valid.has(i.slug));
      matched = direct ? [direct] : shownValid.length ? shownValid : matchInstallers(data.region, { service, limit: 3, load: db.installerLoad() });
    }
    const ref = db.save({
      kind,
      name: data.name || data.company,
      email: data.email,
      phone: data.phone,
      postcode: data.postcode,
      region: data.region,
      data,
      matched: matched.length || kind === 'quote' || kind === 'battery' ? matched.map((i) => i.slug) : null,
      consentVersion: ['quote', 'battery', 'installer'].includes(kind) ? SITE.consentVersion : null,
      consentText: result.consentText,
    });
    notify({ event: 'submission', kind, ref, matched: matched.map((i) => i.slug), data }).catch(() => {});
    json(res, 201, { ok: true, ref, matched: matched.map((i) => ({ slug: i.slug, name: i.name })) });
  }

  // ---- static files ----------------------------------------------------------
  async function serveStatic(res, pathname) {
    const file = path.resolve(PUBLIC, '.' + pathname);
    if (!file.startsWith(PUBLIC + path.sep)) return false;
    try {
      const s = await stat(file);
      if (!s.isFile()) return false;
      const ext = path.extname(file).toLowerCase();
      const type = MIME[ext];
      if (!type) return false;
      const data = await readFile(file);
      send(res, 200, data, { 'Content-Type': type, 'Cache-Control': PROD ? 'public, max-age=3600' : 'no-cache' });
      return true;
    } catch {
      return false;
    }
  }

  const pageCache = new Map();

  async function handler(req, res) {
    try {
      const url = new URL(req.url, 'http://localhost');
      const pathname = url.pathname;

      // API
      if (pathname.startsWith('/api/')) {
        const name = pathname.slice(5);
        if (req.method === 'POST' && ENDPOINTS[name]) return handleSubmit(req, res, ENDPOINTS[name]);
        if (req.method === 'GET' && name === 'match') {
          const region = url.searchParams.get('region') || 'uk';
          const service = url.searchParams.get('service') === 'battery' ? 'battery' : 'solar';
          if (region !== 'uk' && !REGIONS[region]) return json(res, 422, { ok: false, error: 'Unknown region' });
          const list = matchInstallers(region, { service, limit: 3, load: db.installerLoad() });
          return json(res, 200, { ok: true, installers: list.map((i) => ({ slug: i.slug, name: i.name, tagline: i.tagline })) });
        }

        if (name.startsWith('admin/')) {
          if (!requireAdmin(req, res)) return;
          const sub = name.slice(6);
          if (req.method === 'GET' && sub === 'submissions') {
            const kind = url.searchParams.get('kind') || '';
            return json(res, 200, { ok: true, submissions: db.list(KINDS.includes(kind) ? kind : '', Math.min(Number(url.searchParams.get('limit')) || 500, 2000)) });
          }
          if (req.method === 'GET' && sub === 'export.csv') {
            const kind = url.searchParams.get('kind') || '';
            const rows = db.list(KINDS.includes(kind) ? kind : '', 10000);
            const head = ['ref', 'kind', 'created_at', 'status', 'name', 'email', 'phone', 'postcode', 'region', 'matched', 'consent_version', 'consent_at', 'data'];
            const csv = [head.join(','), ...rows.map((r) => head.map((h) => csvCell(h === 'data' ? JSON.stringify(r.data) : h === 'matched' ? r.matched.join(' ') : r[h])).join(','))].join('\n');
            return send(res, 200, csv, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="roofworth-submissions.csv"', 'Cache-Control': 'no-store' });
          }
          const m = /^submissions\/(RW-[0-9A-F]{8})$/.exec(sub);
          if (m && req.method === 'PATCH') {
            const body = await readJson(req);
            if (!['new', 'contacted', 'closed'].includes(body.status)) return json(res, 422, { ok: false, error: 'Bad status' });
            return json(res, db.setStatus(m[1], body.status) ? 200 : 404, { ok: true });
          }
          if (m && req.method === 'DELETE') return json(res, db.remove(m[1]) ? 200 : 404, { ok: true });
        }
        return json(res, 404, { ok: false, error: 'Not found' });
      }

      if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed', { Allow: 'GET, HEAD' });

      if (pathname === '/admin' || pathname === '/admin/') {
        if (!requireAdmin(req, res)) return;
        const html = await readFile(path.join(PUBLIC, 'admin.html'));
        return send(res, 200, html, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' });
      }
      if (pathname === '/healthz') {
        db.list('', 1);
        return json(res, 200, { ok: true });
      }
      if (pathname === '/robots.txt') return send(res, 200, robotsTxt(), { 'Content-Type': MIME['.txt'] });
      if (pathname === '/sitemap.xml') return send(res, 200, sitemapXml(), { 'Content-Type': MIME['.xml'] });
      if (pathname === '/favicon.ico') return send(res, 204, '');
      if (pathname === '/admin.html') return send(res, 404, 'Not found');

      if (path.extname(pathname) && (await serveStatic(res, pathname))) return;

      let page = PROD ? pageCache.get(pathname) : null;
      if (!page) {
        page = renderPage(pathname);
        if (PROD && page.status === 200) pageCache.set(pathname, page);
      }
      send(res, page.status, req.method === 'HEAD' ? '' : page.html, { 'Content-Type': MIME['.html'], 'Cache-Control': PROD ? 'public, max-age=300' : 'no-cache' });
    } catch (err) {
      console.error(err);
      send(res, 500, 'Something went wrong.', { 'Content-Type': 'text/plain; charset=utf-8' });
    }
  }

  return { handler, db };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { handler, db } = createApp();
  const port = Number(process.env.PORT || 3000);
  // Keep the privacy notice's promise: delete submissions older than RETENTION_MONTHS (default 12), daily.
  const months = Number(process.env.RETENTION_MONTHS || 12);
  const purge = () => {
    try {
      const n = db.purgeOlderThan(months);
      if (n) console.log(`Retention: deleted ${n} submission(s) older than ${months} months.`);
    } catch (e) {
      console.error('Retention purge failed:', e.message);
    }
  };
  if (process.env.AUTO_PURGE !== '0') {
    purge();
    setInterval(purge, 24 * 3600_000).unref();
  }
  http.createServer(handler).listen(port, () => {
    console.log(`${SITE.name} running at http://localhost:${port}`);
    if (!process.env.ADMIN_PASSWORD) console.log('Admin disabled: set ADMIN_PASSWORD to enable /admin');
  });
}
