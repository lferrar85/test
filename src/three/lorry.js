import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { M, logoTexture, textTexture, decalMaterial } from './materials.js'
import { buildSkip } from './skip.js'

/* Modern European 4x2 skip loader (Scania-style cab) in Watts livery.
   Faces +x; origin on the ground under the chassis. */
const paint = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.28, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.08, ...o })
const P = {
  white: paint(0xe8eaed, { clearcoat: 0.6, clearcoatRoughness: 0.15, roughness: 0.35 }),
  deep: paint(0x0b4fa6, { metalness: 0.2, roughness: 0.35 }),
  stripe: paint(0x0777bf),
  grille: new THREE.MeshStandardMaterial({ color: 0x3a3f46, roughness: 0.4, metalness: 0.55 }),
  slat: new THREE.MeshStandardMaterial({ color: 0x7c838c, roughness: 0.3, metalness: 0.8 }),
  trim: new THREE.MeshStandardMaterial({ color: 0x24272b, roughness: 0.55, metalness: 0.15 }),
  silver: new THREE.MeshStandardMaterial({ color: 0xc9ced4, roughness: 0.25, metalness: 0.95 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0x0e1822, roughness: 0.02, metalness: 0.3, clearcoat: 1 }),
}

export function buildLorry() {
  const g = new THREE.Group()
  const body = new THREE.Group()
  g.add(body)

  const mesh = (geo, mat, x, y, z, parent = body, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat)
    m.position.set(x, y, z)
    m.rotation.set(rx, ry, rz)
    m.castShadow = m.receiveShadow = true
    parent.add(m)
    return m
  }
  const box = (w, h, d, mat, x, y, z, parent, rx, ry, rz) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, parent, rx, ry, rz)
  const decal = (tex, w, h, x, y, z, ry) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), decalMaterial(tex))
    p.position.set(x, y, z)
    p.rotation.y = ry
    body.add(p)
    return p
  }

  /* ---------------- chassis ---------------- */
  box(7.2, 0.3, 0.86, P.deep, -0.35, 0.95, 0)
  box(0.22, 0.28, 2.3, P.deep, -3.88, 0.78, 0)
  for (const z of [0.88, -0.88]) {
    box(0.06, 0.2, 0.36, M.red, -3.98, 0.8, z)
    box(0.06, 0.08, 0.36, M.amber, -3.98, 0.95, z)
  }
  // side guards between the axles
  for (const s of [1, -1]) {
    for (const y of [0.62, 0.92]) box(2.3, 0.07, 0.05, P.silver, 0.45, y, s * 1.17)
    for (const x of [-0.55, 0.45, 1.45]) box(0.06, 0.45, 0.05, P.trim, x, 0.78, s * 1.15)
  }
  // tanks behind the guards
  mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.0, 28), P.silver, 0.55, 0.8, 0.8, body, 0, 0, Math.PI / 2)
  box(0.9, 0.5, 0.5, P.trim, 0.55, 0.8, -0.78)

  /* ---------------- cab ---------------- */
  const CX = 2.47, FRONT = 3.6, BASE = 1.08, H = 2.45, W = 2.46
  mesh(new RoundedBoxGeometry(2.26, H, W, 6, 0.12), P.white, CX, BASE + H / 2, 0)
  // roof deflector and visor
  mesh(new RoundedBoxGeometry(1.6, 0.18, W - 0.1, 4, 0.06), P.white, CX - 0.15, BASE + H + 0.06, 0)
  box(0.42, 0.07, W - 0.1, P.grille, FRONT - 0.12, BASE + H - 0.05, 0)

  // windscreen, slightly raked, with black surround
  const ws = new THREE.Group()
  ws.position.set(FRONT + 0.005, BASE + 1.72, 0)
  ws.rotation.z = 0.07
  body.add(ws)
  box(0.03, 1.16, W - 0.12, P.trim, 0, 0, 0, ws)
  box(0.03, 1.02, W - 0.26, P.glass, 0.012, 0.02, 0, ws)
  for (const z of [0.5, -0.5]) box(0.02, 0.025, 0.8, P.trim, 0.03, -0.46, z, ws, 0.25)

  // badge band + grille block (the Scania signature): dark, horizontal slats
  box(0.06, 0.3, 1.92, P.grille, FRONT + 0.01, BASE + 0.98, 0)
  const badge = textTexture('WATTS', { w: 1024, h: 160, size: 112, family: 'Archivo Black', weight: 400 })
  decal(badge.tex, 1.0, 1.0 / badge.aspect, FRONT + 0.045, BASE + 0.98, 0, Math.PI / 2)
  box(0.07, 0.62, 1.92, P.grille, FRONT + 0.01, BASE + 0.48, 0)
  for (let i = 0; i < 4; i++) box(0.04, 0.05, 1.82, P.slat, FRONT + 0.05, BASE + 0.25 + i * 0.15, 0)
  box(0.02, 0.02, 1.9, P.silver, FRONT + 0.05, BASE + 0.82, 0)

  // bumper with corner headlights
  box(0.4, 0.5, W + 0.04, P.trim, FRONT - 0.02, BASE - 0.2, 0)
  box(0.04, 0.08, 1.2, P.grille, FRONT + 0.19, BASE - 0.3, 0)
  for (const s of [1, -1]) {
    box(0.05, 0.17, 0.46, M.light, FRONT + 0.18, BASE - 0.06, s * 0.92)
    box(0.05, 0.03, 0.46, M.amber, FRONT + 0.19, BASE + 0.05, s * 0.92)
    box(0.05, 0.08, 0.14, M.amber, FRONT + 0.18, BASE - 0.06, s * 1.2)
    box(0.04, 0.07, 0.18, M.light, FRONT + 0.19, BASE - 0.32, s * 0.95)
  }

  // side: door window that dips towards the front, door line, accent stripe, logo
  const win = new THREE.Shape([
    new THREE.Vector2(-0.48, 0.0), new THREE.Vector2(0.62, -0.32),
    new THREE.Vector2(0.86, -0.32), new THREE.Vector2(0.86, 0.62), new THREE.Vector2(-0.48, 0.62),
  ])
  const winGeo = new THREE.ExtrudeGeometry(win, { depth: 0.02, bevelEnabled: false })
  const logo = logoTexture()
  for (const s of [1, -1]) {
    const z = s * (W / 2 + 0.002)
    mesh(winGeo, P.glass, CX + 0.25, BASE + 1.68, s > 0 ? z - 0.01 : z - 0.01)
    box(0.012, 1.95, 0.01, P.trim, CX - 0.38, BASE + 1.1, z)                  // door shut line
    box(0.012, 0.95, 0.01, P.trim, FRONT - 0.18, BASE + 0.8, z)
    box(0.22, 0.045, 0.03, P.trim, CX - 0.2, BASE + 1.45, s * (W / 2 + 0.01)) // handle
    box(2.24, 0.07, 0.012, P.stripe, CX, BASE + 1.0, s * (W / 2 + 0.003))     // accent stripe
    decal(logo.tex, 1.1, 1.1 / logo.aspect, CX - 0.05, BASE + 1.32, s * (W / 2 + 0.008), s > 0 ? 0 : Math.PI)
    // big mirrors on arms
    box(0.05, 0.05, 0.38, P.trim, FRONT - 0.15, BASE + 2.22, s * (W / 2 + 0.16))
    mesh(new RoundedBoxGeometry(0.12, 0.62, 0.26, 3, 0.04), P.trim, FRONT - 0.15, BASE + 1.88, s * (W / 2 + 0.36))
    mesh(new RoundedBoxGeometry(0.1, 0.22, 0.2, 3, 0.03), P.trim, FRONT - 0.1, BASE + 1.4, s * (W / 2 + 0.3))
    // steps behind the front wheel
    for (const y of [0.42, 0.72]) box(0.5, 0.05, 0.28, P.silver, CX - 0.85, y, s * 1.08)
    // beacon
    mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.12, 18), M.amber, CX - 0.5, BASE + H + 0.2, s * 0.8)
  }
  // front arch over the wheel
  for (const s of [1, -1]) {
    mesh(new RoundedBoxGeometry(1.5, 0.12, 0.5, 3, 0.05), P.trim, 2.5, 1.2, s * 1.0)
    mesh(new RoundedBoxGeometry(0.12, 0.5, 0.5, 3, 0.05), P.trim, 1.78, 0.98, s * 1.0)
  }

  /* ---------------- behind the cab ---------------- */
  // exhaust stack
  mesh(new THREE.CylinderGeometry(0.075, 0.075, 2.9, 20), P.silver, 1.17, 2.45, 1.0)
  mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.9, 20), P.silver, 1.17, 1.65, 1.0)
  // loader tower: two uprights joined at the top, with a ladder
  for (const z of [0.95, -0.95]) box(0.24, 2.0, 0.22, P.deep, 0.85, 2.05, z)
  box(0.24, 0.24, 2.12, P.deep, 0.85, 3.0, 0)
  for (const z of [0.55, 0.85]) box(0.04, 1.7, 0.04, P.silver, 0.62, 1.95, z)
  for (let i = 0; i < 6; i++) box(0.04, 0.04, 0.34, P.silver, 0.62, 1.2 + i * 0.3, 0.7)
  // rear axle fenders
  for (const s of [1, -1]) box(1.5, 0.05, 0.72, P.trim, -1.7, 1.18, s * 0.95)

  /* ---------------- wheels ---------------- */
  const wheels = []
  const R = 0.55
  const wheel = (x, z, w) => {
    const wg = new THREE.Group()
    wg.position.set(x, R, z)
    mesh(new THREE.CylinderGeometry(R, R, w, 40), M.tyre, 0, 0, 0, wg, Math.PI / 2)
    mesh(new THREE.TorusGeometry(R - 0.04, 0.05, 10, 40), M.tyre, 0, 0, 0, wg)
    mesh(new THREE.CylinderGeometry(0.33, 0.33, w + 0.02, 32), P.silver, 0, 0, 0, wg, Math.PI / 2)
    mesh(new THREE.CylinderGeometry(0.14, 0.14, w + 0.06, 20), P.grille, 0, 0, 0, wg, Math.PI / 2)
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2
      mesh(new THREE.CylinderGeometry(0.02, 0.02, w + 0.08, 8), P.silver, Math.cos(a) * 0.2, Math.sin(a) * 0.2, 0, wg, Math.PI / 2)
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      box(0.05, 0.08, w + 0.04, P.grille, Math.cos(a) * 0.28, Math.sin(a) * 0.28, 0, wg, 0, 0, a)
    }
    g.add(wg)
    wheels.push(wg)
  }
  for (const s of [1, -1]) {
    wheel(2.5, s * 1.03, 0.42)
    wheel(-1.7, s * 0.92, 0.66)
  }

  /* ---------------- skip loader ---------------- */
  const PIVOT = new THREE.Vector3(-3.55, 1.25, 0)
  const ARM = 3.1
  const arms = new THREE.Group()
  arms.position.copy(PIVOT)
  body.add(arms)
  for (const s of [1, -1]) {
    box(0.28, ARM * 0.62, 0.24, P.deep, 0, ARM * 0.31, s * 1.02, arms)                  // outer section
    box(0.2, ARM * 0.45, 0.17, paint(0x2a6fc4), 0, ARM * 0.76, s * 1.02, arms)           // telescopic inner
    mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.34, 20), P.silver, 0, 0, s * 1.02, arms, Math.PI / 2)
    mesh(new THREE.TorusGeometry(0.08, 0.025, 8, 18), P.silver, 0, ARM - 0.02, s * 1.15, arms, 0, Math.PI / 2)
  }
  box(0.2, 0.2, 2.25, P.deep, 0, ARM - 0.12, 0, arms)
  for (const s of [1, -1]) box(0.36, 0.7, 0.14, P.deep, -3.3, 1.05, s * 0.7)

  const legs = []
  for (const s of [1, -1]) {
    const leg = box(0.18, 1.0, 0.18, P.deep, -3.55, 0.98, s * 0.75)
    box(0.36, 0.05, 0.36, P.silver, 0, -0.5, 0, leg)
    legs.push(leg)
  }

  // rams from the tower to the arms: barrel + chrome rod, re-aimed every frame
  const rams = [1, -1].map((s) => ({
    s,
    barrel: mesh(new THREE.CylinderGeometry(0.1, 0.1, 1, 16), P.deep, 0, 0, 0),
    rod: mesh(new THREE.CylinderGeometry(0.055, 0.055, 1, 14), P.silver, 0, 0, 0),
  }))

  const skip = buildSkip()
  body.add(skip)
  const chains = skip.userData.lugs.map(() => mesh(new THREE.CylinderGeometry(0.022, 0.022, 1, 6), M.chain, 0, 0, 0))

  const UP = new THREE.Vector3(0, 1, 0)
  const A = new THREE.Vector3(), B = new THREE.Vector3(), D = new THREE.Vector3(), MID = new THREE.Vector3()
  const span = (m, a, b) => {
    D.subVectors(b, a)
    const len = D.length()
    m.position.copy(a).addScaledVector(D, 0.5)
    m.quaternion.setFromUnitVectors(UP, D.normalize())
    m.scale.set(1, len, 1)
  }

  const TH0 = 0.58, TH1 = -1.2, BED = 1.1
  const HANG = BED - (PIVOT.y + ARM * Math.cos(TH0))
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
  const clamp = (v) => Math.min(1, Math.max(0, v))

  function setLower(t) {
    const legT = ease(clamp(t / 0.18))
    legs.forEach((l) => (l.position.y = 0.98 - legT * 0.48))
    const a = ease(clamp((t - 0.14) / 0.86))
    const th = TH0 + (TH1 - TH0) * a
    arms.rotation.z = -th
    const tipX = PIVOT.x + ARM * Math.sin(th), tipY = PIVOT.y + ARM * Math.cos(th)
    skip.position.set(tipX, Math.max(0, tipY + HANG), 0)
    skip.userData.lugs.forEach((lug, i) => {
      A.set(tipX, tipY - 0.05, lug.z > 0 ? 1.15 : -1.15)
      B.copy(lug).add(skip.position)
      span(chains[i], A, B)
    })
    rams.forEach(({ s, barrel, rod }) => {
      A.set(0.75, 2.75, s * 0.95)
      B.set(PIVOT.x + 1.7 * Math.sin(th), PIVOT.y + 1.7 * Math.cos(th), s * 1.02)
      MID.copy(A).lerp(B, 0.5)
      span(barrel, A, MID)
      span(rod, MID, B)
    })
  }
  setLower(0)

  let rolled = 0
  function roll(dx) {
    rolled += dx
    wheels.forEach((w) => (w.rotation.z = -rolled / R))
  }

  return { group: g, body, skip, setLower, roll }
}
