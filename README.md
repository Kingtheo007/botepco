# BOTEPCO website: static rebuild

A static rebuild of the Botswana Teaching Professionals Council website (previously WordPress/Elementor at `uat.botepco.org.bw`). It uses plain HTML, CSS and vanilla JavaScript, with no frameworks, no CSS libraries and no build step.

> **Status (3 Nov 2026): built and QA'd.** The homepage, 39 inner pages, the 404 page and 5 reusable templates are complete. The final QA report, launch checklist and backend notes are in [`REPORT.md`](REPORT.md). The content audit of the old site is in [`AUDIT.md`](AUDIT.md).

## Run it locally

Serve the folder **from its root**. Every asset path is root-relative (`/assets/...`), so the header and footer markup can be identical on every page.

```bash
python -m http.server 8080
```

```bash
npx serve .
```

Then open http://localhost:8080.

Opening files straight from disk (`file://`) won't load the search index or the ES modules. Serving from a subfolder such as `http://localhost/botepco/` breaks the root-relative paths. On XAMPP, point a virtual host's DocumentRoot at this folder. Neither local server reads `.htaccess`, so the redirects and custom 404 only work on Apache.

## Deploy

- **Apache (XAMPP, most shared hosting):** upload the folder as the web root. `.htaccess` provides:
  - 301 redirects from every old WordPress URL
  - `ErrorDocument 404 /404.html`
  - security headers
  - compression and cache headers
  - blocking of the authoring folders
  - A Content-Security-Policy is written but commented out. It was tested on all 41 pages with no violations; enable it on staging first.
  - All of this was verified on a real Apache 2.4 (XAMPP), including all 44 old-URL redirects.
- **Netlify, Cloudflare Pages or nginx:** copy the redirect list from `.htaccess` into that host's format (`_redirects` or `rewrite` rules) and set `404.html` as the error page.
- **Don't deploy** `partials/`, `tools/`, `AUDIT.md`, `README.md` or `REPORT.md` publicly. `.htaccess` returns 404 for them, but it's cleaner to leave them out. `templates/` is harmless (`noindex`, disallowed in `robots.txt`).
- **Before going live:** confirm the production domain. `https://botepco.org.bw/` is used in canonical URLs, Open Graph tags, `sitemap.xml` and `robots.txt`.

## Folder structure

```
botepco/
  index.html                  homepage
  404.html
  about/  services/  cpd/  media/  procurement/  jobs/  csr/  contact/  help/
  data-privacy-notice/  cookie-policy/  search/      one folder + index.html per page
  templates/                  5 annotated starting points for new pages (noindex)
  partials/header.html        the one source of truth for the header…
  partials/footer.html        …and footer
  tools/sync-partials.py      copies the partials into every page (editing helper)
  tools/qa.html, capture.mjs  QA harness and full-page screenshot/console capture
  tools/screenshots/          screenshots from the final QA run
  sitemap.xml  robots.txt  .htaccess
  favicon.ico  favicon-32.png  apple-touch-icon.png
  assets/
    css/
      tokens.css              every design value (colour, type, space, radius, shadow, motion)
      base.css                @font-face, reset, element defaults, global utilities
      layout.css              primitives, header, footer, inner-page header, sidebar layout
      components.css          buttons, tiles, cards, accordion, stats, prose, listings, people…
      forms.css               form layout, errors, status messages (form pages only)
      pages/home.css          homepage-only arrangement
    js/
      main.js                 entry point; loads modules only when a page needs them
      nav.js                  menu toggle, dropdowns, aria-current
      search.js               header search panel, live results, /search/ page
      accordion.js            <details> groups: hash links, one-open fallback
      counters.js             animated stats read from data-count
      register-search.js      "Check the teacher register" behaviour
      forms.js                validation, error summary, submit outcomes
      listing.js              filter chips, Open/Closed deadline badges
      map.js                  Google map, loaded only with consent or on request
      share.js                "Copy link" on articles
      cookie-banner.js        consent banner (localStorage + consent:change event)
    data/search-index.json    pages indexed for site search
    img/                      brand/ home/ news/ csr/ about/ people/ icons.svg
    fonts/                    self-hosted Source Serif 4 + Public Sans (latin, variable)
    docs/                     PDFs (Act, Code of Ethics, Regulations)
```

