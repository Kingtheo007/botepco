# BOTEPCO rebuild: final report (3 Nov 2026)

## QA results

| Check | Result |
|---|---|
| Layout at 375 / 768 / 1440 px, all 41 pages (overflow, clipped text, broken images, target size, JS errors) | **Pass** after fixes. `tools/qa.html?mode=check` |
| Full-page screenshots of every page at every width | **123 screenshots** in `tools/screenshots/`. `node tools/capture.mjs` |
| Console errors and failed requests during those 123 page loads | **0** |
| Internal links and anchors | **0 broken**: static check of about 4,200 links and assets, plus HTTP check of 95 unique URLs |
| External links (TRLS sign-in and sign-up, Google Maps, Google privacy policy) | **All respond** |
| Contrast (rendered text, 18 pages) | **Pass.** One failure, the event date blocks, fixed from 2.17:1 to 15:1 |
| Accessible names and landmarks (accessibility tree, 41 pages, 1,922 links, buttons, fields and images) | **0 problems.** Every page has banner, navigation, main and footer landmarks |
| Mobile task walkthrough at 375 px (screenshots in `tools/screenshots/tasks/`) | **14/14 pass**: register or renew (TRLS), verify a teacher, find CPD, report misconduct, contact via the menu, search |
| Keyboard | **Pass**: skip link first and moves focus to main; visible focus ring; dropdowns work with Enter, arrows and Escape; FAQs open with Enter |
| Reflow and zoom (320 px ≈ 400%, 768 px ≈ 200%) | **No horizontal scroll** |
| `.htaccess` on a real Apache 2.4 (temporary XAMPP instance) | **All pass**: 44/44 old URLs give a 301 to a live page, custom 404, 410 for the tax certificate, authoring files blocked, no directory listing, security headers, gzip, cache rules |
| Content-Security-Policy (commented out in `.htaccess`) | Turned on for a test: **0 violations** across all 123 page loads, so it's safe to enable |

**Fixed during QA:**
- 24px minimum target for small links; 24px checkboxes and radios
- event date block contrast
- tighter section spacing on phones
- article breadcrumbs end at "News"
- Leadership jump links moved into the Board section
- shorter search placeholder
- search highlighting matches whole words only
- footer always sits at the bottom of short pages

**Not verified:**
- Real screen readers (NVDA, VoiceOver). The accessibility tree is clean, but a quick manual pass with NVDA is still recommended.
- The production domain. `botepco.org.bw` resolves but didn't answer over HTTPS from here, so confirm it before launch. It's used in canonical URLs, Open Graph tags and `sitemap.xml`.

## What changed from the old site

- **Platform:** WordPress/Elementor → plain HTML, CSS and vanilla JS, with no build step. The homepage went from 77 requests (28 scripts, 39 stylesheets) to about 23. The CSS is about 11 KB gzipped and the JS about 11 KB, with each page loading only the modules it uses.
- **Design:** the "Gazette" system. Source Serif 4 and Public Sans (self-hosted), logo-derived colours, and every value as a token in one file.
- **Tasks:** clear routes from the homepage and every page:
  - register or renew on TRLS
  - verify a teacher
  - find CPD
  - report misconduct
  - contact BOTEPCO

  Service pages now have calls to action. The logo and menu work on phones.
- **Problems fixed:**
  - lorem ipsum, "PROFESSONAL", and the wrong Teaching Standards PDF
  - "Cool Number" stats and "0 min read"
  - the unlinked Supplier Registration tile
  - the 404 footer link
  - `/news-copy/` and `/cpd-providers-2/`
  - the `utm_source` link
  - teacher search with no result behaviour
  - tax-certificate PDFs published as press releases
  - the placeholder heading in the Privacy Notice
  - a phone field that rejected mobile numbers
- **Accessibility:** one H1 per page, landmarks, skip link, visible focus, accessible menus, form errors with a summary, reduced motion, and everything works without JavaScript.
- **SEO and privacy:** a unique title and description on every page, Open Graph tags, structured data, `sitemap.xml`, `robots.txt` and 301 redirects. Fonts are self-hosted and the Google map loads only with consent.

## Placeholder content (BOTEPCO to replace)

Gaps are now filled with **realistic dummy content** that uses the existing design, so every page reads as finished. None of it is official BOTEPCO information.

- **45 placeholders on 16 pages**, each tagged with an invisible `data-placeholder` attribute that says what to replace.
- **See them:** add `?placeholders` to any URL and each one gets a dashed outline.
- **Full list:** [README.md](README.md#placeholder-content-replace-before-launch).

In priority order:

1. The **Professional Teaching Standards** and **Annual Report 2024** PDFs, which are currently one-page placeholders, and the **Regulations** summary.
2. The homepage figures: **2,850 registered teachers** and **2 CPD providers** are dummy numbers.
3. **Press releases, notices, events and vacancies.** These are dummy items; the press release titles are from the old site.
4. **Teacher stories** with real quotes and consent, the **CPD provider list**, the **Exco biographies**, and the **Professional Development**, **Student Registration** and **Research & Advocacy** texts.
5. Confirmed **tender** details and documents, and full **gallery** albums.

Still to confirm, separately from the placeholders:
- the **licensing rules** (the Help page and homepage FAQ contradict each other)
- **news publication dates**
- the **Tidio live chat** decision
- a **legal review** of the Cookie Policy and Privacy Notice

## What needs a backend

| Feature | Current behaviour | Suggested approach |
|---|---|---|
| Teacher register search | Clear "not available yet" result with contact details | A read-only TRLS endpoint (or nightly export to a serverless function) returning public fields only, with rate limiting. Set `data-endpoint` on the form; the request and response format is in the README |
| Contact, misconduct and supplier forms | Validated in the browser; says "not connected yet" and keeps the answers | One server handler (PHP on the same Apache host, or serverless) that validates again, checks file uploads, uses a honeypot or CAPTCHA, routes to `enquiries@`, `ethics@` or procurement, and stores data securely under the Data Protection Act 2024. Then set `data-live="true"` |
| Site search | Works now (client-side index) | Nothing needed. Keep `assets/data/search-index.json` updated |

## Launch checklist

1. Confirm the domain and update the canonical, Open Graph and sitemap URLs if it differs.
2. Upload the site as the web root on Apache. Leave out `tools/`, `partials/` and the `.md` files.
3. Enable the CSP and HSTS lines in `.htaccess` on staging, then on live.
4. Replace every placeholder and delete its `data-placeholder` attribute. Before launch, `grep -rn data-placeholder --include=*.html .` should return nothing outside `templates/`.
5. Connect the forms and the register search.
6. Run `node tools/capture.mjs` against staging and check `tools/screenshots/report.json`.
