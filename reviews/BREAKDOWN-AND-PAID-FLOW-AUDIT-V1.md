# BOOKED AF — Breakdown & Paid Transition Audit V1
Date: 2026-10-11
Status: Review only; zero production code changes.

## What was inspected
GitHub default-branch app.js: legacyQuestions, deepQuestions, intake email screen, free result teaser, $49 paid screen, and samples of existing education titles. This is a code review, not an end-to-end rendered runtime test. The active short-question schema is dynamically loaded; full short-form user-path audit remains outstanding.

## Preserve
- Personalized question selection and career-stage logic.
- Friendly answer choices that allow uncertainty ("I honestly don't know").
- Existing lesson titles: THE EMPTY CHAIR TAX; THE DISCOUNT HANGOVER; FIRE THE CLIENT; LUNCH IS NOT A CANCELLATION; WHO OWNS YOUR PAYCHECK; PAY YOURSELF TO DISAPPEAR.
- Clear $49 one-time/no-subscription description.
- Explicit Stripe checkout and return-to-site access explanation.
- Free Breakdown output: a first priority, three moves, seven days, one thing to watch.

## Confirmed issues
P0: email capture labels FIRST NAME (OPTIONAL), contradicting approved requirement that first name be required. Change carefully and validate form logic/server payload.
P1: $49 offer headline includes "fix the damn thing"; brand bible disallows profanity in public sales material.
P1: free-to-paid offer contains four generic DO THIS / STOP THIS / WATCH THIS / YOUR NEXT 30 feature boxes; consolidate into one short explanation and one CTA. Do not reduce deliverable specificity.
P1: two opening states: the static marketing homepage and the rendered JS intro view have different messaging. Verify the actual path and unify voice where a visitor can see them.
P1: free-result teaser leads through email capture before full Breakdown. Ensure copy clearly states what's free and when email is required; validate that the user can read results as promised.
P2: mismatch in older messaging saying name optional, plus multiple marketing descriptors for the Breakdown; use consistent naming and promised outcomes.
P2: deepQuestions may require as many as ~20 visible questions depending on answers; paid customers must understand this is a second intake, not the same three-minute free questionnaire. Existing inherited answers mitigate duplication.

## Suggested copy — FREE EMAIL CAPTURE
Eyebrow: YOUR BREAKDOWN IS READY
Headline: LET'S SEE WHAT'S ACTUALLY GOING ON.
Body: Give us your name and email. Your free Breakdown opens here, and we'll send a copy. Three moves for the next seven days, plus one number worth watching.
Label: FIRST NAME (REQUIRED)
Label: EMAIL (REQUIRED)
Button: SHOW ME MY BREAKDOWN →
Note: Only promise email delivery if confirmed in end-to-end testing.

## Suggested copy — $49 OFFER
Eyebrow: YOUR NEXT 30
Headline: THE PROBLEM HAS BEEN IDENTIFIED. HOW INCONVENIENT.
Body: The free Breakdown shows you where to start. Your Next 30 turns that into four weeks of specific actions, usable scripts, and tools for your kind of work.
Price: $49 — ONE PAYMENT. NO SUBSCRIPTION.
Button: BUILD MY NEXT 30 — $49 →
Pre-checkout note: Secure Stripe checkout. After paying, you'll answer a few more questions so we can build your 30-day plan. We'll send an access link too. [Verify actual behavior before publishing.]
Secondary: NOT YET
Avoid claiming guaranteed earnings or savings.

## Free result card
Eyebrow: YOUR BOOK RIGHT NOW
Headline: [computed career stage]
Label: FIRST THING TO FIX
Computed priority: retain accuracy
Next: YOUR FREE BREAKDOWN: THREE MOVES, SEVEN DAYS, ONE THING TO WATCH
Button: SHOW ME THE FULL BREAKDOWN →

## Testing and safeguards
1. Verify deployed homepage and JS intro sequences, mobile and desktop.
2. Walk a free user through short schema, email capture, results and back navigation.
3. Verify first-name required validation doesn't break lead capture.
4. Verify email delivery, unsubscribe/privacy text where applicable.
5. Test Stripe ONLY in test mode and verify return/deep intake entitlement.
6. Check all CTA labels, access promises, and post-payment email against actual behavior.
7. Do not expose paid frameworks inside free results.
8. User approval before publishing.
