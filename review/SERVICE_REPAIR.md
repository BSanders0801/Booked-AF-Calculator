# Live service deployment issue

Observed September 27, 2026 UTC. This is a release blocker for the email and paid-access flows.

## Evidence

- `https://booked-af-email.wild-recipe-42df.workers.dev/` returns HTTP 200 with the website's HTML, not the email Worker's JSON readiness response. It has no API CORS header.
- `/health`, `/verify-checkout` and `/survey` return HTTP 404.
- The Cloudflare dashboard for **booked-af-email / Production** shows `npx wrangler deploy`, root `/`, production branch `main`.
- The repository has no root Wrangler configuration selecting `email-worker.mjs`. Cloudflare's automatic configuration can deploy a static website when no Worker entry is specified.
- The dashboard currently lists no runtime variables/secrets and no connected bindings. A daily scheduled trigger is visible.

## Repair required before publishing the revised flows

1. Back up the current Cloudflare deployment/version and settings. The GitHub and local restore points preserve source; they do not back up hosted secrets or deployment versions.
2. Configure this service to deploy `email-worker.mjs` explicitly, rather than treating the repository root as static website assets. Preserve the separate GitHub Pages website deployment.
3. Restore runtime secrets through Cloudflare's secure controls: `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Do not put keys in chat, repository files or screenshots.
4. Verify the intended Stripe payment-link configuration and existing webhook endpoint. Do not create duplicate webhooks.
5. Bind the existing intended follow-up KV namespace as `FOLLOWUPS`, and preserve/verify the scheduled trigger before redeploying. No namespace ID has been invented in this change.
6. Recheck public readiness JSON and CORS from both website origins, invalid checkout rejection, and survey routing. Run an explicitly authorized delivery test and test-mode payment flow before accepting the end-to-end launch.

Changing only the frontend URL or presenting a fake success would not fix the missing service. This draft does neither. No live deployment, secret change, webhook change or customer email was made during this audit.

References: [Cloudflare automatic configuration](https://developers.cloudflare.com/workers/framework-guides/automatic-configuration/), [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), [Wrangler configuration](https://developers.cloudflare.com/workers/wrangler/configuration/).
