# Hosting and source privacy — approved direction, release execution gated

Prepared October 7, 2026; updated October 8. The hosting/private-source direction was approved October 7 at 10:53 PM LA time. Production execution is still gated on inbox/device verification and explicit release approval. No production changes performed.

## Findings

The repository is public, has GitHub Pages enabled, and contains the live custom domain in CNAME. Making it private first is unsafe: GitHub documents that Pages sites on GitHub Free are unpublished when the source becomes private. The account's plan has not been verified. GitHub also restricts using Pages primarily for commercial transactions, so merely upgrading the GitHub plan is not the proposed solution.

Sources:
- https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- https://developers.cloudflare.com/workers/static-assets/

## Approved direction

Use Cloudflare Workers Static Assets for the generated public-only website, keep the existing Cloudflare API endpoint for payment verification and email, then make the existing source repository private. The isolated environment already exercises this provider's assets and Worker runtime. No new vendor account or paid plan has been purchased. Confirm account capacity/cost before provisioning.

Keep both existing Stripe payment links and all Resend settings unchanged. Keep the public domain and existing private purchase links working. Never publish the repository root or the private bundle as static assets.

## Prepared locally

Run `node scripts/prepare-release.mjs` from the repository. It performs no network requests or deployment. It builds:

- `.website-preview/`: explicit public assets only, audited file paths.
- `.private-assets/paid-bundle.mjs`: API-only module, excluded from website.
- `.release-review/site.config.json`: draft static site configuration, no custom-domain routes and no SPA fallback for missing files.
- `.release-review/api.config.json`: draft for the existing API name, guarded entrypoint, existing FOLLOWUPS binding and new durable purchase fulfillment binding; no static assets attached.
- `.release-review/public-manifest.json`: SHA-256 hashes for the exact public files.

Preparation passed: 13 public assets; no paid filenames, symlinks or unexpected directories; API and website packages are separate. Configurations remain ignored local artifacts, not an automatic deployment workflow. Existing `wrangler.jsonc` and test configuration are unchanged.

## Ordered execution, only after explicit release approval

1. Confirm new welcome messages in the recipient mailbox and finish the real iPhone check. Recheck the exact release code's automated gates.
2. Privately record current production Worker versions, all bindings, schedules, domain routing, DNS and GitHub Pages settings. Verify that the generated API configuration preserves every required existing binding and schedule. Confirm durable migration tag is unused and old objects need no migration. Stop on differences; the local config is a review draft, not proof of live configuration parity.
3. Prepare the new static host at its provider URL; initially keep paid entry disabled until the guarded API is ready. Do not expose paid source. Preserve the current live hostname and customer paths until the approved cutover.
4. Deploy the guarded API at its existing address, keeping its secrets and profile data, Stripe webhook endpoint and email settings unchanged. Verify current-purchase authorization and no-store responses without creating a real charge. Check scheduled work and historical purchase compatibility.
5. Under the approved hosting/DNS change, attach the existing website hostname to the generated public-only host. Preserve every unrelated DNS record, especially mail, SPF/DKIM/DMARC and verification records. Verify HTTPS, free form, navigation, links, private restore, API CORS and anonymous asset denial at the real hostname. Recheck both apex and www routing before retiring the old origin.
6. Retire old GitHub Pages publication only after the new host is verified. Make the source repository private and verify collaborator/integration access and CI availability. Public forks and historical downloads are not recalled; inspect any existing forks separately. Do not rewrite history or delete artifacts without explicit approval.
7. Verify no paid files remain accessible through the old Pages URL, old hosting paths or current source/history to an unauthenticated visitor. Account for propagation/caches rather than asserting instant removal.

## Rollback

Before cutover, retain a public-only maintenance package and known-good secured API version. If the launch fails, serve maintenance/public-only content and pause new checkout entry while preserving existing purchase recovery. Do not roll back to a public source-root deployment or remove durable fulfillment history. Restoring the old unsecured production website would reopen the paid-content leak and is not an acceptable security rollback.

## Current unresolved checks

Fresh October 8 full-price and BETA100 test welcomes report delivered at the provider, but exact Message-ID searches did not find them in the connected Workspace mailbox. Physical iPhone testing still requires the owner's device. See [current verification](LAUNCH_VERIFICATION_2026-10-08.md) for evidence and exact gates. Direction approval is recorded; production deployment, DNS cutover and repository visibility changes still require explicit release authorization. No production mail configuration changed.
