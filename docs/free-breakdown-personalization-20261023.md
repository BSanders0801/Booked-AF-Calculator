# Free Breakdown personalization — October 23, 2026

## Scope and changes

Continues the existing main-branch website. Preserves black/white/hot-pink design, typography, prices, three-result format, and closed checkout. No customer communications or production email POSTs were sent during testing.

- Added `personalization.js`: answer-based public diagnosis, measurable first action, and a distinct next step. Paid plans, scripts, worksheets, and calculators are not exposed.
- Added one conditional inquiry question for chair/client-growth visitors and one conditional price-evidence question for non-hourly chair/income visitors. No new income questions or invented conversion rates. Only one of these two questions appears on a given primary-goal path.
- Uses actual pay model, retention answers, service/time information, cost concern, schedule issue, saving habit, and secondary goal where applicable. Avoids treating every problem as marketing.
- Career-stage labels retain existing calendar-fullness thresholds. New explanation makes clear that stage is not a measure of talent, profit, or quality of life.
- Website and save/share copy use current answers, not older API result copy. Hidden answers are excluded after goal/lane edits.
- Moved the non-chair workdays question after goal selection. Previously it could be skipped before the time goal was known, leaving a required answer missing at submission.
- Added explicit labels to the three result items. Kept the existing layout and closed $49 offer, with accurate coming-soon language.
- Clarified that email carries a summary; the complete updated three steps appear on the website and in save/share output.
- Supplemental inquiry/price answers remain browser-only, excluded from the unchanged email API payload. Capture and privacy copy disclose this limitation.
- Clear-saved-progress now also clears cached server result copy.
- Added personalization and full browser journeys to the existing CI smoke check; versioned changed public assets for deployment verification.

## Problems addressed

Previously, `buildShortBreakdown` reduced answers to stage and primary goal; tips were selected mostly from title keywords or stage. Visitors with different evidence consequently received identical tips. The new layer differentiates inquiry conversion, lack of inquiries, weak retention, already-strong retention, price evidence, salon-controlled pricing, hourly pay, different cost concerns, and distinct time drains. Secondary goals change the third step without treating the goal itself as proof of its cause.

## Stages

| Stage | Existing classification | Personalization behavior |
|---|---|---|
| BUILDING | No appointments / little work | Preparation when not taking appointments; otherwise distinguish reach, inquiry conversion, returns, money and schedule needs. |
| GETTING BUSY | About half full | Work from the actual reported problem; no automatic marketing prescription. |
| IN DEMAND | Busy with openings | Price/time/retention advice follows evidence, including manager review where prices are fixed. |
| BOOKED AF | Full or close | Explain that a full calendar need not mean adequate pay or a sustainable life. Client-growth results account for limited capacity. Time results target the reported drain. |

There is deliberately no fixed bundle of three tips per stage.

## Three examples

1. **Half-full book, four days, wants clients, most return, inquiries fail to book.** GETTING BUSY. Diagnose the inquiry-to-booking gap; categorize where the last five inquiries stopped; test the main sticking point and track the next five.
2. **Busy with openings, commission, wants better income, salon sets prices.** IN DEMAND. Identify limited price control; record actual charge, share, personally paid supplies and total time for a completed service; bring that example to the manager to review timing, scope, service mix or compensation. No guessed hourly income or prescribed price increase.
3. **Full book, six–seven days, wants four days, keeps squeezing people in.** BOOKED AF. Identify the stated boundary problem; set a realistic last start time for one day; offer suitable future openings and check whether appointments and take-home pay can fit before removing workdays. No promise of unchanged income.

## Validation

- `node tests/personalization.cjs`: 2,564 selected answer combinations, 186 distinct recommendation sets. Includes all four professional stages, six goals, relevant branch combinations, hourly pay, professional lanes, owner versus manager, students, secondary goals, hidden-answer exclusion, invalid answers, and save/share text parity.
- `node tests/result-paths.cjs`: 50 professional/student paths.
- `node tests/visitor-flow.cjs`: navigation, multiselect, email gating, separate consent, privacy return, editing, invalid email, failed-submit recovery, successful results, and saved progress recovery. Network mocked.
- `node tests/browser-journeys.cjs`: 50 complete Chromium journeys at 360px and 1280px, including all four chair stages × six goals × two widths, plus non-chair time branches. Checks capture, result content, stale-server-copy handling, supplemental-field isolation, editing, reload, focus, horizontal overflow and runtime errors. External requests intercepted, so no messages are sent.
- JavaScript syntax checks. Mobile result screenshot visually reviewed.
- Live email API GET reports ready and advertises `short-v5`. This is a health check, not proof of delivery or production anti-bot validation.

These are meaningful branch and journey tests, not an assertion that every possible multiselect permutation or assistive technology has been tested. A three-minute completion time is a design target, not a measured human usability result.

## Remaining limitation

The separately deployed email Worker still generates the prior summary and profile results. Its current production source/deployment is not on main; historical release-branch code exists, but deploying that historical Worker could overwrite subsequent server behavior. This change preserves the current API contract rather than redeploying an unverified historical backend. Updating email and cross-device profiles to the same new three recommendations requires confirming the authoritative deployed Worker and its release path, then applying and testing a coordinated change. Supplemental answers are not available on another device. No live inbox-delivery claim is made.

Deployment status and the exact commit are reported in the accompanying completion message after checking GitHub Pages and live asset bytes. No pricing, payment, or brand decision is needed from Bradley for these changes.
