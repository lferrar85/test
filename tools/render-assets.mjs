// Usage: node tools/render-assets.mjs [preview]
// Needs the Vite dev server on :5173. Writes PNGs to tools/out/, then convert to webp.
import { chromium } from 'playwright'
import { writeFileSync, mkdirSync } from 'node:fs'

const out = new URL('./out/', import.meta.url).pathname
mkdirSync(out, { recursive: true })
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
const page = await browser.newPage()
page.on('pageerror', (e) => console.log('PAGE ERROR', e.message))
page.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text()))
await page.goto('http://127.0.0.1:5173/tools/render.html', { waitUntil: 'networkidle' })
await page.evaluate(() => window.ready)
const save = (name, url) => writeFileSync(out + name + '.png', Buffer.from(url.split(',')[1], 'base64'))

const preview = process.argv[2] === 'preview'
const jobs = preview
  ? [['lorry', 'renderLorry', [0]], ['lorry-side', 'renderLorry', [0, { cam: [-1, 2.0, 15], look: [-0.6, 1.8, 0] }]], ['lorry-down', 'renderLorry', [1, { cam: [2, 2.6, 16], look: [-2.5, 1.6, 0] }]]]
  : [
      ...['general', 'garden', 'muck', 'inert', 'hardcore', 'plasterboard', 'wood', 'metal', 'mixed', 'empty', 'asbestos']
        .map((f) => ['skip-' + f, 'renderSkip', [f]]),
      ...[3, 4, 6, 8, 12].map((m) => ['size-' + m, 'renderSize', [m]]),
      ['size-roro', 'renderRoro', []],
      ['lorry', 'renderLorry', [0]],
      ['lorry-down', 'renderLorry', [1]],
    ]
for (const [name, fn, args] of jobs) {
  const t = Date.now()
  save(name, await page.evaluate(([fn, args]) => window[fn](...args), [fn, args]))
  console.log(name, Date.now() - t, 'ms')
}
await browser.close()
