# Roofworth (working name)

A UK solar savings calculator that turns into a quote-matching marketplace.

1. A homeowner answers a few questions about their roof and home. An hourly energy model shows what solar could save them, with every assumption visible.
2. If they want prices, up to three installers covering their postcode receive their details, and only the installers named on the consent checkbox.
3. You earn from installers for introductions. Homeowners pay nothing.

Zero npm dependencies. Node 22.13+ (uses the built-in `node:sqlite`).

```bash
npm start                    # http://localhost:3000
ADMIN_PASSWORD=choose-one npm start   # also enables /admin (disabled when unset)
npm test                     # 28 tests: the energy model, the API, security, retention
npm run links                # crawls every page: no broken links, assets or #anchors
npm run export               # static copy of the whole site in ./dist
```

## What's in the site

| Page | Route |
|---|---|
| Home (calculator step 1 is the hero) | `/` |
| Solar savings calculator, 3 steps + live results | `/solar-calculator` |
| Battery storage explainer, with worked numbers from the same model | `/battery-storage` |
| Battery quote request form | `/battery-quote` |
| Installer directory, filter by region | `/installers` |
| Installer profile with direct quote form (one per installer in `data/installers.json`) | `/installers/<slug>` |
| Guides index and 8 guides | `/guides`, `/guides/<slug>` |
| How it works · About (incl. how you're paid) · Methodology (generated from the model's own constants) | `/how-it-works` `/about` `/methodology` |
| For installers: pitch and application form | `/for-installers` |
| Contact | `/contact` |
| Thank-you page after any form | `/thank-you` |
| Privacy · Terms · Cookies | `/privacy` `/terms` `/cookies` |
| 404, sitemap.xml, robots.txt | |
| Admin: submissions, status, CSV export, delete (password-protected, not linked) | `/admin` |

## Run the Node server with admin and lead storage (recommended)

This keeps every lead in SQLite, with the `/admin` page (list, status, delete, CSV export), fair lead rotation, rate limiting and automatic 12-month deletion.

**Render (easiest):** push the branch, then Dashboard > New > Blueprint and pick the repo. `render.yaml` creates a Docker web service with a 1 GB persistent disk at `/data` (a paid instance is required for the disk). Enter `ADMIN_PASSWORD` and `SITE_URL` when asked. Then open `https://your-domain/admin` and sign in as `admin`.

**Any Docker host (Fly.io, Railway, a VPS):** `docker build -t roofworth . && docker run -p 10000:10000 -v roofworth-data:/data -e ADMIN_PASSWORD=... -e SITE_URL=https://... roofworth`. Mount a volume at `/data` or leads are lost on redeploy.

- `GET /healthz` is the health check. Always serve over HTTPS: the admin uses HTTP Basic auth.
- Old leads are deleted daily after `RETENTION_MONTHS` (default 12). Set `AUTO_PURGE=0` to turn that off.
- Backups: `node scripts/backup.mjs` writes a dated copy to `./backups`. Schedule it and copy the files off the server.
- Set `WEBHOOK_URL` to also copy each lead to Zapier, Make, Slack or a CRM, which doubles as a second backup.
- Lead emails and phone numbers are personal data: keep `ADMIN_PASSWORD` long and unique.

## Deploy to Netlify

`netlify.toml` is included. Netlify runs `npm run export` (static pages) and serves `netlify/functions/api.mjs` at `/api/*` for the forms.

1. Push this branch to GitHub, then in Netlify choose **Add new site > Import an existing project** and pick the repo and branch.
2. Leave the build settings as detected (they come from `netlify.toml`).
3. Under **Site configuration > Environment variables** add `WEBHOOK_URL`: where each lead is POSTed as JSON (a Zapier or Make webhook that writes to Google Sheets, email or your CRM). Until it's set the forms return an error on purpose, so no lead is silently lost.
4. Optional: `CONTACT_EMAIL`, `COMPANY_NAME`, `COMPANY_NUMBER`, `COMPANY_ADDRESS`, `ICO_NUMBER`, `SITE_NAME`.
5. Add your custom domain under **Domain management**.

Netlify has no database or admin page: leads live wherever your webhook sends them. The `/admin`, SQLite store, rate limiting and the 12-month purge are for the Node server (`npm start`) only. If you stay on Netlify, apply the retention promise in your own sheet or CRM.

## How it works

```
public/js/data.js     every assumption: yields by region, roof factors, prices, costs
public/js/model.js    the energy model (pure functions, runs in browser and Node)
public/js/*.js        calculator UI, the Roof Dial, charts, forms
lib/                  page templates, validation, SQLite store, installer matching
content/              guides, legal pages, FAQ (plain data, safe to edit)
data/installers.json  the installers you introduce homeowners to
server.js             pages + JSON API + admin, no framework
```

**The model.** Annual generation = kWp × regional yield × roof direction/pitch factor × shading. That is spread over 12 months × a clear and a dull day × 24 hours, matched against the home's hourly demand (occupancy pattern, EV, heat pump), with an optional battery. Money follows energy: avoided purchases at the import rate, exports at the export rate. The 25-year view includes panel ageing, electricity price rises, an inverter replacement and a battery that stops counting after its life. Tests assert sanity and energy balance. `/methodology` is generated from the same constants, so it cannot drift from the maths.

