// The home page as a scroll-driven film. Ray's head-turn video is cut into frame sprites and
// scrubbed by scroll while three scenes play over it (headline, the three promises, then step 1 of
// the calculator). Below it: a manifesto that brightens word by word, and an example bill that drops
// as you scroll. Everything degrades: no JS or reduced motion shows the poster and the scenes stacked.
import { loadState, saveState, siteConfig } from './state.js';
import { mountStart } from './start-form.js';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const ease = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const cfg = siteConfig();

// ---------------------------------------------------------------------------
// The film

const film = document.querySelector('[data-film]');
if (film && !reduced) {
  const stage = film.querySelector('.film-stage');
  const canvas = film.querySelector('canvas');
  const poster = film.querySelector('.film-poster');
  const scenes = [...film.querySelectorAll('.scene')].map((el) => ({
    el,
    from: Number(el.dataset.from),
    to: Number(el.dataset.to),
    hold: 'hold' in el.dataset,
    items: [...el.querySelectorAll('[data-stagger] > *')],
  }));
  const small = matchMedia('(max-width: 48rem)').matches;
  const set = JSON.parse(film.dataset[small ? 'mobile' : 'desktop']); // { src, count, per, w, h }
  const total = set.count * set.per;
  const frames = new Array(total).fill(null); // one ImageBitmap per frame, sliced once a sprite lands
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingQuality = 'medium';
  film.classList.add('is-live');

  // Sprites arrive in order, two at a time, so the start of the film is ready first. Each one is
  // cut into per-frame bitmaps as soon as it lands: drawing a small bitmap is far cheaper than
  // sampling a 10,000px-tall sprite every scroll tick, which is what made scrolling stutter.
  let next = 0;
  async function slice(img, i) {
    for (let k = 0; k < set.per; k++) {
      const n = i * set.per + k;
      if (n >= total) break;
      try {
        frames[n] = 'createImageBitmap' in window ? await createImageBitmap(img, 0, k * set.h, set.w, set.h) : { img, sy: k * set.h };
      } catch {
        frames[n] = { img, sy: k * set.h };
      }
    }
    dirty = true; kick();
  }
  function loadNext() {
    if (next >= set.count) return;
    const i = next++;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => { slice(img, i).then(loadNext); };
    img.onerror = loadNext;
    img.src = set.src.replace('%02d', String(i + 1).padStart(2, '0'));
  }
  loadNext(); loadNext();

  // Draw frame f (a float: adjacent frames are cross-faded) with object-fit: cover, keeping the
  // right-hand side, where Ray is, on screen. The canvas backing store is capped so very large or
  // high-density screens don't push millions of extra pixels through every tick.
  let W = 0; let H = 0; let dpr = 1;
  function size() {
    W = stage.clientWidth; H = stage.clientHeight;
    dpr = Math.min(devicePixelRatio || 1, 1.5, Math.sqrt(2.4e6 / Math.max(1, W * H)));
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
    dirty = true;
  }
  function nearestLoaded(n) {
    for (let d = 0; d < total; d++) {
      if (frames[n - d]) return n - d;
      if (frames[n + d]) return n + d;
    }
    return -1;
  }
  function blit(n, alpha, dx, dy, dw, dh) {
    const fr = frames[n];
    ctx.globalAlpha = alpha;
    if (fr.img) ctx.drawImage(fr.img, 0, fr.sy, set.w, set.h, dx, dy, dw, dh);
    else ctx.drawImage(fr, dx, dy, dw, dh);
    ctx.globalAlpha = 1;
  }
  function draw(f) {
    const i = nearestLoaded(Math.floor(f));
    if (i < 0) return;
    const j = frames[i + 1] && i + 1 <= Math.ceil(f) ? i + 1 : i;
    const a = j === i ? 0 : f - Math.floor(f);
    const scale = Math.max(W / set.w, H / set.h);
    const dw = set.w * scale; const dh = set.h * scale;
    const focus = small ? 0.68 : 0.6; // keep Ray (right of centre) in frame when cropping
    const dx = (W - dw) * focus + par.x; const dy = (H - dh) * 0.4 + par.y;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    blit(i, 1, dx, dy, dw, dh);
    if (a > 0.02) blit(j, a, dx, dy, dw, dh);
    if (poster && !poster.hidden) poster.hidden = true;
  }

  // Scroll progress through the pinned section, smoothed.
  let target = 0; let cur = -1; let dirty = true; let raf = 0;
  const par = { x: 0, y: 0, tx: 0, ty: 0 };
  function progress() {
    const r = film.getBoundingClientRect();
    return clamp(-r.top / (r.height - innerHeight), 0, 1);
  }
  function placeScenes(p) {
    for (const s of scenes) {
      const span = s.to - s.from;
      const t = (p - s.from) / span;
      let o; let y;
      if (t < 0) { o = 0; y = 40; }
      else if (t < 0.22 && s.from > 0) { o = ease(t / 0.22); y = 40 * (1 - o); } // the first scene is already on
      else if (s.hold || t <= 0.78) { o = 1; y = 0; }
      else if (t <= 1) { o = 1 - ease((t - 0.78) / 0.22); y = -40 * (1 - o); }
      else { o = 0; y = -40; }
      s.el.style.opacity = o.toFixed(3);
      s.el.style.transform = `translate3d(${(par.tx * -0.3).toFixed(1)}px, ${(y + par.ty * -0.3).toFixed(1)}px, 0)`;
      s.el.style.pointerEvents = o > 0.6 ? '' : 'none';
      s.el.setAttribute('aria-hidden', o < 0.5 ? 'true' : 'false');
      // staggered children: each lands a little after the last, within the scene's entrance
      s.items.forEach((it, i) => {
        const k = ease((t - 0.04 - i * 0.09) / 0.3);
        it.style.opacity = (o * k).toFixed(3);
        it.style.transform = `translate3d(0, ${(56 * (1 - k)).toFixed(1)}px, 0) scale(${(0.96 + 0.04 * k).toFixed(3)})`;
      });
    }
  }
  function tick() {
    raf = 0;
    const k = 0.16;
    const prevCur = cur;
    cur = cur < 0 ? target : cur + (target - cur) * k;
    par.x += (par.tx - par.x) * 0.08; par.y += (par.ty - par.y) * 0.08;
    const f = cur * (total - 1);
    if (dirty || Math.abs(cur - prevCur) > 0.0002 || Math.abs(par.tx - par.x) > 0.2 || Math.abs(par.ty - par.y) > 0.2) {
      draw(f);
      placeScenes(cur);
      dirty = false;
    }
    if (Math.abs(target - cur) > 0.0004 || Math.abs(par.tx - par.x) > 0.2 || Math.abs(par.ty - par.y) > 0.2) raf = requestAnimationFrame(tick);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
  addEventListener('scroll', () => { target = progress(); kick(); }, { passive: true });
  addEventListener('resize', () => { size(); target = progress(); kick(); });
  if (matchMedia('(hover: hover)').matches) {
    stage.addEventListener('pointermove', (e) => { par.tx = (e.clientX / W - 0.5) * 18; par.ty = (e.clientY / H - 0.5) * 10; kick(); });
    stage.addEventListener('pointerleave', () => { par.tx = 0; par.ty = 0; kick(); });
  }
  size();
  target = progress();
  cur = target;
  draw(cur * (total - 1));
  placeScenes(cur);
}

// Step 1 of the calculator lives in the last scene (or, without the film, just on the page).
// On small screens the dial card leaves the film and sits right under it, so the pinned stage
// only has to hold the headline and the thumbs-up.
const host = document.querySelector('[data-mount="start"]');
const mobileSlot = document.querySelector('[data-start-mobile]');
if (host && mobileSlot && matchMedia('(max-width: 48rem)').matches) { mobileSlot.append(host); document.body.classList.add('start-below-film'); }
if (host) {
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
// "Scroll" hint and skip link jump straight to the form.
for (const a of document.querySelectorAll('[data-to-form]')) {
  a.addEventListener('click', (e) => { e.preventDefault(); const t = mobileSlot.closest('section'); scrollTo({ top: scrollY + t.getBoundingClientRect().top - 60, behavior: 'smooth' }); host.querySelector('input')?.focus({ preventScroll: true }); });
}
for (const a of document.querySelectorAll('[data-skip-film]')) {
  a.addEventListener('click', (e) => {
    if (!film || reduced) return;
    e.preventDefault();
    const r = film.getBoundingClientRect();
    scrollTo({ top: scrollY + r.top, behavior: 'smooth' });
  });
}

// ---------------------------------------------------------------------------
// Manifesto: each word brightens as the block moves up the screen.

const manifesto = document.querySelector('[data-reveal-words]');
if (manifesto && !reduced) {
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const part of child.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) frag.append(part);
          else { const w = document.createElement('span'); w.className = 'w'; w.textContent = part; frag.append(w); }
        }
        child.replaceWith(frag);
      } else walk(child);
    }
  };
  walk(manifesto);
  const words = [...manifesto.querySelectorAll('.w')];
  let raf = 0;
  const update = () => {
    raf = 0;
    const r = manifesto.getBoundingClientRect();
    // 0 when the block's top is 80% down the screen, 1 when its bottom reaches 35%
    const p = clamp((innerHeight * 0.8 - r.top) / (r.height + innerHeight * 0.45), 0, 1);
    const lit = p * (words.length + 4);
    words.forEach((w, i) => { w.style.setProperty('--lit', clamp(lit - i, 0, 1).toFixed(2)); });
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  update();
}

