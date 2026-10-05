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
  <div class="cta-actions"><a class="btn btn-lg" href="${esc(ctx.href(href))}"><span>${esc(label)}</span><span class="arrow" aria-hidden="true">→</span></a>${alt ? `<a class="link-arrow" href="${esc(ctx.href(alt.href))}">${esc(alt.label)}</a>` : ''}</div>
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
        return `<rect x="${72 + col * 17 + row * 3}" y="${38 + row * 11 - col * 5}" width="15" height="9" rx="1.5" fill="#163463" stroke="#fff" stroke-width="1" transform="rotate(-18 ${72 + col * 17} ${38 + row * 11})"/>`;
      }).join('')
    : '';
  return `<svg class="house" viewBox="0 0 200 124" role="img" aria-label="${solar ? (battery ? 'A house with solar panels and a battery' : 'A house with solar panels') : 'A house without solar panels'}">
  ${solar ? '<circle cx="168" cy="26" r="13" fill="#ffb300"/><g stroke="#ff9500" stroke-width="3" stroke-linecap="round"><path d="M168 4v5M168 43v5M146 26h5M185 26h5M152 10l3.5 3.5M180.5 38.5 184 42M184 10l-3.5 3.5M155.5 38.5 152 42"/></g>' : '<circle cx="168" cy="26" r="13" fill="#e1e7f0"/>'}
  <path d="M30 62 100 14l70 48z" fill="#0b1f3f"/>
  <rect x="42" y="62" width="116" height="48" rx="3" fill="#fff" stroke="#0b1f3f" stroke-width="3"/>
  <rect x="90" y="78" width="20" height="32" rx="2" fill="#ffb300"/>
  <rect x="54" y="74" width="22" height="18" rx="2" fill="#e9eff8" stroke="#0b1f3f" stroke-width="2"/>
  <rect x="124" y="74" width="22" height="18" rx="2" fill="#e9eff8" stroke="#0b1f3f" stroke-width="2"/>
  ${panels}
  ${battery ? '<rect x="162" y="78" width="22" height="32" rx="4" fill="#0d9f6e"/><path d="M169 84h8M169 90h8M169 96h8" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>' : ''}
  <path d="M12 110h176" stroke="#c5d0e1" stroke-width="3" stroke-linecap="round"/>
</svg>`;
}
