// Calculator state kept in sessionStorage so a refresh doesn't lose answers.
// Nothing here is sent to the server unless the visitor submits a quote request.
// If the browser blocks storage (some in-app browsers and embedded previews do), we fall
// back to window.name, which survives navigation within the same tab and is never sent anywhere.
import { defaultInput } from './model.js';

const KEY = 'rw:calc';
const LAST = 'rw:last';

export function siteConfig() {
  try {
    return JSON.parse(document.getElementById('site-config').textContent);
  } catch {
    return { mode: 'server', api: '/api', links: {}, installers: [], regionNames: {}, brand: 'Roofworth' };
  }
}

function readName() {
  try {
    return window.name.startsWith('rw:') ? JSON.parse(window.name.slice(3)) : {};
  } catch {
    return {};
  }
}
function writeName(key, value) {
  try {
    const all = readName();
    all[key] = value;
    window.name = 'rw:' + JSON.stringify(all);
  } catch {}
}

function put(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    writeName(key, value);
  }
}
function get(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return readName()[key] ?? null;
}

export function loadState() {
  const base = { input: defaultInput(), place: '', step: 'where', lookupOk: true };
  const saved = get(KEY);
  if (saved && saved.input) {
    const input = { ...base.input, ...saved.input };
    input.roofs = (saved.input.roofs?.length ? saved.input.roofs : base.input.roofs).slice(0, 2).map((r) => ({ azimuth: 180, tilt: 35, space: 'medium', ...r }));
    return { ...base, ...saved, input };
  }
  return base;
}

export const saveState = (state) => put(KEY, state);
export const saveLast = (obj) => put(LAST, obj);
export const loadLast = () => get(LAST);
