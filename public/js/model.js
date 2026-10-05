// The solar savings model. Pure functions, no DOM, runs in the browser and in Node.
//
// How it works, in one paragraph: annual generation = system size x regional yield x
// roof orientation/pitch factor x shading. That is spread over the months and then over
// the hours of a typical clear day and a typical dull day. Each hour, solar first meets
// the home's demand, any surplus charges the battery (if there is one) and then goes to
// the grid, and any shortfall is met by the battery and then the grid. Money follows the
// energy: avoided purchases are worth the import rate, exports earn the export rate.

import * as D from './data.js';

const A = D.ASSUMPTIONS;
const sum = (a) => a.reduce((x, y) => x + y, 0);
const normalise = (a) => {
  const s = sum(a);
  return a.map((v) => v / s);
};
const MONTH_SHARE = normalise(D.MONTH_SHARE);

// ---------------------------------------------------------------------------
// Postcodes and compass

export function parsePostcode(raw) {
  const s = String(raw || '').toUpperCase().replace(/\s+/g, '');
  const m = /^([A-Z]{1,2})(\d[A-Z\d]?)(\d[A-Z]{2})$/.exec(s);
  if (!m) return null;
  const area = m[1];
  return {
    area,
    outward: m[1] + m[2],
    formatted: `${m[1]}${m[2]} ${m[3]}`,
    region: D.POSTCODE_AREAS[area] || 'uk',
  };
}

const COMPASS = ['North', 'North-east', 'East', 'South-east', 'South', 'South-west', 'West', 'North-west'];
export function compassName(azimuth) {
  const a = ((azimuth % 360) + 360) % 360;
  return COMPASS[Math.round(a / 45) % 8];
}
export const compassBearing = (name) => COMPASS.indexOf(name) * 45;
export const COMPASS_POINTS = COMPASS;

// ---------------------------------------------------------------------------
// Orientation x tilt

function bracket(xs, x) {
  const clamped = Math.min(Math.max(x, xs[0]), xs[xs.length - 1]);
  let i = 0;
  while (i < xs.length - 2 && clamped > xs[i + 1]) i++;
  return { i, t: (clamped - xs[i]) / (xs[i + 1] - xs[i]) };
}

// Share (0-1) of the best possible yield for a roof facing `azimuth` (compass bearing,
// 180 = due south) at `tilt` degrees.
export function orientationFactor(azimuth, tilt) {
  const offset = Math.abs((((azimuth - 180) % 360) + 540) % 360 - 180);
  const r = bracket(D.ORIENT_TILTS, tilt);
  const c = bracket(D.ORIENT_OFFSETS, offset);
  const T = D.ORIENT_TABLE;
  const lerp = (a, b, t) => a + (b - a) * t;
  const lo = lerp(T[r.i][c.i], T[r.i][c.i + 1], c.t);
  const hi = lerp(T[r.i + 1][c.i], T[r.i + 1][c.i + 1], c.t);
  return lerp(lo, hi, r.t) / 100;
}

// ---------------------------------------------------------------------------
// Inputs

export function defaultInput() {
  return {
    postcode: '',
    region: 'uk',
    roofs: [{ azimuth: 180, tilt: 35, space: 'medium' }],
    shading: 'none',
    bedrooms: 3,
    occupants: 3,
    occupancy: 'partial',
    usageMode: 'estimate', // 'estimate' | 'kwh' | 'bill'
    usageKwh: null,
    billPerMonth: null,
    ev: 'none', // 'none' | 'have' | 'plan'
    heating: 'gas', // 'gas' | 'hp' | 'hp_plan' | 'elec'
    importRate: A.importRate,
    exportRate: A.exportRate,
    panels: null, // null = recommended
    battery: 0,
    quoteCost: null,
  };
}

export function roofCapacity(roofs) {
  return roofs.map((r) => D.ROOF_SPACE[r.space]?.panels ?? 10);
}

function splitPanels(n, caps) {
  if (caps.length === 1) return [Math.min(n, caps[0])];
  const total = caps[0] + caps[1];
  let n1 = Math.min(caps[0], Math.round((n * caps[0]) / total));
  let n2 = n - n1;
  if (n2 > caps[1]) {
    n2 = caps[1];
    n1 = Math.min(caps[0], n - n2);
  }
  return [n1, n2];
}

