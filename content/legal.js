// Roofworth legal page templates.
// TEMPLATE DRAFTS: must be reviewed by a qualified UK solicitor before launch.
// Block types: p, h2, h3, ul, ol, note, table.
// Inline markup in any text: **bold** and [[/path|label]] links.
// Square-bracket placeholders (e.g. [COMPANY LEGAL NAME]) must be replaced before launch.

const DRAFT_NOTE = 'Template draft — must be reviewed by a qualified UK solicitor before the site goes live.';

const privacy = {
  title: 'Privacy policy',
  description: 'How Roofworth collects, uses, shares and protects your personal information, and the rights you have under UK data protection law.',
  updated: '2026-10',
  body: [
    { t: 'note', x: DRAFT_NOTE },
    {
      t: 'p',
      x: 'This policy explains what personal information Roofworth collects, why we collect it, who sees it and what rights you have. We have tried to write it in plain English. It applies to the Roofworth website and to the quote request, battery quote, contact and installer application forms on it.'
    },

    { t: 'h2', x: 'The short version' },
    {
      t: 'ul',
      items: [
        '**The calculator works in your browser.** What you enter is processed on your device and is not sent to our server unless you choose to request quotes.',
        '**If you request quotes, we pass your details to up to three installers** matched to your area. They are named on the form before you submit it, and we share your details with them only if you give your consent and submit the form.',
        '**Those installers then deal with you in their own right**, as independent controllers of your information, under their own privacy notices.',
        '**We use no advertising or analytics cookies and no third-party trackers**, and we send no marketing emails beyond the quotes process.',
        '**You can withdraw your consent or ask us to delete your information at any time.**'
      ]
    },

    { t: 'h2', x: 'Who we are' },
    {
      t: 'p',
      x: '**[COMPANY LEGAL NAME]** (company number [COMPANY NUMBER]), whose registered office is at [REGISTERED OFFICE ADDRESS], runs Roofworth. In this policy “Roofworth”, “we”, “us” and “our” mean that company.'
    },
    {
      t: 'p',
      x: 'We are the “data controller” of the personal information described in this policy, which means we decide how and why it is used. We are registered with the Information Commissioner’s Office (ICO) under registration number [ICO REGISTRATION NUMBER]. You can contact us at [CONTACT EMAIL] or through our [[/contact|contact page]].'
    },

    { t: 'h2', x: 'What information we collect and why' },
    {
      t: 'p',
      x: 'The table below sets out what we collect, what we use it for and the legal basis under UK data protection law (the UK GDPR and the Data Protection Act 2018) that allows us to do so.'
    },
    {
      t: 'table',
      head: ['When you', 'What we collect', 'What we use it for', 'Our legal basis'],
      rows: [
        [
          'Use the calculator',
          'Postcode; roof direction, pitch, available space and shading; number of bedrooms or occupants; whether someone is at home during the day; electricity usage or bill; EV and heating details; electricity tariff rates.',
          'Working out your estimate. This happens in your browser. Your answers are kept in your browser’s session storage so the page survives a refresh.',
          'Not applicable to us for this step. This information stays on your device and is not sent to our server (see “What stays in your browser” below).'
        ],
        [
          'Request solar quotes',
          'Your name, email address and phone number; optionally a house number or address line; your best time to call; the calculator inputs and a summary of your result; your consent.',
          'Storing your request and passing it to up to three installers matched to your area, who are named on the form before you submit, so that they can contact you about quotes.',
          'Your consent (UK GDPR Article 6(1)(a)). You can withdraw it at any time.'
        ],
        [
          'Request battery quotes',
          'The same details as for a solar quote request, plus details of your existing system.',
          'The same as for a solar quote request.',
          'Your consent (Article 6(1)(a)). You can withdraw it at any time.'
        ],
        [
          'Send us a message',
          'Your name, email address, any company details you give us and your message.',
          'Replying to you. We use it for nothing else.',
          'Steps taken at your request before entering into a contract (Article 6(1)(b)).'
        ],
        [
          'Apply to become an installer partner',
          'Your name, email address, company details and your message.',
          'Assessing your application and replying to you. We use it for nothing else.',
          'Steps taken at your request before entering into a contract (Article 6(1)(b)).'
        ],
        [
          'Visit the website',
          'Basic technical information needed to deliver the site to you and keep it secure. [CONFIRM BEFORE LAUNCH: list any server or security logs kept, such as IP addresses, and how long they are kept.]',
          'Running the service, fixing faults and protecting it from misuse. We do not use analytics tools to track how you use the site.',
          'Our legitimate interests (Article 6(1)(f)) in running and securing the service.'
        ]
      ]
    },
    {
      t: 'p',
      x: 'You do not have to use the quote forms. Optional fields are marked as optional on the form. We need the other details so that installers can contact you, and we cannot process a request without them.'
    },

    { t: 'h2', x: 'What stays in your browser' },
    {
      t: 'p',
      x: 'When you use the calculator, your answers are processed in your web browser to produce your estimate. They are kept in your browser’s session storage so that the page survives a refresh. Session storage sits on your own device and your browser clears it when you close the tab or window.'
    },
    {
      t: 'p',
      x: '**We do not receive these answers unless you submit a quote request.** If you do, the calculator inputs and a summary of your result are included with your request. Our [[/cookies|cookies page]] explains how to clear session storage yourself.'
    },

    { t: 'h2', x: 'Who we share your information with' },
    { t: 'h3', x: 'Installers you ask to hear from' },
    {
      t: 'p',
      x: 'If you request quotes, we share your request (your contact details, the calculator inputs and result summary and, for battery requests, your existing system details) with up to three installers matched to your area. **The installers are named on the form before you submit it.** We share your details only with them, and only if you give your consent and submit the form.'
    },
    {
      t: 'p',
      x: 'Installers may contact you by phone or email about your request, using the details and best time to call that you gave us.'
    },
    {
      t: 'p',
      x: 'Once an installer has your details, it is an independent data controller for its own dealings with you. It decides how to use your information for that purpose, and its own privacy notice applies. We do not control how an installer uses your information once it has it. [CONFIRM BEFORE LAUNCH: summarise the terms on which installers receive your details, for example that they may use them only to respond to your request.]'
    },
    { t: 'h3', x: 'Our service providers' },
    {
      t: 'p',
      x: 'We use [HOSTING PROVIDER] to host the website and [EMAIL/CRM PROVIDER] to handle email and enquiry records. They act as our “processors”: they handle your information only on our instructions and under a written contract, and not for their own purposes.'
    },
    { t: 'h3', x: 'Anyone else' },
    {
      t: 'p',
      x: 'We do not sell your personal information. We do not share it with anyone else unless the law requires us to, for example under a court order.'
    },

    { t: 'h2', x: 'Where your information is stored' },
    {
      t: 'p',
      x: 'We store personal information in the UK or the European Economic Area (EEA). [CONFIRM BEFORE LAUNCH: confirm where [HOSTING PROVIDER] and [EMAIL/CRM PROVIDER] store data, and whether any provider staff outside the UK or EEA can access it.] If this ever changes and your information is transferred outside the UK, we will make sure a lawful transfer mechanism is in place and update this policy.'
    },

    { t: 'h2', x: 'How long we keep your information' },
    {
      t: 'table',
      head: ['Information', 'How long we keep it'],
      rows: [
        ['Solar and battery quote requests', '12 months from the date you submit them, then deleted or anonymised. If you ask us to delete a request sooner, we will.'],
        ['Messages sent through the contact form', '12 months, then deleted. Sooner if you ask.'],
        ['Installer applications', '[CONFIRM BEFORE LAUNCH: retention period]'],
        ['Technical and security logs', '[CONFIRM BEFORE LAUNCH: retention period, or delete this row if none are kept]'],
        ['Calculator answers in your browser', 'Until you close the tab or window, or clear session storage yourself. We do not hold these.']
      ]
    },
    {
      t: 'p',
      x: 'Installers who receive your request keep your details under their own retention policies. Please ask them directly about those.'
    },

    { t: 'h2', x: 'Cookies and similar technologies' },
    {
      t: 'p',
      x: 'We do not use advertising cookies, analytics cookies or third-party trackers. The calculator uses your browser’s session storage to keep your answers while you use it. Our [[/cookies|cookies page]] has the details. This is our position today. If it changes, we will update this policy and the cookies page, and ask for your consent first where the law requires it.'
    },

    { t: 'h2', x: 'Marketing' },
    {
      t: 'p',
      x: 'We do not send marketing emails. The only messages we send are part of the quotes process or replies to something you sent us. This is our current position, and we will update this policy if it changes.'
    },

    { t: 'h2', x: 'Automated decisions' },
    {
      t: 'p',
      x: 'The calculator produces an estimate by formula, and we match your request to installers in your area. Neither makes a decision about you that has a legal or similarly significant effect, so we do not carry out automated decision-making of that kind.'
    },

    { t: 'h2', x: 'Your rights' },
    { t: 'p', x: 'Under UK data protection law you have the right to:' },
    {
      t: 'ul',
      items: [
        '**Access** the personal information we hold about you and get a copy of it.',
        '**Rectification:** have inaccurate or incomplete information corrected.',
        '**Erasure:** ask us to delete your information in certain circumstances.',
        '**Restriction:** ask us to pause our use of your information in certain circumstances.',
        '**Portability:** receive information you gave us in a structured, commonly used, machine-readable format, or have it sent to another organisation, where we use it on the basis of consent or contract.',
        '**Objection:** object to our use of your information where we rely on legitimate interests.',
        '**Withdraw consent** at any time. This does not affect anything we did with your information before you withdrew it.'
      ]
    },
    {
      t: 'p',
      x: 'To use any of these rights, email [CONTACT EMAIL] or use our [[/contact|contact page]]. We will normally reply within one month and we do not charge a fee. We may need to check who you are before we act on a request.'
    },
    { t: 'h3', x: 'Withdrawing consent or asking us to delete your information' },
    {
      t: 'ol',
      items: [
        'Tell us, by email or through the contact page, that you want to withdraw your consent or have your information deleted. Give the name and email address you used so we can find your request.',
        'We will confirm that it is you, then delete or anonymise your information in our systems.',
        'We will tell the installers who received your details that you have withdrawn consent or asked for deletion. Each installer is an independent controller and keeps its own records, so you may also wish to contact them directly.',
        'Anything held only in your browser can be cleared by you at any time. See our [[/cookies|cookies page]].'
      ]
    },

    { t: 'h2', x: 'How to complain' },
    {
      t: 'p',
      x: 'If you are unhappy with how we have handled your information, please tell us first so that we can put it right. You also have the right to complain to the Information Commissioner’s Office (ICO), the UK’s data protection regulator, at ico.org.uk.'
    },

    { t: 'h2', x: 'Keeping your information secure' },
    {
      t: 'p',
      x: 'We take reasonable technical and organisational steps to protect personal information from loss, misuse and unauthorised access. [CONFIRM BEFORE LAUNCH: summarise the actual measures, for example encryption in transit and restricted access.] No online service can be completely secure, so please take care with what you submit.'
    },

    { t: 'h2', x: 'Children' },
    {
      t: 'p',
      x: 'Roofworth is for adults who own or are responsible for a home. It is not aimed at children and we do not knowingly collect their information.'
    },

    { t: 'h2', x: 'Changes to this policy' },
    {
      t: 'p',
      x: 'We may update this policy from time to time. The date shown on this page tells you when it was last changed. If we make a significant change, such as starting to use analytics, we will say so clearly on the site.'
    },

    { t: 'h2', x: 'Contact us' },
    {
      t: 'p',
      x: '**[COMPANY LEGAL NAME]**, [REGISTERED OFFICE ADDRESS]. Email: [CONTACT EMAIL]. Or use our [[/contact|contact page]]. Related pages: [[/terms|terms of use]] and [[/cookies|cookies]].'
    }
  ]
};

