import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { SKIP } from './skip.js'

const std = (color, roughness = 0.9, metalness = 0, extra = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness, flatShading: extra.flat ?? false, ...extra })

const MATS = {
  rock: [0x9a978f, 0x86837b, 0xa9a59c, 0x7b7871].map((c) => std(c, 0.95, 0, { flat: true })),
  brick: [0xa04a2c, 0xb25a36, 0x8a3e25, 0x9c5133].map((c) => std(c, 0.9, 0, { flat: true })),
  concrete: [0xa3a19a, 0x8f8d86].map((c) => std(c, 0.95, 0, { flat: true })),
  bag: [std(0x141618, 0.32), std(0x1c1f22, 0.35), std(0x121314, 0.3), std(0xd8dadb, 0.45), std(0x3a3d40, 0.4)],
  card: [std(0xb88a55, 0.92), std(0xa77945, 0.92), std(0xc79d68, 0.92)],
  wood: [0xb98552, 0x9a6a3c, 0xc79a66, 0x7f5530, 0xd2ab78].map((c) => std(c, 0.85)),
  leaf: [0x2f5a1f, 0x3d6e27, 0x24481a, 0x557d2e, 0x6a8a35, 0x4a6b24].map((c) => std(c, 0.8, 0, { flat: true })),
  branch: std(0x5b4030, 0.9),
  soil: [0x4e3524, 0x5b3f2a, 0x3f2a1c].map((c) => std(c, 1, 0, { flat: true })),
  board: [std(0xebe8e1, 0.85), std(0xe2ded5, 0.85), std(0xd9d4c9, 0.9)],
  sheet: [std(0xa3a9b0, 0.32, 0.9), std(0x8e959c, 0.4, 0.85), std(0x7a4a2c, 0.85, 0.35)],
  copper: std(0xb87333, 0.32, 1),
  pipe: std(0x9aa0a7, 0.3, 0.9),
  rust: std(0x6f3f22, 0.9, 0.3),
}

const HEAP = {
  general: { color: 0x4f4a43, bump: 0.42 },
  garden: { color: 0x3a5222, bump: 0.5 },
  muck: { color: 0x4a3221, bump: 0.62 },
  inert: { color: 0x6a5644, bump: 0.45 },
  hardcore: { color: 0x8a877f, bump: 0.48 },
  plasterboard: { color: 0xcfcac0, bump: 0.2 },
  wood: { color: 0x6b4a2e, bump: 0.25 },
  metal: { color: 0x55585c, bump: 0.3 },
  mixed: { color: 0x575047, bump: 0.42 },
}