## Templates

Every page is built from one of six templates. Copy the matching file from `templates/` to start a new page. Each file has instructions in a comment at the top.

| Template | File | Used by |
|---|---|---|
| Home | `index.html` | Homepage |
| Standard content | `templates/content.html` | About, Regulatory Instruments, Leadership, Privacy, Cookie Policy, hub pages |
| Service | `templates/service.html` | The 7 service pages: description, numbered sub-services, call to action, "All services" sidebar |
| Listing | `templates/listing.html` | News, CSR, Press Releases, Publications, Notices, Events, CPD Events and Providers, Tenders and RFQ, Jobs, Galleries, Teacher Stories. Includes filter chips and an empty state |
| Single article | `templates/article.html` | The 7 news and CSR articles: meta, figure, prose, share links, related articles, NewsArticle structured data |
| Contact / form | `templates/form.html` | Contact, misconduct report (on the Code of Ethics page), supplier registration |

### Adding or changing a page

1. Copy a template and edit the `<head>`: title, description, canonical and `og:` tags.
2. Add the URL to `sitemap.xml`, and an entry to `assets/data/search-index.json` so site search finds it.
3. To change the header or footer, edit `partials/header.html` or `partials/footer.html`, then run:

```bash
python tools/sync-partials.py
```

`--check` lists pages that are out of date without changing anything.

## CSS architecture

The files load in order of increasing specificity, so later files build on earlier ones without fighting them:

1. **tokens.css** holds every value: colours, the fluid type and space scales, radii, shadows, durations, z-indexes and layout sizes. Components never contain raw hex codes or pixel sizes. `.theme-ink` re-points the semantic tokens (`--text`, `--link`, `--focus-color`…) so any component works on dark sections unchanged.
2. **base.css** contains element defaults only: typography, links, focus rings, form fields, reduced motion, print.
3. **layout.css** has the primitives (`.container`, `.section`, `.stack`, `.cluster`, `.grid-auto`, `.layout-sidebar`) and the regions shared by every page: the header, the inner-page header and the footer.
4. **components.css** has self-contained blocks used across templates.
5. **forms.css** and **pages/home.css** load only on the pages that need them.

The CSS is about 11 KB gzipped in total, and a typical inner page loads about 10 KB of it. All JavaScript together is about 11 KB gzipped, and each page loads only the modules it uses. The only literal values outside `tokens.css` are the media-query breakpoints, because CSS can't read custom properties there. They are 22.5em, 30em, 48em, 64em and 80em, listed at the top of `base.css`.

## Design system ("Gazette")

| | |
|---|---|
| Ink `#13202F` | text, dark sections |
| Paper `#F8F6F1` | page background |
| Action `#1F5A8A` | links, primary buttons (6.7:1 on paper, 7.3:1 with white text) |
| Logo sky `#619DC4` | rules and accents only, never body text |
| Ochre `#9A4F12` | misconduct, alerts, focus ring on light backgrounds |
| Headings | Source Serif 4 (echoes the serif BOTEPCO wordmark) |
| Body / UI | Public Sans |

Every text/background pair was checked against WCAG 2.1 AA. Fonts are self-hosted, so no visitor data goes to Google before consent.

## Progressive enhancement

Everything works with JavaScript off:

- **Menu:** the Menu button is a link to `#site-menu` (`:target`), and desktop dropdowns open on hover and focus.
- **Accordions:** FAQs and biographies use native `<details>`.
- **Search:** the search button links to `/search/`.
- **Listings:** all items are shown, and the filter chips only appear with JS.
- **Register check:** the form goes to the Teacher Verification page.
- **Map:** a plain link to Google Maps is shown instead of the embed.
- **Forms:** they get native browser validation and post to their `action`. A `<noscript>` note gives the email alternative until a backend exists.

With JavaScript on, those become accessible widgets:

- `aria-expanded` on disclosures, Escape to close, and arrow keys in dropdowns.
- `aria-current` set from the URL, so header markup stays identical on every page.
- Live search, filter chips with a polite status message, and Open/Closed badges computed from today's date.
- Form errors next to each field plus an error summary, with focus management.
- Count-up stats, skipped when the visitor prefers reduced motion.

## URL map (old → new)

