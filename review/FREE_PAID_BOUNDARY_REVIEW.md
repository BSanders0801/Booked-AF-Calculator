# Free / paid content boundary — October 6, 2026

## Problem and change

The free Breakdown, public samples and follow-up emails exposed action checklists, scripts and calculations intended for paid delivery. Public results now use a small allowlist of explanatory copy. Browser results, shared/downloaded text and Worker emails use the same projection. Public samples describe the paid deliverables without reproducing them.

Retired free checklist and Chair Math routes resolve to the Breakdown or relevant offer. Paid plan routes require the existing verified-purchase state. Student results offer FIRST 90 updates while that product remains in development.

## Verification

- `npm test --prefix tests` passed, including 2,692 paid-answer variations, 186 adaptive free-answer variations, 288 student variations and 17 Worker tests.
- Paid UI tests cover calculations, saved entries, reload, export/import into a fresh browser after mocked purchase verification, invalid imports and unverified route rejection.
- `node --test tests/test-isolation.mjs` passed all 6 checks.
- `node scripts/build-website-preview.mjs` packaged the draft and checked local HTML assets.
- `git diff --check` passed.

These are local automated checks using mocked payment/email services. No real checkout, email delivery or live deployment was performed for this revision.

## Limits and release gates

This change removes paid implementation from normal public rendering and email output. Existing paid JavaScript and internal recipes still ship in browser assets; it does not create a server-enforced content distribution boundary against source inspection or deliberate client-state tampering. Server-side delivery of paid assets/content remains a separate hardening item.

Before release, review the deployed draft on real devices, repeat the purchase-to-inbox-to-product smoke test against the final deployment, and incorporate the approved videos and representative buyer feedback. Existing historical emails already delivered are unaffected.

No production website, Worker deployment, Stripe configuration, Resend configuration, DNS or Spacemail service was changed.
