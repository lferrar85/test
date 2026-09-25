# R.A.C Carpentry & Joinery: website

A single-page site for R.A.C Carpentry & Joinery (custom carpentry & fitted interiors). It uses static HTML, CSS and JS, with no build step.

## Run it

```bash
npx http-server rac-carpentry -p 8080   # or any static server
```

Open `index.html` directly for a quick look. Use a server when you want the hero video slot to work.

## What's in it

| Section | Motion |
|---|---|
| Loader | Tape counts to 2400 mm, a green kerf cuts the screen and it splits open |
| Hero | Real-time WebGL "timber film" (oak → walnut end grain → ash, with a moving work-light and grain), the van's saw-blade badge with spinning teeth that rev with scroll speed, and sawdust thrown off the blade |
| Tickers | Crossed green/white tape bands, echoing the van stripes |
| Approach | Words light up as you read; "flat-packed" gets struck through |
| What we build | Sticky joiner's drawing board; each service's elevation drawing draws itself |
| How it works | Horizontal pinned run with a tape measure pulling out (stacks vertically on mobile) |
| The van | The real van photo with a clip reveal and parallax |
| Free quote | Chip picker + form that opens a pre-filled email to the business |
| Footer | Giant R.A.C wordmark wipes in green |

Reduced-motion users get a static, fully usable page.

## Swap-ins before launch

1. **Hero video (optional).** Save a 10–20 s muted clip of his work as `assets/hero.mp4` (1920px wide, H.264, ideally under 6 MB). Then add `data-src="assets/hero.mp4"` to the `<video data-video>` tag in `index.html`. It fades in over the timber film.
2. **Owner name / service area.** The van shows neither, so the copy doesn't invent them. Add them to the hero lede and footer if wanted.
3. **Project photos.** Replace or extend the van section, or add a gallery, once real job photos exist.
4. **`og:image`.** Change it to an absolute URL once the domain is known.
5. **Form.** It's `mailto:` based: no backend, and it works anywhere. Swap in Formspree/Netlify Forms later if he wants submissions without the email app.

## Files

- `index.html`: markup and the SVG badge, drawings and icons
- `css/styles.css`: design tokens, layout, motion
- `js/main.js`: WebGL film, blade + sawdust, loader, scroll choreography, form
- `vendor/lenis.min.js`: smooth scroll (MIT, vendored)
- `assets/`: van photo (webp + jpg)
