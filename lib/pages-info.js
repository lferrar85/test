import { SITE } from './config.js';
import { esc, inline, blocks, toc } from './markup.js';
import * as D from '../public/js/data.js';
import { pageHead, ctaBand, guideCard } from './ui.js';
import { GUIDES } from '../content/guides.js';
import { LEGAL } from '../content/legal.js';

const A = D.ASSUMPTIONS;

// ---------------------------------------------------------------------------
// How it works

export function howItWorks(ctx) {
  const body = `
${pageHead({
  eyebrow: 'How it works',
  title: 'From postcode to quotes, <span class="mark">with nothing hidden.</span>',
  lede: `Here is exactly what ${esc(SITE.name)} does with what you tell us, and what we don’t do.`,
})}
<section class="section"><div class="wrap">
  <ol class="steps-list">
    <li><span class="step-n">01</span><div><h3>You use the calculator</h3><p>Answer questions about the roof and the home. The sums run in your browser. Nothing is sent to us at this stage, and you don’t need to give a name or email to see your numbers.</p></div></li>
    <li><span class="step-n">02</span><div><h3>You read your statement</h3><p>You see generation, an itemised before-and-after bill, payback and the 25-year picture, with a likely range. You can change the number of panels, battery, electricity price and export rate, and see how each one moves the answer.</p></div></li>
    <li><span class="step-n">03</span><div><h3>You decide whether to ask for quotes</h3><p>If you do, you give your contact details and tick a box naming the installers who will receive them. Not ticking it means nothing is shared.</p></div></li>
    <li><span class="step-n">04</span><div><h3>Up to three installers get in touch</h3><p>They contact you about a quote, usually after a survey. You compare, you choose or you walk away. We ask you not to feel pressured, and we want to know if anyone pushes.</p></div></li>
  </ol>
</div></section>
<section class="section section-paper2"><div class="wrap two-col">
  <div class="prose">
    <h2>How matching works</h2>
    <ul>
      <li>We match on where you live. Installers tell us which regions they cover.</li>
      <li>Only installers who offer what you asked for (solar, or batteries) are considered.</li>
      <li>At most three installers receive your details, never more.</li>
      <li>Where more than three could take the job, we offer it first to those who have had the fewest recent introductions, so it isn’t always the same names.</li>
      <li>You see the installers’ names before you submit, and again afterwards.</li>
    </ul>
    <h2>How installers are chosen</h2>
    <p>Partner installers need MCS certification for the work they quote, membership of a consumer code such as RECC or HIES where relevant, and valid insurance. The <a href="${esc(ctx.href('/installers'))}">installers page</a> lists the standards in full.</p>
  </div>
  <div class="prose">
    <h2>What we do</h2>
    <ul>
      <li>Show our working, and let you change every assumption.</li>
      <li>Keep your estimate in your browser until you ask for quotes.</li>
      <li>Delete your details on request, and tell the installers who hold them.</li>
    </ul>
    <h2>What we don’t do</h2>
    <ul>
      <li>We don’t sell your details to anyone beyond the named installers.</li>
      <li>We don’t phone you ourselves.</li>
      <li>We don’t charge you anything.</li>
      <li>We don’t install panels, survey your roof or give financial advice. Your estimate is a guide until an installer surveys the roof.</li>
    </ul>
    <h2>How we’re paid</h2>
    <p>Installers pay us when we introduce a homeowner who has asked for quotes. That is the only way we earn money. It never changes your numbers, but it does mean we only list installers who have signed up. We are not a whole-of-market service. <a href="${esc(ctx.href('/about'))}">More on this</a>.</p>
  </div>
</div></section>
${ctaBand(ctx, {
  title: 'See what your roof is worth.',
  text: 'It takes about a minute, and you don’t need to enter an email to see the answer.',
  href: '/solar-calculator',
  label: 'Start the calculator',
})}`;
  return {
    title: 'How it works',
    description: `How ${SITE.name} works: the calculator, how installers are matched, who sees your details and how we are paid.`,
    body,
  };
}

// ---------------------------------------------------------------------------
// About

