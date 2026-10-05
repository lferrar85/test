import { SITE } from './config.js';
import { esc, inline } from './markup.js';
import { installers, installerBySlug, publicInstaller, SERVICE_LABELS } from './installers.js';
import { REGIONS } from '../public/js/data.js';
import { ledgerHtml } from '../public/js/ledger.js';
import { gbp, kwp, num, years, pct } from '../public/js/format.js';
import { analyse } from '../public/js/model.js';
import { field, honeypot, consent, installerCard, faqList, guideCard, ctaBand, pageHead, exampleResult, quoteConsentHtml, checkList, houseSvg, waveEdge, ctaBlock } from './ui.js';
import { icon } from '../public/js/icons.js';
import { GUIDES } from '../content/guides.js';
import { FAQ } from '../content/faq.js';

const installerConfig = (ctx) => ({
  installers: installers().map((i) => ({ ...publicInstaller(i), href: ctx.href(`/installers/${i.slug}`) })),
  regionNames: Object.fromEntries(Object.entries(REGIONS).map(([k, v]) => [k, v.name])),
});

// ---------------------------------------------------------------------------
// Home

export function home(ctx) {
  const ex = exampleResult();
  const featured = [GUIDES[0], GUIDES[3], GUIDES[4]];
  const faqs = FAQ.filter((f) => ['savings', 'quotes', 'roof', 'data'].includes(f.topic)).slice(0, 6);
  const teaser = installers().slice(0, 3);
  const cmp = [
    { title: 'No solar', img: houseSvg(), bad: true, net: ex.money.billBefore, cost: null, payback: null, lines: [`Buys all ${num(ex.demand.total)} kWh from the grid`, 'Bills follow every price rise', 'Nothing earned back'] },
    { title: 'Solar panels', img: houseSvg({ solar: true }), sc: ex.scenarios[0], featured: true },
    { title: 'Solar + 5 kWh battery', img: houseSvg({ solar: true, battery: true }), sc: ex.scenarios[1] },
  ].map((c) => {
    if (!c.sc) return c;
    const cover = (c.sc.flows.direct + c.sc.flows.batt) / c.sc.flows.demand;
    return {
      ...c,
      net: ex.money.billBefore - c.sc.money.saving,
      cost: c.sc.cost.total,
      payback: c.sc.payback,
      lines: [`${pct(cover)} of your electricity from your roof`, `Earns about ${gbp(c.sc.money.exportIncome)} a year exporting`, `Saves about ${gbp(c.sc.money.saving)} a year`],
    };
  });
  const trust = [
    ['sliders', 'Every assumption shown', 'Change any number and watch the answer move.'],
    ['users', 'Up to three installers', 'Never more, and only if you ask for quotes.'],
    ['lock', 'Your details stay yours', 'Nothing leaves your browser until you ask for quotes.'],
    ['receipt', 'Free to use', 'Installers pay us, never you.'],
  ];

  const body = `
<section class="hero has-wave">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="hero-badge"><span class="icon-tile" aria-hidden="true">${icon('sun', { size: 16 })}</span>Free UK solar savings calculator</p>
      <h1>What is your roof <span class="grad">worth?</span></h1>
      <p class="lede">Tell us where you live and which way your roof faces. We’ll work out what solar could save you, with every assumption on the table. Then, only if you ask, up to three installers quote for the job.</p>
      ${checkList([
        'See your numbers without handing over an email address',
        'Every assumption visible, and every one editable',
        'Quotes only when you ask, from no more than three installers',
      ])}
      <div class="trust-row">
        <span>${icon('shield')} Installers must be MCS-certified</span>
        <span>${icon('clock')} Takes about a minute</span>
        <span>${icon('lock')} No sign-up</span>
      </div>
    </div>
    <div class="hero-tool" data-mount="start">
      <div class="start-fallback">
        <p>Work out what solar could save you.</p>
        <a class="btn btn-lg btn-dark" href="${esc(ctx.href('/solar-calculator'))}"><span>Start the calculator</span><span class="arrow" aria-hidden="true">→</span></a>
      </div>
    </div>
  </div>
  ${waveEdge('#fff')}
</section>

<section class="trust-strip" aria-label="Why use ${esc(SITE.name)}">
  <div class="wrap trust-grid">
    ${trust.map(([ic, h, p]) => `<div class="trust-item"><span class="icon-tile" aria-hidden="true">${icon(ic)}</span><div><h3>${h}</h3><p>${p}</p></div></div>`).join('')}
  </div>
</section>

<section class="section section-grey center steps" id="how">
  <div class="wrap">
    <h2 class="section-title">Get your solar savings in 3 simple steps.</h2>
    <ol class="bubble-steps">
      <li><span class="bubble" aria-hidden="true">${icon('home')}<span class="bubble-n">1</span></span><h3>Tell us about your home</h3><p>Your postcode, which way the roof faces, how steep it is, how much room and shade there is, and who’s in during the day.</p></li>
      <li><span class="bubble" aria-hidden="true">${icon('chart')}<span class="bubble-n">2</span></span><h3>We run the numbers</h3><p>An hour-by-hour model of sun, your electricity use and an optional battery, with UK prices you can change.</p></li>
      <li><span class="bubble" aria-hidden="true">${icon('receipt')}<span class="bubble-n">3</span></span><h3>See your savings</h3><p>An itemised before-and-after bill, when it pays for itself and what it’s worth over 25 years. Quotes are optional.</p></li>
    </ol>
    ${ctaBlock(ctx)}
    <p class="steps-after"><a class="link-arrow" href="${esc(ctx.href('/get-quotes'))}">Just want quotes? Skip to the quick form</a> &nbsp;·&nbsp; <a class="link-arrow" href="${esc(ctx.href('/how-it-works'))}">How matching works</a></p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <p class="eyebrow">Why go solar</p>
    <h2 class="section-title">What solar can do for a UK home.</h2>
    <div class="benefit-grid">
      <div class="benefit-card"><span class="icon-tile" aria-hidden="true">${icon('bolt', { size: 26 })}</span><h3>Smaller bills</h3><p>Every kilowatt-hour you make and use is one you don’t buy from your supplier.</p></div>
      <div class="benefit-card"><span class="icon-tile" aria-hidden="true">${icon('receipt', { size: 26 })}</span><h3>Paid for what you don’t use</h3><p>Smart Export Guarantee tariffs pay you for surplus power you send to the grid. Rates vary, so it pays to compare.</p></div>
      <div class="benefit-card"><span class="icon-tile" aria-hidden="true">${icon('shield', { size: 26 })}</span><h3>Less exposed to price rises</h3><p>Power from your own roof doesn’t get dearer when unit rates go up. A battery stretches that into the evening.</p></div>
    </div>
  </div>
  ${waveEdge('#ffd000')}
</section>

<section class="section section-yellow center has-wave">
  <div class="wrap">
    <h2 class="section-title">Your home with and without solar.</h2>
    <p class="section-sub">Same house, same family, same electricity use, worked out by the model behind the calculator. Example: 3-bed semi, London, south-facing roof, ${ex.system.panels} panels.</p>
    <div class="compare-cards">
      ${cmp
        .map(
          (c) => `<article class="compare-card${c.featured ? ' is-featured' : ''}${c.bad ? ' is-bad' : ''}">
        <div class="compare-art">${c.img}</div>
        <h3>${c.title}</h3>
        <p class="compare-label">Net electricity cost</p>
        <p class="compare-big">${gbp(Math.max(0, c.net))}<span> a year</span></p>
        <ul class="compare-lines">${c.lines.map((l) => `<li>${l}</li>`).join('')}</ul>
        ${c.cost ? `<p class="compare-foot"><strong>${gbp(c.cost)}</strong> installed${c.payback ? `, pays back in about ${years(c.payback)}` : ''}</p>` : '<p class="compare-foot">Nothing to install, nothing to pay back.</p>'}
      </article>`,
        )
        .join('')}
    </div>
    <p class="fine compare-note">The battery cuts the bill further but costs more up front and takes longer to pay back. <a href="${esc(ctx.href('/battery-storage'))}">See why</a>.</p>
    ${ctaBlock(ctx, 'Compare solar now', 'We’ll show your own numbers in about a minute.', true)}
  </div>
  ${waveEdge('#fff')}
</section>

<section class="section">
  <div class="wrap why-grid">
    <div class="why-art">${houseSvg({ solar: true, battery: true })}</div>
    <div>
      <p class="eyebrow">Why use ${esc(SITE.name)}</p>
      <h2 class="section-title">We’ll save you the research, and show our working.</h2>
      <ul class="why-list">
        <li><span class="icon-tile" aria-hidden="true">${icon('sliders')}</span><div><h3>Numbers you can check</h3><p>Every assumption is on the page and every one is editable. The <a href="${esc(ctx.href('/methodology'))}">method</a> is public.</p></div></li>
        <li><span class="icon-tile" aria-hidden="true">${icon('pin')}</span><div><h3>Installers who cover your area</h3><p>Up to three, matched to your postcode, and named before you agree to share anything.</p></div></li>
        <li><span class="icon-tile" aria-hidden="true">${icon('lock')}</span><div><h3>Free, and in your control</h3><p>No sign-up to see your results. You choose whether to ask for quotes, and you can say no to any installer.</p></div></li>
      </ul>
      <p><a class="btn btn-lg" href="${esc(ctx.href('/solar-calculator'))}"><span>Compare solar now</span><span class="arrow" aria-hidden="true">→</span></a></p>
    </div>
  </div>
</section>

<section class="section section-grey">
  <div class="wrap">
    <p class="eyebrow">What we’ll ask you</p>
    <h2 class="section-title">A few questions, the ones that actually change the answer.</h2>
    <div class="ask-grid">
      <div class="ask-card"><span class="icon-tile" aria-hidden="true">${icon('compass', { size: 26 })}</span><h3>Your roof</h3><p>Which way it faces, how steep it is, how much room there is, how much shade, and what it’s covered with.</p></div>
      <div class="ask-card"><span class="icon-tile" aria-hidden="true">${icon('home', { size: 26 })}</span><h3>Your home</h3><p>Property type, roughly how old it is, how many bedrooms and people, and whether you own it.</p></div>
      <div class="ask-card"><span class="icon-tile" aria-hidden="true">${icon('bolt', { size: 26 })}</span><h3>Your electricity</h3><p>When someone’s home during the day, what you use or pay, and any electric car or heat pump.</p></div>
      <div class="ask-card"><span class="icon-tile" aria-hidden="true">${icon('pin', { size: 26 })}</span><h3>Where you live</h3><p>Your postcode sets how much sun you get and which installers cover your area.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap feature-grid">
    <div class="feature-copy">
      <p class="eyebrow">The statement</p>
      <h2 class="section-title">Most calculators give you one big number. We show you the bill.</h2>
      <p>Solar saves money in two ways: the electricity you stop buying, and the electricity you sell back. We show both lines, in kilowatt-hours and in pounds, so you can see where the saving comes from and argue with it.</p>
      ${checkList([
        'Panels fade about 0.5% a year, so year 25 is lower than year one',
        'An inverter swap around year 12 is counted as a cost',
        'A battery’s benefit stops when its warranty life ends, not at year 25',
        'You see a range, not just a single estimate',
      ])}
      <a class="link-arrow" href="${esc(ctx.href('/methodology'))}">Read the full method</a>
    </div>
    <div class="statement-card">
      <p class="statement-label">Example · 3-bed semi, London, south-facing roof, ${ex.system.panels} panels (${kwp(ex.system.kWp)})</p>
      ${ledgerHtml(ex, { caption: 'Example statement for a London semi' })}
      <p class="statement-foot">Pays for itself in about <strong>${years(ex.payback)}</strong>. Likely range ${gbp(Math.round(ex.money.low / 10) * 10)} to ${gbp(Math.round(ex.money.high / 10) * 10)} a year. Yours will differ.</p>
    </div>
  </div>
</section>

<section class="section section-grey">
  <div class="wrap">
    <div class="split-head">
      <div><p class="eyebrow">Installers</p><h2 class="section-title">Local installers, matched to your postcode.</h2></div>
      <a class="link-arrow" href="${esc(ctx.href('/installers'))}">See all installers</a>
    </div>
    <div class="installer-grid">${teaser.map((i) => installerCard(i, ctx, { compact: true })).join('')}</div>
    <p class="fine section-note">These are sample listings that show how installer cards will look. Real, checked partners replace them at launch.</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="split-head">
      <div><p class="eyebrow">Read before you buy</p><h2 class="section-title">Guides written to be useful, not to sell.</h2></div>
      <a class="link-arrow" href="${esc(ctx.href('/guides'))}">All guides</a>
    </div>
    <div class="guide-grid">
      ${guideCard(featured[0], ctx, 'guide-card-lead')}
      ${guideCard(featured[1], ctx)}
      ${guideCard(featured[2], ctx)}
    </div>
  </div>
</section>

<section class="section section-grey has-wave">
  <div class="wrap faq-layout">
    <div><p class="eyebrow">Still unsure?</p><h2 class="section-title">Straight answers.</h2><p class="section-sub">More in our <a href="${esc(ctx.href('/guides'))}">guides</a>, or <a href="${esc(ctx.href('/contact'))}">ask us</a>.</p></div>
    ${faqList(faqs, ctx)}
  </div>
  ${waveEdge('#ffd000')}
</section>

${ctaBand(ctx, {
  title: 'Ready to see what your roof is worth?',
  text: 'It takes about a minute, and you don’t need to enter an email to see your numbers.',
  href: '/solar-calculator',
  label: 'Compare solar now',
  alt: { href: '/for-installers', label: 'Run a solar company? Join as an installer' },
})}
`;
  return {
    title: SITE.name,
    description: 'Find out what solar panels could save you. Free UK calculator with every assumption shown, then up to three installer quotes, only if you ask.',
    bodyClass: 'page-home',
    body,
    scripts: ['/js/start.js'],
    config: installerConfig(ctx),
  };
}

