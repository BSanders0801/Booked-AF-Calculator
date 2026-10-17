# BOOKED AF cutover verification — October 17, 2026

Full launch sign-off: BLOCKED. The public free site remains operational.
Production URL: https://bookedandfabulous.com/
Latest verified public main: 290236a4a6dcaf160516680ba58aec2e890258f4.
Approved source consent/cache reconciliation: e69aa5ff74088099df637c75eabc6d55ab864ddc.

## Completed in this run
- Re-read October16 launch verification, current branches, recent commits and deployments. Preserved today's consent disclosure and site-ui cache version3. Did not merge unfinished paid PR3.
- Before registrar mutation, workflow39079998705 verified12 authoritative source website/email records in Cloudflare, no DS, and elapsed86400-second old DNSSEC cache wait.
- Spaceship existing authenticated session worked. Changed ONLY bookedandfabulous.com from launch1/launch2.spaceship.net to faye.ns.cloudflare.com and zeus.ns.cloudflare.com. Resulting UI explicitly confirmed nameservers updated and showed custom nameservers in propagation. No source records were deleted.
- Google public DNS now returns faye/zeus; direct .com parent delegation also returns faye/zeus with TTL172800.
- Refreshed existing booked-af-site Worker with latest approved free-only assets and a minimal canonical www/HTTPS wrapper. No API deployment/binding/secret changes. Worker asset bytes and paid404 paths verified. It remains on workers.dev until zone activation and TLS preflight succeed.
- New code: d741879 public wrapper; aabce2e host preparation; 0651e66 safe routing; f14afa3 routing workflow; 3b9dc2a final verifier; acebb89 final verification workflow.
- Post-cutover workflow39080594176 passed at2026-10-17T23:51:24Z: HTTPS, all8 text assets match latest release, apex/www/HTTP301 redirects, Google MX/SPF/DKIM and Resend DKIM/return-path DNS intact, protected paid file paths404, API launchReady, anonymous paid API401, contact store readable with1 record.
- Actual desktop browser exercised all10 adaptive questions to required capture form. Empty required name rejected; malformed email rejected; optional marketing box unchecked and latest disclosure visible. Paid page visually says NOT TAKING PAYMENTS YET, with no checkout.
- No purchases, new subscriptions/services, marketing announcements, customer-data deletion or unrelated-domain changes.

## Current Cloudflare status and safety gates
Cloudflare zone ID cb179337d9b712e7734613b4c4c5533f in account30ec5e35d67ddd1a1bab06c2263b2159 still reports pending despite correct registrar and public parent delegation.
Cloudflare dashboard session is logged out. Scoped token continues to operate DNS/Workers/KV; it lacks Zone Write for manually triggering activation and SSL and Certificates Read for certificate inventory (403 on the two read probes). Do not broaden credentials silently.
The safe routing script checked activation for3 minutes and intentionally made no website route/proxy change while pending. Existing DNS-only Pages hosting remains working; the current public release is preserved.
DNSSEC remains disabled at Cloudflare and no registrar DS exists. Do not install a new DS while resolvers can still use cached old delegation. Parent delegation TTL172800 means conservatively allow old delegation cache expiry through October19 around23:43UTC, then recheck actual delegation and active Cloudflare DNSSEC before adding the corresponding DS. Enable Cloudflare signing only when activation permits; adding keys on Cloudflare alone does not complete chain of trust.
No authoritative DMARC was present and none was invented or changed.

## Email evidence
October16 real visitor submission to approved hello@bookedandfabulous.com was saved without TTL and delivered personalized BUILDING / ROOM IN THE BOOK at4:01PM Pacific. SPF and aligned DKIM passed. Confirmation, unsubscribe, GET-nonmutation and old-confirm suppression were verified against production API; test address left unsubscribed.
Today the test form reached an explicit Cloudflare Verify you are human checkbox. Did not attempt CAPTCHA interaction in this noninteractive run. No new production test email was sent. Prior production email proof is historical, not relabeled as a new test.
Fresh production repeat-submission deduplication, complete returning-result behavior and mobile rendering remain unverified. Desktop form journey and validation passed.

## Source privacy
Repository remains public; source branches/history expose paid implementations, although deployed site asset paths are protected.
GitHub administration session works. Inspected private-conversion warning without submitting. It says Advanced Security will be disabled.
Inspected actual security settings: Secret Protection and push protection are currently enabled (both show Disable controls), so this is a real security-monitoring/protection tradeoff, not merely an assumed warning. Conversion needs specific action-time user confirmation before disabling those protections. No privacy change was submitted.
Also preserve Pages hosting for clients with cached old DNS until replacement branded host and fallback continuity are verified. Do not declare source privacy fixed.

## Next concrete execution
1. Recheck Cloudflare zone activation; manual activation trigger requires Zone Write or authenticated dashboard access. Automatic provider checks may resolve pending without user action.
2. Run existing route-public-host.mjs after active; it stages only apex/www routes, validates actual Cloudflare edge TLS and exact assets before enabling proxy. Preserve all mail records.
3. Resolve source privacy with explicit approval of GitHub security effects and safe Pages/fallback continuity.
4. Restore DNSSEC chain only after safe old-delegation cache expiry and correct Cloudflare DS verification.
5. Finish approved human verification, fresh repeat delivery/deduplication and rendered mobile/returning-result QA. No paid activation.
