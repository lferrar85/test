import Lenis from 'lenis'

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ---------- Lenis ---------- */
const lenis = new Lenis({
  duration: 1.25,
  smoothWheel: !reduceMotion,
  anchors: { offset: -80 }, // clear the fixed nav
})

/* ---------- Elements ---------- */
const nav = document.querySelector('[data-nav]')
const hero = document.querySelector('[data-hero]')
const heroMedia = document.querySelector('[data-hero-media]')
const ghost = document.querySelector('[data-ghost]')
const ghostFooter = document.querySelector('[data-ghost-footer]')
const marqueeTrack = document.querySelector('[data-marquee-track]')
const ticket = document.querySelector('[data-ticket]')
const ticketValue = document.querySelector('[data-ticket-value]')
const ticketPct = document.querySelector('[data-ticket-pct]')

document.querySelector('[data-year]').textContent = new Date().getFullYear()

/* ---------- Scroll-linked effects ---------- */
let lastScroll = 0
let marqueeX = 0
let marqueeHalf = 0

function measure() {
  // Track holds two identical runs; loop at the halfway point.
  marqueeHalf = marqueeTrack.scrollWidth / 2
}
measure()
window.addEventListener('resize', measure)

lenis.on('scroll', ({ scroll, limit, velocity, direction }) => {
  const heroH = hero.offsetHeight

  // Hero: media parallax + ghost text drifting the other way
  if (scroll < heroH && !reduceMotion) {
    heroMedia.style.transform = `translate3d(0, ${scroll * 0.35}px, 0)`
    ghost.style.transform = `translate3d(${scroll * -0.15}px, ${scroll * 0.2}px, 0)`
  }

  // Nav hides on scroll down, returns on scroll up
  if (scroll > 120 && direction === 1 && scroll > lastScroll) nav.classList.add('is-hidden')
  else nav.classList.remove('is-hidden')
  lastScroll = scroll

  // Weighbridge ticket: scroll depth as tonnes
  const pct = limit > 0 ? scroll / limit : 0
  ticket.classList.toggle('is-visible', scroll > heroH * 0.5)
  ticketValue.textContent = (pct * 26).toFixed(3) // 26 t = a full articulated load
  ticketPct.textContent = Math.round(pct * 100)

  // Footer ghost: slides up as it enters
  if (ghostFooter && !reduceMotion) {
    const r = ghostFooter.getBoundingClientRect()
    const vh = window.innerHeight
    const t = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)))
    ghostFooter.style.transform = `translate3d(0, ${(1 - t) * 30}%, 0)`
  }
})

/* ---------- RAF loop ---------- */
function raf(time) {
  lenis.raf(time)

  // Marquee: constant drift, sped up by scroll velocity
  if (!reduceMotion && marqueeHalf) {
    const v = Math.min(Math.abs(lenis.velocity), 60)
    marqueeX -= 0.6 + v * 0.12
    if (marqueeX <= -marqueeHalf) marqueeX += marqueeHalf
    marqueeTrack.style.transform = `translate3d(${marqueeX}px, 0, 0)`
  }

  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

/* ---------- Reveal on enter ---------- */
const reveals = document.querySelectorAll('[data-reveal]')
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('is-in')
      io.unobserve(entry.target)
    })
  },
  { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
)

// Stagger siblings that reveal together
reveals.forEach((el) => {
  const siblings = [...el.parentElement.querySelectorAll(':scope > [data-reveal]')]
  const i = siblings.indexOf(el)
  if (i > 0) el.style.setProperty('--delay', `${Math.min(i, 8) * 70}ms`)
  io.observe(el)
})
