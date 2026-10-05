// Form handling for every public form: validation, submit, installer-matching preview.
// Works against the Node API, and falls back to local "demo" storage when the site is
// opened as a static export with no server.
import { parsePostcode } from './model.js';
import { siteConfig, saveLast } from './state.js';
import { esc } from './format.js';
import { initials } from './icons.js';

const ENDPOINT = { quote: 'quote', battery: 'battery', contact: 'contact', installer: 'installer-apply' };
const SERVICE = { quote: 'solar', battery: 'battery' };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalisePhone(raw) {
  const d = String(raw || '').replace(/[^\d+]/g, '').replace(/^\+44/, '0').replace(/^0044/, '0');
  return /^0\d{9,10}$/.test(d) ? d : null;
}

// Up to three installers covering the region. With a server, ask it (it shares leads
// fairly); without one, pick locally.
export async function previewMatches(region, kind) {
  const cfg = siteConfig();
  const service = SERVICE[kind] || 'solar';
  if (cfg.api) {
    try {
      const res = await fetch(`${cfg.api}/match?region=${encodeURIComponent(region)}&service=${service}`, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const { installers } = await res.json();
        const byslug = Object.fromEntries((cfg.installers || []).map((i) => [i.slug, i]));
        return installers.map((i) => ({ ...i, href: byslug[i.slug]?.href, demo: byslug[i.slug]?.demo }));
      }
    } catch {}
  }
  return (cfg.installers || [])
    .filter((i) => i.services.includes(service) && (region === 'uk' || i.regions.includes(region)))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 3);
}

const nameList = (list) => (list.length ? list.map((i) => i.name).join(', ').replace(/, ([^,]*)$/, list.length > 1 ? ' and $1' : ', $1') : '');

export function renderMatched(box, list, consentNames) {
  if (box) {
    box.hidden = false;
    box.innerHTML = list.length
      ? `<p class="eyebrow">Your details would go to</p><ul>${list.map((i) => `<li><span class="avatar" aria-hidden="true">${esc(initials(i.name))}</span><span><strong>${esc(i.name)}</strong>${i.demo ? ' <span class="sample-flag-inline">sample listing</span>' : ''}<br><span class="dim">${esc(i.tagline || '')}</span></span></li>`).join('')}</ul>`
      : '<p class="eyebrow">No installers cover that area yet</p><p>We’ll keep your request and get in touch if that changes. You can also <a href="' + esc(siteConfig().links.installers) + '">browse all installers</a>.</p>';
  }
  if (consentNames) consentNames.textContent = list.length ? nameList(list) : 'the installers matched to your postcode';
}