// ---------------------------------------------------------------------------
// Calculator

export function calculator(ctx) {
  return {
    title: 'Solar savings calculator',
    description: 'Work out what solar panels could save you in three short steps: your roof, your home, your prices. Every assumption is shown and editable.',
    bodyClass: 'page-calc',
    body: `<section class="calc">
<div id="calc-root" data-calculator>
  <div class="wrap">
    <noscript><p class="note">The calculator needs JavaScript. If you can’t use it, <a href="${esc(ctx.href('/contact'))}">tell us</a> and we’ll help by email.</p></noscript>
    <p class="calc-loading">Loading the calculator…</p>
  </div>
</div></section>`,
    scripts: ['/js/calculator.js'],
    config: installerConfig(ctx),
  };
}

// ---------------------------------------------------------------------------
// Battery

export function batteryStorage(ctx) {
  const base = exampleResult({ panels: 10 });
  const high = exampleResult({ panels: 10, exportRate: 15 });
  const rows = (r) =>
    r.scenarios
      .map((s) => {
        const label = s.battery ? `Solar + ${s.battery} kWh battery` : 'Solar only';
        return `<tr><th scope="row">${label}</th><td>${gbp(s.cost.total)}</td><td>${gbp(s.money.saving)}</td><td>${years(s.payback)}</td><td>${gbp(s.net)}</td></tr>`;
      })
      .join('');
  const table = (r, caption) => `<div class="table-wrap"><table class="data-table"><caption>${caption}</caption><thead><tr><th scope="col">Option</th><th scope="col">Cost</th><th scope="col">Saves in year one</th><th scope="col">Pays back</th><th scope="col">25-year gain</th></tr></thead><tbody>${rows(r)}</tbody></table></div>`;
  const five = base.scenarios[1];
  const none = base.scenarios[0];
  const extraSaving = five.money.saving - none.money.saving;
  const extraCost = five.cost.total - none.cost.total;

  const body = `
${pageHead({
  eyebrow: 'Battery storage',
  title: 'Is a solar battery worth it? <span class="mark">Run the maths first.</span>',
  lede: 'A battery stores spare daytime solar for the evening. Whether that pays depends on how you use electricity and what you’re paid for exports. It doesn’t depend on a sales pitch.',
})}
<section class="section"><div class="wrap prose-wide">
  <h2>What the numbers say for a typical home</h2>
  <p>Here is the same house three ways: ${base.system.panels} panels (${kwp(base.system.kWp)}) on a south-facing London roof, a family where someone is home some days, using about ${num(base.demand.total)} kWh a year. The model is the same one that powers the calculator.</p>
  ${table(base, 'Export paid at 8p per kWh')}
  <p>A 5 kWh battery adds roughly <strong>${gbp(extraSaving)} a year</strong> to the saving for about <strong>${gbp(extraCost)}</strong> extra up front. That is a long payback, and it is the honest result for a household that doesn’t use much electricity in the evening.</p>
  <p>Now change one assumption. If the same home were paid 15p per kWh for exports:</p>
  ${table(high, 'Export paid at 15p per kWh')}
  <p>At 15p the same 5 kWh battery adds only about <strong>${gbp(high.scenarios[1].money.saving - high.scenarios[0].money.saving)} a year</strong>, down from ${gbp(extraSaving)}. The better your export payment, the less a battery adds, because each kWh you store is worth your electricity price minus what you’d have been paid to export it. Batteries look better the more you use after dark and the less you’re paid to export. They’re also where installers often earn the most margin, which is why you should see the maths for your own home before saying yes.</p>
</div></section>
<section class="section section-paper2"><div class="wrap">
  <p class="eyebrow">What decides it</p>
  <h2 class="section-title">Four things move a battery from “no” to “yes”.</h2>
  <ol class="steps-list steps-compact">
    <li><span class="step-n">01</span><div><h3>Evening and night use</h3><p>The more electricity you use after the sun has gone, the more a battery has to do. Electric cars charged at home and heat pumps change the picture a lot.</p></div></li>
    <li><span class="step-n">02</span><div><h3>Your export rate</h3><p>A battery lets you use solar yourself instead of selling it. If you’re paid little for exports, using it yourself is worth much more. If your tariff pays well, much less.</p></div></li>
    <li><span class="step-n">03</span><div><h3>A time-of-use tariff</h3><p>A battery can also charge from the grid when power is cheap. We don’t count that in the estimate, so for some households the real figure is better than ours.</p></div></li>
    <li><span class="step-n">04</span><div><h3>Warranty life</h3><p>Batteries are usually warranted for around ten years. We count a battery’s benefit for ${15} years and assume no replacement, so we don’t flatter it.</p></div></li>
  </ol>
</div></section>
<section class="section"><div class="wrap prose-wide">
  <h2>Already have solar panels?</h2>
  <p>You can usually add a battery to an existing system. How depends on your inverter: some can take a battery directly, others need a separate battery unit with its own inverter. Ask any installer to confirm compatibility with your inverter and whether the work is covered by the same certification as your original install, which matters for staying on a Smart Export Guarantee tariff.</p>
  <p>Our <a href="${esc(ctx.href('/guides/are-solar-batteries-worth-it'))}">guide to solar batteries</a> goes deeper, and <a href="${esc(ctx.href('/guides/how-to-compare-solar-quotes'))}">comparing quotes</a> covers what to check before you sign.</p>
</div></section>
${ctaBand(ctx, {
  title: 'Want battery quotes for your home?',
  text: 'Tell us about your existing system or your plans. Up to three installers covering your postcode will get in touch, and only because you asked.',
  href: '/battery-quote',
  label: 'Get battery quotes',
  alt: { href: '/solar-calculator', label: 'Or run the full solar calculator' },
})}`;
  return {
    title: 'Solar battery storage: is it worth it?',
    description: 'What a home battery really adds to solar savings, with worked numbers, the four things that decide it, and how to get up to three battery quotes.',
    body,
  };
}

