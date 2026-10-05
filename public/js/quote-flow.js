// One-question-per-screen quote request. Big answer buttons, Previous/Next, then contact details.
import { parsePostcode } from './model.js';
import { loadState, siteConfig } from './state.js';
import { bindForm, previewMatches, renderMatched } from './forms.js';
import { esc } from './format.js';

const root = document.getElementById('qf-root');
const cfg = siteConfig();
const saved = loadState();

const Q = [
  { key: 'interest', title: 'What are you interested in?', opts: [['solar', 'Solar panels'], ['solar_battery', 'Solar panels and a battery'], ['battery', 'A battery for my existing solar']] },
  { key: 'roofType', title: 'What is your property’s roof type?', opts: [['pitched', 'Pitched'], ['mono', 'Mono pitched'], ['flat', 'Flat'], ['other', 'Other'], ['unsure', 'Unsure']] },
  { key: 'roofMaterial', title: 'What is your property’s roof material?', opts: [['concrete', 'Concrete tiles'], ['clay', 'Clay tiles'], ['slate', 'Slate tiles'], ['felt', 'Felt'], ['other', 'Other'], ['unsure', 'Unsure']] },
  { key: 'homeBuilt', title: 'When was your home built?', opts: [['pre1900', 'Before 1900'], ['1900_1949', '1900 to 1949'], ['1950_1982', '1950 to 1982'], ['1983_1995', '1983 to 1995'], ['1996_2006', '1996 to 2006'], ['2007_2011', '2007 to 2011'], ['2012_on', '2012 onwards']] },
  { key: 'bedrooms', title: 'How many bedrooms do you have?', opts: [['1_2', '1 to 2'], ['3_4', '3 to 4'], ['5_6', '5 to 6'], ['7_plus', '7 or more']] },
  { key: 'address', title: 'Your address', type: 'address' },
  { key: 'ownership', title: 'Do you own this property?', opts: [['own', 'Yes'], ['on_behalf', 'I’m looking on behalf of the homeowner'], ['buying', 'I’m in the process of buying'], ['renting', 'I’m renting this property']] },
  { key: 'timing', title: 'When are you considering getting solar installed?', opts: [['asap', 'As soon as possible'], ['1_month', 'Within 1 month'], ['3_months', 'Within 3 months'], ['6_months', 'Within 6 months'], ['researching', 'Just researching']] },
  { key: 'contact', title: 'Where should we send your results?', type: 'contact' },
];

const answers = { addressLine: '' };
let postcode = saved.input.postcode || '';
let i = 0;

function progress() {
  const pct = Math.round((i / (Q.length - 1)) * 100);
  return `<div class="qf-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Progress"><span style="width:${Math.max(6, pct)}%"></span></div><p class="qf-count">Step ${i + 1} of ${Q.length}</p>`;
}
const nav = (nextLabel, nextDisabled = false) =>
  `<div class="qf-nav"><button type="button" class="btn btn-ghost" data-prev${i === 0 ? ' disabled' : ''}>Previous</button><button type="button" class="btn btn-dark" data-next${nextDisabled ? ' disabled' : ''}>${nextLabel}</button></div>`;

