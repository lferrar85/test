import * as THREE from 'three'

export const BLUE = '#0777bf'
export const DEEP = '#0950aa'

export async function brandReady() {
  await Promise.all([
    document.fonts.load('400 100px "Archivo Black"'),
    document.fonts.load('500 50px "Archivo"'),
    document.fonts.load('800 50px "Archivo"'),
  ])
}

/* ---------- Watts logo, drawn from the shapes on their own sign ---------- */
export const LOGO_W = 690
export const LOGO_H = 290

function poly(ctx, pts, fill, stroke = true) {
  ctx.beginPath()
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.fill()
  if (stroke) ctx.stroke()
}

export function drawLogo(ctx, x, y, s, { group = true, color = BLUE } = {}) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(s, s)
  ctx.lineJoin = 'round'
  ctx.lineWidth = 5
  ctx.strokeStyle = '#6f6f6f'
  poly(ctx, [[22, 62], [160, 26], [252, 74], [118, 112]], '#ececec')
  poly(ctx, [[48, 66], [158, 38], [226, 74], [120, 101]], '#a9a9a9', false)
  poly(ctx, [[22, 62], [118, 112], [134, 272], [54, 226]], '#d2d2d2')
  poly(ctx, [[118, 112], [252, 74], [236, 226], [134, 272]], '#bdbdbd')
  ctx.fillStyle = color
  ctx.textBaseline = 'alphabetic'
  ctx.font = '400 268px "Archivo Black"'
  ctx.save()
  ctx.transform(1, 0, -0.06, 1, 0, 0)
  ctx.fillText('W', 26, 258)
  ctx.restore()
  ctx.font = '400 168px "Archivo Black"'
  ctx.fillText('atts', 236, 214)
  if (group) {
    ctx.save()
    ctx.transform(1, 0, -0.2, 1, 0, 0)
    ctx.font = '500 50px "Archivo"'
    ctx.fillText('WATTS GROUP', 318, 268)
    ctx.restore()
  }
  ctx.restore()
}

const canvas = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h })

export function canvasTex(cv) {
  const t = new THREE.CanvasTexture(cv)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/* Logo on transparent: cab doors, cab front */
export function logoTexture(w = 1024) {
  const h = Math.round((w * LOGO_H) / LOGO_W)
  const cv = canvas(w, h)
  drawLogo(cv.getContext('2d'), 0, 0, w / LOGO_W)
  return { tex: canvasTex(cv), aspect: w / h }
}

/* Skip side: white plate with logo, phone number stencilled under it */
export function skipDecalTexture() {
  const w = 1024, h = 470
  const cv = canvas(w, h)
  const ctx = cv.getContext('2d')
  ctx.fillStyle = '#f6f7f8'
  roundRect(ctx, 8, 8, w - 16, 330, 26)
  ctx.fill()
  drawLogo(ctx, 150, 30, 1.03)
  ctx.fillStyle = '#ffffff'
  ctx.font = '800 92px "Archivo"'
  ctx.textAlign = 'center'
  ctx.fillText('0116 266 7497', w / 2, 448)
  return { tex: canvasTex(cv), aspect: w / h }
}

/* Asbestos warning label */
export function hazardTexture() {
  const w = 512, h = 512
  const cv = canvas(w, h)
  const ctx = cv.getContext('2d')
  ctx.fillStyle = '#ffd400'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#111'
  ctx.lineWidth = 24
  ctx.strokeRect(12, 12, w - 24, h - 24)
  ctx.font = '400 210px "Archivo Black"'
  ctx.textAlign = 'center'
  ctx.fillText('a', w / 2, 270)
  ctx.font = '800 64px "Archivo"'
  ctx.fillText('ASBESTOS', w / 2, 380)
  ctx.font = '500 34px "Archivo"'
  ctx.fillText('SEALED CONTAINER', w / 2, 440)
  return { tex: canvasTex(cv), aspect: 1 }
}

/* White livery text on a transparent strip */
export function textTexture(text, { w = 2048, h = 200, size = 120, weight = 800, color = '#fff', family = 'Archivo' } = {}) {
  const cv = canvas(w, h)
  const ctx = cv.getContext('2d')
  ctx.fillStyle = color
  ctx.font = `${weight} ${size}px "${family}"`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, w / 2, h / 2 + size * 0.04)
  return { tex: canvasTex(cv), aspect: w / h }
}

