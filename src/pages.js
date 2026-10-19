import { TYPES, SIZES, SEALED, typeBy, sizeFor, sizeSlug, sizeTitle, coverSize, skipImg } from './data.js'

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const SITE = 'Watts Skip Hire & Scrap Metal, Leicester'

const crumbs = (items) => `<nav class="crumbs" aria-label="Breadcrumb">${items
  .map((it, i) => (i === items.length - 1 ? `<span aria-current="page">${esc(it[0])}</span>` : `<a href="${it[1]}">${esc(it[0])}</a>`))
  .join('<i aria-hidden="true">/</i>')}</nav>`

const typeChips = (active) => `<nav class="tabs" aria-label="Waste types">${TYPES.map((t) =>
  `<a class="tab${t.id === active ? ' is-on' : ''}" href="/skips/${t.slug}">${esc(t.name)}</a>`).join('')}</nav>`

const photoOr = (t, render, alt, eager) => `<img class="is-photo" src="/media/waste/${t.id}.jpg" alt="${esc(alt)}" loading="${eager ? 'eager' : 'lazy'}" onerror="this.onerror=null;this.classList.remove('is-photo');this.src='${render}'" />`

export const typeCard = (t, i = 0) => {
  const cover = coverSize(t)
  const n = t.sizes.length
  const alt = `A Watts skip ${t.id === 'empty' ? 'ready to load' : 'filled with ' + t.name.toLowerCase()}`
  return `<a class="card" href="/skips/${t.slug}" data-reveal data-cursor="View">
    ${t.badge ? `<span class="card__badge">${esc(t.badge)}</span>` : ''}
    <span class="card__img">${photoOr(t, skipImg(t, cover), alt, i < 4)}</span>
    <span class="card__body">
      <strong class="card__name">${esc(t.name)}</strong>
      <span class="card__lead">${esc(t.lead)}</span>
      <span class="card__meta">${t.id === 'asbestos' ? 'By arrangement' : n === 1 ? '1 size' : `${n} sizes`}</span>
      <span class="card__go">View skips <b aria-hidden="true">→</b></span>
    </span>
  </a>`
}

const sizeCard = (t, id, i) => {
  const s = sizeFor(t, id)
  return `<a class="card card--size" href="/skips/${t.slug}/${id === 'sealed' ? 'sealed-container' : sizeSlug(s)}" data-reveal data-cursor="View">
    <span class="card__img"><img src="${skipImg(t, id)}" alt="${esc(id === 'sealed' ? 'Sealed asbestos container' : sizeTitle(s))}, ${esc(t.name.toLowerCase())}" loading="${i < 3 ? 'eager' : 'lazy'}" /></span>
    <span class="card__body">
      <strong class="card__name">${id === 'sealed' ? 'Sealed asbestos container' : esc(sizeTitle(s))}</strong>
      <span class="card__lead">${esc(t.name)}${id === 'sealed' ? '' : ` · ${s.m3} m³`}</span>
      <span class="card__meta">${id === 'sealed' ? 'Arranged by phone' : `≈ ${s.bags} bin bags · ${esc(s.dims)}`}</span>
      <span class="card__go">View skip <b aria-hidden="true">→</b></span>
    </span>
  </a>`
}

const yesno = (t) => `<div class="yn">
  <div class="yn__col yn__col--yes"><h3>Can go in</h3><ul>${t.yes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
  <div class="yn__col yn__col--no"><h3>Can't go in</h3><ul>${t.no.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
</div>`

const acc = (items) => `<div class="acc">${items.map(([q, a, open]) => `<details${open ? ' open' : ''}><summary>${esc(q)}</summary><div class="acc__body">${a}</div></details>`).join('')}</div>`
const list = (xs) => `<ul class="plain">${xs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`

const typeFaq = (t) => [
  [`What can I put in a ${t.name.toLowerCase()} skip?`, list(t.yes)],
  [`What can't I put in a ${t.name.toLowerCase()} skip?`, list(t.no)],
  [`Which size ${t.name.toLowerCase()} skip do I need?`, t.sizes.includes('sealed') ? '<p>Asbestos is arranged by phone, and we choose the container to suit the job. Ring us on 0116 266 7497.</p>' : `<p>${t.sizes.filter((x) => x !== 'roro').map((x) => `A <b>${SIZES[x].yd} yard</b> (${SIZES[x].m3} m³) skip suits ${SIZES[x].use.charAt(0).toLowerCase() + SIZES[x].use.slice(1)}`).join('<br/>')}</p>`],
  ['Can the skip go on the road?', '<p>Yes, with a council permit. We arrange it for you and add it to the price: tick the box on your quote request.</p>'],
]

