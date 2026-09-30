/* =====================================================================
   KESTREL BUILD — interaction
   No libraries. Everything degrades to a fully readable static page.
   ===================================================================== */
(() => {
'use strict';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp  = (a, b, t) => a + (b - a) * t;
const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

$('#yr').textContent = new Date().getFullYear();

/* ------------------------------------------------------------ preloader */
const pre = $('#pre'), preBar = $('#preBar'), preNum = $('#preNum');
let loaded = false;

function finish() {
  if (loaded) return;
  loaded = true;
  pre.classList.add('done');
  document.body.classList.remove('is-locked');
  setTimeout(() => { pre.setAttribute('hidden', ''); measure(); }, 750);
}

let seenPre = false;
try { seenPre = sessionStorage.getItem('kb-pre') === '1'; sessionStorage.setItem('kb-pre', '1'); } catch (err) {}

if (reduced || seenPre) {
  finish();
} else {
  document.body.classList.add('is-locked');
  let n = 0;
  const tick = setInterval(() => {
    // ease toward 100, then hold until the window load event lands
    n += Math.max(0.6, (100 - n) * 0.06);
    if (n >= 99.4) { n = 100; clearInterval(tick); }
    preBar.style.width = n + '%';
    preNum.textContent = String(Math.round(n)).padStart(3, '0');
  }, 24);
  window.addEventListener('load', () => setTimeout(finish, 120));
  setTimeout(finish, 1800); // never trap anyone behind a slow asset
}

/* --------------------------------------------------------- smooth scroll
   A light damped scroll, only where it can't do harm: fine pointer,
   no touch, motion allowed. Native scrolling (keyboard, scrollbar,
   touch) is detected and handed back control immediately.            */
const smooth = finePointer && !reduced && !matchMedia('(hover: none)').matches;
let target = window.scrollY, current = window.scrollY, driving = false;

if (smooth) {
  const maxScroll = () => document.documentElement.scrollHeight - innerHeight;

  addEventListener('wheel', e => {
    if (e.ctrlKey) return;                       // pinch-zoom
    if (e.target.closest('.menu')) return;
    e.preventDefault();
    const unit = e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? innerHeight : 1;
    target = clamp(target + e.deltaY * unit, 0, maxScroll());
    driving = true;
  }, { passive: false });

  addEventListener('resize', () => { target = current = window.scrollY; });
}

/* --------------------------------------------------- flight path + bird */
const flight   = $('#flight');
const svg      = $('#flightSvg');
const linePath = $('#flightLine');
const bird     = $('#bird');
const birdBody = $('#birdBody');
const wingL = $('#wingL'), wingR = $('#wingR'), tail = $('#tail');

let pathLen = 0, anchors = [], docH = 0, ready = false;
let VH = innerHeight, VW = innerWidth;           // cached: reading these can force a layout
let pathX = null, pathY = null;
const PATH_STEP = 6;                             // px between samples of the flight path

/* The flight path is sampled into a table once per measure(). Asking the SVG
   for getPointAtLength() every frame makes the browser bring style and layout
   up to date first, which is what was costing a layout on every frame. */
function pointAt(len) {
  const f = clamp(len / PATH_STEP, 0, pathX.length - 1);
  const i = Math.floor(f), j = Math.min(i + 1, pathX.length - 1), t = f - i;
  return { x: pathX[i] + (pathX[j] - pathX[i]) * t, y: pathY[i] + (pathY[j] - pathY[i]) * t };
}

/* Catmull-Rom through the perch points -> smooth cubic path */
function curveThrough(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i],
          p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
    // gentle tension so the line reads as a glide, not a zigzag
    const k = 0.28;
    const c1x = p1.x + (p2.x - p0.x) * k, c1y = p1.y + (p2.y - p0.y) * k;
    const c2x = p2.x - (p3.x - p1.x) * k, c2y = p2.y - (p3.y - p1.y) * k;
    d += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

function measure() {
  const perches = $$('[data-perch]');
  if (!perches.length) return;

  // The flight layer is stretched to the body in CSS (top:0; bottom:0), so the
  // body's own height is the page height. Sizing the layer from JS let a stale
  // height hold the page open below the footer.
  docH = document.body.offsetHeight;
  const W = document.documentElement.clientWidth;
  const vh = innerHeight;
  VH = vh; VW = W;

  svg.setAttribute('viewBox', `0 0 ${W} ${docH}`);

  // keep the line just outside the content column, and inside the screen.
  // On a phone there are no gutters to fly down, so it becomes a narrow
  // ribbon along the right edge instead of cutting across the copy.
  const pad = Math.min(64, Math.max(22, W * 0.045));
  const narrow = W < 760;
  const colHalf = Math.min(1280, W - pad * 2) / 2;
  // on a phone both "sides" are the same line hugging the right edge: any
  // zigzag lands the bird on the ends of lines of text
  const right = narrow ? W - 11 : clamp(W / 2 + colHalf + pad * 0.55, pad, W - pad);
  const left  = narrow ? W - 11 : clamp(W / 2 - colHalf - pad * 0.55, pad, W - pad);

  const pts = [];
  anchors = [];

  perches.forEach((el, i) => {
    const r = el.getBoundingClientRect();
    const centre = r.top + scrollY + r.height / 2;
    const side = el.dataset.perchSide;
    let x;
    // A section can hand its perch to a specific element — the hero points at
    // the kestrel's head, so the small bird leaves from where the big one is.
    const ref = !narrow && el.dataset.perchEl && document.querySelector(el.dataset.perchEl);
    if (ref) {
      const rr = ref.getBoundingClientRect();
      const cy = rr.top + scrollY + rr.height / 2;
      pts.push({ x: rr.left + rr.width / 2, y: cy });
      anchors.push({ i: pts.length - 1, centre: cy });
      return;
    }
    if (narrow)                x = i % 2 ? left : right;
    else if (side === 'right') x = right;
    else if (side === 'left')  x = left;
    else                       x = i % 2 ? left : right;
    pts.push({ x, y: centre });
    anchors.push({ i: pts.length - 1, centre });
  });

  // leave on whatever side the last perch used, so the exit doesn't cut
  // diagonally back across the footer
  pts.push({ x: pts[pts.length - 1].x, y: docH + 60 });

  linePath.setAttribute('d', curveThrough(pts));
  pathLen = linePath.getTotalLength();
  const samples = Math.ceil(pathLen / PATH_STEP) + 1;
  pathX = new Float32Array(samples); pathY = new Float32Array(samples);
  for (let k = 0; k < samples; k++) {
    const q = linePath.getPointAtLength(Math.min(pathLen, k * PATH_STEP));
    pathX[k] = q.x; pathY[k] = q.y;
  }
  linePath.style.strokeDasharray = pathLen;
  linePath.style.strokeDashoffset = pathLen;

  // cumulative length at each perch, and the scroll progress that centres it
  const scrollable = Math.max(1, docH - vh);
  let prevS = -1;
  anchors = anchors.map((a, i) => {
    const seg = pathLen * (a.i / (pts.length - 1));    // close enough, then refined
    // the first perch is where the bird already is when the page opens
    const raw = i === 0 ? 0 : clamp((a.centre - vh / 2) / scrollable, 0, 1);
    const sm = Math.max(raw, prevS + 0.004);
    prevS = sm;
    return { len: seg, s: sm, centre: a.centre };
  });

  // refine each anchor's length by walking the path for the nearest y
  anchors.forEach((a, idx) => {
    const wantY = a.centre;
    let lo = idx === 0 ? 0 : anchors[idx - 1].len, hi = pathLen;
    for (let k = 0; k < 22; k++) {
      const mid = (lo + hi) / 2;
      (linePath.getPointAtLength(mid).y < wantY) ? lo = mid : hi = mid;
    }
    a.len = (lo + hi) / 2;
  });

  anchors.push({ len: pathLen, s: 1 });
  cacheScenes();
  ready = true;
}

/* map raw scroll progress -> position along the path, easing in and out of
   every perch so the bird stoops between sections and hovers beside them  */
function warp(p) {
  if (anchors.length < 2) return p * pathLen;
  for (let i = 0; i < anchors.length - 1; i++) {
    const a = anchors[i], b = anchors[i + 1];
    if (p <= b.s || i === anchors.length - 2) {
      const span = Math.max(1e-4, b.s - a.s);
      return lerp(a.len, b.len, easeIO(clamp((p - a.s) / span, 0, 1)));
    }
  }
  return pathLen;
}

/* pointer, for the small bird's drift near the top of the page */
let ptr = { x: innerWidth * .5, y: innerHeight * .5 }, hasPtr = false;
if (finePointer) addEventListener('pointermove', e => {
  ptr.x = e.clientX; ptr.y = e.clientY; hasPtr = true;
}, { passive: true });

/* ---------------------------------------------------------- scroll scenes */
const hero = $('.hero'), heroBird = $('#heroBird'), heroCopy = $('#heroCopy');

/* The hero kestrel.
   With a mouse, its head watches the pointer: 49 frames of the render where it
   turns from looking fully left, through straight ahead, to fully right, picked
   by where the pointer is relative to its head. Measured, not guessed: frame 0
   looks left, HEAD_FRONT straight ahead, the last frame right.
   On a touch screen there is no pointer to watch, so the film plays on its loop,
   only while the hero is on screen. Under reduced motion the poster stays. */
const heroVideo = $('#heroVideo'), heroHead = $('#heroHead');
const HEAD_FRAMES = 49, HEAD_FRONT = 20;
const watching = !!heroHead && finePointer && !reduced && matchMedia('(hover: hover)').matches;
const headImgs = [];
const headCtx = watching ? heroHead.getContext('2d', { alpha: false }) : null;
let headPos = HEAD_FRONT, headShown = -1, headReady = false, headX = 0;

if (watching) {
  // Swap only once every frame has decoded, so the head never skips a pose.
  let loaded = 0;
  for (let i = 0; i < HEAD_FRAMES; i++) {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => {
      if (++loaded < HEAD_FRAMES) return;
      headReady = true; headShown = -1;
      heroVideo.hidden = true; heroHead.hidden = false;
    };
    im.src = `assets/head/${String(i).padStart(2, '0')}.webp`;
    headImgs.push(im);
  }
} else if (heroVideo && !reduced) {
  // The film is 1.6MB: keep the poster on Save-Data and slow connections, and only
  // start fetching it once the page itself has finished loading.
  const conn = navigator.connection || {};
  const lean = conn.saveData || /^(slow-2g|2g|3g)$/.test(conn.effectiveType || '');
  if (!lean) {
    const start = () => {
      heroVideo.preload = 'auto';
      heroVideo.src = heroVideo.dataset.src;
      const play = () => { const p = heroVideo.play(); if (p) p.catch(() => {}); };
      new IntersectionObserver(([e]) => (e.isIntersecting ? play() : heroVideo.pause()))
        .observe(heroVideo);
    };
    if (document.readyState === 'complete') start();
    else addEventListener('load', start, { once: true });
  }
}

function headScene(y) {
  if (!headReady || y > heroH) return;             // scrolled past: leave it
  let target;
  if (hasPtr) {
    // Left of the head, scale by the room to the left; right, by the room to the
    // right, so a full turn is reached at either edge of the screen. The bird is
    // mirrored in CSS, so the frames' left and right are swapped here.
    const dx = ptr.x - headX;
    const n = -(dx < 0 ? Math.max(-1, dx / Math.max(1, headX))
                       : Math.min(1, dx / Math.max(1, VW - headX)));
    target = HEAD_FRONT + n * (n < 0 ? HEAD_FRONT : HEAD_FRAMES - 1 - HEAD_FRONT);
  } else {
    // until the pointer has moved: a slow look around, so it isn't frozen
    target = HEAD_FRONT + Math.sin(performance.now() / 1500) * 16;
  }
  headPos += (target - headPos) * 0.12;
  const i = clamp(Math.round(headPos), 0, HEAD_FRAMES - 1);
  if (i === headShown) return;
  headShown = i;
  headCtx.drawImage(headImgs[i], 0, 0);
}
const introArt = $('.intro__art img');
const cycle = $('.cycle'), cycleBird = $('#cycleBird'), cycleGhost = $('.cycle__ghost');
const cyclePoses = $$('.cycle__pose'), cycleBeats = $$('.cycle__beats li'), cycleRail = $$('.cycle__rail li');
const flow = $('.flow'), flowItems = $$('.flow__words li');
const poses = $$('.svc__art img');
let flowNow = 0, heroP = -1, flightO = -1, birdInk = false, lastDash = -1;

/* Geometry is read once here and cached, so the frame loop never has to ask
   for a rect. Reading layout straight after writing a style forces the browser
   to lay the whole page out again, and doing that every frame is what made
   scrolling heavy. Re-run from measure() on load and resize. */
let heroH = 1, flowTop = 0, flowSpan = 1, lightRanges = [], driftItems = [];
let cycleTop = 0, cycleSpan = 1, cycleP = -1, cycleBeat = -1, cycleHit = false;

function cacheScenes() {
  const vh = innerHeight;
  heroH = Math.max(1, hero.offsetHeight);
  flowTop = flow.getBoundingClientRect().top + scrollY;
  flowSpan = Math.max(1, flow.offsetHeight - vh);
  if (cycle) {
    cycleTop = cycle.getBoundingClientRect().top + scrollY;
    cycleSpan = Math.max(1, cycle.offsetHeight - vh);
  }
  lightRanges = $$('.light').map(el => {
    const r = el.getBoundingClientRect();
    return [r.top + scrollY, r.bottom + scrollY];
  });
  driftItems = [introArt, ...poses].filter(Boolean).map((el, i) => {
    el.style.transform = '';                      // measure where it really sits
    const r = el.getBoundingClientRect();
    return { el, mid: r.top + scrollY + r.height / 2, off: null,
             amount: el === introArt ? -0.08 : (i % 2 ? -0.04 : -0.07) };
  });
  // the head sits 62% across the film, which is mirrored: 38% across the box
  const hb = heroBird.getBoundingClientRect();
  headX = hb.left + hb.width * 0.38;
  heroP = flightO = lastDash = headShown = cycleP = -1;   // redraw once at the new size
}

/* The hero leaves at scroll speed; the kestrel lags a little behind it and the
   copy fades, so the two read as separate planes. Nothing is pinned. */
function heroScene(y) {
  const p = clamp(y / heroH, 0, 1);
  if (p === heroP) return;                        // held still, or long past the hero
  heroP = p;
  heroBird.style.setProperty('--ty', (p * 14).toFixed(2) + 'vh');
  heroCopy.style.transform = `translate3d(0,${(p * -6).toFixed(2)}vh,0)`;
  heroCopy.style.opacity = (1 - p * 0.9).toFixed(3);
}

/* The cycle. One bird taken through hover -> stoop -> strike -> perch as you
   scroll: a path of five stops that the scroll position reads off, with the
   pose cross-faded at each turn. The hover beat keeps breathing while you sit
   still, because a windhover that holds perfectly still looks like a freeze. */
const CYCLE_PATHS = {
  // p      x(vw)  y(vh)  scale  rot     — one table per layout, because the
  wide: [   //                            ground line and the copy move with it
    [0.00,   -30,   -24,   0.52,  -5],
    [0.24,   -24,   -17,   0.56,  -2],
    [0.50,     1,    -1,   1.00,   17],   // the bottom of the dive: talons on the line
    [0.74,    19,   -13,   0.66,  -11],   // away with the catch
    [1.00,    28,    13,   0.62,    0],   // perched on the line
  ],
  mid: [
    [0.00,   -26,   -28,   0.55,  -5],
    [0.24,   -20,   -22,   0.58,  -2],
    [0.50,     2,   -10,   1.00,   17],
    [0.74,    17,   -24,   0.66,  -11],
    [1.00,    24,     2,   0.62,    0],
  ],
  narrow: [
    [0.00,   -20,   -30,   0.60,  -5],
    [0.24,   -14,   -25,   0.62,  -2],
    [0.50,     2,  -15.5,  1.00,   17],
    [0.74,    14,   -28,   0.70,  -11],
    [1.00,    18,  -7.5,   0.66,    0],
  ],
};
const CYCLE_BEATS = [0.24, 0.50, 0.74];        // pose/copy turns

function cyclePoint(p) {
  const path = CYCLE_PATHS[VW > 900 ? 'wide' : VW > 760 ? 'mid' : 'narrow'];
  let i = 0;
  while (i < path.length - 2 && p > path[i + 1][0]) i++;
  const A = path[i], B = path[i + 1];
  const t = clamp((p - A[0]) / Math.max(1e-4, B[0] - A[0]), 0, 1);
  const e = t * t * (3 - 2 * t);                // ease in and out of every stop
  return [1, 2, 3, 4].map(k => A[k] + (B[k] - A[k]) * e);
}

function cycleScene(y) {
  if (!cycleBird) return;
  const p = clamp((y - cycleTop) / cycleSpan, 0, 1);
  const beat = p < CYCLE_BEATS[0] ? 0 : p < CYCLE_BEATS[1] ? 1 : p < CYCLE_BEATS[2] ? 2 : 3;
  // beat 0 keeps updating: the hover has to breathe even when the page is still
  if (p === cycleP && beat !== 0) return;
  cycleP = p;

  const [x, yv, s, r] = cyclePoint(p);
  const bob = beat === 0 ? Math.sin(performance.now() / 900) * 1.1 : 0;
  cycleGhost.style.setProperty('--gx', (14 - p * 26).toFixed(2) + 'vw');
  cycleBird.style.setProperty('--x', x.toFixed(2) + 'vw');
  cycleBird.style.setProperty('--y', (yv + bob).toFixed(2) + 'vh');
  cycleBird.style.setProperty('--s', s.toFixed(3));
  cycleBird.style.setProperty('--r', r.toFixed(2) + 'deg');

  if (beat !== cycleBeat) {
    cycleBeat = beat;
    cyclePoses.forEach((el, i) => el.classList.toggle('on', i === beat));
    cycleBeats.forEach((el, i) => el.classList.toggle('on', i === beat));
    cycleRail.forEach((el, i) => el.classList.toggle('on', i === beat));
  }
  // the strike ring fires once as it reaches the ground, and rearms above it
  const hit = p >= 0.5;
  if (hit !== cycleHit) { cycleHit = hit; cycle.classList.toggle('hit', hit); }
}

/* The process: which word is lit follows how far through the pinned section
   you are. Words stay lit once reached, so the list fills in as you go. */
function flowScene(y) {
  const p = clamp((y - flowTop) / flowSpan, 0, 0.9999);
  const n = Math.floor(p * flowItems.length);
  if (n === flowNow) return;
  flowNow = n;
  flowItems.forEach((li, i) => {
    li.classList.toggle('on', i <= n);
    li.classList.toggle('now', i === n);
  });
}

/* Parallax: the black objects and the intro kestrel drift against the page. */
function drift(d, y) {
  const rel = d.mid - y - VH / 2;
  if (Math.abs(rel) > VH * 1.3) return;           // off screen: leave it alone
  const off = Math.round(rel * d.amount);
  if (off === d.off) return;                      // unchanged: no style write
  d.off = off;
  d.el.style.transform = `translate3d(0,${off}px,0)`;
}

let phase = 0, lastLen = 0, shownAngle = 0, driftX = 0, driftY = 0;

function frame() {
  // Read the scroll position once, before anything is written this frame.
  // Reading scrollY (or innerHeight) after a style write forces a layout.
  let y = window.scrollY;

  /* damped scroll */
  if (smooth) {
    if (!driving && Math.abs(y - current) > 2) {
      current = target = y;                          // something else scrolled us
    } else {
      current = lerp(current, target, 0.15);        // 0.11 felt sluggish on the long work section
      if (Math.abs(target - current) < 0.08) { current = target; driving = false; }
      if (Math.abs(current - y) > 0.5) window.scrollTo(0, current);   // idle: don't touch it
      y = current;
    }
  }

  if (!reduced) {
    heroScene(y);
    headScene(y);
    flowScene(y);
    cycleScene(y);
    for (const d of driftItems) drift(d, y);
    // the whole flight layer, line included, waits until the hero is left
    // behind: a path drawn across the wordmark just reads as a scratch
    // fades in once the hero is left behind, and back out while the stoop
    // chapter is on screen: two kestrels at once is a busy screen
    const cycleNear = clamp(1 - Math.abs(y + VH * 0.5 - (cycleTop + cycleSpan * 0.5)) / (cycleSpan * 0.6 + VH * 0.5), 0, 1);
    const fo = +(clamp((y - heroH + VH * 0.55) / (VH * 0.3), 0, 1) * (1 - cycleNear)).toFixed(2);
    if (fo !== flightO) { flightO = fo; flight.style.opacity = fo; }
  }

  if (ready && !reduced && pathX) {
    const p = clamp(y / Math.max(1, docH - VH), 0, 1);
    const len = warp(p);

    const pt = pointAt(len);
    const ahead = pointAt(Math.min(pathLen, len + 12));

    /* how fast is it travelling? slow = hovering, fast = stooping */
    const speed = Math.abs(len - lastLen);
    lastLen = len;
    const hover = clamp(1 - speed / 9, 0, 1);

    /* wingbeat: quick and shallow on the hover, swept back in the stoop */
    phase += 0.13 + hover * 0.42;
    const beat = Math.sin(phase);
    const spread = 3 + hover * 14;
    const sweep  = (1 - hover) * 22;
    const rest   = -14;

    /* leans toward the pointer while it is near */
    if (hasPtr) {
      const dx = ptr.x - pt.x, dy = ptr.y - (pt.y - y);
      const near = clamp(1 - Math.hypot(dx, dy) / 500, 0, 1);
      driftX = lerp(driftX, clamp(dx * 0.035, -20, 20) * near, 0.05);
      driftY = lerp(driftY, clamp(dy * 0.035, -16, 16) * near, 0.05);
    }

    const wantAngle = Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180 / Math.PI;
    shownAngle = lerp(shownAngle, (wantAngle - 90) * (1 - hover) * 0.55, 0.08);

    bird.style.transform =
      `translate3d(${(pt.x + driftX).toFixed(1)}px,${(pt.y + driftY).toFixed(1)}px,0)` +
      ` rotate(${shownAngle.toFixed(2)}deg)`;
    birdBody.style.transform = `translateY(${(beat * hover * 1.3).toFixed(2)}%)`;
    const arm = rest + beat * spread + sweep;
    wingL.style.transform = `rotate(${arm.toFixed(2)}deg)`;
    wingR.style.transform = `rotate(${(-arm).toFixed(2)}deg)`;
    tail.style.transform  = `scaleX(${(0.55 + hover * 0.5).toFixed(3)})`;

    // dark bird over the light sections, light bird over the dark ones
    const onLight = lightRanges.some(([a, b]) => pt.y >= a && pt.y <= b);
    if (onLight !== birdInk) { birdInk = onLight; bird.classList.toggle('bird--ink', onLight); }

    const dash = Math.round(pathLen - len);
    if (dash !== lastDash) { lastDash = dash; linePath.style.strokeDashoffset = dash; }
  }

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

if (reduced) {
  // no journey: the small kestrel waits beside the intro
  bird.style.transform = 'translate3d(88vw, 120vh, 0) scale(1.4)';
  bird.style.opacity = 1;
  flight.style.opacity = 1;
}

/* ------------------------------------------------------------- reveals */
const io = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { rootMargin: '0px 0px -4% 0px', threshold: 0.01 });   // reveal as soon as it enters, so scrolling never outruns the content
$$('.rv').forEach(el => io.observe(el));

/* Figures count up when they arrive. Short, eased, and it lands exactly on the
   real number — the DOM already holds the final value for no-JS and screen readers. */
if (!reduced) $$('.figs b[data-count]').forEach(el => {
  const to = +el.dataset.count, pad = el.textContent.trim().length;
  const run = () => {
    const t0 = performance.now(), ms = 900;
    const step = now => {
      const k = clamp((now - t0) / ms, 0, 1);
      const v = Math.round(to * (1 - Math.pow(1 - k, 3)));
      el.textContent = String(v).padStart(pad, '0');
      if (k < 1) requestAnimationFrame(step);
    };
    el.textContent = String(0).padStart(pad, '0');
    requestAnimationFrame(step);
  };
  new IntersectionObserver((es, o) => {
    if (es[0].isIntersecting) { o.disconnect(); run(); }
  }, { threshold: 0.6 }).observe(el);
});

/* the UV trails need their own lengths before they can draw */
$$('.uv path').forEach(p => p.style.setProperty('--len', Math.ceil(p.getTotalLength())));
const seenIo = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.3 });
seenIo.observe($('.seen__field'));

