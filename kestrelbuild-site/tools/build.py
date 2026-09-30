#!/usr/bin/env python3
"""Generates the inner pages (services, pricing, areas, work), sitemap.xml and robots.txt.

Run from the repo root:  python3 tools/build.py
The homepage (index.html) is hand-edited and is only read here (for the case studies).
Keep this folder out of the published site if you deploy the repo root (see README).
"""
import html, json, os, re, datetime

SITE = "https://www.kestrelbuild.co.uk"
EMAIL = "hello@kestrelbuild.co.uk"
PHONE_DISPLAY = "07415 880236"
PHONE_TEL = "+447415880236"
GBP_URL = "https://share.google/JdmSzfxY8z68D8cAo"
TODAY = datetime.date.today().isoformat()
OG = f"{SITE}/assets/og.jpg"
OG_ALT = "Kestrel Build: local SEO, Google reviews and web design for Leicestershire businesses"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

e = html.escape

SERVICES = [
    ("local-seo", "Local SEO", "Get found by people searching near you"),
    ("google-business-profile", "Google Business Profile", "Show up in the map pack"),
    ("google-reviews", "Google reviews", "A steady flow of genuine reviews"),
    ("web-design", "Web design", "Hand-built, fast, accessible sites"),
    ("seo-audit", "SEO audit", "A written check of what's holding you back"),
]

AREAS = {
    "leicester": dict(
        name="Leicester",
        places=["Oadby", "Wigston", "Braunstone", "Evington", "Knighton", "Aylestone", "Belgrave"],
        intro="Leicester is a big, busy city, and most trades and services here are fighting over the same handful of searches. A plumber, an installer or a solicitor can be one of dozens who all say the same thing on their website.",
        angle="Searches in Leicester are often about an area rather than the whole city: someone in Oadby or Evington typing the trade plus their neighbourhood, or \"near me\" from a phone. A business that has a proper Google Business Profile and a page that genuinely covers those neighbourhoods has a real edge over one that lists \"Leicester\" once in the footer.",
        proof="Two of the sites in my portfolio are Leicester businesses: Fireserv UK (fire and security, serving Leicester and the East Midlands) and Brittle Air Conditioning (a family-run installer up against national chains).",
        faq=("Is Leicester too competitive for a small business to rank?", "Not for the searches that matter. You are not trying to beat everyone for \"plumber Leicester\"; you are trying to be the obvious answer for your services in the parts of the city and county you actually cover, and to be in the map results when someone nearby needs you."),
    ),
    "loughborough": dict(
        name="Loughborough",
        places=["Shepshed", "Quorn", "Barrow upon Soar", "Mountsorrel", "Sileby", "Woodhouse Eaves"],
        intro="Loughborough is a university and engineering town at the north of Leicestershire, and the centre of the Charnwood area. Customers here search for local trades and services from the town itself and from the villages around it.",
        angle="The villages matter as much as the town. Plenty of the work comes from places like Quorn, Shepshed and Barrow upon Soar, so a site that has only one page saying \"Loughborough\" misses people who search with their own village name. Good local pages and a correctly filled-in Google Business Profile service area fix that.",
        proof="Quorn Sports & Classics, an independent Porsche workshop trading since 2008 just outside Loughborough, is one of the sites I rebuilt.",
        faq=("Should I have a page for each village around Loughborough?", "Only where you genuinely do work and have something specific to say. A handful of well-written pages for your busiest areas does more than a long list of near-identical ones, which Google tends to ignore."),
    ),
    "quorn": dict(
        name="Quorn",
        places=["Woodhouse Eaves", "Mountsorrel", "Rothley", "Barrow upon Soar", "Loughborough"],
        intro="Quorn is a village in Charnwood, a short drive from Loughborough, and home to some long-established independent businesses that get most of their work by word of mouth.",
        angle="Word of mouth is a good start, but it stops at the edge of the people you already know. The searches that come from outside that circle are what local SEO adds: people looking for exactly what you do, in or near Quorn, who have never heard of you.",
        proof="I know the patch first-hand: Quorn Sports & Classics, a Porsche specialist in the village, is a client whose site I rebuilt.",
        faq=("I'm in a village, not a town. Does local SEO still work?", "Yes, and often better. Fewer businesses compete in a village, and Google uses your listed location and service area to decide who is nearby. The job is making sure those details are right and consistent."),
    ),
    "melton-mowbray": dict(
        name="Melton Mowbray",
        places=["Asfordby", "Waltham on the Wolds", "Oakham"],
        intro="Melton Mowbray is a market town in north-east Leicestershire, best known for its pork pies and Stilton, with a wide rural area around it.",
        angle="A lot of work in Melton comes from outlying villages and farms, where people rely on their phone to find someone who will travel. Service-area settings on Google, and pages that name the places you cover, are what put a Melton business in front of them.",
        proof="The approach is the same one I used for other Leicestershire clients: start from what customers type, then build the pages and the Google profile around it.",
        faq=("Does it matter that my customers are spread across villages?", "It is one of the main reasons to do local SEO properly. Your Google Business Profile can list a service area, and your site can carry pages for the places you cover, so you show up for people outside the town centre too."),
    ),
    "hinckley": dict(
        name="Hinckley",
        places=["Earl Shilton", "Barwell", "Burbage", "Market Bosworth", "Nuneaton"],
        intro="Hinckley sits in the south-west corner of Leicestershire, close to the Warwickshire border, so customers come from both counties.",
        angle="Because Hinckley borders Warwickshire, searches there often cross the county line: Nuneaton, Burbage and Earl Shilton all feed the same pool of customers. A site and Google profile that only mention one county can miss half of them.",
        proof="I build and look after sites for trades and services that work across boundaries like this, including Fireserv UK, which covers Leicester and the wider East Midlands.",
        faq=("We work in Leicestershire and Warwickshire. How do we cover both?", "List both areas as your service area on Google and build separate pages for the places you really cover on each side. Keep your business name, address and phone details the same everywhere they appear."),
    ),
    "market-harborough": dict(
        name="Market Harborough",
        places=["Kibworth", "Lutterworth", "Desborough"],
        intro="Market Harborough is a market town in the south of Leicestershire, on the edge of Northamptonshire, with villages and farmland to every side.",
        angle="Customers around Market Harborough tend to be loyal to local names, which makes reviews unusually important: a business with a steady run of recent, genuine Google reviews reads as the safe choice when someone is comparing a few options.",
        proof="The review approach on my Google reviews page is the one I'd use here: ask every happy customer at the right moment, make it a two-tap job, and reply to everything.",
        faq=("How many reviews do I need?", "There is no magic number, and nobody can promise one. What works is a steady, recent flow from real customers, because both Google and people reading them put more weight on fresh reviews than on a pile collected years ago."),
    ),
    "coalville": dict(
        name="Coalville",
        places=["Ibstock", "Whitwick", "Ashby-de-la-Zouch", "Measham", "Castle Donington"],
        intro="Coalville is the largest town in North West Leicestershire, with a strong base of trades, builders and industrial businesses in and around it.",
        angle="For trades, the most valuable searches are usually the urgent ones, made on a phone: \"emergency\", \"today\", \"near me\". Those are won by the businesses with a complete Google profile, working opening hours, a tap-to-call number and reviews from nearby jobs.",
        proof="Sites like R.A.C Carpentry & Joinery and Green Reach Scaffolding in my portfolio are built around exactly this: a buyer who needs to know quickly that you are the right people to call.",
        faq=("Do I need a website if I get most of my work from Google Business Profile?", "You can get a long way with a good profile, but the site is what turns a click into a quote. It also lets you rank for searches the profile alone won't, such as specific services and specific villages."),
    ),
    "nottingham": dict(
        name="Nottingham",
        places=["West Bridgford", "Beeston", "Arnold", "Long Eaton", "Hucknall"],
        intro="Nottingham is the biggest city on the Leicestershire border, with a lot of businesses chasing the same customers and plenty of national brands in the results.",
        angle="In a city this size, you rarely win by going head-to-head on the broadest terms. The openings are in specifics: a particular service, a particular suburb such as West Bridgford or Beeston, and a reputation that shows in your reviews.",
        proof="I work with businesses in Nottingham and across the East Midlands by phone and email, the same way I do for clients in Leicestershire and further afield.",
        faq=("Can you work with me if I'm not in Leicestershire?", "Yes. I'm based in Leicestershire and work with clients across the UK. Local SEO is about your customers' location, not mine, so what matters is that I understand your area and what people there search for."),
    ),
}

