# BOOKED AF free launch verification — October 16, 2026

Status: public release deployed; complete launch certification BLOCKED.

Production: https://bookedandfabulous.com/
Public commit: 10672dd107da16c00e58bd65986b87ee4e5215da.
Backend source: 09c38d5f8d168029b00329c6b9aefd5b4a4f1e60; initial consent implementation 48b1f19c0e09b5c167efb0579d2281c9b2a7ac22. Deployed Worker version verified as 157d9e3d-9e66-44eb-aeb3-f424cc297546. Verification-only workflow 38972514872 passed.

## Changes

- Added optional unchecked marketing consent, with email confirmation before subscription.
- Added normalized persistent contact records in the existing FOLLOWUPS namespace, separate from saved-profile access and delivery metadata. No customer data deleted.
- Added POST-confirmed subscription and unsubscribe pages; GET requests do not change preferences. Unchecked Breakdown requests preserve suppression.
- Kept promotional sequences paused. No marketing announcements sent.
- Preserved existing Breakdown scoring, questionnaire, brand, email layout, existing buyer API bindings, secrets and schedules.
- Updated privacy disclosure and versioned public assets. The $49 checkout remains held.

## Verified

- Pages deployment for 10672dd succeeded. Live index, app, site-content, site-ui, CSS, paid-loader and both logo assets returned 200 and exactly matched release bytes.
- HTTPS works. www and HTTP redirect to https://bookedandfabulous.com/.
- Production API health ready; anonymous paid-content returns 401/no-store; invalid purchase verification and invalid unsubscribe links return 400/no-store.
- Paid modules, API source and private bundle paths tested at the production domain return 404. Public build guard excludes paid implementation.
- 180 adaptive answer variations, 288 student scenarios, consent/storage/suppression tests, email parity and nine security/lifecycle tests passed. These used mocked email providers and isolated storage; they are not evidence of fresh production email delivery.
- October 15 isolated deployment failure occurred after successful deployment when a health fetch lost its TLS socket. Later existing runs passed after bounded health retries.
- Draft PR #3 contains unfinished paid work and was not merged.

## DNS and authentication gates

- Authoritative nameservers remain launch1.spaceship.net and launch2.spaceship.net.
- Cloudflare zone exists and is pending; assigned nameservers are faye.ns.cloudflare.com and zeus.ns.cloudflare.com.
- Current API token can read the zone summary but receives 403 reading DNS records. Nameservers were not changed because the complete destination mail-record inventory could not be checked.
- Public DNS returned Google Workspace MX smtp.google.com, Google SPF, Google DKIM and Resend DKIM. The queried _dmarc hostname returned no TXT answer.
- Cloudflare and Spaceship browser sessions were logged out. Secure Cloudflare authentication returned submission_failed without a visible provider error. Browser credential protection then blocked the production visitor interaction test.

## Unverified / unresolved

- A fresh production visitor submission, persistent record from that submission, actual inbox delivery, confirmation and unsubscribe through a real delivered test email remain unverified.
- Mobile/desktop rendered final-state QA and returning-visitor browser proof remain incomplete. HTTP release bytes and behavior tests passed.
- Repository development branches/history remain public. Public site asset protection does not solve source-repository privacy. Do not switch visibility until private Pages capability or a replacement host/domain route is verified.
- Do not call the full launch complete until fresh live email flow and source privacy are resolved.

User action needed: complete Cloudflare authentication in the provided browser handoff. Then inspect destination DNS and authenticate Spaceship as needed; do not switch nameservers until every existing mail/security record is preserved. Continue fresh visitor testing after credential protection clears.

Additional verified access limit: verification-only workflow 38972643483 passed; the current deployment token cannot read the FOLLOWUPS KV contact-list records. Future campaign retrieval requires authorized Cloudflare dashboard/KV access. No records were exported or changed by this read-only probe.

## Latest verified update — October 16, 2026, 3:24 PM LA time

This section supersedes the earlier DNS/KV permission blockers above.

- Dedicated BOOKED_AF_LAUNCH_TOKEN is saved in GitHub Secrets and verified working. No credential values were exposed or committed. Workflow 38975400094 passed on 0e872e1.
- DNS and contact-store administration reads now work. Contact store currently has zero contact records; no production signup has yet been verified.
- Existing Cloudflare public Worker host now matches the approved free-launch release. Paid file paths return 404; checkout remains held.
- Cloudflare imported rsend CNAME had a typo (forge.mta.net versus authoritative forge.rmta.net). Corrected after agreement between Cloudflare and Google DNS resolvers. Missing send CNAME was copied. A and www records were set DNS-only to preserve existing Pages behavior during the initial nameserver transition.
- Twelve authoritative website/mail DNS records were verified in the destination, including Google Workspace MX/SPF, Google DKIM and Resend DKIM. No authoritative DMARC TXT currently exists. No source DNS/email records were removed.
- One controlled free Breakdown was submitted through the existing isolated test Worker to the previously approved test inbox. Inbox receipt at 3:22 PM LA time was verified. Sender is hello@bookedandfabulous.com; SPF and aligned DKIM pass. It returned personalized free clarity without paid methods. This does not establish the production-domain Turnstile/signup flow.
- Registrar DNSSEC DS record is present with TTL 86400 seconds. Nameservers MUST NOT change until the DNSSEC transition is coordinated and cached trust records are safe. No registrar DNSSEC or nameservers were changed. Cloudflare zone remains pending.
- Remaining gates: registrar authentication/DNSSEC transition; production visitor submission and contact/consent verification; rendered final-state QA; source-repository privacy.
