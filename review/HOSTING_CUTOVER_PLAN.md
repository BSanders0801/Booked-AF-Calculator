# Hosting and source privacy — current workaround

Updated October 15, 2026.

## Current verified state

- The public BOOKED AF site is deployed successfully from `main` through GitHub Pages at the custom domain `https://bookedandfabulous.com/`.
- Pages deployment for commit `63dc726e9df9bda4c1f710844caa02612e318dd7` completed successfully on October 15.
- The public `main` artifact contains the simplified launch site and keeps new YOUR NEXT 30 purchases disabled while the paid product is unfinished.
- Existing buyer access still uses the guarded Cloudflare Worker API at `booked-af-email.wild-recipe-42df.workers.dev`.
- The separate public-only Cloudflare static host `booked-af-site.wild-recipe-42df.workers.dev` was deployed and verified. Private paid files return 404 there.
- The secure API deployment added durable fulfillment and was verified: health is ready, anonymous paid-content access returns 401 with no-store, and invalid checkout verification returns 400 with no-store.
- Email, Stripe webhook handling, FOLLOWUPS storage, secrets, and the existing daily schedule were preserved.

## Cloudflare browser/UI blocker

The Cloudflare web interface is not required for normal site operation.

The attempted custom-domain migration is blocked specifically because the existing GitHub Actions Cloudflare token cannot create a Cloudflare DNS zone. The provider returned:

`Requires permission com.cloudflare.api.account.zone.create`

Do not treat this as a website outage or a reason to restart deployment work.

## Active workaround

Until Cloudflare zone creation can be authorized cleanly:

1. Keep the public website on GitHub Pages at `bookedandfabulous.com`.
2. Keep checkout for new YOUR NEXT 30 purchases disabled.
3. Keep the existing Cloudflare Worker endpoint for transactional email, purchase verification, existing-buyer access, and follow-up infrastructure.
4. Do not change website DNS, Google Workspace MX/SPF/DKIM, Resend records, Stripe links, or mail routing.
5. Do not attempt repeated Cloudflare zone-creation runs with the current token.
6. Treat the Cloudflare custom-domain/static-host migration as deferred infrastructure work, not a current launch blocker.

## Source-privacy limitation

The source repository is still public. Do not make it private while GitHub Pages is the live host unless the account's private-Pages capability has first been verified and a tested replacement public host is live.

The generated public site itself excludes the private paid bundle, but repository history/branches remain a separate source-privacy concern. Do not claim that source privacy is solved.

## What remains

- Physical owner-device iPhone/Safari verification.
- Continued product completion and QA.
- A future source-privacy/hosting migration once a safe host/domain path is available.
- Only then consider retiring GitHub Pages and changing repository visibility.

This workaround supersedes older instructions that treated Cloudflare custom-domain cutover as an immediate launch blocker.