/* Light grime: dots, streaks and rust at the foot. Multiplies the paint colour. */
export function grimeTexture(seed = 7) {
  let s = seed
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  const w = 512, h = 512
  const cv = canvas(w, h)
  const ctx = cv.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = `rgba(40,30,20,${0.03 + rnd() * 0.08})`
    const r = 0.5 + rnd() * 2.2
    ctx.beginPath(); ctx.arc(rnd() * w, rnd() * h, r, 0, Math.PI * 2); ctx.fill()
  }
  for (let i = 0; i < 70; i++) {
    const x = rnd() * w
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, 'rgba(70,45,25,0)')
    g.addColorStop(1, `rgba(70,45,25,${0.05 + rnd() * 0.08})`)
    ctx.fillStyle = g
    ctx.fillRect(x, rnd() * h * 0.5, 1 + rnd() * 3, h)
  }
  const foot = ctx.createLinearGradient(0, h, 0, h * 0.7)
  foot.addColorStop(0, 'rgba(110,60,25,0.35)')
  foot.addColorStop(1, 'rgba(110,60,25,0)')
  ctx.fillStyle = foot
  ctx.fillRect(0, h * 0.7, w, h * 0.3)
  const t = canvasTex(cv)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

export function asphaltTexture() {
  const w = 1024, h = 512
  const cv = canvas(w, h)
  const ctx = cv.getContext('2d')
  ctx.fillStyle = '#44484e'
  ctx.fillRect(0, 0, w, h)
  let s = 3
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  for (let i = 0; i < 26000; i++) {
    const v = rnd() > 0.5 ? 255 : 0
    ctx.fillStyle = `rgba(${v},${v},${v},${0.03 + rnd() * 0.07})`
    ctx.fillRect(rnd() * w, rnd() * h, 1.6, 1.6)
  }
  ctx.fillStyle = 'rgba(245,245,240,0.92)'
  ctx.fillRect(0, h * 0.07, w, 9)
  ctx.fillRect(0, h * 0.93 - 9, w, 9)
  for (let x = 0; x < w; x += 256) ctx.fillRect(x + 40, h * 0.5 - 5, 150, 10)
  const t = canvasTex(cv)
  t.wrapS = THREE.RepeatWrapping
  return t
}

export function fadeAlpha() {
  const w = 512, h = 64
  const cv = canvas(w, h)
  const ctx = cv.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, w, 0)
  g.addColorStop(0, '#000'); g.addColorStop(0.18, '#fff'); g.addColorStop(0.82, '#fff'); g.addColorStop(1, '#000')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  return new THREE.CanvasTexture(cv)
}

/* ---------- Shared materials ---------- */
const std = (o) => new THREE.MeshStandardMaterial(o)
export const M = {
  white: std({ color: 0xf3f4f5, roughness: 0.32, metalness: 0.08 }),
  blue: std({ color: 0x0777bf, roughness: 0.38, metalness: 0.2 }),
  deep: std({ color: 0x0950aa, roughness: 0.45, metalness: 0.25 }),
  chassis: std({ color: 0x1c1f23, roughness: 0.6, metalness: 0.4 }),
  black: std({ color: 0x0c0d0f, roughness: 0.55, metalness: 0.2 }),
  glass: std({ color: 0x0a121c, roughness: 0.04, metalness: 0.9 }),
  chrome: std({ color: 0xdfe3e8, roughness: 0.14, metalness: 1 }),
  rim: std({ color: 0xbfc4ca, roughness: 0.32, metalness: 0.9 }),
  tyre: std({ color: 0x131416, roughness: 0.88, metalness: 0 }),
  light: std({ color: 0xffffff, emissive: 0xfff6e0, emissiveIntensity: 1.4 }),
  amber: std({ color: 0xff9a1f, emissive: 0xff8a00, emissiveIntensity: 1.2, roughness: 0.3 }),
  red: std({ color: 0xc81e1e, emissive: 0x8a0000, emissiveIntensity: 0.6 }),
  chain: std({ color: 0x3b3e42, roughness: 0.45, metalness: 0.85 }),
  steel: std({ color: 0x8c9197, roughness: 0.4, metalness: 0.85 }),
  alu: std({ color: 0xcfd4d9, roughness: 0.28, metalness: 0.95 }),
}

let _paint
export function skipPaint() {
  if (!_paint) {
    const grime = grimeTexture()
    grime.repeat.set(0.6, 0.6)
    _paint = std({ color: 0x0777bf, roughness: 0.5, metalness: 0.28, map: grime })
  }
  return _paint
}

export function decalMaterial(tex) {
  return std({ map: tex, transparent: true, roughness: 0.45, metalness: 0.05, polygonOffset: true, polygonOffsetFactor: -4 })
}
