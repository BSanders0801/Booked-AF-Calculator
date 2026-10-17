# BOOKED AF free launch verification — October 16, 2026

Status: public free release is deployed and production HTTP checks pass; production visitor storage, inbox receipt and consent API checks now pass; source privacy and rendered QA remain unfinished.
Production: https://bookedandfabulous.com/
Public commit: 59c6838055dd78fc8388a52c2cf14b73134708fa (supersedes 10672dd).
Backend source: 09c38d5f8d168029b00329c6b9aefd5b4a4f1e60.
Current infrastructure verification: 4e1ccfce15a49e1b18d31854919c2c43e43965ab.
GitHub Pages deployment 38977557757 succeeded. Full verification workflow 38977746368 succeeded.

## Verified current production
- HTTPS homepage and all eight public script/style/index assets return 200 and match approved generated free release after line-ending normalization. HTTP apex, HTTP www and HTTPS www redirect 301 to https://bookedandfabulous.com/.
- Removed dormant Stripe checkout URL from site-content.js, as well as existing app checkout disable; asset version public-20261016-2. Every checked public text asset contains no buy.stripe.com URL.
- Required name and email input configuration and optional unchecked marketing checkbox verified. Production service CORS allows the actual site origin. API reports launchReady.
- Anonymous paid-content endpoint returns401/no-store. Tested paid module, source-worker and private-bundle site paths return404. Existing buyer access recovery preserved.
- Free scoring, consent/storage/suppression, security/lifecycle tests pass. No marketing announcements sent; promotional sequences remain paused.
- Controlled isolated test Breakdown email previously received at approved hello@bookedandfabulous.com inbox with SPF and aligned DKIM pass. Repeat controlled workflow uses existing idempotency. This is not production visitor submission proof.

## Cloudflare access works through API
BOOKED_AF_LAUNCH_TOKEN is securely stored in GitHub Secrets, valid through October23, scoped to the approved account/domain. No token value printed or committed.
Actual reads succeeded for DNS records, DNSSEC, SSL setting, Worker routes, Worker custom domains, deployed service configuration and contact KV. Worker deployments and DNS record repair were performed successfully.
Latest contact-store retrieval returns zero contact keys.
The Cloudflare dashboard browser rejection does not prevent these API operations. A separate OpenAI browser credential-protection error affects UI actions; this also prevented GitHub administration UI inspection.
DNSSEC edit API documentation accepts DNS Write permission, which the current token has; no new broad token is currently needed.

## DNS transition
Only bookedandfabulous.com changed. With explicit action-time approval, Spaceship DNSSEC disabled at2026-10-16T22:40:20Z; resulting UI verified Disabled. Public DoH returned no DS answer afterward.
Nameservers remain launch1.spaceship.net and launch2.spaceship.net. Current Pages A records and Google Workspace MX continue resolving.
Cloudflare pending zone assigned faye.ns.cloudflare.com and zeus.ns.cloudflare.com. Twelve authoritative website/email records verified in destination, including Google MX/SPF/DKIM and Resend DKIM.
Fixed imported rsend CNAME typo to rsend.forge.rmta.net; added missing send CNAME; initial website records DNS-only. No mail record removed. No authoritative DMARC exists.
Prior DS TTL86400 seconds. Script now explicitly enforces earliestSafeCutover2026-10-17T22:45:00Z even when DS lookup is already empty.
Follow-up automation scheduled2026-10-17T23:41:18Z /4:41PM Pacific. Recheck prerequisites, migrate, then re-enable Cloudflare DNSSEC with corresponding Spaceship DS. Current free Pages launch can function while this infrastructure migration waits.

## Remaining concrete work
- Production visitor submission, persistent storage, delivered personalized email and live consent API transitions verified; see latest evidence below. Repeat-submission email deduplication and final rendered desktop/mobile QA are not yet proven against production.
- Rendered desktop/mobile and returning-visitor QA. Latest fresh browser tab successfully displayed live homepage, but clicking Get my free Breakdown again returned credential_observation_restricted. Use supported manual browser handoff; do not bypass protections.
- Paid source remains exposed in development repository branches/history despite safe deployed asset allowlist. Draft PR3 is unfinished paid work and must not merge.
- Alternative privacy path investigated: separate public-only Pages repository then private source repository. Connector exposes no repository creation/administration tools; GitHub settings browser inspection was stopped by the same credential protection. Do not turn source private until branded site hosting continuity is verified.
- October15 isolated deployment failure was post-deploy TLS health-fetch loss; later retries passed. Latest production deployment and live HTTP verification succeeded.

No full LIVE claim until actual production signup and source privacy are resolved.

## Production visitor verification — October16, 4:01–4:05PM Pacific

User completed the real production Breakdown and reported Done. New inbox message1a146f34ba932ffb received at4:01PM from hello@bookedandfabulous.com to the approved same address, personalized to Bradley: BUILDING / ROOM IN THE BOOK. Gmail headers show SPFpass and aligned resend DKIMpass. HTML and plain text contain free clarity, saved-profile access, optional confirmation and unsubscribe links; no paid methods or active checkout link. No private bearer links copied into this report.

Read-only CF KV inspection found exactly one matching contact, no expiration/TTL, required name/email, source free-breakdown, schema short-v5, consentVersion2026-10-16 and initially pending consent. Request recorded2026-10-16T23:01:48.828Z; delivery accepted23:01:50.266Z. Workflow38979275798 passed.

Live consent API test on this approved test address confirmed subscription, verified persisted confirmation date, unsubscribed, verified persistent suppression, and verified old confirmation cannot reverse suppression (400). GET confirmation/preferences pages did not change status; returned no-store and POST forms. Workflow38979383350 passed. Test address intentionally left unsubscribed. No promotional emails sent. These are actual production API transitions, not rendered UI-click verification.

Public commit59c6838 remains deployed. Cloudflare API operational; infrastructure cutover cache wait unchanged. Remaining: paid source repository/history privacy, rendered mobile/desktop/returning-visitor QA and actual repeat-submission deduplication proof. Do not claim every launch requirement complete.

## October17 cutover update — supersedes earlier nameserver state

See review/FREE_LAUNCH_CUTOVER_2026-10-17.md for current evidence. Spaceship nameservers successfully changed to faye/zeus.cloudflare.com; public DNS and .com parent delegation confirm. Latest public main290236a preserved. Post-cutover workflow39080594176 passes HTTPS, redirects, all8 approved assets, email DNS and API/contact-store health. Cloudflare zone still pending; DNS-only GitHub Pages stays live. Worker host refreshed and TLS-gated routing prepared. DNSSEC chain not yet restored. Repository remains public because private conversion would disable currently enabled Secret Protection/push protection and must preserve Pages continuity. Actual desktop questionnaire/required-field validation passed; new submission stopped at human-verification checkbox without CAPTCHA interaction. No new customer emails/marketing sent.
