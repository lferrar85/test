export const site = {
  name: "GoSolarCompare",
  tagline: "Better solar. Better choices. A greener future.",
  description:
    "GoSolarCompare is an independent UK solar comparison platform. Compare approved solar installers, find the right solution for your home and discover how much you could save.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gosolarcompare.co.uk",
  email: "hello@gosolarcompare.co.uk",
  // Set NEXT_PUBLIC_DEMO_MODE=false once real installer data and integrations exist.
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE !== "false",
} as const;

export const nav = {
  primary: [
    { label: "How it works", href: "/how-it-works" },
    {
      label: "Solutions",
      href: "/solar-panels",
      children: [
        { label: "Solar panels", href: "/solar-panels", blurb: "Generate your own clean electricity" },
        { label: "Battery storage", href: "/battery-storage", blurb: "Store daytime energy for the evening" },
        { label: "EV chargers", href: "/ev-chargers", blurb: "Charge at home on your own power" },
        { label: "Heat pumps", href: "/heat-pumps", blurb: "Low-carbon heating for your home" },
      ],
    },
    { label: "Approved installers", href: "/approved-installers" },
    { label: "Tree promise", href: "/tree-planting" },
    { label: "Why us", href: "/why-choose-us" },
  ],
  footer: {
    compare: [
      { label: "Compare solar", href: "/compare" },
      { label: "Solar panels", href: "/solar-panels" },
      { label: "Battery storage", href: "/battery-storage" },
      { label: "EV chargers", href: "/ev-chargers" },
      { label: "Heat pumps", href: "/heat-pumps" },
    ],
    company: [
      { label: "About us", href: "/about" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Why choose us", href: "/why-choose-us" },
      { label: "Tree-planting promise", href: "/tree-planting" },
      { label: "Contact us", href: "/contact" },
    ],
    installers: [
      { label: "Approved installers", href: "/approved-installers" },
      { label: "Become an installer", href: "/installers/apply" },
      { label: "Our approval process", href: "/approved-installers#process" },
    ],
    legal: [
      { label: "FAQs", href: "/faqs" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms and conditions", href: "/terms" },
    ],
  },
};
