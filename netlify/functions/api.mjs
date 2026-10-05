// Netlify Function: the same form endpoints as server.js, without a database.
// Every valid submission is POSTed to WEBHOOK_URL (Zapier, Make, Google Sheets, your CRM).
// Set WEBHOOK_URL in Netlify: Site configuration > Environment variables.
import { validate } from '../../lib/validate.js';
import { matchInstallers, installerBySlug } from '../../lib/installers.js';
import { REGIONS } from '../../public/js/data.js';
import { SITE } from '../../lib/config.js';
import { randomBytes } from 'node:crypto';

export const config = { path: '/api/*' };

const ENDPOINTS = { quote: 'quote', battery: 'battery', contact: 'contact', 'installer-apply': 'installer' };
const json = (status, obj) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export default async (req) => {
  const url = new URL(req.url);
  const name = url.pathname.replace(/^\/api\//, '');

  if (req.method === 'GET' && name === 'match') {
    const region = url.searchParams.get('region') || 'uk';
    const service = url.searchParams.get('service') === 'battery' ? 'battery' : 'solar';
    if (region !== 'uk' && !REGIONS[region]) return json(422, { ok: false, error: 'Unknown region' });
    const list = matchInstallers(region, { service, limit: 3 });
    return json(200, { ok: true, installers: list.map((i) => ({ slug: i.slug, name: i.name, tagline: i.tagline })) });
  }

  const kind = ENDPOINTS[name];
  if (req.method !== 'POST' || !kind) return json(404, { ok: false, error: 'Not found' });

  let body;
  try {
    const text = await req.text();
    if (text.length > 64 * 1024) return json(413, { ok: false, error: 'Too large' });
    body = JSON.parse(text || '{}');
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON' });
  }

  const result = validate(kind, body);
  if (result.spam) return json(201, { ok: true, ref: 'RW-00000000', matched: [] });
  if (Object.keys(result.errors).length) return json(422, { ok: false, errors: result.errors });

  const hook = process.env.WEBHOOK_URL;
  if (!hook) return json(503, { ok: false, error: 'Submissions are not configured yet.' });

  const data = result.data;
  let matched = [];
  if (kind === 'quote' || kind === 'battery') {
    const service = kind === 'battery' ? 'battery' : 'solar';
    const valid = new Set(matchInstallers(data.region, { service, limit: 99 }).map((i) => i.slug));
    const direct = data.installer ? installerBySlug(data.installer) : null;
    const shown = Array.isArray(body.installers) ? body.installers.slice(0, 3).map(installerBySlug).filter((i) => i && valid.has(i.slug)) : [];
    matched = direct ? [direct] : shown.length ? shown : matchInstallers(data.region, { service, limit: 3 });
  }
  const ref = `RW-${randomBytes(4).toString('hex').toUpperCase()}`;
  const event = { event: 'submission', ref, kind, at: new Date().toISOString(), matched: matched.map((i) => i.slug), consentVersion: SITE.consentVersion, consentText: result.consentText, data };

  try {
    const res = await fetch(hook, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(event), signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`webhook ${res.status}`);
  } catch (err) {
    console.error('[submit] webhook failed:', err.message); // never log the lead itself
    return json(502, { ok: false, error: 'Could not send. Please try again or email us.' });
  }
  return json(201, { ok: true, ref, matched: matched.map((i) => ({ slug: i.slug, name: i.name })) });
};
