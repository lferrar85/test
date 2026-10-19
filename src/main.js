import Lenis from 'lenis'
import { TYPES, SIZES, SEALED, typeBy, sizeFor, sizeSlug } from './data.js'
import { homeTypes, skipsHub, typePage, productPage, notFound } from './pages.js'

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]

const lenis = new Lenis({ duration: 1.2, smoothWheel: !reduceMotion, anchors: { offset: -80 } })
const app = $('#app')
const nav = $('[data-nav]')
const fab = $('[data-fab]')
let tape = null, rows = [], tapeX = 0

/* ---------- Router ---------- */
function resolve(path) {
  const parts = path.replace(/\/+$/, '').split('/').filter(Boolean)
  if (!parts.length) return { page: 'home' }
  if (parts[0] !== 'skips') return { page: '404' }
  if (parts.length === 1) return { page: 'skips' }
  const t = typeBy(parts[1])
  if (!t) return { page: '404' }
  if (parts.length === 2) return { page: 'type', t }
  if (parts.length === 3) {
    const id = t.sizes.find((x) => (x === 'sealed' ? 'sealed-container' : x === 'roro' ? 'roll-on-roll-off' : sizeSlug(SIZES[x])) === parts[2])
    if (id) return { page: 'product', t, id }
  }
  return { page: '404' }
}

function build(r) {
  switch (r.page) {
    case 'home': {
      const html = $('#tpl-home').innerHTML
      return { title: 'Watts — Skip Hire & Scrap Metal, Leicester', desc: '', html }
    }
    case 'skips': return skipsHub()
    case 'type': return typePage(r.t)
    case 'product': return productPage(r.t, r.id)
    default: return notFound()
  }
}

function render(url, { push = false, scroll = true } = {}) {
  const u = new URL(url, location.origin)
  const r = resolve(u.pathname)
  const view = build(r)
  if (push) history.pushState({}, '', u.pathname + u.search + u.hash)
  app.innerHTML = view.html
  if (r.page === 'home') $('[data-types]').innerHTML = homeTypes()
  document.title = view.title
  document.body.dataset.page = r.page
  const meta = $('meta[name="description"]')
  if (meta && view.desc) meta.content = view.desc
  initPage(r)
  if (scroll) {
    if (u.hash && $(u.hash)) setTimeout(() => lenis.scrollTo($(u.hash), { offset: -90, duration: 1 }), 60)
    else lenis.scrollTo(0, { immediate: true })
  }
  updateNav(window.scrollY)
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]')
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button || a.target === '_blank') return
  const href = a.getAttribute('href')
  if (!href.startsWith('/') || href.startsWith('//')) return
  const u = new URL(href, location.origin)
  e.preventDefault()
  if (u.pathname === location.pathname && u.hash) { lenis.scrollTo($(u.hash), { offset: -90, duration: 1 }); history.pushState({}, '', href); return }
  app.classList.add('is-out')
  setTimeout(() => { app.classList.remove('is-out'); render(href, { push: true }) }, reduceMotion ? 0 : 180)
})
addEventListener('popstate', () => render(location.pathname + location.hash, { scroll: false }))

/* ---------- Per-page setup ---------- */
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px' })

function initPage(r) {
  $$('[data-split]', app).forEach((h) => {
    h.innerHTML = h.textContent.trim().split(/\s+/).map((w, i) => `<span class="w"><span style="--d:${i * 70}ms">${w}</span></span>`).join(' ')
  })
  $$('[data-split], [data-reveal]', app).forEach((el) => {
    if (el.hasAttribute('data-reveal')) {
      const i = [...el.parentElement.children].indexOf(el)
      el.style.setProperty('--d', `${(i % 4) * 60}ms`)
    }
    io.observe(el)
  })

  tape = $('[data-tape]', app)
  tapeX = 0
  rows = $$('[data-row]', app).map((el) => { el.innerHTML += el.innerHTML; return { el, dir: +el.dataset.row, x: 0 } })

  bindMagnetic(app)

  if (r.page === 'home') {
    const hint = $('[data-hint]', app)
    const d = new Date().getDay()
    $('[data-open]', app).textContent = d === 0 ? 'Closed today · Back Monday 07:30' : d === 6 ? 'Open today 07:30 – 11:30' : 'Open today 07:30 – 16:30'
    const onScroll = ({ scroll }) => { if (hint) hint.style.opacity = scroll > 40 ? 0 : 1 }
    window.__heroOff?.()
    window.__heroOff = lenis.on('scroll', onScroll)
  }
  if (r.page === 'product') initBuy()
}

