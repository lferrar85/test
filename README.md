# GoSolarCompare

Premium UK solar comparison platform. Next.js 16 (App Router, Cache Components), React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Zod, React Hook Form. Supabase schema included.

**Positioning:** Better solar. Better choices. A greener future. Only approved installers; honest comparisons; a tree planted for every completed installation.

## Run it

```bash
npm install
cp .env.example .env.local   # optional; defaults run in demo mode
npm run dev                  # http://localhost:3000
```

- Admin: `/admin` (development default password `demo`, any email). Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.
- Everything runs on in-memory **demonstration data** by default; the UI labels it. See `docs/STATUS.md` for the go-live checklist.

## Map

| Area | Where |
|---|---|
| Design tokens, type scale, motion | `src/app/globals.css` |
| Brand: logo, Ray, illustrations | `src/components/brand/` |
| Homepage sections | `src/components/home/` |
| Comparison journey | `src/components/journey/`, `src/app/compare/` |
| Results | `src/components/results/`, `src/app/compare/results/` |
| Installer application | `src/components/installers/`, `src/app/installers/apply/` |
| Admin | `src/app/admin/` |
| Domain model, schemas, requirements config | `src/lib/domain/` |
| Data layer (demo + Supabase adapter) | `src/lib/data/` |
| API routes | `src/app/api/` |
| Database schema | `supabase/migrations/` |
| Docs | `docs/` |

## Principles baked into the code
- Installers are matched by coverage and technology and listed alphabetically. There is no commercial weighting.
- Only verified accreditations are displayed. Approval is blocked until required groups for each technology are verified.
- Tree counts only move when a planting is confirmed with a reference.
- No savings guarantees, no invented ratings, no pre-ticked marketing consent.

## Scripts
- `npm run dev` / `npm run build` / `npm start`
- `npm run lint`
