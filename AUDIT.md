# BOTEPCO website audit (Phase 1)

Source: https://uat.botepco.org.bw/ (WordPress, Hello Elementor theme, Elementor 4.3.4), crawled 3 Nov 2026.
Method: every menu page plus every detail page listed in `wp-sitemap.xml` was fetched and parsed. The homepage was also checked visually at 1440px and 375px.

---

## 1. Brand

| Item | Value | Notes |
|---|---|---|
| Logo | `wp-content/uploads/2026/08/botepco_logo.webp` (589×100) | Black high-contrast serif wordmark "BOTEPCO" plus a mark made of black and sky-blue curved strokes |
| Favicon | `wp-content/uploads/2026/08/botepco_favicon.webp` | WebP only, no ICO/PNG/SVG fallback |
| Logo blue | ≈ `#60A0D0` (measured from logo pixels) | Same as the Elementor global "primary" `#619DC4` |
| Elementor globals | primary `#619DC4`, accent `#4E77FF`, secondary `#1A1A1A`, text `#464646`, extra `#0F172A` (footer navy) | |
| Fonts | Tahoma for every global type style; Open Sans and Roboto also loaded by plugins; Font Awesome + Fontello icon fonts | Tahoma isn't on Android or iOS, so most phones get a random fallback |
| Imagery | Board group photo outside HQ (hero, `2026/09/Board.webp`), HQ building, news photos (TRLS launch, AFTRA, UNICEF), CSR photos, 21 Board and Exco portraits, 3 stats illustrations, FAQ photo, background pattern PNG | |
| Strapline | "A Council You Can Trust" (homepage `<title>`) | |

Contrast problems in the current palette:
- White text on the `#4E77FF` buttons is **3.88:1**. That fails WCAG AA for normal text, which needs 4.5:1.
- `#619DC4` used as text on white is **2.95:1**, which also fails.

---

## 2. Issues

### 2.1 Issues from the brief (all confirmed)

| # | Issue | Where | Detail |
|---|---|---|---|
| 1 | Lorem ipsum in the "BOTEPCO Regulations" card | Home | The Download button links to `2026/11/BOTEPCO-Regulations-Gazzetted-1.pdf` |
| 2 | "PROFESSONAL TEACHING STANDARDS" is misspelled, and its Download button links to the Regulations PDF | Home, Regulatory Instruments | Links to `2026/10/BOTEPCO-Regulations-Gazzetted.pdf`. No Teaching Standards PDF exists anywhere on the site. "Gazzetted" is also misspelled in the file names |
| 3 | Stat counters | Home | The HTML says "Cool Number" with `0`, and the counters animate to **100** in the browser. The only sourced figure on the site is "1,271 teachers have been licensed to date" (TRLS news article, no as-of date). There are no figures for registered teachers or CPD providers |
| 4 | "0 min read" | Every news/CSR card and article | View counters ("2031 views" etc.) are UAT test values |
| 5 | Supplier Registration tile has no link | Home > Self Service | |
| 6 | Footer links to `/code-of-professional-ethics/`, which returns **404** | Footer, plus the "All Services" sidebar on all 7 service pages | The real page is `/teacher-code-of-ethics/` |
| 7 | Leftover slugs | Menu | Galleries is `/news-copy/`. CPD Providers is `/cpd-providers-2/`, and `/cpd-providers/` redirects to it |
| 8 | `?utm_source=chatgpt.com` on the TRLS signup link | Home FAQ Q2 | |
| 9 | Teacher name search has no result behaviour | Home | It's a generic form-builder form (`auto-form-builder`, form id 1, the same plugin as Contact). It posts to `admin-ajax.php` as a form submission rather than querying the register, so typed names are stored as entries and no result UI exists. (I didn't submit it on the live site.) |

### 2.2 Other placeholder or wrong content

