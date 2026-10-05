// The calculator: three short steps, then a results page you can tweak live.
import { analyse, parsePostcode, compassName, orientationFactor, COMPASS_POINTS, compassBearing, roofCapacity, judgeQuote, recommendPanels } from './model.js';
import * as D from './data.js';
import { gbp, gbpRound, num, kwh, pct, years, kwp, esc } from './format.js';
import { ledgerHtml } from './ledger.js';
import { monthlyChart, paybackChart } from './charts.js';
import { loadState, saveState, siteConfig } from './state.js';
import { mountStart } from './start-form.js';
import { bindForm, previewMatches, renderMatched } from './forms.js';

const A = D.ASSUMPTIONS;
const STEPS = ['where', 'roof', 'home', 'results'];
const LABELS = { where: 'Where', roof: 'Roof', home: 'Home', results: 'Results' };

const root = document.getElementById('calc-root');
const cfg = siteConfig();
const state = loadState();
let disposers = [];

const hasPostcode = () => !!parsePostcode(state.input.postcode);
const stepFromHash = () => {
  const h = location.hash.replace('#', '');
  return STEPS.includes(h) ? h : 'where';
};
const go = (step) => {
  if (location.hash === `#${step}`) render();
  else location.hash = step;
};

// ---------------------------------------------------------------------------
// Small markup helpers

const chips = (name, legend, options, value, cls = '') =>
  `<fieldset class="choice ${cls}"><legend>${esc(legend)}</legend><div class="chips">${options
    .map(([v, l]) => `<label class="chip"><input type="radio" name="${name}" value="${esc(v)}"${String(v) === String(value) ? ' checked' : ''}><span>${esc(l)}</span></label>`)
    .join('')}</div></fieldset>`;

const panelGrid = (n) => {
  const cols = n <= 6 ? 3 : n <= 10 ? 5 : n <= 14 ? 7 : 10;
  const rows = Math.ceil(n / cols);
  let rects = '';
  for (let i = 0; i < n; i++) rects += `<rect x="${(i % cols) * 11}" y="${Math.floor(i / cols) * 8}" width="9" height="6" rx="1"/>`;
  return `<svg class="grid-icon" viewBox="0 0 ${cols * 11} ${rows * 8}" width="${cols * 11}" height="${rows * 8}" aria-hidden="true" focusable="false">${rects}</svg>`;
};

const tiles = (name, legend, options, value, cls = '') =>
  `<fieldset class="choice ${cls}"><legend>${esc(legend)}</legend><div class="tiles">${options
    .map(([v, l, hint, extra = '']) => `<label class="tile"><input type="radio" name="${name}" value="${esc(v)}"${String(v) === String(value) ? ' checked' : ''}>${extra}<span class="tile-label">${esc(l)}</span><span class="tile-hint">${esc(hint)}</span></label>`)
    .join('')}</div></fieldset>`;

const spaceTiles = (name, value) =>
  tiles(name, 'How much room is there for panels?', Object.entries(D.ROOF_SPACE).map(([k, v]) => [k, v.label, v.hint, panelGrid(v.panels)]), value, 'tiles-4');

function gableSvg(tilt) {
  const t = Math.min(60, Math.max(0, tilt));
  const half = 78;
  const rise = Math.min(78, half * Math.tan((t * Math.PI) / 180));
  const base = 100;
  const apexY = base - Math.max(rise, 2);
  const L = 120 - half;
  const R = 120 + half;
  return `<svg class="gable" viewBox="0 0 240 130" role="img" aria-label="A house end-on with a roof pitched at ${t} degrees">
  <rect x="52" y="${base}" width="136" height="24" class="gable-wall"/>
  <path d="M${L} ${base} L120 ${apexY.toFixed(1)} L${R} ${base}" class="gable-roof" fill="none"/>
  <path d="M${(120 + 6).toFixed(1)} ${(apexY + (6 * Math.tan((t * Math.PI) / 180))).toFixed(1)} L${R - 8} ${(base - 3).toFixed(1)}" class="gable-panels"/>
  <text x="${R + 6}" y="${base - 4}" class="gable-label">${t}°</text>
</svg>`;
}

