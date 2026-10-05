# YOUR NEXT 30 — purchase and delivery review

Reviewed October 4, 2026 (LA). Draft review only; this document does not establish customer terms or authorize production release.

## Confirmed offer and delivery

- YOUR NEXT 30 costs $49 USD once. The free Breakdown is separate.
- No subscription, membership, coaching calls or live classes are included.
- The current career plan contains four weeks of actions, three adaptable scripts, a work checklist, career work math, a before-and-after scorecard and a purchase-value check.
- Newer tools now provide an entry to that full career plan and a return to the current tool. Tool entries remain saved.
- A purchase covers separate career plans for the buyer's selected work; it is not a promise to unlock every future lesson or product.
- Purchase access is checked against a completed approved Stripe Checkout session. Discounted and approved no-cost tester purchases are supported in the draft fulfillment code.
- The checkout return and welcome email contain the purchase session link. The email address is the address used at checkout.
- Paid tool answers, entries and notes are stored on the device. They do not automatically sync across devices.
- A downloaded JSON plan file can restore entries after verified purchase access is opened. A file alone does not unlock the product.
- Keep purchase links and plan files private. Do not put client identifiers or private contracts in notes.
- No income result is promised. Tools compare entered evidence and scenarios, not proven causation.

## Purchase/help wording ready for the draft

**What am I buying?**
A 30-day plan built from your answers, with four weeks of actions, scripts, a work checklist and tools to check what changed. YOUR NEXT 30 is $49, paid once. Coaching calls, live classes and a membership are not included.

**How do I open it?**
Return to BOOKED AF after checkout, or open START MY NEXT 30 in the welcome email sent to the address you used at checkout. Your purchase is checked before the plan opens.

**How do I keep my work?**
Use SAVE MY PLAN FILE before clearing browser storage or changing devices. On another device, open your purchase link first, then import the file. Your tool entries do not automatically sync between devices.

**Where are my scripts and scorecard?**
On a tool screen, choose OPEN MY FULL PLAN. Use BACK TO MY CURRENT TOOL to return to your saved tool entries.

**What if the email is missing or access fails?**
Check spam and the email address used at checkout. Email hello@bookedandfabulous.com with your Stripe receipt or purchase reference and a description of what happened. Do not send card numbers, passwords, private client notes or your whole plan file.

## Business policies still requiring a decision

| Decision | What is known | Draft operational proposal, not approved terms |
| --- | --- | --- |
| Refund handling | No YOUR NEXT 30 policy is approved. Earlier general preference was that refunds should not happen. | Resolve access/delivery problems first; review duplicate charges and unresolved delivery failures individually. Do not advertise a satisfaction or income guarantee. Decide treatment of change-of-mind requests before release. |
| Access duration | Current code has no timed purchase expiry. A 30-day plan describes the work period, not an approved access limit. | Do not promise lifetime access. Choose an explicit supported period before publishing purchase terms; saved readable copies remain the buyer's own files. |
| Support | A business contact address exists. No response-time commitment is approved. | Support covers payment, opening access and restoring plan files. Coaching and reviews of private finances are outside the purchased offer. Set a reply target that Bradley can maintain before promising a timeframe. |

Publish the chosen rules beside checkout and make the support route reachable from payment-error screens. Review the resulting purchase/privacy terms before public release. No policy in the proposal column should be represented as already approved.

## Real delivery test — still open

Use a Stripe sandbox/test environment and an expressly approved test recipient. Only the live Stripe account is currently exposed through the connector. Automated tests do not prove inbox receipt. No live checkout, charge or email is authorized by this checklist.

| Test | Required evidence |
| --- | --- |
| Full-price $49 checkout | Completed approved test session; access opens once verified; welcome arrives at test inbox with a working private link. |
| Partial discount | Completed discounted session unlocks the same offer and sends the same welcome. |
| BETA100 / 100% discount | Zero-total no_payment_required session unlocks; welcome and Day 14 survey scheduling both succeed. No PaymentIntent is required for this case. |
| Open/unpaid or unrelated checkout | No YOUR NEXT 30 access or welcome. |
| Asynchronous payment | Access and welcome only after successful completion/payment state. |
| Duplicate event | Provider idempotency prevents another welcome for the same purchase. |
| Email provider failure | Worker reports retryable failure; replay after recovery delivers the welcome. |
| Reopen on another device | Purchase email link verifies access; imported JSON restores tool entries, weekly actions and notes. |
| Invalid backup | Existing plan remains intact; file does not bypass purchase verification. |

Record session identifiers privately, event status, email provider delivery evidence and actual inbox receipt. Never commit secrets or customer records. Keep these gates open until the evidence exists.

## Automated evidence already completed

- Full test suite passes, including discounted/no-cost access, signed/forged webhooks, unrelated/unpaid sessions, asynchronous success and retryable welcome failures.
- Full-plan round trips preserve entries across the money map, income lanes, rebooking, buyback and service tools.
- Zero purchase cost is accepted in value calculations without dividing by zero or claiming a percentage return.
- Draft asset packaging passes. Deployed draft was inspected at a 390px browser frame, including full-plan entry, $0 value check and return to income lanes.
- These checks did not charge anyone or send a real email, and are not physical-device testing.
