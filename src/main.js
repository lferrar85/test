import Lenis from 'lenis'

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]

/* ---------- Data ---------- */
const TYPES = [
  { id: 'general', name: 'General waste', lead: 'House and office clear-outs.', yes: 'Bagged rubbish, furniture, cardboard, carpet, toys', no: 'Plasterboard, tyres, fridges, paint, gas bottles', c: '#4b5a6b' },
  { id: 'garden', name: 'Garden waste', lead: 'Green waste only.', yes: 'Grass, hedge cuttings, leaves, branches, shrubs', no: 'Soil-heavy loads, sleepers, bagged rubbish', c: '#2f7d32' },
  { id: 'muck', name: 'Soil & muck', lead: 'Muck away from digs.', yes: 'Topsoil, clay, turf, excavation spoil', no: 'Rubble mixed in, wood, rubbish', c: '#6b4a2e' },
  { id: 'inert', name: 'Inert waste', lead: 'Heavy and mixed, but nothing that rots.', yes: 'Bricks, concrete, stone, soil, tiles together', no: 'Wood, plasterboard, bags, plastics', c: '#a4522f' },
  { id: 'hardcore', name: 'Hardcore', lead: 'Clean rubble gets the best rate.', yes: 'Brick, concrete, block, stone, tiles', no: 'Soil, wood, plastic, anything soft', c: '#77746c' },
  { id: 'plasterboard', name: 'Plasterboard', lead: 'Kept separate by law.', yes: 'Plasterboard and gypsum offcuts only', no: 'Everything else', c: '#b9a77f', on: '#0b0f14' },
  { id: 'wood', name: 'Wood', lead: 'Recycled into chip and board.', yes: 'Timber, pallets, doors, fencing, flooring', no: 'Plasterboard, rubble, bags', c: '#b4733a' },
  { id: 'metal', name: 'Metal', lead: 'We pay you for this one.', yes: 'Steel, iron, copper, aluminium, cable, radiators', no: 'Gas bottles, sealed tanks', c: '#0777bf', badge: 'We pay' },
  { id: 'mixed', name: 'Mixed trade', lead: 'For builders and refits.', yes: 'Site and strip-out waste, mixed loads', no: 'Plasterboard, asbestos, liquids', c: '#e0602a', badge: 'Most hired' },
  { id: 'empty', name: 'Wait & load', lead: 'No room for a skip on site?', yes: 'We park up, you load, we take it straight away', no: 'Leaving it overnight', c: '#ffd400', on: '#0b0f14' },
  { id: 'asbestos', name: 'Asbestos', lead: 'Sealed, lockable container.', yes: 'Bagged and wrapped asbestos, by arrangement', no: 'Loose or unwrapped. Ring first, every time', c: '#c62a2a' },
]
const SIZES = [
  { v: '3', name: 'Mini', bags: '≈ 35 bags', dims: '1.8 × 1.3 × 1.0 m', img: 'size-3' },
  { v: '4', name: 'Midi', bags: '≈ 50 bags', dims: '2.4 × 1.4 × 1.1 m', img: 'size-4' },
  { v: '6', name: "Builder's", bags: '≈ 80 bags', dims: '3.4 × 1.7 × 1.2 m', img: 'size-6' },
  { v: '8', name: 'Large', bags: '≈ 100 bags', dims: '3.7 × 1.8 × 1.5 m', img: 'size-8' },
  { v: '12', name: 'Maxi', bags: '≈ 160 bags', dims: '4.1 × 1.8 × 1.8 m', img: 'size-12' },
  { v: '20+', name: 'Roll-on/off', bags: '400+ bags', dims: '6.1 × 2.4 × 1.9 m', img: 'size-roro' },
]
const img = (n) => `media/skips/${n}.webp`

/* ---------- Render cards ---------- */
$('[data-types]').innerHTML = TYPES.map((t, i) => `
  <button class="type" type="button" style="--c:${t.c};--on:${t.on || '#fff'}" data-type="${t.id}" data-reveal data-cursor="Quote">
    ${t.badge ? `<span class="type__badge">${t.badge}</span>` : ''}
    <span class="type__img"><img src="${img('skip-' + t.id)}" alt="A Watts skip ${t.id === 'empty' ? 'ready to load' : 'filled with ' + t.name.toLowerCase()}" loading="${i < 4 ? 'eager' : 'lazy'}" /></span>
    <span class="type__name">${t.name}</span>
    <span class="type__lead">${t.lead}</span>
    <span class="type__lists"><p class="yes"><b>✓</b>${t.yes}</p><p class="no"><b>✕</b>${t.no}</p></span>
    <span class="type__go">Get a price →</span>
  </button>`).join('')

$('[data-sizes]').innerHTML = SIZES.map((s) => `
  <button class="size" type="button" data-size="${s.v}" data-reveal data-cursor="Pick">
    <img src="${img(s.img)}" alt="${s.v} cubic metre ${s.name} skip, shown to scale" loading="lazy" />
    <strong>${s.v}<small>m³</small></strong>
    <span>${s.name}</span>
    <em>${s.bags} · ${s.dims}</em>
  </button>`).join('')

