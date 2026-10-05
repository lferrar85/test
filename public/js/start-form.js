// Step 1 of the calculator: postcode and which way the roof faces.
// Used in the home page hero and as the first step on /solar-calculator.
import { parsePostcode, compassName, orientationFactor, COMPASS_POINTS, compassBearing } from './model.js';
import { createDial } from './dial.js';
import { esc } from './format.js';
import { siteConfig } from './state.js';

let lookupSeq = 0;

// Friendly place name from postcodes.io (public, free, no key). Purely cosmetic and a
// typo check: if the request fails for any reason, the form still works offline.
async function lookupPlace(pc) {
  if (!siteConfig().postcodeLookup) return {};
  const seq = ++lookupSeq;
  try {
    const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(pc.formatted)}`, { signal: AbortSignal.timeout(3500) });
    if (seq !== lookupSeq) return { stale: true };
    if (res.status === 404) return { notFound: true };
    if (!res.ok) return {};
    const { result } = await res.json();
    const parts = [result.admin_district, result.region || result.country].filter(Boolean);
    return { name: parts.join(', ') };
  } catch {
    return {};
  }
}

export function mountStart(host, { state, onDone, cta = 'Next: your roof', heading = true }) {
  const cfg = siteConfig();
  const input = state.input;
  const id = `sf${Math.random().toString(36).slice(2, 6)}`;

  host.innerHTML = `<form class="start-form" novalidate>
  ${heading ? '<h2 class="start-title">Which way does your roof face?</h2>' : ''}
  <div class="field">
    <label for="${id}-pc">Your postcode</label>
    <input id="${id}-pc" name="postcode" type="text" inputmode="text" autocomplete="postal-code" maxlength="9" placeholder="e.g. LS1 4AP" value="${esc(input.postcode)}" aria-describedby="${id}-place ${id}-err">
    <p class="hint place" id="${id}-place" aria-live="polite"></p>
    <p class="error" id="${id}-err" role="alert" hidden></p>
  </div>
  <fieldset class="dial-field">
    <legend>Roof direction</legend>
    <p class="hint">Drag the sun round the dial, or tap a direction below. Not sure? Look at your roof on a satellite map: it faces the way it slopes down towards.</p>
    <div class="dial-host" data-dial></div>
    <p class="dial-readout" aria-live="polite"></p>
    <div class="compass-buttons" role="group" aria-label="Choose a direction">
      ${COMPASS_POINTS.map((n) => `<button type="button" class="compass-btn" data-bearing="${compassBearing(n)}" aria-pressed="false" aria-label="${n}"><span aria-hidden="true">${n.split('-').map((w) => w[0].toUpperCase()).join('')}</span></button>`).join('')}
    </div>
  </fieldset>
  <button class="btn btn-lg btn-block" type="submit"><span>${esc(cta)}</span><span class="arrow" aria-hidden="true">→</span></button>
</form>`;

  const form = host.querySelector('form');
  const pcInput = form.querySelector('input[name=postcode]');
  const placeEl = form.querySelector('.place');
  const errEl = form.querySelector('.error');
  const readout = form.querySelector('.dial-readout');
  const buttons = [...form.querySelectorAll('.compass-btn')];

  const regionName = (key) => cfg.regionNames?.[key] || '';
  const showError = (msg) => {
    errEl.textContent = msg || '';
    errEl.hidden = !msg;
    pcInput.setAttribute('aria-invalid', msg ? 'true' : 'false');
  };

  function syncReadout(az) {
    const name = compassName(az);
    const pct = Math.round(orientationFactor(az, input.roofs[0].tilt) * 100);
    readout.innerHTML = `<strong>${esc(name)}</strong><span class="dim"> · ${Math.round(az)}° · ${pct}% of the best-possible sun</span>`;
    const nearest = Math.round(az / 45) * 45 % 360;
    for (const b of buttons) b.setAttribute('aria-pressed', String(Number(b.dataset.bearing) === nearest && Math.abs(az - nearest) < 3));
  }

  const dial = createDial(form.querySelector('[data-dial]'), {
    azimuth: input.roofs[0].azimuth,
    tilt: input.roofs[0].tilt,
    onChange(az) {
      input.roofs[0].azimuth = az;
      syncReadout(az);
    },
  });
  syncReadout(input.roofs[0].azimuth);

  for (const b of buttons) {
    b.addEventListener('click', () => {
      dial.set(Number(b.dataset.bearing));
      form.querySelector('.dial').classList.add('touched');
    });
  }

  async function checkPostcode({ strict = false } = {}) {
    const raw = pcInput.value.trim();
    if (!raw) {
      placeEl.textContent = '';
      showError(strict ? 'Please enter your postcode.' : '');
      return false;
    }
    const pc = parsePostcode(raw);
    if (!pc) {
      placeEl.textContent = '';
      if (strict || raw.replace(/\s/g, '').length >= 6) showError('That doesn’t look like a full UK postcode. Try something like LS1 4AP.');
      return false;
    }
    showError('');
    input.postcode = pc.formatted;
    input.region = pc.region;
    state.place = regionName(pc.region);
    placeEl.textContent = state.place ? `Looks like ${state.place}.` : '';
    const look = await lookupPlace(pc);
    if (look.stale) return true;
    if (look.notFound) {
      state.lookupOk = false;
      showError('We can’t find that postcode. Please check it.');
      placeEl.textContent = '';
      return false;
    }
    state.lookupOk = true;
    if (look.name) {
      state.place = look.name;
      placeEl.textContent = `Found: ${look.name}.`;
    }
    return true;
  }

  pcInput.addEventListener('input', () => {
    if (parsePostcode(pcInput.value)) checkPostcode();
    else {
      placeEl.textContent = '';
      showError('');
    }
  });
  pcInput.addEventListener('blur', () => pcInput.value.trim() && checkPostcode());

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ok = await checkPostcode({ strict: true });
    if (!ok) {
      pcInput.focus();
      return;
    }
    onDone();
  });

  if (input.postcode) checkPostcode();
  return { dial };
}
