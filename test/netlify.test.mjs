import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import handler from '../netlify/functions/api.mjs';

test('netlify function validates, matches and forwards to the webhook', async () => {
  const got = [];
  const hook = http.createServer((req, res) => { let b = ''; req.on('data', (c) => (b += c)); req.on('end', () => { got.push(JSON.parse(b)); res.end('ok'); }); });
  await new Promise((r) => hook.listen(0, '127.0.0.1', r));
  process.env.WEBHOOK_URL = `http://127.0.0.1:${hook.address().port}/`;
  const post = (path, body) => handler(new Request(`https://x.test${path}`, { method: 'POST', body: JSON.stringify(body) }));
  const good = { name: 'A B', email: 'a@b.co', phone: '07700 900123', postcode: 'LS1 4AP', consent: true, consentText: 'I agree' };

  const ok = await post('/api/quote', good);
  assert.equal(ok.status, 201);
  assert.equal(got.length, 1);
  assert.equal(got[0].data.region, 'yorks');
  assert.deepEqual(got[0].matched, ['kestrel-solar-works']);
  assert.equal((await post('/api/quote', { ...good, consent: false })).status, 422);
  assert.equal((await post('/api/quote', { ...good, hp_url: 'spam' })).status, 201);
  assert.equal(got.length, 1, 'bots are not forwarded');
  assert.equal((await handler(new Request('https://x.test/api/match?region=london'))).status, 200);
  delete process.env.WEBHOOK_URL;
  assert.equal((await post('/api/quote', good)).status, 503, 'no webhook configured must not silently drop leads');
  hook.close();
});
