/* R.A.C Carpentry & Joinery: interaction + motion */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const EMAIL = 'rac_carpentryjoinery@outlook.com';

  document.documentElement.classList.add('js');

  /* ------------------------------------------------------------------ */
  /* Smooth scroll                                                       */
  /* ------------------------------------------------------------------ */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.095, wheelMultiplier: 0.95, touchMultiplier: 1.4 });
  }

  const scrollToTarget = (target) => {
    if (lenis) lenis.scrollTo(target, { duration: 1.6 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      const target = id === '#top' ? $('#top') : $(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      scrollToTarget(target);
      if (a.dataset.pick) pickChip(a.dataset.pick);
    });
  });

  /* ------------------------------------------------------------------ */
  /* Hero: the timber film (WebGL)                                        */
  /* ------------------------------------------------------------------ */
  const hero = $('.hero');
  const glCanvas = $('[data-gl]');
  const SHOTS = [
    'Oak, flat sawn',
    'Walnut, end grain',
    'Ash, rift sawn',
  ];
  const SHOT_LEN = 7;
  const MIX_LEN = 0.9;

  const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform float uA; uniform float uB; uniform float uMix;
uniform vec2 uMouse; uniform vec2 uBlade;

float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x), mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x), u.y); }
float fbm(vec2 p){ float v=0.0; float a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.03+vec2(1.7,9.2); a*=0.5; } return v; }
mat2 rot(float a){ float c=cos(a); float s=sin(a); return mat2(c,-s,s,c); }

vec3 species(float id, float v){
  vec3 d; vec3 l;
  if (id < 0.5)      { d = vec3(0.20,0.11,0.05); l = vec3(0.62,0.40,0.20); }
  else if (id < 1.5) { d = vec3(0.08,0.045,0.03); l = vec3(0.42,0.25,0.14); }
  else               { d = vec3(0.24,0.17,0.11); l = vec3(0.68,0.55,0.39); }
  return mix(d, l, v);
}

float grain(float id, vec2 uv, float t){
  if (id < 0.5) {
    vec2 p = uv*vec2(0.9,2.4) + vec2(t*0.045, 0.3);
    float w = fbm(p*vec2(0.45,1.1))*2.4;
    float g = p.y*3.0 + w + 0.3*sin(p.x*0.7+w);
    float ring = smoothstep(0.05, 0.95, abs(fract(g)-0.5)*2.0);
    float fine = fbm(vec2(p.x*1.5, p.y*55.0));
    float pores = noise(vec2(p.x*30.0, p.y*260.0));
    float fleck = smoothstep(0.78, 0.9, noise(vec2(p.x*6.0, p.y*40.0)))*0.25;
    return clamp(ring*0.55 + fine*0.4 + pores*0.08 + fleck, 0.0, 1.0);
  } else if (id < 1.5) {
    vec2 p = rot(t*0.025) * uv * (1.25 - 0.18*sin(t*0.07)) + vec2(0.55,-0.35);
    float r = length(p) + fbm(p*1.6)*0.09;
    float a = atan(p.y, p.x);
    float g = r*11.0 + fbm(vec2(a*1.5, r*2.0))*0.7;
    float ring = pow(abs(fract(g)-0.5)*2.0, 1.6);
    float rays = noise(vec2(a*60.0, r*4.0))*0.15;
    float check = smoothstep(0.93, 1.0, noise(vec2(a*9.0, 1.0))) * smoothstep(0.1, 0.8, r) * 0.6;
    return clamp(ring*0.7 + rays + fbm(p*40.0)*0.15 - check, 0.0, 1.0);
  } else {
    vec2 p = rot(-0.45) * uv; p += vec2(0.0, t*0.05);
    float w = fbm(p*vec2(2.4,0.35))*1.4;
    float g = p.x*7.0 + w;
    float ring = smoothstep(0.1, 0.9, abs(fract(g)-0.5)*2.0);
    float fine = fbm(vec2(p.x*60.0, p.y*1.2));
    return clamp(ring*0.5 + fine*0.45, 0.0, 1.0);
  }
}