// ---------------------------------------------------------------------------
// Chrome: progress + live estimate

function progress(step) {
  const idx = STEPS.indexOf(step);
  return `<nav class="progress" aria-label="Progress"><ol>${STEPS.map((s, i) => {
    const done = i < idx;
    const label = `<span class="progress-n">${i + 1}</span><span class="progress-l">${LABELS[s]}</span>`;
    return `<li class="${done ? 'is-done' : ''}${i === idx ? ' is-current' : ''}"${i === idx ? ' aria-current="step"' : ''}>${done ? `<a href="#${s}">${label}</a>` : `<span>${label}</span>`}</li>`;
  }).join('')}</ol></nav>`;
}

const liveCard = () => `<div class="live" data-live aria-live="polite"></div>`;

function paintLive() {
  const live = root.querySelector('[data-live]');
  if (!live) return;
  const r = analyse(state.input);
  live.innerHTML = `<p class="live-label">Early estimate</p><p class="live-figure"><strong>${gbpRound(r.money.saving)}</strong><span> a year</span></p><p class="live-sub">${r.system.panels} panels · ${kwp(r.system.kWp)}${r.payback ? ` · pays back in about ${years(r.payback)}` : ' · may not pay back'}</p>`;
}

function header(step, title, lede) {
  const n = STEPS.indexOf(step) + 1;
  return `${progress(step)}<header class="step-head"><p class="eyebrow">Step ${n} of 3${state.place ? ` · ${esc(state.place)}` : ''}</p><h1 id="step-title" tabindex="-1">${title}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}</header>`;
}

const stepNav = (back, next, nextLabel = 'Next') => `<div class="step-nav">${back ? `<button type="button" class="btn btn-ghost" data-go="${back}"><span class="arrow" aria-hidden="true">←</span><span>Back</span></button>` : '<span></span>'}<button type="button" class="btn btn-lg" data-go="${next}"><span>${nextLabel}</span><span class="arrow" aria-hidden="true">→</span></button></div>`;

// ---------------------------------------------------------------------------
// Steps

function viewWhere() {
  root.innerHTML = `<div class="wrap">${header('where', 'Where is the roof, and which way does it face?', 'Your postcode tells us how much sun you get. The direction tells us how well the roof catches it.')}
  <div class="where-card" data-mount></div></div>`;
  mountStart(root.querySelector('[data-mount]'), {
    state,
    heading: false,
    onDone() {
      saveState(state);
      go('roof');
    },
  });
}