export function bindForm(form, { kind = form.dataset.form, getExtra = () => ({}), matchedBox = null } = {}) {
  const cfg = siteConfig();
  const status = form.querySelector('.form-status');
  const button = form.querySelector('button[type=submit]');
  const matchedEl = matchedBox || form.querySelector('[data-matched]');
  const consentNames = form.querySelector('[data-consent-names]');
  let matched = [];

  const errorEl = (name) => form.querySelector(`#f-${name}-err`);
  const setError = (name, msg) => {
    const e = errorEl(name);
    if (!e) return;
    e.textContent = msg || '';
    e.hidden = !msg;
    const input = form.elements[name];
    if (input?.setAttribute) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };
  const setStatus = (msg, tone = '') => {
    if (!status) return;
    status.textContent = msg;
    status.hidden = !msg;
    status.className = `form-status ${tone}`;
  };

  // Show who would receive the details as soon as we know where the person lives.
  const pcInput = form.elements.postcode;
  async function refreshMatches() {
    if (!pcInput || kind === 'contact' || kind === 'installer' || form.dataset.installer) return;
    const pc = parsePostcode(pcInput.value);
    if (!pc) return;
    matched = await previewMatches(pc.region, kind);
    renderMatched(matchedEl, matched, consentNames);
  }
  if (pcInput) {
    pcInput.addEventListener('input', () => parsePostcode(pcInput.value) && refreshMatches());
    pcInput.addEventListener('blur', refreshMatches);
    if (pcInput.value) refreshMatches();
  }

  function check(values) {
    const errors = {};
    for (const el of form.querySelectorAll('[required]')) {
      if (el.type === 'checkbox' ? !el.checked : !String(el.value).trim()) errors[el.name] = el.type === 'checkbox' ? 'We need your agreement to continue.' : 'Please fill this in.';
    }
    if (values.email && !EMAIL.test(values.email)) errors.email = 'That email address doesn’t look right.';
    if (values.phone && !normalisePhone(values.phone)) errors.phone = 'Please enter a UK phone number, e.g. 07700 900123.';
    if (values.postcode && !parsePostcode(values.postcode)) errors.postcode = 'Please enter a full UK postcode, e.g. LS1 4AP.';
    return errors;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const values = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
    for (const el of form.elements) if (el.name) setError(el.name, '');
    setStatus('');

    const errors = check(values);
    if (Object.keys(errors).length) {
      for (const [k, msg] of Object.entries(errors)) setError(k, msg);
      const first = form.elements[Object.keys(errors)[0]];
      first?.focus?.();
      setStatus('Please check the highlighted fields.', 'is-error');
      return;
    }

    const consentLabel = form.querySelector('.check span');
    const payload = {
      ...values,
      consent: form.elements.consent ? form.elements.consent.checked : undefined,
      consentText: consentLabel ? consentLabel.textContent.replace(/\s+/g, ' ').trim() : undefined,
      installer: form.dataset.installer || undefined,
      installers: matched.map((i) => i.slug),
      ...getExtra(),
    };

    button.disabled = true;
    setStatus('Sending…');
    const direct = form.dataset.installer ? (cfg.installers || []).find((i) => i.slug === form.dataset.installer) : null;

    async function finish(ref, list, demo = false) {
      saveLast({ ref, kind, matched: list, demo, at: Date.now() });
      location.href = cfg.links.thankYou;
    }

    try {
      if (!cfg.api) throw Object.assign(new Error('static'), { demo: true });
      const res = await fetch(`${cfg.api}/${ENDPOINT[kind]}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const out = await res.json().catch(() => ({}));
      if (res.status === 201 && out.ok) {
        const byslug = Object.fromEntries((cfg.installers || []).map((i) => [i.slug, i]));
        return finish(out.ref, out.matched.map((m) => ({ ...m, href: byslug[m.slug]?.href, demo: byslug[m.slug]?.demo })));
      }
      if (res.status === 422 && out.errors) {
        for (const [k, msg] of Object.entries(out.errors)) setError(k, msg);
        setStatus('Please check the highlighted fields.', 'is-error');
      } else if (res.status === 429) {
        setStatus('You’ve sent a few requests already. Please try again in a while.', 'is-error');
      } else {
        setStatus('Sorry, that didn’t send. Please try again, or email us.', 'is-error');
      }
    } catch (err) {
      if (err.demo) {
        // Static preview: keep the request in this browser only.
        try {
          const all = JSON.parse(localStorage.getItem('rw:demo') || '[]');
          all.push({ kind, payload: { ...payload, email: undefined, phone: undefined }, at: new Date().toISOString() });
          localStorage.setItem('rw:demo', JSON.stringify(all.slice(-20)));
        } catch {}
        return finish(`RW-DEMO${Math.random().toString(16).slice(2, 6).toUpperCase()}`, direct ? [direct] : matched, true);
      }
      setStatus('Couldn’t reach the server. Please try again, or email us.', 'is-error');
    }
    button.disabled = false;
  });

  return { refreshMatches };
}

// Auto-bind server-rendered forms.
for (const form of document.querySelectorAll('form[data-form]')) {
  const kind = form.dataset.form;
  if (ENDPOINT[kind]) bindForm(form, { kind });
}