export function fillSkip(type, seed = 1) {
  let s = seed * 9301 + 49297
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  const r = (a, b) => a + rnd() * (b - a)
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)]

  const { Lt, W, H, foot } = SKIP
  const rimY = foot + H
  const spec = HEAP[type] || HEAP.mixed
  const g = new THREE.Group()

  const heapY = (x, z) => {
    const ux = Math.max(0, 1 - (x / (Lt / 2)) ** 2), uz = Math.max(0, 1 - (z / (W / 2)) ** 2)
    const n = Math.sin(x * 3.1 + seed) * 0.04 + Math.cos(z * 4.7 + x * 1.3) * 0.035 + Math.sin(x * 9 + z * 7) * 0.015
    return rimY - 0.14 + spec.bump * Math.pow(ux, 0.7) * Math.pow(uz, 0.8) + n
  }

  // the heap surface under everything, so there are no gaps
  const heap = new THREE.PlaneGeometry(Lt * 0.98, W * 0.94, 60, 30)
  heap.rotateX(-Math.PI / 2)
  const pos = heap.attributes.position
  for (let i = 0; i < pos.count; i++) pos.setY(i, heapY(pos.getX(i), pos.getZ(i)))
  heap.computeVertexNormals()
  const hm = new THREE.Mesh(heap, std(spec.color, 1, 0, { flat: true }))
  hm.receiveShadow = true
  g.add(hm)

  const place = (mesh, { sink = 0.3, size = 0.3, spreadX = 0.43, spreadZ = 0.38, rot = true } = {}) => {
    const x = r(-Lt * spreadX, Lt * spreadX), z = r(-W * spreadZ, W * spreadZ)
    mesh.position.set(x, heapY(x, z) + size * (1 - sink), z)
    if (rot) mesh.rotation.set(r(0, Math.PI), r(0, Math.PI), r(0, Math.PI))
    mesh.castShadow = mesh.receiveShadow = true
    g.add(mesh)
    return mesh
  }

  const lump = (geo, amt) => {
    geo.deleteAttribute('normal'); geo.deleteAttribute('uv')
    geo = mergeVertices(geo)
    const p = geo.attributes.position
    for (let i = 0; i < p.count; i++) {
      p.setXYZ(i, p.getX(i) * (1 + r(-amt, amt)), p.getY(i) * (1 + r(-amt, amt)), p.getZ(i) * (1 + r(-amt, amt)))
    }
    geo.computeVertexNormals()
    return geo
  }

  const rock = (sz) => place(new THREE.Mesh(lump(new THREE.DodecahedronGeometry(sz, 0), 0.28), pick(MATS.rock)), { size: sz })
  const concrete = () => {
    const m = new THREE.Mesh(lump(new THREE.BoxGeometry(r(0.35, 0.7), r(0.14, 0.26), r(0.3, 0.5), 2, 1, 2), 0.12), pick(MATS.concrete))
    return place(m, { size: 0.15 })
  }
  const brick = () => place(new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.085, 0.14), pick(MATS.brick)), { size: 0.06, sink: 0.1 })
  const bag = () => {
    const sz = r(0.28, 0.4)
    const geo = lump(new THREE.SphereGeometry(sz, 28, 20), 0.05)
    const m = new THREE.Mesh(geo, pick(MATS.bag))
    m.scale.set(1.15, 0.78, 0.95)
    const knot = new THREE.Mesh(new THREE.SphereGeometry(sz * 0.18, 8, 6), m.material)
    knot.position.set(0, sz * 0.95, 0)
    m.add(knot)
    return place(m, { size: sz * 0.7, sink: 0.25, rot: false })
  }
  const card = () => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(r(0.35, 0.65), r(0.25, 0.45), r(0.3, 0.5)), pick(MATS.card))
    return place(m, { size: 0.2 })
  }
  const plank = (min = 0.9, max = 1.8) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(r(min, max), r(0.03, 0.05), r(0.09, 0.18)), pick(MATS.wood))
    place(m, { size: 0.05, sink: 0, rot: false, spreadX: 0.38 })
    m.rotation.set(r(-0.25, 0.25), r(0, Math.PI), r(-0.45, 0.45))
    return m
  }
  const pallet = () => {
    const p = new THREE.Group()
    const mat = pick(MATS.wood)
    for (const z of [-0.45, 0, 0.45]) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.1), mat); b.position.set(0, 0, z); p.add(b) }
    for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.025, 1.0), mat); b.position.set(-0.52 + i * 0.21, 0.065, 0); p.add(b) }
    p.traverse((o) => (o.castShadow = o.receiveShadow = true))
    place(p, { size: 0.1, sink: 0, rot: false, spreadX: 0.3, spreadZ: 0.15 })
    p.rotation.set(r(-0.5, 0.5), r(0, Math.PI), r(-0.4, 0.4))
    return p
  }
  const leaf = () => {
    const sz = r(0.1, 0.2)
    const m = new THREE.Mesh(lump(new THREE.IcosahedronGeometry(sz, 1), 0.45), pick(MATS.leaf))
    m.scale.set(r(0.8, 1.5), r(0.5, 0.9), r(0.8, 1.4))
    return place(m, { size: sz * 0.7, sink: 0.4 })
  }
  const branch = () => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.028, r(0.8, 1.5), 6), MATS.branch)
    place(m, { size: 0.1, sink: 0, rot: false })
    m.rotation.set(r(-1.2, 1.2), r(0, Math.PI), r(0.6, 1.4) * (rnd() > 0.5 ? 1 : -1))
    return m
  }
  const clod = () => {
    const sz = r(0.14, 0.3)
    return place(new THREE.Mesh(lump(new THREE.IcosahedronGeometry(sz, 1), 0.3), pick(MATS.soil)), { size: sz, sink: 0.5 })
  }
  const board = (min = 0.5, max = 1.25) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(r(min, max), 0.028, r(0.4, 0.9)), pick(MATS.board))
    place(m, { size: 0.05, sink: 0, rot: false, spreadX: 0.36 })
    m.rotation.set(r(-0.35, 0.35), r(0, Math.PI), r(-0.35, 0.35))
    return m
  }
  const sheet = () => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(r(0.7, 1.3), 0.014, r(0.45, 0.9)), pick(MATS.sheet))
    place(m, { size: 0.05, sink: 0, rot: false, spreadX: 0.36 })
    m.rotation.set(r(-0.5, 0.5), r(0, Math.PI), r(-0.5, 0.5))
    return m
  }
  const pipe = (mat = MATS.pipe) => {
    const rad = r(0.035, 0.07)
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, r(1.2, 2.2), 16, 1, true), mat)
    m.material.side = THREE.DoubleSide
    place(m, { size: 0.08, sink: 0, rot: false, spreadX: 0.32 })
    m.rotation.set(r(-0.3, 0.3), r(0, Math.PI), Math.PI / 2 + r(-0.4, 0.4))
    return m
  }
  const girder = () => {
    const b = new THREE.Group()
    const len = r(1.4, 2.3)
    for (const y of [-0.09, 0.09]) { const f = new THREE.Mesh(new THREE.BoxGeometry(len, 0.02, 0.14), MATS.rust); f.position.y = y; b.add(f) }
    b.add(new THREE.Mesh(new THREE.BoxGeometry(len, 0.18, 0.02), MATS.rust))
    b.traverse((o) => (o.castShadow = o.receiveShadow = true))
    place(b, { size: 0.1, sink: 0, rot: false, spreadX: 0.25 })
    b.rotation.set(r(-0.2, 0.2), r(0, Math.PI), r(-0.25, 0.25))
    return b
  }
  const times = (n, f) => { for (let i = 0; i < n; i++) f() }

  switch (type) {
    case 'general': times(16, bag); times(10, card); times(4, () => plank(0.8, 1.4)); times(3, () => sheet()); break
    case 'garden': times(150, leaf); times(22, branch); break
    case 'muck': times(36, clod); times(6, () => rock(r(0.12, 0.2))); break
    case 'inert': times(34, brick); times(16, () => rock(r(0.14, 0.26))); times(12, clod); times(4, concrete); break
    case 'hardcore': times(36, () => rock(r(0.14, 0.3))); times(12, concrete); times(18, brick); break
    case 'plasterboard': times(18, () => board()); times(18, () => board(0.25, 0.5)); break
    case 'wood': times(32, () => plank()); times(3, pallet); break
    case 'metal': times(9, sheet); times(12, () => pipe()); times(5, () => pipe(MATS.copper)); times(4, girder); break
    default: times(7, bag); times(10, () => plank(0.8, 1.6)); times(12, brick); times(8, () => rock(r(0.14, 0.24))); times(4, card); times(3, sheet); times(10, leaf); break
  }
  return g
}