export function about(ctx) {
  const body = `
${pageHead({
  eyebrow: 'About',
  title: 'Solar sales is full of big numbers and <span class="mark">no workings.</span>',
  lede: `${esc(SITE.name)} exists to put the workings back.`,
})}
<section class="section"><div class="wrap two-col">
  <div class="prose">
    <h2>What we believe</h2>
    <ul>
      <li><strong>Show your working.</strong> A saving figure is only useful if you can see what it’s based on, and change it.</li>
      <li><strong>Ask for little.</strong> You shouldn’t need to hand over an email address to find out what solar might do for you.</li>
      <li><strong>Never more than three.</strong> A busy marketplace of ten phone calls helps nobody. At most three installers get your details.</li>
      <li><strong>Be honest about batteries and bad roofs.</strong> Sometimes the answer is “not worth it”, and we’ll say so.</li>
    </ul>
    <h2>How we’re paid</h2>
    <p>Installers pay ${esc(SITE.name)} when we introduce a homeowner who has asked for quotes. Homeowners pay nothing. Because installers pay us, we only list installers who have signed up with us, so we aren’t a whole-of-market service and the installers shown to you may not be the cheapest available. Our fees don’t affect the numbers in your estimate. The method is on a <a href="${esc(ctx.href('/methodology'))}">public page</a> so you can check that.</p>
    <h2>Who we are</h2>
    <p>${esc(SITE.name)} is a trading name of ${esc(SITE.company)}, company number ${esc(SITE.companyNumber)}, registered at ${esc(SITE.address)}. We are registered with the Information Commissioner’s Office under number ${esc(SITE.ico)}.</p>
    <p>Questions or complaints? <a href="${esc(ctx.href('/contact'))}">Contact us</a>.</p>
  </div>
  <aside class="pull">
    <p class="pull-text">“Every number on the page can be traced to an assumption on the page.”</p>
    <p class="fine">That is the test we hold the calculator to. If you find a number you can’t trace, <a href="${esc(ctx.href('/contact'))}">tell us</a>.</p>
  </aside>
</div></section>
${ctaBand(ctx, {
  title: 'Run your own numbers.',
  text: 'See what solar could be worth for your roof and your electricity use.',
  href: '/solar-calculator',
  label: 'Start the calculator',
})}`;
  return {
    title: 'About us',
    description: `About ${SITE.name}: what we believe, how installers are matched, and how we are paid.`,
    body,
  };
}

// ---------------------------------------------------------------------------
// Methodology: generated from the model's own constants so it cannot drift.

const th = (cells) => `<tr>${cells.map((c) => `<th scope="col">${c}</th>`).join('')}</tr>`;
const table = (head, rows, cls = 'data-table') =>
  `<div class="table-wrap"><table class="${cls}"><thead>${th(head)}</thead><tbody>${rows
    .map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`)
    .join('')}</tbody></table></div>`;

export function methodology(ctx) {
  const regionRows = Object.entries(D.REGIONS)
    .filter(([k]) => k !== 'uk')
    .map(([, v]) => [esc(v.name), `${v.yield}`]);
  const orientRows = D.ORIENT_TILTS.map((t, i) => [`${t}°`, ...D.ORIENT_TABLE[i].map((v) => `${v}%`)]);
  const shadeRows = Object.values(D.SHADING).map((s) => [esc(s.label), `${Math.round(s.factor * 100)}%`, esc(s.hint)]);
  const assumptionRows = [
    ['Panel size', `${A.panelWatt} W, about ${A.panelAreaM2} m² each`],
    ['Ageing', `Output falls ${(A.degradation * 100).toFixed(1)}% a year`],
    ['Electricity price you avoid', `${A.importRate}p per kWh to start with, editable. Assumed to rise ${(A.priceInflation * 100).toFixed(1)}% a year`],
    ['Export payment', `${A.exportRate}p per kWh to start with, editable. Held flat`],
    ['Solar installed cost', `£${A.costFixed.toLocaleString('en-GB')} plus £${A.costPerKwp.toLocaleString('en-GB')} per kWp, at 0% VAT`],
    ['Battery installed cost', `£${A.battFixed} plus £${A.battPerKwh} per kWh`],
    ['Battery behaviour', `${Math.round(A.batteryUsableShare * 100)}% of the rated size is usable, ${Math.round(A.batteryRoundTrip * 100)}% round-trip efficiency, charged from spare solar only`],
    ['Battery life', `Benefits counted for ${A.batteryLife} years, no replacement assumed`],
    ['Inverter', `Replacement of £${A.inverterCost} counted in year ${A.inverterYear}`],
    ['System life', `${A.systemLife} years`],
    ['Number of panels', `Add panels while the last one pays back within ${A.marginalPaybackYears} years, never fewer than 6 where the roof allows`],
    ['Range shown', `Generation ${Math.round((A.rangeLow - 1) * 100)}% to +${Math.round((A.rangeHigh - 1) * 100)}%`],
    ['Carbon', `${A.gridCo2KgPerKwh} kg CO₂ per kWh of grid electricity displaced`],
  ];
  const body = `