const NAMES_PLACEHOLDER = 'the installers matched to your postcode (their names appear above once you enter it)';

export function batteryQuote(ctx) {
  const body = `
${pageHead({
  eyebrow: 'Battery quotes',
  title: 'Get battery quotes <span class="mark">for your home.</span>',
  lede: 'Add a battery to solar you already have, or plan one with new panels. Tell us a little about your setup and up to three installers covering your postcode will get in touch.',
})}
<section class="section form-section"><div class="wrap form-layout">
  <form class="form" data-form="battery" novalidate>
    <h2 class="form-title">About you</h2>
    ${field({ name: 'name', label: 'Full name', required: true, autocomplete: 'name' })}
    <div class="field-row">
      ${field({ name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email' })}
      ${field({ name: 'phone', label: 'Phone', type: 'tel', required: true, autocomplete: 'tel', inputmode: 'tel', hint: 'So installers can call you. We never ring you ourselves.' })}
    </div>
    ${field({ name: 'postcode', label: 'Postcode', required: true, autocomplete: 'postal-code', maxlength: 9 })}
    <div data-matched class="matched" hidden></div>
    <h2 class="form-title">About your setup</h2>
    ${field({ name: 'existing_solar', label: 'Do you have solar panels?', type: 'select', required: true, options: [['', 'Choose one'], ['yes', 'Yes, already installed'], ['planning', 'No, planning solar and a battery together'], ['no', 'No, battery only']] })}
    <div class="field-row">
      ${field({ name: 'system_kwp', label: 'Solar system size (kWp)', type: 'text', inputmode: 'decimal', hint: 'On your MCS certificate or inverter label, e.g. 4.0.' })}
      ${field({ name: 'inverter', label: 'Inverter make and model', hint: 'If you know it.' })}
    </div>
    <div class="field-row">
      ${field({ name: 'usage_kwh', label: 'Yearly electricity use (kWh)', inputmode: 'numeric', hint: 'From your bill or smart meter app.' })}
      ${field({ name: 'ev', label: 'Electric car?', type: 'select', options: [['no', 'No'], ['have', 'Yes, I have one'], ['plan', 'Planning one']] })}
    </div>
    <div class="field-row">
      ${field({ name: 'goal', label: 'Main reason for a battery', type: 'select', options: [['bills', 'Cut my bills'], ['tariff', 'Use a cheap time-of-use tariff'], ['backup', 'Backup during power cuts'], ['unsure', 'Not sure yet']] })}
      ${field({ name: 'battery_size', label: 'Battery size you have in mind', type: 'select', options: [['unsure', 'Not sure, advise me'], ['5', 'About 5 kWh'], ['10', 'About 10 kWh'], ['15plus', '15 kWh or more']] })}
    </div>
    ${field({ name: 'notes', label: 'Anything else installers should know?', type: 'textarea', rows: 4 })}
    ${honeypot()}
    ${consent({ html: quoteConsentHtml(ctx, NAMES_PLACEHOLDER) })}
    <p class="form-status" role="status" aria-live="polite" hidden></p>
    <button class="btn btn-lg" type="submit"><span>Send my details</span><span class="arrow" aria-hidden="true">→</span></button>
  </form>
  <aside class="form-aside">
    <h2>What happens next</h2>
    <ol class="plain-steps">
      <li>We pass your details to the installers named above and to nobody else.</li>
      <li>They may call, email or write to you about a battery quote. You can say no to any of them.</li>
      <li>Compare at least two quotes. Our <a href="${esc(ctx.href('/guides/how-to-compare-solar-quotes'))}">guide to comparing quotes</a> lists what to check.</li>
    </ol>
    <p class="fine">Not sure a battery is worth it? <a href="${esc(ctx.href('/battery-storage'))}">See the maths first</a>.</p>
  </aside>
</div></section>`;
  return {
    title: 'Get battery storage quotes',
    description: 'Request battery storage quotes from up to three installers covering your postcode. For existing solar systems or new installs. Free, no obligation.',
    body,
    scripts: ['/js/forms.js'],
    config: installerConfig(ctx),
  };
}