CASE_EXTRA = {}  # optional per-slug results, e.g. {"fireserv": ["Calls up 40% in 6 months"]}; add real numbers only


def slugify(name):
    if name.startswith("R.A.C"):
        return "rac-carpentry-joinery"
    return re.sub(r"[^a-z0-9]+", "-", name.lower().replace("&amp;", "and").replace("&", "and")).strip("-")


# ----------------------------------------------------------------- shared bits
ARROW = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5"/></svg>'
LOGO = ('<svg viewBox="0 0 100 100" aria-hidden="true">'
        '<path d="M50 12 c3.4 0 5.8 2.8 5.8 6.4 l-.4 8.4 c2 3.4 2.8 8.8 2.4 14.4 l-1.4 28 l4.2 16 l-10.6 -6 l-10.6 6 l4.2 -16 l-1.4 -28 c-.4 -5.6 .4 -11 2.4 -14.4 l-.4 -8.4 c0 -3.6 2.4 -6.4 5.8 -6.4 z"/>'
        '<path d="M45 29 C33 32.5 17 43 1.5 63 C19 53.5 35.5 49 45 48 Z"/>'
        '<path d="M55 29 C67 32.5 83 43 98.5 63 C81 53.5 64.5 49 55 48 Z"/></svg>')

BUSINESS_ID = f"{SITE}/#business"


def head(title, desc, path, schema):
    url = f"{SITE}{path}"
    ld = "\n".join(f'<script type="application/ld+json">{json.dumps(s, ensure_ascii=False)}</script>' for s in schema)
    return f"""<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#121213">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Kestrel Build">
<meta property="og:locale" content="en_GB">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:image" content="{OG}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{e(OG_ALT)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preload" as="font" type="font/woff2" href="/assets/fonts/bricolage-grotesque-3y996as8.woff2" crossorigin>
<link rel="stylesheet" href="/css/fonts.css?v=20260930a">
<link rel="stylesheet" href="/css/kestrel.css?v=20260930a">
<link rel="stylesheet" href="/css/pages.css?v=20260930a">
{ld}
</head>
<body class="page">
<a class="skip" href="#main">Skip to content</a>
"""


