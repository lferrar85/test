import { TYPES, SIZES, SEALED, typeBy, sizeFor, sizeSlug, sizeTitle, coverSize, skipImg } from './data.js'

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const SITE = 'Watts Skip Hire & Scrap Metal, Leicester'

const crumbs = (items) => `<nav class="crumbs" aria-label="Breadcrumb">${items
  .map((it, i) => (i === items.length - 1 ? `<span aria-current="page">${esc(it[0])}</span>` : `<a href="${it[1]}">${esc(it[0])}</a>`))
  .join('<i aria-hidden="true">/</i>')}</nav>`

const typeChips = (active) => `<nav class="tabs" aria-label="Waste types">${TYPES.map((t) =>
  `<a class="tab${t.id === active ? ' is-on' : ''}" href="/skips/${t.slug}">${esc(t.name)}</a>`).join('')}</nav>`

export const typeCard = (t, i = 0) => {
  const cover = coverSize(t)
  const n = t.sizes.length
  return `<a class="card" href="/skips/${t.slug}" data-reveal data-cursor="View">
    ${t.badge ? `<span class="card__badge">${esc(t.badge)}</span>` : ''}
    <span class="card__img"><img src="${skipImg(t, cover)}" alt="A Watts skip ${t.id === 'empty' ? 'ready to load' : 'filled with ' + esc(t.name.toLowerCase())}" loading="${i < 4 ? 'eager' : 'lazy'}" /><img class="card__photo" src="/media/waste/${t.id}.jpg" alt="${esc(t.name)}, real photo" loading="lazy" onerror="this.remove()" /></span>
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
    </div></div>`,
  }
}

export function productPage(t, id) {
  const s = sizeFor(t, id)
  const sealed = id === 'sealed'
  const title = sealed ? 'Sealed asbestos container' : `${sizeTitle(s)} – ${t.name}`
  const others = t.sizes.filter((x) => x !== id)
  const spec = sealed
    ? [['Type', 'Closed, lockable container'], ['Approx. size', s.dims], ['Arranged', 'By phone, every time']]
    : [['Capacity', id === 'roro' ? `${s.m3} m³ (30–40 yard)` : `${s.yd} yard · ${s.m3} m³`], ['Approx. size (L × W × H)', s.dims], ['Holds roughly', `${s.bags} bin bags`], ['Best for', s.use]]
  return {
    title: `${title} | ${SITE}`,
    desc: `${title}, hired in Leicester. ${s.use} Get a price for your postcode.`,
    html: `<div class="inner"><div class="wrap">
      ${crumbs([['Home', '/'], ['Skips', '/skips'], [t.name, `/skips/${t.slug}`], [sealed ? 'Sealed container' : sizeTitle(s)]])}
      <div class="pdp">
        <div class="pdp__media"><img src="${skipImg(t, id)}" alt="${esc(title)}" /></div>
        <div class="pdp__info">
          <p class="kicker">${esc(t.name)} skip</p>
          <h1 class="pdp__title">${esc(title)}</h1>
          <p class="pdp__lead">${esc(t.about)}</p>
          <dl class="specs">${spec.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
          <div class="buy" data-buy>
            <p class="buy__title">${sealed ? 'Ring to arrange this one' : 'Get a price for your postcode'}</p>
            ${sealed ? '' : `<label class="buy__label" for="pc">Delivery postcode</label>
            <div class="buy__row"><input id="pc" type="text" autocomplete="postal-code" placeholder="LE4 9LG" maxlength="8" data-buy-pc /><button class="btn btn--dark" type="button" data-buy-check>Check</button></div>
            <p class="buy__msg" data-buy-msg aria-live="polite"></p>`}
            <button class="btn btn--blue btn--lg btn--full" type="button" data-quote data-qtype="${t.id}" data-qsize="${id}" data-buy-go>${sealed ? 'Request a call back' : 'Get a price'}</button>
            <a class="buy__tel" href="tel:+441162667497">Or call 0116 266 7497</a>
            <p class="buy__note">${sealed ? 'We confirm the container, the paperwork and a slot by phone.' : 'Prices depend on your postcode, the waste and any permit. We ring back with a price and a slot. Nothing is charged online.'}</p>
          </div>
        </div>
      </div>
      <div class="pdp__more">
        <section class="pdp__box"><h2>What goes in</h2>${yesno(t)}</section>
        <section class="pdp__box"><h2>Good to know</h2><ul class="know">
          <li><b>Don't overfill.</b> Keep waste level with the top: overloaded skips can't be lifted.</li>
          <li><b>On the road?</b> It needs a council permit. We arrange it and add it to the price.</li>
          <li><b>Not sure?</b> Ring before you load anything you're unsure about.</li>
        </ul></section>
      </div>
      ${others.length ? `<section class="pdp__others"><h2>Other ${esc(t.name.toLowerCase())} skips</h2><div class="cards cards--size" data-cards>${others.map((x, i) => sizeCard(t, x, i)).join('')}</div></section>` : ''}
    </div></div>`,
  }
}

export function notFound() {
  return { title: `Page not found | ${SITE}`, desc: '', html: `<div class="inner"><div class="wrap"><header class="page-head"><h1 class="h1">Page not found</h1><p class="page-head__lead">That page has moved or never existed. <a href="/skips">Browse our skips</a> or <a href="/">go home</a>.</p></header></div></div>` }
}

export { typeBy, sizeFor, TYPES, SIZES, SEALED, sizeSlug }