function render() {
  const q = Q[i];
  let body = '';
  if (q.type === 'address') {
    body = `<div class="field"><label for="qf-pc">Postcode</label><input id="qf-pc" type="text" autocomplete="postal-code" maxlength="9" placeholder="e.g. LS1 4AP" value="${esc(postcode)}"><p class="error" id="qf-pc-err" role="alert" hidden></p></div>
      <div class="field"><label for="qf-addr">First line of your address <span class="optional">optional</span></label><input id="qf-addr" type="text" autocomplete="address-line1" maxlength="120" value="${esc(answers.addressLine)}"></div>
      <p class="hint center">We use this to find recommended installers in your area.</p>${nav('Next')}`;
  } else if (q.type === 'contact') {
    body = `<form class="qf-contact" data-form="quote" novalidate>
      <p class="qf-lede">Based on your answers, installers covering ${esc(postcode)} can quote for your home.</p>
      <div class="field-row"><div class="field" data-field="first"><label for="f-first">First name</label><input id="f-first" name="first" required autocomplete="given-name" maxlength="100"><p class="error" id="f-first-err" role="alert" hidden></p></div>
      <div class="field"><label for="f-last">Last name</label><input id="f-last" name="last" required autocomplete="family-name" maxlength="100"><p class="error" id="f-last-err" role="alert" hidden></p></div></div>
      <div class="field"><label for="f-email">Email address</label><input id="f-email" name="email" type="email" required autocomplete="email" maxlength="200"><p class="error" id="f-email-err" role="alert" hidden></p></div>
      <div class="field"><label for="f-phone">Phone number</label><input id="f-phone" name="phone" type="tel" inputmode="tel" required autocomplete="tel" maxlength="40"><p class="error" id="f-phone-err" role="alert" hidden></p></div>
      <input type="hidden" name="postcode" value="${esc(postcode)}">
      <div data-matched class="matched" hidden></div>
      <div class="hp" aria-hidden="true"><label>Leave this empty<input type="text" name="hp_url" tabindex="-1" autocomplete="off"></label></div>
      <div class="field field-check"><label class="check"><input type="checkbox" id="f-consent" name="consent" value="yes" required><span>I agree that ${esc(cfg.brand)} may share these details with <strong data-consent-names>the installers matched to my postcode</strong> so they can contact me by phone, email or post about a solar quote. I’ve read the <a href="${esc(cfg.links.privacy)}">privacy notice</a>. I can withdraw this at any time.</span></label><p class="error" id="f-consent-err" role="alert" hidden></p></div>
      <p class="form-status" role="status" aria-live="polite" hidden></p>
      <div class="qf-nav"><button type="button" class="btn btn-ghost" data-prev>Previous</button><button type="submit" class="btn btn-dark">Send</button></div></form>`;
  } else {
    body = `<div class="qf-opts" role="radiogroup" aria-label="${esc(q.title)}">${q.opts.map(([v, l]) => `<button type="button" class="qf-opt" role="radio" aria-checked="${answers[q.key] === v}" data-v="${v}">${esc(l)}</button>`).join('')}</div>${nav('Next', !answers[q.key])}`;
  }
  root.innerHTML = `${progress()}<h1 class="qf-title" id="qf-title" tabindex="-1">${esc(q.title)}</h1>${body}`;
  root.querySelector('#qf-title').focus({ preventScroll: true });
  if (q.type === 'contact') startContact();
}

function startContact() {
  const form = root.querySelector('form');
  const pc = parsePostcode(postcode);
  if (pc) previewMatches(pc.region, 'quote').then((list) => renderMatched(form.querySelector('[data-matched]'), list, form.querySelector('[data-consent-names]')));
  bindForm(form, { kind: 'quote', getExtra: () => ({ name: `${form.elements.first.value} ${form.elements.last.value}`.trim(), answers: { ...answers } }) });
}

root.addEventListener('click', (e) => {
  const q = Q[i];
  const opt = e.target.closest('.qf-opt');
  if (opt) {
    answers[q.key] = opt.dataset.v;
    setTimeout(() => { i++; render(); }, 160);
    root.querySelectorAll('.qf-opt').forEach((b) => b.setAttribute('aria-checked', String(b === opt)));
    return;
  }
  if (e.target.closest('[data-prev]') && i > 0) { i--; render(); return; }
  if (e.target.closest('[data-next]')) {
    if (q.type === 'address') {
      const val = root.querySelector('#qf-pc').value.trim();
      const err = root.querySelector('#qf-pc-err');
      if (!parsePostcode(val)) { err.textContent = 'Please enter a full UK postcode, e.g. LS1 4AP.'; err.hidden = false; root.querySelector('#qf-pc').focus(); return; }
      postcode = parsePostcode(val).formatted;
      answers.addressLine = root.querySelector('#qf-addr').value.trim();
    }
    if (q.opts && !answers[q.key]) return;
    i++; render();
  }
});

render();