def header():
    links = [("/local-seo/", "Local SEO"), ("/web-design/", "Web design"), ("/work/", "Work"), ("/pricing/", "Pricing")]
    menu = [("/local-seo/", "Local SEO"), ("/google-business-profile/", "Google Business Profile"),
            ("/google-reviews/", "Google reviews"), ("/web-design/", "Web design"), ("/work/", "Work"),
            ("/pricing/", "Pricing"), ("/areas/", "Areas"), ("/#contact", "Start a project")]
    nl = "\n    ".join(f'<a href="{h}">{t}</a>' for h, t in links)
    ml = "\n  ".join(f'<a href="{h}"><em>{i+1:02d}</em> {t}</a>' for i, (h, t) in enumerate(menu))
    return f"""<header class="nav stuck" id="nav">
  <a class="nav__brand" href="/" aria-label="Kestrel Build — home">{LOGO}<span>Kestrel Build</span></a>
  <nav class="nav__links" aria-label="Primary">
    {nl}
  </nav>
  <div class="nav__end">
    <a class="btn btn--sm" href="/#contact">Start a project</a>
    <button class="nav__toggle" id="navToggle" aria-expanded="false" aria-controls="navPanel">
      <span class="vh">Menu</span><i></i><i></i>
    </button>
  </div>
</header>
<div class="menu" id="navPanel" hidden>
  {ml}
</div>
"""


def footer_html():
    """Shared footer markup (also pasted into index.html)."""
    sv = "\n".join(f'        <a href="/{s}/">{t}</a>' for s, t, _ in SERVICES)
    ar = "\n".join(f'        <a href="/areas/{s}/">{a["name"]}</a>' for s, a in AREAS.items())
    return f"""<footer class="foot">
  <div class="wrap foot__wrap">
    <div class="foot__brand">
      {LOGO}
      <p><b>Kestrel Build</b><span>Local SEO, Google reviews and hand-built websites for businesses in Leicestershire and the East Midlands.</span></p>
    </div>
    <nav class="foot__nav" aria-label="Footer">
      <a href="/work/">Work</a>
      <a href="/pricing/">Pricing</a>
      <a href="/areas/">Areas</a>
      <a href="/#contact">Contact</a>
    </nav>
    <div class="foot__cols">
      <div><h2>Services</h2>
{sv}
      </div>
      <div><h2>Areas</h2>
{ar}
      </div>
      <div><h2>Kestrel Build</h2>
        <address>Service-area business based in Leicestershire, England.<br>Serving Leicestershire, Nottinghamshire and the East Midlands, and working UK-wide.<br><a href="tel:{PHONE_TEL}">{PHONE_DISPLAY}</a><br><a href="mailto:{EMAIL}">{EMAIL}</a></address>
      </div>
    </div>
    <p class="foot__legal">© <span id="yr">2026</span> Kestrel Build. Made by hand in Leicestershire.</p>
  </div>
</footer>
"""


def crumbs(trail):
    """trail: list of (path, label); last one is the current page."""
    items = []
    for i, (p, l) in enumerate(trail):
        items.append(f'<li><a href="{p}">{e(l)}</a></li>' if i < len(trail) - 1 else f'<li aria-current="page">{e(l)}</li>')
    return f'<nav class="crumbs" aria-label="Breadcrumb"><ol>{"".join(items)}</ol></nav>'


def crumb_ld(trail):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": l, "item": SITE + p} for i, (p, l) in enumerate(trail)]}


def phero(trail, h1, lede, cta=True):
    c = ""
    if cta:
        c = f'<div class="phero__cta"><a class="btn" href="/#contact">Ask about it{ARROW}</a><a class="lnk" href="/pricing/">See pricing</a></div>'
    return f"""<section class="phero">
  <div class="wrap">
    {crumbs(trail)}
    <h1>{h1}</h1>
    <p class="phero__lede">{lede}</p>
    {c}
  </div>
</section>
"""


def cta(title="Let's get you seen.", text=None):
    text = text or "Tell me what you do and where you work. If I'm not the right fit I'll say so and point you somewhere better."
    return f"""<section class="cta">
  <div class="wrap">
    <h2>{e(title)}</h2>
    <p>{e(text)}</p>
    <div class="cta__row"><a class="btn" href="/#contact">Start a project{ARROW}</a><a class="lnk" href="mailto:{EMAIL}">{EMAIL}</a></div>
  </div>
</section>
"""


def foot_close():
    return footer_html() + '\n<script src="/js/pages.js?v=20260930a" defer></script>\n</body>\n</html>\n'


def faq_html(items):
    return '<div class="faq">' + "".join(f"<details><summary>{e(q)}</summary><p>{a}</p></details>" for q, a in items) + "</div>"


def section(h2, body, light=True, stack=False):
    cls = "psec" + (" light" if light else "") + (" psec--stack" if stack else "")
    return f'<section class="{cls}"><div class="wrap"><h2>{h2}</h2><div class="prose">{body}</div></div></section>\n'