// ---------------------------------------------------------------------------
// Installers

export function installerDirectory(ctx) {
  const list = installers();
  const regionOptions = [['', 'All of the UK'], ...Object.entries(REGIONS).filter(([k]) => k !== 'uk').map(([k, v]) => [k, v.name])];
  const body = `
${pageHead({
  eyebrow: 'Installers',
  title: 'Find a solar installer <span class="mark">near you.</span>',
  lede: 'These are the installers we introduce homeowners to. Run the calculator first and we’ll pick up to three that cover your postcode, or browse and contact one directly.',
})}
<section class="section"><div class="wrap">
  <div class="filter-row">
    <label for="region-filter" class="eyebrow">Show installers covering</label>
    <select id="region-filter" data-region-filter>${regionOptions.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('')}</select>
    <p class="filter-count" data-filter-count aria-live="polite">${list.length} installers</p>
  </div>
  <div class="installer-grid" data-installer-grid>${list.map((i) => installerCard(i, ctx)).join('')}</div>
  <p class="empty-note" data-empty hidden>No installers cover that region yet. <a href="${esc(ctx.href('/contact'))}">Tell us</a> and we’ll look into it.</p>
</div></section>
<section class="section section-paper2"><div class="wrap prose-wide">
  <h2>What we ask of every installer</h2>
  <ul>
    <li>MCS certification for the work they quote, which a Smart Export Guarantee tariff requires.</li>
    <li>Membership of a consumer code such as RECC or HIES where it applies.</li>
    <li>Valid public liability insurance and an insurance-backed warranty or deposit protection.</li>
    <li>Written quotes with the make and model of panels, inverter and battery spelled out.</li>
  </ul>
  <p class="fine">These are the standards we apply to partners once they are signed up. The listings above are sample entries until then. Read <a href="${esc(ctx.href('/about'))}">how we work with installers and how we’re paid</a>.</p>
</div></section>
${ctaBand(ctx, {
  title: 'Not sure where to start?',
  text: 'Work out what solar is worth for your roof first, then ask for quotes with the numbers in hand.',
  href: '/solar-calculator',
  label: 'Run the calculator',
})}`;
  return {
    title: 'Solar installers across the UK',
    description: 'Browse the solar and battery installers we introduce homeowners to, filter by region, and request a quote or run the calculator first.',
    body,
    scripts: ['/js/directory.js'],
    config: installerConfig(ctx),
  };
}

