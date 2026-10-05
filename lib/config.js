// Site-wide settings. Override with environment variables in production.
export const SITE = {
  name: process.env.SITE_NAME || 'Roofworth',
  tagline: 'What is your roof worth?',
  url: (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  email: process.env.CONTACT_EMAIL || 'hello@roofworth.example',
  company: process.env.COMPANY_NAME || '[COMPANY LEGAL NAME]',
  companyNumber: process.env.COMPANY_NUMBER || '[COMPANY NUMBER]',
  address: process.env.COMPANY_ADDRESS || '[REGISTERED OFFICE ADDRESS]',
  ico: process.env.ICO_NUMBER || '[ICO REGISTRATION NUMBER]',
  // Bump when the wording of the consent checkbox changes; stored with every lead.
  consentVersion: '2026-10-v1',
  // Off by default: looking up a place name sends the postcode to postcodes.io from the
  // visitor's browser. If you turn it on, say so in the privacy notice.
  postcodeLookup: process.env.POSTCODE_LOOKUP === '1',
};

export const FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&family=Barlow+Condensed:wght@600;700;800&display=swap';