def write(path, content):
    full = os.path.join(ROOT, path.strip("/"), "index.html")
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)


PAGES = []  # (path, priority)


def service_ld(name, desc, path, extra=None):
    d = {"@context": "https://schema.org", "@type": "Service", "name": name, "description": desc,
         "url": SITE + path, "provider": {"@id": BUSINESS_ID},
         "areaServed": [{"@type": "AdministrativeArea", "name": "Leicestershire"}, {"@type": "AdministrativeArea", "name": "Nottinghamshire"}, {"@type": "Country", "name": "United Kingdom"}]}
    if extra:
        d.update(extra)
    return d


def page(path, title, desc, trail, h1, lede, body, schema, priority="0.8", final_cta=True, hero_cta=True):
    out = head(title, desc, path, schema + [crumb_ld(trail)]) + header()
    out += '<main id="main">\n' + phero(trail, h1, lede, hero_cta) + body + '</main>\n'
    if final_cta:
        out += cta()
    out += foot_close()
    write(path, out)
    PAGES.append((path, priority))


def areas_chips(prefix="/areas/"):
    return '<div class="chips">' + "".join(f'<a href="{prefix}{s}/">{a["name"]}</a>' for s, a in AREAS.items()) + "</div>"


# ---------------------------------------------------------------- service pages
def build_services():
    home = [("/", "Home")]

    # LOCAL SEO
    p = "/local-seo/"
    trail = home + [(p, "Local SEO")]
    body = section("What local SEO actually is", """
<p>Local SEO is the work that decides who appears when someone nearby searches for what you do: the map results at the top of Google, and the organic listings underneath. It is a different job from general SEO, because Google is answering a question about <em>place</em> as much as about topic.</p>
<p>Three things drive it: how well your website answers the search, how complete and trusted your Google Business Profile is, and what other people say about you in reviews and listings. Weak on any one, and a competitor a few streets away takes the call.</p>""")
    body += section("What I do each month", """
<h3>Research the searches that bring in work</h3>
<p>Keyword and intent research for your real services and your real patch. Not the biggest terms; the ones people type when they are ready to buy, such as a service plus a town, or \"near me\" from a phone.</p>
<h3>Build the pages that answer them</h3>
<p>Service pages and area pages, written for your business and added as the research calls for them. Each one has its own purpose and its own words, so Google has a reason to show it.</p>
<h3>Keep your Google Business Profile right</h3>
<p>Categories, services, service area, hours, photos and posts, checked and kept current. See <a href="/google-business-profile/">Google Business Profile</a>.</p>
<h3>Get your details consistent</h3>
<p>Your name, address or service area, and phone number matching across the directories and listings that matter, so nothing contradicts anything else.</p>
<h3>Build reviews</h3>
<p>A simple, repeatable way to ask happy customers for a Google review, and replies to the ones you get. See <a href="/google-reviews/">Google reviews</a>.</p>
<h3>Watch the technical health</h3>
<p>Speed on mobile, Core Web Vitals, indexing and broken links, checked every month, so a problem doesn't sit unnoticed for a quarter.</p>
<h3>Report in plain English</h3>
<p>Rankings, calls and enquiries once a month, with what changed and what happens next. No dashboard to decode.</p>""")
    body += section("Who it suits", """
<p>Businesses that win work from people nearby: trades, installers, workshops, clinics, professional services, local retailers. If you have a service area or a premises and customers search for you by place, local SEO applies.</p>
<p>It will not suit you if you need guaranteed page-one positions by a certain date. Nobody honest can promise that, and I won't.</p>""")
    body += section("Where I work", f"<p>Based in Leicestershire and working UK-wide. Most local SEO work is for businesses in Leicestershire, Nottinghamshire and the East Midlands:</p>{areas_chips()}")
    body += section("Questions", faq_html([
        ("How long does local SEO take?", "Some things move in weeks, such as fixing a Google profile or a broken page. Rankings for competitive searches usually take a few months of steady work. I'll tell you what to expect for your market, not a number to sell you on."),
        ("How much does it cost?", f'The ongoing service is £500 a month. <a href="/pricing/">See what\'s included</a>.'),
        ("Do I need a new website?", "Not always. If your current site is fast, clear and can carry new pages, I'll work with it. If it is holding you back, I'll say so and show you why. I also build sites; see <a href=\"/web-design/\">web design</a>."),
        ("Can you promise number one on Google?", "No. Google decides the rankings, and anyone who guarantees a position is guessing or selling something else. What I can do is fix what's holding you back and report honestly on what moves.")]))
    page(p, "Local SEO for Leicestershire Businesses | Kestrel Build",
         "Local SEO for Leicestershire and East Midlands businesses: Google Business Profile, service and area pages, reviews and monthly reporting. £500 a month.",
         trail, "Local SEO for Leicestershire businesses",
         "Get found by people searching near you: the right pages, a Google Business Profile that works, and reviews that build trust. One person does the work and reports in plain English.",
         body, [service_ld("Local SEO", "Local SEO for businesses in Leicestershire and the East Midlands.", p)], "0.9")

    # GBP
    p = "/google-business-profile/"
    trail = home + [("/local-seo/", "Local SEO"), (p, "Google Business Profile")]
    body = section("Why the profile matters", """
<p>Your Google Business Profile is the listing that appears in the map results and on the right of branded searches. For many local searches it is the first thing a customer sees, and often the only thing before they ring you.</p>
<p>A profile that is unclaimed, half-filled or out of date loses calls to a competitor with a complete one. It is also the part of local SEO where small, correct details make the biggest difference.</p>""")
    body += section("What gets done", """
<ul>
<li><strong>Claim and verify</strong> the profile, or take it back if someone else set it up.</li>
<li><strong>Choose the right categories</strong>, the main one especially, because it does more than anything else to decide which searches you appear for.</li>
<li><strong>List your services</strong> in the words customers use.</li>
<li><strong>Set your service area</strong> accurately if you travel to customers, rather than listing a home address you'd rather keep private.</li>
<li><strong>Hours, including holidays</strong>, kept current. Wrong hours cost calls and reviews.</li>
<li><strong>Photos</strong> of real work, premises and people, which customers trust far more than stock images.</li>
<li><strong>Posts and updates</strong>, so the profile looks alive.</li>
<li><strong>Questions and answers and reviews</strong>, watched and answered.</li>
<li><strong>Tracking</strong> on the website link and phone number so you can see what the profile brings in.</li>
</ul>""")
    body += section("Keeping it honest", """
<p>Google has strict rules: your name must be your real business name, you can't stuff keywords into it, and you can't list addresses you don't operate from. Profiles that break the rules get suspended, which is far worse than ranking a little lower. I do it by the book.</p>""")
    body += section("Part of the monthly service", f'<p>Profile management is included in the <a href="/pricing/">£500 a month</a> service, alongside <a href="/local-seo/">local SEO</a> and <a href="/google-reviews/">review building</a>.</p>')
    body += section("Questions", faq_html([
        ("I already have a profile. Can you take it over?", "Yes. I'll check who owns it, fix what's wrong and add you or keep you as owner. You always keep ownership of your own profile."),
        ("I work from home. Will my address be public?", "It doesn't have to be. Service-area businesses can hide their address and show the areas they cover instead."),
        ("Do I still need a website?", "Yes. The profile gets you seen; the site is what convinces people and ranks for the searches the profile can't.")]))
    page(p, "Google Business Profile Management | Kestrel Build",
         "Get your Google Business Profile claimed, completed and kept current so you show up in the map results. Part of the £500 a month local SEO service.",
         trail, "Google Business Profile management",
         "Get into the map results where customers choose who to call. Set up properly, kept accurate and within Google's rules.",
         body, [service_ld("Google Business Profile management", "Setup and ongoing management of Google Business Profiles for local businesses.", p)], "0.8")

    # Reviews
    p = "/google-reviews/"
    trail = home + [("/local-seo/", "Local SEO"), (p, "Google reviews")]
    body = section("Why reviews decide the call", """
<p>When someone compares three businesses on Google, the reviews are often what they read. Recent, specific reviews from real customers build trust in seconds. They also feed into how high you rank in the map results.</p>
<p>Most happy customers never leave a review, simply because nobody asked at the right moment and the process was a faff.</p>""")
    body += section("How I build a steady flow", """
<h3>A short review link</h3>
<p>A direct link to your Google review form, plus a QR code for vans, invoices and counters. Two taps from a phone.</p>
<h3>Ask at the right moment</h3>
<p>A simple script and message templates for asking when the customer is happiest: on handover, after a good service, when they thank you.</p>
<h3>A routine that sticks</h3>
<p>A process you can follow in 30 seconds after each job, so asking becomes habit rather than a campaign.</p>
<h3>Reply to every review</h3>
<p>Good reviews get a proper thank-you. Bad ones get a calm, professional reply, which reads well to everyone else who sees it.</p>
<h3>Report what's coming in</h3>
<p>New reviews, your average, and how you compare with the businesses you're up against, in your monthly report.</p>""")
    body += section("What I won't do", """
<ul>
<li><strong>Buy or write fake reviews.</strong> It breaks Google's rules, gets reviews removed and can get a profile suspended.</li>
<li><strong>Offer discounts or gifts in exchange for reviews.</strong> Also against the rules.</li>
<li><strong>\"Review gating\"</strong>, which means only sending unhappy customers somewhere private. Google prohibits it, and customers can tell.</li>
<li><strong>Promise a number of reviews.</strong> Customers decide what they write. The job is to make it easy and to ask everyone.</li>
</ul>""")
    body += section("Part of the monthly service", '<p>Review building is included in the <a href="/pricing/">£500 a month</a> local SEO service, together with <a href="/google-business-profile/">Google Business Profile</a> management.</p>')
    body += section("Questions", faq_html([
        ("What if I get a bad review?", "It happens to every good business. Reply calmly, say what you'll do about it, and let the next ten reviews do the rest. If a review breaks Google's rules, I'll help you report it."),
        ("Can I show my Google reviews on my website?", "Yes, and it helps conversions. I'll add them in a way that's accurate and allowed, using real reviews only."),
        ("How quickly will reviews come in?", "It depends on how many customers you serve. A busy business can see a difference within weeks; a smaller one builds steadily over months.")]))
    page(p, "Google Reviews for Local Businesses | Kestrel Build",
         "A steady flow of genuine Google reviews: a simple review link, the right ask at the right time and replies to every review. Part of £500 a month.",
         trail, "Google reviews for local businesses",
         "Turn happy customers into genuine Google reviews: a simple process, a link that takes two taps, and replies to everything. No fakes, no tricks.",
         body, [service_ld("Google review building", "Helping local businesses collect genuine Google reviews within Google's guidelines.", p)], "0.8")

    # Web design
    p = "/web-design/"
    trail = home + [(p, "Web design")]
    body = section("Brand-led, not a theme", """
<p>Each site I build is designed from your trade, your customers and what they need to know before they'll call. I write the page structure and the copy first, then design around it. There's no theme with your logo dropped in, and no page builder underneath.</p>""")
    body += section("Built for speed and access", """
<ul>
<li><strong>Fast on a phone.</strong> Hand-written code, compressed images and self-hosted fonts, tested on mobile connections rather than a desktop on office wifi.</li>
<li><strong>Accessible to WCAG AA.</strong> Tested with a keyboard and a screen reader, not only a mouse.</li>
<li><strong>Search-ready from day one.</strong> Clean headings, proper titles and descriptions, structured data, a sitemap and pages for each service and area.</li>
<li><strong>No plugin subscriptions.</strong> Nothing on the site that you'll be paying to keep alive.</li>
</ul>""")
    body += section("Launched properly", """
<p>Analytics, call tracking and form tracking are wired up before launch, so from day one you can see whether the site brings in work. If you're replacing an old site, I map the redirects so you keep the rankings you already have.</p>""")
    body += section("See the work", '<p>Seven businesses, seven industries, no templates: <a href="/work/">solar, Porsche servicing, fire and security, scaffolding, project management, joinery and air conditioning</a>.</p>')
    body += section("Questions", faq_html([
        ("Do you build on WordPress or Wix?", "No. The sites are hand-written, which is why they're fast and why you won't be paying a subscription for plugins."),
        ("Will I be able to edit it myself?", "Day-to-day changes go through me, which keeps the site fast and consistent. Tell me what you want changed and I'll do it."),
        ("Can you just do the SEO on my existing site?", 'Often, yes. See <a href="/local-seo/">local SEO</a>.')]))
    page(p, "Web Design for Leicestershire Businesses | Kestrel Build",
         "Hand-built, fast and accessible websites for local businesses in Leicestershire and the East Midlands, designed around your customers and ready to rank.",
         trail, "Web design for Leicestershire businesses",
         "Bespoke websites for businesses tired of looking like everyone else: hand-built, fast on a phone, accessible and ready to be found.",
         body, [service_ld("Web design and development", "Bespoke website design and development for local businesses.", p)], "0.8")

    # SEO audit
    p = "/seo-audit/"
    trail = home + [(p, "SEO audit")]
    body = section("A written check of your site", """
<p>An SEO audit tells you, in plain English, what's holding your site back in search and in what order to fix it. It's the right starting point if you already have a website and don't know why it isn't bringing in calls.</p>""")
    body += section("What it covers", """
<ul>
<li><strong>Titles and meta descriptions:</strong> do they say what each page is and make people click?</li>
<li><strong>Headings and content:</strong> is each page clear about one thing, in the words customers use?</li>
<li><strong>Service and area pages:</strong> what's missing that people are searching for?</li>
<li><strong>Local details:</strong> name, address or service area, phone and opening hours, and whether they match across the web.</li>
<li><strong>Google Business Profile:</strong> categories, completeness, photos and activity.</li>
<li><strong>Reviews:</strong> how many, how recent, and how you compare with competitors.</li>
<li><strong>Mobile speed and Core Web Vitals.</strong></li>
<li><strong>Technical basics:</strong> sitemap, robots.txt, indexing, structured data and broken links.</li>
</ul>""")
    body += section("What you get", """
<p>A prioritised fix list: what to do first, what can wait, and what's a quick win versus a longer job. You can take it and do the work yourself, give it to your developer, or ask me to do it as part of the monthly service.</p>""")
    body += section("Getting one", f'<p>Tell me your website address and what you do, and I\'ll tell you what an audit of your site would involve and what it costs. <a href="/#contact">Get in touch</a> or email <a href="mailto:{EMAIL}">{EMAIL}</a>.</p>')
    page(p, "SEO Audit for Local Businesses | Kestrel Build",
         "A written SEO audit with a prioritised fix list: titles, headings, service and area pages, local details, reviews and mobile speed.",
         trail, "SEO audit for your website",
         "What's holding your site back in search, and what to fix first: a plain-English, prioritised list covering the pages, your Google profile, reviews and speed.",
         body, [service_ld("SEO audit", "A written SEO audit with a prioritised fix list for local business websites.", p)], "0.7")


