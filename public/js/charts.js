// Two small SVG charts with hover/keyboard tooltips and a table view. No dependencies.
// Colours come from CSS variables (--series-1/2/3 etc.), validated for colour-blind
// separation on the paper surface. Text never wears a series colour: identity comes
// from the mark beside the text.
import { gbp, num, esc } from './format.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (name, attrs = {}, parent) => {
  const n = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (parent) parent.appendChild(n);
  return n;
};

function niceStep(max, ticks = 4) {
  const raw = max / ticks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  return (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
}
const compact = (v) => {
  const a = Math.abs(v);
  const s = a >= 1000 ? `${+(a / 1000).toFixed(a % 1000 === 0 ? 0 : 1)}k` : `${a}`;
  return `${v < 0 ? '−' : ''}£${s}`;
};

// Round the top corners only: bars are square at the baseline, rounded at the data end.
function barPath(x, y, w, h, r = 4) {
  r = Math.min(r, w / 2, h);
  return `M${x} ${y + h}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h}Z`;
}

function shell(host, { title, legend, tableHtml, label }) {
  host.innerHTML = `<figure class="chart">
  <figcaption class="chart-head"><h3 class="chart-title">${esc(title)}</h3>
    <button type="button" class="chart-toggle" aria-pressed="false">View as table</button></figcaption>
  <ul class="legend">${legend.map((l) => `<li><span class="key key-${l.type}" style="--c:${l.color}" aria-hidden="true"></span>${esc(l.label)}</li>`).join('')}</ul>
  <div class="chart-plot" data-plot></div>
  <div class="chart-table" data-table hidden>${tableHtml}</div>
  <div class="tooltip" role="status" hidden></div>
</figure>`;
  const plot = host.querySelector('[data-plot]');
  const table = host.querySelector('[data-table]');
  const toggle = host.querySelector('.chart-toggle');
  toggle.addEventListener('click', () => {
    const showTable = toggle.getAttribute('aria-pressed') !== 'true';
    toggle.setAttribute('aria-pressed', String(showTable));
    toggle.textContent = showTable ? 'View as chart' : 'View as table';
    table.hidden = !showTable;
    plot.hidden = showTable;
    host.querySelector('.legend').hidden = showTable;
    if (!showTable) host.dispatchEvent(new Event('chart:show'));
  });
  return { plot, tip: host.querySelector('.tooltip'), fig: host.querySelector('.chart'), label };
}

function placeTip(tip, fig, x, y, html) {
  tip.innerHTML = html;
  tip.hidden = false;
  const fr = fig.getBoundingClientRect();
  const pr = fig.querySelector('[data-plot]').getBoundingClientRect();
  const w = tip.offsetWidth;
  let left = pr.left - fr.left + x + 14;
  if (left + w > fr.width - 4) left = pr.left - fr.left + x - w - 14;
  tip.style.left = `${Math.max(4, left)}px`;
  tip.style.top = `${pr.top - fr.top + Math.max(0, y - 20)}px`;
}

const tipRow = (color, type, label, value) =>
  `<div class="tip-row"><span class="key key-${type}" style="--c:${color}" aria-hidden="true"></span><strong>${value}</strong><span class="tip-label">${esc(label)}</span></div>`;

// ---------------------------------------------------------------------------
// Monthly: columns for solar generated, a line for the home's use.

export function monthlyChart(host, months) {
  const C1 = 'var(--series-1)';
  const C2 = 'var(--series-2)';
  const tableHtml = `<table class="data-table"><caption class="visually-hidden">Monthly solar generation and home electricity use, kWh</caption><thead><tr><th scope="col">Month</th><th scope="col">Solar made</th><th scope="col">Home uses</th><th scope="col">Bought from grid</th><th scope="col">Sent to grid</th></tr></thead><tbody>${months
    .map((m) => `<tr><th scope="row">${m.month}</th><td>${num(m.gen)}</td><td>${num(m.demand)}</td><td>${num(m.imported)}</td><td>${num(m.exported)}</td></tr>`)
    .join('')}</tbody></table>`;
  const { plot, tip, fig } = shell(host, {
    title: 'Solar made each month, against what your home uses (kWh)',
    legend: [
      { type: 'bar', color: C1, label: 'Solar made' },
      { type: 'line', color: C2, label: 'Your home’s use' },
    ],
    tableHtml,
  });

  function draw() {
    const W = Math.max(280, plot.clientWidth || 640);
    const H = W < 480 ? 250 : 300;
    const m = { l: 46, r: 12, t: 14, b: 30 };
    const iw = W - m.l - m.r;
    const ih = H - m.t - m.b;
    const maxV = Math.max(...months.map((d) => Math.max(d.gen, d.demand)));
    const step = niceStep(maxV, 4);
    const top = Math.ceil(maxV / step) * step;
    const y = (v) => m.t + ih - (v / top) * ih;
    const band = iw / months.length;
    const bw = Math.min(24, band * 0.62);

    plot.innerHTML = '';
    const svg = el('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: 'img', tabindex: '0', class: 'chart-svg', 'aria-label': `Monthly chart. Solar made peaks at ${num(Math.max(...months.map((d) => d.gen)))} kWh in ${months.reduce((a, b) => (b.gen > a.gen ? b : a)).month}. Use the left and right arrow keys to read each month, or view as a table.` }, plot);

    for (let v = 0; v <= top + 1e-6; v += step) {
      el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: v === 0 ? 'axis' : 'grid' }, svg);
      const t = el('text', { x: m.l - 8, y: y(v), class: 'tick', 'text-anchor': 'end', 'dominant-baseline': 'central' }, svg);
      t.textContent = num(v);
    }
    const bars = months.map((d, i) => {
      const x = m.l + band * i + (band - bw) / 2;
      const h = ih - (y(d.gen) - m.t);
      return el('path', { d: barPath(x, y(d.gen), bw, Math.max(h, 0)), class: 'bar', fill: C1 }, svg);
    });
    months.forEach((d, i) => {
      const t = el('text', { x: m.l + band * i + band / 2, y: H - 8, class: 'tick', 'text-anchor': 'middle' }, svg);
      t.textContent = W < 420 ? d.month[0] : d.month;
    });

    // peak label (direct label on the extreme only)
    const peak = months.reduce((a, b, i) => (b.gen > months[a].gen ? i : a), 0);
    const pt = el('text', { x: m.l + band * peak + band / 2, y: y(months[peak].gen) - 8, class: 'peak-label', 'text-anchor': 'middle' }, svg);
    pt.textContent = `${num(months[peak].gen)}`;

    const pts = months.map((d, i) => [m.l + band * i + band / 2, y(d.demand)]);
    el('polyline', { points: pts.map((p) => p.join(',')).join(' '), class: 'line', stroke: C2 }, svg);
    const [lx, ly] = pts[pts.length - 1];
    el('circle', { cx: lx, cy: ly, r: 6, class: 'end-dot', fill: C2 }, svg);

    const guide = el('line', { y1: m.t, y2: m.t + ih, class: 'crosshair', visibility: 'hidden' }, svg);
    let active = -1;
    const show = (i) => {
      active = i;
      const d = months[i];
      guide.setAttribute('x1', pts[i][0]);
      guide.setAttribute('x2', pts[i][0]);
      guide.setAttribute('visibility', 'visible');
      bars.forEach((b, j) => b.classList.toggle('hot', j === i));
      placeTip(tip, fig, pts[i][0], Math.min(y(d.gen), y(d.demand)), `<div class="tip-head">${d.month}</div>${tipRow(C1, 'bar', 'Solar made', `${num(d.gen)} kWh`)}${tipRow(C2, 'line', 'Your home uses', `${num(d.demand)} kWh`)}`);
    };
    const hide = () => {
      active = -1;
      guide.setAttribute('visibility', 'hidden');
      bars.forEach((b) => b.classList.remove('hot'));
      tip.hidden = true;
    };
    const idxFor = (e) => {
      const r = svg.getBoundingClientRect();
      return Math.min(months.length - 1, Math.max(0, Math.floor((e.clientX - r.left - m.l) / band)));
    };
    svg.addEventListener('pointermove', (e) => show(idxFor(e)));
    svg.addEventListener('pointerleave', hide);
    svg.addEventListener('blur', hide);
    svg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(Math.min(months.length - 1, active + 1));
      else if (e.key === 'ArrowLeft') show(Math.max(0, active < 0 ? 0 : active - 1));
      else if (e.key === 'Escape') hide();
      else return;
      e.preventDefault();
    });
  }
  draw();
  const ro = new ResizeObserver(() => {
    if (!plot.hidden) draw();
  });
  ro.observe(plot);
  host.addEventListener('chart:show', draw);
  return () => ro.disconnect();
}

