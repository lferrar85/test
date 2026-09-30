/* Inner pages: nav, menu, year, enquiry form. No scroll scenes here. */
(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();

const nav = $('#nav'), toggle = $('#navToggle'), panel = $('#navPanel');
function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  if (open) {
    panel.hidden = false;
    void panel.offsetHeight;
    panel.classList.add('open');
    document.body.classList.add('is-locked');
  } else {
    panel.classList.remove('open');
    document.body.classList.remove('is-locked');
    setTimeout(() => { panel.hidden = true; }, 400);
  }
}
if (toggle && panel) {
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('.menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
}
})();
