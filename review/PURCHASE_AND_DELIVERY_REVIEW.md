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

## Approved business policies — October 4, 2026 (LA)

Bradley approved the following after reviewing the recommendation in this conversation:

- Change-of-mind purchases are final once access is delivered.
- Correct duplicate charges; refund the affected purchase when a delivery/access failure cannot be resolved. Preserve applicable legal rights.
- Include 12 months of online access from purchase. Buyers can keep downloaded readable copies. JSON backups require active verified access to restore inside the product.
- Reply to purchase and technical-support requests within two business days. The draft defines business days as Monday–Friday, excluding U.S. federal holidays. This is a reply standard, not a guaranteed resolution deadline. No coaching or personal financial review is included.

The draft sales page displays the rules. They have not been released to production or applied retroactively to existing buyers. The current Worker has no timed expiry; before release, reconcile the approved duration with purchase-date tracking and buyer-facing expiry handling. Do not silently revoke access for buyers whose original purchase terms did not state this limit. Verify the support inbox and reply process before making the service promise live.

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
