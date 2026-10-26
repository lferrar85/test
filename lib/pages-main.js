import { SITE } from './config.js';
import { esc, inline } from './markup.js';
import { installers, installerBySlug, publicInstaller, SERVICE_LABELS } from './installers.js';
import { REGIONS } from '../public/js/data.js';
import { ledgerHtml } from '../public/js/ledger.js';
import { gbp, kwp, num, years, pct } from '../public/js/format.js';
import { analyse } from '../public/js/model.js';
import { field, honeypot, consent, installerCard, faqList, guideCard, ctaBand, pageHead, exampleResult, quoteConsentHtml, checkList, houseSvg, waveEdge, ctaBlock, installerChecklist, nextSteps } from './ui.js';
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
<div class="film" data-film data-desktop='{"src":"${esc(ctx.asset('/img/film/d-%02d.webp'))}","count":6,"per":12,"w":1040,"h":698}' data-mobile='{"src":"${esc(ctx.asset('/img/film/m-%02d.webp'))}","count":4,"per":12,"w":640,"h":430}'>
  <div class="film-stage">
    <img class="film-poster" src="${esc(ctx.asset('/img/film/first.jpg'))}" width="1040" height="698" alt="Ray, a lynx in a camo cap and aviators, on a mustard backdrop" fetchpriority="high">
    <canvas class="film-canvas" aria-hidden="true"></canvas>
    <div class="film-shade" aria-hidden="true"></div>
    <div class="film-scenes">
      <section class="scene scene-a" data-from="0" data-to="0.3" aria-label="Introduction">
        <p class="eyebrow-dark">Solar, without the sales call</p>
        <h1>What’s your roof <span class="hi">worth?</span></h1>
        <p class="lede">Tell us where you live and which way your roof faces. We’ll work out what solar could save you, hour by hour, with every assumption on the table.</p>
        <div class="scene-actions">
          <a class="btn btn-lg" href="#start" data-skip-film><span>Start with my roof</span><span class="arrow" aria-hidden="true">→</span></a>
          <a class="btn btn-lg btn-glass" href="${esc(ctx.href('/get-quotes'))}"><span>Just want quotes?</span></a>
        </div>
        <p class="scroll-hint" aria-hidden="true"><span class="scroll-line"></span>Scroll</p>
      </section>
      <section class="scene scene-b" data-from="0.28" data-to="0.64" aria-label="How it works">
        <p class="eyebrow-dark">How it works</p>
        <ol class="promises" data-stagger>
          <li><span class="n">01</span><div><h2>Your roof, read properly</h2><p>Direction, pitch, space and shade: the things that actually change the answer.</p></div></li>
          <li><span class="n">02</span><div><h2>The maths, hour by hour</h2><p>Sun, your usage, an optional battery, and UK prices you can change.</p></div></li>
          <li><span class="n">03</span><div><h2>Quotes, only if you ask</h2><p>Up to three MCS-certified installers, named before you share anything.</p></div></li>
        </ol>
      </section>
      <section class="scene scene-c" data-from="0.62" data-to="1" data-hold id="start" aria-label="Start the calculator">
        <div class="hero-tool" data-mount="start">
          <div class="start-fallback">
            <p>Work out what solar could save you.</p>
            <a class="btn btn-lg btn-dark" href="${esc(ctx.href('/solar-calculator'))}"><span>Start the calculator</span><span class="arrow" aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>
    </div>
  </div>
</div>

<section class="dark manifesto">
  <div class="wrap">
    <p class="eyebrow-dark" data-rise>Manifesto</p>
    <p class="manifesto-text" data-reveal-words>Solar sales runs hot. Big numbers, no workings, and a surveyor on the phone before you’ve finished reading. <strong>We run the numbers first.</strong> An hour-by-hour model of your roof and your home, every assumption on the table, and <strong>up to three installers</strong> only when you say so. You see the bill. You decide. <strong>Nobody rings you from here.</strong></p>
    <ul class="ticker" aria-label="In short" data-rise>${['Workings shown', 'MCS installers', 'No sign-up', 'Free', 'Up to 3 quotes', 'Say no at any stage'].map((t) => `<li>${t}</li>`).join('')}</ul>
  </div>
</section>

<section class="dark paths">
  <div class="wrap">
    <div class="split-head" data-rise><div><p class="eyebrow-dark">Pick your path</p><h2 class="section-title">Four ways in.</h2></div><p class="dark-sub">Example numbers: 3-bed semi in London, south-facing roof, worked out by the same model as the calculator.</p></div>
    <div class="path-grid">
      <a class="path-card is-lead" href="${esc(ctx.href('/solar-calculator'))}" data-rise><span class="n">01</span><h3>Solar panels</h3><p>Saves about <strong>${gbp(ex.scenarios[0].money.saving)} a year</strong> in the example, and pays back in about ${years(ex.scenarios[0].payback)}.</p><ul class="chips-dark"><li>Hourly model</li><li>Every assumption editable</li></ul><span class="go">Run my numbers <span aria-hidden="true">→</span></span></a>
      <a class="path-card" href="${esc(ctx.href('/battery-storage'))}" data-rise><span class="n">02</span><h3>Solar and a battery</h3><p>About <strong>${gbp(ex.scenarios[1].money.saving)} a year</strong> in the example, with ${pct((ex.scenarios[1].flows.direct + ex.scenarios[1].flows.batt) / ex.scenarios[1].flows.demand)} of your electricity from the roof.</p><ul class="chips-dark"><li>Evening use</li><li>Costs more up front</li></ul><span class="go">See when it’s worth it <span aria-hidden="true">→</span></span></a>
      <a class="path-card" href="${esc(ctx.href('/battery-quote'))}" data-rise><span class="n">03</span><h3>A battery for solar you already have</h3><p>Tell us about your system and up to three installers quote for adding storage.</p><ul class="chips-dark"><li>Existing panels</li><li>Quotes only</li></ul><span class="go">Battery quotes <span aria-hidden="true">→</span></span></a>
      <a class="path-card" href="${esc(ctx.href('/get-quotes'))}" data-rise><span class="n">04</span><h3>Straight to quotes</h3><p>Nine quick questions, about a minute, then installers covering your postcode get in touch.</p><ul class="chips-dark"><li>About a minute</li><li>No obligation</li></ul><span class="go">Get quotes <span aria-hidden="true">→</span></span></a>
    </div>
  </div>
