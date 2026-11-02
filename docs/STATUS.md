# Build status and go-live checklist

This is a complete, working **development build**. It is not production-ready until the items below are done. The demo data backend is clearly labelled in the UI and must be switched off before launch.

## Done
- Brand system: palette, type (Bricolage Grotesque + Figtree), logo mark, Ray mascot (5 moods, blink, cursor tracking, reduced-motion aware), illustration set.
- Homepage with all requested sections, signature scroll-linked sun, tree promise with verified-only counter.
- 9-step comparison journey with validation, consent (no pre-ticked marketing), honeypot, rate limiting, session restore, matching animation, results page with side-by-side table and demo labelling.
- Installer application (6 sections, configurable per-technology requirements, document metadata capture) entering `received` state only.
- Admin: password-gated placeholder auth, overview with stats and charts, applications review with status transitions and an approval guard that blocks approval until required accreditation groups are verified, accreditation verification with expiry, coverage/technology/re-verification settings, review notes, enquiries management, completion recording, tree-planting ledger with partner confirmation that drives the public counter via cache tags.
- 16 content/legal pages, 404, sitemap, robots, JSON-LD, security headers via `proxy.ts`.
- Supabase schema with RLS (`supabase/migrations/0001_init.sql`).

## Required before launch
1. **Database**: implement `src/lib/data/supabase-repository.ts` against the migration (the demo repository documents expected behaviour). Set `DATA_BACKEND=supabase`.
2. **Auth**: replace `src/lib/auth/admin-session.ts` with Supabase Auth + `profiles.role` checks; remove the dev password.
3. **File uploads**: issue signed upload URLs to the private `installer-documents` bucket; serve via signed URLs in admin.
4. **Email**: homeowner confirmation, installer notifications, "stop contacting me" workflow (Resend/Postmark). Hooks are marked `TODO(integration)`.
5. **Rate limiting**: swap the in-memory limiter in `src/lib/utils/request.ts` for Redis/Upstash.
6. **Results page access**: issue a signed, expiring token in the results URL instead of the raw enquiry id.
7. **Tree partner**: agree a partner, set `TREE_PARTNER_*`, implement batch ordering + confirmation import in the ledger.
8. **Legal**: have privacy policy and terms reviewed; add company and ICO registration details to `/contact`, `/privacy`, footer.
9. **Photography**: see `docs/IMAGERY.md`.
10. **Monitoring**: error tracking, analytics with consent, uptime.
11. **Testing**: Playwright suite in CI (scripts used during development are in the session scratchpad and easy to port), axe accessibility run, Lighthouse budget.
12. **Content**: real installer profiles, FAQ review by an industry specialist, cost figures re-checked against the latest MCS data at launch.

## Deliberate decisions
- No GSAP/Lenis: Framer Motion's scroll primitives cover every effect used; native scrolling keeps accessibility defaults.
- No multi-hue categorical charts in admin: single-hue bars and icon+label badges keep status readable for colour-vision-deficient users.
- Alphabetical ordering of matches is hard-coded in `src/lib/data/matching.ts`. Keep it that way.