${pageHead({
  eyebrow: 'Methodology',
  title: 'How we calculate <span class="mark">your number.</span>',
  lede: 'No black box. This page lists every assumption in the calculator. It’s generated from the same settings the calculator runs on, so it can’t say one thing while the sums do another.',
})}
<section class="section"><div class="wrap method">
  <nav class="toc" aria-label="On this page"><p class="eyebrow">On this page</p><ol>
    <li><a href="#the-steps">The steps</a></li><li><a href="#assumptions">Assumptions</a></li><li><a href="#sunshine-by-region">Sunshine by region</a></li><li><a href="#roof-direction-and-pitch">Roof direction and pitch</a></li><li><a href="#shading">Shading</a></li><li><a href="#your-homes-electricity">Your home’s electricity</a></li><li><a href="#what-we-dont-model">What we don’t model</a></li>
  </ol></nav>
  <div class="prose">
    <p><strong>Assumptions last reviewed:</strong> ${esc(A.reviewed)}.</p>
    <h2 id="the-steps">The steps</h2>
    <ol>
      <li><strong>Yearly generation.</strong> System size in kWp × the typical yearly yield for your region × a factor for the direction and pitch of each roof face × a shading factor.</li>
      <li><strong>Spread across the year.</strong> Generation is split into months using a typical UK pattern, then into a clear day and a duller day each month.</li>
      <li><strong>Spread across the day.</strong> Each hour of a typical day gets a share of the generation. East-facing roofs peak earlier, west-facing later.</li>
      <li><strong>Your demand, hour by hour.</strong> Your home’s electricity use follows a daily pattern based on who’s in during the day, with seasonal weighting. An electric car, heat pump or electric heating adds its own pattern.</li>
      <li><strong>Matching.</strong> Each hour, solar meets your demand first. Spare solar charges a battery if you have one, then goes to the grid. Any shortfall comes from the battery, then the grid.</li>
      <li><strong>Money.</strong> Energy you no longer buy is worth your unit rate. Exports earn your export rate. The 25-year view applies panel ageing, electricity price rises, an inverter replacement and the battery’s life.</li>
    </ol>
    <h2 id="assumptions">Assumptions</h2>
    ${table(['Item', 'What we assume'], assumptionRows)}
    <aside class="note"><p>Zero VAT on domestic solar and battery installs is currently scheduled to end on 31 March 2027. Check the position when you get a quote, because it affects what you pay.</p></aside>
    <h2 id="sunshine-by-region">Sunshine by region</h2>
    <p>Typical yearly output in kWh for each kWp of panels, on a south-facing roof at about 35° with no shading. We pick your region from your postcode.</p>
    ${table(['Region', 'kWh per kWp per year'], regionRows)}
    <h2 id="roof-direction-and-pitch">Roof direction and pitch</h2>
    <p>The share of the best-possible output (a south-facing roof at 30° to 40°) you can expect. Columns are how far the roof faces away from due south. We interpolate between the values shown.</p>
    ${table(['Pitch', 'South', '45° off', 'East or west', '135° off', 'North'], orientRows)}
    <h2 id="shading">Shading</h2>
    ${table(['Shading', 'Share of output kept', 'Means'], shadeRows)}
    <h2 id="your-homes-electricity">Your home’s electricity</h2>
    <p>If you don’t know your usage, we estimate it from the number of bedrooms and people: ${D.estimateBaseUsage(3, 3).toLocaleString('en-GB')} kWh a year for three bedrooms and three people. If you give us a bill, we turn it into kWh using your unit rate and a typical standing charge. Planned electric cars and heat pumps are added on top; ones you already have are assumed to be in the figure you gave us.</p>
    <ul>
      <li>An electric car adds ${D.EV_KWH_PER_YEAR.toLocaleString('en-GB')} kWh a year, mostly charged overnight, with a bigger daytime share if you’re home more.</li>
      <li>A heat pump adds ${D.heatPumpKwh(3).toLocaleString('en-GB')} kWh a year for a three-bedroom home, concentrated in winter.</li>
      <li>Electric heating adds ${D.electricHeatKwh(3).toLocaleString('en-GB')} kWh a year for a three-bedroom home, mostly overnight or in the evening.</li>
    </ul>
    <h2 id="what-we-dont-model">What we don’t model</h2>
    <ul>
      <li>Time-of-use tariffs and charging a battery from the grid when power is cheap. This can make a battery worth more than we show.</li>
      <li>Exact shading through the day and year. A surveyor will measure it.</li>
      <li>Individual panel and inverter performance, or snow, dirt and wiring losses beyond those built into the yield figures.</li>
      <li>Finance costs. We show cash prices.</li>
      <li>Changes to export tariffs or the electricity price beyond the assumptions above.</li>
    </ul>
    <p>Found something wrong or out of date? <a href="${esc(ctx.href('/contact'))}">Tell us</a>. We’d rather fix it than defend it.</p>
  </div>