const FAQ = [
  ['How full can I fill the skip?', 'Level with the top, and no higher. Anything sticking out above the sides is unsafe on the road and the driver can refuse to lift it, so pile heavy items low and fill the gaps with lighter waste.'],
  ['Can the skip go on the road?', 'Yes, with a council permit. We arrange this and add it to the price: tick the box on your quote request and we will sort it.'],
  ['What can never go in a skip?', 'Asbestos (it needs its own sealed container), gas bottles, paint and chemicals, tyres, fridges and freezers, batteries and liquids. If you are unsure, ring us before you load.'],
  ['What do the sizes mean?', 'Skip sizes are quoted in yards (a cubic yard is roughly 0.76 m³). Bin-bag counts are a rough guide only, because a bag of rubble and a bag of cushions are very different.'],
  ['Do you collect scrap metal?', 'Yes. Most people drive in and go over the weighbridge, and we pay by bank transfer the same day. For larger loads, vehicles or anything that needs dismantling, we will come to you.'],
  ['How quickly can I get one?', 'We aim for next working day to LE postcodes, subject to availability. Give us a ring and we will confirm a slot.'],
]

const faq = () => `<section class="faq" id="faq"><div class="wrap faq__grid">
  <div><p class="kicker">Skip hire FAQs</p><h2 class="h2 h2--m" data-split>Before you book</h2></div>
  <div class="faq__list">${FAQ.map(([q, a]) => `<details data-reveal><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
