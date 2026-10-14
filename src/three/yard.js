import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { canvasTex } from './materials.js'

/* A golden-hour aggregate yard: sky dome, concrete ground with tyre tracks,
   gravel piles and a conveyor fading into the haze. */
const HAZE = 0xd9d3c8

let s = 17
const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647

function concreteTexture() {
  const w = 1024, h = 1024
  const cv = Object.assign(document.createElement('canvas'), { width: w, height: h })
  const ctx = cv.getContext('2d')
  ctx.fillStyle = '#b8b0a3'
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 60000; i++) {
    const v = rnd()
    ctx.fillStyle = v > 0.5 ? `rgba(255,250,240,${rnd() * 0.12})` : `rgba(60,50,40,${rnd() * 0.12})`
    ctx.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 2)
  }
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(80,70,60,${0.03 + rnd() * 0.05})`
    ctx.beginPath(); ctx.ellipse(rnd() * w, rnd() * h, 40 + rnd() * 160, 20 + rnd() * 80, rnd() * 3, 0, Math.PI * 2); ctx.fill()
  }
  // tyre tracks
  ctx.strokeStyle = 'rgba(70,60,50,0.16)'
  for (let i = 0; i < 8; i++) {
    ctx.lineWidth = 14 + rnd() * 10
    const y = rnd() * h
    ctx.beginPath(); ctx.moveTo(0, y)
    ctx.bezierCurveTo(w * 0.3, y + (rnd() - 0.5) * 300, w * 0.6, y + (rnd() - 0.5) * 300, w, y + (rnd() - 0.5) * 200)
    ctx.stroke()
  }
  const t = canvasTex(cv)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(14, 14)
  return t
}

function skyDome() {
  const geo = new THREE.SphereGeometry(400, 32, 16)
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { sun: { value: new THREE.Vector3(-0.55, 0.16, -0.82).normalize() } },
    vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `
      varying vec3 vDir; uniform vec3 sun;
      void main(){
        float h = clamp(vDir.y, -0.1, 1.0);
        vec3 horizon = vec3(0.92, 0.86, 0.78);
        vec3 mid = vec3(0.62, 0.72, 0.84);
        vec3 top = vec3(0.30, 0.47, 0.70);
        vec3 c = mix(horizon, mid, smoothstep(0.0, 0.18, h));
        c = mix(c, top, smoothstep(0.18, 0.75, h));
        float d = max(dot(normalize(vDir), sun), 0.0);
        c += vec3(1.0, 0.82, 0.55) * (pow(d, 12.0) * 0.55 + pow(d, 400.0) * 1.6);
        gl_FragColor = vec4(c, 1.0);
      }`,
  })
  return new THREE.Mesh(geo, mat)
}

let _gravel
function gravelTexture() {
  if (_gravel) return _gravel
  const w = 512, h = 512
  const cv = Object.assign(document.createElement('canvas'), { width: w, height: h })
  const ctx = cv.getContext('2d')
  ctx.fillStyle = '#a49985'
  ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 30000; i++) {
    const v = 90 + rnd() * 120
    ctx.fillStyle = `rgba(${v},${v * 0.95},${v * 0.86},${0.35 + rnd() * 0.5})`
    ctx.beginPath(); ctx.arc(rnd() * w, rnd() * h, 0.6 + rnd() * 2.2, 0, Math.PI * 2); ctx.fill()
  }
  _gravel = canvasTex(cv)
  _gravel.wrapS = _gravel.wrapT = THREE.RepeatWrapping
  _gravel.repeat.set(6, 3)
  return _gravel
}

function pile(radius, height, color) {
  // smooth mound profile, turned on a lathe: no faceting
  const pts = []
  for (let i = 0; i <= 24; i++) {
    const t = i / 24
    const r = radius * (1 - t)
    const y = height * (1 - Math.pow(1 - t, 1.35)) * (t < 0.92 ? 1 : 1 - (t - 0.92) * 0.6)
    pts.push(new THREE.Vector2(Math.max(r, 0.001), y))
  }
  const geo = new THREE.LatheGeometry(pts, 72)
  const mat = new THREE.MeshStandardMaterial({ color, map: gravelTexture(), roughness: 1 })
  const m = new THREE.Mesh(geo, mat)
  m.scale.z = 0.8 + rnd() * 0.3
  m.castShadow = true
  return m
}

function conveyor(len, angle) {
  const g = new THREE.Group()
  const mat = new THREE.MeshStandardMaterial({ color: 0x8a8174, roughness: 0.8, metalness: 0.4 })
  const belt = new THREE.Group()
  belt.rotation.z = angle
  g.add(belt)
  for (const z of [0.5, -0.5]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.18, 0.1), mat)
    rail.position.set(len / 2, 0, z); belt.add(rail)
  }
  for (let x = 0.5; x < len; x += 1.4) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 1.0), mat)
    r.position.set(x, -0.15, 0); r.rotation.z = 0.6; belt.add(r)
  }
  const top = new THREE.Mesh(new THREE.BoxGeometry(len, 0.05, 0.9), new THREE.MeshStandardMaterial({ color: 0x2a2724, roughness: 0.9 }))
  top.position.set(len / 2, 0.08, 0); belt.add(top)
  for (const f of [0.35, 0.7]) {
    const x = Math.cos(angle) * len * f, y = Math.sin(angle) * len * f
    for (const z of [0.5, -0.5]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, y, 0.14), mat)
      leg.position.set(x, y / 2, z); g.add(leg)
    }
  }
  const hopper = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 0.6, 2.2, 4, 1, true), mat)
  hopper.position.set(Math.cos(angle) * len, Math.sin(angle) * len + 0.8, 0)
  hopper.rotation.y = Math.PI / 4
  g.add(hopper)
  g.traverse((o) => (o.castShadow = true))
  return g
}

export function buildYard(scene) {
  scene.fog = new THREE.Fog(HAZE, 28, 110)
  scene.add(skyDome())

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(300, 64),
    new THREE.MeshStandardMaterial({ map: concreteTexture(), roughness: 0.95, metalness: 0 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  const piles = [
    [-18, -26, 9, 6.5, 0xa59a88], [-4, -34, 11, 7.5, 0x8c8478], [12, -30, 8, 5.5, 0xb3a58e],
    [-34, -14, 7, 4.5, 0x9b9283], [26, -42, 13, 8.5, 0x988f80], [-30, -40, 10, 7, 0xaea493],
    [22, -14, 4, 2.4, 0x8f8779],
  ]
  for (const [x, z, r, h, c] of piles) {
    const p = pile(r, h, c)
    p.position.x = x; p.position.z = z
    scene.add(p)
  }
  const cv = conveyor(22, 0.42)
  cv.position.set(-30, 0, -26)
  cv.rotation.y = -0.35
  scene.add(cv)
  const cv2 = conveyor(16, 0.36)
  cv2.position.set(14, 0, -46)
  cv2.rotation.y = 2.6
  scene.add(cv2)

  // a row of distant skips waiting in the yard
  return ground
}
