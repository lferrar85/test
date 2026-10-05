// Home page hero: step 1 of the calculator, then hand over to /solar-calculator#roof.
import { loadState, saveState, siteConfig } from './state.js';
import { mountStart } from './start-form.js';

const host = document.querySelector('[data-mount="start"]');
if (host) {
  const cfg = siteConfig();
  const state = loadState();
  mountStart(host, {
    state,
    onDone() {
      state.step = 'roof';
      saveState(state);
      location.href = `${cfg.links.calculator}#roof`;
    },
  });
}