function bindMagnetic(root) {
  if (!finePointer || reduceMotion) return
  $$('[data-magnetic]', root).forEach((b) => {
    if (b.dataset.mag) return
    b.dataset.mag = '1'
    b.addEventListener('pointermove', (e) => {
      const rc = b.getBoundingClientRect()
      b.style.transform = `translate(${(e.clientX - rc.left - rc.width / 2) * 0.25}px, ${(e.clientY - rc.top - rc.height / 2) * 0.3}px)`
    })
    b.addEventListener('pointerleave', () => (b.style.transform = ''))
  })
}

/* ---------- Nav + floating button ---------- */
function updateNav(scroll) {
  const hero = $('[data-hero]')
  const inner = !hero
  const heroEnd = hero ? hero.offsetHeight - 120 : 0
  nav.classList.toggle('is-solid', inner || scroll > heroEnd - 40)
  fab.classList.toggle('is-on', scroll > (inner ? 500 : heroEnd + 200))
}
let lastY = 0
lenis.on('scroll', ({ scroll, direction }) => {
  updateNav(scroll)
  const hero = $('[data-hero]')
  const heroEnd = hero ? hero.offsetHeight - 120 : 0
  nav.classList.toggle('is-hidden', scroll > heroEnd + 40 && direction === 1 && scroll > lastY)
  lastY = scroll
})
function raf(t) { lenis.raf(t); requestAnimationFrame(raf) }
requestAnimationFrame(raf)

$('[data-year]').textContent = new Date().getFullYear()

/* ---------- Marquees (speed up with scroll velocity) ---------- */
function marquee() {
  const v = Math.min(Math.abs(lenis.velocity || 0), 40)
  if (!reduceMotion) {
    if (tape) {
      tapeX -= 0.7 + v * 0.18
      if (-tapeX >= tape.scrollWidth / 2) tapeX += tape.scrollWidth / 2
      tape.style.transform = `translateX(${tapeX}px)`
    }
    rows.forEach((rw) => {
      rw.x -= (0.45 + v * 0.1) * rw.dir
      const half = rw.el.scrollWidth / 2
      if (rw.x <= -half) rw.x += half
      if (rw.x > 0) rw.x -= half
      rw.el.style.transform = `translateX(${rw.x}px)`
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
    const t = e.target.closest('[data-cursor]')
    cur.classList.toggle('is-big', !!t)
    label.textContent = t ? t.dataset.cursor : ''
  })
  document.addEventListener('pointermove', (e) => {
    const card = e.target.closest('[data-tilt]')
    if (!card) return
    const rc = card.getBoundingClientRect()
    const px = (e.clientX - rc.left) / rc.width, py = (e.clientY - rc.top) / rc.height
    card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 10}deg)`
  })
  document.addEventListener('pointerout', (e) => {
    const card = e.target.closest('[data-tilt]')
    if (card && !card.contains(e.relatedTarget)) card.style.transform = ''
  })
}
bindMagnetic(document)

/* ---------- Quote drawer ---------- */
const BOOKING_ENDPOINT = '' // Formspree / Netlify Forms / own: POSTs JSON. Empty = pre-filled email.
const BOOKING_EMAIL = 'info@t-watts.com' // confirm with the yard

const drawer = $('[data-drawer]')
const flow = $('[data-flow]')
const dImg = $('[data-drawer-img]')
const sizeLabel = (s) => (s.id === 'roro' ? 'Roll-on / roll-off' : `${s.yd} yard (${s.m3} m³) ${s.name}`)
$('[data-chips]').innerHTML = TYPES.map((t, i) => `<label><input type="radio" name="waste" value="${t.id}" ${i === 0 ? 'checked' : ''} /><span>${t.name}</span></label>`).join('')
$('[data-size-chips]').innerHTML = [...Object.values(SIZES), SEALED].map((s) => `<label><input type="radio" name="size" value="${s.id}" ${s.id === '8' ? 'checked' : ''} /><span>${s.id === 'sealed' ? 'Sealed container' : sizeLabel(s)}</span></label>`).join('')

function swapImg(src) {
  if (dImg.getAttribute('src') === src) return
  dImg.classList.add('is-swap')
  setTimeout(() => { dImg.src = src; dImg.classList.remove('is-swap') }, 220)
}
const coverOf = (id) => `/media/skips/skip-${id}.webp`
function openQuote({ type, size, postcode: pcv } = {}) {
  if (type) $(`[name="waste"][value="${type}"]`, flow).checked = true
  if (size) { const el = $(`[name="size"][value="${size}"]`, flow); if (el) el.checked = true }
  if (pcv) { $('[data-postcode]').value = pcv; checkPostcode() }
  swapImg(coverOf($('[name="waste"]:checked', flow).value))
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
  const q = e.target.closest('[data-quote]')
  if (q) openQuote({ type: q.dataset.qtype, size: q.dataset.qsize, postcode: $('[data-buy-pc]')?.value.trim() })
  else if (e.target.closest('[data-close]')) closeQuote()
})
addEventListener('keydown', (e) => e.key === 'Escape' && drawer.classList.contains('is-open') && closeQuote())
flow.addEventListener('change', (e) => { if (e.target.name === 'waste') swapImg(coverOf(e.target.value)) })

const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
$('[data-date]').min = tomorrow.toISOString().slice(0, 10)

let postcode = ''
function parsePostcode(value) {
  const raw = value.trim().toUpperCase().replace(/\s+/g, '')
  if (!/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(raw)) return null
  return { pretty: `${raw.slice(0, -3)} ${raw.slice(-3)}`, local: /^LE\d{1,2}$/.test(raw.slice(0, -3)) }
}
function checkPostcode() {
  const msg = $('[data-pc-msg]')
  const p = parsePostcode($('[data-postcode]').value)
  if (!p) { msg.className = 'field__msg bad'; msg.textContent = 'That does not look like a full UK postcode.'; return }
  postcode = p.pretty
  msg.className = 'field__msg ' + (p.local ? 'ok' : 'warn')
  msg.textContent = p.local ? `✓ We deliver to ${p.pretty}, usually next working day.` : `${p.pretty} is outside our usual run. Send it anyway and we'll check.`
}
$('[data-pc-check]').addEventListener('click', checkPostcode)
$('[data-postcode]').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); checkPostcode() } })