| Old | New |
|---|---|
| `/teacher-registration-and-licensing/` etc. | `/services/<service>/` |
| `/teacher-code-of-ethics/`, `/code-of-professional-ethics/` (404 on the old site) | `/services/code-of-ethics/` |
| `/leadership/`, `/regulatory-instruments/` | `/about/leadership/`, `/about/regulatory-instruments/` |
| `/cpd-providers-2/`, `/cpd-events/` | `/cpd/providers/`, `/cpd/events/` |
| `/news/<slug>/` | `/media/news/<slug>/` (AFTRA story shortened to `/media/news/aftra-13th-conference-15th-round-table/`) |
| `/news-copy/` (Galleries) | `/media/galleries/` |
| `/press-releases/`, `/publications/`, `/notices/`, `/teacher-stories/`, `/events/` | `/media/…` |
| `/tenders/`, `/tender/*`, `/rfq/*` | `/procurement/tenders/` |
| `/supplier-registration/` | `/procurement/supplier-registration/` |
| `/cookie-policy-za/` | `/cookie-policy/` |
| Old PDF URLs (Act, Code, Regulations) | `/assets/docs/…` |

All of these are 301 redirects in `.htaccess`. New hub pages: `/services/`, `/cpd/`, `/media/`, `/procurement/`.

## Placeholder content (replace before launch)

Where the old site had no real content, the pages now carry **realistic dummy content** so the design reads as finished. Dummy content is **not** official BOTEPCO information: figures, dates, press releases, notices, vacancies and quotes are invented placeholders.