const terms = {
  title: 'Terms of use',
  description: 'The terms for using Roofworth, including how we are paid, what the estimates are and are not, and how we work with installers.',
  updated: '2026-10',
  body: [
    { t: 'note', x: DRAFT_NOTE },
    {
      t: 'p',
      x: 'These terms apply when you use the Roofworth website, the solar calculator, the battery tools and the quote request forms (together, the “service”). Please read them. By using the service you agree to them. If you do not agree, please do not use it.'
    },

    { t: 'h2', x: 'The short version' },
    {
      t: 'ul',
      items: [
        '**Roofworth is free for homeowners. Installers pay us fees for introductions, and that may influence which installers we show you.**',
        '**Our estimates are indicative.** They are not quotes, guarantees or advice.',
        '**We are not an installer, a financial adviser or a credit broker, and we do not carry out surveys.**',
        '**Installers are independent businesses.** If you go ahead, your contract is with them, not with us.',
        '**You do not have to accept any quote.**'
      ]
    },

    { t: 'h2', x: 'Who we are' },
    {
      t: 'p',
      x: 'Roofworth is run by **[COMPANY LEGAL NAME]**, a company registered under company number [COMPANY NUMBER], with its registered office at [REGISTERED OFFICE ADDRESS]. In these terms “Roofworth”, “we”, “us” and “our” mean that company, and “you” means the person using the service.'
    },

    { t: 'h2', x: 'What the service does' },
    { t: 'p', x: 'Roofworth provides:' },
    {
      t: 'ul',
      items: [
        'a calculator that gives an indicative estimate of what solar panels, and optionally a battery, might generate and save for your home;',
        'guides and other information about home solar and battery storage; and',
        'a quote-matching service. If you ask, we pass your details to up to three installers matched to your area, who are named on the form before you submit it, so that they can give you quotes.'
      ]
    },
    {
      t: 'p',
      x: 'To see how this works in more detail, read [[/how-it-works|how it works]] and [[/methodology|our methodology]].'
    },

    { t: 'h2', x: 'How we are paid' },
    {
      t: 'note',
      x: '**Roofworth is free for homeowners.** We never charge you for using the service or for being introduced to an installer. We are paid by installers, who pay us fees for introductions. **This commercial arrangement may influence which installers we show you.**'
    },
    {
      t: 'p',
      x: '[CONFIRM BEFORE LAUNCH: describe how installers are selected and shown, for example that only installers who have agreed to work with us are shown, and whether the fee an installer pays affects whether, or in what order, it is shown.]'
    },
    {
      t: 'p',
      x: 'This means we are not a whole-of-market comparison service. Showing you up to three installers cannot cover every installer in your area, so you should compare quotes from other sources too.'
    },
    {
      t: 'p',
      x: 'You pay nothing to us. If you decide to buy, you pay the installer, and the installer sets its own prices. Installers can find out about working with us on our [[/for-installers|for installers]] page.'
    },

    { t: 'h2', x: 'Estimates are indicative' },
    {
      t: 'p',
      x: 'The calculator’s results are estimates. They are based on the information you enter and on assumptions explained on our [[/methodology|methodology]] page. They are indicative only. They are not a quote or an offer, they are not a guarantee of performance, savings, payback or export income, and they are not a prediction of what an installer will find at your property.'
    },
    {
      t: 'p',
      x: 'Real results depend on things we cannot see or control, including your roof, shading, the equipment fitted, how you use electricity, the weather, energy prices and tariffs, and changes to the law or to incentive schemes. Please do not rely on an estimate alone when deciding whether to buy. Always get a site survey and written quotes from installers.'
    },

    { t: 'h2', x: 'What Roofworth is not' },
    {
      t: 'ul',
      items: [
        '**We are not an installer.** We do not sell, supply or install solar panels, batteries or any other equipment.',
        '**We are not a financial adviser.** Nothing on the service is financial, investment, tax or legal advice, and we do not give planning, building regulation or electrical advice.',
        '**We are not a credit broker.** We do not arrange or offer finance. If an installer offers you finance, that is a separate arrangement between you and the installer or lender, and we are not involved in it.',
        '**We do not carry out surveys.** We do not inspect, measure or design anything at your property, and the service does not replace a survey by an installer.'
      ]
    },

    { t: 'h2', x: 'Installers' },
    {
      t: 'p',
      x: 'Installers are independent businesses. They are not our employees, agents or partners. Any contract for a survey, quote, equipment or installation is between you and the installer, and we are not a party to it.'
    },
    {
      t: 'p',
      x: 'We do not endorse any installer. We do not guarantee the price, quality, safety, timing or workmanship of any installer’s work, or that an installer will respond to your request or be able to help you.'
    },
    { t: 'h3', x: 'The criteria we intend to apply' },
    {
      t: 'p',
      x: 'We intend to work only with installers that meet the criteria below. [CONFIRM BEFORE LAUNCH: confirm these criteria, how they are checked and how often.]'
    },
    {
      t: 'ul',
      items: [
        'MCS certification, for work that is eligible for MCS certification;',
        'membership of a relevant consumer code, such as RECC or HIES, where applicable; and',
        'valid insurance [CONFIRM BEFORE LAUNCH: specify the types and minimum levels of cover required].'
      ]
    },
    {
      t: 'p',
      x: 'These criteria are not an endorsement or a guarantee. An installer’s status can change and we may not know straight away. Before you sign anything, check the installer’s certificates, consumer-code membership and insurance yourself, and read the contract carefully, including the deposit, cancellation and warranty terms.'
    },

    { t: 'h2', x: 'You do not have to accept a quote' },
    {
      t: 'p',
      x: 'You are under no obligation to accept any quote, to speak to any installer or to buy anything. Requesting quotes does not commit you to anything. Installers may contact you after you ask for quotes. If you do not want to go ahead, tell them. You can also withdraw your consent to us at any time. See our [[/privacy|privacy policy]] for how.'
    },

    { t: 'h2', x: 'Your information' },
    {
      t: 'p',
      x: 'Our [[/privacy|privacy policy]] and [[/cookies|cookies page]] explain how we use your information. When you submit a quote request, you agree that we may share it with the installers named on the form.'
    },
    {
      t: 'p',
      x: 'Please make sure the information you give us is accurate, and that you are the homeowner or have the owner’s permission to ask for quotes. Do not give us someone else’s details without their permission.'
    },

    { t: 'h2', x: 'Acceptable use' },
    { t: 'p', x: 'You must not:' },
    {
      t: 'ul',
      items: [
        'give false or misleading information, or details belonging to someone else without their permission;',
        'use the service for anything other than genuinely looking for quotes for a property that you own or are authorised to act for;',
        'use bots, scrapers or other automated means to access or copy the service or its data, or to submit forms in bulk;',
        'interfere with or disrupt the service, probe it for weaknesses, or try to gain unauthorised access to our systems or other people’s information;',
        'use the service to send spam or to share anything unlawful, abusive or misleading; or',
        'use the service in any way that breaks the law.'
      ]
    },
    {
      t: 'p',
      x: 'If you break these rules, we may block your access or refuse your request.'
    },

    { t: 'h2', x: 'Intellectual property' },
    {
      t: 'p',
      x: 'The service, including its text, calculator, methodology, design, software and branding, belongs to us or our licensors and is protected by copyright and other rights. You may view it and use the calculator for your own personal, non-commercial purposes. You may not copy, reproduce, sell, republish or build on it without our written permission.'
    },
    {
      t: 'p',
      x: 'You keep ownership of the information you submit. You allow us to use it as described in these terms and in our [[/privacy|privacy policy]].'
    },

    { t: 'h2', x: 'Links to other sites' },
    {
      t: 'p',
      x: 'The service may link to other websites. We do not control them and we are not responsible for their content or how they handle your information.'
    },

    { t: 'h2', x: 'Availability' },
    {
      t: 'p',
      x: 'We try to keep the service available and accurate, but we do not promise it will be uninterrupted or error-free. We may change, suspend or withdraw any part of it at any time.'
    },

    { t: 'h2', x: 'Our responsibility to you' },
    {
      t: 'p',
      x: 'Nothing in these terms limits or excludes our liability for death or personal injury caused by our negligence, for fraud or fraudulent misrepresentation, or for anything else that cannot be limited or excluded by law. If you are a consumer, your statutory rights are not affected.'
    },
    { t: 'p', x: 'Subject to that:' },
    {
      t: 'ul',
      items: [
        'we are responsible for foreseeable loss or damage you suffer because we fail to use reasonable care and skill in providing the service. Loss is foreseeable if it was an obvious consequence of our failure, or if you and we both could have contemplated it when you started using the service;',
        'we are not liable for loss arising from your reliance on an estimate, from any difference between an estimate and real-world results, or from your decision to buy, or not to buy, anything;',
        'we are not liable for the acts or omissions of installers, which we do not control, including their prices, workmanship, delays or any breach of a contract between you and them; and',
        'if you use the service for business purposes, we are not liable for loss of profit, revenue, business or goodwill.'
      ]
    },
    {
      t: 'p',
      x: '[SOLICITOR TO CONFIRM: whether to add an overall cap on liability, and whether this section is fair and reasonable for consumers under the Consumer Rights Act 2015.]'
    },

    { t: 'h2', x: 'Changes to these terms' },
    {
      t: 'p',
      x: 'We may update these terms from time to time. The date shown on this page tells you when they were last changed. The updated terms apply from that date, and if you keep using the service you accept them. If we make a significant change, we will say so clearly on the site.'
    },

    { t: 'h2', x: 'General' },
    {
      t: 'ul',
      items: [
        'If any part of these terms is found to be unenforceable, the rest stays in force.',
        'Only you and we have rights under these terms. Installers and other third parties cannot enforce them.',
        'If we do not enforce a right straight away, that does not mean we have given it up.'
      ]
    },

    { t: 'h2', x: 'Complaints' },
    {
      t: 'p',
      x: 'If you have a complaint about the service, please contact us first and we will try to put things right. [CONFIRM BEFORE LAUNCH: complaints procedure, response times and whether to name an alternative dispute resolution provider.]'
    },

    { t: 'h2', x: 'Governing law' },
    {
      t: 'p',
      x: 'These terms, and any dispute or claim arising out of or in connection with them or the service (including non-contractual disputes), are governed by the law of England and Wales. The courts of England and Wales have jurisdiction over any such dispute. If you are a consumer living in Scotland or Northern Ireland, you may also bring proceedings in the courts there.'
    },

    { t: 'h2', x: 'Contact us' },
    {
      t: 'p',
      x: '**[COMPANY LEGAL NAME]**, [REGISTERED OFFICE ADDRESS]. Email: [CONTACT EMAIL]. Or use our [[/contact|contact page]]. Related pages: [[/privacy|privacy policy]] and [[/cookies|cookies]].'
    }
  ]
};

