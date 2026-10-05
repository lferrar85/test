// Home page hero: an Earth-at-dusk scene whose sun follows the Roof Dial, then step 1 of the calculator.
import { loadState, saveState, siteConfig } from './state.js';
import { mountStart } from './start-form.js';
import { mountEarthBlaze } from './earth-blaze.js';

const host = document.querySelector('[data-mount="start"]');
const space = document.querySelector('[data-space]');
if (host) {
  const cfg = siteConfig();
  const state = loadState();
  const small = matchMedia('(max-width: 700px)').matches;

  let blaze = null;
  if (space) {
    try {
      blaze = mountEarthBlaze(space, {
        starCount: small ? 900 : 1800,
        textureUrl: space.dataset.texture || '', // optional photograph; a generated Earth is used otherwise
        illumination: 1.7,
        surfaceBrightness: 1.6,
        galaxyBrightness: 1.35,
        auroraColor: '#ffcc00', auroraAlpha: 0.92, // solar-yellow aurora
        backgroundColor: '#c98a00', backgroundAlpha: 0.5, // warm gold nebula
      });
    } catch {
      blaze = null;
    }
  }

  // The sun follows the pointer across the whole hero. Press and hold on the sky to charge an
  // aurora, release to send it along the horizon.
  const hero = space && space.closest('.hero');
  if (blaze && hero) {
    hero.addEventListener('pointermove', (e) => blaze.aim(e.clientX, e.clientY));
    hero.addEventListener('pointerleave', () => blaze.rest());
    hero.addEventListener('pointerdown', (e) => {
      if (e.button === 0 && !e.target.closest('.hero-tool, a, button, input, select')) blaze.hold(true);
    });
    for (const t of ['pointerup', 'pointercancel']) window.addEventListener(t, () => blaze.hold(false));
  }

  mountStart(host, {
    state,
    onDone() {
      state.step = 'roof';
      saveState(state);
      const go = () => { location.href = `${cfg.links.calculator}#roof`; };
      if (blaze && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        blaze.celebrate(); // a burst of aurora, then on to the calculator
        setTimeout(go, 750);
      } else go();
    },
  });
}
