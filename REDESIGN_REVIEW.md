# BOOKED AF redesign — review branch

## Recovery point
Base: `9b3329e` from `main` (Load verified Your Next 30 payment flow).
Branch: `redesign/brand-ux-preview`. Production has not been modified.
Other existing worktrees have uncommitted work; those files were not overwritten.

## Implemented
- Approved brush logo in site header, footer, founder sections, email capture, and print output.
- Responsive homepage based on the approved visual direction, direct Your Next 30 ($49) page, founder and contact pages, social links, sample plan, and plain-language data explanation.
- Existing real questionnaire, branching recommendations, money calculations, email service and server-verified payment flow retained.
- Stable hash routes with browser Back/Forward support; screen transitions return to top and focus the heading.
- Free quiz/checklist progress saved in this browser for 30 days since last use; no email or name in the new persistent record. Corrupt/unavailable storage handled. No cross-device account claims.
- Calculator displays hourly pay for workday results as well as appointment results.
- Descriptive metadata, social preview referencing the existing approved logo, readable UI text, checkbox labels, focus treatment, and print logo.
- No stock images, invented reviews, scarcity counter, unapproved subscription price, or marketing signup integration.

## Verification completed
- `node tests/short-breakdown.mjs`: 257 answer variations, six navigation paths, short/legacy email parity and logo checks.
- `node --test tests/stripe-welcome.mjs`: three tests covering signed paid checkout, rejecting unrelated/unpaid/forged events, and server-side verification.
- DOM-only integration tests: complete real questionnaire to plan; direct offer; preview purchase prevention; refresh and checklist persistence; return navigation; $200/$50-per-hour calculation; invalid storage; storage failure; paid-route verification cannot be replaced by a saved free plan.
- Browser visual QA is **not complete**: the cloud browser rejected local HTTP/file preview URLs. No claim of physical-phone or rendered responsive testing.

## Before public release
1. Review desktop and mobile rendering at 320, 375, 390, 430 and 1280px, keyboard flow, enlarged text and print output. Run a measured mobile performance/accessibility audit.
2. Review the refined founder portrait and bio in the homepage and Meet Bradley page. Source: Bradley's supplied IMG_6330, with a restrained built-in image edit and 4:5 crop. Bio credentials checked against Bradley_Sanders_Master_Resume.pdf, version 2 (September 17). No brand endorsement is implied.
3. Confirm actual access duration, support scope and refund terms; turn the factual data explanation into a complete reviewed privacy policy. No unapproved promises were added.
4. Test payment confirmation -> return -> paid intake -> plan -> welcome email -> reopen from email in a test environment. Unit tests are not a real delivery test. Worker source has not been redeployed here.
5. Verify live social destinations and apply approved branding to Stripe checkout; this branch does not modify Stripe account settings.
6. Remove preview `noindex,nofollow` before publishing; leave production checkout protections and signed verification intact. Consider proper static public product/about pages for search beyond the current shareable hash routes.
7. Reconcile newer `main` commits before any merge. Publish only after the above gates, keeping the recovery commit available.

## Local review
Serve repository root with `python -m http.server 8765` and open `http://localhost:8765`.
Non-production hosts show a preview banner and intercept the main checkout link.
Email requests still require the existing approved production origin and verification; do not send live email as a preview test.

## Tests
`node tests/short-breakdown.mjs`
`node --test tests/stripe-welcome.mjs`
`npm install --prefix tests && npm test --prefix tests`
