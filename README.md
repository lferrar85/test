# Watts — Skip Hire & Scrap Metal, Leicester

Single-page site: Vite, [Lenis](https://github.com/darkroomengineering/lenis) smooth scroll, and a live [three.js](https://threejs.org) hero.

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## How it's put together

- `src/three/` holds the 3D models: the Watts skip (`skip.js`), the waste that fills it (`waste.js`), the skip-loader lorry (`lorry.js`), and the logo, livery and materials (`materials.js`).
- `src/hero.js` is the live hero: the lorry drives in, you can drag it, and scrolling lowers the skip.
- The skip pictures in `public/media/skips/` are rendered from the same models. To change a skip or add a waste type, edit the models, then with `npm run dev` running:

  ```sh
  node tools/render-assets.mjs   # writes tools/out/*.png
  ```

  and convert to webp into `public/media/skips/` (see the commit history for the crop script).

## To confirm with the yard

- Opening hours (from an old directory listing), the booking email address in `src/main.js`, bin-bag counts and skip dimensions.
- Set `BOOKING_ENDPOINT` in `src/main.js` to send quotes to a form service instead of opening an email.
