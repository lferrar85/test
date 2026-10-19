/* Skip catalogue. Which sizes are offered for each waste type, and the
   size/bag figures, are working assumptions: confirm them with the yard. */

export const SIZES = {
  '4': { id: '4', yd: 4, m3: 3, name: 'Mini', bags: 35, dims: '1.8 × 1.3 × 1.0 m', use: 'A small garden clear-out, or a bathroom or bedroom refit.' },
  '5': { id: '5', yd: 5, m3: 4, name: 'Midi', bags: 50, dims: '2.4 × 1.4 × 1.1 m', use: 'A kitchen rip-out or a house-move clear-out.' },
  '8': { id: '8', yd: 8, m3: 6, name: "Builder's", bags: 80, dims: '3.4 × 1.7 × 1.2 m', use: 'The trade standard: extensions, driveways and full garage clear-outs.' },
  '10': { id: '10', yd: 10, m3: 8, name: 'Large', bags: 100, dims: '3.7 × 1.8 × 1.5 m', use: 'A full house strip-out or a shop refit.' },
  '16': { id: '16', yd: 16, m3: 12, name: 'Maxi', bags: 160, dims: '4.1 × 1.8 × 1.8 m', use: 'Big clear-outs of light, bulky waste.' },
  roro: { id: 'roro', yd: null, m3: '20–30', name: 'Roll-on / roll-off', bags: '400+', dims: '6.1 × 2.4 × 1.9 m', use: 'Demolition, site clearance and factory waste, collected on a hook lorry.' },
}

export const sizeSlug = (s) => (s.id === 'roro' ? 'roll-on-roll-off' : `${s.yd}-yard-skip`)
export const sizeTitle = (s) => (s.id === 'roro' ? 'Roll-on / Roll-off Skip' : `${s.yd} Yard Skip`)

const L = (s) => s.split(' | ')

