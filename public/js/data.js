// Shared constants for the solar model. Runs in the browser AND in Node (tests, server).
//
// IMPORTANT: every number in here is a modelling assumption. They are typical-UK
// placeholders, shown to the visitor on /methodology and in the results page, and
// must be reviewed (ideally against PVGIS, MCS and current Ofgem / SEG figures)
// before launch and then every quarter. See README "Keeping the numbers honest".

export const ASSUMPTIONS = {
  reviewed: 'October 2026 (placeholder values, verify before launch)',

  // Hardware
  panelWatt: 440,          // W per panel (typical modern module)
  panelAreaM2: 1.95,       // m² per panel
  systemLife: 25,          // years modelled
  degradation: 0.005,      // output lost per year

  // Prices, pence per kWh
  importRate: 27,          // typical price-cap-level unit rate; the visitor can change it
  exportRate: 8,           // typical Smart Export Guarantee rate; best tariffs pay more
  priceInflation: 0.025,   // yearly rise in the electricity price you avoid buying

  // Installed cost (£, 0% VAT assumed)
  costFixed: 2200,         // scaffolding, inverter, labour, commissioning
  costPerKwp: 1000,
  battFixed: 700,
  battPerKwh: 500,
  inverterYear: 12,        // inverter replacement modelled in this year
  inverterCost: 900,

  // Battery
  batteryUsableShare: 0.9, // share of nominal capacity you can actually use
  batteryRoundTrip: 0.9,
  batteryLife: 15,         // years of battery benefit modelled; no replacement assumed
  batteryOptions: [0, 5, 10],

  // Sizing rule: add panels while the last panel still pays back within this many years
  marginalPaybackYears: 12,

  // Carbon
  gridCo2KgPerKwh: 0.15,   // approximate average grid intensity

  // Uncertainty shown as a range around the central estimate
  rangeLow: 0.9,
  rangeHigh: 1.1,
};

// kWh generated per year per kWp for a south-facing, ~35° roof with no shading, after
// system losses. Regional PLACEHOLDERS in line with typical published UK ranges:
// calibrate against PVGIS / MCS irradiance data before launch (see README).
export const REGIONS = {
  london: { name: 'London', yield: 980 },
  se: { name: 'South East England', yield: 1000 },
  sw: { name: 'South West England', yield: 1040 },
  east: { name: 'East of England', yield: 980 },
  emids: { name: 'East Midlands', yield: 940 },
  wmids: { name: 'West Midlands', yield: 930 },
  yorks: { name: 'Yorkshire and the Humber', yield: 900 },
  nw: { name: 'North West England', yield: 880 },
  ne: { name: 'North East England', yield: 860 },
  wales: { name: 'Wales', yield: 920 },
  scot: { name: 'Scotland', yield: 830 },
  ni: { name: 'Northern Ireland', yield: 860 },
  uk: { name: 'the UK', yield: 940 },
};

const AREAS_BY_REGION = {
  london: 'E EC N NW SE SW W WC EN HA IG RM UB TW KT SM CR BR DA',
  se: 'BN CT GU HP ME MK OX PO RG RH SL SO TN',
  sw: 'BA BH BS DT EX GL PL SN SP TA TQ TR',
  east: 'AL CB CM CO IP LU NR PE SG SS WD',
  emids: 'DE LE LN NG NN',
  wmids: 'B CV DY HR ST TF WR WS WV',
  yorks: 'BD DN HD HG HU HX LS S WF YO',
  nw: 'BB BL CA CH CW FY L LA M OL PR SK WA WN',
  ne: 'DH DL NE SR TS',
  wales: 'CF LD LL NP SA SY',
  scot: 'AB DD DG EH FK G HS IV KA KW KY ML PA PH TD ZE',
  ni: 'BT',
};

export const POSTCODE_AREAS = {};
for (const [region, list] of Object.entries(AREAS_BY_REGION)) {
  for (const area of list.split(' ')) POSTCODE_AREAS[area] = region;
}

// Orientation x tilt factor: share of the "best possible" yield (south, ~30-40°).
// Rows: tilt in degrees. Columns: degrees away from due south (0, 45, 90, 135, 180).
export const ORIENT_TILTS = [0, 15, 30, 45, 60, 90];
export const ORIENT_OFFSETS = [0, 45, 90, 135, 180];
export const ORIENT_TABLE = [
  [88, 88, 88, 88, 88],
  [96, 94, 90, 84, 80],
  [100, 96, 85, 70, 63],
  [99, 93, 78, 60, 49],
  [92, 86, 71, 50, 40],
  [69, 62, 54, 38, 28],
];

export const SHADING = {
  none: { label: 'Clear', factor: 1.0, hint: 'Nothing blocks the roof' },
  light: { label: 'A little', factor: 0.93, hint: 'A chimney, or a tree for part of the day' },
  moderate: { label: 'Quite a lot', factor: 0.82, hint: 'Trees or buildings shade it for hours' },
  heavy: { label: 'Heavy', factor: 0.65, hint: 'In shade for much of the day' },
};