</div></section>`

/* ---------- Pages ---------- */
export function homeTypes() {
  return TYPES.map((t, i) => typeCard(t, i)).join('')
}

export function skipsHub() {
  const scale = ['4', '5', '8', '10', '16', 'roro']
  return {
    title: `Skip hire in Leicester | ${SITE}`,
    desc: 'Skip hire in Leicester for every kind of waste, from 4 to 16 yard skips and roll-on/roll-off. Choose your waste type, pick a size, and we deliver.',
    html: `<div class="inner">
      <div class="wrap">
        ${crumbs([['Home', '/'], ['Skips']])}
        <header class="page-head"><h1 class="h1" data-split>Skip hire in Leicester</h1>
          <p class="page-head__lead">Choose the waste you're throwing away, then pick a size. Sorted waste is cheaper to take, so it pays to keep plasterboard, soil and hardcore separate.</p></header>
        <div class="cards" data-cards>${homeTypes()}</div>
      </div>
      <section class="sizes-guide" id="sizes"><div class="wrap">
        <header class="page-head page-head--s"><p class="kicker">Skip size guide</p><h2 class="h2 h2--m" data-split>Mini to massive</h2>
          <p class="page-head__lead">Every skip below is drawn at its true size next to the others. Bag counts are rough, based on standard bin bags.</p></header>
        <div class="scale">${scale.map((id) => { const s = SIZES[id]; return `<div class="scale__item" data-reveal>
          <img src="${id === 'roro' ? '/media/skips/size-roro.webp' : `/media/skips/size-${s.m3}.webp`}" alt="${esc(sizeTitle(s))}, to scale" loading="lazy" />
          <strong>${id === 'roro' ? 'Roll-on/off' : `${s.yd} yard`}</strong><span>${s.m3} m³ · ${esc(s.name)}</span><em>≈ ${s.bags} bags</em></div>` }).join('')}</div>
      </div></section>
      ${faq()}
    </div>`,
  }
}

export function typePage(t) {
  return {
    title: `${t.name} skips | ${SITE}`,
    desc: `${t.name} skip hire in Leicester. ${t.about}`,
    html: `<div class="inner"><div class="wrap">
      ${crumbs([['Home', '/'], ['Skips', '/skips'], [t.name]])}
      <header class="page-head"><h1 class="h1" data-split>${esc(t.name)} skips</h1>
        <p class="page-head__lead">${esc(t.about)}</p></header>
      ${typeChips(t.id)}
      <div class="tp">
        <div class="cards cards--size" data-cards>${t.sizes.map((id, i) => sizeCard(t, id, i)).join('')}</div>
        <aside class="tp__side"><h2>What goes in a ${esc(t.name.toLowerCase())} skip</h2>${yesno(t)}
          <p class="tp__call">Not sure which skip you need? <a href="tel:+441162667497">Ring 0116 266 7497</a> and we'll talk it through.</p></aside>
      </div>
      <section class="seo"><h2>${esc(t.name)} skips in Leicester</h2>
        <p>${esc(t.about)} We deliver across Leicester and Leicestershire from our yard on Barkby Road, usually the next working day. Prices depend on your postcode and any permit, so enter yours on the skip page or give us a ring.</p>
        <h3>Frequently asked questions</h3>${acc(typeFaq(t))}</section>
    </div></div>`,
  }
}

export function productPage(t, id) {
  const s = sizeFor(t, id)
  const sealed = id === 'sealed'
  const title = sealed ? 'Sealed asbestos container' : `${sizeTitle(s)} – ${t.name}`
  const others = t.sizes.filter((x) => x !== id)
  const sameSize = TYPES.filter((x) => x.id !== t.id && x.sizes.includes(id)).slice(0, 3)
  const spec = sealed
    ? [['Type', 'Closed, lockable container'], ['Approx. size', s.dims], ['Arranged', 'By phone, every time']]
    : [['Capacity', id === 'roro' ? `${s.m3} m³ (30–40 yard)` : `${s.yd} yard · ${s.m3} m³`], ['Approx. size (L × W × H)', s.dims], ['Holds roughly', `${s.bags} bin bags`], ['Best for', s.use]]
  const ticks = sealed
    ? ['Arranged by phone with the paperwork sorted', 'Closed, lockable container with hazard label', 'Licensed to take asbestos by arrangement']
    : ['Delivered next working day to LE postcodes', 'Council permits arranged for roadside skips', 'We ring back with a price and a slot. Nothing is charged online']
  return {
    title: `${title} | ${SITE}`,
    desc: `${title}, hired in Leicester. ${s.use} Get a price for your postcode.`,
    html: `<div class="inner"><div class="wrap">
      ${crumbs([['Home', '/'], ['Skips', '/skips'], [t.name, `/skips/${t.slug}`], [sealed ? 'Sealed container' : sizeTitle(s)]])}
      <div class="pdp">
        <div class="pdp__media"><img class="is-render" src="${skipImg(t, id)}" alt="${esc(title)}" />
          <img class="pdp__photo is-photo" src="/media/waste/${t.id}.jpg" alt="${esc(t.name)}, real photo" onerror="this.remove()" /></div>
        <div class="pdp__info">
          <h1 class="pdp__title">${esc(title)}</h1>
          <p class="pdp__from">${sealed ? 'Price on request' : 'Price from your postcode'}</p>
          <div class="buy" data-buy>
            <p class="buy__title">${sealed ? 'Asbestos is arranged by phone. Please ring us, or request a call back.' : 'Pricing and availability depend on your location. Please enter your postcode for an accurate price.'}</p>
            ${sealed ? '' : `<div class="buy__row"><input id="pc" type="text" aria-label="Delivery postcode" autocomplete="postal-code" placeholder="E.G LE4 9LG" maxlength="8" data-buy-pc /><button class="btn btn--yellow" type="button" data-buy-check>Check</button></div>
            <p class="buy__msg" data-buy-msg aria-live="polite"></p>`}
          </div>
          <ul class="ticks">${ticks.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          <div class="pdp__cta">
            <button class="btn btn--blue btn--lg" type="button" data-quote data-qtype="${t.id}" data-qsize="${id}" data-buy-go>${sealed ? 'Request a call back' : 'Get a price'}</button>
            <a class="buy__tel" href="tel:+441162667497">Or call 0116 266 7497</a>
          </div>
          ${acc([
            [`What can I put in my skip?`, yesno(t), true],
            ['Skip size', `<dl class="specs specs--in">${spec.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`],
            ['Permits and placing the skip', '<p>On your own land you can put a skip anywhere it fits. On the road it needs a council permit, which we arrange and add to the price. Tick the box on your quote request and we will sort it.</p>'],
            ['How full can I fill it?', '<p>Level with the top, never higher. An overloaded skip cannot be lifted safely, and the driver can refuse to take it. Put heavy items low and fill the gaps with lighter waste.</p>'],
          ])}
        </div>
      </div>
      ${others.length ? `<section class="pdp__others"><h2>You may also like</h2><div class="cards cards--size" data-cards>${others.map((x, i) => sizeCard(t, x, i)).join('')}</div></section>` : ''}
      ${sameSize.length ? `<section class="pdp__others"><h2>Other waste types in ${sealed ? 'this size' : esc(sizeTitle(s))}</h2><div class="cards cards--size" data-cards>${sameSize.map((x, i) => sizeCard(x, id, i)).join('')}</div></section>` : ''}
    </div></div>`,
  }
}

export function notFound() {
  return { title: `Page not found | ${SITE}`, desc: '', html: `<div class="inner"><div class="wrap"><header class="page-head"><h1 class="h1">Page not found</h1><p class="page-head__lead">That page has moved or never existed. <a href="/skips">Browse our skips</a> or <a href="/">go home</a>.</p></header></div></div>` }
}

export { typeBy, sizeFor, TYPES, SIZES, SEALED, sizeSlug }