| Severity | Issue | Where |
|---|---|---|
| **Urgent** | All 6 press releases have lorem ipsum bodies, and their "View Press Release" buttons link to **`Tax-Clearance-Certificate-2026-2027.pdf` / `Tax-Clearance-Certificate-1.pdf`**. That publishes a tax compliance document as a press release. Remove it from UAT now, not just in the rebuild | `/press-release/*` |
| High | "2024 Financial Year Report" lives at slug `2025-financial-year-report-2` | Press releases |
| High | Annual Report 2024 links to `Annual-Report-Sample-1.pdf`, and its button says "View Press Release" | `/publication/annual-report-2024/` |
| High | The only gallery item is demo content: "Garage Doors Viewing" (Phakalane), lorem ipsum, generic images, unrelated YouTube link | `/gallery/garage-doors-viewing/` |
| High | Teacher Stories: all copy is lorem ipsum; "Mr. Lotsebe" and "Mrs. Mojalefa" are unverified; typo "Techer" | `/teacher-stories/` |
| High | Professional Development: "CPD Activity Submission" description is lorem ipsum. The other 4 sub-services have no description | `/professional-development/` |
| High | Tenders: lorem ipsum addendum text. Says "This tender has no addendums present" but shows addendum buttons with empty `href`. "Invitation to Tender" links to `TENDER-ADDENDUM-2.pdf`. Tender Class is blank. The RFQ is entirely lorem ipsum | `/tender/*`, `/rfq/*` |
| High | CPD Providers page says "Coming Soon", but 2 provider records exist (Botswana Accountancy College, Botswana Examinations Council) with lorem ipsum descriptions | `/cpd-providers-2/`, `/cpd-provider/*` |
| Medium | CPD Events and Events are a JS calendar that renders nothing without JS. The 3 entries look like test data (times "00:00:00", meeting link = botepco.org.bw) | `/cpd-events/`, `/events/` |
| Medium | Data Privacy Notice has a section titled "**Add Your Heading Text Here**", and its subtitle is copied from About ("Learn about our Mandate, Mission statements and Regulatory Instruments") | `/data-privacy-notice/` |
| Medium | The cookie policy is a Complianz **South Africa ("ZA")** template; it should be written for Botswana's Data Protection Act 2024 | `/cookie-policy-za/` |
| Medium | Help: a corrupted question reads "What arWhat is Continuous Professional Development (CPD)?e the requirements…" | `/help/` |
| Medium | **FAQs contradict each other.** Home FAQ: annual licensing cycle 1 Jan–31 Dec, 6 required documents. Help: licence valid 60 months (citizens) / 36 months (non-citizens), 3 documents. BOTEPCO needs to confirm which is correct | Home, Help |
| Medium | Inconsistent contact details: `helpdesk@botepco.org.bw` (Help), `enquiries@botepco.org.bw` (everywhere else), `ethics@botepco.org.bw` (footer). Phone is written "3933472" or "(+267) 393 3472" | Help, footer |
| Medium | News posts all say "September 7, 2026 by admin" although the events happened in Oct 2025 and May 2026 (these are WordPress publish dates) | News |
| Low | The Act is named two ways: "Botswana Teaching Professionals Act No. 22 of 2019" (About) and "Botswana Teaching Professionals Council Act, No. 22 of 2019" (Home) | About, Home |
| Low | Mandate item "Monitor adherence to the Code of Ethics under paragraph (g)" no longer makes sense, because the bullet list dropped the (a)–(p) lettering | About |
| Low | Leadership: Vice Chair photo alt says "Dr." but the name says "Ms."; "Mphutshana" (name) vs "Mputshana" (bio); the 6 Exco members have no bios; one portrait has empty alt; "Board Directors provides…" | `/leadership/` |
| Low | Supplier form: "Actuarial Assessment Services" appears under both Finance and IT & Telecommunications | `/supplier-registration/` |
| Low | Share bar: "Instagram" only opens instagram.com. The X button is labelled "Share" and the Facebook button "Post" | Articles |
| Low | The homepage "Latest Notices & Updates" section shows News, while the Notices page is empty | Home, `/notices/` |
| Low | Breadcrumbs link to WordPress category archives (`/category/media-center/...`) | Articles |

### 2.3 UX, accessibility and performance

- **Service pages have no call to action.** Teacher Registration & Licensing never links to TRLS, and Teacher Verification has no way to verify.
- **On mobile the header hides both the logo and the Teacher Portal button.** Only the hamburger shows.
- Parent menu items (About Us, Services, CPD Resources, Media Hub, Procurement, Contact) are `href="#"`, so they are dead ends without JS.
- Homepage has **no `<h1>`** (the hero title is an `h2`), and heading levels jump h2 → h5 → h4 → h3.
- No skip link and no `<nav>` landmark. `header`, `main` and `footer` each appear 4 times (nested templates).
- Entrance animations (fadeInUp, bounceIn…) hide content until it scrolls into view, which leaves large blank areas.
- 4 of 14 homepage images have no `alt`, and 8 have no `width`/`height`.
- Pages have no meta descriptions and no Open Graph tags. Only article pages have a description.
- Homepage weight: 77 requests, 28 scripts, 39 stylesheets, 248 KB of HTML (uncompressed), 5 font sources.
- Third parties: Tidio live chat (the Help page says "click the chatbot icon"), a Google Maps iframe, Google Fonts, and the Complianz consent banner.

---

## 3. Page-by-page inventory

Legend: ✅ real content · ⚠️ partly placeholder · ❌ placeholder or empty

### Shared header
- Logo → home. Mega menu: Home · About Us (About BOTEPCO, Leadership, Regulatory Instruments) · Services (7) · CPD Resources (Providers, Events) · Media Hub (News, Press Releases, Publications, Notices, Teacher Stories, Events, Galleries) · Procurement (Tenders & RFQ, Supplier Registration) · Jobs · CSR · Contact (Get in Touch, Help)
- "Teacher Portal" button → https://trls.gov.bw/customer/signin
- Search icon → Ajax Search Lite overlay