</section>

<section class="dark drop" data-drop data-from="${Math.round(ex.money.billBefore)}" data-to="${Math.round(ex.money.billBefore - ex.scenarios[0].money.saving)}" aria-label="Three steps">
  <div class="drop-sticky">
    <div class="wrap drop-grid">
      <div class="drop-left">
        <p class="eyebrow-dark">Three steps. No sales call.</p>
        <h2 class="section-title">Watch the bill drop.</h2>
        <p class="drop-label">Example electricity bill, a year</p>
        <p class="drop-num" data-drop-value>${gbp(ex.money.billBefore)}</p>
        <div class="drop-bar" aria-hidden="true"><span></span></div>
        <p class="drop-fine">From ${gbp(ex.money.billBefore)} to about ${gbp(ex.money.billBefore - ex.scenarios[0].money.saving)} with ${ex.system.panels} panels. Yours will differ: that is the point of asking.</p>
      </div>
      <div class="drop-cards">
        <article class="drop-card"><span class="n">01</span><p class="eyebrow-dark">Step one</p><h3>Tell us about your home</h3><p>Your postcode, which way the roof faces, how steep it is, how much room and shade there is, and who’s in during the day.</p></article>
        <article class="drop-card"><span class="n">02</span><p class="eyebrow-dark">Step two</p><h3>We run the numbers</h3><p>An hour-by-hour model of sun, your electricity use and an optional battery, with prices you can change.</p></article>
        <article class="drop-card"><span class="n">03</span><p class="eyebrow-dark">Step three</p><h3>See your savings. Then decide.</h3><p>An itemised before-and-after bill, when it pays for itself, and what it’s worth over 25 years. Quotes are optional.</p></article>
      </div>
    </div>
  </div>
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

<section class="dark outro">
  <div class="wrap outro-grid">
    <div class="outro-copy" data-rise>
      <p class="eyebrow-dark">The door is open</p>
      <h2 class="section-title">See what your roof is worth.</h2>
      <p class="dark-sub">About a minute. No email needed to see the answer, and nobody rings you.</p>
      <div class="scene-actions"><a class="btn btn-lg" href="#start" data-skip-film><span>Start with my roof</span><span class="arrow" aria-hidden="true">→</span></a><a class="link-arrow link-arrow-dark" href="${esc(ctx.href('/for-installers'))}">Run a solar company? Join as an installer</a></div>
    </div>
    <img class="outro-ray" src="${esc(ctx.asset('/img/ray.jpg'))}" width="680" height="644" alt="" loading="lazy">
    <p class="outro-giant" aria-hidden="true">Roofworth</p>
  </div>
</section>
`;
  return {
    title: SITE.name,
    description: 'Find out what solar panels could save you. Free UK calculator with every assumption shown, then up to three installer quotes, only if you ask.',
    bodyClass: 'page-home',
    body,
    scripts: ['/js/film.js'],
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
</div>
<template id="nx-tpl">${nextSteps(ctx)}</template></section>`,
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
<section class="section section-paper2" id="vetting"><div class="wrap">
  ${installerChecklist()}
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
    <h2>While you wait</h2>
    <ul>
      <li>The installers listed here may phone or email you, usually within a few working days. You can say no to any of them.</li>
      <li>Ask each for an itemised written quote: panel, inverter and battery make and model, size in kWp, expected yearly generation, and total cost. Our <a href="${esc(ctx.href('/guides/how-to-compare-solar-quotes'))}">guide to comparing quotes</a> shows how.</li>
      <li>Want to change your mind or have your data deleted? <a href="${esc(ctx.href('/contact'))}">Contact us</a> and we’ll tell the installers.</li>
    </ul>
    <p><a class="link-arrow" href="${esc(ctx.href('/guides'))}">Read our guides while you wait</a></p>
  </div>
</div></section>
${nextSteps(ctx)}`;
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
<div id="qf-root" data-quote-flow data-face="${esc(ctx.asset('/img/ray-face.jpg'))}">
  <noscript><p class="note">This form needs JavaScript. You can <a href="${esc(ctx.href('/contact'))}">contact us</a> instead.</p></noscript>
</div></div></section>`,
    scripts: ['/js/quote-flow.js'],
    config: installerConfig(ctx),
  };
}
