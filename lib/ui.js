import { esc, inline } from './markup.js';
import { SITE } from './config.js';
import { SERVICE_LABELS } from './installers.js';
import { REGIONS } from '../public/js/data.js';
import { analyse, defaultInput } from '../public/js/model.js';
import { icon, initials } from '../public/js/icons.js';

// A fixed example used on marketing pages, computed by the same model as the calculator
// so the numbers shown there can never drift from the real thing.
export function exampleResult(over = {}) {
  return analyse({
    ...defaultInput(),
    region: 'london',
    postcode: 'SE1 7PB',
    bedrooms: 3,
    occupants: 3,
    occupancy: 'partial',
    roofs: [{ azimuth: 180, tilt: 35, space: 'medium' }],
    ...over,
  });
}

export function pageHead({ eyebrow, title, lede, cls = '' }) {
  return `<section class="page-head ${cls}"><div class="wrap">
  ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
  <h1>${title}</h1>
  ${lede ? `<p class="lede">${lede}</p>` : ''}
</div></section>`;
}

export function field({ name, label, type = 'text', required = false, hint = '', autocomplete = '', options = null, value = '', rows = 5, placeholder = '', inputmode = '', maxlength = 200 }) {
  const id = `f-${name}`;
  const common = `id="${id}" name="${name}"${required ? ' required aria-required="true"' : ''}${hint ? ` aria-describedby="${id}-hint ${id}-err"` : ` aria-describedby="${id}-err"`}${autocomplete ? ` autocomplete="${autocomplete}"` : ''}`;
  let control;
  if (type === 'textarea') {
    control = `<textarea ${common} rows="${rows}" maxlength="2000"${placeholder ? ` placeholder="${esc(placeholder)}"` : ''}>${esc(value)}</textarea>`;
  } else if (type === 'select') {
    control = `<select ${common}>${options.map(([v, l]) => `<option value="${esc(v)}"${v === value ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  } else {
    control = `<input ${common} type="${type}"${inputmode ? ` inputmode="${inputmode}"` : ''} maxlength="${maxlength}"${placeholder ? ` placeholder="${esc(placeholder)}"` : ''}${value ? ` value="${esc(value)}"` : ''}>`;
  }
  return `<div class="field" data-field="${name}">
  <label for="${id}">${esc(label)}${required ? '' : ' <span class="optional">optional</span>'}</label>
  ${control}
  ${hint ? `<p class="hint" id="${id}-hint">${hint}</p>` : ''}
  <p class="error" id="${id}-err" role="alert" hidden></p>
</div>`;
}

export function honeypot() {
  // Bots fill every field. Humans never see this one.
  return `<div class="hp" aria-hidden="true"><label>Leave this empty<input type="text" name="hp_url" tabindex="-1" autocomplete="off"></label></div>`;
}

export function consent({ id = 'consent', html }) {
  return `<div class="field field-check" data-field="${id}">
  <label class="check"><input type="checkbox" id="f-${id}" name="${id}" value="yes" required aria-required="true" aria-describedby="f-${id}-err"><span>${html}</span></label>
  <p class="error" id="f-${id}-err" role="alert" hidden></p>
</div>`;
}

export function installerCard(i, ctx, { compact = false } = {}) {
  const regions = i.regions.map((r) => REGIONS[r]?.name).filter(Boolean);
  return `<article class="installer-card" data-regions="${esc(i.regions.join(' '))}">
  <div class="installer-top">
    <span class="avatar" aria-hidden="true">${esc(initials(i.name))}</span>
    <div><h3><a href="${esc(ctx.href(`/installers/${i.slug}`))}">${esc(i.name)}</a></h3>
    ${i.demo ? '<p class="sample-flag">Sample listing</p>' : ''}</div>
  </div>
  <p class="installer-tagline">${esc(i.tagline)}</p>
  ${compact ? '' : `<p class="installer-regions"><span class="eyebrow">Covers</span> ${esc(regions.join(', '))}</p>`}
  <ul class="tags" aria-label="Services and accreditations">
    ${i.services.map((s) => `<li>${esc(SERVICE_LABELS[s] || s)}</li>`).join('')}
    ${i.accreditations.map((a) => `<li class="tag-accred">${esc(a)}</li>`).join('')}
  </ul>
  ${i.demo && !compact ? '<p class="fine">Placeholder until real, checked installers are signed up.</p>' : ''}
</article>`;
}

export function faqList(items, ctx) {
  return `<div class="faq">${items
    .map(
      (f) => `<details><summary><span>${esc(f.q)}</span><span class="faq-plus" aria-hidden="true"></span></summary><div class="faq-a"><p>${inline(f.a, ctx)}</p></div></details>`,
    )
    .join('')}</div>`;
}

const GUIDE_ICONS = {
  'how-much-do-solar-panels-cost': 'receipt',
  'smart-export-guarantee': 'bolt',
  'is-my-roof-suitable-for-solar': 'compass',
  'are-solar-batteries-worth-it': 'battery',
  'how-to-compare-solar-quotes': 'sliders',
  'mcs-certification-explained': 'shield',
  'solar-panels-and-electric-cars': 'leaf',
  'solar-panel-installation-process': 'roof',
};

export function guideCard(g, ctx, cls = '') {
  return `<article class="guide-card ${cls}">
  <span class="icon-tile" aria-hidden="true">${icon(GUIDE_ICONS[g.slug] || 'doc', { size: 24 })}</span>
  <p class="eyebrow">${g.readMins} min read</p>
  <h3><a href="${esc(ctx.href(`/guides/${g.slug}`))}">${esc(g.title)}</a></h3>
  <p>${inline(g.intro, ctx)}</p>
</article>`;
}

export function ctaBand(ctx, { title, text, href, label, alt }) {
  return `<section class="cta-band"><div class="wrap cta-row">
  <div><h2>${title}</h2><p>${text}</p></div>
  <div class="cta-actions"><a class="btn btn-lg btn-dark" href="${esc(ctx.href(href))}"><span>${esc(label)}</span><span class="arrow" aria-hidden="true">→</span></a>${alt ? `<a class="link-arrow" href="${esc(ctx.href(alt.href))}">${esc(alt.label)}</a>` : ''}</div>
</div></section>`;
}

export const quoteConsentHtml = (ctx, names) =>
  `I agree that ${esc(SITE.name)} may share the details on this form, and my estimate, with <strong data-consent-names>${names}</strong> so they can contact me by phone, email or post about a solar quote. I’ve read the <a href="${esc(ctx.href('/privacy'))}">privacy notice</a>. I can withdraw this at any time.`;

export const checkList = (items) =>
  `<ul class="checks">${items.map((t) => `<li><span class="icon-check">${icon('check', { size: 16 })}</span><span>${t}</span></li>`).join('')}</ul>`;

// A simple house illustration for the with/without comparison.
export function houseSvg({ solar = false, battery = false } = {}) {
  const panels = solar
    ? Array.from({ length: 6 }, (_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        return `<rect x="${72 + col * 17 + row * 3}" y="${38 + row * 11 - col * 5}" width="15" height="9" rx="1.5" fill="#1e3a66" stroke="#fff" stroke-width="1" transform="rotate(-18 ${72 + col * 17} ${38 + row * 11})"/>`;
      }).join('')
    : '';
  return `<svg class="house" viewBox="0 0 200 124" role="img" aria-label="${solar ? (battery ? 'A house with solar panels and a battery' : 'A house with solar panels') : 'A house without solar panels'}">
  ${solar ? '<circle cx="168" cy="26" r="13" fill="#ffd000"/><g stroke="#ffb400" stroke-width="3" stroke-linecap="round"><path d="M168 4v5M168 43v5M146 26h5M185 26h5M152 10l3.5 3.5M180.5 38.5 184 42M184 10l-3.5 3.5M155.5 38.5 152 42"/></g>' : '<circle cx="168" cy="26" r="13" fill="#e6e6e3"/>'}
  <path d="M30 62 100 14l70 48z" fill="#161616"/>
  <rect x="42" y="62" width="116" height="48" rx="3" fill="#fff" stroke="#161616" stroke-width="3"/>
  <rect x="90" y="78" width="20" height="32" rx="2" fill="#ffd000"/>
  <rect x="54" y="74" width="22" height="18" rx="2" fill="#ecece8" stroke="#161616" stroke-width="2"/>
  <rect x="124" y="74" width="22" height="18" rx="2" fill="#ecece8" stroke="#161616" stroke-width="2"/>
  ${panels}
  ${battery ? '<rect x="162" y="78" width="22" height="32" rx="4" fill="#0d9f6e"/><path d="M169 84h8M169 90h8M169 96h8" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>' : ''}
  <path d="M12 110h176" stroke="#cdcdc8" stroke-width="3" stroke-linecap="round"/>
</svg>`;
}

export const waveEdge = (next = '#fff') => `<div class="wave-edge" style="--next:${next}" aria-hidden="true"></div>`;
export const ctaBlock = (ctx, label = 'Compare solar now', note = 'Takes about a minute. No email needed to see your numbers.', dark = false) =>
  `<div class="cta-block"><a class="btn btn-lg${dark ? ' btn-dark' : ''}" href="${esc(ctx.href('/solar-calculator'))}"><span>${esc(label)}</span><span class="arrow" aria-hidden="true">→</span></a><p class="cta-note">${esc(note)}</p></div>`;

// ---------------------------------------------------------------------------
// Ray, the mascot: a photo that mascot.js brings to life (he turns to follow the pointer by
// scrubbing a frame sprite cut from a short video, and talks through the speech bubble).

export const RAY_ALT = 'Ray, a lynx in a camo cap, amber aviators and a green utility jacket';

export function mascot(ctx, { line = 'Hi, I’m Ray. Which way does your roof face?', cls = '' } = {}) {
  return `<div class="mascot ${cls}" data-mascot data-sprite="${esc(ctx.asset('/img/ray-turn.webp'))}" data-frames="24" data-cols="4" data-centre="9">
  <div class="cat-frame">
    <img class="cat-still" src="${esc(ctx.asset('/img/ray.jpg'))}" width="680" height="644" alt="${RAY_ALT}" fetchpriority="high">
    <canvas class="cat-canvas" hidden aria-hidden="true"></canvas>
  </div>
  <p class="mascot-say is-pop" aria-hidden="true">${esc(line)}</p>
</div>`;
}

export function heroTags(tags) {
  return `<ul class="hero-tags" aria-label="In short">${tags.map(([t, dark]) => `<li${dark ? ' class="is-dark"' : ''}>${esc(t)}</li>`).join('')}</ul>`;
}

// ---------------------------------------------------------------------------
// "How we vet every installer": the standards partners must meet, and what ranks them higher.

const VET_REQUIRED = [
  ['MCS certified for solar PV', 'The industry standard for solar installations, and needed for you to be paid for exported energy under the Smart Export Guarantee.'],
  ['MCS certified for batteries (if fitting storage)', 'Battery installs are certified separately, so we check this whenever a quote includes a battery.'],
  ['Registered electrical competent person', 'Registered with a government-authorised scheme such as NICEIC or NAPIT, so electrical work is certified to Building Regulations.'],
  ['Fully insured', 'At least £2 million public liability cover, plus employer’s liability where required.'],
  ['Qualified installers', 'The team fitting your system holds recognised solar PV qualifications.'],
];
const VET_BONUS = [
  ['Consumer code member (RECC or HIES)', 'Extra protection with fair contracts, deposit protection and an independent complaints route.'],
  ['TrustMark registered', 'Part of the government-endorsed quality scheme for work in your home.'],
  ['Insurance-backed guarantee', 'Your deposit and workmanship warranty stay protected even if the installer stops trading.'],
  ['Manufacturer-approved installer', 'Approved by the brands they fit, which can unlock longer product warranties.'],
  ['Strong workmanship warranty', 'We favour installers offering more than the 2-year minimum.'],
  ['Proven track record', 'Years of trading history, a clean Companies House record and strong independent customer reviews.'],
];
const tick = `<span class="vet-box" aria-hidden="true">${icon('check', { size: 16 })}</span>`;
const vetList = (items, cls) => `<ul class="vet-list ${cls}">${items.map(([t, d]) => `<li>${tick}<span><span class="vet-title">${esc(t)}</span><span class="vet-desc">${esc(d)}</span></span></li>`).join('')}</ul>`;

export function installerChecklist({ heading = 'h2' } = {}) {
  const H = heading;
  return `<div class="vet" aria-labelledby="vet-heading">
  <${H} id="vet-heading" class="vet-h">How we vet every installer</${H}>
  <p class="vet-intro">Before an installer is shown to you, we check their credentials directly with the official scheme registers, not just the logos on their website.</p>
  <h3 class="vet-sub">Essential checks <span class="vet-tag vet-tag-req">Required</span></h3>
  <p class="vet-note">Every installer we recommend must pass all of these.</p>
  ${vetList(VET_REQUIRED, 'vet-req')}
  <h3 class="vet-sub">Extra quality checks <span class="vet-tag vet-tag-bonus">Ranks higher</span></h3>
  <p class="vet-note">Installers who meet these move up our rankings, so your top three are the strongest in your area.</p>
  ${vetList(VET_BONUS, 'vet-bonus')}
  <p class="vet-foot">We re-check installer credentials regularly, as certifications can expire. If an installer no longer meets our essential checks, they’re removed from our recommendations.</p>
</div>`;
}

// ---------------------------------------------------------------------------
// "What to expect from here": the six steps after asking for quotes. Used on the thank-you page,
// under the quote form on the results page, and on How it works.

export function nextSteps(ctx, { heading = 'h2' } = {}) {
  const H = heading;
  const step = (n, when, title, body, extra = '') => `<li class="nx-step"><span class="nx-num" aria-hidden="true">${n}</span><div class="nx-card"><span class="nx-when">${esc(when)}</span><${H === 'h2' ? 'h3' : 'h4'}>${title}</${H === 'h2' ? 'h3' : 'h4'}><p>${body}</p>${extra}</div></li>`;
  const list = (items) => `<ul class="nx-list">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
  return `<section class="nx" aria-labelledby="nx-title">
  <div class="nx-inner">
    <p class="eyebrow">Next steps</p>
    <${H} id="nx-title" class="nx-h">What to expect from here.</${H}>
    <p class="nx-lede">No surprises and no pressure. Here’s exactly what happens after you ask for quotes, right through to switching your panels on.</p>
    <ul class="nx-badges"><li>Free</li><li>No obligation</li><li>Say no at any stage</li></ul>
    <ol class="nx-steps">
      ${step(1, 'Within a few working days', 'Receive up to three no-obligation quotes', 'Up to three vetted installers covering your area will get in touch. Every one is MCS certified and fully insured, and has seen your estimate, so they can quote for your actual home rather than starting from scratch.')}
      ${step(2, 'Before you commit', 'Book an in-person survey <span class="nx-rec">We recommend</span>', 'A proper survey means a proper price, so we recommend each installer visits before giving a final quote. They’ll:',
        list(['Inspect your roof’s condition and structure, and check for shading', 'Plan where your panels will go to get the most sun', 'Agree the best spot for your inverter and battery, such as a loft, garage or utility room', 'Plan cable routes from the roof to your fuse board, keeping them neat and out of sight', 'Check your fuse board and meter are ready for solar']) +
        '<div class="nx-tip"><strong>Tip:</strong> ask each installer for an itemised quote showing panel brand, inverter, battery, scaffolding and warranties. It makes comparing them like for like much easier.</div>')}
      ${step(3, 'In your own time', 'Compare and choose your installer', 'Take as long as you need. Compare price, kit, warranties and how each company made you feel. When you’re happy, accept your chosen quote and pay any deposit directly to the installer.',
        list(['Check your deposit is protected, ideally by an insurance-backed guarantee', 'You have a 14-day cooling-off period on contracts signed at home', 'Simply let the others know you’ve gone elsewhere. No hard feelings.']))}
      ${step(4, 'Usually 1–2 days on site', 'Installation day', 'Scaffolding goes up, usually a day or two before. Then the team fits your panels, inverter and any battery, runs the cables and connects everything to your fuse board. Your power will only be off for a short time while they connect.',
        '<div class="nx-tip"><strong>Good to know:</strong> your installer handles the paperwork with your local electricity network. For larger systems or batteries, they may need approval first, which can add a few weeks.</div>')}
      ${step(5, 'On the day you switch on', 'Switch on and handover', 'Your installer will show you how everything works and set up the monitoring app, so you can watch your panels make electricity in real time. You’ll receive:',
        list(['Your MCS certificate', 'An electrical installation certificate', 'Warranties for panels, inverter, battery and workmanship']))}
      ${step(6, 'From day one', 'Start saving, and get paid for your spare power', `Every unit you use from your roof is one you don’t buy. Use your MCS certificate to sign up for a Smart Export Guarantee tariff, and you’ll be paid for the electricity you send back to the grid. Rates vary a lot, so it pays to shop around.`)}
    </ol>
    <div class="nx-help">
      <p><strong>Questions at any stage?</strong>We’re here to help, whether that’s making sense of a quote or something not going to plan with an installer.</p>
      <a class="btn" href="${esc(ctx.href('/contact'))}"><span>Get in touch</span><span class="arrow" aria-hidden="true">→</span></a>
    </div>
  </div>
</section>`;
}
