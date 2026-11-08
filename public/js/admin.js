// Admin list. Submitted text is untrusted: everything goes in with textContent, never innerHTML.
const rows = document.querySelector('[data-rows]');
const count = document.querySelector('[data-count]');
const csv = document.querySelector('[data-csv]');
let kind = '';
const STATUSES = { installer: ['new', 'review', 'approved', 'rejected'], default: ['new', 'contacted', 'closed'] };
const STATUS_LABEL = { new: 'New', review: 'Under review', approved: 'Approved', rejected: 'Rejected', contacted: 'Contacted', closed: 'Closed' };
const SERVICE_LABEL = { solar: 'Solar PV', battery: 'Battery storage', ev: 'EV charging', heatpump: 'Heat pumps' };
const filters = document.querySelector('[data-filters]');
const pendingOnly = document.querySelector('[data-pending]');

const cell = (tr, text, cls) => {
  const td = tr.insertCell();
  td.textContent = text ?? '';
  if (cls) td.className = cls;
  return td;
};

function detail(s) {
  const d = s.data || {};
  if (s.kind === 'contact') return `${d.topic || ''}: ${d.message || ''}`;
  if (s.kind === 'installer') {
    return [
      d.company, d.website, d.company_number ? `Co. no. ${d.company_number}` : '',
      `Areas: ${d.areas || '?'}`, `Services: ${(d.services || []).map((x) => SERVICE_LABEL[x] || x).join(', ') || '?'}`,
      `MCS: ${d.mcs_status || '?'}${d.mcs_number ? ` (${d.mcs_number})` : ''}`, d.trustmark ? `TrustMark: ${d.trustmark}${d.trustmark_number ? ` (${d.trustmark_number})` : ''}` : '',
      d.accreditations ? `Also: ${d.accreditations}` : '', d.years_trading ? `${d.years_trading} yrs trading` : '', d.capacity ? `${d.capacity} installs/month` : '',
      d.marketing ? 'Marketing: yes' : 'Marketing: no', d.notes ? `“${d.notes}”` : '',
    ].filter(Boolean).join(' · ');
  }
  const c = d.calc;
  const parts = [];
  if (c) parts.push(`${c.kWp ?? '?'} kWp`, `saves £${c.saving ?? '?'}/yr`, c.payback ? `payback ${c.payback}y` : '', c.property || '', c.roofCovering ? `${c.roofCovering} roof` : '', c.homeAge ? `home ${c.homeAge}` : '', c.ownership || '');
  if (s.kind === 'battery') parts.push(`solar: ${d.existing_solar || '?'}`, d.system_kwp ? `${d.system_kwp} kWp` : '', d.goal || '');
  if (d.notes) parts.push(`“${d.notes}”`);
  return parts.filter(Boolean).join(' · ');
}

async function load() {
  count.textContent = 'Loading…';
  const res = await fetch(`/api/admin/submissions?kind=${kind}`);
  if (!res.ok) { count.textContent = 'Could not load submissions.'; return; }
  let { submissions } = await res.json();
  if (kind === 'installer' && pendingOnly.checked) submissions = submissions.filter((s) => s.status === 'new' || s.status === 'review');
  count.textContent = `${submissions.length} submission${submissions.length === 1 ? '' : 's'}`;
  rows.replaceChildren();
  for (const s of submissions) {
    const tr = rows.insertRow();
    cell(tr, s.ref, 'mono');
    cell(tr, s.kind);
    cell(tr, new Date(s.created_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }));
    cell(tr, [s.name, s.email, s.phone].filter(Boolean).join('\n'), 'pre');
    cell(tr, [s.postcode, s.region].filter(Boolean).join(' · '));
    cell(tr, detail(s), 'wide');
    cell(tr, (s.matched || []).join(', '));
    const st = tr.insertCell();
    const sel = document.createElement('select');
    sel.setAttribute('aria-label', `Status for ${s.ref}`);
    for (const v of STATUSES[s.kind] || STATUSES.default) sel.add(new Option(STATUS_LABEL[v] || v, v, false, v === s.status));
    sel.addEventListener('change', async () => {
      await fetch(`/api/admin/submissions/${s.ref}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: sel.value }) });
    });
    st.append(sel);
    const notesTd = tr.insertCell();
    const notes = document.createElement('textarea');
    notes.rows = 2; notes.className = 'admin-notes'; notes.placeholder = 'Private notes, checks made, agreed terms';
    notes.setAttribute('aria-label', `Private notes for ${s.ref}`);
    notes.value = s.notes || '';
    notes.addEventListener('change', async () => {
      await fetch(`/api/admin/submissions/${s.ref}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ notes: notes.value }) });
    });
    notesTd.append(notes);
    const act = tr.insertCell();
    if (s.kind === 'installer') {
      const copy = document.createElement('button');
      copy.type = 'button'; copy.className = 'link'; copy.textContent = 'Copy listing JSON';
      copy.title = 'A data/installers.json entry built from this application. Fill in regions and check every field before publishing.';
      copy.addEventListener('click', async () => {
        const d = s.data || {};
        const slug = String(d.company || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const listing = { slug, name: d.company || '', tagline: '', regions: [], services: d.services || [], accreditations: [d.mcs_status === 'certified' ? 'MCS' : '', d.trustmark === 'yes' ? 'TrustMark' : ''].filter(Boolean), website: d.website || '' };
        try { await navigator.clipboard.writeText(JSON.stringify(listing, null, 2)); copy.textContent = 'Copied'; setTimeout(() => { copy.textContent = 'Copy listing JSON'; }, 1500); } catch { prompt('Listing JSON', JSON.stringify(listing)); }
      });
      act.append(copy, document.createTextNode(' '));
    }
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'link';
    del.textContent = 'Delete';
    del.addEventListener('click', async () => {
      if (!confirm(`Permanently delete ${s.ref}? This can’t be undone.`)) return;
      await fetch(`/api/admin/submissions/${s.ref}`, { method: 'DELETE' });
      pendingOnly.addEventListener('change', load);
load();
    });
    act.append(del);
  }
}

for (const b of document.querySelectorAll('[data-tabs] button')) {
  b.addEventListener('click', () => {
    kind = b.dataset.kind;
    document.querySelectorAll('[data-tabs] button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    csv.href = `/api/admin/export.csv?kind=${kind}`;
    filters.hidden = kind !== 'installer';
    pendingOnly.addEventListener('change', load);
load();
  });
}
pendingOnly.addEventListener('change', load);
load();