// ---------------------------------------------------------------------------
// The bill that drops: a pinned number counts from "before" to "after" while three cards take turns.

const drop = document.querySelector('[data-drop]');
if (drop && !reduced) {
  const num = drop.querySelector('[data-drop-value]');
  const from = Number(drop.dataset.from); const to = Number(drop.dataset.to);
  const cards = [...drop.querySelectorAll('.drop-card')];
  const bar = drop.querySelector('.drop-bar span');
  let raf = 0;
  const update = () => {
    raf = 0;
    const r = drop.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight), 0, 1);
    const v = from + (to - from) * ease(p);
    num.textContent = `£${Math.round(v).toLocaleString('en-GB')}`;
    if (bar) bar.style.transform = `scaleX(${(1 - p * (1 - to / from)).toFixed(3)})`;
    cards.forEach((c, i) => {
      const t = p * cards.length - i; // card i owns [i, i+1)
      const on = t >= 0 && t < 1 ? 1 : t >= 1 && i === cards.length - 1 ? 1 : 0;
      const k = t < 0 ? 0 : t < 0.25 ? ease(t / 0.25) : t < 1 || i === cards.length - 1 ? 1 : 1 - ease((t - 1) / 0.25);
      c.style.opacity = (on ? 1 : k).toFixed(3);
      c.style.transform = `translate3d(0, ${(40 * (1 - (t < 0 ? 0 : t < 0.25 ? ease(t / 0.25) : 1))).toFixed(1)}px, 0)`;
      c.classList.toggle('is-on', t >= 0 && (t < 1 || i === cards.length - 1));
    });
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  update();
}

// Anything marked data-rise fades up when it enters the viewport.
const risers = document.querySelectorAll('[data-rise]');
if (risers.length && !reduced && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }, { threshold: 0.18 });
  for (const el of risers) io.observe(el);
}
