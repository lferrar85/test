// Ray, the site's cat: a solar installer in a hard hat and hi-vis, drawn as plain SVG so it
// renders on the server with no script, and so mascot.js can move the parts.
// Shared by lib/ui.js (server) and public/js/mascot.js (browser). Keep it dependency-free.

const C = {
  fur: '#3a3a3a',
  furDark: '#1f1f1f',
  cream: '#f8eed6',
  pink: '#f2a1a8',
  ink: '#111',
  hatShade: '#e4e4e0',
  vest: '#ff7a1a',
  stripe: '#f1f1ef',
  stripeEdge: '#bdbdb8',
};

export const HEAD_VIEW = '112 70 376 376';

const eye = (cx, side, g) => `
  <g class="cat-eye" clip-path="url(#${g(`eye-${side}`)})">
    <ellipse cx="${cx}" cy="300" rx="36" ry="38" fill="#fff"/>
    <g class="cat-iris cat-iris-${side}">
      <circle cx="${cx}" cy="302" r="24" fill="url(#${g('iris')})"/>
      <ellipse class="cat-pupil" cx="${cx}" cy="302" rx="9" ry="14" fill="${C.ink}"/>
      <circle cx="${cx - 9}" cy="292" r="6" fill="#fff"/>
      <circle cx="${cx + 8}" cy="312" r="3" fill="#fff" opacity=".8"/>
    </g>
    <ellipse class="cat-lid" cx="${cx}" cy="300" rx="40" ry="42" fill="${C.fur}"/>
  </g>
  <ellipse cx="${cx}" cy="300" rx="36" ry="38" fill="none" stroke="${C.ink}" stroke-width="6"/>`;

/**
 * The SVG markup. `id` keeps gradient and clip ids unique when more than one Ray is on a page.
 * `viewBox` can crop him: the default trims the empty margins, HEAD_VIEW shows just the face.
 */
export function raySvg({ id = 'ray', cls = '', viewBox = '76 52 448 588' } = {}) {
  const g = (n) => `${id}-${n}`;
  return `<svg class="cat ${cls}" viewBox="${viewBox}" role="img" aria-label="Ray the cat, a solar installer in a hard hat and hi-vis vest" focusable="false">
  <defs>
    <radialGradient id="${g('iris')}" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#ffd54a"/><stop offset=".7" stop-color="#ff9d00"/><stop offset="1" stop-color="#d96d00"/></radialGradient>
    <linearGradient id="${g('lens')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2b2b"/><stop offset="1" stop-color="#0b0b0b"/></linearGradient>
    <linearGradient id="${g('hat')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${C.hatShade}"/></linearGradient>
    <clipPath id="${g('vest')}"><path d="M136 640C140 556 196 484 300 470C404 484 460 556 464 640Z"/></clipPath>
    <clipPath id="${g('eye-l')}"><ellipse cx="246" cy="300" rx="36" ry="38"/></clipPath>
    <clipPath id="${g('eye-r')}"><ellipse cx="354" cy="300" rx="36" ry="38"/></clipPath>
  </defs>

  <g class="cat-body">
    <!-- shoulders and chest fur -->
    <path d="M96 640C96 566 150 510 212 476Q300 446 388 476C450 510 504 566 504 640Z" fill="${C.fur}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <!-- hi-vis vest -->
    <path d="M136 640C140 556 196 484 300 470C404 484 460 556 464 640Z" fill="${C.vest}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <g clip-path="url(#${g('vest')})">
      <path d="M120 566Q300 528 480 566L480 590Q300 552 120 590Z" fill="${C.stripe}" stroke="${C.stripeEdge}" stroke-width="3"/>
      <path d="M120 618Q300 580 480 618L480 642Q300 604 120 642Z" fill="${C.stripe}" stroke="${C.stripeEdge}" stroke-width="3"/>
    </g>
    <!-- tee showing through the open vest -->
    <path d="M300 474L240 640H360Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <!-- sun sticker and name badge -->
    <g transform="translate(192 548) rotate(-8)">
      <circle r="19" fill="#ffd000" stroke="${C.ink}" stroke-width="5"/>
      <path d="M0 -28v8M0 20v8M-28 0h8M20 0h8M-20 -20l6 6M14 14l6 6M20 -20l-6 6M-14 14l-6 6" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>
    </g>
    <g class="cat-badge" transform="translate(362 536) rotate(7)">
      <rect x="0" y="0" width="84" height="40" rx="8" fill="#fff" stroke="${C.ink}" stroke-width="5"/>
      <text x="42" y="28" text-anchor="middle" font-family="'Barlow Condensed','Barlow',sans-serif" font-weight="800" font-size="24" fill="${C.ink}" letter-spacing="1">RAY</text>
    </g>
  </g>

  <g class="cat-head">
    <!-- ears -->
    <g class="cat-ear cat-ear-l">
      <path d="M168 232L140 80Q142 72 150 76L270 180Z" fill="${C.fur}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M182 206L162 108L246 180Z" fill="${C.pink}"/>
    </g>
    <g class="cat-ear cat-ear-r">
      <path d="M432 232L460 80Q458 72 450 76L330 180Z" fill="${C.fur}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M418 206L438 108L354 180Z" fill="${C.pink}"/>
    </g>
    <!-- head with small cheek tufts -->
    <path d="M300 150C400 150 464 210 464 300C464 330 456 352 446 368L474 380L444 396C420 428 360 448 300 448C240 448 180 428 156 396L126 380L154 368C144 352 136 330 136 300C136 210 200 150 300 150Z" fill="${C.fur}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
    <!-- muzzle -->
    <ellipse cx="300" cy="376" rx="76" ry="52" fill="${C.cream}"/>
    <!-- eyes -->
    ${eye(246, 'l', g)}
    ${eye(354, 'r', g)}
    <!-- nose and mouth -->
    <path d="M284 354H316L300 374Z" fill="${C.pink}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M300 374V386M300 386Q284 402 268 390M300 386Q316 402 332 390" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>
    <!-- whiskers -->
    <g class="cat-whiskers" stroke="${C.ink}" stroke-width="4" stroke-linecap="round" fill="none">
      <path d="M232 378L148 364M234 394L150 404M368 378L452 364M366 394L450 404"/>
    </g>
    <!-- hard hat -->
    <g class="cat-hat">
      <path d="M160 214C160 140 222 88 300 88C378 88 440 140 440 214Z" fill="url(#${g('hat')})" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M276 96Q300 88 324 96L330 214H270Z" fill="${C.hatShade}" opacity=".6"/>
      <path d="M160 194H440V214H160Z" fill="${C.ink}"/>
      <path d="M112 216H488" stroke="${C.ink}" stroke-width="18" stroke-linecap="round"/>
      <path d="M118 216H482" stroke="url(#${g('hat')})" stroke-width="10" stroke-linecap="round"/>
    </g>
    <!-- sunglasses, parked on the hat; mascot.js drops them over the eyes to celebrate -->
    <g class="cat-shades">
      <path d="M206 150H394" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>
      <path d="M210 148H292Q296 184 254 186Q212 186 210 148Z" fill="url(#${g('lens')})" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M390 148H308Q304 184 346 186Q388 186 390 148Z" fill="url(#${g('lens')})" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/>
      <path d="M224 158q16 -5 32 1" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>
      <path d="M322 158q16 -5 32 1" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>
    </g>
  </g>
</svg>`;
}