### Shared footer
- **Services**: the 7 service pages (Code of Professional Ethics → 404)
- **Self Service**: FAQ, Supplier Registration, Contact Us, Access TRLS, Job Vacancies, Tenders & RFQ, Data Privacy Notice
- **Media Center**: News, Press Releases, Publications, Notices, Teacher Stories, Events, Galleries
- **Office hours and contacts**: Mon–Fri 08:00–17:00 · Sat–Sun Closed · Holidays Closed · (+267) 393 3472 · enquiries@botepco.org.bw · Plot 63726 Fairgrounds, Gaborone
- Misconduct strip: "Report a misconduct, Complete a Misconduct Form (`/teacher-code-of-ethics/#misconduct`) | Email: ethics@botepco.org.bw | Call: +(267) 393 3472"
- "Copyright © 2026 BOTEPCO | All rights reserved. Designed By Host Guru."

### Home `/` ⚠️
Purpose: front door and task launcher.
1. Hero: "BOTSWANA TEACHING PROFESSIONALS COUNCIL", "Regulating and advancing a professional, ethical and competent teaching profession for quality education in Botswana.", [About Us]. Background `Board.webp`.
2. Key documents (4 cards): BOTEPCO Act ✅ · Code of Ethics ✅ · BOTEPCO Regulations ❌ lorem ipsum · Professional Teaching Standards ⚠️ (misspelled, wrong PDF)
3. Self Service: intro text, teacher name "search" ❌, tiles Teacher Portal (TRLS) · Supplier Registration (no link) · CPD Calendar · FAQ's
4. Stats ❌: Registered Teachers / CPD Providers / Licensed Teachers (images only, "Cool Number")
5. Latest Notices & Updates: intro and the 3 latest news cards
6. FAQ: 5 accordion items + "Load more questions" → /help/. Contains the utm link
- Files: BOTEPCO-ACT.pdf, Teacher-Code-of-Ethics-Booklet-2025.pdf, BOTEPCO-Regulations-Gazzetted-1.pdf, BOTEPCO-Regulations-Gazzetted.pdf

### About `/about/` ✅
Subtitle "Learn about our Mandate, Mission statements." · About BOTEPCO (2 paras) · Mandate (16 items) · building photo · Our Values (Customer-centricity, Excellence, Agility, Professionalism, Transparency, Employee-focus, each with a sentence) · Vision "Building internationally acclaimed teaching professionals." · Mission.

### Leadership `/leadership/` ⚠️
Tabs: Board / Exco. Board intro paragraph and **15 board members** with photo, constituency and 2-paragraph bio (popup). Exco intro and **6 executives** (Registrar Dr Raphael Dingalo, Director Digital Transformation & Innovation, Director Legal Service & Board Secretary, Director Ethics & Standards Compliance, Director Corporate Services, Director Risk & Internal Audit) with photo and title only, no bio. Images: 21 portraits at 240×300 and full size.

### Regulatory Instruments `/regulatory-instruments/` ⚠️
Intro paragraph and 3 download cards: Act ✅, Teaching Standards ⚠️ (wrong PDF), Code of Ethics ✅. The Regulations PDF isn't offered here.

### Service pages ⚠️ (shared template: hero, "Service Description", "Sub Services" accordion, "All Services" sidebar)
| Page | Sub-services | Status |
|---|---|---|
| Teacher Registration & Licensing | Application for Registration and Licensing · Restoration to the Register · Change of Registration Category · Removal from the Register · Annual Membership Subscription · Licence Renewal · Student Teacher Registration (each with a description) | ✅ text, no TRLS link |
| Student Registration | Student Registration | ✅ thin |
| Professional Development | CPD Activity Submission (lorem ipsum) · Registration of CPD Providers · CPD Framework · CPD Points/Status Verification · Professional Learning Calendar (no descriptions) | ❌ |
| Teacher Verification | Verify Registration Status · Verify Licence Status · Professional Status Verification for Employers | ✅ text, no verify tool |
| Teacher Code of Ethics (page H1 is "Code of Professional Ethics") | **Report Professional Misconduct** (with form) · Ethics Awareness · Ethics Advisory · Case Management | ✅ |
| Customer Support | Customer Support Helpdesk | ✅ thin |
| Research & Advocacy | Research and Policy Initiatives · Teaching Profession Advocacy | ✅ thin |

