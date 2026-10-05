import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../server.js';
import { openDb } from '../lib/db.js';

let server, base, app;

before(async () => {
  process.env.ADMIN_PASSWORD = 'secret-for-tests';
  process.env.RATE_LIMIT_PER_HOUR = '1000';
  app = createApp({ db: openDb(':memory:') });
  server = http.createServer(app.handler);
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

const post = (path, body, headers = {}) =>
  fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
const admin = { authorization: 'Basic ' + Buffer.from('admin:secret-for-tests').toString('base64') };

const goodQuote = (over = {}) => ({
  name: 'Sam Tester', email: 'Sam@Example.com', phone: '07700 900123', postcode: 'ls1 4ap', consent: true,
  consentText: 'I agree to share my details with Kestrel Solar Works', ...over,
});

test('pages render with security headers, and unknown paths are 404', async () => {
  for (const p of ['/', '/solar-calculator', '/battery-storage', '/installers', '/guides', '/privacy', '/contact']) {
    const res = await fetch(base + p);
    assert.equal(res.status, 200, p);
    assert.match(res.headers.get('content-security-policy'), /default-src 'self'/);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.match(res.headers.get('content-type'), /text\/html/);
  }
  assert.equal((await fetch(base + '/nope')).status, 404);
  assert.equal((await fetch(base + '/guides/not-a-guide')).status, 404);
  assert.equal((await fetch(base + '/../server.js')).status, 404);
  assert.equal((await fetch(base + '/js/../../server.js')).status, 404);
});

test('static assets are served, and server code is not', async () => {
  assert.equal((await fetch(base + '/css/site.css')).status, 200);
  assert.equal((await fetch(base + '/js/model.js')).status, 200);
  assert.equal((await fetch(base + '/admin.html')).status, 404);
  assert.equal((await fetch(base + '/package.json')).status, 404);
});

test('valid quote is stored and matched to installers covering the postcode', async () => {
  const res = await post('/api/quote', goodQuote({ installers: ['kestrel-solar-works', 'harbour-and-hill-energy'], calc: { kWp: 4.4, saving: 618, evil: '<script>' } }));
  assert.equal(res.status, 201);
  const out = await res.json();
  assert.match(out.ref, /^RW-[0-9A-F]{8}$/);
  // Harbour & Hill doesn't cover Yorkshire, so it must not receive the lead.
  assert.deepEqual(out.matched.map((m) => m.slug), ['kestrel-solar-works']);
  const row = app.db.get(out.ref);
  assert.equal(row.email, 'sam@example.com');
  assert.equal(row.phone, '07700900123');
  assert.equal(row.postcode, 'LS1 4AP');
  assert.equal(row.region, 'yorks');
  assert.equal(row.consent_version, '2026-10-v1');
  assert.match(row.consent_text, /Kestrel/);
  assert.equal(row.data.calc.saving, 618);
  assert.equal(row.data.calc.evil, undefined);
});

test('validation: missing consent, bad email/phone/postcode are rejected with field errors', async () => {
  const res = await post('/api/quote', { name: '', email: 'nope', phone: '12', postcode: 'zzz' });
  assert.equal(res.status, 422);
  const { errors } = await res.json();
  for (const k of ['name', 'email', 'phone', 'postcode', 'consent']) assert.ok(errors[k], k);
  const noConsent = await post('/api/quote', goodQuote({ consent: false }));
  assert.equal(noConsent.status, 422);
});

test('honeypot submissions look successful but are not stored', async () => {
  const before = app.db.list().length;
  const res = await post('/api/quote', goodQuote({ hp_url: 'http://spam.example' }));
  assert.equal(res.status, 201);
  assert.equal(app.db.list().length, before);
});

test('malformed and oversized bodies are refused', async () => {
  assert.equal((await post('/api/quote', '{oops')).status, 400);
  assert.equal((await post('/api/quote', JSON.stringify({ notes: 'x'.repeat(80_000) }))).status, 413);
});

test('direct installer enquiry goes only to that installer', async () => {
  const res = await post('/api/quote', goodQuote({ installer: 'marlowe-solar', postcode: 'SW1A 2AA' }));
  const out = await res.json();
  assert.deepEqual(out.matched.map((m) => m.slug), ['marlowe-solar']);
});

test('battery and contact and installer application forms', async () => {
  const b = await post('/api/battery', { name: 'B', email: 'b@b.co', phone: '07700900124', postcode: 'SW1A 2AA', consent: true, existing_solar: 'yes' });
  assert.equal(b.status, 201);
  assert.ok((await b.json()).matched.length > 0);
  assert.equal((await post('/api/battery', { name: 'B', email: 'b@b.co', phone: '07700900124', postcode: 'SW1A 2AA', consent: true })).status, 422, 'existing_solar is required');
  const c = await post('/api/contact', { name: 'C', email: 'c@c.co', message: 'Hello', topic: 'other' });
  assert.equal(c.status, 201);
  assert.deepEqual((await c.json()).matched, []);
  const i = await post('/api/installer-apply', { company: 'Acme Solar', name: 'D', email: 'd@d.co', phone: '07700900125', mcs_number: 'NAP12345', areas: 'LS, BD', consent: true });
  assert.equal(i.status, 201);
});

test('match endpoint shares leads fairly: installers with fewer leads come first', async () => {
  const first = await (await fetch(base + '/api/match?region=london&service=solar')).json();
  assert.ok(first.installers.length <= 3 && first.installers.length > 0);
  assert.equal((await fetch(base + '/api/match?region=atlantis')).status, 422);
  // Give the top installer several leads; it should move down the list.
  const top = first.installers[0].slug;
  for (let n = 0; n < 3; n++) await post('/api/quote', goodQuote({ installer: top, postcode: 'SW1A 2AA' }));
  const after = await (await fetch(base + '/api/match?region=london&service=solar')).json();
  assert.notEqual(after.installers[0].slug, top);
});

test('admin: closed without credentials, open with them, can update and delete', async () => {
  assert.equal((await fetch(base + '/admin')).status, 401);
  assert.equal((await fetch(base + '/api/admin/submissions')).status, 401);
  assert.equal((await fetch(base + '/api/admin/submissions', { headers: { authorization: 'Basic ' + Buffer.from('admin:wrong').toString('base64') } })).status, 401);
  assert.equal((await fetch(base + '/admin', { headers: admin })).status, 200);
  const list = await (await fetch(base + '/api/admin/submissions?kind=quote', { headers: admin })).json();
  assert.ok(list.submissions.length > 0 && list.submissions.every((s) => s.kind === 'quote'));
  const ref = list.submissions[0].ref;
  const patch = await fetch(`${base}/api/admin/submissions/${ref}`, { method: 'PATCH', headers: { ...admin, 'content-type': 'application/json' }, body: JSON.stringify({ status: 'contacted' }) });
  assert.equal(patch.status, 200);
  assert.equal(app.db.get(ref).status, 'contacted');
  assert.equal((await fetch(`${base}/api/admin/submissions/${ref}`, { method: 'PATCH', headers: { ...admin, 'content-type': 'application/json' }, body: JSON.stringify({ status: 'hacked' }) })).status, 422);
  assert.equal((await fetch(`${base}/api/admin/submissions/${ref}`, { method: 'DELETE', headers: admin })).status, 200);
  assert.equal(app.db.get(ref), null);
});

test('admin CSV neutralises spreadsheet formulas', async () => {
  await post('/api/quote', goodQuote({ name: '=HYPERLINK("http://evil.example","click")' }));
  const csv = await (await fetch(base + '/api/admin/export.csv', { headers: admin })).text();
  assert.match(csv, /"'=HYPERLINK/);
  assert.ok(!/(^|,)"=HYPERLINK/m.test(csv));
});

test('admin is disabled entirely when no password is configured', async () => {
  const saved = process.env.ADMIN_PASSWORD;
  delete process.env.ADMIN_PASSWORD;
  try {
    assert.equal((await fetch(base + '/admin', { headers: admin })).status, 404);
    assert.equal((await fetch(base + '/api/admin/submissions', { headers: admin })).status, 404);
  } finally {
    process.env.ADMIN_PASSWORD = saved;
  }
});

test('rate limiting returns 429 after too many submissions from one client', async () => {
  const limited = createApp({ db: openDb(':memory:') });
  process.env.RATE_LIMIT_PER_HOUR = '3';
  const limitedApp = createApp({ db: openDb(':memory:') });
  const s = http.createServer(limitedApp.handler);
  await new Promise((r) => s.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${s.address().port}/api/contact`;
  const codes = [];
  for (let n = 0; n < 5; n++) codes.push((await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name: 'a', email: 'a@b.co', message: 'hi' }) })).status);
  s.close();
  process.env.RATE_LIMIT_PER_HOUR = '1000';
  assert.deepEqual(codes, [201, 201, 201, 429, 429]);
});

test('sitemap and robots', async () => {
  const sm = await (await fetch(base + '/sitemap.xml')).text();
  assert.match(sm, /\/guides\/smart-export-guarantee/);
  assert.ok(!sm.includes('thank-you'));
  assert.match(await (await fetch(base + '/robots.txt')).text(), /Disallow: \/admin/);
});

test('retention: purge removes submissions older than the cutoff and keeps recent ones', () => {
  const db = openDb(':memory:');
  const ref = db.save({ kind: 'contact', name: 'Old', email: 'o@o.co', data: {} });
  db.save({ kind: 'contact', name: 'New', email: 'n@n.co', data: {} });
  // purging "as of" 13 months from now makes both older than 12 months; as of today neither is
  assert.equal(db.purgeOlderThan(12), 0);
  const future = new Date();
  future.setMonth(future.getMonth() + 13);
  assert.equal(db.purgeOlderThan(12, future), 2);
  assert.equal(db.get(ref), null);
});

test('property details from the calculator are kept when valid and dropped when not', async () => {
  const res = await post('/api/quote', goodQuote({ calc: { property: 'semi', roofCovering: 'slate', homeAge: '1930_1990', ownership: 'rent' } }));
  const ref = (await res.json()).ref;
  const c = app.db.get(ref).data.calc;
  assert.equal(c.property, 'semi');
  assert.equal(c.roofCovering, 'slate');
  assert.equal(c.homeAge, '1930_1990');
  assert.equal(c.ownership, 'rent');
  const bad = await post('/api/quote', goodQuote({ calc: { property: '<script>', ownership: 'squatter' } }));
  const c2 = app.db.get((await bad.json()).ref).data.calc;
  assert.equal(c2.property, null);
  assert.equal(c2.ownership, null);
});