/* ---------- Lenis ---------- */
const lenis = new Lenis({ duration: 1.25, smoothWheel: !reduceMotion, anchors: { offset: -80 } })
function raf(t) { lenis.raf(t); requestAnimationFrame(raf) }
requestAnimationFrame(raf)

/* ---------- Hero ---------- */
const heroSection = $('[data-hero]')
const ghost = $('[data-ghost]')
const states = $$('[data-state]')
const hint = $('[data-hint]')
let heroState = 0
function onHeroProgress(p) {
  ghost.style.transform = `translate(calc(-50% + ${p * -18}vw), -100%)`
  const s = p > 0.55 ? 1 : 0
  if (s !== heroState) {
    heroState = s
    states.forEach((el, i) => { el.classList.toggle('is-on', i === s); el.setAttribute('aria-hidden', i !== s) })
  }
  hint.style.opacity = p > 0.05 ? 0 : 1
}
import('./hero.js')
  .then(({ initHero }) => initHero({ canvas: $('[data-hero-canvas]'), section: heroSection, onProgress: onHeroProgress, reduceMotion }))
  .catch(() => { $('[data-hero-fallback]').hidden = false; $('[data-hero-canvas]').remove() })

/* ---------- Nav, fab ---------- */
const nav = $('[data-nav]')
const fab = $('[data-fab]')
let lastY = 0
lenis.on('scroll', ({ scroll, direction }) => {
  const heroEnd = heroSection.offsetHeight - window.innerHeight
  nav.classList.toggle('is-solid', scroll > heroEnd - 40)
  nav.classList.toggle('is-hidden', scroll > heroEnd && direction === 1 && scroll > lastY)
  fab.classList.toggle('is-on', scroll > heroEnd + 200)
  lastY = scroll
})

/* ---------- Opening hours line ---------- */
{
  const d = new Date().getDay()
  $('[data-open]').textContent = d === 0 ? 'Closed today · Back Monday 07:30' : d === 6 ? 'Open today 07:30 – 11:30' : 'Open today 07:30 – 16:30'
}
$('[data-year]').textContent = new Date().getFullYear()

/* ---------- Split headings + reveals ---------- */
$$('[data-split]').forEach((h) => {
  h.innerHTML = h.textContent.trim().split(/\s+/).map((w, i) => `<span class="w"><span style="--d:${i * 70}ms">${w}</span></span>`).join(' ')
})
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -10% 0px' })
$$('[data-split], [data-reveal]').forEach((el) => {
  if (el.hasAttribute('data-reveal')) {
    const i = [...el.parentElement.children].indexOf(el)
    el.style.setProperty('--d', `${(i % 4) * 70}ms`)
  }
  io.observe(el)
})

/* ---------- Marquees (speed up with scroll velocity) ---------- */
const tape = $('[data-tape]')
const rows = $$('[data-row]').map((el) => {
  el.innerHTML += el.innerHTML // loop seamlessly
  return { el, dir: +el.dataset.row, x: 0 }
})
let tapeX = 0
function marquee() {
  const v = Math.min(Math.abs(lenis.velocity || 0), 40)
  if (!reduceMotion) {
    tapeX -= 0.7 + v * 0.18
    if (-tapeX >= tape.scrollWidth / 2) tapeX += tape.scrollWidth / 2
    tape.style.transform = `translateX(${tapeX}px)`
    rows.forEach((r) => {
      r.x -= (0.45 + v * 0.1) * r.dir
      const half = r.el.scrollWidth / 2
      if (r.x <= -half) r.x += half
      if (r.x > 0) r.x -= half
      r.el.style.transform = `translateX(${r.x}px)`
    })
  }
  requestAnimationFrame(marquee)
}
requestAnimationFrame(marquee)

/* ---------- Pointer effects ---------- */
if (finePointer && !reduceMotion) {
  const cur = $('.cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('[data-cursor-label]')
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y
  addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY })
  ;(function follow() {
    rx += (x - rx) * 0.18; ry += (y - ry) * 0.18
    dot.style.transform = `translate(${x}px, ${y}px)`
    ring.style.transform = `translate(${rx}px, ${ry}px)`
    requestAnimationFrame(follow)
  })()
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor], .hero__canvas')
    cur.classList.toggle('is-big', !!t)
    label.textContent = t ? (t.dataset.cursor || 'Drag') : ''
  })

  // magnetic buttons
  $$('[data-magnetic]').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect()
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`
    })
    b.addEventListener('pointerleave', () => (b.style.transform = ''))
  })

  // cards: colour flood from the pointer + tilt
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest('.type, [data-tilt]')
    if (!card) return
    const r = card.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height
    card.style.setProperty('--mx', `${px * 100}%`)
    card.style.setProperty('--my', `${py * 100}%`)
    card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 10}deg) translateY(-4px)`
  })
  document.addEventListener('pointerout', (e) => {
    const card = e.target.closest('.type, [data-tilt]')
    if (card && !card.contains(e.relatedTarget)) card.style.transform = ''
  })
}