### CPD Providers `/cpd-providers-2/` ❌ "Coming Soon"
### CPD Events `/cpd-events/` ❌ JS calendar, 2 test entries (Conflict Resolution Fundamentals, Dealing with Slow Learners)
### News `/news/` ✅
Filters (sort, category, tag, date) and 3 articles plus "Load More".
- *Strengthening the professionalisation of teaching*: TRLS launched 21 Oct 2025, 1,271 teachers licensed.
- *Botswana hailed for hosting AFTRA 13th Conference & 15th Round Table*: 5–8 May 2026, GICC, quotes from President Boko.
- *BOTEPCO and UNICEF strengthen teacher professional development*: Digital Literacy, Teaching Standards, Code of Ethics.
### Press Releases `/press-releases/` ❌ 6 lorem ipsum items (see Urgent above)
### Publications `/publications/` ⚠️ Annual Report 2024 (first paragraph real; PDF named "Sample")
### Notices `/notices/` ❌ empty
### Teacher Stories `/teacher-stories/` ❌ lorem ipsum
### Events `/events/` ❌ JS calendar, 1 entry ("BOTEPCO Website Launch", Molapo Crossing, 29 Sep 2026)
### Galleries `/news-copy/` ❌ demo item
### Tenders & RFQ `/tenders/` ⚠️
Tabs Tenders / RFQ:
- Supply of Printers & Servicing for Two Years: ref BOTEPCO-2026/2027-SP, closes 26 Nov 2026
- Maintenance of BOTEPCO Website for Three Years: ref BOTEPCO-2026/2027-ICT, closes 27 Nov 2026
- RFQ for General Cleaning Services: closes 25 Nov 2026

Detail pages are mostly placeholder. **BOTEPCO needs to confirm these are real.**
### Supplier Registration `/supplier-registration/` ✅ form
4-step form, 55 fields:
1. Company details: name, TIN, certificate no., directors, office location and description, PPADB codes upload, CIPA certificate upload
2. Contacts: postal address, contact number, email, physical address
3. Ownership: 100% citizen owned yes/no; youth/women/disabled owned; shareholders
4. 11 category groups with about 34 checkboxes
### Jobs `/jobs/` ❌ empty ("It seems we can't find what you're looking for.")
### CSR `/csr/` ✅
4 articles: GBV Project 2025 (25 Nov 2025), GBV Project 2024 (Dec 2024), Tashata JSS (Oct 2024), Sowa Primary School (12 Jul 2024). All are real stories with photos, filed under /news/ with category CSR.
### Contact `/contact/` ✅
Form fields: Full Name, Phone, Email, Subject (General Inquiry / Service Inquiry / TRLS / Complaint), Message, DPA 2024 consent. Also contact details, operating hours, and a Google Map (-24.676799, 25.924285).
### Help `/help/` ⚠️
3 tabs (Registration & Licensing: 11 Q&As · Teaching Professional Standards: 2 · CPD: 1, corrupted) · "Still Need Help" chatbot prompt · contacts.
### Data Privacy Notice `/data-privacy-notice/` ⚠️
14 sections: Who are we, To whom, [placeholder heading] what we collect, How we collect, Why, Legal basis, Sharing, Security, Rights, Retention, Cookies, Changes, Contact.
### 404 ✅ "The page can't be found."

---

## 4. Files to carry over

| File | Use | Carry over? |
|---|---|---|
| `2026/10/BOTEPCO-ACT.pdf` | Act | Yes |
| `2026/10/Teacher-Code-of-Ethics-Booklet-2025.pdf` | Code of Ethics | Yes |
| `2026/11/BOTEPCO-Regulations-Gazzetted-1.pdf` | Regulations | Yes, renamed `botepco-regulations.pdf` (BOTEPCO to confirm it's the gazetted version) |
| `2026/10/BOTEPCO-Regulations-Gazzetted.pdf` | Duplicate, wrongly used for Teaching Standards | Only if it differs from `-1` |
| Professional Teaching Standards | — | **Missing**, needed from BOTEPCO |
| `2026/11/Annual-Report-Sample-1.pdf` | Annual Report 2024 | Only once BOTEPCO confirms it's final |
| `2026/09/TENDER-ADDENDUM-2.pdf` | Printer tender | Only once confirmed |
| `2026/09/Tax-Clearance-Certificate*.pdf` | Wrongly linked from press releases | **No** |

---

## 5. Questions for BOTEPCO
1. Which licensing rules are correct: an annual 1 Jan–31 Dec cycle, or 60/36-month validity? Which requirements list is current?
2. Current figures for registered teachers, licensed teachers and registered CPD providers, with an as-of date.
3. The Professional Teaching Standards PDF, and a real summary for the Regulations card.
4. Are the 3 tenders/RFQ and the 3 calendar events real?
5. Real press releases, notices, teacher stories, gallery albums, CPD provider list, and Exco bios.
6. One public contact email for help (`enquiries@` or `helpdesk@`).
7. Keep Tidio live chat? It's a third-party script and should only load after consent.
8. Social media accounts. None are linked anywhere on the current site.
