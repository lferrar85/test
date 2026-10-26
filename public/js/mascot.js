// Brings Ray to life. He is a photo; on hover-capable desktops a frame sprite cut from a short
// head-turn video is scrubbed with the pointer, so he turns to look where the cursor is, with
// cross-fades between frames and a little parallax. Elsewhere the photo just tilts. He talks
// through the speech bubble. Respects prefers-reduced-motion and Save-Data.

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const rand = (lo, hi) => lo + Math.random() * (hi - lo);

export function mountRay(root, { bubble = root.querySelector('.mascot-say') } = {}) {
  const frame = root.querySelector('.cat-frame');
  const still = root.querySelector('.cat-still');
  const canvas = root.querySelector('.cat-canvas');
  if (!frame || !still) return null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frames = Number(root.dataset.frames) || 0;
  const cols = Number(root.dataset.cols) || 1;
  const centre = Number(root.dataset.centre) || 0;
  const canScrub = !!(canvas && root.dataset.sprite && frames && !reduced && matchMedia('(hover: hover) and (min-width: 62rem)').matches && !navigator.connection?.saveData);

  let sprite = null; // the loaded sprite image, once it has arrived
  let fw = 0; let fh = 0; // one frame's size in the sprite
  let ctx = null;
  const pos = { f: centre, x: 0, y: 0, stillAlpha: 1 }; // current
  const want = { f: centre, x: 0, y: 0 }; // target
  let raf = 0;
  let lastAim = 0;
  let visible = true;
  let timers = [];
  let disposed = false;
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };

  function drawFrame(f, alpha) {
    const i = clamp(Math.floor(f), 0, frames - 1);
    const j = clamp(i + 1, 0, frames - 1);
    const a = f - i;
    const at = (n) => [(n % cols) * fw, Math.floor(n / cols) * fh];
    ctx.globalAlpha = alpha;
    ctx.drawImage(sprite, ...at(i), fw, fh, 0, 0, fw, fh);
    if (a > 0.01 && j !== i) {
      ctx.globalAlpha = alpha * a;
      ctx.drawImage(sprite, ...at(j), fw, fh, 0, 0, fw, fh);
    }
    ctx.globalAlpha = 1;
  }
  function paint() {
    if (!sprite) return;
    ctx.clearRect(0, 0, fw, fh);
    drawFrame(pos.f, 1);
    if (pos.stillAlpha > 0.01) { ctx.globalAlpha = pos.stillAlpha; ctx.drawImage(still, 0, 0, fw, fh); ctx.globalAlpha = 1; }
  }
  function apply() {
    frame.style.transform = `translate(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px) rotate(${(pos.x * 0.12).toFixed(2)}deg)`;
    paint();
  }
  function step() {
    raf = 0;
    const k = 0.1;
    pos.f += (want.f - pos.f) * k;
    pos.x += (want.x - pos.x) * k;
    pos.y += (want.y - pos.y) * k;
    if (sprite && pos.stillAlpha > 0) pos.stillAlpha = Math.max(0, pos.stillAlpha - 0.06);
    apply();
    const busy = Math.abs(want.f - pos.f) > 0.01 || Math.abs(want.x - pos.x) > 0.05 || Math.abs(want.y - pos.y) > 0.05 || pos.stillAlpha > 0;
    if (busy) raf = requestAnimationFrame(step);
  }
  function kick() {
    if (disposed || !visible) return;
    if (reduced) { Object.assign(pos, want); apply(); return; }
    if (!raf) raf = requestAnimationFrame(step);
  }

  // Fetch the sprite only where it will be used. The photo stays until it has decoded.
  if (canScrub) {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (disposed) return;
      fw = Math.round(img.naturalWidth / cols);
      fh = Math.round(img.naturalHeight / Math.ceil(frames / cols));
      canvas.width = fw; canvas.height = fh;
      ctx = canvas.getContext('2d');
      sprite = img;
      paint();
      canvas.hidden = false;
      still.classList.add('is-behind');
    };
    img.src = root.dataset.sprite;
  }

  // Where his face is on screen: the turn is horizontal, so only x picks the frame.
  function face() {
    const r = frame.getBoundingClientRect();
    return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.35 };
  }
  function aim(clientX, clientY) {
    const c = face();
    const dx = clamp((clientX - c.x) / Math.max(260, innerWidth * 0.45), -1, 1);
    const dy = clamp((clientY - c.y) / Math.max(220, innerHeight * 0.45), -1, 1);
    want.f = dx < 0 ? centre + dx * centre : centre + dx * (frames - 1 - centre);
    want.x = dx * 12; want.y = dy * 7;
    lastAim = performance.now();
    kick();
  }
  function lookAt(el) {
    const r = el.getBoundingClientRect();
    aim(r.left + r.width / 2, r.top + r.height / 2);
  }
  function rest() {
    want.f = centre; want.x = 0; want.y = 0; lastAim = 0; kick();
  }

  // Glance about when nobody has moved the pointer for a while.
  function wander() {
    if (sprite && (!lastAim || performance.now() - lastAim > 4000)) {
      const span = Math.min(centre, frames - 1 - centre);
      want.f = Math.random() < 0.4 ? centre : centre + rand(-0.6, 0.6) * span;
      want.x = rand(-4, 4); want.y = rand(-2, 2);
      lastAim = 0;
      kick();
    }
    later(wander, rand(2600, 5600));
  }
  if (!reduced) later(wander, 3000);

  // Only animate while on screen and the tab is visible.
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); }) : null;
  io?.observe(frame);
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
  function celebrate(line) {
    rest(); // turns to face you
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

  return { aim, lookAt, rest, say, celebrate, dispose };
}
