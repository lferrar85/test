import * as THREE from 'three'
import { makeRenderer, makeScene } from './three/stage.js'
import { brandReady, asphaltTexture, fadeAlpha } from './three/materials.js'
import { buildLorry } from './three/lorry.js'

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a, b, t) => a + (b - a) * t
const easeOut = (t) => 1 - Math.pow(1 - t, 3)
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t) }

export async function initHero({ canvas, section, onProgress, reduceMotion }) {
  await brandReady()
  const renderer = makeRenderer(canvas)
  const { scene } = makeScene(renderer, { span: 14, shadow: 0.34 })

  // road
  const tex = asphaltTexture()
  tex.repeat.set(10, 1)
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 7.5),
    new THREE.MeshStandardMaterial({ map: tex, alphaMap: fadeAlpha(), transparent: true, roughness: 0.95 }),
  )
  road.rotation.x = -Math.PI / 2
  road.position.set(-4, 0.002, -0.6)
  road.receiveShadow = true
  scene.add(road)

  const lorry = buildLorry()
  scene.add(lorry.group)

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200)
  const target = new THREE.Vector3()

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  window.addEventListener('resize', resize)

  // pointer: gentle parallax + drag to turn the lorry
  let mx = 0, my = 0, yaw = 0, yawV = 0, dragging = false, lastX = 0
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect()
    mx = ((e.clientX - r.left) / r.width) * 2 - 1
    my = ((e.clientY - r.top) / r.height) * 2 - 1
    if (dragging) { yaw += (e.clientX - lastX) * 0.006; lastX = e.clientX }
  })
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId) })
  canvas.addEventListener('pointerup', () => (dragging = false))
  canvas.addEventListener('pointercancel', () => (dragging = false))

  // only render while the hero is on screen
  let visible = true
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(section)

  const DRIVE = reduceMotion ? 0 : 7.5 // seconds: a slow, heavy arrival
  const START_X = -26, END_X = -0.4
  let prevX = START_X
  const t0 = performance.now()

  function frame(now) {
    requestAnimationFrame(frame)
    if (!visible) return
    const t = (now - t0) / 1000

    // drive in, then idle
    const d = DRIVE ? easeOut(clamp((t - 0.6) / DRIVE)) : 1
    const x = lerp(START_X, END_X, d)
    lorry.group.position.x = x
    lorry.roll(x - prevX)
    prevX = x
    const moving = d < 1 ? 1 - d : 0
    lorry.body.position.y = Math.sin(t * 9) * 0.012 * moving + Math.sin(t * 2.1) * 0.003
    lorry.body.rotation.x = Math.sin(t * 5.3) * 0.004 * moving

    // scroll: lower the skip, camera swings round to watch it land
    const rect = section.getBoundingClientRect()
    const p = clamp(-rect.top / Math.max(1, rect.height - window.innerHeight))
    const lower = smooth(0.08, 0.8, p)
    lorry.setLower(d < 1 ? 0 : lower)
    onProgress?.(p, d)

    // drag yaw springs back when released
    if (!dragging) { yawV += -yaw * 0.04; yawV *= 0.82; yaw += yawV }
    lorry.group.rotation.y = clamp(yaw, -0.9, 0.9)

    const narrow = camera.aspect < 1
    const az = lerp(0.62, -0.32, smooth(0, 1, p)) + mx * 0.06
    const R = (narrow ? 36 : 21) + lower * 4
    const camY = 1.75 + my * -0.2 + lower * 1.2
    target.set(lerp(-1.4, -3.6, lower) + END_X, lerp(2.0, 1.6, lower) + (narrow ? 4.5 : 0), 0)
    camera.position.set(target.x + Math.sin(az) * R, camY, Math.cos(az) * R)
    camera.lookAt(target)
    camera.filmOffset = narrow ? 0 : -4.2
    camera.updateProjectionMatrix()

    renderer.clear()
    renderer.render(scene, camera)
  }
  requestAnimationFrame(frame)
}
