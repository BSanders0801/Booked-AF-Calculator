# BOOKED AF launch verification — October 8, 2026 UTC

**Decision: HOLD production website release.** The development fixes, isolated application checks, fresh inbox receipt and separately authorized Gmail migration are complete. A physical iPhone check and the approved production website cutover/source-privacy execution remain open. Production has not received the secure application candidate.

## Candidate and evidence

- Repository: `BSanders0801/Booked-AF-Calculator`; branch: `build/next30-shell-p04`; tracking: [issue #6](https://github.com/BSanders0801/Booked-AF-Calculator/issues/6).
- Final application revision deployed to test: `1d59e173016c6b8cf008f2843c67c72608e1f31c`.
- Browser interaction-fix revision: `b66b8fd9549a92010538f9132aaed55e4a18572c`. Its sole change clicks the visible survey labels; application source is identical to the deployed revision.
- Dependency/audit-gate revision: `21a6a3595a5dae897e32ad5463d70ee8c7f8e098`; application source is still identical to the final isolated deployment. The final branch-head CI run after this audit update is recorded in issue #6.
- [Browser regression QA — success](https://github.com/BSanders0801/Booked-AF-Calculator/actions/runs/37836850311).
- [Final isolated deployment — success](https://github.com/BSanders0801/Booked-AF-Calculator/actions/runs/37836334429).
- [Earlier same-session QA — success](https://github.com/BSanders0801/Booked-AF-Calculator/actions/runs/37834352046).
- [Intermediate QA failure, subsequently corrected](https://github.com/BSanders0801/Booked-AF-Calculator/actions/runs/37836334323): survey test clicked an input covered by its styled label. Local/server tests passed; actual survey submission passed. The browser test now uses the visible label.
- Test application: https://booked-af-email-test.wild-recipe-42df.workers.dev

No credentials, payment/session/event identifiers, customer addresses, receipts, private profile links or private purchase links belong in this report or the issue.

## Changes completed during this continuation

1. Added an isolated durable profile store so real signup, private profile restoration, career-stage updates and analytics can be exercised without binding production FOLLOWUPS data. Test messages remain restricted to the approved inbox; live keys/events/sessions and production bindings fail closed.
2. Restored the server's sanitized free diagnosis on private-link reopen. Fixed a second bug discovered in the hosted flow: changing career stage saved new answers but displayed fallback diagnosis until reopening. Saves now refresh the diagnosis immediately and ignore stale responses for answers changed during an in-flight save. Removed a repeated storage notice.
3. Fixed the survey's optional help-topics field. The UI said optional but both client and server required a choice. Empty selections now submit; invalid supplied topics still fail validation. Hosted submission and provider delivery were verified.
4. Restricted isolated survey submissions to the approved test product and recipient, including approved zero-cost checkouts.
5. Expanded browser QA to Chromium and WebKit at 320, 390, 768 and 1280px. Added verification-failure recovery and survey regression coverage. Added profile restore/update regression coverage to the generated-public-package DOM test.
6. Expanded test-deploy triggers to include all application JavaScript, HTML, styles and assets. Deployment health now exposes and checks the exact revision and isolated profile capability. Public CI artifacts exclude protected paid worksheet screenshots.
7. Updated the test-only transitive dependency `source-map-js` from 1.2.1 to patched 1.2.2 after the final npm audit found [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q). The audit now reports zero known vulnerabilities. CI installs the exact lockfile with `npm ci` and runs an audit gate for high/critical findings. Customer application assets do not include this dependency.

The existing secure public allowlist, server-authorized paid-module delivery, private/no-store responses, purchase expiry/grandfathering, durable fulfillment deduplication and guarded future production entrypoint were retained and retested.

## Verification results

| Check | Result and evidence scope |
| --- | --- |
| Product and content suite | PASS locally and in CI — 10 careers × 7 goals, 2,692 answer variants, 186 adaptive free-form variants, 288 student scenarios, money/rebooking/buyback/service/income-lane tools, save/import, and 17 email/service subtests. |
| Security and lifecycle suite | PASS — 16 subtests plus generated-public-package DOM integration; private profile restore/update, foreign/forged/expired access, approved-recipient isolation, optional survey fields and sanitized free diagnosis. |
| Dependency and secret-pattern checks | PASS — npm audit reports zero known vulnerabilities after the patch; tracked-file provider-secret pattern scan found no matches. This is a scoped check, not a guarantee that arbitrary secrets cannot exist. |
| Paid authorization | PASS — valid partial discounts and zero-cost purchases allowed; unpaid/open, unrelated, wrong-mode, expired, foreign-origin and provider-failure cases denied in automated fixtures. Policy-era 365-day expiry and older buyer terms preserved. |
| Webhook and email retries | PASS in automated fixtures — signature rejection, concurrent events, failed-stage retry, provider idempotency, persisted successful stages and late replay deduplication. No live failure injection. |
| Full-price hosted checkout | PASS — fresh $49 Stripe TEST checkout at 19:46 UTC; signed event completed with zero pending webhooks; actual welcome link opened protected intake and plan. No real charge. |
| BETA100 hosted checkout | PASS — fresh 100% discount, $0 Stripe TEST checkout at 19:50 UTC; signed event completed with zero pending webhooks; paid access restored. The actual session reported paid; no_payment_required is separately tested by fixtures. |
| Welcome and survey scheduling | PASS at provider — exactly one welcome and one scheduled Day 14 survey observed for each new purchase. Both welcomes report delivered. Surveys are scheduled for October 22. Actual future receipt is not yet testable. |
| Fresh inbox receipt | PASS — both October 8 welcome messages were opened in the original Spacemail inbox; their links match the verified full-price and BETA100 purchases. Both messages, the free Breakdown and survey response are now present as ordinary Gmail messages after the delta import. |
| Gmail migration | PASS for preservation and routing — previous mail preserved, Google MX/SPF/DKIM configured, direct incoming delivery and outgoing BOOKED AF identity verified, and reply round trip passed. The initial direct test landed in Spam and was moved to Inbox; a subsequent new conversation and reply arrived in Inbox without manual relabeling. The lingering import job was manually stopped after all 51 discovered messages were accounted for (9 copied, 42 already present, zero failures); this is not an automatic import-completion claim. See [migration record](EMAIL_MIGRATION_2026-10-08.md). |
| Final-deployment paid restore | PASS — reopened both actual welcome links after the final application deployment; protected Money Map loaded and retained test input 5000; private purchase credentials removed from the address bar. Earlier reload without the link correctly required re-verification. |
| Real free Breakdown | PASS — student form completed at 19:50 UTC using the isolated dummy challenge; on-screen diagnosis and delivered email matched; no paid worksheets, scripts, calculations or detailed plan exposed. FIRST 90 stays coming-soon with optional updates. |
| Real saved profile | PASS — opened actual email link in a new tab, restored server diagnosis, changed student to working stage and reopened the updated profile. Retested a different stage change after the final fix: diagnosis refreshed immediately, save confirmation appeared, and only one storage notice remained. Real independent-device testing remains below. |
| Real purchaser survey | PASS — submitted through the actual test purchase with help topics left blank on the final deployment. Thank-you state appeared; response email reports delivered at 20:02 UTC. |
| Deployed anonymous/forged access | PASS on final revision — missing purchase credential 401, forged test/live and foreign-origin requests 403 with private/no-store; protected module, preview and private-bundle paths 404; forged profile access 401/no-store. |
| Chromium and WebKit responsive QA | PASS — both engines at all four widths, public navigation, challenge-failure recovery, free form, protected intake, Money Map, save/import, access re-verification and optional survey submission. Provider responses are mocked here; real hosted flows were tested separately. |
| Release packaging | PASS — local prepare-release generates 13 audited public assets, separate API-only paid module, review-only host/API configs and hashes. Existing FOLLOWUPS binding retained in the draft API configuration; no deployment occurs. |
| Physical iPhone/Safari | NOT RUN — WebKit and responsive viewport testing do not prove real-device email-link opening, keyboard behavior or checkout return. |

Full-price/BETA100 checkouts were completed on revision `8617effbfc97664b43acb84e768ad5ea12cd559c`. The final application revision only changed survey optional-field validation and profile diagnosis rendering, with related regression tests. Checkout, fulfillment and paid authorization source stayed unchanged; both real welcome links and the corrected survey/profile flows were reverified after that deployment.

## Remaining launch gates requiring the owner

1. **Complete one physical iPhone/Safari pass** on the final isolated application: free form and keyboard, actual email-link opening, saved profile, test checkout return, paid plan/tool entry, and plan-file save/import. Use only the approved recipient and test checkout; never enter a real card in testing. The welcome-inbox gate is already closed.
2. **Authorize the production website release/cutover after the physical-device check passes.** Hosting/source-privacy direction was approved October 7, 10:53 PM Los Angeles time. The separately authorized email migration does not authorize website deployment or making the repository private. Execute [HOSTING_CUTOVER_PLAN.md](HOSTING_CUTOVER_PLAN.md), preserve existing purchase links/profile data/schedules, and use a public-only rollback.

## Security limitation that remains until cutover

**The current public repository, history and existing production publication still expose paid implementation source.** The secure test package prevents anonymous access through its own static host, but cannot retract public historical copies. Earlier public QA artifacts may also include paid screen captures. Making the repository private before replacing GitHub Pages could disrupt the existing site. Do not mark this security requirement closed until the approved cutover has removed the public source publication and unauthenticated old-origin checks pass. Prior downloads/forks cannot be recalled.

## Live checkout identification and boundaries

Read-only verification identified the current production CTA as the $49 **BOOKED AF: Your Next 30** Payment Link ending `6oU9AU5F72l05pA4RTaAw01`. The other active $49 **BOOKED AF Deep Dive** link is legacy and is not the current CTA. Both remain active; existing return URLs and historical buyer compatibility are preserved.

No production website/Worker deployment, live Stripe mutation, Resend configuration change, repository-visibility change, release merge or real customer charge was performed. The later, separately authorized email migration changed email-only DNS and Gmail/Spacemail settings; unrelated website and Resend DNS records were preserved. Issue #6 remains open for the concrete website-release gates above.
