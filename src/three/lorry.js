import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { M, logoTexture, textTexture, decalMaterial } from './materials.js'
import { buildSkip } from './skip.js'

/* Skip-loader lorry in Watts livery. Faces +x, origin on the ground under the chassis. */
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
  const decal = (tex, w, h, x, y, z, ry, parent = body) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), decalMaterial(tex))
    p.position.set(x, y, z)
    p.rotation.y = ry
    parent.add(p)
    return p
  }

  // ---- chassis
  mesh(new THREE.BoxGeometry(7.1, 0.32, 0.86), M.chassis, -0.15, 0.92, 0)
  mesh(new THREE.BoxGeometry(0.2, 0.25, 2.3), M.chassis, -3.62, 0.72, 0)
  for (const z of [0.85, -0.85]) mesh(new THREE.BoxGeometry(0.16, 0.12, 0.3), M.red, -3.66, 0.72, z)

  // ---- cab
  mesh(new RoundedBoxGeometry(2.1, 2.35, 2.45, 5, 0.13), M.white, 2.55, 2.18, 0)
  mesh(new RoundedBoxGeometry(2.12, 0.26, 2.47, 3, 0.06), M.blue, 2.55, 1.2, 0) // blue band
  mesh(new THREE.BoxGeometry(0.05, 0.98, 2.12), M.glass, 3.585, 2.72, 0)       // windscreen
  mesh(new THREE.BoxGeometry(0.42, 0.1, 2.36), M.white, 3.5, 3.27, 0)          // visor
  for (const s of [1, -1]) mesh(new THREE.BoxGeometry(0.9, 0.72, 0.03), M.glass, 3.02, 2.72, s * 1.222)
  mesh(new THREE.BoxGeometry(0.05, 0.62, 1.55), M.black, 3.6, 1.62, 0)          // grille
  for (let i = 0; i < 4; i++) mesh(new THREE.BoxGeometry(0.06, 0.035, 1.5), M.chrome, 3.63, 1.4 + i * 0.15, 0)
  mesh(new THREE.BoxGeometry(0.32, 0.4, 2.5), M.chassis, 3.6, 0.98, 0)          // bumper
  for (const s of [1, -1]) {
    mesh(new THREE.BoxGeometry(0.06, 0.17, 0.44), M.light, 3.77, 1.05, s * 0.9)
    mesh(new THREE.BoxGeometry(0.06, 0.1, 0.14), M.amber, 3.77, 1.05, s * 1.17)
    mesh(new THREE.BoxGeometry(0.05, 0.05, 0.42), M.black, 3.55, 3.0, s * 1.42)  // mirror arm
    mesh(new THREE.BoxGeometry(0.1, 0.58, 0.22), M.black, 3.55, 2.72, s * 1.62)  // mirror
    mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.13, 18), M.amber, 2.05, 3.42, s * 0.75)
    for (const y of [0.48, 0.78]) mesh(new THREE.BoxGeometry(0.5, 0.05, 0.26), M.chrome, 2.95, y, s * 1.15)
  }

  // door seams, handles, wipers
  for (const s of [1, -1]) {
    for (const x of [1.72, 3.2]) mesh(new THREE.BoxGeometry(0.018, 1.75, 0.01), M.chassis, x, 2.15, s * 1.227)
    mesh(new THREE.BoxGeometry(0.22, 0.05, 0.03), M.chrome, 1.95, 2.25, s * 1.235)
  }
  for (const z of [0.45, -0.45]) mesh(new THREE.BoxGeometry(0.03, 0.03, 0.85), M.black, 3.62, 2.28, z, body, 0.3, 0, 0)
  // corner deflectors behind the doors
  for (const s of [1, -1]) mesh(new THREE.BoxGeometry(0.06, 1.4, 0.3), M.white, 1.55, 2.6, s * 1.08)

  // logos: both doors and the front panel
  const logo = logoTexture()
  for (const s of [1, -1]) decal(logo.tex, 1.25, 1.25 / logo.aspect, 2.3, 1.85, s * 1.229, s > 0 ? 0 : Math.PI)
  decal(logo.tex, 1.0, 1.0 / logo.aspect, 3.615, 2.05, 0, Math.PI / 2)

  // ---- behind the cab
  mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.7, 16), M.chrome, 1.38, 2.35, 1.0)
  mesh(new THREE.BoxGeometry(0.45, 0.75, 0.9), M.deep, 1.25, 1.48, -0.55)
  mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.95, 28), M.alu, 1.15, 0.86, 1.02, body, 0, 0, Math.PI / 2)

  // side skirt with livery
  const strip = textTexture('SKIP HIRE · SCRAP METAL · 0116 266 7497', { size: 104 })
  for (const s of [1, -1]) {
    mesh(new THREE.BoxGeometry(1.75, 0.5, 0.05), M.blue, -0.15, 0.98, s * 1.12)
    decal(strip.tex, 1.7, 1.7 / strip.aspect * 1.6, -0.15, 0.98, s * 1.148, s > 0 ? 0 : Math.PI)
  }

  // ---- wheels
  const wheels = []
  const wheel = (x, z, w) => {
    const wg = new THREE.Group()
    wg.position.set(x, 0.53, z)
    mesh(new THREE.CylinderGeometry(0.53, 0.53, w, 36), M.tyre, 0, 0, 0, wg, Math.PI / 2)
    mesh(new THREE.CylinderGeometry(0.31, 0.31, w + 0.02, 28), M.rim, 0, 0, 0, wg, Math.PI / 2)
    mesh(new THREE.CylinderGeometry(0.12, 0.12, w + 0.06, 16), M.chrome, 0, 0, 0, wg, Math.PI / 2)
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      mesh(new THREE.BoxGeometry(0.06, 0.18, w + 0.04), M.chassis, Math.cos(a) * 0.22, Math.sin(a) * 0.22, 0, wg, 0, 0, a)
    }
    body.parent.add(wg)
    wheels.push(wg)
  }
  for (const s of [1, -1]) {
    wheel(2.6, s * 1.02, 0.38)
    wheel(-1.7, s * 0.93, 0.62)
    wheel(-3.0, s * 0.93, 0.62)
    mesh(new THREE.BoxGeometry(2.7, 0.06, 0.74), M.black, -2.35, 1.13, s * 0.95)
  }

  // ---- skip loader
  const PIVOT = new THREE.Vector3(-3.45, 1.25, 0)
  const ARM = 2.9
  const arms = new THREE.Group()
  arms.position.copy(PIVOT)
  body.add(arms)
  for (const s of [1, -1]) {
    mesh(new THREE.BoxGeometry(0.24, ARM, 0.2), M.deep, 0, ARM / 2, s * 1.0, arms)
    mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.3, 18), M.steel, 0, 0, s * 1.0, arms, Math.PI / 2)
    mesh(new THREE.TorusGeometry(0.08, 0.025, 8, 16), M.steel, 0, ARM - 0.02, s * 1.12, arms, 0, Math.PI / 2)
  }
  mesh(new THREE.BoxGeometry(0.18, 0.18, 2.2), M.deep, 0, ARM - 0.12, 0, arms)
  for (const s of [1, -1]) mesh(new THREE.BoxGeometry(0.3, 0.6, 0.12), M.deep, -3.2, 1.05, s * 0.7)

  // stabiliser legs
  const legs = []
  for (const s of [1, -1]) {
    const leg = mesh(new THREE.BoxGeometry(0.17, 0.9, 0.17), M.deep, -3.42, 0.95, s * 0.72)
    mesh(new THREE.BoxGeometry(0.34, 0.05, 0.34), M.steel, 0, -0.45, 0, leg)
    legs.push(leg)
  }

  // rams: barrel + rod, re-aimed every frame
  const rams = [1, -1].map((s) => ({
    s,
    barrel: mesh(new THREE.CylinderGeometry(0.09, 0.09, 1, 14), M.chassis, 0, 0, 0),
    rod: mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 12), M.chrome, 0, 0, 0),
  }))

  // the skip and its chains
  const skip = buildSkip()
  body.add(skip)
  const chainMat = M.chain
  const chains = skip.userData.lugs.map(() => mesh(new THREE.CylinderGeometry(0.022, 0.022, 1, 6), chainMat, 0, 0, 0))

  const UP = new THREE.Vector3(0, 1, 0)
  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), dir = new THREE.Vector3()
  const span = (m, a, b) => {
    dir.subVectors(b, a)
    const len = dir.length()
    m.position.copy(a).addScaledVector(dir, 0.5)
    m.quaternion.setFromUnitVectors(UP, dir.normalize())
    m.scale.set(1, len, 1)
  }

  const TH0 = 0.627 // stowed, leaning forward over the bed
  const TH1 = -1.19 // swung back, skip on the ground
  const BED = 1.08
  const HANG = BED - (PIVOT.y + ARM * Math.cos(TH0)) // skip origin below arm tip
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
  const clamp = (v) => Math.min(1, Math.max(0, v))

  function setLower(t) {
    const legT = ease(clamp(t / 0.18))
    legs.forEach((l) => (l.position.y = 0.95 - legT * 0.5))
    const a = ease(clamp((t - 0.14) / 0.86))
    const th = TH0 + (TH1 - TH0) * a
    arms.rotation.z = -th
    const tipX = PIVOT.x + ARM * Math.sin(th)
    const tipY = PIVOT.y + ARM * Math.cos(th)
    skip.position.set(tipX, Math.max(0, tipY + HANG), 0)

    skip.userData.lugs.forEach((lug, i) => {
      tmpA.set(tipX, tipY - 0.05, lug.z > 0 ? 1.12 : -1.12)
      tmpB.copy(lug).add(skip.position)
      span(chains[i], tmpA, tmpB)
    })
    rams.forEach(({ s, barrel, rod }) => {
      tmpA.set(-2.3, 1.12, s * 0.78)
      tmpB.set(PIVOT.x + 1.5 * Math.sin(th), PIVOT.y + 1.5 * Math.cos(th), s * 0.9)
      const mid = tmpA.clone().lerp(tmpB, 0.55)
      span(barrel, tmpA, mid)
      span(rod, mid, tmpB)
    })
  }
  setLower(0)

  let rolled = 0
  function roll(dx) {
    rolled += dx
    wheels.forEach((w) => (w.rotation.z = -rolled / 0.53))
  }

  return { group: g, body, skip, setLower, roll }
}