**Lead handling.** The visitor sees which installers will receive their details, and the consent checkbox names them. The server uses exactly those (re-checked against coverage and service). Consent wording and version are stored with each lead. Leads are shared fairly: installers with the fewest recent introductions are offered first. Forms have a honeypot, rate limiting (8 per hour per IP) and server-side validation; the admin CSV neutralises spreadsheet formulas.

**Configuration** (environment variables): `PORT`, `SITE_NAME`, `SITE_URL`, `CONTACT_EMAIL`, `COMPANY_NAME`, `COMPANY_NUMBER`, `COMPANY_ADDRESS`, `ICO_NUMBER`, `ADMIN_PASSWORD`, `ADMIN_USER`, `DB_FILE`, `WEBHOOK_URL` (POSTs each submission as JSON to Zapier/Make/Slack/your CRM), `TRUST_PROXY=1` (behind a proxy), `RATE_LIMIT_PER_HOUR`, `POSTCODE_LOOKUP=1`, `LEGAL_REVIEWED=1`, `NODE_ENV=production`. To rename the brand, set `SITE_NAME` and search for "Roofworth" in `content/`.

## Before real homeowners use it: the honest checklist

These are not optional, and none of them can be done from inside the code.

1. **Check the numbers.** Every figure in `public/js/data.js` is a typical-UK placeholder, not calibrated data: regional yields, the orientation table, import and export rates, installed costs. Calibrate yields and orientation against [PVGIS](https://re.jrc.ec.europa.eu/pvg_tools/en/) (free) or MCS irradiance data, refresh prices from current Ofgem and Smart Export Guarantee figures, then update `reviewed` in that file and repeat each quarter. I could not reach PVGIS from the build sandbox, so this was not done. Calling PVGIS from the server for the visitor's exact roof is the obvious upgrade.
2. **Sign real installers.** `data/installers.json` holds invented sample listings flagged `"demo": true` (they show a "Sample listing" label). Replace them with real, checked partners, and make the site's claims true: MCS certification, consumer-code membership and insurance are stated as your standards on several pages.
3. **Legal review.** `content/legal.js` is a template drafted from this site's real data practices. A UK solicitor must review it and you must fill the `[PLACEHOLDERS]` (company, ICO number, hosting provider, etc.), then set `LEGAL_REVIEWED=1` to remove the draft banners. Points the drafter flagged for the solicitor: consent wording for phone contact (PECR/TPS), legal bases, the withdrawal-passes-to-installers promise, the "how we're paid" disclosure against CMA/ASA expectations, the liability clause.
4. **Register with the ICO** and pay the fee if it applies to you.
5. **Fonts.** Pages load Google Fonts from Google's servers, which sends visitors' IPs to Google. Self-host Barlow and Barlow Condensed (open licence) and drop the `<link>` in `lib/layout.js`. The privacy copy says there are no third-party trackers.
6. **Retention.** The privacy notice promises deletion after 12 months. Schedule `node scripts/purge-old.mjs` daily (cron). Handle withdrawal and deletion requests promptly, and tell the installers who hold the data.
7. **Hosting.** HTTPS (the CSP and security headers are set), a persistent disk for `DB_FILE` (SQLite) or swap `lib/db.js` for Postgres, backups, `ADMIN_PASSWORD`, `TRUST_PROXY=1` if behind a proxy.
8. **Accessibility test** with real assistive technology. It's built with semantic HTML, a keyboard-operable dial, chart tables and reduced-motion support, but nobody has tested it with a screen reader yet.
9. **Postcode place names** via postcodes.io are off by default because they send the postcode to a third party. If you turn on `POSTCODE_LOOKUP=1`, mention it in the privacy notice.

## Ideas, in rough order of value

- Installers submit and compare actual quotes in a portal (this is where "compare" becomes literal) and an email/SMS to the homeowner when a quote lands.
- PVGIS-backed yield for the exact roof; Google Solar API roof detection from the postcode.
- Time-of-use tariff modelling for batteries and EVs.
- Installer reviews, but only genuine verified ones; never invent social proof.
- Privacy-friendly analytics and a conversion funnel report.

## Design

Bold and modern, in the spirit of the best UK comparison sites: a sun-yellow hero with a black pill headline, black buttons, wavy section dividers, big circular step icons on a light grey band, a yellow "without solar vs with solar" comparison card driven by the real model, rounded white cards, and a charcoal footer. Type is Barlow (headings and body) with Barlow Condensed for numerals. The standout is the Roof Dial, a draggable sun on a compass that shows the share of the best-possible sun live. Chart colours were checked for colour-blind separation on white. Colours and sizes are tokens at the top of `public/css/site.css`.

There are no photos, logos, testimonials or visitor counters, deliberately: those need real, permitted, verified material. Add them when you have it (a testimonials strip and an "installers we work with" logo row are the obvious slots).