vec3 shade(float id, vec2 uv, float t, vec2 lp){
  float v = grain(id, uv, t);
  float e = 0.004;
  float vx = grain(id, uv+vec2(e,0.0), t);
  float vy = grain(id, uv+vec2(0.0,e), t);
  vec3 n = normalize(vec3((v-vx)*1.6, (v-vy)*1.6, 1.0));
  vec3 col = species(id, v);
  vec3 L = normalize(vec3(lp-uv, 0.55));
  float diff = max(dot(n,L), 0.0);
  vec3 H = normalize(L + vec3(0.0,0.0,1.0));
  float spec = pow(max(dot(n,H),0.0), 60.0);
  float fall = exp(-dot(uv-lp, uv-lp)*0.9);
  return col*(0.3 + 1.55*diff*fall) + vec3(1.0,0.86,0.66)*spec*fall*0.45;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / uRes.y;
  float t = uTime;
  vec2 lp = vec2(sin(t*0.11)*0.7 + 0.1, 0.22 + 0.12*cos(t*0.17)) + uMouse*0.25;
  vec3 col = shade(uA, uv, t, lp);
  if (uMix > 0.001) {
    vec3 cb = shade(uB, uv, t, lp);
    col = mix(col, cb, smoothstep(0.0,1.0,uMix));
    col *= 1.0 - 0.55*sin(uMix*3.14159);
  }
  float bd = length(uv - uBlade);
  col += vec3(0.10,0.55,0.20) * exp(-bd*bd*2.2) * 0.12;
  vec2 q = gl_FragCoord.xy / uRes;
  col *= 0.35 + 0.65*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y), 0.28);
  col += (hash(gl_FragCoord.xy + fract(t*7.3)*91.0) - 0.5) * 0.045;
  gl_FragColor = vec4(pow(max(col, 0.0), vec3(0.95)), 1.0);
}`;

  const VERT = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }';

  function createFilm(canvas) {
    const gl = canvas && canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    if (!gl) return null;
    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const vs = sh(gl.VERTEX_SHADER, VERT);
    const fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = {};
    ['uRes', 'uTime', 'uA', 'uB', 'uMix', 'uMouse', 'uBlade'].forEach((n) => { u[n] = gl.getUniformLocation(prog, n); });

    let scale = 1;
    const resize = () => {
      const small = innerWidth < 900;
      scale = Math.min(devicePixelRatio || 1, 1.5) * (small ? 0.5 : 0.62);
      canvas.width = Math.round(canvas.clientWidth * scale);
      canvas.height = Math.round(canvas.clientHeight * scale);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    addEventListener('resize', resize);

    return {
      render(t, a, b, mix, mouse, blade) {
        gl.uniform2f(u.uRes, canvas.width, canvas.height);
        gl.uniform1f(u.uTime, t);
        gl.uniform1f(u.uA, a);
        gl.uniform1f(u.uB, b);
        gl.uniform1f(u.uMix, mix);
        gl.uniform2f(u.uMouse, mouse.x, mouse.y);
        gl.uniform2f(u.uBlade, blade.x, blade.y);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
    };
  }

  const film = createFilm(glCanvas);

  // Optional real footage: drop a file at assets/hero.mp4 and it takes over.
  const video = $('[data-video]');
  let hasVideo = false;
  if (video && video.dataset.src && !reduce) {
    video.addEventListener('canplay', () => {
      hasVideo = true;
      hero.classList.add('has-video');
      video.play().catch(() => {});
    }, { once: true });
    video.addEventListener('error', () => video.removeAttribute('src'), { once: true });
    video.preload = 'auto';
    video.src = video.dataset.src;
  }

  /* ------------------------------------------------------------------ */
  /* Hero: blade + sawdust                                                */
  /* ------------------------------------------------------------------ */
  const blade = $('[data-blade]');
  const teethG = $('[data-teeth]');
  const ghost = $('[data-ghost]');
  const bladeWrap = $('.hero__blade-wrap');
  const heroInner = $('.hero__inner');
  const dustCanvas = $('[data-dust]');
  const dctx = dustCanvas.getContext('2d');
  const hudShot = $('[data-hud-shot]');
  const hudTc = $('[data-hud-tc]');

  const IDLE = 20;      // deg/s: blade ticking over
  let angle = -30;
  let kick = 0;         // spin-up energy (decays)
  let boost = 0;        // scroll-driven speed
  let bladeSpeed = IDLE;
  let heroVisible = true;
  let filmTime = 0;
  let lastShot = -1;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  let dW = 0, dH = 0, dpr = 1;
  const resizeDust = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    dW = dustCanvas.clientWidth; dH = dustCanvas.clientHeight;
    dustCanvas.width = Math.round(dW * dpr); dustCanvas.height = Math.round(dH * dpr);
    dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resizeDust();
  addEventListener('resize', resizeDust);

  const DUST_COLS = ['#C99A5E', '#E2BF8A', '#A87842', '#F0D9B0'];
  const chips = [];
  const motes = Array.from({ length: innerWidth < 900 ? 34 : 70 }, () => ({
    x: Math.random(), y: Math.random(), s: 0.5 + Math.random() * 1.6,
    vx: 0.004 + Math.random() * 0.01, vy: -0.004 - Math.random() * 0.01, p: Math.random() * Math.PI * 2,
  }));
  let emitAcc = 0;

  function emit(n, heroRect) {
    const r = bladeWrap.getBoundingClientRect();
    const cx = r.left + r.width / 2 - heroRect.left;
    const cy = r.top + r.height / 2 - heroRect.top;
    const R = (r.width / 2) * 0.9;
    for (let i = 0; i < n && chips.length < 520; i++) {
      const th = (96 + Math.random() * 22) * Math.PI / 180;           // lower-left of the blade
      const tx = -Math.sin(th), ty = Math.cos(th);                      // clockwise tangent
      const sp = (bladeSpeed * Math.PI / 180) * R * (0.16 + Math.random() * 0.22) + 60 + Math.random() * 120;
      const life = 0.9 + Math.random() * 1.6;
      chips.push({
        x: cx + Math.cos(th) * R, y: cy + Math.sin(th) * R,
        vx: tx * sp + (Math.random() - 0.5) * 60, vy: ty * sp - Math.random() * 90,
        life, max: life, s: 0.8 + Math.random() * 2.6, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 18,
        c: DUST_COLS[(Math.random() * DUST_COLS.length) | 0],
      });
    }
  }

  function drawDust(dt, t) {
    dctx.clearRect(0, 0, dW, dH);
    // Motes drifting through the work-light
    const lx = (Math.sin(t * 0.11) * 0.7 + 0.1) * dH + dW / 2;
    const ly = dH / 2 - (0.22 + 0.12 * Math.cos(t * 0.17)) * dH;
    for (const m of motes) {
      m.x += m.vx * dt; m.y += m.vy * dt; m.p += dt;
      if (m.y < -0.02) { m.y = 1.02; m.x = Math.random(); }
      if (m.x > 1.02) m.x = -0.02;
      const px = m.x * dW + Math.sin(m.p * 0.7) * 12, py = m.y * dH;
      const d = Math.hypot(px - lx, py - ly) / dH;
      const a = clamp(0.75 * Math.exp(-d * d * 3) + 0.06, 0, 0.8) * (0.6 + 0.4 * Math.sin(m.p * 1.3));
      dctx.fillStyle = `rgba(240,217,176,${a.toFixed(3)})`;
      dctx.beginPath(); dctx.arc(px, py, m.s, 0, 6.283); dctx.fill();
    }
    // Chips thrown off the teeth
    for (let i = chips.length - 1; i >= 0; i--) {
      const c = chips[i];
      c.life -= dt;
      if (c.life <= 0 || c.y > dH + 20 || c.x < -20) { chips.splice(i, 1); continue; }
      c.vy += 520 * dt; c.vx *= 1 - 1.4 * dt; c.vy *= 1 - 0.6 * dt;
      c.x += c.vx * dt; c.y += c.vy * dt; c.rot += c.vr * dt;
      dctx.globalAlpha = clamp(c.life / c.max, 0, 1) * 0.9;
      dctx.fillStyle = c.c;
      dctx.save(); dctx.translate(c.x, c.y); dctx.rotate(c.rot);
      dctx.fillRect(-c.s, -c.s * 0.45, c.s * 2, c.s * 0.9);
      dctx.restore();
    }
    dctx.globalAlpha = 1;
  }

  function startHero() {
    kick = reduce ? 0 : 900;
    if (!reduce) {
      const hr = hero.getBoundingClientRect();
      emit(90, hr);
    }
  }

  if (hero) {
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }, { threshold: 0 }).observe(hero);
    if (finePointer) {
      hero.addEventListener('pointermove', (e) => {
        mouse.tx = e.clientX / innerWidth - 0.5;
        mouse.ty = 0.5 - e.clientY / innerHeight;
      });
    }
  }

  const pad = (n, l = 2) => String(n).padStart(l, '0');

  function updateHero(dt, scrollY, vel) {
    // Blade speed: idle + scroll + spin-up kick
    boost = lerp(boost, Math.min(Math.abs(vel) * 0.9, 720), 0.08);
    kick *= Math.pow(0.28, dt);
    bladeSpeed = reduce ? 0 : IDLE + boost + kick;
    angle += bladeSpeed * dt;
    teethG.setAttribute('transform', `rotate(${angle.toFixed(2)})`);
    ghost.style.transform = `rotate(${(-angle * 0.35).toFixed(2)}deg)`;

    // Parallax out of the hero
    const h = innerHeight;
    if (scrollY < h * 1.2) {
      const p = scrollY / h;
      heroInner.style.transform = `translate3d(0, ${(scrollY * 0.28).toFixed(1)}px, 0)`;
      heroInner.style.opacity = String(clamp(1 - p * 1.1, 0, 1));
      bladeWrap.style.transform = `translate3d(0, ${(scrollY * 0.12).toFixed(1)}px, 0) rotate(${(p * 18).toFixed(2)}deg)`;
    }

    if (!heroVisible) return;

    mouse.x = lerp(mouse.x, mouse.tx, 0.04);
    mouse.y = lerp(mouse.y, mouse.ty, 0.04);

    if (!reduce) filmTime += dt;
    const t = reduce ? 3.2 : filmTime;
    const idx = Math.floor(t / SHOT_LEN) % SHOTS.length;
    const local = t % SHOT_LEN;
    const next = (idx + 1) % SHOTS.length;
    const mix = local > SHOT_LEN - MIX_LEN ? (local - (SHOT_LEN - MIX_LEN)) / MIX_LEN : 0;

    if (film && !hasVideo) {
      const hr = hero.getBoundingClientRect();
      const br = bladeWrap.getBoundingClientRect();
      const bx = (br.left + br.width / 2 - hr.width / 2) / hr.height;
      const by = (hr.height / 2 - (br.top - hr.top + br.height / 2)) / hr.height;
      film.render(t + 12, idx, next, mix, mouse, { x: bx, y: by });
    }

    // HUD
    const shown = mix > 0.5 ? next : idx;
    if (shown !== lastShot) {
      lastShot = shown;
      hudShot.textContent = `Shot ${pad(shown + 1)}/${pad(SHOTS.length)} · ${SHOTS[shown]}`;
    }
    const fr = Math.floor(t * 25);
    hudTc.textContent = `00:${pad(Math.floor(fr / 1500) % 60)}:${pad(Math.floor(fr / 25) % 60)}:${pad(fr % 25)}`;

    // Sawdust
    if (!reduce) {
      emitAcc += dt * (18 + bladeSpeed * 0.55) * (innerWidth < 900 ? 0.4 : 1);
      const n = Math.floor(emitAcc);
      if (n > 0) { emitAcc -= n; emit(n, hero.getBoundingClientRect()); }
      drawDust(dt, t);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Loader: measure up, then cut it open                                 */
  /* ------------------------------------------------------------------ */
  const loader = $('.loader');
  function runLoader() {
    const finish = () => {
      document.body.classList.remove('is-loading');
      startHero();
    };
    if (reduce || !loader) { loader && loader.classList.add('is-done'); finish(); return; }
    lenis && lenis.stop();
    const count = $('[data-count]', loader);
    let seen = false;
    try { seen = sessionStorage.getItem('rac-seen') === '1'; sessionStorage.setItem('rac-seen', '1'); } catch (e) { /* private mode */ }
    const dur = seen ? 450 : 1150;
    const t0 = performance.now();
    const tick = (now) => {
      const p = clamp((now - t0) / dur, 0, 1);
      const e = 1 - Math.pow(1 - p, 3);
      count.textContent = String(Math.round(e * 2400)).padStart(4, '0');
      if (p < 1) requestAnimationFrame(tick);
      else {
        loader.classList.add('is-cut');
        setTimeout(() => { loader.classList.add('is-open'); finish(); lenis && lenis.start(); }, 480);
        setTimeout(() => loader.classList.add('is-done'), 1700);
      }
    };
    requestAnimationFrame(tick);
  }

  /* ------------------------------------------------------------------ */
  /* Nav, menu, progress                                                  */
  /* ------------------------------------------------------------------ */
  const nav = $('[data-nav]');
  const bar = $('.progress span');
  const menu = $('[data-menu]');
  const menuBtn = $('[data-menu-btn]');
  let lastY = 0;
  let menuTimer;

  function openMenu() {
    clearTimeout(menuTimer);
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.querySelector('.nav__menu-label').textContent = 'Close';
    nav.classList.remove('is-hidden');
    lenis && lenis.stop();
  }
  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.querySelector('.nav__menu-label').textContent = 'Menu';
    lenis && lenis.start();
    menuTimer = setTimeout(() => { menu.hidden = true; }, 700);
  }
  menuBtn.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  function updateNav(y) {
    nav.classList.toggle('is-scrolled', y > 40);
    if (menu.hidden) {
      if (y > lastY + 4 && y > innerHeight * 0.6) nav.classList.add('is-hidden');
      else if (y < lastY - 4) nav.classList.remove('is-hidden');
    }
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? (y / max).toFixed(4) : 0})`;
  }

  /* ------------------------------------------------------------------ */
  /* Reveals                                                              */
  /* ------------------------------------------------------------------ */
  // Masked lines are clipped by their parent, so watch the .line wrapper instead of the span.
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const t = e.target;
      (t.matches('[data-reveal], [data-clip], [data-wordmark]') ? [t] : $$('[data-reveal]', t)).forEach((el) => el.classList.add('is-in'));
      revealIO.unobserve(t);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  const watched = new Set();
  $$('[data-reveal], [data-clip], [data-wordmark]').forEach((el) => watched.add(el.parentElement.classList.contains('line') ? el.parentElement : el));
  watched.forEach((el) => revealIO.observe(el));

  /* ------------------------------------------------------------------ */
  /* Manifesto: words light up as you read                                */
  /* ------------------------------------------------------------------ */
  const words = $('[data-words]');
  let wordEls = [];
  if (words) {
    const wrap = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(' '));
            else { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) {
          n.classList.add('w');
        }
      });
    };
    wrap(words);
    wordEls = $$('.w', words);
    if (reduce) wordEls.forEach((w) => w.classList.add('on', 'cut'));
  }
  function updateWords() {
    if (!wordEls.length || reduce) return;
    const r = words.getBoundingClientRect();
    const vh = innerHeight;
    const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.3), 0, 1);
    const n = Math.round(p * wordEls.length * 1.08);
    wordEls.forEach((w, i) => {
      const on = i < n;
      if (w.classList.contains('on') !== on) {
        w.classList.toggle('on', on);
        if (w.tagName === 'S') w.classList.toggle('cut', on);
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* Services: drawing board follows the list                             */
  /* ------------------------------------------------------------------ */
  const svcs = $$('[data-svc]');
  const dwgs = $$('[data-dwg]');
  const dwgNo = $('[data-dwg-no]');
  const dwgName = $('[data-dwg-name]');
  const DWG_NAMES = ['Fitted wardrobe', 'Media wall', 'Understairs storage'];
  let activeSvc = -1;
  function setSvc(i) {
    if (i === activeSvc) return;
    activeSvc = i;
    svcs.forEach((s, j) => s.classList.toggle('is-active', j === i));
    dwgs.forEach((d, j) => d.classList.toggle('is-active', j === i));
    dwgNo.textContent = `DWG ${pad(i + 1)}`;
    dwgName.textContent = DWG_NAMES[i];
  }
  // Start with nothing drawn so the first drawing draws itself on arrival
  dwgs.forEach((d) => d.classList.remove('is-active'));
  const svcIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) setSvc(Number(e.target.dataset.svc)); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  svcs.forEach((s) => svcIO.observe(s));

  /* ------------------------------------------------------------------ */
  /* Process: horizontal run + tape measure                               */
  /* ------------------------------------------------------------------ */
  const hs = $('[data-hscroll]');
  const track = $('[data-htrack]');
  const tape = $('[data-tape]');
  const steps = $$('.step', track).filter((s) => !s.classList.contains('step--intro'));
  let hsMax = 0;
  let hsOn = false;

  if (tape) {
    const frag = document.createDocumentFragment();
    for (let i = 1; i <= 80; i++) {
      const s = document.createElement('span');
      s.style.left = `${i * 100}px`;
      if (i % 10 === 0) { s.textContent = `${i / 10}M`; s.className = 'r'; }
      else s.textContent = String(i * 10);
      frag.appendChild(s);
    }
    tape.appendChild(frag);
  }

  function layoutHS() {
    hsOn = innerWidth > 900 && !reduce;
    if (!hsOn) { hs.style.height = ''; track.style.transform = ''; return; }
    hsMax = Math.max(0, track.scrollWidth - innerWidth);
    hs.style.height = `${hsMax + innerHeight}px`;
  }
  function updateHS() {
    if (!hsOn) return;
    const r = hs.getBoundingClientRect();
    const p = clamp(-r.top / (r.height - innerHeight || 1), 0, 1);
    const x = p * hsMax;
    track.style.transform = `translate3d(${-x.toFixed(1)}px,0,0)`;
    tape.style.transform = `translate3d(${(-x * 1.15).toFixed(1)}px,0,0)`;
    const line = innerWidth * 0.62;
    steps.forEach((s) => s.classList.toggle('is-live', s.getBoundingClientRect().left < line));
  }
  if (!(innerWidth > 900 && !reduce)) {
    const stepIO = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting)), { rootMargin: '-35% 0px -35% 0px' });
    steps.forEach((s) => stepIO.observe(s));
  }

  /* ------------------------------------------------------------------ */
  /* Van parallax + scroll-spun blades                                    */
  /* ------------------------------------------------------------------ */
  const vanImg = $('[data-parallax]');
  const spinners = $$('[data-spin-scroll]');
  function updateMisc(y) {
    if (vanImg && !reduce) {
      const r = vanImg.parentElement.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight) {
        const o = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        vanImg.style.transform = `translate3d(0, ${(o * -7).toFixed(2)}%, 0)`;
      }
    }
    if (!reduce) spinners.forEach((s) => { s.style.transform = `rotate(${(y * 0.25).toFixed(1)}deg)`; });
  }

  /* ------------------------------------------------------------------ */
  /* Cursor + magnetic buttons                                            */
  /* ------------------------------------------------------------------ */
  const cursor = $('.cursor');
  const cur = { x: -100, y: -100, tx: -100, ty: -100, rot: 0 };
  if (finePointer && !reduce) {
    document.documentElement.classList.add('has-cursor');
    addEventListener('pointermove', (e) => {
      cur.tx = e.clientX; cur.ty = e.clientY;
      cursor.classList.add('is-on');
      const hov = e.target.closest('a, button, label, [data-magnetic]');
      cursor.classList.toggle('is-hover', !!hov);
    }, { passive: true });
    document.addEventListener('pointerleave', () => cursor.classList.remove('is-on'));

    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.3}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }
  function updateCursor() {
    if (!cursor.classList.contains('is-on')) return;
    const px = cur.x, py = cur.y;
    cur.x = lerp(cur.x, cur.tx, 0.28);
    cur.y = lerp(cur.y, cur.ty, 0.28);
    cur.rot += Math.hypot(cur.x - px, cur.y - py) * 1.6 + 0.6;
    cursor.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) rotate(${cur.rot % 360}deg)`;
  }

  /* ------------------------------------------------------------------ */
  /* Quote form → pre-filled email                                        */
  /* ------------------------------------------------------------------ */
  const form = $('[data-form]');
  const note = $('[data-form-note]');
  function pickChip(value) {
    const input = form.querySelector(`input[name="type"][value="${value}"]`);
    if (input) input.checked = true;
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const name = (d.get('name') || '').trim();
    const phone = (d.get('phone') || '').trim();
    const email = (d.get('email') || '').trim();
    $$('.field', form).forEach((f) => f.classList.remove('is-error'));
    note.classList.remove('is-error', 'is-ok');

    if (!name || (!phone && !email)) {
      if (!name) form.elements.name.closest('.field').classList.add('is-error');
      if (!phone && !email) form.elements.phone.closest('.field').classList.add('is-error');
      note.textContent = 'We just need your name and a phone number or email to get back to you.';
      note.classList.add('is-error');
      (!name ? form.elements.name : form.elements.phone).focus();
      return;
    }
    const types = d.getAll('type');
    const details = [
      `Name: ${name}`,
      phone && `Phone: ${phone}`,
      email && `Email: ${email}`,
      d.get('area') && `Area / postcode: ${d.get('area')}`,
      types.length && `Project: ${types.join(', ')}`,
      d.get('when') && `Timing: ${d.get('when')}`,
    ].filter(Boolean);
    const body = `${details.join('\n')}\n\n${(d.get('message') || '').trim() || '(No extra details yet.)'}`;
    const subject = `Free quote request${types.length ? ` · ${types.join(', ')}` : ''}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.textContent = 'Your email app should open with everything filled in. Just hit send. Nothing opened? Call 07824 364 116.';
    note.classList.add('is-ok');
  });

  /* ------------------------------------------------------------------ */
  /* Footer bits                                                          */
  /* ------------------------------------------------------------------ */
  const yearEl = $('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------ */
  /* One loop to drive it all                                             */
  /* ------------------------------------------------------------------ */
  let last = performance.now();
  let prevY = window.scrollY;
  let vel = 0;
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (lenis) lenis.raf(now);
    const y = window.scrollY;
    vel = lerp(vel, (y - prevY) / Math.max(dt, 0.001), 0.2);
    prevY = y;

    updateHero(dt, y, vel);
    updateNav(y);
    updateWords();
    updateHS();
    updateMisc(y);
    updateCursor();
    requestAnimationFrame(frame);
  }

  const onResize = () => { layoutHS(); };
  addEventListener('resize', onResize);
  layoutHS();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutHS);
  addEventListener('load', layoutHS);

  runLoader();
  requestAnimationFrame(frame);
})();
