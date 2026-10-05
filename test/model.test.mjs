import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyse, defaultInput, orientationFactor, parsePostcode, compassName, judgeQuote, recommendPanels } from '../public/js/model.js';

const run = (over = {}) => analyse({ ...defaultInput(), region: 'london', ...over });

test('postcode parsing handles real-world formats', () => {
  assert.equal(parsePostcode('ls1 1aa').formatted, 'LS1 1AA');
  assert.equal(parsePostcode('LS11AA').region, 'yorks');
  assert.equal(parsePostcode('SW1A 2AA').area, 'SW');
  assert.equal(parsePostcode('EC1A1BB').region, 'london');
  assert.equal(parsePostcode('G1 1AA').region, 'scot');
  assert.equal(parsePostcode('B33 8TH').outward, 'B33');
  assert.equal(parsePostcode('nonsense'), null);
  assert.equal(parsePostcode(''), null);
});

test('orientation factor: south beats east beats north, and bounds hold', () => {
  const s = orientationFactor(180, 35);
  const e = orientationFactor(90, 35);
  const w = orientationFactor(270, 35);
  const n = orientationFactor(0, 35);
  assert.ok(s > 0.98 && s <= 1);
  assert.ok(s > e && e > n);
  assert.ok(Math.abs(e - w) < 1e-9, 'east and west are symmetric');
  for (const az of [0, 45, 90, 135, 180, 225, 270, 315, 360]) {
    for (const tilt of [0, 10, 25, 35, 50, 70, 90]) {
      const f = orientationFactor(az, tilt);
      assert.ok(f > 0.2 && f <= 1, `${az}/${tilt} -> ${f}`);
    }
  }
  assert.equal(compassName(180), 'South');
  assert.equal(compassName(225), 'South-west');
  assert.equal(compassName(359), 'North');
});

test('a typical London semi gives plausible generation, savings and payback', () => {
  const r = run({ occupancy: 'partial', panels: 9 });
  assert.ok(r.system.annualGen > 3600 && r.system.annualGen < 4200, `gen ${r.system.annualGen}`);
  assert.ok(r.flows.selfUseShare > 0.25 && r.flows.selfUseShare < 0.5, `self use ${r.flows.selfUseShare}`);
  assert.ok(r.money.saving > 450 && r.money.saving < 800, `saving ${r.money.saving}`);
  assert.ok(r.payback > 6 && r.payback < 14, `payback ${r.payback}`);
  assert.ok(r.money.low < r.money.saving && r.money.saving < r.money.high);
});

test('energy balances: generated = used on site + exported; demand = solar + imported', () => {
  for (const battery of [0, 5, 10]) {
    const r = run({ battery, panels: 10 });
    const f = r.flows;
    // battery round-trip losses mean generated >= direct + battery output + exported
    assert.ok(f.generated + 1e-6 >= f.direct + f.fromBattery + f.exported - 1, `gen balance, battery ${battery}`);
    assert.ok(Math.abs(r.demand.total - (f.direct + f.fromBattery + f.imported)) < 1, `demand balance, battery ${battery}`);
  }
});

test('more panels generate more; a battery raises self-use; a worse roof earns less', () => {
  assert.ok(run({ panels: 12 }).system.annualGen > run({ panels: 6 }).system.annualGen);
  assert.ok(run({ battery: 5 }).flows.selfUseShare > run({ battery: 0 }).flows.selfUseShare + 0.1);
  const south = run({ panels: 10 });
  const north = run({ panels: 10, roofs: [{ azimuth: 0, tilt: 35, space: 'medium' }] });
  assert.ok(north.money.saving < south.money.saving * 0.75);
  assert.ok(run({ shading: 'heavy', panels: 10 }).system.annualGen < south.system.annualGen * 0.7);
});

test('people at home all day use more of their own solar than people who are out', () => {
  const away = run({ occupancy: 'away', panels: 10 }).flows.selfUseShare;
  const home = run({ occupancy: 'home', panels: 10 }).flows.selfUseShare;
  assert.ok(home > away);
});

test('east-west split self-consumes better than the same panels facing south only', () => {
  const ew = run({
    panels: 10,
    roofs: [
      { azimuth: 90, tilt: 35, space: 'medium' },
      { azimuth: 270, tilt: 35, space: 'medium' },
    ],
  });
  assert.equal(ew.system.panels, 10);
  assert.equal(ew.system.faces[0].panels + ew.system.faces[1].panels, 10);
  const south = run({ panels: 10 });
  assert.ok(ew.flows.selfUseShare > south.flows.selfUseShare);
});

test('region matters: Scotland yields less than the South West', () => {
  assert.ok(run({ region: 'scot', panels: 10 }).system.annualGen < run({ region: 'sw', panels: 10 }).system.annualGen * 0.85);
});

test('usage inputs: kWh and bill modes drive demand; planned EV adds on top', () => {
  assert.equal(Math.round(run({ usageMode: 'kwh', usageKwh: 5000 }).demand.total), 5000);
  const bill = run({ usageMode: 'bill', billPerMonth: 100 });
  assert.ok(bill.demand.total > 3200 && bill.demand.total < 4200, `bill demand ${bill.demand.total}`);
  const base = run({ usageMode: 'kwh', usageKwh: 4000 }).demand.total;
  assert.ok(run({ usageMode: 'kwh', usageKwh: 4000, ev: 'plan' }).demand.total > base + 2000);
  assert.equal(Math.round(run({ usageMode: 'kwh', usageKwh: 4000, ev: 'have' }).demand.total), 4000);
});

test('scenarios: three options, costs ascend, projection is 26 points and ends at net25', () => {
  const r = run({ panels: 10 });
  assert.equal(r.scenarios.length, 3);
  assert.ok(r.scenarios[0].cost.total < r.scenarios[1].cost.total && r.scenarios[1].cost.total < r.scenarios[2].cost.total);
  assert.equal(r.projection.length, 26);
  assert.equal(r.projection[0].cumulative, -r.cost.used);
  assert.ok(Math.abs(r.projection[25].cumulative - r.net25) < 1e-6);
});

test('recommended panels respects roof capacity and the 6-panel floor', () => {
  const small = run({ roofs: [{ azimuth: 180, tilt: 35, space: 'small' }] });
  assert.ok(small.system.panels <= 6);
  const big = recommendPanels({ ...defaultInput(), region: 'london', roofs: [{ azimuth: 180, tilt: 35, space: 'xlarge' }], usageMode: 'kwh', usageKwh: 8000 });
  assert.ok(big > 6 && big <= 20);
  const r = run({ panels: 999 });
  assert.equal(r.system.panels, r.system.maxPanels);
});

test('quote override changes payback and the quote judge responds', () => {
  const r = run({ panels: 10 });
  const dear = run({ panels: 10, quoteCost: r.cost.total * 1.4 });
  assert.ok(dear.payback > r.payback);
  assert.equal(judgeQuote(dear).verdict, 'well above');
  assert.equal(judgeQuote(run({ panels: 10, quoteCost: r.cost.total })).verdict, 'in line with');
  assert.equal(judgeQuote(r), null);
});

test('a hopeless roof can fail to pay back within 25 years rather than crash', () => {
  const r = run({ shading: 'heavy', roofs: [{ azimuth: 0, tilt: 60, space: 'small' }], importRate: 15, exportRate: 0 });
  assert.ok(r.payback === null || r.payback > 15);
  assert.ok(Number.isFinite(r.net25));
});