export const TYPES = [
  { id: 'general', slug: 'general-waste', name: 'General waste', lead: 'House, garage and office clear-outs.', sizes: ['4', '5', '8', '10', '16', 'roro'],
    about: 'For everyday household and commercial waste. Fill it level with the top, and keep anything heavy, wet or hazardous out.',
    yes: L('Bagged rubbish | Furniture and mattresses | Cardboard and paper | Carpet and flooring | Toys and clothing | Small appliances'),
    no: L('Plasterboard | Tyres | Fridges and freezers | Paint and chemicals | Gas bottles | Asbestos') },
  { id: 'garden', slug: 'garden-waste', name: 'Garden waste', lead: 'Green waste only.', sizes: ['4', '5', '8', '10'],
    about: 'For anything that grew. Keeping it green lets us recycle it, which keeps the cost down.',
    yes: L('Grass cuttings | Hedge trimmings | Leaves | Branches and logs | Shrubs and plants'),
    no: L('Soil in quantity | Railway sleepers | Bagged household rubbish | Fencing and sheds') },
  { id: 'muck', slug: 'soil-and-muck', name: 'Soil & muck', lead: 'Muck away from digs and levelling.', sizes: ['4', '5'],
    about: 'Soil is heavy, so a small skip fills up by weight long before it fills by volume. We keep these to the smaller sizes.',
    yes: L('Topsoil | Clay | Turf | Excavation spoil | Sub-soil'),
    no: L('Rubble mixed in | Wood | Plastic and rubbish | Roots and trees') },
  { id: 'inert', slug: 'inert-waste', name: 'Inert waste', lead: 'Heavy and mixed, but nothing that rots.', sizes: ['4', '5', '8'],
    about: 'Hard, heavy waste that does not rot or burn: bricks, concrete, soil and tiles together in one skip.',
    yes: L('Bricks and blocks | Concrete | Stone | Tiles and ceramics | Soil and sand | Rubble'),
    no: L('Wood | Plasterboard | Bags of rubbish | Plastics | Metal pipe') },
  { id: 'hardcore', slug: 'hardcore', name: 'Hardcore', lead: 'Clean rubble gets the best rate.', sizes: ['4', '5', '8'],
    about: 'Clean brick, concrete and stone only. Keep soil, wood and plastic out, and we can recycle it as aggregate and charge less.',
    yes: L('Brick | Concrete | Block | Stone | Tiles | Paving slabs'),
    no: L('Soil | Wood | Plastic | Anything soft or wet') },
  { id: 'plasterboard', slug: 'plasterboard', name: 'Plasterboard', lead: 'Kept separate by law.', sizes: ['4', '5', '8'],
    about: 'Plasterboard has to be recycled on its own, so it needs its own skip. Mixed in with other waste, it makes the whole load more expensive.',
    yes: L('Plasterboard sheets | Plasterboard offcuts | Gypsum board'),
    no: L('Everything else, including plaster skim and rubble') },
  { id: 'wood', slug: 'wood', name: 'Wood', lead: 'Recycled into chip and board.', sizes: ['4', '5', '8', '10', '16'],
    about: 'Clean timber is chipped and recycled, so keeping it separate keeps the price down.',
    yes: L('Timber and offcuts | Pallets | Doors and frames | Fencing | Flooring and floorboards | Furniture'),
    no: L('Plasterboard | Rubble | Bags of rubbish | Treated railway sleepers') },
  { id: 'metal', slug: 'metal', name: 'Metal', lead: 'We pay you for this one.', badge: 'We pay', sizes: ['4', '5', '8', '10', '16', 'roro'],
    about: 'Scrap is worth money, and a skip of clean metal can pay for itself. We weigh it on the bridge and pay you the same day.',
    yes: L('Steel and iron | Copper and brass | Aluminium | Cable | Radiators | Pipework | Cast iron'),
    no: L('Gas bottles | Sealed tanks | Anything containing oil or fuel') },
  { id: 'mixed', slug: 'mixed-trade', name: 'Mixed trade', lead: 'For builders, refits and strip-outs.', badge: 'Most hired', sizes: ['4', '5', '8', '10', '16', 'roro'],
    about: 'Site waste that comes in all shapes: the one to choose when you cannot sort it as you go.',
    yes: L('Strip-out waste | Offcuts and packaging | Mixed rubble and wood | Fixtures and fittings'),
    no: L('Plasterboard | Asbestos | Liquids | Gas bottles') },
  { id: 'empty', slug: 'wait-and-load', name: 'Wait & load', lead: 'No room on site for a skip?', sizes: ['8', '10', '16'],
    about: 'No space or no permit for a skip? We park up, you load it while we wait, and we take it away straight after.',
    yes: L('Most general waste | Bulky items | Mixed loads'),
    no: L('Leaving the skip overnight | Hazardous waste | Asbestos') },
  { id: 'asbestos', slug: 'asbestos', name: 'Asbestos', lead: 'Sealed, lockable container.', sizes: ['sealed'],
    about: 'Asbestos needs to be double-wrapped, labelled and carried in a closed, lockable container. We arrange this by phone, so please ring before you book.',
    yes: L('Double-wrapped asbestos sheets | Bagged and labelled asbestos | Asbestos cement'),
    no: L('Loose or unwrapped asbestos | Anything not packaged. Ring first, every time') },
]

export const SEALED = { id: 'sealed', yd: null, m3: 6, name: 'Sealed container', bags: '—', dims: '3.4 × 1.7 × 1.2 m', use: 'A closed, lockable container with a hazard label, arranged by phone.' }

export const typeBy = (slug) => TYPES.find((t) => t.slug === slug)
export const sizeFor = (t, id) => (id === 'sealed' ? SEALED : SIZES[id])
export const coverSize = (t) => (t.sizes.includes('8') ? '8' : t.sizes[t.sizes.length - 1])

/* Image for a type at a size. Roll-on/off is shown empty, whatever the waste. */
export const skipImg = (t, id) => (id === 'roro' ? '/media/skips/size-roro.webp' : id === 'sealed' ? '/media/skips/p-asbestos-sealed.webp' : `/media/skips/p-${t.id}-${id}.webp`)
