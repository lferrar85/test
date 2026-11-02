import type { SolutionContent } from "@/components/pages/SolutionPage";

export const solarPanels: SolutionContent = {
  key: "solar",
  eyebrow: "Solar panels",
  title: <>Make your roof <span className="text-solar">work for you.</span></>,
  lead: "Solar panels turn daylight into electricity you can use at home, store, or export. Compare approved installers and get quotes designed around your roof, not an average one.",
  interest: "solar",
  intro: [
    { heading: "How home solar works", body: "Panels on your roof generate direct current whenever there's daylight. An inverter converts it to the alternating current your home uses. Anything you don't use is exported to the grid, and many suppliers will pay you for it through an export tariff." },
    { heading: "What you'll typically be quoted for", body: "A domestic system is usually between 3 and 6 kWp, made up of 8 to 16 panels, an inverter, mounting hardware, electrical work, scaffolding and registration paperwork. Your quotes should itemise these, and we encourage you to compare like with like." },
    { heading: "Winter, clouds and British weather", body: "Panels generate from daylight, not heat, so they work on overcast days at reduced output. Annual generation estimates already account for the seasons. A south-facing, unshaded roof is ideal, but east and west roofs perform well too." },
  ],
  goodFit: ["You own your home and plan to stay for several years", "You have a roof face pointing roughly south, east or west", "Your roof is in good condition with limited shading", "You use electricity during the day, or plan to add a battery", "You'd like to reduce exposure to energy price rises"],
  costFactors: [
    { title: "System size", body: "More panels, more generation, higher cost. Installers size systems to your roof and usage." },
    { title: "Panel and inverter choice", body: "Premium panels and hybrid inverters cost more but may offer higher efficiency or longer warranties." },
    { title: "Roof access", body: "Scaffolding, roof height, pitch and material all affect labour time and cost." },
    { title: "Electrical work", body: "Consumer unit upgrades or long cable runs add to the installation cost." },
    { title: "Battery storage", body: "Adding a battery typically increases the project cost significantly but raises self-consumption." },
    { title: "Location", body: "Labour rates vary across the UK, which is one reason to compare local approved installers." },
  ],
  installerChecks: ["Roof orientation, pitch and shading through the day", "Roof structure, condition and remaining lifespan", "Your annual electricity usage and daytime pattern", "Space for the inverter and route for cabling", "Your consumer unit and earthing arrangement", "Grid connection limits and any DNO notification needed", "Scaffolding and safe access", "Export tariff eligibility and paperwork"],
  faqs: [
    { q: "How long do solar panels last?", a: "Most panels carry a 25-year product warranty and a performance warranty guaranteeing a percentage of original output after 25 to 30 years. Inverters are usually warranted for 10 to 12 years and may need replacing once during the system's life." },
    { q: "Do I need planning permission?", a: "Most domestic roof installations in the UK fall under permitted development. Listed buildings, conservation areas and flat-roof installations above certain heights can need permission. Your installer should advise, and approved installers are expected to." },
    { q: "Will I be paid for exported electricity?", a: "Many energy suppliers offer export tariffs. Eligibility often requires an installation by a certified installer and a smart meter. Rates vary between suppliers, so it's worth comparing those too." },
    { q: "Do solar panels need maintenance?", a: "Very little. Rain keeps them reasonably clean in most of the UK. An occasional visual check and a periodic professional inspection is sensible, and monitoring apps will show you if output drops unexpectedly." },
  ],
  ctaHeadline: "Ready to see what your roof could do?",
};

