# BOOKED AF — Active Questionnaire Brand Audit V1
Date: 2026-10-11
Status: review draft only; NO production changes.

Source: breakdown-core.js active short-v5 questionnaire; app.js rendering/capture/paid transition. Reviewed conditional question definitions and student/professional paths by source. Not a timed user test.

## Key decision
DO NOT wholesale rewrite the current free questionnaire. It is more on-brand than the homepage and has meaningful career personalization. Preserve IDs, option values, branching predicates, schema version, results logic and calculation semantics.

## Keep verbatim
WHAT’S YOUR HAIR GAME?
OKAY, BUT WHAT PAYS THE BILLS?
HOW FULL IS YOUR BOOK, REALLY?
ALRIGHT. WHAT NEEDS FIXING?
WHICH ONE DO WE FIX FIRST?
THEY CAME ONCE. DID THEY COME BACK?
WHICH WORK BILLS HAVE YOUR NAME ON THEM?
GREAT HAIR. NOW, DO YOU TALK ABOUT THEIR NEXT VISIT?
THEY LEFT WITHOUT REBOOKING. WHAT HAPPENS NEXT?
Keep choice: Some do. Some vanish into the witness protection program.
Keep explicit uncertainty choices; no shame.

## Targeted rewrite candidates (copy ONLY, pending approval)
Current: WHAT DO YOU END UP PAYING FOR?
Suggested: WHAT COMES OUT OF YOUR POCKET?
Why: more conversational and explicit.

Current: HOW LONG DOES IT USUALLY TAKE TO ACTUALLY GET PAID?
Suggested: YOU DID THE JOB. WHEN DO YOU GET PAID?
Why: sharper, same intent.

Current: HOW MANY DAYS A WEEK DOES WORK REALLY TAKE?
Suggested: HOW MANY DAYS DOES THIS JOB ACTUALLY EAT?
Why: includes admin, prep, travel. Confirm whether overly negative for all careers before adoption.

Current: HOW MANY HOURS A WEEK ARE YOU ACTUALLY WORKING?
Suggested: HOW MANY HOURS DOES WORK REALLY TAKE?
Why: less procedural; keep explanatory note defining what counts.

Current: WHAT HAVE YOU ACTUALLY CHECKED SO FAR?
Suggested: WHAT HAVE YOU CHECKED BEFORE SAYING YES?
Why: context is a school-to-career/salon decision; ensure conditional context is clear.

Current: IS SAVING MONEY HAPPENING, OR STILL ON THE TO-DO LIST?
Decision: KEEP. Clear and lightly funny.

Current: WHAT DO YOU THINK COMES AFTER GRADUATION?
Decision: KEEP. Student audience needs clarity more than sarcasm.

## UX review items
- Active short-v5 has conditional professional and student questions; 47 source definitions does NOT imply 47 shown to one visitor.
- Screen currently sometimes says 'Question N · about 7-10 questions', else 'Question N of total'. Verify progress doesn't feel inconsistent or misleading.
- Time the true completion path for colorist, owner, session, educator, student. Do not claim 3 minutes as measured yet.
- Test multi-select exclusivity and branching when answers change.
- Verify clear privacy/email explanation before result capture; first-name required discrepancy already separately flagged.
- Avoid leaking paid scripts/frameworks into free outcome.
- Do not simplify by deleting diagnostic questions if that reduces accuracy.
- Confirm short-v5 availability/fallback against runtime service; app.js falls back to legacyQuestions if readiness check fails.

## Work sequence
1. Approve copy-only changes.
2. Prepare separate branch patch with question text strings only.
3. Automated test of branching and result correctness against current behavior.
4. Timed iPhone walkthrough of 5 career paths plus fallback.
5. No production deployment without explicit approval.
