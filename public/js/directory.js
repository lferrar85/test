// Installer directory: filter by region.
const select = document.querySelector('[data-region-filter]');
const cards = [...document.querySelectorAll('[data-installer-grid] .installer-card')];
const count = document.querySelector('[data-filter-count]');
const empty = document.querySelector('[data-empty]');
function apply() {
  const region = select.value;
  let shown = 0;
  for (const c of cards) {
    const ok = !region || c.dataset.regions.split(' ').includes(region);
    c.hidden = !ok;
    if (ok) shown++;
  }
  count.textContent = `${shown} installer${shown === 1 ? '' : 's'}`;
  empty.hidden = shown !== 0;
}
if (select) select.addEventListener('change', apply);