export function installerProfile(ctx, slug) {
  const i = installerBySlug(slug);
  if (!i) return null;
  const regions = i.regions.map((r) => REGIONS[r]?.name).filter(Boolean);
  const body = `
${pageHead({
  eyebrow: i.demo ? 'Sample installer listing' : 'Installer',
  title: esc(i.name),
  lede: esc(i.tagline),
})}
<section class="section form-section"><div class="wrap form-layout">
  <div class="profile">
    ${i.demo ? `<aside class="note"><p><strong>This is a sample listing.</strong> It shows how installer pages will look. It isn’t a real company, and requests sent from this page are only stored for testing.</p></aside>` : ''}
    <h2>About</h2>
    <p>${esc(i.about)}</p>
    <h2>Covers</h2>
    <p>${esc(regions.join(', '))}</p>
    <h2>Services</h2>
    <ul class="tags">${i.services.map((s) => `<li>${esc(SERVICE_LABELS[s] || s)}</li>`).join('')}</ul>
    <h2>Accreditations</h2>
    <ul class="tags">${i.accreditations.map((a) => `<li class="tag-accred">${esc(a)}</li>`).join('')}</ul>
    <p class="fine">Accreditations are as stated by the installer and are checked against the MCS and consumer-code registers before an installer is listed as a partner. Always ask to see the certificate and check the register yourself.</p>
    <p><a class="link-arrow" href="${esc(ctx.href('/installers'))}">All installers</a></p>
  </div>
  <form class="form" data-form="quote" data-installer="${esc(i.slug)}" novalidate>
    <h2 class="form-title">Request a quote from ${esc(i.name)}</h2>
    ${field({ name: 'name', label: 'Full name', required: true, autocomplete: 'name' })}
    <div class="field-row">
      ${field({ name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email' })}
      ${field({ name: 'phone', label: 'Phone', type: 'tel', required: true, autocomplete: 'tel', inputmode: 'tel' })}
    </div>
    ${field({ name: 'postcode', label: 'Postcode', required: true, autocomplete: 'postal-code', maxlength: 9 })}
    ${field({ name: 'notes', label: 'Tell them about your roof or plans', type: 'textarea', rows: 4 })}
    ${honeypot()}
    ${consent({ html: quoteConsentHtml(ctx, esc(i.name)) })}
    <p class="form-status" role="status" aria-live="polite" hidden></p>
    <button class="btn btn-lg" type="submit"><span>Request a quote</span><span class="arrow" aria-hidden="true">→</span></button>
    <p class="fine">Want numbers first? <a href="${esc(ctx.href('/solar-calculator'))}">Run the calculator</a> and attach the result.</p>
  </form>
</div></section>`;
  return {
    title: `${i.name}: solar installer`,
    description: `${i.name} on ${SITE.name}: ${i.tagline}. See the areas covered, services and accreditations, and request a quote.`,
    body,
    scripts: ['/js/forms.js'],
    config: installerConfig(ctx),
  };
}

