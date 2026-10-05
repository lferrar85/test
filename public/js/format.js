// Number formatting shared by server-rendered pages and the browser.
const nf = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 });

export const num = (n) => nf.format(Math.round(n));
export const gbp = (n) => (n < 0 ? '−£' : '£') + nf.format(Math.abs(Math.round(n)));
export const gbpRound = (n, step = 10) => gbp(Math.round(n / step) * step);
export const kwh = (n) => `${num(n)} kWh`;
export const pct = (n) => `${Math.round(n * 100)}%`;
export const years = (n) => (n == null ? 'Over 25 years' : `${(Math.round(n * 10) / 10).toString()} years`);
export const kwp = (n) => `${(Math.round(n * 10) / 10).toFixed(1)} kWp`;
export const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
