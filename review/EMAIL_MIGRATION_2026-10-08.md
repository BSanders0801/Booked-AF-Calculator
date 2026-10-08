# BOOKED AF email migration — October 8, 2026

The owner separately authorized completing the Spacemail-to-existing-Google-Workspace migration and confirmed the final source-mailbox disconnection after the permanent-deletion warning. This authorization does not authorize production website release.

## Preservation

- All 42 previously preserved Gmail messages were checked against the earlier preservation inventory and remain present.
- The delta import copied 9 additional messages. Google reported 51 discovered emails, 42 skipped/already present, and zero failed emails. All discovered messages were independently accounted for in Gmail.
- Google continued to label the import as running after all discovered messages were accounted for. The job was manually stopped, and the final UI status was **Stopped**. Do not describe it as an automatically completed import.
- Two older originals excluded from the prior import remain preserved as original EML attachments in a Workspace draft and in the private backup: the Spacemail welcome message and an empty signature draft.
- A private raw-message ZIP backup includes the 52 Gmail messages available at backup time, those two additional originals, and SHA-256 checksums. Later migration test replies remain in Gmail. Private message identifiers, attachments and access links are intentionally excluded here.
- Both October 8 test welcomes, the free Breakdown and purchaser-survey response are present as ordinary Gmail messages. Their private access links were already verified against the final isolated application.

## Email-only changes

- Disconnected the Spacemail domain connection after preservation and action-time owner approval. Spaceship removed its managed email bundle: two MX records, legacy SPF, legacy DKIM and the Spacemail autodiscovery record.
- Added Google MX at the apex, priority 1, `smtp.google.com`, TTL 60 seconds.
- Replaced the removed legacy SPF with `v=spf1 include:_spf.google.com ~all`.
- Added a 2048-bit Google DKIM key at `google._domainkey` and started authentication in Google Admin.
- Google confirmed **Gmail is activated** for the domain.
- The existing alias delivers into the owner's existing Workspace Gmail account. Gmail sends as BOOKED AF and replies from the address that received the message.
- Disabled automatic renewal for the retired Spacemail plan and the separate unused trial. Both show expiration on October 22, 2026; neither has a connected domain.

The four GitHub Pages A records, www CNAME, Google verification TXT, Resend DKIM and both Resend-related CNAME records were retained unchanged. No website deployment, nameserver change, Stripe change or Resend configuration change was made.

## Verification

| Check | Result |
| --- | --- |
| Public MX lookup | PASS: only `1 smtp.google.com.` returned. |
| Public apex TXT lookup | PASS: one Google SPF record plus the existing verification record. |
| Unrelated website and Resend DNS | PASS: retained values match the pre-change snapshot. |
| Direct external delivery | PASS: received headers show Google-to-Google delivery with no Spacemail forwarding hop. |
| Inbox placement | First direct test landed in Spam and was moved to Inbox. A subsequent fresh conversation and the reply arrived in Inbox without manual relabeling. No broad spam-bypass rule was created. |
| Outgoing identity | PASS: received From is BOOKED AF at the existing domain address. |
| Authentication | PASS: outgoing domain DKIM uses the Google selector and passes; SPF passes for the Workspace envelope sender. Incoming Gmail test passes SPF, DKIM and DMARC. |
| Reply round trip | PASS: external reply arrives directly in the Workspace Inbox. |
| Spacemail retirement | PASS: domain disconnected and both trial renewals off. |

The physical iPhone/Safari check and explicit production website release approval remain separate open gates in issue #6. This email migration does not close the current public-source exposure that requires the approved hosting cutover.