// ---------------------------------------------------------------------------
// For installers

export function forInstallers(ctx) {
  const body = `
${pageHead({
  eyebrow: 'For installers',
  title: 'Meet homeowners who have <span class="mark">already done the maths.</span>',
  lede: `${esc(SITE.name)} introduces your company to people who have used our calculator, know roughly what solar is worth to them and have asked for quotes.`,
})}
<section class="section"><div class="wrap two-col">
  <div class="prose">
    <h2>What you get</h2>
    <ul>
      <li><strong>Qualified introductions.</strong> Each lead arrives with the roof direction, pitch, size, shading, usage and our modelled savings, so your first call can start with a real conversation.</li>
      <li><strong>No crowded lead.</strong> A homeowner’s details go to no more than three installers, and only the named ones.</li>
      <li><strong>Consent on record.</strong> We store when and how the homeowner agreed to be contacted, and the exact wording they saw.</li>
      <li><strong>Fair rotation.</strong> Within your coverage area, introductions are shared out so the installer with the fewest recent leads is offered first.</li>
    </ul>
    <h2>What we ask</h2>
    <ul>
      <li>MCS certification for the work you quote.</li>
      <li>Membership of a consumer code such as RECC or HIES where relevant.</li>
      <li>Public liability insurance and an insurance-backed guarantee or deposit protection.</li>
      <li>Clear written quotes: kit by make and model, kWp, expected yearly generation and all costs.</li>
      <li>Prompt contact, in line with what we tell homeowners to expect.</li>
    </ul>
    <h2>Fees</h2>
    <p>Installers pay for introductions. Tell us your coverage area and monthly capacity and we’ll send our rate card. There’s no charge for a listing, and our fees never alter the numbers in a homeowner’s estimate. Read more about <a href="${esc(ctx.href('/about'))}">how we’re paid</a>.</p>
  </div>
  <form class="form" data-form="installer" novalidate>
    <h2 class="form-title">Apply to join</h2>
    ${field({ name: 'company', label: 'Company name', required: true, autocomplete: 'organization' })}
    ${field({ name: 'name', label: 'Your name', required: true, autocomplete: 'name' })}
    <div class="field-row">
      ${field({ name: 'email', label: 'Work email', type: 'email', required: true, autocomplete: 'email' })}
      ${field({ name: 'phone', label: 'Phone', type: 'tel', required: true, autocomplete: 'tel', inputmode: 'tel' })}
    </div>
    <div class="field-row">
      ${field({ name: 'mcs_number', label: 'MCS certificate number', required: true })}
      ${field({ name: 'consumer_code', label: 'Consumer code', type: 'select', options: [['', 'Choose one'], ['recc', 'RECC'], ['hies', 'HIES'], ['other', 'Other'], ['none', 'None']] })}
    </div>
    ${field({ name: 'areas', label: 'Postcode areas you cover', required: true, hint: 'For example: LS, BD, HG, YO' })}
    <div class="field-row">
      ${field({ name: 'capacity', label: 'Installs per month', inputmode: 'numeric' })}
      ${field({ name: 'website', label: 'Website', type: 'url', maxlength: 200, autocomplete: 'url' })}
    </div>
    ${field({ name: 'notes', label: 'Anything else we should know?', type: 'textarea', rows: 4 })}
    ${honeypot()}
    ${consent({ id: 'consent', html: `I agree that ${esc(SITE.name)} may contact me about this application. See the <a href="${esc(ctx.href('/privacy'))}">privacy notice</a>.` })}
    <p class="form-status" role="status" aria-live="polite" hidden></p>
    <button class="btn btn-lg" type="submit"><span>Send application</span><span class="arrow" aria-hidden="true">→</span></button>
  </form>
</div></section>`;
  return {
    title: 'For installers',
    description: `Join ${SITE.name} as a solar installer and get introduced to homeowners who have already worked out what solar is worth to them.`,
    body,
    scripts: ['/js/forms.js'],
  };
}