# ---------------------------------------------------------------------- pricing
def build_pricing():
    p = "/pricing/"
    trail = [("/", "Home"), (p, "Pricing")]
    inc = ["Keyword and search-intent research for your services and area",
           "Service and area pages written and added as the research calls for them",
           "Google Business Profile set up and kept accurate and active",
           "Citations and directory listings kept consistent",
           "A simple, repeatable Google review process, and replies to reviews",
           "Monthly technical health and Core Web Vitals checks",
           "A plain-English monthly report: rankings, calls and enquiries"]
    li = "".join(f"<li>{e(i)}</li>" for i in inc)
    body = f"""<section class="psec light psec--stack"><div class="wrap">
<div class="price">
  <p class="eyebrow">Local SEO &amp; Google reviews</p>
  <p class="price__amt">£500<small>a month</small></p>
  <ul>{li}</ul>
  <a class="btn" href="/#contact">Start with a conversation{ARROW}</a>
</div></div></section>
"""
    body += section("What you're paying for", """
<p>One person doing the whole job: the research, the writing, the Google profile and the reporting. The person you speak to is the person doing the work, and decisions get made in one phone call rather than passed between three agencies.</p>
<p>It's ongoing work because local search is ongoing: competitors change, Google changes, and new reviews and pages keep your results moving.</p>""")
    body += section("What I can't promise", """
<p>Rankings. Nobody controls Google, and anyone who guarantees a position is guessing or selling something else. I'll report honestly on what's moving and what isn't, and tell you if something isn't working.</p>""")
    body += section("Websites", '<p>If you need a new site as well, <a href="/web-design/">tell me about it</a> and I\'ll quote for the build separately. The monthly service works on an existing site or one I\'ve built.</p>')
    body += section("Questions", faq_html([
        ("What happens on the first call?", "About half an hour on your trade, not on websites: who buys from you, what they ask first and who you keep losing work to. I'll tell you straight whether I can help."),
        ("Can I see what's wrong with my site first?", 'Yes, that\'s an <a href="/seo-audit/">SEO audit</a>.'),
        ("Do you work outside Leicestershire?", f'Yes, UK-wide. Most clients are in the East Midlands: <a href="/areas/">see the areas</a>.')]))
    offer = {"@context": "https://schema.org", "@type": "Service", "name": "Local SEO and Google reviews", "url": SITE + p,
             "description": "Monthly local SEO and Google review service for local businesses.", "provider": {"@id": BUSINESS_ID},
             "offers": {"@type": "Offer", "priceCurrency": "GBP", "price": "500", "url": SITE + p,
                        "priceSpecification": {"@type": "UnitPriceSpecification", "price": 500, "priceCurrency": "GBP", "unitText": "MONTH"}}}
    page(p, "Local SEO & Google Reviews: £500 a Month | Kestrel Build",
         "Local SEO and Google reviews for £500 a month: research, service and area pages, Google Business Profile, review building and plain-English monthly reports.",
         trail, "Local SEO and Google reviews: £500 a month",
         "One price, one person, and a monthly report you'll read. Here's what's included.",
         body, [offer], "0.9", hero_cta=False)


