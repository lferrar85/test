// The itemised "before and after" statement. Used on the home page (example) and in results.
import { gbp, kwh, pct, esc } from './format.js';

export function ledgerHtml(r, { caption = 'Your electricity bill, before and after solar' } = {}) {
  const f = r.flows;
  const m = r.money;
  const used = f.direct + f.fromBattery;
  const row = (label, qty, money, cls = '', sub = '') =>
    `<tr class="ledger-row ${cls}"><th scope="row"><span class="ledger-label">${label}</span>${sub ? `<span class="ledger-sub">${sub}</span>` : ''}</th><td class="ledger-qty">${qty}</td><td class="ledger-money">${money}</td></tr>`;
  return `<div class="ledger-wrap"><table class="ledger">
<caption class="visually-hidden">${esc(caption)}</caption>
<thead><tr><th scope="col" class="visually-hidden">Item</th><th scope="col" class="ledger-colhead">Energy</th><th scope="col" class="ledger-colhead">Per year</th></tr></thead>
<tbody>
${row('Electricity your home uses', kwh(r.demand.total), gbp(m.billBefore), 'ledger-head', 'What you’d pay now at your unit rate')}
${row('Solar your roof makes', kwh(f.generated), '', 'ledger-sun')}
${row('Used in your home', kwh(used), '', 'ledger-indent', `${pct(f.selfUseShare)} of what you make${r.input.battery ? ', including battery' : ''}`)}
${row('Sent to the grid', kwh(f.exported), '', 'ledger-indent')}
${row('Electricity you still buy', kwh(f.imported), gbp(m.billAfter), 'ledger-head', `${pct(f.solarCover)} of your home’s electricity now comes from solar`)}
${row('Bill you no longer pay', '', gbp(m.avoided), 'ledger-plus')}
${row('Paid to you for exports', kwh(f.exported), `+ ${gbp(m.exportIncome)}`, 'ledger-plus', `At ${r.input.exportRate}p per kWh (Smart Export Guarantee)`)}
${row('Saving in year one', '', gbp(m.saving), 'ledger-total')}
</tbody></table></div>`;
}
