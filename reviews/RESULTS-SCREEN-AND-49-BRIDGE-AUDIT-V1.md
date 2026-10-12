# BOOKED AF — Result Screen and $49 Bridge Audit V1
Date: 2026-10-11
Status: Proposal for approval, not deployed.

## Inspected
app.js shortResultHTML, teaser/email/result/paid view render paths; breakdown-core.js buildShortBreakdown, buildOutsideChairBreakdown, shortEmailCopy and shortStage. Source audit, not live-device or transaction verification.

## Diagnosis
The current free results surface stage, priority, three move cards, metric, math calculator, 7-day checklist, save/share, paid promotion, edit and restart. The logic is useful; the presentation imposes too many simultaneous decisions. Results are personalized; do NOT replace computed text with a generic fixed script.

## Approved principles to preserve
Career stage; factual reasons derived from answers; one priority; three actions across 7 days; one metric; limitation disclaimer; ability to save and view full free output; paid resources never disclosed beyond approved free scope.
Maintain student lifecycle result separately.

## Proposed result structure
1. Reveal card:
Eyebrow YOUR BOOKED AF BREAKDOWN
Headline WELL. THAT EXPLAINS A FEW THINGS.
Label YOUR CAREER RIGHT NOW
Dynamic stage
Label HERE'S WHAT NEEDS ATTENTION FIRST
Dynamic top.title and intro/snapshot
Primary CTA SHOW ME MY 7-DAY PLAN →
Copy has to preserve access to 3 free actions and metric.
2. 7-day plan: show 3 dynamic action cards and WATCH THIS; keep numbering and dates.
3. Utility tools: collapsible or secondary links for chair math, save/share, edit/restart. Don't eliminate working functionality, accessibility, or share capability.
4. $49 offer after free deliverables:
Eyebrow READY TO GO FURTHER?
Headline WELL, NOW WE KNOW WHAT'S WRONG. 
Body Your free Breakdown gave you a starting point. Your Next 30 builds a four-week plan around your kind of work, with scripts and tools to help you put it to work.
Price $49 · one payment · no subscription
CTA SEE WHAT'S IN YOUR NEXT 30 — $49 →
For purchase actual conversion CTA on paid details page: BUILD MY NEXT 30 — $49 →
Explain checkout and additional intake accurately before payment.
5. Footer: edit answers, start over, privacy/support as appropriate.

## Important concerns
- Existing shortResultHTML uses "OPEN MY 7-DAY CHECKLIST" alongside math/share and paid offer; promote plan first and demote tool links.
- Paid product should not cannibalize or hide promised 3 free moves/metric.
- Page must not falsely suggest a guaranteed diagnosis or specific earnings.
- Data-driven result content must work across chair, owner, manager, session, events, education, and student paths.
- Existing email copy says Love your career. Keep your life. Preserve only if consistent with approved messaging; proposed default brand closing: Fully booked is great. Booked on your terms is better.
- FIRST NAME (OPTIONAL) still conflicts with approved required name.
- Public sales headline contains profanity; replace while preserving edge.
- Test email capture and whether free results are truly displayed and emailed.
- Test iPhone rendering and keyboard/screen reader interactions.
- Check that all 'SHOW ME...' and checkout controls navigate correctly.
- Do not modify production until user approves and functional tests pass.
