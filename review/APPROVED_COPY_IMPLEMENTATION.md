# Approved questionnaire copy — development implementation

Scope: `build/next30-shell-p04` only. Production remains on hold. No production deployment, DNS, live checkout, email configuration, or repository visibility change is authorized by this work.

The approved wording is recorded in `approved-copy.json` and applied to the active free Breakdown, paid career intake, survey, email-capture labels, worksheet inputs, and scorecards. The old `preview/` entry redirects to the main application; its retired copies are not part of the shipped public bundle.

Behavior accompanying the copy:

- Colorist specialty and consultation support multiple selections. Mutually exclusive answers stay exclusive.
- The education follow-up question (P50) is removed.
- First name is required in the form and validated by the Worker.
- F37 captures a named service and explicit hours/minutes, including setup and cleanup. Generic appointment-length answers are not silently reused; the service must be entered again. Form progress preserves the new object safely.
- People considering hair have their own career-stage choice and do not answer graduation or clinic-practice questions.
- Saved answers whose meaning changed are either migrated when equivalent or returned for re-answering. In particular, a previously empty salon cannot become a busy salon through a label change.
- Product commission is recorded separately from service sales and explicitly included in gross pay, so it is not counted twice.
- The approved monthly income goal is connected to the annual goal. Current monthly income remains a separate baseline; a desired amount never becomes current earnings.
- The hourly service-sales input uses a new saved key and is multiplied by booked hours. Old daily-revenue values retain their original meaning.
- Future-book coverage asks for available capacity, already excluding blocked time. It continues to read older total-minus-blocked records correctly.
- Survey recommendation values identify the new answer meanings while the backend still accepts old submissions.

Verification: complete questionnaire/worksheet test suite; new approved-copy behavior and money-unit tests; security and isolated fulfillment tests; release package guard. Browser layout and secure flow tests run in GitHub Actions for the exact development commit. Local browser installation was unavailable because the provider download returned an invalid archive.

The hardware iPhone check and all existing production-release gates remain outstanding. This document is not production-release approval.