/* product page: postcode check lives in the page */
function initBuy() {
  const input = $('[data-buy-pc]'), msg = $('[data-buy-msg]'), btn = $('[data-buy-check]')
  if (!input) return
  const check = () => {
    const p = parsePostcode(input.value)
    if (!p) { msg.className = 'buy__msg bad'; msg.textContent = 'That does not look like a full UK postcode.'; return }
    input.value = p.pretty
    msg.className = 'buy__msg ' + (p.local ? 'ok' : 'warn')
    msg.textContent = p.local ? `✓ We deliver to ${p.pretty}, usually next working day.` : `${p.pretty} is outside our usual run. Send a request and we'll check.`
  }
  btn.addEventListener('click', check)
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); check() } })
}

flow.addEventListener('submit', async (e) => {
  e.preventDefault()
  if (!flow.reportValidity()) return
  if (!postcode && $('[data-postcode]').value) checkPostcode()
  const d = Object.fromEntries(new FormData(flow).entries())
  const type = TYPES.find((t) => t.id === d.waste).name
  const s = d.size === 'sealed' ? SEALED : SIZES[d.size]
  const size = d.size === 'sealed' ? 'Sealed asbestos container' : sizeLabel(s)
  const lines = [`Waste: ${type}`, `Size: ${size}`, `Postcode: ${postcode || 'not given'}`, `Date: ${d.date || 'flexible'}`, `On road: ${d.road ? 'yes, permit needed' : 'no'}`, `Name: ${d.name}`, `Phone: ${d.phone}`]
  const note = $('[data-note]')
  if (BOOKING_ENDPOINT) {
    note.textContent = 'Sending…'
    try {
      const res = await fetch(BOOKING_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...d, type, size, postcode }) })
      note.textContent = res.ok ? `Thanks ${d.name.split(' ')[0]}, we'll ring ${d.phone} shortly.` : 'Something went wrong. Please call 0116 266 7497.'
    } catch { note.textContent = 'Something went wrong. Please call 0116 266 7497.' }
    return
  }
  location.href = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(`Skip quote: ${size} (${type}) to ${postcode || 'TBC'}`)}&body=${encodeURIComponent(lines.join('\n'))}`
  note.textContent = 'Opening your email app with everything filled in. Or just call us.'
})

/* ---------- Go ---------- */
render(location.pathname + location.search + location.hash, { scroll: !!location.hash })