// ---------------------------------------------------------------------------
// Payback: cumulative position over 25 years for the three options.

export function paybackChart(host, scenarios, selected) {
  const COLORS = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)'];
  const names = scenarios.map((s) => (s.battery ? `+ ${s.battery} kWh battery` : 'Solar only'));
  const years = scenarios[0].series.map((p) => p.year);
  const tableHtml = `<table class="data-table"><caption class="visually-hidden">Running total after paying for the system, by year, £</caption><thead><tr><th scope="col">Year</th>${names.map((n) => `<th scope="col">${esc(n)}</th>`).join('')}</tr></thead><tbody>${years
    .filter((y) => y % 1 === 0)
    .map((y) => `<tr><th scope="row">${y}</th>${scenarios.map((s) => `<td>${gbp(s.series[y].cumulative)}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`;
  const { plot, tip, fig } = shell(host, {
    title: 'Where you stand after paying for it, year by year',
    legend: scenarios.map((s, i) => ({ type: 'line', color: COLORS[i], label: names[i] })),
    tableHtml,
  });

  function draw() {
    const W = Math.max(280, plot.clientWidth || 640);
    const H = W < 480 ? 260 : 320;
    const m = { l: 54, r: 14, t: 14, b: 30 };
    const ih = H - m.t - m.b;
    const all = scenarios.flatMap((s) => s.series.map((p) => p.cumulative));
    const lo = Math.min(...all);
    const hi = Math.max(...all);
    const step = niceStep(hi - lo, 5);
    const yMin = Math.floor(lo / step) * step;
    const yMax = Math.ceil(hi / step) * step;
    const y = (v) => m.t + ih - ((v - yMin) / (yMax - yMin)) * ih;
    // End labels only when there is room for them and they don't collide; otherwise the
    // legend and tooltip carry identity and the plot keeps the full width.
    const ends = scenarios.map((s, i) => ({ i, yy: y(s.series[25].cumulative) })).sort((a, b) => a.yy - b.yy);
    const showEnds = W >= 560 && ends.every((e, k) => k === 0 || e.yy - ends[k - 1].yy >= 30);
    if (showEnds) m.r = 126;
    const iw = W - m.l - m.r;
    const x = (yr) => m.l + (yr / 25) * iw;

    plot.innerHTML = '';
    const svg = el('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, role: 'img', tabindex: '0', class: 'chart-svg', 'aria-label': `Payback chart over 25 years for ${names.join(', ')}. Use the left and right arrow keys to move through the years, or view as a table.` }, plot);

    for (let v = yMin; v <= yMax + 1e-6; v += step) {
      el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), class: Math.abs(v) < 1e-6 ? 'axis axis-zero' : 'grid' }, svg);
      const t = el('text', { x: m.l - 8, y: y(v), class: 'tick', 'text-anchor': 'end', 'dominant-baseline': 'central' }, svg);
      t.textContent = compact(v);
    }
    for (const yr of [0, 5, 10, 15, 20, 25]) {
      const t = el('text', { x: x(yr), y: H - 8, class: 'tick', 'text-anchor': yr === 0 ? 'start' : yr === 25 ? 'end' : 'middle' }, svg);
      t.textContent = yr === 0 ? 'Now' : `Yr ${yr}`;
    }

    scenarios.forEach((s, i) => {
      const d = s.series.map((p) => `${x(p.year).toFixed(1)},${y(p.cumulative).toFixed(1)}`).join(' ');
      el('polyline', { points: d, class: `line${s.battery === selected ? ' line-selected' : ''}`, stroke: COLORS[i] }, svg);
    });
    // payback markers where each line crosses zero
    scenarios.forEach((s, i) => {
      if (s.payback != null) el('circle', { cx: x(s.payback), cy: y(0), r: 5, class: 'end-dot', fill: COLORS[i] }, svg);
    });
    // end labels, only when there is room and the labels don't collide
    if (showEnds) {
      for (const e of ends) {
        const t = el('text', { x: W - m.r + 8, y: e.yy - 3, class: 'end-label' }, svg);
        t.textContent = gbp(scenarios[e.i].series[25].cumulative);
        const t2 = el('text', { x: W - m.r + 8, y: e.yy + 11, class: 'end-label end-sub' }, svg);
        t2.textContent = names[e.i];
      }
    }

    const guide = el('line', { y1: m.t, y2: m.t + ih, class: 'crosshair', visibility: 'hidden' }, svg);
    let active = -1;
    const show = (yr) => {
      active = yr;
      guide.setAttribute('x1', x(yr));
      guide.setAttribute('x2', x(yr));
      guide.setAttribute('visibility', 'visible');
      const rows = scenarios.map((s, i) => tipRow(COLORS[i], 'line', names[i], gbp(s.series[yr].cumulative))).join('');
      placeTip(tip, fig, x(yr), m.t + ih / 3, `<div class="tip-head">${yr === 0 ? 'Day one, after paying' : `After ${yr} year${yr > 1 ? 's' : ''}`}</div>${rows}`);
    };
    const hide = () => {
      active = -1;
      guide.setAttribute('visibility', 'hidden');
      tip.hidden = true;
    };
    svg.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      show(Math.min(25, Math.max(0, Math.round(((e.clientX - r.left - m.l) / iw) * 25))));
    });
    svg.addEventListener('pointerleave', hide);
    svg.addEventListener('blur', hide);
    svg.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') show(Math.min(25, active + 1));
      else if (e.key === 'ArrowLeft') show(Math.max(0, active < 0 ? 0 : active - 1));
      else if (e.key === 'Escape') hide();
      else return;
      e.preventDefault();
    });
  }
  draw();
  const ro = new ResizeObserver(() => {
    if (!plot.hidden) draw();
  });
  ro.observe(plot);
  host.addEventListener('chart:show', draw);
  return () => ro.disconnect();
}
