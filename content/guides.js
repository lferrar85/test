// Editorial guides for the solar comparison site.
// Figures that date quickly are flagged in `note` blocks and are written as of October 2026.
// Inline markup: **bold** and [[/internal-path|label]] or [[https://external-url|label]].

export const GUIDES = [
  {
    slug: 'how-much-do-solar-panels-cost',
    title: 'How much do solar panels cost in the UK?',
    description: 'Typical UK solar panel prices by system size, what changes the price, how 0% VAT affects it, and how to judge whether a quote is reasonable.',
    intro: 'Most UK homes pay somewhere between £5,000 and £10,000 for a roof system, but the exact price depends on size, roof and equipment. Here is what sits behind the numbers.',
    readMins: 5,
    updated: '2026-10',
    related: ['how-to-compare-solar-quotes', 'is-my-roof-suitable-for-solar', 'smart-export-guarantee'],
    cta: 'calculator',
    body: [
      { t: 'h2', x: 'Typical prices in October 2026' },
      { t: 'p', x: 'Solar is priced by system size, measured in kilowatts peak (kWp). That figure is the most the panels can produce under standard test conditions, not what they deliver on an ordinary day. In autumn 2026, a complete installed system in Great Britain typically costs somewhere between about £1,400 and £2,000 per kWp. Smaller systems cost more per kWp, because fixed costs such as scaffolding and the inverter are spread over fewer panels.' },
      {
        t: 'table',
        head: ['System size', 'Panels (400 to 450 W)', 'Typical installed price'],
        rows: [
          ['3 kWp', '7 to 8', '£4,500 to £6,000'],
          ['4 kWp', '9 to 10', '£5,500 to £8,000'],
          ['5 kWp', '11 to 13', '£6,500 to £9,000'],
          ['6 kWp', '13 to 15', '£7,500 to £10,500']
        ]
      },
      { t: 'note', x: 'These are indicative ranges based on published UK market figures in autumn 2026, not quotes. Prices move with equipment costs, installer demand and the VAT position, so check current figures and get written quotes for your own roof.' },
      { t: 'h2', x: 'What the price should include' },
      { t: 'p', x: 'A proper quote covers everything needed to get the system working and certified, not just the panels.' },
      {
        t: 'ul',
        items: [
          'Panels, typically 400 to 450 watts each, plus the roof mounting kit.',
          'An inverter, which converts the panels’ direct current into the alternating current your home uses. Inverters commonly last 10 to 15 years, so budget for a replacement during the life of the panels.',
          'Scaffolding, usually needed for safe roof access and often a few hundred pounds or more depending on the house.',
          'Electrical work, including the connection to your consumer unit and any isolators or monitoring equipment.',
          'Notifying or applying to your local network operator, and the MCS certificate that lets you claim export payments.'
        ]
      },
      { t: 'h2', x: 'What pushes the price up or down' },
      {
        t: 'ul',
        items: [
          '**Size.** A bigger system costs more in total but less per kWp.',
          '**Roof.** Several roof faces, steep pitches, difficult access, or a roof that needs repair first will all add cost.',
          '**Equipment.** Premium panels and inverters with longer warranties cost more. Micro-inverters or panel optimisers cost extra but can help on shaded or split roofs.',
          '**Battery.** Adding one typically adds several thousand pounds. Read our [[/guides/are-solar-batteries-worth-it|battery guide]] before deciding.',
          '**Installer.** Overheads, location and how busy they are all feed into the price. The cheapest quote is not always the best, and neither is the dearest.'
        ]
      },
      { t: 'h2', x: 'VAT: 0% until 31 March 2027' },
      { t: 'p', x: 'Installing solar panels and batteries in a home is currently zero-rated for VAT. HMRC’s [[https://www.gov.uk/guidance/vat-on-energy-saving-materials-and-heating-equipment-notice-7086|VAT Notice 708/6]] sets the 0% rate for qualifying installations up to 31 March 2027, with the reduced 5% rate due to apply from 1 April 2027. On a £7,000 system, 5% would add about £350.' },
      { t: 'p', x: 'The timing rules can be technical, so a deposit paid before the deadline does not necessarily settle the question if the work is finished after it. If your installation date is close to 31 March 2027, ask the installer in writing how they will treat VAT.' },
      { t: 'h2', x: 'Grants and “free” panels' },
      { t: 'p', x: 'There is no general UK grant for solar panels. Help is narrow. The [[https://www.gov.uk/apply-warm-homes-local-grant|Warm Homes: Local Grant]] in England is delivered by local authorities for low-income households in the least efficient homes, and ECO-style schemes have strict eligibility. The government’s [[https://www.gov.uk/government/publications/warm-homes-plan/warm-homes-plan-html|Warm Homes Plan]], published in January 2026, also refers to low-interest loans for solar and batteries. Treat availability as something to check, not assume.' },
      { t: 'p', x: 'Be cautious with offers of “free” panels or roof-rental deals. Read the contract closely: you may be giving up the savings, or tying your property to an agreement for many years.' },
      { t: 'h2', x: 'Does the price make sense?' },
      { t: 'p', x: 'What matters is cost set against benefit. A well-sited 4 kWp system in central England might generate around 3,800 kWh a year, using a rule of thumb of about 950 kWh per kWp (more in the south, less in Scotland). Savings come mainly from electricity you use yourself, which saves you your full unit price, plus export payments, which are typically a few pence per kWh (see our [[/guides/smart-export-guarantee|Smart Export Guarantee guide]]). Published examples from the [[https://energysavingtrust.org.uk/advice/solar-panels/|Energy Saving Trust]] have put payback at roughly nine to twelve years depending on location, though that moves with energy prices and how much power you use during the day.' },
      { t: 'p', x: 'Panels typically carry performance warranties of 25 years or more and lose around 0.5% of their output each year, so a system can keep earning long after it has paid back. But solar is not automatically worth it. A heavily shaded or north-facing roof, or a home you expect to leave within a few years, can change the sums. You can try your own numbers in our [[/solar-calculator|solar calculator]].' }
    ]
  },

  {
    slug: 'smart-export-guarantee',
    title: 'Smart Export Guarantee: how solar export payments work',
    description: 'The Smart Export Guarantee pays you for surplus solar electricity sent to the grid. Who offers it, what you need to qualify, and how to choose a tariff.',
    intro: 'The Smart Export Guarantee (SEG) is how most UK homes get paid for solar electricity they do not use themselves. Rates vary widely, so it helps to know the rules and what is worth comparing.',
    readMins: 5,
    updated: '2026-10',
    related: ['mcs-certification-explained', 'are-solar-batteries-worth-it', 'how-much-do-solar-panels-cost'],
    cta: 'calculator',
    body: [
      { t: 'h2', x: 'What the Smart Export Guarantee is' },
      { t: 'p', x: 'When your panels produce more than your home is using, the surplus flows out to the grid. The Smart Export Guarantee (SEG) is the scheme that requires some energy suppliers to pay you for it. It opened on 1 January 2020, replaced the Feed-in Tariff for new installations, and is overseen by [[https://www.ofgem.gov.uk/environmental-and-social-schemes/smart-export-guarantee-seg|Ofgem]].' },
      { t: 'p', x: 'Licensed electricity suppliers with 150,000 or more domestic customers must offer at least one SEG tariff, and smaller suppliers can opt in. The rate has to be above zero, but it is the supplier, not Ofgem, that sets it. You can apply to any SEG supplier, not only the one that sends your electricity bill, although some tariffs pay more if you are also an import customer.' },
      { t: 'h2', x: 'What you need to qualify' },
      {
        t: 'ul',
        items: [
          'A small-scale generator. For solar that means a system of up to 5MW, which comfortably includes any home.',
          'MCS certification (or an accepted equivalent) for the system and installer, for solar up to 50kW. This is why using an uncertified installer can cost you export payments. See our [[/guides/mcs-certification-explained|MCS guide]].',
          'A meter that records your export in half-hour intervals and has its own export meter point reference number (MPAN). In practice this is usually a smart meter.',
          'A contract with a SEG supplier.'
        ]
      },
      { t: 'note', x: 'Ask your installer for your MCS certificate number, because suppliers usually want it when you apply. Smart meters sometimes need export recording to be set up, so check with your supplier that your exports are actually being measured.' },
      { t: 'h2', x: 'How much does it pay?' },
      { t: 'p', x: 'There is no standard rate. As of October 2026, published SEG rates range from a few pence per kWh at the low end to around 15p at the top. A handful of tariffs pay more, but often come with conditions, such as also buying your electricity from that supplier or owning a battery. Suppliers can change rates, so the one you sign up to may not be the one you have in five years.' },
      { t: 'table', head: ['Tariff type', 'How it pays', 'Worth knowing'], rows: [
        ['Fixed rate', 'The same pence per kWh at all times', 'Easy to compare and predict; may be lower than the best variable rates'],
        ['Variable or time-of-use', 'Rate changes by time of day or with market prices', 'Can pay more at peak times, which suits a battery or evening export'],
        ['Linked to your import tariff', 'Higher rate if you also buy power from that supplier', 'Check the price you pay for imports as well, not just the export rate']
      ] },
      { t: 'note', x: 'SEG rates change often and differ between suppliers. Check current figures from each supplier before you choose, and read the contract length and any conditions.' },
      { t: 'h2', x: 'Why using your own solar usually matters more' },
      { t: 'p', x: 'A kWh you use yourself saves you the full price you would otherwise pay for imported electricity, which is usually a lot more than a SEG tariff pays for a kWh you export. So export income is normally the smaller part of the benefit.' },
      { t: 'p', x: 'As an illustration only, take a 4 kWp system generating about 3,800 kWh a year in central England. If a household that is out all day uses 30 to 50 per cent of that itself, it exports roughly 1,900 to 2,700 kWh. At 5p per kWh that is about £95 to £135 a year. At 15p it is about £285 to £400. That is a useful extra, but it is not a good reason to build a bigger system than you need. A battery can change the balance, as we explain in our [[/guides/are-solar-batteries-worth-it|battery guide]].' },
      { t: 'h2', x: 'Choosing and signing up' },
      {
        t: 'ol',
        items: [
          'Get your MCS certificate number and meter details from your installer.',
          'Compare tariffs on the rate, whether it is fixed or variable, the contract length, any requirement to be an import customer, and how often you are paid.',
          'Apply to the supplier you have chosen. They will typically ask for your certificate number, your address and your meter details.',
          'Check your first statements show that exports are being measured and paid.'
        ]
      },
      { t: 'p', x: 'You can usually move to a different SEG tariff later, subject to the contract terms, so it is worth reviewing the rate once a year. The [[https://energysavingtrust.org.uk/advice/smart-export-guarantee/|Energy Saving Trust]] has a plain-English overview if you want a second source.' },
      { t: 'h2', x: 'What the SEG does not do' },
      { t: 'p', x: 'The SEG pays only for electricity that is metered leaving your home. You are not paid for what you generate and use yourself. It generally does not cover systems without MCS (or equivalent) certification, and it does not guarantee a minimum income. If you are working out whether solar suits your home, our [[/solar-calculator|solar calculator]] lets you test the effect of different export assumptions.' }
    ]
  },

  {
    slug: 'is-my-roof-suitable-for-solar',
    title: 'Is my roof suitable for solar panels?',
    description: 'How roof direction, pitch, shade, space, condition and planning rules affect solar panels on a UK home, and when a roof is not worth using.',
    intro: 'Most UK roofs can take solar panels, but some will produce far more than others. Direction, shade and condition matter more than most people expect.',
    readMins: 5,
    updated: '2026-10',
    related: ['how-much-do-solar-panels-cost', 'solar-panel-installation-process'],
    cta: 'calculator',
    body: [
      { t: 'h2', x: 'Direction' },
      { t: 'p', x: 'A south-facing roof gives the most output over a year in the UK. South-east and south-west roofs lose only a little, typically around 5%. East- or west-facing roofs typically produce roughly 80% of the best case. A north-facing roof produces far less, often around half, and is rarely worth fitting.' },
      { t: 'p', x: 'A house with an east roof and a west roof is not a bad result. Panels on both sides spread generation across the morning and the evening, which can suit households that use most of their power at those times.' },
      { t: 'h2', x: 'Pitch' },
      { t: 'p', x: 'Pitches of about 30 to 40 degrees are close to ideal for the UK, but the penalty for being outside that range is modest. A shallow roof of around 10 degrees typically produces roughly 90% of the best case. Flat roofs are fitted with angled frames, which add cost and need careful weighting or fixing, but they can work well.' },
      { t: 'h2', x: 'Shade' },
      { t: 'p', x: 'Shade is the biggest thing to check. Trees, chimneys, dormers and neighbouring buildings can cut output sharply, because one shaded panel can drag down others wired in the same string. Micro-inverters or panel optimisers reduce that effect, at extra cost. Ask your installer how they have assessed shading at the survey and what loss they have assumed in their generation estimate.' },
      { t: 'h2', x: 'Space' },
      { t: 'p', x: 'Modern panels are typically 400 to 450 watts each and about 1.7 to 1.9 square metres. A 4 kWp system of around ten panels needs roughly 18 to 20 square metres of clear, usable roof, after allowing for edges, vents, roof windows and access paths. Output in the UK typically runs at about 800 to 1,000 kWh per kWp each year, with the south of England at the top of that range and Scotland nearer the bottom.' },
      { t: 'h2', x: 'Condition and structure' },
      {
        t: 'ul',
        items: [
          '**Age.** If the roof needs re-covering within the next ten years or so, do it before or together with the panels. Taking panels off and putting them back later costs money.',
          '**Structure.** Panels add weight and wind loading. A competent installer checks the rafters and roof covering at the survey.',
          '**Roof type.** Slate, concrete tile, clay tile, metal and flat roofs all need different fixings. Some, such as asbestos-cement sheets, need special handling or may rule installation out.',
          '**Electrics.** An old consumer unit or limited supply capacity can add cost to the job.'
        ]
      },
      { t: 'h2', x: 'Planning permission' },
      { t: 'p', x: 'In England, solar panels on most house roofs are permitted development, so you do not need to apply for planning permission. The usual conditions are that panels must not stick out more than 200mm from the roof slope and must not rise above the highest part of the roof, excluding the chimney. Extra rules apply to flat roofs, to listed buildings, and to conservation areas and World Heritage Sites, for example on panels fixed to a wall that faces a highway.' },
      { t: 'p', x: 'The permitted development rules for solar in England were amended with effect from 27 August 2026, including changes affecting listed homes, so check the current position on the [[https://www.planningportal.co.uk/permission/common-projects/solar-panels/planning-permission-solar-equipment-mounted-on-a-house-or-a-block-of-flats-or-on-a-building/|Planning Portal]] or with your council before you sign. Scotland, Wales and Northern Ireland have their own rules, which differ from England’s.' },
      { t: 'note', x: 'Flats, leasehold homes and mortgaged properties often need extra consent, for example from a freeholder or lender. Tell your home insurer too. Check these before paying a deposit.' },
      { t: 'h2', x: 'When a roof may not be worth using' },
      { t: 'ul', items: [
        'The only usable roof faces north, or is heavily shaded for much of the day.',
        'The roof is small, so the system would be too small to justify the fixed costs.',
        'You expect to move soon and want the cost back quickly.',
        'You live in a flat with no roof access. Small plug-in kits, which Great Britain moved to allow in 2026, may suit some flats, but they are a separate product with their own rules and are not covered here. Check current requirements.'
      ] },
      { t: 'p', x: 'A reputable installer will tell you honestly if your roof is poor. If you are unsure, start with our [[/solar-calculator|solar calculator]] to estimate output for your address, then compare it with what installers propose. Our guide to the [[/guides/solar-panel-installation-process|installation process]] explains what happens at the survey.' }
    ]
  },

  {
    slug: 'are-solar-batteries-worth-it',
    title: 'Are solar batteries worth it? Costs, savings and payback',
    description: 'Home batteries store spare solar or cheap grid power. Typical UK costs, honest payback, who benefits most, and when you may be better off without one.',
    intro: 'A battery lets you use more of your own solar in the evening, but it adds several thousand pounds and often pays back slowly. Whether it is worth it depends on how and when you use electricity.',
    readMins: 6,
    updated: '2026-10',
    related: ['smart-export-guarantee', 'solar-panels-and-electric-cars', 'how-to-compare-solar-quotes'],
    cta: 'battery',
    body: [
      { t: 'h2', x: 'What a battery does' },
      { t: 'p', x: 'A home battery stores electricity so you can use it later. It can hold spare solar from the afternoon for use in the evening, or it can charge from the grid when electricity is cheap, on a time-of-use tariff, and discharge when it is expensive. It does not generate anything itself. Capacity is measured in kilowatt-hours (kWh), and what matters is the usable figure, not the headline one. Typical home batteries are roughly 5 to 13 kWh.' },
      { t: 'h2', x: 'What batteries cost' },
      { t: 'table', head: ['Battery size (usable)', 'Typical installed price'], rows: [
        ['About 5 kWh', '£2,500 to £5,500'],
        ['About 10 kWh', '£4,000 to £8,000'],
        ['13 kWh or more', '£7,000 to £11,500']
      ] },
      { t: 'note', x: 'These are indicative UK ranges for autumn 2026 and vary by brand, installer and whether the battery is fitted alongside new panels. Check current figures. The 0% VAT rate on installing batteries is due to end on 31 March 2027, after which 5% is due to apply, according to [[https://www.gov.uk/guidance/vat-on-energy-saving-materials-and-heating-equipment-notice-7086|GOV.UK]].' },
      { t: 'p', x: 'Warranties are commonly around 10 years, typically guaranteeing a stated share of capacity, often 60 to 80 per cent, at the end. Check the terms, including any limit on cycles or total energy throughput.' },
      { t: 'h2', x: 'How the saving works' },
      { t: 'p', x: 'Each kWh you store and use later is worth the difference between the price you avoid paying for imported electricity and the export payment you would otherwise have received. The lower the export rate, the more each stored kWh is worth. But the amount of energy a battery can shift in a year is limited by its size and by how much surplus your panels produce.' },
      { t: 'p', x: 'An illustration, not a forecast: suppose a 5 kWh battery shifts about 1,200 kWh a year. If you avoid paying 25p per kWh that you would otherwise have exported at 5p, each kWh is worth about 20p, or around £240 a year. Against a price of £3,500 to £4,500, that is a payback of roughly 15 to 19 years, longer than a typical warranty. If the export rate were 15p, the gap would be only 10p a kWh and the saving about half. Real figures depend on your tariff, your usage and the battery’s efficiency, which loses some energy on each cycle.' },
      { t: 'h2', x: 'When a battery makes more sense' },
      { t: 'ul', items: [
        '**You use most of your electricity in the evening and overnight,** and are out during the day, so there is a large solar surplus to store.',
        '**You are on a time-of-use import tariff** with a big gap between cheap and peak prices, so the battery can earn money in winter when solar is weak.',
        '**You have an electric car or heat pump,** which raise your overall demand. See our guide to [[/guides/solar-panels-and-electric-cars|solar, electric cars and heat pumps]].',
        '**A variable export tariff pays more at peak times,** letting you sell stored energy when it is most valuable. Check how such tariffs work in our [[/guides/smart-export-guarantee|SEG guide]].',
        '**You value backup power.** Not every battery provides it, so check that it is included and what it can run.'
      ] },
      { t: 'h2', x: 'When to skip one, or wait' },
      { t: 'ul', items: [
        'You are home most of the day and already use most of your solar directly.',
        'Your evening and overnight use is small, so you would rarely fill or empty the battery.',
        'The payback is longer than the warranty and you would rather spend the money elsewhere.',
        'You are unsure. A battery can usually be added later, and installing a battery-ready inverter now keeps that option open. Fitting it with the panels can be cheaper, but it is not essential.'
      ] },
      { t: 'h2', x: 'Questions to ask before you buy' },
      { t: 'ol', items: [
        'What is the usable capacity, and what is the maximum power output in kW?',
        'What is the warranty, in years, cycles and retained capacity?',
        'Is it AC-coupled or DC-coupled, and does that suit my existing inverter?',
        'Where will it be installed, and does that location meet safety guidance?',
        'Does it include backup power, and will it need a grid connection application beyond a simple notification?'
      ] },
      { t: 'p', x: 'If you want to see what a battery might do for your own usage, explore our [[/battery-storage|battery storage]] pages, or [[/battery-quote|request battery quotes]] and compare what is offered.' }
    ]
  },

  {
    slug: 'how-to-compare-solar-quotes',
    title: 'How to compare solar quotes: what to check and what to ignore',
    description: 'A practical checklist for comparing UK solar panel quotes: system size, equipment, warranties, MCS, savings claims and the red flags to watch for.',
    intro: 'Two solar quotes can look similar and still differ by thousands of pounds in what you actually get. A short checklist makes them comparable.',
    readMins: 6,
    updated: '2026-10',
    related: ['mcs-certification-explained', 'how-much-do-solar-panels-cost', 'solar-panel-installation-process'],
    cta: 'quotes',
    body: [
      { t: 'h2', x: 'Get three like-for-like quotes' },
      { t: 'p', x: 'Aim for at least three written quotes from MCS-certified installers, each based on a proper survey of your roof rather than a guess from a satellite image alone. Ask all of them to quote for similar equipment and a similar system size, or at least to explain the differences. If one quote is much cheaper, find out what it leaves out.' },
      { t: 'h2', x: 'The checklist' },
      { t: 'table', head: ['What to compare', 'What to look for'], rows: [
        ['System size', 'Total kWp and the number and wattage of panels'],
        ['Panel make and model', 'Named products, with product and performance warranties; 25 years or more of performance cover is common'],
        ['Inverter', 'Make, model, type (string, micro or optimiser) and warranty; 10 to 15 years is common'],
        ['Scaffolding', 'Included in the price or an extra'],
        ['Generation estimate', 'Annual kWh, with the roof direction, pitch and shading assumptions stated'],
        ['Battery', 'Usable kWh, power output in kW and warranty, if included'],
        ['Workmanship cover', 'Length of warranty and what protects it if the installer stops trading'],
        ['VAT', 'Whether 0% is assumed and how a deadline would be treated'],
        ['Payment terms', 'Deposit size, staged payments and what protects your deposit']
      ] },
      { t: 'p', x: 'Compare the price per kWp as a rough guide only, because it ignores differences in quality, roof complexity and extras. Our guide to [[/guides/how-much-do-solar-panels-cost|solar panel costs]] gives typical ranges.' },
      { t: 'h2', x: 'Ask about life after installation' },
      { t: 'p', x: 'A good quote tells you what happens when something goes wrong, not only what is fitted on day one. Ask each installer:' },
      {
        t: 'ul',
        items: [
          'Will their own employees do the work, or subcontractors, and who is responsible for it?',
          'Which route applies for the grid connection, G98 or G99, and who handles it?',
          'If the inverter fails in year six, who do I call, how quickly will it be fixed, and what would a replacement cost?',
          'Is monitoring included, and who looks at it if output drops?'
        ]
      },
      { t: 'h2', x: 'Treat savings claims with care' },
      { t: 'p', x: 'Every quote will have a savings figure, and these vary because they rest on assumptions. Ask what they assume for annual generation, for how much you use yourself, for your electricity unit price, for the export rate and for energy-price rises. A payback figure that assumes high prices and high self-use may look good but is not a promise. A fair generation estimate is typically based on MCS-style regional data for your roof direction, pitch and shading.' },
      { t: 'note', x: 'Be wary of any quote that shows large savings with no stated assumptions, or one that quotes higher generation than the same roof would typically give. If your quotes disagree, ask each installer to explain the gap.' },
      { t: 'h2', x: 'Check the paperwork' },
      {
        t: 'ul',
        items: [
          '**MCS certification.** The installer should be MCS certified, and the system should receive an MCS certificate. Without it you typically cannot get SEG payments. See our [[/guides/mcs-certification-explained|MCS guide]].',
          '**Consumer protection.** Ask which consumer code or financial protection product covers your contract and deposit. The [[https://www.recc.org.uk/consumers|Renewable Energy Consumer Code]] is one example. The MCS requirements here have been changing in 2026, so ask what applies to your installer.',
          '**Insurance and registration.** Ask for evidence of public liability insurance and of the installer’s electrical competence.',
          '**The contract.** Check the scope of work, price, start date, cancellation terms and who handles the grid connection.'
        ]
      },
      { t: 'h2', x: 'Red flags' },
      {
        t: 'ul',
        items: [
          'Pressure to sign today or a discount that vanishes tomorrow.',
          'Cold calls or doorstep visits claiming to represent a government scheme.',
          '“Free” panels, rent-a-roof deals, or finance where you cannot see the total amount repayable.',
          'No MCS number, no written survey, or no clear answer on who will do the work.',
          'A large deposit, or being asked to pay in full before the work is done.'
        ]
      },
      { t: 'p', x: 'MCS publishes advice on [[https://mcscertified.com/consumers/be-scam-aware/|spotting scams]]. If finance is offered, compare the total you will repay, not just the monthly figure.' },
      { t: 'h2', x: 'Narrowing it down' },
      { t: 'ol', items: [
        'Remove any quote that lacks an MCS certification route, named equipment or a clear scope.',
        'Line up the rest in a table using the checklist above.',
        'Ask each installer the same two or three questions and see how clearly they answer.',
        'Check reviews and recent work you can verify yourself, and ask to speak to a recent customer if you can.',
        'Choose on value and confidence, not on the lowest headline price.'
      ] },
      { t: 'p', x: 'If you would like help collecting comparable quotes, our [[/how-it-works|how it works]] page explains the process and our [[/methodology|methodology]] explains how we approach it. You can also browse [[/installers|installers]] directly.' }
    ]
  },

  {
    slug: 'mcs-certification-explained',
    title: 'MCS certification explained: what it is and why it matters',
    description: 'What MCS certification means for UK solar installs, why it matters for Smart Export Guarantee payments, and how to check an installer and certificate.',
    intro: 'MCS certification is the quality mark behind most UK solar installations, and the key to receiving export payments. Here is what it covers and how to check it.',
    readMins: 5,
    updated: '2026-10',
    related: ['smart-export-guarantee', 'how-to-compare-solar-quotes', 'solar-panel-installation-process'],
    cta: 'quotes',
    body: [
      { t: 'h2', x: 'What MCS is' },
      { t: 'p', x: 'The Microgeneration Certification Scheme (MCS) is the UK standards scheme for small-scale renewable energy, including solar panels, batteries and heat pumps. It is owned by the MCS Charitable Foundation. Installers can be MCS certified, which means they have been assessed against its standards for design, installation and handover, and an installation can be MCS certified once it has been completed and registered.' },
      { t: 'p', x: 'The scheme also sets expectations for the equipment itself, so installers are expected to use products that meet MCS product requirements. In short, MCS looks at the installer, the products and the finished installation.' },
      { t: 'p', x: 'MCS certification is not a legal requirement for installing solar. But many things that homeowners care about depend on it, as the next section explains.' },
      { t: 'h2', x: 'Why it matters to you' },
      { t: 'ul', items: [
        '**Export payments.** To receive Smart Export Guarantee payments, a solar system up to 50kW typically needs to be MCS certified, or certified to an accepted equivalent. See our [[/guides/smart-export-guarantee|SEG guide]].',
        '**Standards.** Certified installers must follow the scheme’s requirements for system design, equipment and handover information.',
        '**Grants.** Some government schemes require an MCS-certified installer. The [[https://www.ofgem.gov.uk/environmental-and-social-schemes/boiler-upgrade-scheme-bus|Boiler Upgrade Scheme]] for heat pumps in England and Wales is one example.',
        '**Recourse.** MCS has its own complaints route if something goes wrong with a certified installer.',
        '**Paperwork when you sell.** A buyer’s solicitor may ask for the certificate, warranties and grid connection documents, so keep them together.'
      ] },
      { t: 'h2', x: 'Two things called MCS' },
      { t: 'p', x: 'People often mix up two separate things. The first is the installer’s company certification, which you can check on the MCS website. The second is the MCS certificate for your installation, which is created by the installer and registered on the MCS database after your system has been commissioned. It typically records the system size, equipment, installer and commissioning date for your address.' },
      { t: 'p', x: 'The time allowed for an installer to register the certificate after commissioning has recently been extended under MCS’s redeveloped scheme, so ask your installer when to expect it. Keep a copy, because you will need its number when you apply for a SEG tariff.' },
      { t: 'h2', x: 'What is changing in 2026' },
      { t: 'p', x: 'MCS has been redeveloping how it assesses installers and protects consumers. Under the new approach, as we understand it, installers have to buy an MCS-approved financial protection product on behalf of each customer, giving cover for several years if the installer cannot put a problem right, and membership of a consumer code is no longer mandatory. Details are still bedding in.' },
      { t: 'note', x: 'These changes are recent, so check the current position on the MCS website rather than relying on this summary. Ask any installer exactly what protection you would get, for how long, and what you would need to do to claim.' },
      { t: 'h2', x: 'How to check an installer and a certificate' },
      { t: 'ol', items: [
        'Ask for the installer’s MCS certification number before you request a survey.',
        'Search for them in the installer finder on the [[https://mcscertified.com/consumers/technologies/solar-photovoltaic-pv/|MCS solar panel page]] and check the details match the company on your quote.',
        'After installation, ask for your MCS certificate and keep a copy with your warranties.',
        'If you are unsure whether a certificate exists for your property, MCS explains how to [[https://mcscertified.com/consumers/mcs-certificate-queries/|check or request one]].',
        'If the installer has stopped trading, MCS says it can help you obtain a copy of the certificate.'
      ] },
      { t: 'h2', x: 'What MCS does not guarantee' },
      { t: 'ul', items: [
        'It does not guarantee the cheapest price, or that solar is right for your home.',
        'It is not a substitute for reading the contract, the warranty and the cancellation terms.',
        'It does not replace electrical safety paperwork. Your installer should also provide testing and electrical installation documents.',
        'It does not tell you how a particular installer treats customers day to day. Ask for references and recent work.'
      ] },
      { t: 'p', x: 'If an installer is not MCS certified, ask why, and ask what you would lose. For a normal grid-connected home you will usually give up the ability to claim export payments. Our guide to [[/guides/how-to-compare-solar-quotes|comparing solar quotes]] covers what else to check. Installers who want to work with us can start on our [[/for-installers|page for installers]].' }
    ]
  },

  {
    slug: 'solar-panels-and-electric-cars',
    title: 'Solar panels with an electric car or heat pump: what to expect',
    description: 'How much of an electric car or heat pump a UK solar system can realistically cover, why winter is the catch, and what chargers and tariffs can add.',
    intro: 'Solar can take a real bite out of the cost of running an electric car or a heat pump, but it will not cover all of it. The mismatch between sunshine and demand is the main reason.',
    readMins: 6,
    updated: '2026-10',
    related: ['are-solar-batteries-worth-it', 'how-much-do-solar-panels-cost', 'is-my-roof-suitable-for-solar'],
    cta: 'calculator',
    body: [
      { t: 'h2', x: 'The catch: when you generate and when you need power' },
      { t: 'p', x: 'UK solar panels produce most of their electricity from late spring to early autumn, and during daylight hours. Electric cars are often charged at night, and heat pumps do most of their work in winter. The gap between those patterns is why solar rarely covers all of either. It also explains why batteries and time-of-use tariffs often feature alongside solar in these homes.' },
      { t: 'h2', x: 'Charging an electric car from solar' },
      { t: 'p', x: 'Electric cars typically travel roughly three to four miles per kWh, depending on the model and driving. As an example, someone driving 7,000 miles a year would need about 1,750 to 2,300 kWh of electricity. A 4 kWp system generates around 3,800 kWh a year, so on paper that looks enough, but most of it arrives in summer and during the day, when your car may be elsewhere.' },
      { t: 'p', x: 'In practice, solar tends to cover a useful part of a car’s charging, not all of it. It works best if the car is often at home during the day, for example if you work from home or charge at weekends. In the depths of winter there is usually little surplus solar left once the house itself has used what it needs.' },
      { t: 'ul', items: [
        '**A solar-aware charger** can charge from surplus solar only, adjusting its speed as clouds come and go. This reduces how much you export at a low rate and avoids paying for grid power.',
        '**A cheap overnight tariff** handles the rest. For many drivers this does more of the work than solar does.',
        '**A battery** can store daytime surplus for evening charging, but a typical home battery holds only part of a car’s needs.'
      ] },
      { t: 'h2', x: 'Heat pumps and solar' },
      { t: 'p', x: 'A heat pump uses electricity to move heat into your home, typically delivering around three units of heat for each unit of electricity it uses. As a rough illustration, a medium-sized home using about 9,500 kWh of gas a year might need something like 2,500 to 3,500 kWh of electricity for a well-run heat pump, depending on insulation and settings. That is about as much again as the rest of the household uses.' },
      { t: 'p', x: 'Solar can cover a good share of that in spring and autumn, and much of the hot water in summer if you have a cylinder that can store the heat. In mid-winter, when demand is highest, solar output is low and the grid supplies most of it. Treat claims that solar will “run” a heat pump all year with caution.' },
      { t: 'p', x: 'Heat pumps can qualify for a grant. The [[https://www.ofgem.gov.uk/environmental-and-social-schemes/boiler-upgrade-scheme-bus|Boiler Upgrade Scheme]] in England and Wales offers £7,500 off an air-to-water heat pump, with a higher amount for some off-gas-grid homes at the time of writing, through an MCS-certified installer. Solar panels are not part of it. Check current terms on the Ofgem site.' },
      { t: 'h2', x: 'Should you size the system up?' },
      { t: 'p', x: 'If you are adding an electric car or a heat pump, a larger solar system can make sense, because you will use more of what it generates. The limit is usually your roof. Check how much space you have in our [[/guides/is-my-roof-suitable-for-solar|roof guide]]. Also note that a larger or battery-equipped system may need prior approval from your network operator, as we explain in the [[/guides/solar-panel-installation-process|installation guide]].' },
      { t: 'h2', x: 'Putting it together' },
      { t: 'ol', items: [
        'Look at a time-of-use or EV tariff, if it suits your usage. It can do much of the work for a car or heat pump, with or without solar.',
        'Add solar if you have a decent roof, because it reduces what you buy from the grid, particularly from spring to autumn.',
        'Consider a battery last, once you know how much surplus you really have. See [[/guides/are-solar-batteries-worth-it|are solar batteries worth it?]]',
        'Ask your installer to model your expected use of the car and heat pump, and to show their assumptions.'
      ] },
      { t: 'note', x: 'Figures here are illustrations, not forecasts. Your mileage, car, insulation, tariff and weather will change them. Check current tariffs and grant terms before relying on any saving.' },
      { t: 'p', x: 'You can estimate the output of a solar system for your own roof with our [[/solar-calculator|solar calculator]], and compare it against the electricity your car and heat pump would use.' }
    ]
  },

  {
    slug: 'solar-panel-installation-process',
    title: 'Solar panel installation: the process from survey to SEG tariff',
    description: 'What happens when you install solar in the UK: survey, scaffolding, DNO notification (G98 or G99), commissioning, MCS certificate and SEG sign-up.',
    intro: 'A typical UK solar installation takes a day or two on the roof, but several weeks from accepting a quote to finishing the paperwork. Here is each step in order.',
    readMins: 6,
    updated: '2026-10',
    related: ['mcs-certification-explained', 'smart-export-guarantee', 'how-to-compare-solar-quotes'],
    cta: 'quotes',
    body: [
      { t: 'h2', x: 'Step 1: survey and design' },
      { t: 'p', x: 'The installer visits to look at your roof, loft, consumer unit and meter position, and to check shading and roof condition. From that they design the system and produce an estimate of annual generation. This is where details such as panel layout, inverter location and whether you want a battery are settled. A written design and quote should follow. Our guide to [[/guides/how-to-compare-solar-quotes|comparing quotes]] explains how to read it.' },
      { t: 'h2', x: 'Step 2: telling or asking your network operator (DNO)' },
      { t: 'p', x: 'Your local distribution network operator (DNO) manages the local grid and needs to know when a generator connects to it. There are two routes.' },
      { t: 'ul', items: [
        '**G98 (notify after installation).** For systems up to 16 amps per phase, which is 3.68kW on a normal single-phase home supply. The installer fits the system and then notifies the DNO, typically within 28 days. No approval is needed first.',
        '**G99 (apply before installation).** For systems above that limit. The installer must apply to the DNO and wait for approval before connecting. A simple case may be quick, but complex or constrained networks can take several weeks or more, and the DNO may impose an export limit.'
      ] },
      { t: 'p', x: 'In practice the limit is usually set by the inverter’s rated output rather than the panel capacity, so an installer may pair a larger array with a 3.68kW inverter to stay within G98. Batteries and other generation at the same property can count towards the total, so ask your installer which route applies and how they worked it out. In most cases they handle the application or notification for you.' },
      { t: 'h2', x: 'Step 3: scaffolding and installation' },
      { t: 'p', x: 'Scaffolding is normally erected for safe roof access, and costs commonly run to a few hundred pounds. Check whether it is in your quote. Installation on a typical home usually takes one to three days.' },
      { t: 'ul', items: [
        'Roof fixings are attached to the rafters, with the mounting rails and panels fixed on top.',
        'Cables run from the roof to the inverter, usually in the loft or a garage.',
        'An electrician connects the inverter to your consumer unit, with isolators and labelling, and fits a battery if you are having one.',
        'The scaffolding comes down, usually after the installer has tidied up.'
      ] },
      { t: 'h2', x: 'Step 4: commissioning and handover' },
      { t: 'p', x: 'Once built, the installer tests and commissions the system, sets the inverter up for the grid, and connects it to monitoring. They should show you how to read the display or app, and how to isolate the system safely. You should be given a handover pack, typically including electrical test certificates, the DNO notification, warranties, manuals and your estimated performance.' },
      { t: 'h2', x: 'Step 5: MCS certificate and SEG sign-up' },
      { t: 'p', x: 'After commissioning, the installer registers the installation and creates your MCS certificate. Ask for a copy. See our [[/guides/mcs-certification-explained|MCS guide]] for what it is and why it matters, or MCS’s own page on [[https://mcscertified.com/consumers/mcs-certificate-queries/|certificate queries]] if you are unsure whether yours has been registered.' },
      { t: 'p', x: 'You then choose a Smart Export Guarantee tariff, using your MCS certificate number and meter details. Your meter must record export in half-hour intervals, which in practice means a smart meter. Our [[/guides/smart-export-guarantee|SEG guide]] explains how to compare tariffs. Also tell your home insurer, and your mortgage lender if the terms require it.' },
      { t: 'h2', x: 'A typical timeline' },
      { t: 'table', head: ['Stage', 'Typical time'], rows: [
        ['Survey and written quote', 'A few days to two weeks after you enquire'],
        ['Contract, deposit and cancellation period', 'Days; check your cancellation rights in the contract'],
        ['DNO application (G99 only)', 'A few weeks, sometimes longer'],
        ['Waiting for an installation slot', 'Commonly two to six weeks, depending on the installer’s diary'],
        ['Installation on site', 'One to three days'],
        ['Commissioning and handover', 'Usually on the same day as completion'],
        ['MCS certificate', 'Typically within days to a few weeks'],
        ['SEG sign-up', 'Depends on the supplier; allow a few weeks']
      ] },
      { t: 'note', x: 'These times are indicative, not guarantees. A straightforward G98 job often runs from accepted quote to working system in roughly four to eight weeks, but busy periods and G99 applications can add to this. Ask your installer for a dated plan.' },
      { t: 'p', x: 'To get started, see how [[/how-it-works|Roofworth works]] or browse [[/installers|installers]]. If you want to check the numbers first, try the [[/solar-calculator|solar calculator]].' }
    ]
  }
];
