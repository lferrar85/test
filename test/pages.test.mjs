import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPage, listRoutes } from '../lib/routes.js';

test('no page leaks NaN, undefined or [object Object] into its markup', () => {
  for (const route of [...listRoutes(), '/no-such-page']) {
    for (const mode of ['server', 'static']) {
      const { html } = renderPage(route, { mode });
      // site-config JSON legitimately contains null, never these
      const visible = html.replace(/<script[\s\S]*?<\/script>/g, '');
      for (const bad of ['NaN', 'undefined', '[object Object]', '$' + '{']) {
        assert.ok(!visible.includes(bad), `${route} (${mode}) contains "${bad}"`);
      }
    }
  }
});

test('home page comparison shows sensible, ordered numbers', () => {
  const { html } = renderPage('/');
  const nets = [...html.matchAll(/<p class="compare-big">£([\d,]+)</g)].map((m) => Number(m[1].replace(/,/g, '')));
  assert.equal(nets.length, 3);
  assert.ok(nets[0] > nets[1] && nets[1] > nets[2] && nets[2] >= 0, `net costs should fall: ${nets}`);
});
