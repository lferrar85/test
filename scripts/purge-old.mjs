// Deletes submissions older than N months (default 12), matching the privacy notice.
// Run it on a schedule, e.g. daily:   0 3 * * *  cd /app && node scripts/purge-old.mjs
import { openDb } from '../lib/db.js';

const months = Number(process.argv[2] || process.env.RETENTION_MONTHS || 12);
const db = openDb();
const n = db.purgeOlderThan(months);
console.log(`Deleted ${n} submission(s) older than ${months} months.`);
db.close();
