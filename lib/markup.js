// Tiny safe renderer for the content/*.js files (guides, legal, FAQ).
// Text supports **bold** and [[/internal-path|label]] / [[https://external|label]] links.

export const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const slugify = (s) =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export function inline(text, ctx) {
  let out = esc(text);
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, (_, target, label) => {
    const t = target.replace(/&amp;/g, '&');
    if (/^https?:\/\//.test(t)) {
      return `<a href="${esc(t)}" rel="noopener noreferrer" target="_blank">${label}</a>`;
    }
    return `<a href="${esc(ctx.href(t))}">${label}</a>`;
  });
  return out;
}

export function blocks(list, ctx) {
  return list
    .map((b) => {
      switch (b.t) {
        case 'p':
          return `<p>${inline(b.x, ctx)}</p>`;
        case 'h2':
          return `<h2 id="${slugify(b.x)}">${inline(b.x, ctx)}</h2>`;
        case 'h3':
          return `<h3 id="${slugify(b.x)}">${inline(b.x, ctx)}</h3>`;
        case 'ul':
          return `<ul>${b.items.map((i) => `<li>${inline(i, ctx)}</li>`).join('')}</ul>`;
        case 'ol':
          return `<ol>${b.items.map((i) => `<li>${inline(i, ctx)}</li>`).join('')}</ol>`;
        case 'note':
          return `<aside class="note"><p>${inline(b.x, ctx)}</p></aside>`;
        case 'table':
          return `<div class="table-wrap"><table><thead><tr>${b.head.map((h) => `<th scope="col">${inline(h, ctx)}</th>`).join('')}</tr></thead><tbody>${b.rows
            .map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${inline(c, ctx)}</th>` : `<td>${inline(c, ctx)}</td>`)).join('')}</tr>`)
            .join('')}</tbody></table></div>`;
        default:
          throw new Error(`Unknown block type: ${b.t}`);
      }
    })
    .join('\n');
}

export function toc(list) {
  const items = list.filter((b) => b.t === 'h2');
  if (items.length < 3) return '';
  return `<nav class="toc" aria-label="On this page"><p class="eyebrow">On this page</p><ol>${items
    .map((b) => `<li><a href="#${slugify(b.x)}">${esc(b.x.replace(/\*\*/g, ''))}</a></li>`)
    .join('')}</ol></nav>`;
}
