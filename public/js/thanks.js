// Thank-you page: show who has the visitor's details (from this browser session only).
import { loadLast, siteConfig } from './state.js';
import { esc } from './format.js';
import { initials } from './icons.js';

const last = loadLast();
const cfg = siteConfig();
if (last && last.ref) {
  const refBox = document.querySelector('[data-thanks-ref]');
  refBox.hidden = false;
  refBox.innerHTML = `<p class="eyebrow">Your reference</p><p class="ref">${esc(last.ref)}</p><p class="fine">Quote this if you contact us.</p>`;
  const grid = document.querySelector('[data-thanks-installers]');
  const list = last.matched || [];
  if (list.length) {
    grid.innerHTML = list
      .map((i) => `<article class="installer-card"><div class="installer-top"><span class="avatar" aria-hidden="true">${esc(initials(i.name))}</span><div><h3>${i.href ? `<a href="${esc(i.href)}">${esc(i.name)}</a>` : esc(i.name)}</h3>${i.demo ? '<p class="sample-flag">Sample listing</p>' : ''}</div></div>${i.tagline ? `<p class="installer-tagline">${esc(i.tagline)}</p>` : ''}</article>`)
      .join('');
  } else if (last.kind === 'contact' || last.kind === 'installer') {
    grid.innerHTML = '<p>Your message is with our team. We’ll reply by email.</p>';
  } else {
    grid.innerHTML = '<p>We don’t have an installer covering that area yet. We’ve kept your request and will be in touch if that changes.</p>';
  }
  if (last.demo) document.querySelector('[data-thanks-demo]').hidden = false;
  if (last.kind === 'contact') {
    document.querySelector('[data-thanks-title]').innerHTML = 'Message <span class="mark">received.</span>';
    document.querySelector('[data-thanks-lede]').textContent = 'Thanks for getting in touch. A person will reply by email.';
  } else if (last.kind === 'installer') {
    document.querySelector('[data-thanks-title]').innerHTML = 'Application <span class="mark">received.</span>';
    document.querySelector('[data-thanks-lede]').textContent = 'Thanks for applying. We’ll review it and email you.';
  }
}
