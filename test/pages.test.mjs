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

test('installer onboarding: join page renders, is linked from the footer and installers page, and shows no commercial terms', () => {
  const join = renderPage('/installers/join');
  assert.equal(join.status, 200);
  for (const must of ['Join the GoSolarCompare', 'Installer Network', 'name="company"', 'name="services"', 'name="mcs_status"', 'name="marketing"', 'data-copy=', 'Thank you for applying to join']) {
    assert.ok(join.html.includes(must), `join page should include ${must}`);
  }
  for (const page of ['/', '/installers', '/for-installers']) assert.ok(renderPage(page).html.includes('installers/join'), `${page} links to the join page`);
  for (const page of ['/', '/for-installers', '/about', '/how-it-works']) {
    const html = renderPage(page).html.toLowerCase();
    for (const banned of [/rate card/, /per lead/, /\bcommissions?\b/, /sell(ing)? (customer )?leads/, /lead prices?/]) assert.ok(!banned.test(html), `${page} should not match ${banned}`);
    assert.ok(!html.includes('along the way'), `${page} should not contain the removed phrase`);
  }
  assert.ok(renderPage('/').html.includes('How we’re funded'), 'the funding disclosure stays in the footer');
});