- **Find them in code:** every placeholder element carries a `data-placeholder` attribute describing what to replace (45 in total). Run `grep -rn data-placeholder --include=*.html .`
- **See them on the page:** add `?placeholders` to any URL (for example http://localhost:8080/?placeholders). Each placeholder gets a dashed outline. Without the parameter, the design is unchanged.
- **When replacing one:** swap in the real content and delete its `data-placeholder` attribute. Placeholder PDFs use the final file names, so the real documents can simply overwrite them; update the file size shown next to the link.

| Page | Placeholder | Replace with |
|---|---|---|
| Home | **Registered teachers: 2,850** (as at 30 Sep 2026) and **Registered CPD providers: 2** | Official figures and as-of date |
| Home, Regulatory Instruments | Summary text for the **BOTEPCO Regulations** | Approved one-sentence summary |
| Home, Regulatory Instruments | `assets/docs/professional-teaching-standards.pdf` (a one-page placeholder, 86 KB) | The official Professional Teaching Standards PDF |
| Publications | `assets/docs/annual-report-2024.pdf` (a one-page placeholder, 79 KB) | The final Annual Report 2024 |
| Leadership | **Executive Management biographies**: role descriptions only, with no personal details | Approved biographies |
| Professional Development | Descriptions of the **5 sub-services** | Approved wording |
| Student Registration | **How to apply** steps (TRLS account, Omang or passport, proof of enrolment) | Confirmed process and documents |
| Research & Advocacy | "Get involved" description | Current initiatives |
| CPD Providers | Botswana Accountancy College and Botswana Examinations Council (names from draft records on the old site; descriptions are dummy) | Confirmed list of registered providers |
| CPD Events | Two events from the old site (may be test entries) | Confirmed events |
| Press Releases | 6 items (titles from the old site; dates and summaries are dummy) | Real press releases and their PDFs |
| Notices | 3 notices (renewal reminder, Botswana Day closure, TRLS maintenance) | Real notices |
| Teacher Stories | 2 stories (titles and names from the old site, photos from a BOTEPCO event; quotes are dummy) | Verified stories, used with the teachers' consent |
| Events | 2 dummy events, plus the website launch from the old site with a dummy description | Real events |
| Galleries | One album per news or CSR story, each using that story's single photo | Full photo albums |
| Tenders & RFQ | Descriptions of the 2 tenders and 1 RFQ (titles, references and dates are from the old site) | Confirmed details, invitation documents and addenda |
| Jobs | 2 dummy vacancies (Registration and Licensing Officer, ICT Systems Administrator) | Real vacancies, or remove them to show the empty state |

### Still to confirm with BOTEPCO (not placeholders)

| Topic | What's needed |
|---|---|
| Help and homepage FAQ | **Resolve the contradictions.** Help says licences last 60 months (citizens) or 36 months (non-citizens); the homepage FAQ describes an annual 1 Jan–31 Dec cycle. The requirements lists also differ (3 items vs 6) |
| Home | The as-of date for "1,271 licensed teachers" (from the TRLS launch article) |
| News | **Publication dates.** The old site shows its WordPress dates (7 Sep 2026) for the three news stories |
| Help | Whether to keep the **Tidio live chat**. It must only load after consent |
| Cookie Policy, Privacy Notice | A **legal review** against the Data Protection Act, No. 18 of 2024. The cookie paragraph in the Privacy Notice mentions non-essential cookies that this site doesn't set |
| Teacher register search, forms | A **backend** (see below) |
| Global | The **production domain**, and which **Regulations PDF** is current (two different files existed; the newer `…Gazzetted-1.pdf` is used) |
| Global | Social media accounts. None were linked on the old site |

### Editorial changes made during the rebuild

- **Spelling and grammar:** fixed "PROFESSONAL", "Techer" and "Board Directors provides", and repaired the corrupted Help question "What arWhat is…".
- **Headings:** news headlines are in sentence case instead of all capitals.
- **Privacy Notice:**
  - The placeholder heading "Add Your Heading Text Here" is now "What Information Do We Collect?".
  - The subtitle copied from the About page was replaced with the notice's own summary sentence.
  - "Cookie Notice" now links to the Cookie Policy.
- **Mandate:** shown as a lettered list (a)–(p), so "under paragraph (g)" makes sense again.
- **Contact form:**
  - The phone field accepted only 7 digits. It now accepts 7- or 8-digit Botswana numbers, with or without +267.
  - The name field no longer rejects apostrophes and hyphens.
  - The data-protection consent box is now required. It was optional, which isn't valid consent.
- **Supplier form:**
  - "TRLS Web Infrastructure Hosting" had no checkbox; it now has one.
  - The duplicate "Actuarial Assessment Services" under IT & Telecoms was removed. It's still listed under Finance.
- **Not carried over:**
  - The designer credit ("Designed By Host Guru").
  - The view counters.
  - The "0 min read" labels. Reading times are now calculated from word counts.
  - The Instagram "share" link, which only opened instagram.com.
- **Left as on the old site, for BOTEPCO to confirm:**
  - The Vice Chair is "Ms." in the name but "Dr." in the old photo alt text.
  - "Mphutshana" in the name vs "Mputshana" in the biography.
  - The Regulatory Instruments intro says "three core pillars" but four documents are listed.

## Images and files

All images and PDFs are stored locally, re-encoded to WebP with explicit `width`/`height`, with responsive `srcset` where larger originals existed.

| Local | Source on the old site | Note |
|---|---|---|
| `img/home/board-*.webp` | `uploads/2026/09/Board.webp` | 640/960/1216 widths |
| `img/news/*-350.webp` | `uploads/2026/09/*-LATEST-UPDATES-AND-NOTICES.webp` | Originals are only 350×250. Larger photos would look sharper |
| `img/csr/*-{480,960}.webp` | `uploads/2024–2025/*CSR*.png`, `GBV-Project-*.png` | 2–3 MB PNGs reduced to 24–97 KB |
| `img/people/*.webp` | `uploads/2026/09–10/*-240x300.jpg` | 21 portraits. Larger originals would look sharper on the 4-column grid |
| `img/about/hq-building-500.webp` | `uploads/2026/09/BOTEPCO-buidling.webp` | |
| `img/brand/botepco-logo*.webp` | `uploads/2026/08/botepco_logo.webp` | Reverse version made for the dark footer. An SVG logo would be better |
| `img/brand/og-image.jpg` | Cropped from `Board.webp` | 1200×630 social sharing image |
| `docs/botepco-act-2019.pdf` | `uploads/2026/10/BOTEPCO-ACT.pdf` | 283 KB |
| `docs/teacher-code-of-ethics-2025.pdf` | `uploads/2026/10/Teacher-Code-of-Ethics-Booklet-2025.pdf` | 2.8 MB. A compressed version would help mobile users |
| `docs/botepco-regulations.pdf` | `uploads/2026/11/BOTEPCO-Regulations-Gazzetted-1.pdf` | 115 KB |
| `img/stories/teacher-story-{1,2}.webp` | `uploads/2026/09/Teacher-1.jpg`, `Teacher-Lady.jpg` | Photos from a BOTEPCO event, used for the placeholder teacher stories |
| `docs/professional-teaching-standards.pdf`, `docs/annual-report-2024.pdf` | Created for the rebuild | One-page **placeholders**. Overwrite them with the real documents |

Deliberately **not** carried over: `Tax-Clearance-Certificate*.pdf` (`.htaccess` answers 410 Gone for it), `Annual-Report-Sample-1.pdf`, `TENDER-ADDENDUM-2.pdf` (mislabelled as the invitation to tender), and the demo gallery images.

## Backend needs

### Teacher register search

The behaviour is already fully defined in `register-search.js`. Set `data-endpoint` on the form (homepage and Teacher Verification page), for example `data-endpoint="/api/register-search"`. The script then POSTs `{ "name": "First Last" }` and expects:

```json
{
  "results": [
    {
      "fullName": "…",
      "registrationNumber": "…",
      "registrationStatus": "registered | not-registered | removed",
      "licenceStatus": "valid | expired | none",
      "licenceExpiry": "YYYY-MM-DD"
    }
  ]
}
```

| Response | What the visitor sees |
|---|---|
| Matches | A list with registration and licence status |
| Empty list | "No registered teacher matches…" |
| Error | "We couldn't reach the register…" |

Names go in the request body, never the URL.

**Suggested approach:** TRLS already holds the register. Add a read-only endpoint to TRLS (or a nightly export to a small serverless function) that returns only public fields, with rate limiting and a minimum query length.

### Forms

Each form has an `action` and `data-live="false"`. While it's false, submitting shows "This form isn't connected yet", sends nothing, and keeps the visitor's answers. Once the endpoint works, set `data-live="true"`. The script then POSTs the form as `multipart/form-data` and shows a success or failure message.

| Form | Page | `action` | Fields |
|---|---|---|---|
| Enquiry | `/contact/` | `/api/forms/contact` | full_name, phone, email, subject, message, consent |
| Misconduct report | `/services/code-of-ethics/#report-misconduct` | `/api/forms/misconduct` | name, phone, email, misconduct_date (all optional), location, description, evidence (file) |
| Supplier registration | `/procurement/supplier-registration/` | `/api/forms/supplier-registration` | company_name, tin, certificate_number, directors, description, ppadb_codes (file), cipa_certificate (file), postal_address, phone, email, physical_address, citizen_owned, owner_description[], owner_description_other, shareholders, categories[] |

**Suggested approach:** one small server-side handler, such as a PHP script on the same Apache host or a serverless function. It should:
- validate again on the server
- check file type and size
- add rate limiting and a honeypot field or CAPTCHA
- email the right inbox (`enquiries@`, `ethics@`, procurement)
- store the submission in a case or ticket system

Misconduct reports and supplier documents contain personal and sensitive data. Store them securely, limit who can access them, and set retention in line with the Data Protection Act, No. 18 of 2024 and the Privacy Notice. Don't send evidence files only as email attachments.

### Search

Search is client-side and needs no backend. Keep `assets/data/search-index.json` up to date when pages are added. If the site grows past a few hundred pages, consider a hosted search service.

## QA tools

Results of the final QA run are in [`REPORT.md`](REPORT.md). Two tools in `tools/` let you repeat it after changes. Both read the page list from `sitemap.xml`.

| Tool | What it does | How to run it |
|---|---|---|
| `tools/qa.html` | Contact sheets of every page at one width. With `?mode=check`, it also checks every page at 375/768/1440 px for horizontal overflow, clipped text, broken images, small tap targets and JS errors | Open http://localhost:8080/tools/qa.html in a browser |
| `tools/capture.mjs` | Full-page screenshots of every page at 375/768/1440 px using headless Chrome. Records console errors, failed requests and overflow in `report.json`. Needs Node 22+ and Chrome; set `CHROME=` if Chrome isn't in the default Windows location | `node tools/capture.mjs http://localhost:8080 tools/screenshots` |

`tools/screenshots/` holds the 123 screenshots from the final run, plus `tasks/` with the mobile task walkthrough.
