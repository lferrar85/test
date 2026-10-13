/* "Get a quote": skips by waste type, drawn as isometric skips with the waste in them. */

const WASTE = [
  { id: 'general',  name: 'General waste',      fill: '#8d939b', hi: '#b8bdc4', lo: '#5f656c', tex: 'chunks', note: 'Household, office and shop clear-outs' },
  { id: 'garden',   name: 'Garden waste',       fill: '#4e8a3b', hi: '#79b35f', lo: '#2f5a24', tex: 'blobs',  note: 'Green waste, turf, hedge cuttings' },
  { id: 'muck',     name: 'Soil & muck',        fill: '#6b4a2b', hi: '#8f6a45', lo: '#45301a', tex: 'blobs',  note: 'Topsoil, clay, excavation spoil' },
  { id: 'inert',    name: 'Inert waste',        fill: '#b3ab9c', hi: '#d5cec0', lo: '#857d6f', tex: 'chunks', note: 'Bricks, concrete, soil mixed' },
  { id: 'hardcore', name: 'Hardcore',           fill: '#9c968b', hi: '#c6c0b4', lo: '#6a655b', tex: 'chunks', note: 'Clean rubble and crushed concrete' },
  { id: 'plaster',  name: 'Plasterboard',       fill: '#e6e1d7', hi: '#f6f3ec', lo: '#bdb6a8', tex: 'slabs',  note: 'Gypsum only: kept separate by law' },
  { id: 'wood',     name: 'Wood',               fill: '#b8865a', hi: '#d8aa7c', lo: '#8a5f3a', tex: 'planks', note: 'Timber, pallets, doors, flooring' },
  { id: 'metal',    name: 'Metal',              fill: '#7f8894', hi: '#aab2bd', lo: '#525a65', tex: 'planks', note: 'We pay for this one: ask about rates' },
  { id: 'mixed',    name: 'Mixed trade',        fill: '#8a8278', hi: '#c9b89a', lo: '#5a544c', tex: 'chunks', note: 'Site waste, refits, strip-outs' },
  { id: 'wait',     name: 'Wait & load',        fill: null,                                   tex: 'empty',  note: 'No room for a skip? We wait while you fill it' },
  { id: 'asbestos', name: 'Asbestos',           fill: null,                                   tex: 'box',    note: 'Sealed, lockable container. Call to arrange' },
]

// Mound of waste sitting in the open top of the #skip-iso symbol
const MOUND = 'M46 33 C 62 12, 112 -2, 150 6 C 172 11, 188 24, 184 35 L 93 49 Z'

let seed = 11
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647

function texture(w) {
  const bits = []
  const inside = () => [60 + rnd() * 110, 14 + rnd() * 24]
  if (w.tex === 'chunks') {
    for (let i = 0; i < 14; i++) {
      const [x, y] = inside(); const s = 4 + rnd() * 7; const c = rnd() > 0.5 ? w.hi : w.lo
      bits.push(`<path d="M${x} ${y} l${s} ${-s * 0.4} l${s * 0.6} ${s * 0.7} l${-s} ${s * 0.5} z" fill="${c}"/>`)
    }
  } else if (w.tex === 'blobs') {
    for (let i = 0; i < 12; i++) {
      const [x, y] = inside(); const r = 4 + rnd() * 6; const c = rnd() > 0.5 ? w.hi : w.lo
      bits.push(`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.6}" fill="${c}"/>`)
    }
  } else if (w.tex === 'planks') {
    for (let i = 0; i < 9; i++) {
      const [x, y] = inside(); const l = 18 + rnd() * 26; const a = -25 + rnd() * 50; const c = rnd() > 0.5 ? w.hi : w.lo
      bits.push(`<rect x="${x}" y="${y}" width="${l}" height="4" transform="rotate(${a} ${x} ${y})" fill="${c}"/>`)
    }
  } else if (w.tex === 'slabs') {
    for (let i = 0; i < 6; i++) {
      const [x, y] = inside(); const l = 24 + rnd() * 24; const a = -12 + rnd() * 24
      bits.push(`<rect x="${x}" y="${y}" width="${l}" height="7" transform="rotate(${a} ${x} ${y})" fill="${w.hi}" stroke="${w.lo}" stroke-width="0.8"/>`)
    }
  }
  return bits.join('')
}

function art(w) {
  if (w.tex === 'box') {
    // Closed, lockable asbestos container: same isometric language, lid on, hazard stripe
    return `<svg viewBox="0 0 210 130" aria-hidden="true">
      <ellipse cx="118" cy="112" rx="78" ry="12" class="sk-shadow"/>
      <path d="M40 30 L90 52 L95 106 L55 88 Z" class="sk-side"/>
      <path d="M90 52 L190 36 L175 92 L95 106 Z" class="sk-front"/>
      <path d="M40 30 L140 14 L190 36 L90 52 Z" class="sk-lid"/>
      <path d="M40 30 L140 14 L190 36 L90 52 Z" class="sk-rim"/>
      <path d="M100 60 L182 46 L181 54 L101 68 Z" fill="#c8362b"/>
      <path d="M106 62 l6 -1 l-4 7 l-6 1 z M122 59 l6 -1 l-4 7 l-6 1 z M138 56 l6 -1 l-4 7 l-6 1 z M154 53 l6 -1 l-4 7 l-6 1 z M170 50 l6 -1 l-4 7 l-6 1 z" fill="#fff"/>
      <rect x="128" y="74" width="10" height="8" class="sk-lug"/>
      <text x="104" y="98" class="sk-text sk-text--small" transform="matrix(1 -0.16 0.08 1 0 0)">ASBESTOS</text>
    </svg>`
  }
  const mound = w.fill
    ? `<path d="${MOUND}" fill="${w.fill}"/><g>${texture(w)}</g>`
    : ''
  return `<svg viewBox="0 0 210 130" aria-hidden="true"><use href="#skip-iso"/>${mound}</svg>`
}

export function initQuote({ onPostcode, onWaste }) {
  const grid = document.querySelector('[data-waste-grid]')
  if (!grid) return

  grid.innerHTML = WASTE.map((w, i) => `
    <button class="waste" type="button" data-waste="${w.name}" data-reveal style="--delay:${Math.min(i, 8) * 60}ms">
      <span class="waste__art">${art(w)}</span>
      <span class="waste__name">${w.name}</span>
      <span class="waste__note">${w.note}</span>
      <span class="waste__cta">Choose a size →</span>
    </button>`).join('')

  grid.querySelectorAll('[data-waste]').forEach((btn) => {
    btn.addEventListener('click', () => {
      grid.querySelectorAll('.waste').forEach((b) => b.classList.toggle('is-selected', b === btn))
      onWaste(btn.dataset.waste)
    })
  })

  // Sticky panel postcode: same check as the booking flow
  const panel = document.querySelector('[data-quote-panel]')
  const input = panel.querySelector('[data-postcode]')
  const check = panel.querySelector('[data-postcode-check]')
  check.addEventListener('click', () => onPostcode(input.value))
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); onPostcode(input.value) } })
}

export const WASTE_NAMES = WASTE.map((w) => w.name)
