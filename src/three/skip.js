import * as THREE from 'three'
import { M, skipPaint, decalMaterial, skipDecalTexture, hazardTexture } from './materials.js'
import { fillSkip } from './waste.js'

/* Builder's skip in metres: top length, base length, width, height, skid height */
export const SKIP = { Lt: 3.4, Lb: 2.3, W: 1.7, H: 1.2, foot: 0.13 }

let _decal, _hazard
const decal = () => (_decal ||= skipDecalTexture())
const hazard = () => (_hazard ||= hazardTexture())

export function buildSkip({ fill = 'empty', seed = 1 } = {}) {
  const g = new THREE.Group()
  const { Lt, Lb, W, H, foot } = SKIP
  const t = 0.05
  const paint = skipPaint()
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat)
    m.position.set(x, y, z)
    m.rotation.set(rx, ry, rz)
    m.castShadow = m.receiveShadow = true
    g.add(m)
    return m
  }

  // skids
  for (const z of [W * 0.3, -W * 0.3]) add(new THREE.BoxGeometry(Lb * 0.94, foot, 0.16), M.chassis, 0, foot / 2, z)
  // floor
  add(new THREE.BoxGeometry(Lb, t, W), paint, 0, foot + t / 2, 0)
  // sides: trapezoids
  const shape = new THREE.Shape([
    new THREE.Vector2(-Lb / 2, 0), new THREE.Vector2(Lb / 2, 0),
    new THREE.Vector2(Lt / 2, H), new THREE.Vector2(-Lt / 2, H),
  ])
  const side = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false })
  add(side, paint, 0, foot, W / 2 - t)
  add(side, paint, 0, foot, -W / 2)
  // sloped ends
  const dx = (Lt - Lb) / 2, len = Math.hypot(dx, H), ang = Math.atan2(dx, H)
  add(new THREE.BoxGeometry(t, len, W), paint, Lb / 2 + dx / 2, foot + H / 2, 0, 0, 0, -ang)
  add(new THREE.BoxGeometry(t, len, W), paint, -(Lb / 2 + dx / 2), foot + H / 2, 0, 0, 0, ang)
  // top rim
  const rimY = foot + H
  for (const s of [1, -1]) add(new THREE.BoxGeometry(Lt + 0.12, 0.1, 0.09), paint, 0, rimY, s * (W / 2 + 0.01))
  for (const s of [1, -1]) add(new THREE.BoxGeometry(0.09, 0.1, W + 0.1), paint, s * (Lt / 2 + 0.02), rimY, 0)

  // outside stiffeners, lugs, decals
  const lugs = []
  for (const s of [1, -1]) {
    const z = s * (W / 2 + 0.025)
    add(new THREE.BoxGeometry(Lt * 0.95, 0.09, 0.05), paint, 0, foot + H - 0.2, z)
    for (const x of [-1.02, 1.02]) add(new THREE.BoxGeometry(0.08, H - 0.26, 0.05), paint, x, foot + (H - 0.26) / 2, z)
    for (const e of [1, -1]) {
      const lx = e * (Lb / 2 + dx * 0.6 - 0.16), ly = foot + H * 0.6
      add(new THREE.BoxGeometry(0.24, 0.3, 0.05), paint, lx, ly, s * (W / 2 + 0.03))
      add(new THREE.CylinderGeometry(0.07, 0.07, 0.22, 18), M.steel, lx, ly, s * (W / 2 + 0.14), Math.PI / 2, 0, 0)
      lugs.push(new THREE.Vector3(lx, ly, s * (W / 2 + 0.24)))
    }
    const d = decal()
    const dw = 1.72, dh = dw / d.aspect
    const p = new THREE.Mesh(new THREE.PlaneGeometry(dw, dh), decalMaterial(d.tex))
    p.position.set(0, foot + H * 0.44, s * (W / 2 + 0.004))
    p.rotation.y = s > 0 ? 0 : Math.PI
    g.add(p)
  }

  if (fill === 'asbestos') {
    // enclosed, lockable: two lids meeting in a low ridge, hasp and warning label
    for (const s of [1, -1]) {
      const lid = add(new THREE.BoxGeometry(Lt + 0.14, 0.06, W / 2 + 0.06), paint, 0, rimY + 0.09, s * (W / 4 + 0.01), s * 0.06, 0, 0)
      lid.position.y += 0.03
    }
    add(new THREE.BoxGeometry(0.12, 0.2, 0.06), M.steel, 0.6, rimY - 0.05, W / 2 + 0.06)
    add(new THREE.TorusGeometry(0.06, 0.015, 8, 16, Math.PI), M.chrome, 0.6, rimY - 0.2, W / 2 + 0.1)
    const hz = hazard()
    const hp = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), decalMaterial(hz.tex))
    hp.position.set(Lt / 2 - 0.05, foot + H * 0.5, W / 2 + 0.006)
    g.add(hp)
  } else if (fill !== 'empty') {
    g.add(fillSkip(fill, seed))
  }

  g.userData.lugs = lugs
  return g
}

/* Roll-on/roll-off: long open container on rails with a hook frame at the front */
export function buildRoro() {
  const g = new THREE.Group()
  const L = 6.1, W = 2.35, H = 1.9, base = 0.28
  const paint = skipPaint()
  const add = (geo, mat, x, y, z, rz = 0) => {
    const m = new THREE.Mesh(geo, mat)
    m.position.set(x, y, z)
    m.rotation.z = rz
    m.castShadow = m.receiveShadow = true
    g.add(m)
    return m
  }
  for (const z of [0.55, -0.55]) add(new THREE.BoxGeometry(L, 0.2, 0.18), M.chassis, 0, 0.1, z)
  for (const x of [-L / 2 + 0.2]) for (const z of [0.8, -0.8]) add(new THREE.CylinderGeometry(0.14, 0.14, 0.2, 18), M.steel, x, 0.14, z, 0).rotation.x = Math.PI / 2
  add(new THREE.BoxGeometry(L, 0.08, W), paint, 0, base, 0)
  for (const s of [1, -1]) {
    add(new THREE.BoxGeometry(L, H, 0.06), paint, 0, base + H / 2, s * (W / 2 - 0.03))
    for (let i = 0; i <= 7; i++) add(new THREE.BoxGeometry(0.1, H, 0.08), paint, -L / 2 + 0.15 + (i * (L - 0.3)) / 7, base + H / 2, s * (W / 2 + 0.02))
    add(new THREE.BoxGeometry(L + 0.1, 0.12, 0.12), paint, 0, base + H, s * (W / 2))
    const d = decal()
    const dw = 2.2, dh = dw / d.aspect
    const p = new THREE.Mesh(new THREE.PlaneGeometry(dw, dh), decalMaterial(d.tex))
    p.position.set(0.3, base + H * 0.5, s * (W / 2 + 0.07))
    p.rotation.y = s > 0 ? 0 : Math.PI
    g.add(p)
  }
  add(new THREE.BoxGeometry(0.06, H, W), paint, -L / 2, base + H / 2, 0)
  add(new THREE.BoxGeometry(0.06, H, W), paint, L / 2, base + H / 2, 0)
  // hook frame
  add(new THREE.BoxGeometry(0.16, 1.2, 0.16), M.deep, L / 2 + 0.25, base + 0.9, 0, -0.35)
  add(new THREE.TorusGeometry(0.14, 0.04, 10, 20), M.steel, L / 2 + 0.45, base + 1.5, 0)
  return g
}
