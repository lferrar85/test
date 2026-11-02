# Imagery brief

The build ships with an original illustration system (hero home scene, solution scenes, Ray, forest) because no licensed photography was available in the development environment. The brief asks for realistic, high-quality photography in key positions. This document is the shot list so photography can be dropped in without redesign.

## Principles
- Realistic UK homes and installations only. No lightning bolts, fake glows or obviously AI-generated scenes.
- Warm, late-afternoon light. Panels integrated into roofs, not floating.
- Diversity of housing stock: detached, semi, terrace, bungalow.
- Licence must cover web, social and print. Record licence IDs in `docs/LICENCES.md`.

## Slots

| Location | Component | Spec | Notes |
|---|---|---|---|
| Homepage hero | `src/components/brand/HomeScene.tsx` | 1600×1280, WebP/AVIF, < 250 KB | Modern UK detached home, roof-integrated panels, EV on drive, wall battery visible. Can sit behind the illustration layers or replace them. Keep the left 55% of the viewport clear of busy detail for headline legibility on mobile stack. |
| Hero motion (optional) | same | 8–12 s drone-style loop, 1920×1080, H.265 + VP9, < 4 MB, muted, poster image required | Slow lateral drift. Honour `prefers-reduced-motion` (component already does). |
| Solutions cards (×6) | `src/components/home/Solutions.tsx` / `SolutionArt.tsx` | 1200×675 each | Panels; panels + battery; battery in utility room; EV charger on drive; outdoor heat pump unit; whole-home composite. |
| Solution page heroes (×4) | `src/components/pages/SolutionPage.tsx` | 1200×800 | Same subjects, portrait-friendly crop. |
| Tree-planting | `src/app/tree-planting/page.tsx` | 1600×900 | Planting partner imagery once a partner is confirmed. Do not use generic forest stock as if it were ours. |
| Installer profiles | `src/components/results/InstallerCard.tsx` logo slot | 400×400 PNG/SVG on transparent | Supplied by the installer during application, stored in private storage, approved by admin before display. |
| About | `src/app/about/page.tsx` | 1200×800 | Team / office photography when available. No stock "team" images. |

## Implementation notes
- Use `next/image` with `sizes` set per slot; priority only on the homepage hero.
- Keep the illustrated versions as fallbacks for low-bandwidth or when a photo is missing.
- Alt text should describe the installation, not the mood ("Four-bedroom semi in Leeds with 12 roof-integrated panels").
