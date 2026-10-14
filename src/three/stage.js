import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export function makeRenderer(canvas, { keep = false } = {}) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: keep })
  r.outputColorSpace = THREE.SRGBColorSpace
  r.toneMapping = THREE.NeutralToneMapping
  r.toneMappingExposure = 0.92
  r.shadowMap.enabled = true
  r.shadowMap.type = THREE.PCFSoftShadowMap
  r.setClearColor(0x000000, 0)
  return r
}

export function makeScene(renderer, { span = 12, shadow = 0.3 } = {}) {
  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environmentIntensity = 0.7

  const key = new THREE.DirectionalLight(0xfff4e6, 2.6)
  key.position.set(7, 13, 9)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  Object.assign(key.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 1, far: 50 })
  key.shadow.bias = -0.0004
  key.shadow.normalBias = 0.03
  scene.add(key, key.target)

  const fill = new THREE.DirectionalLight(0xcfe3ff, 0.7)
  fill.position.set(-8, 5, -6)
  scene.add(fill)
  scene.add(new THREE.HemisphereLight(0xe3efff, 0x50463c, 0.55))

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: shadow }))
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)
  return { scene, key, ground }
}
