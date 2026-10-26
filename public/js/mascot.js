// Brings Ray to life: eyes and head follow the pointer, blinks, idle glances, a speech bubble,
// sunglasses that drop to celebrate. Works on any element containing raySvg() markup.
// Respects prefers-reduced-motion (gaze only, no continuous animation).

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const rand = (lo, hi) => lo + Math.random() * (hi - lo);

export function mountRay(root, { bubble = root.querySelector('.mascot-say') } = {}) {
  const svg = root.querySelector('svg.cat');
  if (!svg) return null;
  const head = svg.querySelector('.cat-head');
  const body = svg.querySelector('.cat-body');
  const irises = [...svg.querySelectorAll('.cat-iris')];
  const ears = [svg.querySelector('.cat-ear-l'), svg.querySelector('.cat-ear-r')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const target = { x: 0, y: 0 };
  const cur = { x: 0, y: 0 };
  let lastAim = 0;
  let raf = 0;
  let visible = true;
  let timers = [];
  let disposed = false;
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

  function apply() {
    const { x, y } = cur;
    head.style.transform = `rotate(${(x * 6).toFixed(2)}deg) translate(${(x * 14).toFixed(1)}px, ${(y * 8).toFixed(1)}px)`;
    body.style.transform = `rotate(${(x * 1.5).toFixed(2)}deg)`;
    for (const ir of irises) ir.style.transform = `translate(${(x * 10).toFixed(1)}px, ${(y * 8).toFixed(1)}px)`;
    ears[0].style.transform = `rotate(${(-x * 4 + y * 2).toFixed(2)}deg)`;
    ears[1].style.transform = `rotate(${(-x * 4 - y * 2).toFixed(2)}deg)`;
  }

  function frame() {
    raf = 0;
    const k = 0.11;
    cur.x += (target.x - cur.x) * k;
    cur.y += (target.y - cur.y) * k;
    apply();
    if (Math.abs(target.x - cur.x) > 0.002 || Math.abs(target.y - cur.y) > 0.002) raf = requestAnimationFrame(frame);
  }
  function kick() {
    if (disposed || !visible) return;
    if (reduced) { cur.x = target.x; cur.y = target.y; apply(); return; }
    if (!raf) raf = requestAnimationFrame(frame);
  }

  // Where the eyes are on screen, so "look at the pointer" is relative to the face.
  function eyes() {
    const r = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal; // eye line is y=300 in drawing units
    return { x: r.left + r.width * ((300 - vb.x) / vb.width), y: r.top + r.height * ((300 - vb.y) / vb.height) };
  }
  function aim(clientX, clientY) {
    const e = eyes();
    target.x = clamp((clientX - e.x) / Math.max(260, innerWidth * 0.42), -1, 1);
    target.y = clamp((clientY - e.y) / Math.max(220, innerHeight * 0.42), -1, 1);
    lastAim = performance.now();
    kick();
  }
  function lookAt(el) {
    const r = el.getBoundingClientRect();
    aim(r.left + r.width / 2, r.top + r.height / 2);
  }
  function rest() {
    target.x = 0; target.y = 0; lastAim = 0; kick();
  }

  // Blink now and then; glance around when nobody has moved the pointer for a while.
  function blink() {
    root.classList.add('is-blink');
    later(() => root.classList.remove('is-blink'), 130);
    later(blink, rand(2600, 6500));
  }
  function wander() {
    if (!lastAim || performance.now() - lastAim > 3500) {
      if (Math.random() < 0.35) { target.x = 0; target.y = 0; } else { target.x = rand(-0.55, 0.55); target.y = rand(-0.35, 0.35); }
      lastAim = 0;
      kick();
    }
    later(wander, rand(2200, 5200));
  }
  if (!reduced) { later(blink, rand(1200, 3000)); later(wander, 2500); }

  // Only animate while on screen and the tab is visible.
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); }) : null;
  io?.observe(svg);
  const onVis = () => { visible = !document.hidden; if (visible) kick(); };
  document.addEventListener('visibilitychange', onVis);

  let sayTimer = 0;
  function say(text, { hold = 0 } = {}) {
    if (!bubble) return;
    clearTimeout(sayTimer);
    bubble.textContent = text;
    bubble.hidden = false;
    bubble.classList.remove('is-pop');
    void bubble.offsetWidth; // restart the pop animation
    bubble.classList.add('is-pop');
    if (hold) sayTimer = later(() => { bubble.hidden = true; }, hold);
  }
  const shades = (on) => root.classList.toggle('has-shades', on);
  function celebrate(line) {
    shades(true);
    root.classList.remove('is-happy');
    void root.offsetWidth;
    root.classList.add('is-happy');
    if (line) say(line);
  }
  function dispose() {
    disposed = true;
    cancelAnimationFrame(raf);
    for (const t of timers) clearTimeout(t);
    timers = [];
    io?.disconnect();
    document.removeEventListener('visibilitychange', onVis);
  }

  return { aim, lookAt, rest, say, shades, celebrate, dispose };
}
