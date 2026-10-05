// Tiny SQLite store (Node's built-in node:sqlite). One table for every kind of submission.
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

export function openDb(file = process.env.DB_FILE || path.join(process.cwd(), 'data', 'roofworth.sqlite')) {
  if (file !== ':memory:') mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ref TEXT NOT NULL UNIQUE,
      kind TEXT NOT NULL,
      created_at TEXT NOT NULL,
      name TEXT, email TEXT, phone TEXT, postcode TEXT, region TEXT,
      data TEXT NOT NULL,
      matched TEXT,
      consent_version TEXT, consent_text TEXT, consent_at TEXT,
      status TEXT NOT NULL DEFAULT 'new'
    );
    CREATE INDEX IF NOT EXISTS idx_sub_kind ON submissions(kind, created_at);
  `);

  const insert = db.prepare(`INSERT INTO submissions
    (ref, kind, created_at, name, email, phone, postcode, region, data, matched, consent_version, consent_text, consent_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const list = db.prepare(`SELECT * FROM submissions WHERE (? = '' OR kind = ?) ORDER BY id DESC LIMIT ?`);
  const byRef = db.prepare(`SELECT * FROM submissions WHERE ref = ?`);
  const setStatus = db.prepare(`UPDATE submissions SET status = ? WHERE ref = ?`);
  const del = db.prepare(`DELETE FROM submissions WHERE ref = ?`);
  const matchedRows = db.prepare(`SELECT matched FROM submissions WHERE matched IS NOT NULL AND kind IN ('quote','battery')`);

  const purge = db.prepare(`DELETE FROM submissions WHERE created_at < ?`);
  const newRef = () => `RW-${randomBytes(4).toString('hex').toUpperCase()}`;

  return {
    save({ kind, name, email, phone, postcode, region, data, matched, consentVersion, consentText }) {
      const ref = newRef();
      const now = new Date().toISOString();
      insert.run(ref, kind, now, name || null, email || null, phone || null, postcode || null, region || null, JSON.stringify(data), matched ? JSON.stringify(matched) : null,
        consentVersion || null, consentText || null, consentVersion ? now : null);
      return ref;
    },
    list: (kind = '', limit = 500) => list.all(kind, kind, limit).map(parseRow),
    get: (ref) => (byRef.get(ref) ? parseRow(byRef.get(ref)) : null),
    setStatus: (ref, status) => setStatus.run(status, ref).changes > 0,
    remove: (ref) => del.run(ref).changes > 0,
    // How many introductions each installer has had, so we can share leads fairly.
    installerLoad() {
      const load = {};
      for (const { matched } of matchedRows.all()) for (const slug of JSON.parse(matched)) load[slug] = (load[slug] || 0) + 1;
      return load;
    },
    // Delete everything older than `months` (the privacy notice promises 12).
    purgeOlderThan(months, now = new Date()) {
      const cutoff = new Date(now);
      cutoff.setMonth(cutoff.getMonth() - months);
      return Number(purge.run(cutoff.toISOString()).changes);
    },
    close: () => db.close(),
  };
}

function parseRow(r) {
  return { ...r, data: JSON.parse(r.data), matched: r.matched ? JSON.parse(r.matched) : [] };
}
