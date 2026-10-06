# BOOKED AF — TEST WORKER / END-TO-END PURCHASE RUNBOOK

**Status:** Required before beta.
**Updated:** October 6, 2026.

## Purpose

Prove the real buyer path without touching production:

test Stripe Checkout → signed test webhook → BOOKED AF test Worker → welcome email → checkout verification → paid access.

## Safety rule

Never repoint the production Worker to Stripe test secrets.

Use the dedicated Worker config:

`wrangler.test.jsonc`

Worker name:

`booked-af-email-test`

The test config intentionally has no production KV binding.

## Required test secrets

Set these only on the test Worker:

- `STRIPE_SECRET_KEY` — Stripe test-mode secret key
- `STRIPE_WEBHOOK_SECRET` — signing secret from the test webhook endpoint
- `RESEND_API_KEY` — approved sending key for the test delivery
- `TURNSTILE_SECRET_KEY` only if testing Breakdown signup through the same environment
- `REPORT_SECRET` only if testing the private conversion summary

Do not commit any secret.

## Existing Stripe test assets

Use the BOOKED AF Stripe account test-mode mirror already created:

- Product: BOOKED AF: Your Next 30 — TEST
- Price: $49 one-time
- Promotion code: BETA100
- Payment Link: test-mode YOUR NEXT 30 link already created

No live Stripe object needs to change.

## Test webhook

Create a Stripe test-mode webhook endpoint pointing to:

`https://<booked-af-email-test-worker>/stripe-webhook`

Subscribe to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

Save the resulting test webhook signing secret as `STRIPE_WEBHOOK_SECRET` on the test Worker.

## Test website / verification path

The buyer-facing page must call the test Worker's `/verify-checkout` endpoint during this test.

Do not point the production website at the test Worker.

Use a preview/local build or a temporary non-production site configuration that sets its email/checkout verification endpoint to the test Worker.

## Required test cases

1. Full-price $49 test checkout
   - completed approved session
   - test Worker accepts signed webhook
   - welcome email arrives at the expressly approved test inbox
   - returned session verifies
   - paid plan opens

2. BETA100 / $0 test checkout
   - completed `no_payment_required` session
   - welcome email arrives
   - access verifies
   - survey scheduling path succeeds

3. Unpaid/unrelated session
   - no access
   - no welcome

4. Duplicate webhook
   - no duplicate welcome

5. Email failure/replay
   - Worker returns retryable failure
   - replay after recovery sends once

6. Expired-policy fixture / automated test
   - remains green alongside live end-to-end evidence

## Evidence to record privately

- Stripe test session ID
- Stripe event ID/status
- Worker response/status
- Resend delivery ID/status
- actual inbox receipt
- access verification result

Do not commit receipts, customer email addresses, test secrets, or payment identifiers to the repo.

## Beta gate

Do not mark purchase/delivery ready until at least the full-price and BETA100 paths have completed end to end through the isolated test Worker and actual email receipt has been verified.