function viewRoof() {
  const i = state.input;
  const r0 = i.roofs[0];
  const second = i.roofs[1];
  root.innerHTML = `<div class="wrap">${header('roof', 'Tell us about the roof', 'A rough answer is fine. You can fine-tune everything on the results page.')}
  <div class="step-grid">
    <div class="step-form">
      <div class="roof-face">
        <p class="face-summary"><strong>Main roof faces ${esc(compassName(r0.azimuth))}.</strong> <button type="button" class="link" data-go="where">Change</button></p>
      </div>
      <div class="choice pitch">
        <label for="pitch" class="legend">How steep is the roof?</label>
        <div class="pitch-row">
          <div data-gable>${gableSvg(r0.tilt)}</div>
          <div class="pitch-controls">
            <div class="range-line"><input id="pitch" type="range" name="roofs.0.tilt" min="0" max="60" step="5" value="${r0.tilt}" aria-describedby="pitch-hint"><output for="pitch" data-out="pitch">${r0.tilt}°</output></div>
            <div class="mini-chips" role="group" aria-label="Common pitches">
              <button type="button" class="mini-chip" data-tilt="10">Flat</button><button type="button" class="mini-chip" data-tilt="35">Typical</button><button type="button" class="mini-chip" data-tilt="45">Steep</button>
            </div>
            <p class="hint" id="pitch-hint">Most UK pitched roofs are 30° to 40°. Not sure? Leave it at 35°.</p>
          </div>
        </div>
      </div>
      ${spaceTiles('roofs.0.space', r0.space)}
      ${tiles('shading', 'Does anything shade the roof?', Object.entries(D.SHADING).map(([k, v]) => [k, v.label, v.hint]), i.shading, 'tiles-4')}
      <div class="choice second">
        <label class="check"><input type="checkbox" name="second" ${second ? 'checked' : ''}><span>I could also put panels on a second roof face</span></label>
        <div class="second-fields" ${second ? '' : 'hidden'} data-second>
          ${second ? `<div class="field-row">
            <div class="field"><label for="az2">Which way does it face?</label><select id="az2" name="roofs.1.azimuth">${COMPASS_POINTS.map((n) => `<option value="${compassBearing(n)}"${Math.round(second.azimuth / 45) * 45 % 360 === compassBearing(n) ? ' selected' : ''}>${n}</option>`).join('')}</select></div>
            <div class="field"><label for="sp2">How much room?</label><select id="sp2" name="roofs.1.space">${Object.entries(D.ROOF_SPACE).map(([k, v]) => `<option value="${k}"${second.space === k ? ' selected' : ''}>${v.label}, ${v.hint.toLowerCase()}</option>`).join('')}</select></div>
          </div><p class="hint">East and west roofs make less in total but spread output across the day, which suits many households.</p>` : ''}
        </div>
      </div>
    </div>
    <aside class="step-side">${liveCard()}</aside>
  </div>
  ${stepNav('where', 'home', 'Next: your home')}</div>`;
  paintLive();
}

