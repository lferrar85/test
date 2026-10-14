// Offline renderer for the site's product shots. Driven by tools/render-assets.mjs.
import * as THREE from 'three'
import { makeRenderer, makeScene } from '../src/three/stage.js'
import { brandReady } from '../src/three/materials.js'
import { buildSkip, buildRoro } from '../src/three/skip.js'
import { buildLorry } from '../src/three/lorry.js'

const canvas = document.getElementById('c')
let renderer, scene

window.ready = (async () => {
  await brandReady()
  renderer = makeRenderer(canvas, { keep: true })
  scene = makeScene(renderer, { span: 10, shadow: 0.32 }).scene
})()

function shoot(obj, { w = 1000, h = 760, cam = [3.9, 3.0, 6.2], look = [0, 0.95, 0], fov = 32 } = {}) {
  renderer.setPixelRatio(1)
  renderer.setSize(w, h, false)
  const camera = new THREE.PerspectiveCamera(fov, w / h, 0.1, 100)
  camera.position.set(...cam)
  camera.lookAt(...look)
  scene.add(obj)
  renderer.render(scene, camera)
  const url = canvas.toDataURL('image/png')
  scene.remove(obj)
  return url
}

window.renderSkip = (fill, opts = {}) => shoot(buildSkip({ fill, seed: opts.seed || 3 }), opts)

window.renderSize = (m3) => {
  const k = Math.cbrt(m3 / 6)
  const s = buildSkip()
  s.scale.setScalar(k)
  return shoot(s, { w: 800, h: 560, cam: [4.6, 3.1, 7.6], look: [0, 0.95, 0] })
}

window.renderRoro = () => shoot(buildRoro(), { w: 800, h: 560, cam: [7.2, 4.4, 10.5], look: [0, 1.0, 0] })

window.renderLorry = (lower = 0, opts = {}) => {
  const l = buildLorry()
  l.setLower(lower)
  return shoot(l.group, { w: 1600, h: 900, cam: [8, 2.4, 13], look: [-1.2, 1.7, 0], fov: 30, ...opts })
}
