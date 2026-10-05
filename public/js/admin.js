// Admin list. Submitted text is untrusted: everything goes in with textContent, never innerHTML.
const rows = document.querySelector('[data-rows]');
const count = document.querySelector('[data-count]');
const csv = document.querySelector('[data-csv]');
let kind = '';

const cell = (tr, text, cls) => {
  const td = tr.insertCell();
  td.textContent = text ?? '';
  if (cls) td.className = cls;
  return td;
};

function detail(s) {
  const d = s.data || {};
  if (s.kind === 'contact') return `${d.topic || ''}: ${d.message || ''}`;
  if (s.kind === 'installer') return `${d.company || ''}, MCS ${d.mcs_number || '?'}, areas ${d.areas || '?'}`;
  const c = d.calc;
  const parts = [];
  if (c) parts.push(`${c.kWp ?? '?'} kWp`, `saves £${c.saving ?? '?'}/yr`, c.payback ? `payback ${c.payback}y` : '');
  if (s.kind === 'battery') parts.push(`solar: ${d.existing_solar || '?'}`, d.system_kwp ? `${d.system_kwp} kWp` : '', d.goal || '');
  if (d.notes) parts.push(`“${d.notes}”`);
  return parts.filter(Boolean).join(' · ');
}

async function load() {
  count.textContent = 'Loading…';
  const res = await fetch(`/api/admin/submissions?kind=${kind}`);
  if (!res.ok) { count.textContent = 'Could not load submissions.'; return; }
  const { submissions } = await res.json();
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
    for (const v of ['new', 'contacted', 'closed']) sel.add(new Option(v, v, false, v === s.status));
    sel.addEventListener('change', async () => {
      await fetch(`/api/admin/submissions/${s.ref}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: sel.value }) });
    });
    st.append(sel);
    const act = tr.insertCell();
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'link';
    del.textContent = 'Delete';
    del.addEventListener('click', async () => {
      if (!confirm(`Permanently delete ${s.ref}? This can’t be undone.`)) return;
      await fetch(`/api/admin/submissions/${s.ref}`, { method: 'DELETE' });
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
    load();
  });
}
load();
