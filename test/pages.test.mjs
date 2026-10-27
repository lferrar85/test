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

test('home page shows the example bill dropping and real savings in the path cards', () => {
  const { html } = renderPage('/');
  const m = /data-drop data-from="(\d+)" data-to="(\d+)"/.exec(html);
  assert.ok(m, 'drop section present');
  assert.ok(Number(m[1]) > Number(m[2]) && Number(m[2]) >= 0, `bill should fall: ${m[1]} -> ${m[2]}`);
  const savings = [...html.matchAll(/<strong>£([\d,]+) a year<\/strong>/g)].map((x) => Number(x[1].replace(/,/g, '')));
  assert.equal(savings.length, 2);
  assert.ok(savings[1] > savings[0], 'solar + battery should save more than solar alone');
  assert.ok(/trees funded so far/.test(html), 'planet section present');
});
