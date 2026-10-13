/* Skip hire flow: postcode → pick → book.
 * Set BOOKING_ENDPOINT to a form handler (Formspree, Netlify, your own) to
 * post bookings; without one, "Send" opens a pre-filled email instead. */
const BOOKING_ENDPOINT = ''
const BOOKING_EMAIL = 'info@t-watts.com' // confirm with the yard

// Outward codes we deliver to: all LE (Leicester & Leicestershire)
const COVERED = /^LE\d{1,2}$/

export function initSkipFlow(lenis) {
  const flow = document.querySelector('[data-flow]')
  if (!flow) return

  const pcInput = flow.querySelector('[data-postcode]')
  const pcCheck = flow.querySelector('[data-postcode-check]')
  const pcResult = flow.querySelector('[data-postcode-result]')
  const radios = [...flow.querySelectorAll('[data-skip]')]
  const sumSkip = flow.querySelector('[data-summary-skip]')
  const sumMeta = flow.querySelector('[data-summary-meta]')
  const sumPc = flow.querySelector('[data-summary-postcode]')
  const dateInput = flow.querySelector('[data-date]')
  const note = flow.querySelector('[data-book-note]')
  const steps = [...flow.querySelectorAll('[data-step]')]

  let postcode = ''

  const goTo = (n) => {
    const el = steps[n - 1]
    el.classList.add('is-active')
    lenis.scrollTo(el, { offset: -96, duration: 1.1 })
  }

  /* Step 1: postcode */
  const normalise = (v) => v.trim().toUpperCase().replace(/\s+/g, '')
  const pretty = (v) => (v.length > 3 ? `${v.slice(0, -3)} ${v.slice(-3)}` : v)

  function checkPostcode() {
    const raw = normalise(pcInput.value)
    const valid = /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(raw)
    pcResult.className = 'postcode__result'
    if (!valid) {
      pcResult.textContent = 'That does not look like a full UK postcode.'
      pcResult.classList.add('is-bad')
      return
    }
    postcode = pretty(raw)
    sumPc.textContent = `Delivering to ${postcode}`
    if (COVERED.test(raw.slice(0, -3))) {
      pcResult.textContent = `${postcode}: we deliver here, usually next working day.`
      pcResult.classList.add('is-good')
    } else {
      pcResult.textContent = `${postcode} is outside our usual run. Pick a skip and we'll check it when you book.`
      pcResult.classList.add('is-warn')
    }
    goTo(2)
  }
  pcCheck.addEventListener('click', checkPostcode)
  pcInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); checkPostcode() } })

  /* Step 2: pick */
  function updateSummary() {
    const r = radios.find((x) => x.checked)
    if (!r) return
    const d = r.dataset
    sumSkip.textContent = `${d.m3} m³ ${d.name}`
    sumMeta.textContent = `≈ ${d.yd} yd · ${d.bags} bin bags · ${d.dims}`
  }
  radios.forEach((r) => r.addEventListener('change', () => { updateSummary(); goTo(3) }))
  updateSummary()

  /* Step 3: book */
  // Earliest delivery: tomorrow
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  dateInput.min = tomorrow.toISOString().slice(0, 10)

  flow.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!flow.reportValidity()) return
    const data = Object.fromEntries(new FormData(flow).entries())
    const r = radios.find((x) => x.checked)
    const lines = [
      `Skip: ${r.dataset.m3} m³ ${r.dataset.name}`,
      `Postcode: ${postcode || data.postcode || 'not given'}`,
      `Date: ${data.date || 'flexible'}`,
      `Waste: ${data.waste}`,
      `On road: ${data.road ? 'yes, permit needed' : 'no, private land'}`,
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
    ]

    if (BOOKING_ENDPOINT) {
      note.textContent = 'Sending…'
      try {
        const res = await fetch(BOOKING_ENDPOINT, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ...data, skip: `${r.dataset.m3} m³ ${r.dataset.name}`, postcode }),
        })
        note.textContent = res.ok
          ? `Thanks ${data.name.split(' ')[0]}: we'll ring ${data.phone} to confirm price and slot.`
          : 'Something went wrong sending that. Please call 0116 266 7497.'
      } catch {
        note.textContent = 'Something went wrong sending that. Please call 0116 266 7497.'
      }
      return
    }

    // No endpoint: hand off to email with everything filled in
    const subject = encodeURIComponent(`Skip booking: ${r.dataset.m3} m³ ${r.dataset.name} to ${postcode || 'TBC'}`)
    const body = encodeURIComponent(lines.join('\n'))
    window.location.href = `mailto:${BOOKING_EMAIL}?subject=${subject}&body=${body}`
    note.textContent = 'Opening your email app with the booking filled in. Or just call us.'
  })
}