export const batteryStorage: SolutionContent = {
  key: "battery",
  eyebrow: "Battery storage",
  title: <>Use your own energy <span className="text-solar">after dark.</span></>,
  lead: "A home battery stores electricity from your solar panels, or from cheap off-peak tariffs, so you can use it when you need it. Compare approved installers for battery-only or solar-and-battery systems.",
  interest: "battery",
  intro: [
    { heading: "Why pair a battery with solar", body: "Without storage, much of a typical home's solar generation is exported during the day while you buy electricity back in the evening. A battery shifts that energy to when you actually use it, increasing self-consumption." },
    { heading: "Batteries without solar", body: "Batteries can also charge from the grid on cheap overnight tariffs and discharge at peak times. Whether that stacks up depends on your tariff, usage and the battery's cost, so ask installers to model it honestly." },
    { heading: "Capacity, power and cycles", body: "Capacity (kWh) is how much a battery stores; power (kW) is how fast it can deliver it. Most homes install 5 to 15 kWh. Warranties are usually expressed in years and in total energy throughput or cycles." },
  ],
  goodFit: ["You have, or are adding, solar panels", "You use most of your electricity in the evening", "You're on, or could move to, a time-of-use tariff", "You have an EV or plan to get one", "You want some resilience during power cuts (ask about backup capability)"],
  costFactors: [
    { title: "Capacity", body: "Larger batteries cost more. Oversizing wastes money; undersizing limits benefit. Installers should size to your usage." },
    { title: "Chemistry and brand", body: "Most modern home batteries are lithium iron phosphate. Brands differ in warranty, efficiency and app quality." },
    { title: "Hybrid or AC-coupled", body: "Retrofitting to existing solar often uses an AC-coupled battery; new systems may use a hybrid inverter." },
    { title: "Backup capability", body: "Powering circuits during an outage needs extra hardware and configuration." },
    { title: "Location and mounting", body: "Garage, utility room or external wall affect installation complexity and any enclosure needs." },
    { title: "Electrical upgrades", body: "Some installs require consumer unit changes or additional protection devices." },
  ],
  installerChecks: ["Your half-hourly or typical usage pattern", "Existing solar system and inverter compatibility", "Suitable, ventilated, accessible location", "Tariff options and expected charging strategy", "Consumer unit capacity and protection", "Grid notification requirements for export", "Whether backup during outages is wanted and feasible", "Fire safety guidance for the chosen location"],
  faqs: [
    { q: "Do I need a battery to have solar?", a: "No. Solar works without a battery; you'll simply export more. A battery is an addition that can increase self-consumption, and whether it's worthwhile depends on your usage and tariff." },
    { q: "How long do home batteries last?", a: "Typical warranties are 10 years, often with a guaranteed remaining capacity at the end of the term. Real lifespan depends on how hard the battery is cycled." },
    { q: "Can a battery power my home in a power cut?", a: "Only if it's installed with backup capability, which not every system has by default. If this matters to you, say so when comparing quotes." },
    { q: "Is VAT charged on batteries?", a: "At the time of writing, qualifying battery storage installations in the UK benefit from a 0% VAT rate. Tax rules change, so ask your installer to confirm what applies to your quote." },
  ],
  ctaHeadline: "Ready to keep more of your own energy?",
};

export const evChargers: SolutionContent = {
  key: "ev",
  eyebrow: "EV chargers",
  title: <>Charge at home. <span className="text-solar">On your terms.</span></>,
  lead: "A home charge point is the cheapest and most convenient way to run an electric car, especially combined with solar or an off-peak tariff. Compare approved installers near you.",
  interest: "ev-charger",
  intro: [
    { heading: "Why install a dedicated charger", body: "A dedicated 7 kW charge point charges most EVs fully overnight and is safer than a standard socket. Smart chargers can schedule charging for cheap tariff windows or to soak up surplus solar." },
    { heading: "Solar-aware charging", body: "Some chargers can divert excess solar generation into your car instead of exporting it. If you have or plan solar panels, ask installers whether the charger supports this and how it's configured." },
    { heading: "Regulations", body: "UK regulations require new home chargers to have smart functionality. Installation is notifiable electrical work, which is why we require approved installers for this technology to hold a recognised electrical registration." },
  ],
  goodFit: ["You have off-street parking", "You own an EV or plug-in hybrid, or one is on the way", "You're on, or could move to, an EV tariff", "You have solar and want to charge from surplus", "You'd like charging that works around your routine"],
  costFactors: [
    { title: "Charger model", body: "Tethered or untethered, solar-aware, load balancing and app features all affect price." },
    { title: "Cable run", body: "Distance from your consumer unit to the parking spot drives labour and materials." },
    { title: "Electrical capacity", body: "Some homes need a supply fuse check, earthing upgrade or new protective devices." },
    { title: "Groundworks", body: "Routing cable under paths or driveways adds cost." },
    { title: "Grants", body: "Certain grants exist for flats, renters and landlords. Eligibility changes, so ask installers what currently applies." },
    { title: "Location", body: "Labour rates vary regionally." },
  ],
  installerChecks: ["Parking location and cable route", "Main fuse rating and supply capacity", "Earthing arrangement and need for open-PEN protection", "Consumer unit space and condition", "Wi-Fi or mobile signal for smart features", "Your tariff and preferred charging schedule", "Future-proofing for a second vehicle", "DNO notification or approval"],
  faqs: [
    { q: "Can I charge my EV from solar panels?", a: "Yes, if the charger supports solar diversion or scheduling. How much of your charging solar can cover depends on when the car is at home and your system size." },
    { q: "How fast is a home charger?", a: "Most homes install 7 kW single-phase units, adding roughly 25 to 30 miles of range per hour. Three-phase properties can support faster units." },
    { q: "Do I need permission?", a: "Home chargers are generally permitted development in the UK. Rented and leasehold properties may need the owner's consent." },
  ],
  ctaHeadline: "Ready to plug in at home?",
};

