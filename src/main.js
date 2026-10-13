import Lenis from 'lenis'

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- Lenis ---------- */
const lenis = new Lenis({ duration: 1.3, smoothWheel: !reduceMotion, anchors: { offset: -72 } })

/* ---------- Line reveals ---------- */
document.querySelectorAll('[data-lines]').forEach((el) => {
  ;[...el.children].forEach((span, i) => {
    const inner = document.createElement('span')
    inner.className = 'ln'
    inner.style.setProperty('--d', `${i * 90}ms`)
    while (span.firstChild) inner.appendChild(span.firstChild)
    span.appendChild(inner)
  })
})
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target) } }),
  { rootMargin: '0px 0px -12% 0px', threshold: 0.1 },
)
document.querySelectorAll('[data-lines], [data-reveal]').forEach((el) => {
  if (el.hasAttribute('data-reveal')) {
    const sibs = [...el.parentElement.querySelectorAll(':scope > [data-reveal]')]
    const i = sibs.indexOf(el)
    if (i > 0) el.style.setProperty('--d', `${Math.min(i, 8) * 80}ms`)
  }
  io.observe(el)
})
requestAnimationFrame(() => document.querySelectorAll('.hero [data-lines]').forEach((el) => el.classList.add('is-in')))

/* ---------- Counters ---------- */
const countIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return
    countIO.unobserve(e.target)
    const el = e.target, target = +el.dataset.count, prefix = el.dataset.prefix || ''
    const t0 = performance.now(), dur = 1400
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur), ease = 1 - Math.pow(1 - p, 3)
      el.textContent = prefix + Math.round(target * ease)
      if (p < 1) requestAnimationFrame(tick)
    }
    if (reduceMotion) el.textContent = prefix + target; else requestAnimationFrame(tick)
  })
}, { threshold: 0.6 })
document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el))

/* ---------- Nav theme follows the section under it ---------- */
const nav = document.querySelector('[data-nav]')
const themeIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) nav.classList.toggle('is-light', e.target.classList.contains('light')) })
}, { rootMargin: '-64px 0px -92% 0px', threshold: 0 })
document.querySelectorAll('main > section').forEach((s) => themeIO.observe(s))

/* ---------- Journey: lorry follows the road with scroll ---------- */
const journey = document.querySelector('[data-journey]')
const route = document.getElementById('route')
const lorry = document.querySelector('[data-lorry]')
const speedEl = document.querySelector('[data-speed]')
const tonnesEl = document.querySelector('[data-tonnes]')
const stageEl = document.querySelector('[data-stage]')
const captionEl = document.querySelector('[data-caption]')
const routeLen = route.getTotalLength()
const STAGES = [
  [0.00, 'Arriving', 'Drive in off Barkby Road. No booking needed for scrap.'],
  [0.28, 'Gate', "Tell the gate what you've got. Sorted loads go through quicker."],
  [0.46, 'Weighbridge', 'Onto the computerised bridge. You watch the number land.'],
  [0.62, 'Grading', "The yard grades what you've brought, metal by metal."],
  [0.82, 'Paid', 'Bank transfer sent the same day. Back out the way you came.'],
]
let lastStage = -1
const ease = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

function placeLorry(p) {
  const d = Math.max(0.5, Math.min(routeLen - 0.5, p * routeLen))
  const a = route.getPointAtLength(d), b = route.getPointAtLength(Math.min(routeLen, d + 2))
  const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
  lorry.setAttribute('transform', `translate(${a.x} ${a.y}) rotate(${ang})`)
}
placeLorry(0)

/* ---------- Scroll-linked ---------- */
const progress = document.querySelector('[data-progress]')
const hero = document.querySelector('[data-hero]')
const heroMedia = document.querySelector('[data-hero-media]')
const glow = document.querySelector('[data-glow]')
let lastY = 0

lenis.on('scroll', ({ scroll, limit, direction, velocity }) => {
  progress.style.transform = `scaleX(${limit ? scroll / limit : 0})`
  nav.classList.toggle('is-scrolled', scroll > 40)
  nav.classList.toggle('is-hidden', scroll > 200 && direction === 1 && scroll > lastY)
  lastY = scroll

  if (!reduceMotion && scroll < hero.offsetHeight) {
    heroMedia.style.transform = `translate3d(0, ${scroll * 0.3}px, 0)`
    glow.style.transform = `translate3d(${scroll * -0.1}px, ${scroll * -0.15}px, 0)`
  }

  // Journey progress: 0 when the section pins, 1 when it unpins
  const vh = window.innerHeight
  const top = journey.offsetTop, span = journey.offsetHeight - vh
  const p = Math.min(1, Math.max(0, (scroll - top) / span))
  placeLorry(ease(p))

  // HUD: speed from Lenis velocity, tonnes rise while on the bridge
  speedEl.textContent = String(Math.min(99, Math.round(Math.abs(velocity) * 0.9))).padStart(2, '0')
  const onBridge = Math.min(1, Math.max(0, (p - 0.4) / 0.2))
  tonnesEl.textContent = (onBridge * 26.0).toFixed(3)

  const i = STAGES.reduce((acc, s, idx) => (p >= s[0] ? idx : acc), 0)
  if (i !== lastStage) {
    lastStage = i
    stageEl.textContent = STAGES[i][1]
    captionEl.style.opacity = 0
    setTimeout(() => { captionEl.textContent = STAGES[i][2]; captionEl.style.opacity = 1 }, 200)
  }
})