// ---------------------------------------------------------------------------
// Demand

export function demandComponents(input) {
  const { bedrooms, occupants, usageMode } = input;
  const evKwh = input.ev !== 'none' ? D.EV_KWH_PER_YEAR : 0;
  const hpKwh = input.heating === 'hp' || input.heating === 'hp_plan' ? D.heatPumpKwh(bedrooms) : 0;
  const elecKwh = input.heating === 'elec' ? D.electricHeatKwh(bedrooms) : 0;

  let base;
  if (usageMode === 'estimate') {
    base = D.estimateBaseUsage(bedrooms, occupants);
  } else {
    let total = Number(input.usageKwh) || 0;
    if (usageMode === 'bill') {
      const bill = Number(input.billPerMonth) || 0;
      const standing = (D.STANDING_CHARGE_P_PER_DAY * 365) / 100;
      total = Math.max(0, (bill * 12 - standing) / (input.importRate / 100));
    }
    // 'have' extras are already inside what they told us; 'plan' extras get added on top.
    const alreadyInside =
      (input.ev === 'have' ? evKwh : 0) + (input.heating === 'hp' ? hpKwh : 0) + (input.heating === 'elec' ? elecKwh : 0);
    base = Math.max(1200, total - alreadyInside);
  }
  return { base, ev: evKwh, heatPump: hpKwh, elecHeat: elecKwh, total: base + evKwh + hpKwh + elecKwh };
}

// Average-day demand in kWh for each hour, for each month: [12][24]
function hourlyDemand(input, comp) {
  const occ = D.OCCUPANCY[input.occupancy] || D.OCCUPANCY.partial;
  const baseShape = normalise(occ.shape);
  const hpShape = normalise(D.HEAT_PUMP_SHAPE);
  const elecShape = normalise(D.ELEC_HEAT_SHAPE);
  const dayShare = D.EV_DAYTIME_SHARE[input.occupancy] ?? 0.2;
  const evShape = normalise(
    Array.from({ length: 24 }, (_, h) => {
      const day = h >= 10 && h < 16 ? dayShare / 6 : 0;
      const night = h < 6 ? (1 - dayShare) / 6 : 0;
      return day + night;
    }),
  );
  const baseNorm = sum(D.BASE_SEASON.map((w, m) => w * D.MONTH_DAYS[m]));

  return D.MONTH_DAYS.map((days, m) => {
    const baseDay = (comp.base * D.BASE_SEASON[m]) / baseNorm;
    const evDay = comp.ev / 365.25;
    const hpDay = (comp.heatPump * D.HEAT_SEASON[m]) / days;
    const elecDay = (comp.elecHeat * D.ELEC_SEASON[m]) / days;
    return Array.from({ length: 24 }, (_, h) => baseDay * baseShape[h] + evDay * evShape[h] + hpDay * hpShape[h] + elecDay * elecShape[h]);
  });
}

// ---------------------------------------------------------------------------
// Generation

function genShape(month, azimuth) {
  const L = D.DAY_LENGTH[month];
  const shift = 2 * Math.sin(((azimuth - 180) * Math.PI) / 180) * Math.min(1, L / 12);
  const centre = D.SOLAR_NOON[month] + shift;
  const shape = Array.from({ length: 24 }, (_, h) => {
    const x = (h + 0.5 - centre) / L;
    return Math.abs(x) < 0.5 ? Math.cos(Math.PI * x) ** 1.3 : 0;
  });
  return normalise(shape);
}

function facesFor(input, panels) {
  const caps = roofCapacity(input.roofs);
  const counts = splitPanels(panels, caps);
  const region = D.REGIONS[input.region] || D.REGIONS.uk;
  const shade = (D.SHADING[input.shading] || D.SHADING.none).factor;
  return input.roofs.map((r, i) => {
    const kWp = (counts[i] * A.panelWatt) / 1000;
    const factor = orientationFactor(r.azimuth, r.tilt);
    return {
      panels: counts[i],
      kWp,
      azimuth: r.azimuth,
      tilt: r.tilt,
      factor,
      annual: kWp * region.yield * factor * shade,
    };
  });
}