</div></section>
${ctaBand(ctx, {
  title: 'Now try it on your roof.',
  text: 'Change any of these assumptions in the results and watch the answer move.',
  href: '/solar-calculator',
  label: 'Start the calculator',
})}`;
  return {
    title: 'How we calculate your number',
    description: `Every assumption in the ${SITE.name} solar calculator: sunshine by region, roof direction and pitch, shading, costs, battery behaviour and what we leave out.`,
    body,
  };
}

// ---------------------------------------------------------------------------
// Guides

export function guidesIndex(ctx) {
  const [lead, ...rest] = GUIDES;
  const body = `
${pageHead({
  eyebrow: 'Guides',
  title: 'Guides written to be <span class="mark">useful, not to sell.</span>',
  lede: 'Plain-English answers to the questions people ask before buying solar panels and batteries in the UK.',
})}
<section class="section"><div class="wrap">
  <div class="guide-grid guide-grid-index">
    ${guideCard(lead, ctx, 'guide-card-lead')}
    ${rest.map((g) => guideCard(g, ctx)).join('')}
  </div>
</div></section>
${ctaBand(ctx, {
  title: 'Ready for numbers?',
  text: 'The calculator turns what you’ve read into figures for your own roof.',
  href: '/solar-calculator',
  label: 'Start the calculator',
})}`;
  return {
    title: 'Solar panel and battery guides',
    description: 'Independent UK guides on solar panel costs, the Smart Export Guarantee, roofs, batteries, MCS certification and comparing quotes.',
    body,
  };
}

const CTA = {
  calculator: { title: 'Work out what solar is worth for your roof.', text: 'Free, no email needed, and every assumption is visible.', href: '/solar-calculator', label: 'Start the calculator' },
  battery: { title: 'Want battery quotes for your home?', text: 'Up to three installers covering your postcode, only because you asked.', href: '/battery-quote', label: 'Get battery quotes' },
  quotes: { title: 'Ready to compare quotes?', text: 'Run the calculator first so you know what a fair quote looks like for your roof.', href: '/solar-calculator', label: 'Start the calculator' },
};

export function guide(ctx, slug) {
  const g = GUIDES.find((x) => x.slug === slug);
  if (!g) return null;
  const related = g.related.map((s) => GUIDES.find((x) => x.slug === s)).filter(Boolean);
  const updated = new Date(`${g.updated}-01`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const body = `
<article>
<header class="page-head article-head"><div class="wrap">
  <p class="eyebrow"><a href="${esc(ctx.href('/guides'))}">Guides</a> · ${g.readMins} min read · Updated ${esc(updated)}</p>
  <h1>${inline(g.title, ctx)}</h1>
  <p class="lede">${inline(g.intro, ctx)}</p>
</div></header>
<div class="wrap article-layout">
  ${toc(g.body)}
  <div class="prose article-body">
${blocks(g.body, ctx)}
  </div>
</div>
</article>
${related.length ? `<section class="section section-paper2"><div class="wrap"><p class="eyebrow">Keep reading</p><div class="guide-grid guide-grid-related">${related.map((r) => guideCard(r, ctx)).join('')}</div></div></section>` : ''}
${ctaBand(ctx, CTA[g.cta] || CTA.calculator)}`;
  return {
    title: g.title,
    description: g.description,
    bodyClass: 'page-article',
    body,
  };
}

// ---------------------------------------------------------------------------
// Legal

const STORAGE_MARKER = '[CONFIRM BEFORE LAUNCH: add the storage key name(s) used by the site]';
const STORAGE_TEXT = '(stored under the keys “rw:calc” and “rw:last”)';

export function legal(ctx, key) {
  const doc = LEGAL[key];
  if (!doc) return null;
  const showDraft = process.env.LEGAL_REVIEWED !== '1';
  const list = doc.body
    .filter((b) => showDraft || !(b.t === 'note' && /^Template draft/.test(b.x)))
    .map((b) => JSON.parse(JSON.stringify(b).split(STORAGE_MARKER).join(STORAGE_TEXT)));
  const updated = new Date(`${doc.updated}-01`).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const body = `
<header class="page-head article-head"><div class="wrap">
  <p class="eyebrow">Legal · Updated ${esc(updated)}</p>
  <h1>${esc(doc.title)}</h1>
</div></header>
<div class="wrap article-layout">
  ${toc(list)}
  <div class="prose article-body">
${blocks(list, ctx)}
  </div>
</div>`;
  return { title: doc.title, description: doc.description, body, bodyClass: 'page-legal' };
}
