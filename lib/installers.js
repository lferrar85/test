import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'installers.json');

export const SERVICE_LABELS = { solar: 'Solar panels', battery: 'Battery storage', ev: 'EV chargers', heatpump: 'Heat pumps' };

let cache = null;
export function installers() {
  if (!cache) cache = JSON.parse(readFileSync(FILE, 'utf8'));
  return cache;
}
export const installerBySlug = (slug) => installers().find((i) => i.slug === slug) || null;

// Up to `limit` installers covering the region (and offering the service).
// `load` is an optional { slug: count } map used to share leads fairly: the
// installers who've received the fewest leads so far go first.
export function matchInstallers(region, { service = 'solar', limit = 3, load = {} } = {}) {
  return installers()
    .filter((i) => i.services.includes(service) && (region === 'uk' || i.regions.includes(region)))
    .sort((a, b) => (load[a.slug] || 0) - (load[b.slug] || 0) || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export const publicInstaller = (i) => ({
  slug: i.slug,
  name: i.name,
  tagline: i.tagline,
  regions: i.regions,
  services: i.services,
  accreditations: i.accreditations,
  demo: !!i.demo,
});
