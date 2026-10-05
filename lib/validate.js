// Server-side validation for every public form. Never trust the browser.
import { parsePostcode } from '../public/js/model.js';

const clean = (v, max = 200) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalisePhone(raw) {
  const digits = String(raw ?? '').replace(/[^\d+]/g, '');
  const d = digits.replace(/^\+44/, '0').replace(/^0044/, '0');
  return /^0\d{9,10}$/.test(d) ? d : null;
}

const FIELDS = {
  quote: ['name', 'email', 'phone', 'postcode'],
  battery: ['name', 'email', 'phone', 'postcode'],
  contact: ['name', 'email', 'message'],
  installer: ['company', 'name', 'email', 'phone', 'mcs_number', 'areas'],
};

export const KINDS = Object.keys(FIELDS);

export function validate(kind, body) {
  const errors = {};
  if (!FIELDS[kind]) return { errors: { _: 'Unknown form' } };
  if (clean(body.hp_url)) return { spam: true, errors: {} };

  const out = {};
  const text = (k, max = 200) => (out[k] = clean(body[k], max));

  for (const k of ['name', 'company', 'mcs_number', 'areas', 'inverter', 'consumer_code', 'topic', 'existing_solar', 'goal', 'battery_size', 'ev', 'capacity', 'website', 'system_kwp', 'usage_kwh'])
    if (body[k] !== undefined) text(k);
  for (const k of ['notes', 'message']) if (body[k] !== undefined) text(k, 2000);

  for (const k of FIELDS[kind]) {
    if (!clean(body[k])) errors[k] = 'Please fill this in.';
  }

  out.email = clean(body.email, 254).toLowerCase();
  if (out.email && !EMAIL.test(out.email)) errors.email = 'That email address doesn’t look right.';

  if (FIELDS[kind].includes('phone')) {
    const phone = normalisePhone(body.phone);
    if (clean(body.phone) && !phone) errors.phone = 'Please enter a UK phone number, e.g. 07700 900123.';
    out.phone = phone;
  }

  if (FIELDS[kind].includes('postcode')) {
    const pc = parsePostcode(body.postcode);
    if (clean(body.postcode) && !pc) errors.postcode = 'Please enter a full UK postcode, e.g. LS1 4AP.';
    out.postcode = pc ? pc.formatted : '';
    out.region = pc ? pc.region : 'uk';
  }

  if (kind === 'quote' || kind === 'battery' || kind === 'installer') {
    if (body.consent !== true && body.consent !== 'yes' && body.consent !== 'on') errors.consent = 'We need your agreement to continue.';
  }

  if (kind === 'battery' && !out.existing_solar) errors.existing_solar = 'Please choose one.';
  if (kind === 'quote' && body.installer) out.installer = clean(body.installer, 80);

  // Optional structured extras from the calculator (inputs and a result summary).
  if (kind === 'quote' || kind === 'battery') {
    out.calc = sanitiseCalc(body.calc);
    out.answers = sanitiseAnswers(body.answers);
  }
  return { errors, data: out, consentText: clean(body.consentText, 1200) };
}

// Keep only known, bounded numeric/enum fields from the calculator payload.
function sanitiseCalc(c) {
  if (!c || typeof c !== 'object') return null;
  const n = (v, lo, hi) => (Number.isFinite(+v) && +v >= lo && +v <= hi ? +v : null);
  const s = (v, max = 40) => (typeof v === 'string' ? v.slice(0, max) : null);
  const roofs = Array.isArray(c.roofs)
    ? c.roofs.slice(0, 2).map((r) => ({ azimuth: n(r?.azimuth, 0, 360), tilt: n(r?.tilt, 0, 90), space: s(r?.space), panels: n(r?.panels, 0, 100) }))
    : [];
  const oneOf = (v, allowed) => (allowed.includes(v) ? v : null);
  return {
    roofs,
    shading: s(c.shading),
    property: oneOf(c.property, ['detached', 'semi', 'terraced', 'bungalow', 'flat']),
    roofCovering: oneOf(c.roofCovering, ['tiles', 'slate', 'flat', 'metal', 'unsure']),
    homeAge: oneOf(c.homeAge, ['pre1930', '1930_1990', '1990_2010', 'post2010', 'unsure']),
    ownership: oneOf(c.ownership, ['own', 'rent', 'landlord']),
    bedrooms: n(c.bedrooms, 0, 20),
    occupants: n(c.occupants, 0, 20),
    occupancy: s(c.occupancy),
    ev: s(c.ev),
    heating: s(c.heating),
    usageKwh: n(c.usageKwh, 0, 100000),
    importRate: n(c.importRate, 0, 200),
    exportRate: n(c.exportRate, 0, 200),
    battery: n(c.battery, 0, 100),
    panels: n(c.panels, 0, 100),
    kWp: n(c.kWp, 0, 100),
    annualGen: n(c.annualGen, 0, 100000),
    saving: n(c.saving, -100000, 100000),
    savingLow: n(c.savingLow, -100000, 100000),
    savingHigh: n(c.savingHigh, -100000, 100000),
    payback: n(c.payback, 0, 100),
    net25: n(c.net25, -1000000, 1000000),
    cost: n(c.cost, 0, 1000000),
  };
}

const ANSWER_ENUMS = {
  interest: ['solar', 'solar_battery', 'battery'],
  roofType: ['pitched', 'mono', 'flat', 'other', 'unsure'],
  roofMaterial: ['concrete', 'clay', 'slate', 'felt', 'other', 'unsure'],
  homeBuilt: ['pre1900', '1900_1949', '1950_1982', '1983_1995', '1996_2006', '2007_2011', '2012_on'],
  bedrooms: ['1_2', '3_4', '5_6', '7_plus'],
  ownership: ['own', 'on_behalf', 'buying', 'renting'],
  timing: ['asap', '1_month', '3_months', '6_months', 'researching'],
};

function sanitiseAnswers(a) {
  if (!a || typeof a !== 'object') return null;
  const out = {};
  for (const [k, allowed] of Object.entries(ANSWER_ENUMS)) out[k] = allowed.includes(a[k]) ? a[k] : null;
  out.addressLine = typeof a.addressLine === 'string' ? clean(a.addressLine, 120) : '';
  return out;
}