function viewHome() {
  const i = state.input;
  const bedOpts = [[1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5+']];
  const usageLabel = i.usageMode === 'bill' ? 'Monthly electricity bill (£)' : 'Yearly electricity use (kWh)';
  const usageVal = i.usageMode === 'bill' ? i.billPerMonth : i.usageKwh;
  root.innerHTML = `<div class="wrap">${header('home', 'Tell us about the home', 'This is what decides how much of your solar you’ll use yourself, and that is where most of the saving comes from.')}
  <div class="step-grid">
    <div class="step-form">
      ${chips('bedrooms', 'Bedrooms', bedOpts, i.bedrooms, 'chips-row')}
      ${chips('occupants', 'People living there', bedOpts, i.occupants, 'chips-row')}
      ${tiles('occupancy', 'Who’s home during the day?', Object.entries(D.OCCUPANCY).map(([k, v]) => [k, v.label, v.hint]), i.occupancy, 'tiles-3')}
      <div class="choice usage">
        ${chips('usageMode', 'How much electricity do you use?', [['estimate', 'Estimate it for me'], ['kwh', 'I know my yearly kWh'], ['bill', 'I know my monthly bill']], i.usageMode)}
        <div class="usage-input" data-usage ${i.usageMode === 'estimate' ? 'hidden' : ''}>
          <label for="usage" data-usage-label>${usageLabel}</label>
          <input id="usage" name="usageValue" type="number" inputmode="decimal" min="0" step="any" value="${usageVal ?? ''}" placeholder="${i.usageMode === 'bill' ? 'e.g. 95' : 'e.g. 3200'}">
          <p class="hint">${i.usageMode === 'bill' ? 'Electricity only, not gas. We’ll turn it into kWh using your unit rate.' : 'It’s on your bill or in your supplier’s app. Typical homes use 2,700 to 4,100 kWh.'}</p>
        </div>
      </div>
      ${chips('ev', 'Electric car?', [['none', 'No'], ['have', 'Yes, I have one'], ['plan', 'Planning one']], i.ev)}
      ${chips('heating', 'How is the home heated?', [['gas', 'Gas or other'], ['hp', 'Heat pump'], ['hp_plan', 'Planning a heat pump'], ['elec', 'Electric heating']], i.heating)}
    </div>
    <aside class="step-side">${liveCard()}</aside>
  </div>
  ${stepNav('roof', 'results', 'Show my savings')}</div>`;
  paintLive();
}

// ---------------------------------------------------------------------------
// Results

function verdict(r) {
  const p = r.payback;
  if (p != null && p <= 8) return 'A strong case. On these numbers solar pays for itself quickly.';
  if (p != null && p <= 12) return 'A reasonable case. It pays for itself well within the life of the panels.';
  if (p != null && p <= 18) return 'A marginal case. It does pay back, but slowly. Check the prices and the roof before deciding.';
  return 'On these numbers solar doesn’t pay for itself for this roof. Try the roof direction, shading or prices to see what would change that.';
}

function compareTable(r) {
  const best = r.scenarios.reduce((a, b) => (b.net > a.net ? b : a));
  const fastest = r.scenarios.filter((s) => s.payback != null).reduce((a, b) => (b.payback < a.payback ? b : a), { payback: Infinity });
  const row = (s) => {
    const tags = [s === best ? 'Best 25-year gain' : '', s === fastest ? 'Fastest payback' : ''].filter(Boolean);
    return `<tr${s.battery === r.input.battery ? ' class="is-selected"' : ''}><th scope="row">${s.battery ? `Solar + ${s.battery} kWh battery` : 'Solar only'}${tags.length ? `<span class="row-tags">${tags.map((t) => `<span class="row-tag">${t}</span>`).join('')}</span>` : ''}</th><td>${gbp(s.cost.total)}</td><td>${gbpRound(s.money.saving)}</td><td>${years(s.payback)}</td><td>${gbpRound(s.net, 50)}</td></tr>`;
  };
  return `<div class="table-wrap"><table class="data-table compare"><caption class="visually-hidden">Your options compared at typical prices</caption><thead><tr><th scope="col">Option</th><th scope="col">Typical cost</th><th scope="col">Saves in year one</th><th scope="col">Pays back</th><th scope="col">25-year gain</th></tr></thead><tbody>${r.scenarios.map(row).join('')}</tbody></table></div>`;
}

function batteryInsight(r) {
  const [none, five] = r.scenarios;
  const extra = five.money.saving - none.money.saving;
  const extraCost = five.cost.total - none.cost.total;
  const gain = five.net - none.net;
  const lead = gain > 500 ? 'For your home a 5 kWh battery looks worthwhile' : gain > -500 ? 'For your home a 5 kWh battery is roughly break-even over 25 years' : 'For your home a 5 kWh battery costs more than it earns back over its life';
  return `<p class="insight">${lead}: it adds about ${gbpRound(extra)} a year to your saving for about ${gbpRound(extraCost, 50)} more up front. ${r.input.exportRate >= 12 ? 'A high export rate makes batteries less attractive, because you lose more by not exporting.' : 'Raise your export rate on the right to see how that changes it.'} We don’t count cheap overnight tariffs, which can make a battery worth more.</p>`;
}

function mainHtml(r) {
  const i = r.input;
  const faces = r.system.faces.filter((f) => f.panels > 0);
  const direction = faces.map((f) => compassName(f.azimuth)).join(' and ');
  const summer = r.monthly[5].gen;
  const winter = r.monthly[11].gen;
  const q = judgeQuote(r);
  return `
<section class="res-head">
  <p class="eyebrow">Your solar statement · ${esc(i.postcode)} · ${esc(direction)}-facing</p>
  <h1 class="res-headline" id="res-title" tabindex="-1"><span class="mark">${gbpRound(r.money.saving)}</span><span class="per"> a year</span></h1>
  <p class="res-sub">Likely range ${gbpRound(r.money.low)} to ${gbpRound(r.money.high)} in year one. ${r.payback ? `Pays for itself in about <strong>${years(r.payback)}</strong>${q ? ` at your quote of ${gbp(q.quote)}` : ''}.` : 'It doesn’t pay for itself within 25 years on these assumptions.'}</p>
  <p class="res-verdict">${verdict(r)}</p>
  <a class="link-arrow adjust-jump" href="#tune">Adjust panels, battery and prices</a>
</section>
<dl class="strip">
  <div><dt>System</dt><dd>${kwp(r.system.kWp)}<small>${r.system.panels} panels, about ${Math.round(r.system.areaM2)} m²</small></dd></div>
  <div><dt>Makes</dt><dd>${num(r.system.annualGen)}<small>kWh a year, ${num(r.system.yieldPerKwp)} per kWp</small></dd></div>
  <div><dt>Costs</dt><dd>${gbp(r.cost.used)}<small>${q ? 'your quote' : 'typical price, 0% VAT'}</small></dd></div>
  <div><dt>25-year gain</dt><dd>${gbpRound(r.net25, 50)}<small>after the cost and an inverter swap</small></dd></div>
  <div><dt>Carbon</dt><dd>${r.co2Tonnes.toFixed(1)} t<small>CO₂ saved a year</small></dd></div>
</dl>
<section class="res-section" aria-labelledby="h-statement">
  <h2 id="h-statement">Your statement</h2>
  <p>Where the saving comes from, in kilowatt-hours and pounds. This is year one, with panels at full strength.</p>
  ${ledgerHtml(r)}
</section>
<section class="res-section" aria-labelledby="h-year">
  <h2 id="h-year">Through the year</h2>
  <p>Your roof makes about ${(summer / Math.max(winter, 1)).toFixed(0)} times more in June than in December, which is why you’ll still buy most of your winter electricity.</p>
  <div data-chart="monthly"></div>
</section>
<section class="res-section" aria-labelledby="h-payback">
  <h2 id="h-payback">Is a battery worth adding?</h2>
  <div data-chart="payback"></div>
  <p class="chart-note">Lines show your running total after paying for each option at typical prices; the dot marks when each one breaks even.</p>
  ${compareTable(r)}
  ${batteryInsight(r)}
</section>
<section class="res-section res-notes" aria-labelledby="h-assume">
  <h2 id="h-assume">What this assumes</h2>
  <ul class="plain-list">
    <li>${esc(i.postcode)} gets about ${num(r.region.yield)} kWh per kWp a year on a south-facing roof. Yours, at ${esc(direction)} and ${i.roofs[0].tilt}°, gets ${num(r.system.yieldPerKwp)}.</li>
    <li>Electricity at ${i.importRate}p per kWh, rising ${(A.priceInflation * 100).toFixed(1)}% a year. Exports at ${i.exportRate}p per kWh.</li>
    <li>Your home uses ${num(r.demand.total)} kWh a year; ${pct(r.flows.selfUseShare)} of what your roof makes is used at home.</li>
    <li>Panels lose ${(A.degradation * 100).toFixed(1)}% a year. An inverter replacement (${gbp(A.inverterCost)}) is counted in year ${A.inverterYear}.${i.battery ? ` The battery’s benefit is counted for ${A.batteryLife} years.` : ''}</li>
  </ul>
  <p><a class="link-arrow" href="${esc(cfg.links.methodology)}">Read the full method</a></p>
</section>`;
}

const asideHtml = (r) => `<aside class="tune" id="tune" aria-label="Adjust your system">
  <h2 class="tune-title">Adjust it</h2>
  <p class="hint">Change anything. The results update as you go.</p>
  <div class="tune-block">
    <p class="tune-label" id="panels-label">Solar panels</p>
    <div class="stepper" role="group" aria-labelledby="panels-label">
      <button type="button" class="step-btn" data-panels="-1" aria-label="One fewer panel">−</button>
      <output data-out="panels" aria-live="polite">${r.system.panels}</output>
      <button type="button" class="step-btn" data-panels="1" aria-label="One more panel">+</button>
    </div>
    <p class="hint" data-panels-hint></p>
  </div>
  ${chips('battery', 'Battery', [[0, 'None'], [5, '5 kWh'], [10, '10 kWh']], r.input.battery, 'tune-chips')}
  <div class="tune-block">
    <label for="rate" class="tune-label">Electricity price: <output data-out="rate">${r.input.importRate}p</output> per kWh</label>
    <input id="rate" type="range" name="importRate" min="15" max="45" step="0.5" value="${r.input.importRate}">
  </div>
  <div class="tune-block">
    <label for="seg" class="tune-label">Export payment: <output data-out="seg">${r.input.exportRate}p</output> per kWh</label>
    <input id="seg" type="range" name="exportRate" min="0" max="20" step="0.5" value="${r.input.exportRate}">
    <p class="hint">Smart Export Guarantee tariffs vary a lot by supplier.</p>
  </div>
  <div class="tune-block quote-check">
    <label for="quote" class="tune-label">Already have a quote?</label>
    <div class="money-input"><span aria-hidden="true">£</span><input id="quote" name="quoteCost" type="number" inputmode="numeric" min="0" step="50" placeholder="e.g. 7900" value="${r.input.quoteCost ?? ''}"></div>
    <p class="hint" data-quote-verdict aria-live="polite"></p>
  </div>
  <div class="tune-links"><button type="button" class="link" data-go="roof">Edit roof</button><button type="button" class="link" data-go="home">Edit home</button></div>
</aside>`;

let latest = null;

function syncAside(r) {
  const set = (sel, text) => {
    const n = root.querySelector(sel);
    if (n) n.textContent = text;
  };
  set('[data-out=panels]', String(r.system.panels));
  set('[data-out=rate]', `${r.input.importRate}p`);
  set('[data-out=seg]', `${r.input.exportRate}p`);
  const rec = r.system.recommended;
  set('[data-panels-hint]', `${r.system.panels === rec ? 'Recommended for your home. ' : `Recommended: ${rec}. `}Your roof fits up to ${r.system.maxPanels}.`);
  const q = judgeQuote(r);
  const v = root.querySelector('[data-quote-verdict]');
  if (v) {
    v.textContent = q
      ? `${gbp(q.quote)} is ${q.verdict} the ${gbp(q.typical)} we’d expect for this system (${kwp(r.system.kWp)}${r.input.battery ? ` plus a ${r.input.battery} kWh battery` : ''}). At that price it pays back in ${r.payback ? years(r.payback) : 'more than 25 years'}.`
      : 'Enter it to see how it compares with typical prices for this system.';
  }
}

function paintMain() {
  const r = analyse(state.input);
  latest = r;
  for (const d of disposers) d();
  disposers = [];
  const main = root.querySelector('[data-res-main]');
  main.innerHTML = mainHtml(r);
  disposers.push(monthlyChart(main.querySelector('[data-chart=monthly]'), r.monthly));
  disposers.push(paybackChart(main.querySelector('[data-chart=payback]'), r.scenarios, r.input.battery));
  syncAside(r);
  saveState(state);
}

let raf = 0;
const schedule = () => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(paintMain);
};

function calcSummary() {
  const r = latest || analyse(state.input);
  const i = r.input;
  return {
    roofs: i.roofs.map((x, n) => ({ azimuth: x.azimuth, tilt: x.tilt, space: x.space, panels: r.system.faces[n]?.panels ?? 0 })),
    shading: i.shading,
    bedrooms: i.bedrooms,
    occupants: i.occupants,
    occupancy: i.occupancy,
    ev: i.ev,
    heating: i.heating,
    usageKwh: Math.round(r.demand.total),
    importRate: i.importRate,
    exportRate: i.exportRate,
    battery: i.battery,
    panels: r.system.panels,
    kWp: Math.round(r.system.kWp * 100) / 100,
    annualGen: Math.round(r.system.annualGen),
    saving: Math.round(r.money.saving),
    savingLow: Math.round(r.money.low),
    savingHigh: Math.round(r.money.high),
    payback: r.payback == null ? null : Math.round(r.payback * 10) / 10,
    net25: Math.round(r.net25),
    cost: Math.round(r.cost.used),
  };
}

function quoteSection() {
  const i = state.input;
  const consent = `I agree that ${esc(cfg.brand)} may share the details on this form, and my estimate, with <strong data-consent-names>the installers matched to your postcode</strong> so they can contact me by phone, email or post about a solar quote. I’ve read the <a href="${esc(cfg.links.privacy)}">privacy notice</a>. I can withdraw this at any time.`;
  return `<section class="res-quote" id="quotes" aria-labelledby="h-quotes"><div class="wrap">
  <div class="quote-grid">
    <div class="quote-copy">
      <p class="eyebrow">Next step, only if you want it</p>
      <h2 id="h-quotes">Get up to three quotes for this system.</h2>
      <p>Installers covering ${esc(state.place || i.postcode)} will see your roof, your usage and this estimate, so they can quote for the real job instead of starting from scratch. You’ll see exactly who gets your details before you send anything.</p>
      <div data-matched class="matched" hidden></div>
      <ul class="plain-list fine-list"><li>Free. We’re paid by installers, never by you.</li><li>No more than three installers, ever.</li><li>You can say no to any of them.</li></ul>
    </div>
    <form class="form" data-form="quote" novalidate>
      <div class="field" data-field="name"><label for="f-name">Full name</label><input id="f-name" name="name" required autocomplete="name" maxlength="200"><p class="error" id="f-name-err" role="alert" hidden></p></div>
      <div class="field-row">
        <div class="field" data-field="email"><label for="f-email">Email</label><input id="f-email" name="email" type="email" required autocomplete="email" maxlength="200"><p class="error" id="f-email-err" role="alert" hidden></p></div>
        <div class="field" data-field="phone"><label for="f-phone">Phone</label><input id="f-phone" name="phone" type="tel" inputmode="tel" required autocomplete="tel" maxlength="40"><p class="hint">So installers can call you. We never ring you ourselves.</p><p class="error" id="f-phone-err" role="alert" hidden></p></div>
      </div>
      <div class="field" data-field="postcode"><label for="f-postcode">Postcode</label><input id="f-postcode" name="postcode" required autocomplete="postal-code" maxlength="9" value="${esc(i.postcode)}"><p class="error" id="f-postcode-err" role="alert" hidden></p></div>
      <div class="field" data-field="notes"><label for="f-notes">Anything installers should know? <span class="optional">optional</span></label><textarea id="f-notes" name="notes" rows="3" maxlength="2000"></textarea></div>
      <div class="hp" aria-hidden="true"><label>Leave this empty<input type="text" name="hp_url" tabindex="-1" autocomplete="off"></label></div>
      <div class="field field-check" data-field="consent"><label class="check"><input type="checkbox" id="f-consent" name="consent" value="yes" required><span>${consent}</span></label><p class="error" id="f-consent-err" role="alert" hidden></p></div>
      <p class="form-status" role="status" aria-live="polite" hidden></p>
      <button class="btn btn-lg" type="submit"><span>Send my details</span><span class="arrow" aria-hidden="true">→</span></button>
    </form>
  </div></div></section>`;
}

function viewResults() {
  const r = analyse(state.input);
  root.innerHTML = `<div class="wrap">${progress('results')}
  <div class="res-grid">
    <div class="res-main" data-res-main></div>
    ${asideHtml(r)}
  </div></div>
  ${quoteSection()}`;
  paintMain();
  const form = root.querySelector('form[data-form=quote]');
  bindForm(form, { kind: 'quote', matchedBox: root.querySelector('[data-matched]'), getExtra: () => ({ calc: calcSummary() }) });
}

// ---------------------------------------------------------------------------
// Events

function setPath(path, value) {
  const [key, idx, prop] = path.split('.');
  if (key === 'roofs') state.input.roofs[Number(idx)][prop] = value;
  else state.input[key] = value;
}

root.addEventListener('click', (e) => {
  const go_ = e.target.closest('[data-go]');
  if (go_) {
    saveState(state);
    return go(go_.dataset.go);
  }
  const tilt = e.target.closest('[data-tilt]');
  if (tilt) {
    state.input.roofs[0].tilt = Number(tilt.dataset.tilt);
    const range = root.querySelector('#pitch');
    range.value = String(state.input.roofs[0].tilt);
    range.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }
  const pbtn = e.target.closest('[data-panels]');
  if (pbtn && latest) {
    const next = Math.min(latest.system.maxPanels, Math.max(1, latest.system.panels + Number(pbtn.dataset.panels)));
    state.input.panels = next === latest.system.recommended ? null : next;
    schedule();
  }
});

root.addEventListener('input', (e) => {
  const t = e.target;
  if (!t.name) return;
  if (t.name === 'roofs.0.tilt') {
    state.input.roofs[0].tilt = Number(t.value);
    root.querySelector('[data-gable]').innerHTML = gableSvg(state.input.roofs[0].tilt);
    root.querySelector('[data-out=pitch]').textContent = `${t.value}°`;
    paintLive();
  } else if (t.name === 'importRate' || t.name === 'exportRate') {
    state.input[t.name] = Number(t.value);
    schedule();
  } else if (t.name === 'quoteCost') {
    state.input.quoteCost = t.value === '' ? null : Math.max(0, Number(t.value));
    schedule();
  } else if (t.name === 'usageValue') {
    const v = t.value === '' ? null : Math.max(0, Number(t.value));
    if (state.input.usageMode === 'bill') state.input.billPerMonth = v;
    else state.input.usageKwh = v;
    paintLive();
  }
  saveState(state);
});

root.addEventListener('change', (e) => {
  const t = e.target;
  if (!t.name) return;
  const numeric = new Set(['bedrooms', 'occupants', 'battery']);
  if (t.name === 'second') {
    if (t.checked) {
      const az = state.input.roofs[0].azimuth;
      const mirror = (360 - az) % 360;
      state.input.roofs[1] = { azimuth: Math.abs(mirror - az) < 20 ? (az + 90) % 360 : mirror, tilt: state.input.roofs[0].tilt, space: 'medium' };
    } else state.input.roofs.length = 1;
    viewRoof();
  } else if (t.name.startsWith('roofs.')) {
    const parts = t.name.split('.');
    setPath(t.name, parts[2] === 'space' ? t.value : Number(t.value));
    if (parts[1] === '1' && state.input.roofs[1]) state.input.roofs[1].tilt = state.input.roofs[0].tilt;
  } else if (t.name === 'usageMode') {
    state.input.usageMode = t.value;
    viewHome();
    return saveState(state);
  } else if (t.name === 'usageValue') {
    return;
  } else if (t.type === 'radio') {
    setPath(t.name, numeric.has(t.name) ? Number(t.value) : t.value);
    if (t.name === 'battery') schedule();
  }
  // Changing the roof or home invalidates a manual panel count that no longer fits.
  if (t.name.startsWith('roofs.') || t.name === 'shading') {
    const max = roofCapacity(state.input.roofs).reduce((a, b) => a + b, 0);
    if (state.input.panels && state.input.panels > max) state.input.panels = null;
  }
  paintLive();
  saveState(state);
});

// ---------------------------------------------------------------------------
// Router

function render() {
  for (const d of disposers) d();
  disposers = [];
  let step = stepFromHash();
  if (step !== 'where' && !hasPostcode()) {
    step = 'where';
    history.replaceState(null, '', '#where');
  }
  state.step = step;
  ({ where: viewWhere, roof: viewRoof, home: viewHome, results: viewResults })[step]();
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  const focusTarget = root.querySelector('#step-title, #res-title');
  focusTarget?.focus({ preventScroll: true });
  document.title = `${LABELS[step]} · Solar savings calculator`;
}

window.addEventListener('hashchange', render);
render();