const cookies = {
  title: 'Cookies and session storage',
  description: 'Roofworth sets no advertising or analytics cookies. This page explains the session storage the calculator uses and how to clear it.',
  updated: '2026-10',
  body: [
    { t: 'note', x: DRAFT_NOTE },
    {
      t: 'p',
      x: '**We do not use any non-essential cookies.** Roofworth has no advertising cookies, no analytics cookies and no third-party trackers. This page explains the one thing the calculator stores on your device, and how you can clear it.'
    },
    {
      t: 'p',
      x: '[CONFIRM BEFORE LAUNCH: check the live site in a browser’s developer tools to confirm that no cookies are set, including by the hosting platform or any embedded content. If any strictly necessary cookies are set, list each one in the table below.]'
    },

    { t: 'h2', x: 'What we store on your device' },
    {
      t: 'p',
      x: 'When you use the calculator, your answers are kept in your browser’s **session storage**. Session storage is a feature built into your browser. It is similar to a cookie in that it saves information on your device, but it stays in your browser, it is not sent to a website automatically, and your browser clears it when you close the tab or window.'
    },
    {
      t: 'table',
      head: ['What', 'Where it is stored', 'What it is for', 'How long it lasts', 'Type'],
      rows: [
        [
          'Your calculator answers [CONFIRM BEFORE LAUNCH: add the storage key name(s) used by the site]',
          'Your browser’s session storage, on your device',
          'Keeps the answers you have entered so that the page survives a refresh. These are your postcode, roof details, household and electricity use details, EV and heating information, and tariff rates.',
          'Until you close the tab or window, or clear it yourself',
          'Strictly necessary for the calculator you asked to use. Not sent to us.'
        ]
      ]
    },
    {
      t: 'p',
      x: 'We treat this as strictly necessary, because it is used only to provide the calculator you asked to use, so we do not ask for your consent to it. [SOLICITOR TO CONFIRM: reliance on the strictly necessary exemption in regulation 6 of the Privacy and Electronic Communications Regulations 2003 (PECR).]'
    },
    {
      t: 'p',
      x: '**Your answers are not sent to us unless you submit a quote request.** If you do, the calculator inputs and a summary of your result are sent with the form. See our [[/privacy|privacy policy]] for how we then use and share them.'
    },

    { t: 'h2', x: 'What we do not use' },
    {
      t: 'ul',
      items: [
        '**Advertising cookies.** We do not show adverts or track you for advertising.',
        '**Analytics cookies or tools.** We do not measure how you use the site.',
        '**Third-party trackers.** We do not load trackers from other companies.'
      ]
    },
    {
      t: 'p',
      x: 'This is our current position. If it changes, we will update this page and our [[/privacy|privacy policy]], and ask for your consent first where the law requires it.'
    },

    { t: 'h2', x: 'How to clear session storage' },
    {
      t: 'p',
      x: 'The simplest way is to **close the tab or window**. Your browser then clears the calculator answers for that tab. You can also clear it without closing the tab, or remove all stored site data, as follows.'
    },
    { t: 'h3', x: 'Chrome and Edge' },
    {
      t: 'ol',
      items: [
        'On the Roofworth page, open developer tools (press F12, or Ctrl+Shift+I on Windows, or Cmd+Option+I on a Mac).',
        'Open the “Application” tab.',
        'Under “Storage”, expand “Session storage” and select the Roofworth site.',
        'Choose “Clear all” (or right-click and delete the entries), then refresh the page.'
      ]
    },
    { t: 'h3', x: 'Firefox' },
    {
      t: 'ol',
      items: [
        'On the Roofworth page, open developer tools (press F12, or Ctrl+Shift+I on Windows, or Cmd+Option+I on a Mac).',
        'Open the “Storage” tab and expand “Session Storage”.',
        'Right-click the Roofworth site and choose “Delete All”, then refresh the page.'
      ]
    },
    { t: 'h3', x: 'Safari' },
    {
      t: 'ol',
      items: [
        'If you do not see a “Develop” menu, turn it on in Safari’s settings under Advanced.',
        'On the Roofworth page, choose Develop, then “Show Web Inspector”, and open the “Storage” tab.',
        'Select “Session Storage”, select the entries, delete them, then refresh the page.'
      ]
    },
    {
      t: 'p',
      x: 'In any browser you can also clear “cookies and other site data” for Roofworth in the browser’s privacy or site settings, or use a private or incognito window, which discards session storage when you close it. The exact wording and steps vary between browsers and versions.'
    },

    { t: 'h2', x: 'Admin area' },
    {
      t: 'p',
      x: 'Roofworth has an administration area that our team uses to manage the service. It is not public, visitors do not use it, and any sign-in storage used there applies only to our own staff. [CONFIRM BEFORE LAUNCH: keep or delete this section depending on whether an admin area exists, and list any cookies or storage it uses.]'
    },

    { t: 'h2', x: 'Other websites' },
    {
      t: 'p',
      x: 'If you follow a link to another website, such as an installer’s, that site is not covered by this page and may set its own cookies. Please check its cookie policy.'
    },

    { t: 'h2', x: 'Questions' },
    {
      t: 'p',
      x: 'If you have questions about this page, email [CONTACT EMAIL] or use our [[/contact|contact page]]. [COMPANY LEGAL NAME], [REGISTERED OFFICE ADDRESS]. Related pages: [[/privacy|privacy policy]] and [[/terms|terms of use]].'
    }
  ]
};

export const LEGAL = { privacy, terms, cookies };
