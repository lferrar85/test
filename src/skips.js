/* Booking flow: postcode (quote panel) → waste type (quote grid) → size → book.
 * Set BOOKING_ENDPOINT to a form handler (Formspree, Netlify, your own) to
 * post bookings; without one, "Send" opens a pre-filled email instead. */
import { initQuote } from './quote.js'

const BOOKING_ENDPOINT = ''
const BOOKING_EMAIL = 'info@t-watts.com' // confirm with the yard

// Outward codes we deliver to: all LE (Leicester & Leicestershire)
const COVERED = /^LE\d{1,2}$/

export function initSkipFlow(lenis) {
  const flow = document.querySelector('[data-flow]')
  if (!flow) return

  const pcResult = document.querySelector('[data-postcode-result]')
  const radios = [...flow.querySelectorAll('[data-skip]')]
  const sumSkip = flow.querySelector('[data-summary-skip]')
  const sumMeta = flow.querySelector('[data-summary-meta]')
  const sumPc = flow.querySelector('[data-summary-postcode]')
  const sumWaste = flow.querySelector('[data-summary-waste]')
  const wasteSelect = flow.querySelector('[name="waste"]')
  const dateInput = flow.querySelector('[data-date]')
  const note = flow.querySelector('[data-book-note]')
  const steps = [...flow.querySelectorAll('[data-step]')]
  const wasteGrid = document.querySelector('[data-waste-grid]')

  let postcode = ''
  let wasteChosen = false

  const scrollTo = (el) => lenis.scrollTo(el, { offset: -96, duration: 1.1 })
  const goTo = (n) => scrollTo(steps[n - 1])

  /* Postcode (from the quote panel) */
  const normalise = (v) => v.trim().toUpperCase().replace(/\s+/g, '')
  const pretty = (v) => (v.length > 3 ? `${v.slice(0, -3)} ${v.slice(-3)}` : v)

  function checkPostcode(value) {
    const raw = normalise(value)
    const valid = /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(raw)
    pcResult.className = 'quote-panel__result'
    if (!valid) {
      pcResult.textContent = 'That does not look like a full UK postcode.'
      pcResult.classList.add('is-bad')
      return
    }
    postcode = pretty(raw)
    sumPc.textContent = `Delivering to ${postcode}`
    if (COVERED.test(raw.slice(0, -3))) {
      pcResult.textContent = `${postcode}: we deliver here, usually next working day. Now pick what's going in it.`
      pcResult.classList.add('is-good')
    } else {
      pcResult.textContent = `${postcode} is outside our usual run. Carry on and we'll check it when you book.`
      pcResult.classList.add('is-warn')
    }
    if (!wasteChosen) scrollTo(wasteGrid)
    else goTo(1)
  }

  /* Waste type (from the quote grid) */
  function chooseWaste(name) {
    wasteChosen = true
    const opt = [...wasteSelect.options].find((o) => o.value === name)
    if (opt) wasteSelect.value = name
    sumWaste.textContent = name
    goTo(1)
  }
  wasteSelect.addEventListener('change', () => { sumWaste.textContent = wasteSelect.value })

  initQuote({ onPostcode: checkPostcode, onWaste: chooseWaste })

  /* Size */
  function updateSummary() {
    const r = radios.find((x) => x.checked)
    if (!r) return
    const d = r.dataset
    sumSkip.textContent = `${d.m3} m³ ${d.name}`
    sumMeta.textContent = `≈ ${d.yd} yd · ${d.bags} bin bags · ${d.dims}`
  }
  radios.forEach((r) => r.addEventListener('change', () => { updateSummary(); goTo(2) }))
  updateSummary()

  /* Book */
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  dateInput.min = tomorrow.toISOString().slice(0, 10)

  flow.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!flow.reportValidity()) return
    const data = Object.fromEntries(new FormData(flow).entries())
    const r = radios.find((x) => x.checked)
    const skip = `${r.dataset.m3} m³ ${r.dataset.name}`
    const lines = [
      `Skip: ${skip}`,
      `Waste: ${data.waste}`,
      `Postcode: ${postcode || 'not given'}`,
      `Date: ${data.date || 'flexible'}`,
      `On road: ${data.road ? 'yes, permit needed' : 'no, private land'}`,
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
    ]

    if (BOOKING_ENDPOINT) {
      note.textContent = 'Sending…'
      try {
        const res = await fetch(BOOKING_ENDPOINT, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ...data, skip, postcode }),
        })
        note.textContent = res.ok
          ? `Thanks ${data.name.split(' ')[0]}: we'll ring ${data.phone} to confirm price and slot.`
          : 'Something went wrong sending that. Please call 0116 266 7497.'
      } catch {
        note.textContent = 'Something went wrong sending that. Please call 0116 266 7497.'
      }
      return
    }

    const subject = encodeURIComponent(`Skip booking: ${skip} (${data.waste}) to ${postcode || 'TBC'}`)
    const body = encodeURIComponent(lines.join('\n'))
    window.location.href = `mailto:${BOOKING_EMAIL}?subject=${subject}&body=${body}`
    note.textContent = 'Opening your email app with the booking filled in. Or just call us.'
  })
}