/* ---------- Quote drawer ---------- */
const BOOKING_ENDPOINT = '' // Formspree / Netlify / own: POSTs JSON. Empty = pre-filled email.
const BOOKING_EMAIL = 'info@t-watts.com' // confirm with the yard

const drawer = $('[data-drawer]')
const flow = $('[data-flow]')
const dImg = $('[data-drawer-img]')
$('[data-chips]').innerHTML = TYPES.map((t, i) => `<label><input type="radio" name="waste" value="${t.id}" ${i === 0 ? 'checked' : ''} /><span>${t.name}</span></label>`).join('')
$('[data-size-chips]').innerHTML = SIZES.map((s) => `<label><input type="radio" name="size" value="${s.v}" ${s.v === '6' ? 'checked' : ''} /><span>${s.v} m³ ${s.name}</span></label>`).join('')

function swapImg(src) {
  if (dImg.getAttribute('src') === src) return
  dImg.classList.add('is-swap')
  setTimeout(() => { dImg.src = src; dImg.classList.remove('is-swap') }, 220)
}
function openQuote({ type, size } = {}) {
  if (type) $(`[name="waste"][value="${type}"]`, flow).checked = true
  if (size) $(`[name="size"][value="${size}"]`, flow).checked = true
  swapImg(img('skip-' + $('[name="waste"]:checked', flow).value))
  drawer.classList.add('is-open')
  drawer.setAttribute('aria-hidden', 'false')
  lenis.stop()
  setTimeout(() => $('[data-postcode]').focus(), 400)
}
function closeQuote() {
  drawer.classList.remove('is-open')
  drawer.setAttribute('aria-hidden', 'true')
  lenis.start()
}
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-type]'), s = e.target.closest('[data-size]')
  if (t) openQuote({ type: t.dataset.type })
  else if (s) openQuote({ size: s.dataset.size })
  else if (e.target.closest('[data-quote]')) openQuote()
  else if (e.target.closest('[data-close]')) closeQuote()
})
addEventListener('keydown', (e) => e.key === 'Escape' && drawer.classList.contains('is-open') && closeQuote())
flow.addEventListener('change', (e) => { if (e.target.name === 'waste') swapImg(img('skip-' + e.target.value)) })

const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
$('[data-date]').min = tomorrow.toISOString().slice(0, 10)

let postcode = ''
function checkPostcode() {
  const raw = $('[data-postcode]').value.trim().toUpperCase().replace(/\s+/g, '')
  const msg = $('[data-pc-msg]')
  if (!/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(raw)) { msg.className = 'field__msg bad'; msg.textContent = 'That does not look like a full UK postcode.'; return }
  postcode = `${raw.slice(0, -3)} ${raw.slice(-3)}`
  const local = /^LE\d{1,2}$/.test(raw.slice(0, -3))
  msg.className = 'field__msg ' + (local ? 'ok' : 'warn')
  msg.textContent = local ? `✓ We deliver to ${postcode}, usually next working day.` : `${postcode} is outside our usual run. Send it anyway and we'll check.`
}
$('[data-pc-check]').addEventListener('click', checkPostcode)
$('[data-postcode]').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); checkPostcode() } })

flow.addEventListener('submit', async (e) => {
  e.preventDefault()
  if (!flow.reportValidity()) return
  if (!postcode && $('[data-postcode]').value) checkPostcode()
  const d = Object.fromEntries(new FormData(flow).entries())
  const type = TYPES.find((t) => t.id === d.waste).name
  const size = SIZES.find((s) => s.v === d.size)
  const lines = [`Waste: ${type}`, `Size: ${size.v} m³ ${size.name}`, `Postcode: ${postcode || 'not given'}`, `Date: ${d.date || 'flexible'}`, `On road: ${d.road ? 'yes, permit needed' : 'no'}`, `Name: ${d.name}`, `Phone: ${d.phone}`]
  const note = $('[data-note]')
  if (BOOKING_ENDPOINT) {
    note.textContent = 'Sending…'
    try {
      const res = await fetch(BOOKING_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...d, type, size: size.v, postcode }) })
      note.textContent = res.ok ? `Thanks ${d.name.split(' ')[0]}, we'll ring ${d.phone} shortly.` : 'Something went wrong. Please call 0116 266 7497.'
    } catch { note.textContent = 'Something went wrong. Please call 0116 266 7497.' }
    return
  }
  location.href = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(`Skip quote: ${size.v} m³ ${type} to ${postcode || 'TBC'}`)}&body=${encodeURIComponent(lines.join('\n'))}`
  note.textContent = 'Opening your email app with everything filled in. Or just call us.'
})
