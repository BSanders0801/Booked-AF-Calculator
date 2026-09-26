# BOOKED AF follow-up email deployment

The email Worker now uses two delivery methods:

- Day 7 Breakdown check-in: Resend scheduled email
- Day 14 purchaser survey: Resend scheduled email
- Day 30 Breakdown recheck: Resend scheduled email
- Day 60 Breakdown recheck: Cloudflare KV follow-up queue
- Day 90 Breakdown recheck: Cloudflare KV follow-up queue

## Required Cloudflare setup

1. Create a Workers KV namespace for follow-up email records.
2. Bind that namespace to the email Worker with the binding name `FOLLOWUPS`.
3. Add a Cron Trigger to the Worker that runs at least once per day. The Worker’s `scheduled()` handler sends any due Day 60 or Day 90 emails and removes successfully sent records.
4. Redeploy the Worker after the binding and Cron Trigger are configured.

The existing Worker secrets still need to be available:

- `RESEND_API_KEY`
- `TURNSTILE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_SECRET_KEY`

The website changes also need to be published so the new `#survey` page and submission flow are live.

## Why Day 60 and Day 90 use KV

Resend’s individual Email API currently allows scheduled sends only up to 30 days ahead. The long-term queue avoids relying on unsupported 60- or 90-day scheduled sends.
