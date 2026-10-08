# BOOKED AF launch verification — 2026-10-08 UTC

**Decision: NOT READY for production release.** Development changes and isolated tests are complete within the available environment. The public-source exposure, current inbox confirmation, physical-device check, and production release gate remain open.

## Candidate and evidence

- Repository: `BSanders0801/Booked-AF-Calculator`
- Development branch: `build/next30-shell-p04`
- Secure delivery implementation: `bf770f41cef123357fb82e0b34b2570132c55a24`
- Final code revision: `627eba038d37edb91584eb5bec951e079244dda7`
- [Final automated QA — success](https://github.com/BSanders0801/Booked-AF-Calculator/actions/runs/37724136274)
- [Final isolated deployment — success](https://github.com/BSanders0801/Booked-AF-Calculator/actions/runs/37724136278)
- [Initial secure candidate QA — success](https://github.com/BSanders0801/Booked-AF-Calculator/actions/runs/37722961556)
- [Initial secure candidate isolated deployment — success](https://github.com/BSanders0801/Booked-AF-Calculator/actions/runs/37722961553)
- Test application: https://booked-af-email-test.wild-recipe-42df.workers.dev
- Release tracking: https://github.com/BSanders0801/Booked-AF-Calculator/issues/6

Payment/session/event identifiers, customer addresses, receipts, credentials and private return links are intentionally excluded.

## Completed changes

1. Build an explicit public-asset package. Paid lessons, scripts, calculations, worksheets, detailed recipes and implementation modules are excluded from static delivery and compiled into a server-only module.
2. Add `/paid-content` server authorization. Each new delivery verifies the purchase against Stripe before returning implementation code. Missing, forged, unpaid, unrelated, expired, foreign-origin and wrong-mode credentials fail closed. Authorized responses use `private, no-store` and vary on origin/authorization.
3. Replace public paid rendering with a small loader. A browser flag or saved plan file alone cannot obtain implementation content. Remove the purchase credential from the address bar after access loads. Reopening the welcome link re-verifies access and restores saved work. Reload without that link requires re-verification; it preserves saved answers.
4. Serialize purchase fulfillment per checkout using isolated Durable Objects. Persist successful survey/welcome stages across retries and replays; retain provider idempotency keys. Ambiguous sends older than the provider retry window stop for reconciliation instead of blindly sending duplicates.
5. Return only the free diagnosis allowlist to browsers and emails, with matching free-result copy. Remove hidden paid recipe data from public bundles.
6. Add an approved-recipient-only test form using Cloudflare's official dummy verification keys. Fix the real-provider response mismatch found during manual testing; production verification logic was not changed by this fix.
7. Add a future `secure-api-worker.mjs` release entrypoint that refuses paid endpoints unless live configuration and durable fulfillment are present. It is reviewed source only: existing production configuration and deployment remain untouched.
8. Restrict future public QA artifacts to public screens and sanitized result summaries; paid worksheet screenshots are excluded.

## Test results

| Check | Result and scope |
| --- | --- |
| Fresh full-price hosted checkout | PASS — $49 in Stripe test mode; completed/paid, test event processed, protected intake and plan opened. Checkout completed 03:31 UTC on the secure candidate. No real payment. |
| Fresh BETA100 hosted checkout | PASS — 100% discount, $0 due, completed/paid, test event processed, protected plan restored. Checkout completed 03:40 UTC on the secure candidate. |
| Real webhook processing | PASS — both completed events report zero pending webhooks; each produced one welcome and one scheduled survey record. |
| Welcome delivery | PARTIAL — both actual Resend messages report delivered; contents and isolated return links verified. Fresh receipt in the connected Workspace mailbox was not found, including exact Message-ID searches. Provider delivery is not inbox confirmation. |
| Purchase restoration | PASS — real BETA100 welcome link reopened and restored saved paid content. On final deployment, unauthorized refresh remained locked until the link was reopened. |
| Real free form | PASS after fix — final deployment accepted the approved test recipient at 03:46 UTC; browser showed diagnosis only; actual free email reported delivered and matched the diagnosis. |
| Deployed anonymous access | PASS — missing credential 401; forged test and live credentials 403; no paid code returned. Direct paid module, preview script and private bundle paths returned 404. |
| Authorization edge cases | PASS in automated tests — unpaid/open, unrelated offer, expired purchase, foreign origin, wrong mode, Stripe failure; valid partial discount and zero-cost sessions allowed. |
| Webhook failure/retry/replay | PASS in automated tests — signature rejection, recipient restriction, concurrent events, failed-stage retries, successful-stage deduplication and three-day replay. |
| Responsive browser behavior | PASS in Chromium at 320, 390, 768 and 1280px — navigation, free submission, checkout destination, protected intake, calculation, save/import, re-verification, no horizontal overflow or page errors. Provider responses are mocked in these responsive tests; real hosted checkout was exercised separately in the cloud desktop browser. |
| Existing product suite | PASS — 10 careers × 7 goals; 2,692 answer variants; 186 adaptive free-form variants; 288 school scenarios; money/rebooking/buyback/services/lanes and save/restore checks; 17 email/service subtests. |
| Additional security suite | PASS — 14 subtests plus generated-public-bundle DOM integration on final code revision. |
| Actual mobile hardware | NOT RUN — responsive emulation does not establish iPhone/Safari or Android device behavior. |
| Cloud profile continuity | Mocked integration tests pass. The isolated checkout environment deliberately has no production FOLLOWUPS binding; real cross-device cloud-profile and survey submission were not exercised there. Purchased-plan file import was exercised with browser mocks and purchase-link restoration was exercised against the real test service. |

The final follow-up revision changed dummy form validation, same-target test-deploy binding recognition, release guard source/tests and QA artifact selection. Checkout/authorization/fulfillment behavior from the successful real checkouts was unchanged. Automated QA and deployment were rerun, then the actual form and purchase restoration were retested.

## Remaining launch blockers and decisions

1. **Public repository and history expose paid implementation source.** Securing the website package cannot secure copies already available through public branches/history. Earlier public QA artifacts also contain paid screen captures and expire after seven days. Repository visibility/hosting migration requires the owner's decision; changing visibility can affect publishing and access. Do not change visibility or rewrite history blindly. Recommended outcome: private implementation source with an explicitly public-only static deployment. Historical downloads cannot be recalled.
2. **Fresh welcome inbox receipt remains unconfirmed.** Inspect the approved recipient's actual mailbox/forwarding path. No DNS, Spacemail or production Resend changes were made to resolve this. October 6 inbox evidence is historical and does not prove these new messages arrived in the inbox.
3. **Physical phone verification remains open.** Check the final isolated candidate on an actual phone, including email-link opening, form keyboard behavior, hosted checkout and plan restore. Desktop cloud-browser and responsive Chromium checks passed.
4. **Release deployment is not applied.** Production still runs its existing sources and security behavior. An approved release must publish only the generated public assets, deploy the guarded API entrypoint with a production durable fulfillment binding, preserve the existing FOLLOWUPS binding/schedules, and remove public copies from the active hosting root. Prepare a rollback that does not re-expose paid assets. No production release is authorized by this report.
5. **Existing purchase policy should be acknowledged at release.** Current purchase links are bearer credentials that can be replayed while valid; the existing one-year expiry remains unchanged and is tested. No new pricing, expiry or account-policy decision was made.

## Live checkout identification (read-only)

The current production JavaScript CTA points to `https://buy.stripe.com/6oU9AU5F72l05pA4RTaAw01`, which Stripe identifies as **BOOKED AF: Your Next 30**, $49. The other active $49 link, `https://buy.stripe.com/4gM00k6Jb4t87xIfwxaAw00`, is **BOOKED AF Deep Dive** and is not the current CTA. Both remain active, their return URLs remain unchanged, and historical purchase compatibility was preserved. No deactivation is needed for this verification.

## Change boundaries

No production website deploy, live Stripe mutation, Cloudflare DNS change, Spacemail change, or Resend production-setting change was performed. Only isolated test checkouts used test payment details. Test messages went through the existing approved test-recipient workflow. No real customers were charged. No secrets were committed or included in issue evidence.
