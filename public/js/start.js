// Home page hero: Ray the cat watches the cursor and chats about your roof, next to step 1 of the calculator.
import { loadState, saveState, siteConfig } from './state.js';
import { mountStart } from './start-form.js';
import { mountRay } from './mascot.js';
import { compassName } from './model.js';

const host = document.querySelector('[data-mount="start"]');
const mascotEl = document.querySelector('[data-mascot]');
if (host) {
  const cfg = siteConfig();
  const state = loadState();
  const ray = mascotEl ? mountRay(mascotEl) : null;

  // What Ray says about each roof direction. Honest, short, and never a sales line.
  const LINES = {
    'South': 'South-facing. That’s the jackpot for solar.',
    'South-east': 'Nearly south, with morning sun. Lovely.',
    'South-west': 'Nearly south, with the afternoon sun. Lovely.',
    'East': 'East-facing: morning sun. Still worth doing the sums.',
    'West': 'West-facing: evening sun, handy when you’re home.',
    'North-east': 'Leaning north. Less sun, but let’s see the numbers.',
    'North-west': 'Leaning north. Less sun, but let’s see the numbers.',
    'North': 'North-facing. Honest answer: the hardest roof for solar. Let’s check anyway.',
  };
  let lastLine = '';
  let lineTimer = 0;
  let first = true;
  const sayRoof = (az) => {
    if (first) { first = false; return; } // the dial reports its starting position; Ray's hello stays up
    const line = LINES[compassName(az)] || '';
    if (!line || line === lastLine) return;
    lastLine = line;
    clearTimeout(lineTimer);
    lineTimer = setTimeout(() => ray?.say(line), 220); // let the dial settle before Ray chimes in
  };

  const hero = mascotEl && mascotEl.closest('.hero');
  if (ray && hero) {
    hero.addEventListener('pointermove', (e) => ray.aim(e.clientX, e.clientY));
    hero.addEventListener('pointerleave', () => ray.rest());
    // Keyboard and touch users: Ray looks at whatever you're filling in.
    host.addEventListener('focusin', (e) => { if (e.target.matches('input, button, [tabindex]')) ray.lookAt(e.target); });
  }

  mountStart(host, {
    state,
    onAzimuth: sayRoof,
    onPlace(place) {
      if (ray && place) ray.say(`${place}? Lovely. Now, which way does the roof face?`);
    },
    onDone() {
      state.step = 'roof';
      saveState(state);
      const go = () => { location.href = `${cfg.links.calculator}#roof`; };
      if (ray && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        ray.celebrate('Right. Let’s see what that roof is worth.');
        setTimeout(go, 900);
      } else go();
    },
  });
}
