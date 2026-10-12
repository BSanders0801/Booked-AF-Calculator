# BOOKED AF — Brand Retrofit Release Review
2026-10-11 | Status: staged for review only (NOT ready for live merge)

## Implemented on review branch
- index.html + site-content.js: five-section brand-led homepage, single primary free Breakdown action, visible $49 paid offering, existing unaltered founder image, less competing content.
- app.js: paid-screen headline rewritten without profanity; clarify free-to-paid connection; results presentation labels and next action tightened; first name field marked required.
- Original branch, Stripe checkout URL, diagnostic scoring, calculations, paid entitlements, worker endpoints, and existing educational logic left unchanged.
- Prior four brand audit files remain in reviews/.

## Remaining important work
1. Verify active short-v5, fallback, student, chair, salon owner/manager, session, bridal and educator pathways end-to-end.
2. Test first-name required in browser: HTML attribute alone may not enforce in custom submit handlers. Verify both client and backend behavior.
3. Confirm short-form ~3-minute claim with timed users.
4. Verify homepage static and dynamically generated pages match; remove any stale cached build artifacts or service worker content after approval.
5. Validate accessibility, contrast, nav focus, narrow mobile screens, scrolling, keyboard.
6. Verify Stripe test-mode checkout, success return, welcome email link, recovery path, post-purchase intake, plan persistence and cross-device limitation.
7. Review customer emails and paid educational scripts for voice, accuracy, overpromising and paid/free IP leakage.
8. Check exact copy against public profanity policy.
9. Validate JS syntax/build and mobile rendering in CI or development browser. Remote checkout and live payments must NOT be exercised as tests.
10. Do a moderated five-second test with an unfamiliar hairdresser. Ask: who is this for, what does it do, what do you click and what's $49?

## Release gate
DO NOT merge/deploy without end-to-end tests and user's approval. Do not mistake these copy changes for a proven conversion improvement. Measure free-to-paid conversions after any controlled release.