// ---------------------------------------------------------------------------
// Contact

export function contact(ctx) {
  const body = `
${pageHead({
  eyebrow: 'Contact',
  title: 'Ask us <span class="mark">anything.</span>',
  lede: 'Questions about your estimate, a quote request, your data or working with us. A person reads every message.',
})}
<section class="section form-section"><div class="wrap form-layout">
  <form class="form" data-form="contact" novalidate>
    ${field({ name: 'name', label: 'Your name', required: true, autocomplete: 'name' })}
    ${field({ name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email' })}
    ${field({ name: 'topic', label: 'What’s it about?', type: 'select', options: [['estimate', 'My estimate or the calculator'], ['quotes', 'A quote request'], ['data', 'My data (access, correction or deletion)'], ['installer', `Working with ${SITE.name} as an installer`], ['press', 'Press or partnerships'], ['other', 'Something else']] })}
    ${field({ name: 'message', label: 'Message', type: 'textarea', required: true, rows: 6 })}
    ${honeypot()}
    <p class="fine">We use what you send only to reply. See the <a href="${esc(ctx.href('/privacy'))}">privacy notice</a>.</p>
    <p class="form-status" role="status" aria-live="polite" hidden></p>
    <button class="btn btn-lg" type="submit"><span>Send message</span><span class="arrow" aria-hidden="true">→</span></button>
  </form>
  <aside class="form-aside">
    <h2>Other ways</h2>
    <dl class="contact-list">
      <dt>Email</dt><dd><a href="mailto:${esc(SITE.email)}">${esc(SITE.email)}</a></dd>
      <dt>Post</dt><dd>${esc(SITE.company)}<br>${esc(SITE.address)}</dd>
    </dl>
    <h2>Data requests</h2>
    <p>To see, correct or delete your data, or to withdraw consent for installers to contact you, pick “My data” above or email us. We’ll answer within a month, and we’ll tell the installers who hold your details.</p>
  </aside>
</div></section>`;
  return {
    title: 'Contact us',
    description: `Get in touch with ${SITE.name}: questions about your estimate, quote requests, your data or working with us.`,
    body,
    scripts: ['/js/forms.js'],
  };
}

