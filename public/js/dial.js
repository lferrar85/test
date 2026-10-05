// The Roof Dial: drag the sun round a compass to say which way the roof faces.
// Accessible as a slider (arrow keys), with the share of the best-possible sun shown live.
import { orientationFactor, compassName } from './model.js';

const CX = 200;
const CY = 200;
const R_OUT = 164;
const R_IN = 84;

const pol = (r, deg) => {
  const a = (deg * Math.PI) / 180;
  return [CX + r * Math.sin(a), CY - r * Math.cos(a)];
};
const f = (n) => n.toFixed(2);

function wedgePath(halfSpan = 22.5) {
  const [x1, y1] = pol(R_OUT, -halfSpan);
  const [x2, y2] = pol(R_OUT, halfSpan);
  const [x3, y3] = pol(R_IN, halfSpan);
  const [x4, y4] = pol(R_IN, -halfSpan);
  return `M${f(x1)} ${f(y1)} A${R_OUT} ${R_OUT} 0 0 1 ${f(x2)} ${f(y2)} L${f(x3)} ${f(y3)} A${R_IN} ${R_IN} 0 0 0 ${f(x4)} ${f(y4)} Z`;
}

function ticks() {
  let out = '';
  for (let d = 0; d < 360; d += 5) {
    const major = d % 45 === 0;
    const mid = d % 15 === 0;
    const [x1, y1] = pol(R_OUT + 3, d);
    const [x2, y2] = pol(R_OUT + (major ? 14 : mid ? 9 : 6), d);
    out += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" class="dial-tick${major ? ' major' : ''}"/>`;
  }
  return out;
}

function labels() {
  return [['N', 0], ['E', 90], ['S', 180], ['W', 270]]
    .map(([t, d]) => {
      const [x, y] = pol(R_OUT + 42, d);
      return `<text x="${f(x)}" y="${f(y)}" class="dial-label" text-anchor="middle" dominant-baseline="central">${t}</text>`;
    })
    .join('');
}

export function createDial(host, { azimuth = 180, tilt = 35, onChange = () => {} } = {}) {
  const [sx, sy] = pol(R_OUT, 0);
  const rays = Array.from({ length: 8 }, (_, i) => {
    const [x1, y1] = [sx + 22 * Math.sin((i * Math.PI) / 4), sy - 22 * Math.cos((i * Math.PI) / 4)];
    const [x2, y2] = [sx + 30 * Math.sin((i * Math.PI) / 4), sy - 30 * Math.cos((i * Math.PI) / 4)];
    return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" class="dial-ray"/>`;
  }).join('');

  host.innerHTML = `<svg class="dial" viewBox="-24 -24 448 448" role="slider" tabindex="0" aria-label="Which way your roof faces, as a compass bearing" aria-valuemin="0" aria-valuemax="359" aria-orientation="horizontal" focusable="true">
  <defs>
    <radialGradient id="dial-grad" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#efefeb"/></radialGradient>
    <linearGradient id="dial-sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe45c"/><stop offset="1" stop-color="#ffb400"/></linearGradient>
  </defs>
  <circle class="dial-disc" cx="${CX}" cy="${CY}" r="${R_OUT}"/>
  <circle class="dial-ring" cx="${CX}" cy="${CY}" r="${R_IN}"/>
  <path class="dial-sunpath" d="M${CX + 124} ${CY} A124 124 0 0 1 ${CX - 124} ${CY}" />
  ${ticks()}
  ${labels()}
  <g class="dial-rot">
    <path class="dial-wedge" d="${wedgePath()}"/>
    <circle class="dial-halo" cx="${f(sx)}" cy="${f(sy)}" r="26"/>
    ${rays}
    <circle class="dial-sun" cx="${f(sx)}" cy="${f(sy)}" r="16"/>
    <circle class="dial-hit" cx="${f(sx)}" cy="${f(sy)}" r="34"/>
  </g>
  <text class="dial-pct" x="${CX}" y="${CY - 6}" text-anchor="middle" dominant-baseline="central"></text>
  <text class="dial-pct-label" x="${CX}" y="${CY + 30}" text-anchor="middle">of the best-</text>
  <text class="dial-pct-label" x="${CX}" y="${CY + 44}" text-anchor="middle">possible sun</text>
</svg>`;

  const svg = host.querySelector('svg');
  const rot = svg.querySelector('.dial-rot');
  const wedge = svg.querySelector('.dial-wedge');
  const pctEl = svg.querySelector('.dial-pct');

  let az = ((azimuth % 360) + 360) % 360;
  let shown = az; // unwrapped angle, so CSS transitions turn the short way round
  let currentTilt = tilt;

  function draw() {
    const delta = ((((az - shown) % 360) + 540) % 360) - 180;
    shown += delta;
    rot.style.transform = `rotate(${shown}deg)`;
    const pct = Math.round(orientationFactor(az, currentTilt) * 100);
    pctEl.textContent = `${pct}%`;
    wedge.style.opacity = String(0.28 + 0.62 * Math.min(1, Math.max(0, (pct - 28) / 72)));
    svg.setAttribute('aria-valuenow', String(Math.round(az) % 360));
    svg.setAttribute('aria-valuetext', `${compassName(az)}, ${pct}% of the best-possible sun`);
  }

  function set(next, { silent = false } = {}) {
    az = ((next % 360) + 360) % 360;
    draw();
    if (!silent) onChange(az);
  }

  function fromPointer(e) {
    const r = svg.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    deg = ((deg % 360) + 360) % 360;
    let snapped = Math.round(deg / 5) * 5;
    const nearest = Math.round(snapped / 45) * 45;
    if (Math.abs(snapped - nearest) <= 5) snapped = nearest;
    set(snapped % 360);
  }

  let dragging = false;
  svg.addEventListener('pointerdown', (e) => {
    dragging = true;
    svg.setPointerCapture(e.pointerId);
    svg.classList.add('dragging', 'touched');
    fromPointer(e);
    e.preventDefault();
    svg.focus({ preventScroll: true });
  });
  svg.addEventListener('pointermove', (e) => dragging && fromPointer(e));
  const stop = (e) => {
    dragging = false;
    svg.classList.remove('dragging');
    if (e.pointerId !== undefined && svg.hasPointerCapture?.(e.pointerId)) svg.releasePointerCapture(e.pointerId);
  };
  svg.addEventListener('pointerup', stop);
  svg.addEventListener('pointercancel', stop);
  svg.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 45 : 5;
    let handled = true;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') set(az + step);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') set(az - step);
    else if (e.key === 'Home') set(180);
    else handled = false;
    if (handled) {
      svg.classList.add('touched');
      e.preventDefault();
    }
  });

  draw();
  return {
    set,
    get: () => az,
    setTilt(t) {
      currentTilt = t;
      draw();
    },
  };
}