// ---------------------------------------------------------------------------
// The hourly simulation

function simulate(demandDay, faces, batteryKwh, genScale = 1) {
  const eta = Math.sqrt(A.batteryRoundTrip);
  const usable = batteryKwh * A.batteryUsableShare;
  const power = batteryKwh ? Math.min(5, Math.max(2.4, batteryKwh * 0.6)) : 0;
  const shapes = faces.map((f) => Array.from({ length: 12 }, (_, m) => genShape(m, f.azimuth)));

  const totals = { gen: 0, demand: 0, direct: 0, batt: 0, exported: 0, imported: 0 };
  const monthly = [];

  for (let m = 0; m < 12; m++) {
    const days = D.MONTH_DAYS[m];
    const mo = { gen: 0, demand: 0, direct: 0, batt: 0, exported: 0, imported: 0 };
    const monthGenDay = faces.map((f) => (f.annual * genScale * MONTH_SHARE[m]) / days);

    for (const mix of D.DAY_MIX) {
      const w = days * mix.weight;
      let soc = 0;
      for (let pass = 0; pass < 3; pass++) {
        const rec = pass === 2;
        for (let h = 0; h < 24; h++) {
          let g = 0;
          for (let f = 0; f < faces.length; f++) g += monthGenDay[f] * mix.factor * shapes[f][m][h];
          const d = demandDay[m][h];
          const direct = Math.min(g, d);
          let surplus = g - direct;
          let deficit = d - direct;
          let fromBatt = 0;
          if (surplus > 0 && usable > 0) {
            const charge = Math.min(surplus, power, (usable - soc) / eta);
            soc += charge * eta;
            surplus -= charge;
          }
          if (deficit > 0 && soc > 0) {
            fromBatt = Math.min(deficit, power, soc * eta);
            soc -= fromBatt / eta;
            deficit -= fromBatt;
          }
          if (rec) {
            mo.gen += g * w;
            mo.demand += d * w;
            mo.direct += direct * w;
            mo.batt += fromBatt * w;
            mo.exported += surplus * w;
            mo.imported += deficit * w;
          }
        }
      }
    }
    for (const k of Object.keys(totals)) totals[k] += mo[k];
    monthly.push(mo);
  }
  return { ...totals, monthly };
}

// ---------------------------------------------------------------------------
// Costs and the 25-year picture

const round50 = (x) => Math.round(x / 50) * 50;
export function systemCost(kWp, batteryKwh) {
  const solar = round50(A.costFixed + A.costPerKwp * kWp);
  const battery = batteryKwh ? round50(A.battFixed + A.battPerKwh * batteryKwh) : 0;
  return { solar, battery, total: solar + battery };
}

function annualMoney(flows, importRate, exportRate) {
  const avoided = ((flows.direct + flows.batt) * importRate) / 100;
  const exportIncome = (flows.exported * exportRate) / 100;
  return { avoided, exportIncome, saving: avoided + exportIncome };
}

function project(withBatt, withoutBatt, batteryKwh, cost, input) {
  const series = [{ year: 0, cumulative: -cost }];
  let cum = -cost;
  let payback = null;
  for (let y = 1; y <= A.systemLife; y++) {
    const deg = (1 - A.degradation) ** (y - 1);
    const price = input.importRate * (1 + A.priceInflation) ** (y - 1);
    const f = batteryKwh && y <= A.batteryLife ? withBatt : withoutBatt;
    const gain = ((f.direct + f.batt) * deg * price + f.exported * deg * input.exportRate) / 100;
    const before = cum;
    cum += gain;
    if (y === A.inverterYear) cum -= A.inverterCost;
    series.push({ year: y, cumulative: cum });
    if (payback === null && cum >= 0) payback = y - 1 + -before / (cum - before);
  }
  return { series, payback, net: cum };
}

// ---------------------------------------------------------------------------
// Public API

