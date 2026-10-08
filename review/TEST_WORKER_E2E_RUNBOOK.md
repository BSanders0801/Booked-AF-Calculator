# BOOKED AF — TEST WORKER / END-TO-END PURCHASE RUNBOOK

**Status:** Fresh October 8 hosted checkouts, provider delivery and paid-link restore passed. Inbox and physical-device confirmation remain open. See [current verification](LAUNCH_VERIFICATION_2026-10-08.md).
**Updated:** October 8, 2026.

## Purpose

Prove the real buyer path without touching production:

test Stripe Checkout → signed test webhook → BOOKED AF test Worker → welcome email → checkout verification → paid access.

## Safety rule

Never repoint the production Worker to Stripe test secrets.

Use the dedicated Worker config:

`wrangler.test.jsonc`

Worker name:

`booked-af-email-test`

The test config intentionally has no production KV binding. TestPurchaseFulfillment and TestLifecycle Durable Objects hold only isolated purchase-delivery state and test profile data. Never add the production FOLLOWUPS namespace.

## Required test secrets

### GitHub deployment path (no Cloudflare browser login during runs)

The test workflow runs on changes to its listed files on `build/next30-shell-p04`.
It never runs deployment on `main`. Change `review/TEST_DEPLOY_TRIGGER.txt` on the
test branch to rerun after setting credentials. A manual dispatch also requires
the workflow to exist on GitHub's default branch; do not merge this work just to
make that button appear.

Add these encrypted **repository Actions secrets** (not committed files):

| Name | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Dedicated token with Workers Scripts Edit for the account containing the intended test Worker. No DNS, billing or production-key changes are required. |
| `CLOUDFLARE_ACCOUNT_ID` | That Cloudflare account's ID. |
| `STRIPE_TEST_SECRET_KEY` | Existing BOOKED AF account's test-mode key; `sk_test_` or appropriately scoped `rk_test_`. Never a live key. |
| `RESEND_TEST_API_KEY` | Approved sending key for the verified BOOKED AF sender domain. This workflow does not consume the production `RESEND_API_KEY` repository secret. |
| `TEST_RECIPIENT_EMAIL` | Inbox expressly approved by Bradley for these test welcome and survey emails. |

Keep `BOOKED_AF_TEST_DEPLOY_ENABLED` unset until credentials and recipient are
approved. Setting that repository Actions **variable** to `true` permits the
next test-branch workflow run to deploy. It is an operational gate, not a claim
that Cloudflare's token is technically restricted to a single Worker.

The script discovers the account's workers.dev subdomain and verifies the unique
account against the owner's supplied BOOKED AF workers.dev host. Account IDs
copied with surrounding whitespace or as a Cloudflare dashboard URL are normalized
in memory. A malformed ID can be recovered only when the token can list exactly
one account and its workers.dev host matches. The check step uses only read-only
Cloudflare API calls and never prints or rewrites encrypted secrets.

The deployment then verifies the unique
active $49 Your Next 30 TEST offer using only the supplied Stripe test key. It
creates/connects only the test webhook, passes a newly created signing secret
directly into the test Worker, and changes only that test Payment Link's return
URL. Existing unmarked Workers, custom domains, unsafe bindings, ambiguous test
offers, or incomplete existing webhook configurations stop the run. It never
prints provider identifiers, email addresses, raw API responses, or secrets.

The generated `.test-worker/` and `.test-website/` directories are ignored by Git.
Production `email-worker.mjs`, `wrangler.jsonc`, `app.js`, and `site-ui.js` are not
modified. The test artifact replaces production links, allows only its own
origin, removes review bypasses, rejects live sessions/events/keys, and limits
email delivery to the approved test inbox. The isolated `/lead-test`, `/profile`, `/events` and `/survey` routes exercise real lifecycle behavior using test-only durable storage. Private reports remain disabled. The signup uses official dummy verification keys only on the isolated host; production challenge validation is preserved.

If webhook creation succeeds but secret upload fails, stop and securely recover
the existing test webhook secret. Do not create duplicate endpoints or rotate a
production secret. A successful health check proves configuration only; actual
checkout, email receipt and paid access remain the beta gate below.

### Worker runtime bindings

Set these only on the test Worker:

- `STRIPE_SECRET_KEY` — Stripe test-mode secret key
- `STRIPE_WEBHOOK_SECRET` — signing secret from the test webhook endpoint
- `RESEND_API_KEY` — approved sending key for the test delivery
- `TEST_RECIPIENT_EMAIL` — the sole approved test inbox (required by the isolated wrapper)
- `FULFILLMENT` — test-only durable purchase-delivery binding to `TestPurchaseFulfillment` in this isolated Worker
- `TEST_LIFECYCLE` — test-only durable profile/event binding

No real TURNSTILE or REPORT secret is needed for this isolated workflow. Reports remain disabled. Do not add production KV bindings or production secrets.

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
   - remains green alongside real test-provider end-to-end evidence

7. Free profile continuity
   - approved inbox signup shows sanitized diagnosis only
   - private email link restores the same diagnosis
   - changing stage saves to isolated storage and updates diagnosis immediately
   - reopening the link retains updated answers; forged/foreign/expired profile access fails

8. Purchaser survey
   - approved test purchase can submit required answers with optional topics left blank
   - invalid supplied topics and wrong recipient/product/mode are rejected
   - thank-you state and provider-delivered response stay inside the approved test workflow

9. Responsive and access recovery
   - Chromium and WebKit at 320/390/768/1280px
   - challenge failure retains form input and offers retry
   - actual welcome links reopen paid content; refresh without private credentials requires verification
   - only free/marketing screenshots are uploaded to public CI artifacts

The `/health` response must report the expected commit in `revision`, with isolated/ready/checkout/webhook/profiles true. Health is not purchase or inbox evidence.

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
