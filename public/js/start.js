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

  // East is the left of the horizon, west the right, south the middle.
  const sunFraction = (az) => {
    const d = ((((az - 180) % 360) + 540) % 360) - 180;
    // keep the sun on the open part of the sky, clear of the form card on the right
    return 0.05 + 0.55 * (0.5 + 0.5 * Math.max(-1, Math.min(1, d / 90)));
  };

  mountStart(host, {
    state,
    onAzimuth: (az) => blaze && blaze.setSun(sunFraction(az)),
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