export function recommendPanels(input) {
  const ctx = prepare(input);
  const maxP = sum(roofCapacity(input.roofs));
  const threshold = ((A.panelWatt / 1000) * A.costPerKwp) / A.marginalPaybackYears;
  let prev = 0;
  let best = 1;
  for (let n = 1; n <= maxP; n++) {
    const s = annualMoney(simulate(ctx.demandDay, facesFor(input, n), 0), input.importRate, input.exportRate).saving;
    if (n > 1 && s - prev < threshold) break;
    best = n;
    prev = s;
  }
  return Math.min(maxP, Math.max(best, Math.min(6, maxP)));
}

function prepare(input) {
  const comp = demandComponents(input);
  return { comp, demandDay: hourlyDemand(input, comp) };
}

export function analyse(rawInput) {
  const input = { ...defaultInput(), ...rawInput };
  const ctx = prepare(input);
  const maxPanels = sum(roofCapacity(input.roofs));
  const recommended = recommendPanels(input);
  const panels = Math.min(maxPanels, Math.max(1, input.panels ?? recommended));
  const faces = facesFor(input, panels);
  const kWp = sum(faces.map((f) => f.kWp));
  const annualGen = sum(faces.map((f) => f.annual));
  const region = D.REGIONS[input.region] || D.REGIONS.uk;

  const run = (battery, scale = 1) => simulate(ctx.demandDay, faces, battery, scale);
  const solarOnly = run(0);
  const selected = input.battery ? run(input.battery) : solarOnly;

  const scenarioFor = (battery) => {
    const flows = battery === input.battery ? selected : run(battery);
    const cost = systemCost(kWp, battery);
    const money = annualMoney(flows, input.importRate, input.exportRate);
    const proj = project(flows, solarOnly, battery, cost.total, input);
    return { battery, cost, flows, money, ...proj };
  };
  const scenarios = A.batteryOptions.map(scenarioFor);

  const cost = systemCost(kWp, input.battery);
  const costUsed = input.quoteCost && input.quoteCost > 0 ? Number(input.quoteCost) : cost.total;
  const money = annualMoney(selected, input.importRate, input.exportRate);
  const proj = project(selected, solarOnly, input.battery, costUsed, input);

  const lowMoney = annualMoney(run(input.battery, A.rangeLow), input.importRate, input.exportRate).saving;
  const highMoney = annualMoney(run(input.battery, A.rangeHigh), input.importRate, input.exportRate).saving;

  const billBefore = (ctx.comp.total * input.importRate) / 100;
  const billAfter = (selected.imported * input.importRate) / 100;

  return {
    input,
    region,
    system: {
      panels,
      maxPanels,
      recommended,
      kWp,
      faces,
      annualGen,
      yieldPerKwp: kWp ? annualGen / kWp : 0,
      areaM2: panels * A.panelAreaM2,
    },
    demand: ctx.comp,
    flows: {
      generated: selected.gen,
      direct: selected.direct,
      fromBattery: selected.batt,
      exported: selected.exported,
      imported: selected.imported,
      selfUseShare: selected.gen ? (selected.direct + selected.batt) / selected.gen : 0,
      solarCover: ctx.comp.total ? (selected.direct + selected.batt) / ctx.comp.total : 0,
    },
    money: {
      billBefore,
      billAfter,
      avoided: money.avoided,
      exportIncome: money.exportIncome,
      saving: money.saving,
      low: lowMoney,
      high: highMoney,
    },
    cost: { ...cost, used: costUsed, fromQuote: costUsed !== cost.total || (input.quoteCost > 0) },
    payback: proj.payback,
    net25: proj.net,
    projection: proj.series,
    co2Tonnes: (selected.gen * A.gridCo2KgPerKwh) / 1000,
    monthly: selected.monthly.map((mo, m) => ({ month: D.MONTH_NAMES[m], ...mo })),
    scenarios,
  };
}

// How a quote compares with what we'd expect to pay for this system.
export function judgeQuote(result) {
  const quote = result.input.quoteCost;
  if (!quote || quote <= 0) return null;
  const typical = result.cost.total;
  const ratio = quote / typical;
  let verdict = 'in line with';
  if (ratio > 1.2) verdict = 'well above';
  else if (ratio > 1.08) verdict = 'a little above';
  else if (ratio < 0.8) verdict = 'well below';
  else if (ratio < 0.92) verdict = 'a little below';
  return { quote, typical, ratio, verdict };
}