export const heatPumps: SolutionContent = {
  key: "heat-pump",
  eyebrow: "Heat pumps",
  title: <>Low-carbon heat, <span className="text-solar">designed properly.</span></>,
  lead: "An air source heat pump replaces a gas or oil boiler with efficient electric heating and hot water. Design quality makes or breaks the result, which is why we only approve installers who hold the right certifications.",
  interest: "heat-pump",
  intro: [
    { heading: "How a heat pump works", body: "A heat pump extracts heat from outside air, even in winter, and upgrades it to heat your home and hot water. For every unit of electricity it uses, it typically delivers around three units of heat." },
    { heading: "Design matters more than brand", body: "A heat pump runs at lower temperatures than a boiler, so radiator sizing, pipework and insulation need checking. A room-by-room heat loss calculation is the foundation of a good installation. Expect every approved installer to do one." },
    { heading: "Support schemes", body: "Government schemes in Great Britain can contribute towards the cost of replacing a fossil fuel boiler with a heat pump installed by a certified installer. Scheme rules and amounts change, so ask installers to confirm current eligibility." },
  ],
  goodFit: ["You want to move away from gas or oil heating", "Your home is reasonably well insulated, or you're willing to improve it", "You have outside space for the unit and room for a hot water cylinder", "You're replacing a boiler in the next few years anyway", "You have or plan solar and want to run heating on it"],
  costFactors: [
    { title: "Heat loss and unit size", body: "The larger the heat demand, the bigger (and costlier) the heat pump." },
    { title: "Radiator and pipework changes", body: "Some radiators may need upsizing for low-temperature running." },
    { title: "Hot water cylinder", body: "Most installs need a cylinder; space and plumbing affect cost." },
    { title: "Insulation improvements", body: "Loft or cavity wall insulation can reduce the system size needed." },
    { title: "Electrical supply", body: "Supply capacity and a dedicated circuit are required." },
    { title: "Grants", body: "Eligible installations may attract a grant that reduces the upfront price." },
  ],
  installerChecks: ["Room-by-room heat loss calculation", "Insulation levels and fabric improvements", "Radiator sizes and flow temperatures", "Space for the outdoor unit and noise considerations", "Hot water cylinder location", "Electrical supply capacity", "Planning or permitted development conditions", "Scheme eligibility and paperwork"],
  faqs: [
    { q: "Do heat pumps work in cold weather?", a: "Yes. They are widely used in colder climates than the UK. Efficiency falls as outside temperatures drop, which good design accounts for." },
    { q: "Will my bills go down?", a: "It depends on the efficiency achieved and the relative price of electricity and gas. A well-designed system can be comparable or cheaper to run than a gas boiler; a poorly designed one can cost more. Design quality is everything." },
    { q: "Are heat pumps noisy?", a: "Modern units are generally quiet, similar to a fridge at a few metres. Placement and permitted development noise limits are part of the design." },
  ],
  ctaHeadline: "Ready to heat your home differently?",
};