# ------------------------------------------------------------------------ areas
def build_areas():
    p = "/areas/"
    trail = [("/", "Home"), (p, "Areas")]
    cards = "".join(f'<a class="card" href="/areas/{s}/"><span class="card__k">{a["name"]}</span><h3>Local SEO in {a["name"]}</h3><p>{e(a["intro"].split(". ")[0])}.</p></a>' for s, a in AREAS.items())
    body = f'<section class="psec light psec--stack"><div class="wrap"><div class="cards">{cards}</div></div></section>\n'
    body += section("Somewhere else?", "<p>I'm based in Leicestershire and work with clients UK-wide. <a href=\"/#contact\">Tell me where you work</a> and what you do.</p>")
    page(p, "Local SEO in Leicestershire & East Midlands | Kestrel Build",
         "Local SEO and Google reviews for businesses in Leicester, Loughborough, Quorn, Melton Mowbray, Hinckley, Market Harborough, Coalville and Nottingham.",
         trail, "Local SEO across Leicestershire and the East Midlands",
         "Where I work, and what people in each area search for.",
         body, [], "0.7", hero_cta=False)

    for s, a in AREAS.items():
        path = f"/areas/{s}/"
        trail = [("/", "Home"), ("/areas/", "Areas"), (path, a["name"])]
        near = "".join(f"<li>{n}</li>" for n in a["places"])
        body = section(f"Searching in {a['name']}", f"<p>{a['intro']}</p><p>{a['angle']}</p>")
        body += section("What I do for businesses here",
                        f'<p>The monthly service covers <a href="/local-seo/">local SEO</a>, a properly managed <a href="/google-business-profile/">Google Business Profile</a> and a steady flow of genuine <a href="/google-reviews/">Google reviews</a>, for £500 a month. See <a href="/pricing/">what\'s included</a>.</p><p>{a["proof"]}</p>')
        body += section(f"Places around {a['name']}", f"<p>Customers often search with the name of their own area, so these matter as well:</p><ul>{near}</ul>")
        body += section("Question", faq_html([a["faq"]]))
        body += section("Other areas", f"<p>I also work with businesses in:</p>" + '<div class="chips">' + "".join(f'<a href="/areas/{t}/">{b["name"]}</a>' for t, b in AREAS.items() if t != s) + "</div>")
        page(path, f"Local SEO in {a['name']} | Kestrel Build",
             f"Local SEO, Google Business Profile and Google reviews for {a['name']} businesses. One person, plain-English reporting, £500 a month.",
             trail, f"Local SEO for {a['name']} businesses",
             f"Get found by customers in {a['name']} and the areas around it: the right pages, a Google profile that works and genuine reviews.",
             body, [service_ld(f"Local SEO in {a['name']}", f"Local SEO and Google reviews for businesses in {a['name']}.", path,
                               {"areaServed": {"@type": "City" if a['name'] in ("Leicester", "Nottingham") else "Place", "name": a["name"]}})], "0.6")