// ---------------------------------------------------------------------------
// Thank you / 404

export function thankYou(ctx) {
  const body = `
<section class="page-head thanks"><div class="wrap">
  <p class="eyebrow">Request sent</p>
  <h1 data-thanks-title>Thanks, you’re <span class="mark">all set.</span></h1>
  <p class="lede" data-thanks-lede>We’ve passed your details on. Expect to hear from the installers shortly.</p>
</div></section>
<section class="section"><div class="wrap two-col">
  <div>
    <div data-thanks-ref class="thanks-ref" hidden></div>
    <h2>Who has your details</h2>
    <div data-thanks-installers class="installer-grid installer-grid-tight"><p class="fine">Installers matched to your postcode will appear here.</p></div>
    <div data-thanks-demo class="note" hidden><p><strong>Demo mode.</strong> This copy of the site isn’t connected to a server, so the request was saved only in this browser for testing.</p></div>
  </div>
  <div class="prose">
    <h2>What happens next</h2>
    <ol class="plain-steps">
      <li>The installers listed here may phone or email you, usually within a few working days. You can say no to any of them.</li>
      <li>Ask each for an itemised written quote: panel, inverter and battery make and model, size in kWp, expected yearly generation, and total cost.</li>
      <li>Get at least two quotes and compare them. Our <a href="${esc(ctx.href('/guides/how-to-compare-solar-quotes'))}">guide to comparing quotes</a> shows how.</li>
      <li>Want to change your mind or have your data deleted? <a href="${esc(ctx.href('/contact'))}">Contact us</a> and we’ll tell the installers.</li>
    </ol>
    <p><a class="link-arrow" href="${esc(ctx.href('/guides'))}">Read our guides while you wait</a></p>
  </div>
</div></section>`;
  return {
    title: 'Request sent',
    description: 'Your request has been sent.',
    body,
    noindex: true,
    scripts: ['/js/thanks.js'],
    config: installerConfig(ctx),
  };
}

export function notFound(ctx) {
  return {
    title: 'Page not found',
    description: 'That page doesn’t exist.',
    noindex: true,
    body: `${pageHead({ eyebrow: '404', title: 'That page isn’t <span class="mark">here.</span>', lede: 'The link may be old, or mistyped. Try one of these instead.' })}
<section class="section"><div class="wrap"><ul class="plain-list big-links">
  <li><a href="${esc(ctx.href('/'))}">Home</a></li>
  <li><a href="${esc(ctx.href('/solar-calculator'))}">Solar savings calculator</a></li>
  <li><a href="${esc(ctx.href('/installers'))}">Installers</a></li>
  <li><a href="${esc(ctx.href('/guides'))}">Guides</a></li>
  <li><a href="${esc(ctx.href('/contact'))}">Contact us</a></li>
</ul></div></section>`,
  };
}

export function getQuotes(ctx) {
  return {
    title: 'Get solar quotes',
    description: 'Answer a few quick questions and up to three installers covering your area will quote. Free, no obligation.',
    bodyClass: 'page-qf',
    body: `<section class="qf"><div class="wrap-narrow">
<div id="qf-root" data-quote-flow>
  <noscript><p class="note">This form needs JavaScript. You can <a href="${esc(ctx.href('/contact'))}">contact us</a> instead.</p></noscript>
</div></div></section>`,
    scripts: ['/js/quote-flow.js'],
    config: installerConfig(ctx),
  };
}
