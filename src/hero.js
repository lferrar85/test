import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { brandReady } from './three/materials.js'
import { buildLorry } from './three/lorry.js'
import { buildSkip } from './three/skip.js'
import { buildYard } from './three/yard.js'

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a, b, t) => a + (b - a) * t
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t) }
const easeOutQuint = (t) => 1 - Math.pow(1 - t, 5)

export async function initHero({ canvas, section, onProgress, reduceMotion }) {
  await brandReady()

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.95
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.6

  // low golden-hour sun from behind-left, like the reference footage
  const sun = new THREE.DirectionalLight(0xffd9a8, 3.2)
  sun.position.set(-14, 9, -10)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 60 })
  sun.shadow.bias = -0.0004
  sun.shadow.normalBias = 0.03
  scene.add(sun, sun.target)
  const fill = new THREE.DirectionalLight(0xbfd6f2, 1.1)
  fill.position.set(12, 6, 10)
  scene.add(fill)
  scene.add(new THREE.HemisphereLight(0xcfe0f5, 0x8a7d6a, 0.7))

  buildYard(scene)

  // two spare skips parked in the yard
  for (const [x, z, ry] of [[5.5, -9.5, 0.9], [9, -11, 0.7]]) {
    const sk = buildSkip({ fill: 'empty' })
    sk.position.set(x, 0, z); sk.rotation.y = ry
    scene.add(sk)
  }

  const lorry = buildLorry()
  scene.add(lorry.group)
  // drives in on a gentle diagonal towards camera, then stops
  const PATH_START = new THREE.Vector3(-30, 0, -14)
  const PATH_END = new THREE.Vector3(0, 0, 0)
  const heading = Math.atan2(-(PATH_END.z - PATH_START.z), PATH_END.x - PATH_START.x)
  lorry.group.rotation.y = heading

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 600)
  const look = new THREE.Vector3()

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  window.addEventListener('resize', resize)

  let mx = 0, my = 0
  window.addEventListener('pointermove', (e) => { mx = (e.clientX / innerWidth) * 2 - 1; my = (e.clientY / innerHeight) * 2 - 1 })

  let visible = true
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(section)

  const DRIVE = reduceMotion ? 0 : 9 // seconds: heavy, unhurried arrival
  const t0 = performance.now()
  let last = t0, prevDist = 0
  let sp = 0, smx = 0, smy = 0 // smoothed scroll + pointer
  const pathLen = PATH_START.distanceTo(PATH_END)

  function frame(now) {
    requestAnimationFrame(frame)
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (!visible) return
    const t = (now - t0) / 1000

    // drive in: long quintic ease so it rolls to a soft stop
    const d = DRIVE ? easeOutQuint(clamp((t - 0.3) / DRIVE)) : 1
    lorry.group.position.lerpVectors(PATH_START, PATH_END, d)
    const dist = d * pathLen
    lorry.roll(dist - prevDist)
    prevDist = dist
    const moving = 1 - d
    lorry.body.position.y = Math.sin(t * 7) * 0.01 * moving
    lorry.body.rotation.x = Math.sin(t * 4.3) * 0.003 * moving
    // settle: a slight forward nod as it stops
    lorry.body.rotation.z = -Math.sin(clamp((d - 0.9) / 0.1) * Math.PI) * 0.008

    // scroll, smoothed so the skip moves like hydraulics, never jumps
    const rect = section.getBoundingClientRect()
    const p = clamp(-rect.top / Math.max(1, rect.height - innerHeight))
    sp += (p - sp) * (1 - Math.exp(-dt * 5))
    smx += (mx - smx) * (1 - Math.exp(-dt * 3))
    smy += (my - smy) * (1 - Math.exp(-dt * 3))
    const lower = d < 1 ? 0 : smooth(0.1, 0.85, sp)
    lorry.setLower(lower)
    onProgress?.(sp, d)

    // camera: low front three-quarter, slow push-in, swings to the side as the skip lands
    const narrow = camera.aspect < 0.9
    const intro = smooth(0, 1, t / (DRIVE + 1.5))
    const drop = smooth(0.02, 0.5, sp) // headline clears, camera centres on the drop
    const az = lerp(0.95, 0.62, intro) + lerp(0, -0.75, drop) + smx * 0.04
    const R = (narrow ? 30 : lerp(19, 15.5, intro)) + drop * 5.5
    const camY = lerp(1.1, 1.6, intro) + drop * 1.6 - smy * 0.15 + (narrow ? 2.5 : 0)
    look.set(lerp(0.2, -2.6, drop), 1.7 + (narrow ? 2.2 : 0) - drop * 0.3, 0).applyAxisAngle(THREE.Object3D.DEFAULT_UP, heading)
    camera.position.set(look.x + Math.sin(az + heading) * R, camY, look.z + Math.cos(az + heading) * R)
    camera.lookAt(look)
    // lorry sits right of the headline, then moves to centre stage for the drop
    camera.filmOffset = narrow ? 0 : lerp(-5.2, 0, drop)
    camera.updateProjectionMatrix()

    renderer.render(scene, camera)
  }
  requestAnimationFrame(frame)
}