/* ----------------------------------------------------------------- nav */
const nav = $('#nav'), toggle = $('#navToggle'), panel = $('#navPanel');

addEventListener('scroll', () => {
  nav.classList.toggle('stuck', scrollY > 40);
}, { passive: true });

function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  if (open) {
    panel.hidden = false;
    void panel.offsetHeight;                     // never leave the links at opacity 0
    panel.classList.add('open');
    document.body.classList.add('is-locked');
  } else {
    panel.classList.remove('open');
    document.body.classList.remove('is-locked');
    setTimeout(() => { panel.hidden = true; }, 400);
  }
}
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
$$('.menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => {
  if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
    setMenu(false); toggle.focus();
  }
});

/* anchor links have to talk to the damped scroller, not fight it */
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href');
  if (id === '#' || id.length < 2) return;
  const el = document.querySelector(id);
  if (!el) return;
  e.preventDefault();
  const y = el.getBoundingClientRect().top + scrollY - (id === '#top' ? 0 : 24);
  if (smooth) { target = clamp(y, 0, document.documentElement.scrollHeight - innerHeight); driving = true; }
  else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  history.replaceState(null, '', id);
}));

/* ---------------------------------------------------------------- form */
const form = $('#quoteForm'), note = $('#formNote');
form.addEventListener('submit', async e => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  note.textContent = 'Sending…';
  try {
    const r = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString()
    });
    if (!r.ok) throw new Error();
    form.reset();
    note.textContent = 'Got it. I’ll come back to you within one working day.';
  } catch {
    note.textContent = 'That didn’t send. Email hello@kestrelbuild.co.uk and I’ll pick it up.';
  }
});

/* --------------------------------------------------------------- resize */
let rt;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(measure, 180); });
addEventListener('load', () => setTimeout(measure, 120));
if (document.fonts) document.fonts.ready.then(() => setTimeout(measure, 60));
measure();

})();
