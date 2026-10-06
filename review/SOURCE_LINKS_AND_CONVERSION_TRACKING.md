# BOOKED AF — SOURCE LINKS + CONVERSION TRACKING

**Status:** Canonical acquisition-link map
**Updated:** October 6, 2026

## Rule

Use one BOOKED AF destination and tag the source with `?src=`.

Do not create separate landing pages just to track channels unless performance later proves one is needed.

The source is stored for the visitor session and used in the privacy-safe conversion summary:
**visit → Breakdown email capture → verified YOUR NEXT 30 access.**

## Canonical links

- YouTube: https://bookedandfabulous.com/?src=youtube
- Instagram: https://bookedandfabulous.com/?src=instagram
- Threads: https://bookedandfabulous.com/?src=threads
- Email: https://bookedandfabulous.com/?src=email
- LinkedIn: https://bookedandfabulous.com/?src=linkedin
- Facebook: https://bookedandfabulous.com/?src=facebook
- Podcast / guest appearance: https://bookedandfabulous.com/?src=podcast
- Partner / referral: https://bookedandfabulous.com/?src=partner
- Direct / untagged: https://bookedandfabulous.com/

## Usage rules

- YouTube descriptions, pinned comments, and channel links use the YouTube link.
- Instagram bio, Story links, and BOOKED AF Reel CTAs use the Instagram link.
- Threads uses the Threads link.
- BOOKED AF emails use the Email link.
- LinkedIn posts/profile links use the LinkedIn link.
- Facebook Group/profile links use the Facebook link where group rules permit.
- Guest podcast show notes use the Podcast link.
- Industry referrals and approved partner placements use the Partner link.
- Do not manually append `src=direct`; untagged traffic is already treated as direct.

## Privacy / reporting

The conversion summary reports counts by source and session. It does not need customer names or email addresses.

Paid conversions are logged only after Stripe verifies active YOUR NEXT 30 access server-side.

## Current setup dependency

The private conversion-summary endpoint requires a Cloudflare `REPORT_SECRET` before it can be read. This is an operations secret, not a public website value.