# ------------------------------------------------------------------- case studies
def parse_work():
    src = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
    out = []
    for art in re.findall(r'<article class="proj".*?</article>', src, re.S):
        g = lambda pat: re.search(pat, art, re.S)
        name = html.unescape(re.sub(r"<[^>]+>", "", g(r'<h3 class="proj__name[^>]*>(.*?)</h3>').group(1)).strip())
        spec = html.unescape(g(r'<p class="proj__spec[^>]*>(.*?)</p>').group(1).strip())
        txt = html.unescape(re.sub(r"\s+", " ", g(r'<p class="proj__txt[^>]*>(.*?)</p>').group(1)).strip())
        tags = [html.unescape(t) for t in re.findall(r"<li>(.*?)</li>", g(r'<ul class="tags[^>]*>(.*?)</ul>').group(1))]
        url = g(r'class="proj__link" href="([^"]+)"')
        img = g(r'<img src="([^"]+)"[^>]*alt="([^"]*)"')
        out.append(dict(name=name, slug=slugify(name), spec=spec, txt=txt, tags=tags, url=url.group(1) if url else None,
                        img=img.group(1), alt=html.unescape(img.group(2))))
    return out


def build_work():
    work = parse_work()
    p = "/work/"
    trail = [("/", "Home"), (p, "Work")]
    cards = "".join(f'<a class="card" href="/work/{w["slug"]}/"><span class="card__k">{e(w["spec"].split(" · ")[0])}</span><h3>{e(w["name"])}</h3><p>{e(w["txt"][:150].rsplit(" ", 1)[0])}…</p></a>' for w in work)
    body = f'<section class="psec light psec--stack"><div class="wrap"><div class="cards">{cards}</div></div></section>\n'
    page(p, "Web Design & SEO Case Studies | Kestrel Build",
         "Seven businesses, seven industries, no templates: case studies of sites built by Kestrel Build, from solar and Porsche servicing to fire safety and joinery.",
         trail, "Seven businesses. Seven industries.",
         "Solar, Porsche, fire safety, air conditioning, scaffolding, construction and joinery. They share almost nothing, and not one of their websites started from a template.",
         body, [], "0.8", hero_cta=False)
    for i, w in enumerate(work):
        path = f"/work/{w['slug']}/"
        trail = [("/", "Home"), ("/work/", "Work"), (path, w["name"])]
        others = "".join(f'<a href="/work/{o["slug"]}/">{e(o["name"])}</a>' for o in work if o is not w)
        visit = (f'<p><a class="lnk" href="{w["url"]}" target="_blank" rel="noopener">Visit the {e(w["name"])} website{ARROW}<span class="vh">(opens in a new tab)</span></a></p>' if w["url"] else "")
        results = ""
        if CASE_EXTRA.get(w["slug"]):
            results = section("Results", "<ul>" + "".join(f"<li>{e(r)}</li>" for r in CASE_EXTRA[w["slug"]]) + "</ul>")
        body = f'<section class="psec light psec--stack"><div class="wrap"><div class="cs__shot"><img src="/{w["img"]}" width="1600" height="1000" alt="{e(w["alt"])}"></div></div></section>\n'
        body += section("The brief and the build", f'<p>{e(w["txt"])}</p><ul class="cs__tags">' + "".join(f"<li>{e(t)}</li>" for t in w["tags"]) + f"</ul>{visit}")
        body += results
        body += section("More work", f'<div class="chips">{others}</div>')
        page(path, f"{w['name']} Website Case Study | Kestrel Build",
             f"How Kestrel Build designed and built the {w['name']} website: {w['spec'].lower()}.",
             trail, f"{e(w['name'])}", e(w["spec"]), body, [], "0.6", hero_cta=False)
    return work


# ------------------------------------------------------------------ sitemap etc.
def write_sitemap():
    entries = [("/", "1.0")] + PAGES
    x = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for path, pr in entries:
        x.append(f"  <url><loc>{SITE}{path}</loc><lastmod>{TODAY}</lastmod><priority>{pr}</priority></url>")
    x.append("</urlset>\n")
    open(os.path.join(ROOT, "sitemap.xml"), "w").write("\n".join(x))
    open(os.path.join(ROOT, "robots.txt"), "w").write(f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")


def build_thanks():
    trail = [("/", "Home"), ("/thanks/", "Thanks")]
    out = head("Thanks | Kestrel Build", "Thanks for your enquiry.", "/thanks/", [])
    out = out.replace('<link rel="canonical"', '<meta name="robots" content="noindex">\n<link rel="canonical"')
    out += header() + '<main id="main">\n' + phero(trail, "Thanks, got it.", "I'll come back to you within one working day.", False) + '</main>\n' + foot_close()
    write("/thanks/", out)


if __name__ == "__main__":
    build_thanks()
    build_services()
    build_pricing()
    build_areas()
    build_work()
    write_sitemap()
    print(len(PAGES) + 1, "URLs in sitemap")
