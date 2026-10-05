// Snapshot the lead database:  node scripts/backup.mjs [folder]   (default ./backups)
// Run it on a schedule and copy the folder somewhere off the server.
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { openDb } from '../lib/db.js';

const dir = path.resolve(process.argv[2] || 'backups');
mkdirSync(dir, { recursive: true });
const file = path.join(dir, `roofworth-${new Date().toISOString().slice(0, 10)}.sqlite`);
const db = openDb();
db.backupTo(file);
db.close();
console.log(`Backup written to ${file}`);