export const ROOF_SPACE = {
  small: { label: 'Small', panels: 6, hint: 'Fits about 6 panels' },
  medium: { label: 'Medium', panels: 10, hint: 'Fits about 10 panels' },
  large: { label: 'Large', panels: 14, hint: 'Fits about 14 panels' },
  xlarge: { label: 'Very large', panels: 20, hint: 'Fits about 20 panels' },
};

// Share of annual generation by month (Jan..Dec), normalised in the model.
export const MONTH_SHARE = [2.9, 5.0, 8.5, 11.1, 13.2, 13.6, 13.4, 11.6, 9.1, 5.9, 3.2, 2.0];
export const MONTH_DAYS = [31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// Daylight hours at ~53°N and approximate solar noon on the clock (BST Apr-Oct).
export const DAY_LENGTH = [8.0, 9.9, 11.9, 14.0, 16.0, 17.0, 16.4, 14.7, 12.6, 10.5, 8.6, 7.6];
export const SOLAR_NOON = [12.2, 12.2, 12.2, 13.2, 13.2, 13.2, 13.2, 13.2, 13.2, 13.2, 12.2, 12.2];

// Clear/dull day mix: clear days make 1.45x the average and happen 40% of the time.
export const DAY_MIX = [
  { weight: 0.4, factor: 1.45 },
  { weight: 0.6, factor: (1 - 0.4 * 1.45) / 0.6 },
];

// Seasonal weights for demand (Jan..Dec).
export const BASE_SEASON = [1.18, 1.1, 1.05, 0.95, 0.9, 0.85, 0.85, 0.86, 0.92, 1.0, 1.1, 1.2];
export const HEAT_SEASON = [0.19, 0.16, 0.12, 0.07, 0.03, 0.01, 0.01, 0.01, 0.03, 0.08, 0.13, 0.16];
export const ELEC_SEASON = [0.17, 0.14, 0.11, 0.07, 0.04, 0.02, 0.02, 0.02, 0.04, 0.08, 0.13, 0.16];

// Hour-of-day demand shapes (hours 0..23); normalised in the model.
export const OCCUPANCY = {
  away: {
    label: 'Out most of the day',
    hint: 'Everyone at work or school, back by 5–6pm',
    shape: [0.45, 0.4, 0.38, 0.38, 0.4, 0.5, 1.0, 1.7, 1.5, 0.75, 0.6, 0.6, 0.65, 0.65, 0.65, 0.75, 1.2, 1.9, 2.3, 2.2, 2.0, 1.6, 1.1, 0.7],
  },
  partial: {
    label: 'Someone around some days',
    hint: 'Part-time, shifts, or working from home now and then',
    shape: [0.45, 0.4, 0.38, 0.38, 0.4, 0.5, 0.9, 1.5, 1.5, 1.1, 1.0, 1.0, 1.15, 1.05, 1.0, 1.05, 1.3, 1.8, 2.1, 2.0, 1.8, 1.5, 1.0, 0.65],
  },
  home: {
    label: 'Home most of the day',
    hint: 'Retired, working from home, or young children',
    shape: [0.4, 0.38, 0.36, 0.36, 0.38, 0.45, 0.8, 1.4, 1.6, 1.4, 1.3, 1.35, 1.55, 1.45, 1.35, 1.35, 1.5, 1.9, 2.2, 2.0, 1.8, 1.5, 1.0, 0.6],
  },
};
export const HEAT_PUMP_SHAPE = [0.9, 0.9, 0.9, 0.9, 1.0, 1.4, 1.5, 1.3, 1.0, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 1.0, 1.3, 1.5, 1.5, 1.4, 1.2, 1.1, 1.0, 0.9];
export const ELEC_HEAT_SHAPE = [1.6, 1.6, 1.6, 1.6, 1.5, 1.4, 1.0, 0.5, 0.3, 0.2, 0.2, 0.2, 0.2, 0.2, 0.3, 0.4, 0.8, 1.3, 1.5, 1.4, 1.1, 0.8, 0.8, 1.2];
// Share of EV charging done in the daytime (10:00-16:00) by occupancy; the rest overnight.
export const EV_DAYTIME_SHARE = { away: 0.1, partial: 0.2, home: 0.35 };

export const EV_KWH_PER_YEAR = 2600;

// Home-use estimates when the visitor doesn't know their usage.
export function estimateBaseUsage(bedrooms, occupants) {
  return Math.round(1300 + 450 * occupants + 150 * bedrooms);
}
export const heatPumpKwh = (bedrooms) => 1500 + 500 * bedrooms;
export const electricHeatKwh = (bedrooms) => 3000 + 900 * bedrooms;

// Standing charge isn't modelled (it doesn't change with solar). Typical figure only
// used to turn a monthly bill (£) into kWh when the visitor knows their bill.
export const STANDING_CHARGE_P_PER_DAY = 50;