function raf(t) { lenis.raf(t); requestAnimationFrame(raf) }
requestAnimationFrame(raf)

/* ---------- Service rows open on tap ---------- */
document.querySelectorAll('.row').forEach((row) => {
  row.addEventListener('click', () => {
    document.querySelectorAll('.row.is-open').forEach((r) => r !== row && r.classList.remove('is-open'))
    row.classList.toggle('is-open')
  })
})

document.querySelector('[data-year]').textContent = new Date().getFullYear()
{
  const d = new Date().getDay(), el = document.querySelector('[data-open]')
  el.textContent = d === 0 ? 'Closed today · Back Monday 07:30' : d === 6 ? 'Open today 07:30 — 11:30' : 'Open today 07:30 — 16:30'
}

/* ---------- Quote panel ---------- */
const BOOKING_ENDPOINT = '' // Formspree / Netlify / your own: POSTs JSON. Empty = pre-filled email.
const BOOKING_EMAIL = 'info@t-watts.com' // confirm with the yard

const flow = document.querySelector('[data-flow]')
if (flow) {
  const pc = flow.querySelector('[data-postcode]')
  const pcBtn = flow.querySelector('[data-postcode-check]')
  const pcOut = flow.querySelector('[data-postcode-result]')
  const sum = flow.querySelector('[data-summary]')
  const sumPc = flow.querySelector('[data-summary-pc]')
  const note = flow.querySelector('[data-book-note]')
  const date = flow.querySelector('[data-date]')
  let postcode = ''

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  date.min = tomorrow.toISOString().slice(0, 10)

  const chosen = () => {
    const s = flow.querySelector('[name="skip"]:checked'), w = flow.querySelector('[name="waste"]:checked')
    return { skip: `${s.value === 'RoRo' ? '20–30' : s.value} m³ ${s.dataset.name}`, waste: w.value }
  }
  const refresh = () => { const c = chosen(); sum.textContent = `${c.skip} · ${c.waste}` }
  flow.querySelectorAll('[name="skip"], [name="waste"]').forEach((i) => i.addEventListener('change', refresh))
  refresh()

  function checkPostcode() {
    const raw = pc.value.trim().toUpperCase().replace(/\s+/g, '')
    pcOut.className = 'panel__result mono'
    if (!/^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(raw)) {
      pcOut.textContent = 'That does not look like a full UK postcode.'; pcOut.classList.add('is-bad'); return
    }
    postcode = `${raw.slice(0, -3)} ${raw.slice(-3)}`
    sumPc.textContent = `Delivering to ${postcode}`
    if (/^LE\d{1,2}$/.test(raw.slice(0, -3))) { pcOut.textContent = `${postcode}: we deliver here, usually next working day.`; pcOut.classList.add('is-good') }
    else { pcOut.textContent = `${postcode} is outside our usual run. Send the request and we'll check.`; pcOut.classList.add('is-warn') }
  }
  pcBtn.addEventListener('click', checkPostcode)
  pc.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); checkPostcode() } })

  flow.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!flow.reportValidity()) return
    const d = Object.fromEntries(new FormData(flow).entries())
    const c = chosen()
    const lines = [`Skip: ${c.skip}`, `Waste: ${c.waste}`, `Postcode: ${postcode || 'not given'}`, `Date: ${d.date || 'flexible'}`,
      `On road: ${d.road ? 'yes, permit needed' : 'no'}`, `Name: ${d.name}`, `Phone: ${d.phone}`]
    if (BOOKING_ENDPOINT) {
      note.textContent = 'Sending…'
      try {
        const res = await fetch(BOOKING_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...d, ...c, postcode }) })
        note.textContent = res.ok ? `Thanks ${d.name.split(' ')[0]}. We'll ring ${d.phone} to confirm price and slot.` : 'Something went wrong. Please call 0116 266 7497.'
      } catch { note.textContent = 'Something went wrong. Please call 0116 266 7497.' }
      return
    }
    window.location.href = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(`Skip request: ${c.skip} (${c.waste}) to ${postcode || 'TBC'}`)}&body=${encodeURIComponent(lines.join('\n'))}`
    note.textContent = 'Opening your email app with the request filled in. Or just call.'
  })
}
