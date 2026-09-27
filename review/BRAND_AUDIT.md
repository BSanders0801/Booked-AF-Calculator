# BOOKED AF: page-by-page brand audit and fixes

## Current status

The original headline is retained: **YOUR TALENT SHOULD BUY YOU FREEDOM.** The rejected replacement is removed. Website changes are saved in the draft, not deployed. Live and draft source restore points and a verified local backup are available separately.

The live site was inspected on desktop and phone before edits. The revised pages were checked at 1440, 390 and 320 pixels, with 33 page/viewport checks, keyboard navigation, working image loads, no horizontal overflow, four navigation items and a hero CTA inside the initial viewport. Automated accessibility checks found no violations on 11 public screens plus paid intake and an expanded paid plan. Automated scans are not a certification or a substitute for testing with assistive-technology users.

## Critical issue still requiring service setup

The live email-service host serves website HTML instead of API JSON. Purchase verification and survey routes return 404. Cloudflare's current production settings show no runtime secrets or connected bindings. This blocks a reliable end-to-end launch. The draft preserves verification and email requirements; it does not fake success or bypass payment.

The repair requires deploying the existing email-worker source explicitly, restoring its runtime secrets securely, and verifying its follow-up storage and scheduled trigger. See the service repair notes. No keys were requested in chat, invented or placed in repository files. No live purchase, email, webhook or service-setting change was made during this audit.

## Main old-versus-new decisions

| Page / element | Old | New | One-line reason |
|---|---|---|---|
| Hero headline | Your talent should buy you freedom. | **Retained verbatim.** | Bradley chose to keep the original point of view. |
| Hero audience | For hairdressers. | Business help for hairdressers. | Names both the audience and the offer immediately. |
| Hero subline | You can love doing hair. And still want a life. Plus a second paragraph about practical education. | Find your next move for better bookings, money you keep, and more life outside work. | Gives one concrete explanation below the headline. |
| Hero actions | Free Breakdown and paid-plan actions side by side. | One primary button: Get my free Breakdown. | Makes the first decision obvious. |
| Home body | Stages, manifesto, long bio, future resources and product comparison. | How it works, career examples, short founder proof, optional paid next step. | Removes repeated promises and future offers that distract from today's product. |
| About headline | Your career owes you a life. | Great hair. Questionable planning. | Restores Bradley's approved dry humor. |
| Credentials | Taught nationally for two brands, without exact role/timing. | Earlier in my career… Artistic Technical Trainer for L’Oréal Professional; National Educator with John Paul Mitchell Systems. | Uses the approved titles and avoids implying current affiliation. |
| Paid headline | You know what needs work. Let’s build your next 30 days. | Know the move. Now make it. | Shortens the invitation while the subline explains the product. |
| Paid promise | A plan built around your actual business. | Four weeks, 3 scripts, a work checklist, money tools and a before/after scorecard. | Replaces generic value language with reviewable deliverables. |
| Contact | Good questions. Always welcome. Several equally weighted actions. | Got a question? Send it. One email-support action. | Makes help easier to find and use. |
| Free example | Your career. Your rules. | Show me what I get. | Answers the visitor's immediate question. |
| Paid example | A single chair-focused sample on the live site. | 10 career examples from the completed draft. | Shows the value to session, bridal and leadership customers too. |
| My plan | An ambiguous link returning to the free flow. | My plans, with separate free and verified paid recovery. | Prevents a purchaser from being sent into the wrong product. |
| Email capture | Three moves. Seven days. First name label. | 3 moves. 7 days. First name (optional). | Matches the numeral rule and makes optional effort explicit. |
| Survey invitation | Tell us what you think. Six quick questions. No corporate nonsense. | Did we earn our keep? 6 quick questions. Tell us what helped and what needs work. | Keeps the attitude while asking for specific feedback. |
| Privacy heading | Your information. Clearly explained. | Your information. Here’s the deal. | Shortens the heading without changing privacy promises. |
| Logo | 631,856-byte PNG. | 26,718-byte WebP using the same artwork. | Cuts the logo payload by about 96%. |
| Portrait | 167,044-byte SVG wrapper containing a photo. | 92,294-byte WebP, lazy-loaded below the fold. | Reduces bytes and keeps a real, existing founder image. |
| Controls | Small specialty/nav text, mixed radii and spacing. | Shared type and control styles; checked buttons/nav/summary controls at least 44px high. | Makes touch and keyboard use more consistent. |
| Keyboard / structure | Skip link could route home; missing top-level screen headings and skipped levels. | Skip link focuses content; complete heading levels, visible focus and reduced-motion rules. | Makes navigation and page structure more usable. |

## First-time visitor assessment

The retained hero now puts **business help for hairdressers**, the desired work/money/time outcomes and one free CTA together. The CTA is visible at the tested first-screen sizes. This is an editorial and layout assessment, not a measured 3-second usability result; new-visitor testing is still needed to prove comprehension.

## Trust and originality

No client testimonial, revenue gain, success rate or before/after result was invented. Founder experience uses the approved bio. Product examples are labeled as made-up situations. Verified, permissioned customer quotes and before/after evidence remain missing. The scorecard lets future customers record real results; a calculated example is not proof of a customer outcome.

The public homepages of [Thriving Stylist](https://thrivingstylist.com/) and [Destroy the Hairdresser](https://www.destroythehairdresser.com/) were reviewed. The concern was category-level similarity in broad coaching, freedom and business-growth language, not a confirmed copied passage. The edits emphasize Bradley's own observations, money actually kept, the next booking and usable scripts. This was a limited editorial comparison, not an exhaustive plagiarism review.

## Complete visible copy changes by page

The tables below compare the recorded live page with the revised draft. Identical blocks are omitted. “Removed” means deliberately cut. New paid examples reflect the career-specific draft built before this brand sweep. Repeated sample values are illustrative, not testimonials.

### Home

Keep the chosen promise; make the audience and free next step clear, shorten the page and surface approved experience.

| Old | New | Reason |
|---|---|---|
| BOOKED &amp; FABULOUS · FOR HAIRDRESSERS<br>YOUR TALENT SHOULD<br>BUY YOU FREEDOM.<br>You can love doing hair.<br>And still want a life.<br>Practical education and tools to get more of the right work, keep more of your money, and build a career that leaves something for you. | BOOKED &amp; FABULOUS · BUSINESS HELP FOR HAIRDRESSERS<br>YOUR TALENT<br>SHOULD BUY YOU<br>FREEDOM.<br>Tell us what kind of hair work you do and what needs to change. Get practical next steps for your work, money, and time. | Keep the chosen promise; make the audience and free next step clear, shorten the page and surface approved experience. |
| See Your Next 30 · $49 ↗<br>About 3 minutes. 3 next moves. Email required to get your free Breakdown.<br>YOUR CAREER. YOUR RULES.<br>Same industry.<br>Very different careers.<br>See how BOOKED AF changes the advice depending on how you actually make your living. | About 3 minutes. 3 next moves. Email required.<br>DIFFERENT WORK. DIFFERENT DECISIONS.<br>Show me something useful.<br>3 examples of the questions worth asking before the next booking.<br>COLORIST<br>Where did the $300 go?<br>$55 in costs. 4 hours from setup to cleanup. That leaves $245, or $61.25 an hour.<br>Check the whole appointment before changing the price.<br>See the colorist example →<br>BRIDAL STYLIST<br>The wedding is only part of the job.<br>$1,000 collected. $400 in costs. 12 hours including the trial, travel, prep, and event. That leaves $50 an hour.<br>Check the full booking before adding another person.<br>See the bridal example →<br>SESSION STYLIST<br>The rate looked better before the travel.<br>$800 earned. $120 in costs. 14 hours including prep, travel, set time, and wrap. That leaves $48.57 an hour.<br>Get the full schedule before saying yes.<br>See the session example →<br>Made-up examples, not customer results or recommended rates. Figures exclude personal taxes and costs not listed. Open an example to see the assumptions.<br>See all 10 career paths →<br>START WITH ONE USEFUL ANSWER.<br>What needs your<br>attention first?<br>01 / TELL US<br>Normal questions.<br>Your work. Your book. What you want to change. Pick the answers that fit.<br>02 / GET YOUR BREAKDOWN<br>One clear priority.<br>We’ll show you what to work on first and why it fits your answers.<br>03 / PUT IT TO WORK<br>3 moves. 7 days.<br>A short plan and a result to watch. Your to-do list has suffered enough.<br>CHAIR. SET. WEDDING. SALON.<br>Your work changes.<br>So should the advice.<br>Choose a free example. See what changes when the career changes. | Keep the chosen promise; make the audience and free next step clear, shorten the page and surface approved experience. |
| YOUR WORK. YOUR PACE.<br>YOUR WORK RIGHT NOW.<br>Starting over? Building momentum? In demand and exhausted? BOOKED AF starts with the work you actually have — chair, set, event, classroom, or salon — and builds from there.<br>BUILDING<br>GETTING BUSY<br>IN DEMAND<br>BOOKED AF<br>These stages describe your current work and demand. They have nothing to do with your age, talent, or years in the industry.<br>START HERE<br>Find your next move. Choose your plan.<br>The free Breakdown<br>Figure out what needs your attention first.<br>Free<br>A short set of normal questions<br>What to fix first<br>3 moves for the next seven days<br>Money tools to check what the work actually pays<br>Get my free Breakdown →<br>YOUR NEXT 30<br>BOOKED AF: YOUR NEXT 30<br>Your numbers. Your work. Your next 30 days.<br>$49 one payment<br>DO THIS: your first move<br>STOP THIS: what is wasting time, money, or energy<br>WATCH THIS: the number that tells us if it worked<br>A four-week plan built around your answers<br>See what’s inside →<br>No subscription.<br>THE POINT<br>STOP TRADING YOUR WHOLE LIFE<br>FOR A PAYCHECK.<br>Make the work pay. Protect your time. Build something that leaves room for you. | Examples use made-up situations. Your Breakdown uses your answers. | Keep the chosen promise; make the audience and free next step clear, shorten the page and surface approved experience. |
| FOUNDER / BOOKED AF | COLORIST / EDUCATOR / FOUNDER | Keep the chosen promise; make the audience and free next step clear, shorten the page and surface approved experience. |
| THE BIGGER PICTURE · COMING NEXT<br>A better career should come<br>with a better life.<br>01 / YOUR BUSINESS<br>More than a full book.<br>Short lessons, practical scripts, and tools that make the business side easier.<br>02 / YOUR LIFE<br>You’re part of the plan.<br>Education around sustainable schedules and looking after the person doing the work.<br>03 / YOUR FUTURE<br>Something set aside.<br>Simple ways to build better money habits and prepare for the unexpected.<br>In development. These future resources are not included in today’s $49 offer. | WHEN YOU WANT THE NEXT STEP<br>Your next 30 days.<br>With a plan.<br>Four weeks of actions, scripts you can use, and tools to check what changed. Built around your kind of work.<br>See Your Next 30 · $49, one payment ↗<br>Start with the free Breakdown.<br>Find the first move. You can decide what comes after.<br>Get my free Breakdown → | Keep the chosen promise; make the audience and free next step clear, shorten the page and surface approved experience. |

### Your Next 30 sales page

Replace broad coaching language with specific deliverables, price, recovery instructions and an honest scope.

| Old | New | Reason |
|---|---|---|
| You know what needs work.<br>Let’s build your next 30 days.<br>No giant business plan. Just what to do, what to stop, and what to watch for the next 30 days.<br>A plan built around<br>your actual business.<br>Look at what you earn, how paid work finds you, what comes back, and where your time goes. Turn your answers into a clearer next step.<br>WHAT’S INSIDE<br>DO THIS.<br>The move that deserves your attention first.<br>STOP THIS.<br>The habit, leak, or busywork that is not earning its place.<br>WATCH THIS.<br>One number that tells you whether the move is working.<br>YOUR NEXT 30.<br>Four weeks of simple actions built around your answers.<br>ONE PLAN. ONE PAYMENT. | KNOW THE MOVE.<br>NOW MAKE IT.<br>A 30-day plan for your kind of hair career. What to do, what to stop, and what to watch.<br>Colorist, stylist, session, bridal, extensions, education, salon leadership, or starting again. Your work gets its own questions and advice.<br>See an example for my career ↗<br>YOUR CAREER. ONE PAYMENT. | Replace broad coaching language with specific deliverables, price, recovery instructions and an honest scope. |
| No subscription.<br>Build my Next 30 — $49 →<br>Secure checkout with Stripe.<br>See a sample Next 30 ↗<br>WHAT HAPPENS NEXT | No subscription. No coaching calls included.<br>Build my Next 30 - $49 →<br>Secure checkout with Stripe. Your purchase email contains your access link.<br>WHAT YOU ACTUALLY GET<br>Useful on Monday.<br>Still useful next month.<br>Your first move.<br>What to do, what to stop, and what to measure. Four weeks of actions that fit the time you have.<br>Words you can use.<br>3 scripts and a work checklist for your career. Fill in what’s true. Make them sound like you.<br>Numbers worth knowing.<br>Check what the work leaves you. Compare before and after. See whether the change covered what you paid.<br>Work more than one way? Build separate career plans under the same purchase. Save your plan file and bring it back when you’re ready to check progress.<br>HOW IT WORKS | Replace broad coaching language with specific deliverables, price, recovery instructions and an honest scope. |
| Start Your Next 30.<br>One payment through secure checkout. | Buy once.<br>Pay $49 through Stripe. Open your plan from the checkout return or your purchase email. | Replace broad coaching language with specific deliverables, price, recovery instructions and an honest scope. |
| Tell us about your work.<br>Normal questions. BOOKED AF handles the math. | Pick your answers.<br>Usually 11-14 relevant questions. Matching free answers carry over. You can change them. | Replace broad coaching language with specific deliverables, price, recovery instructions and an honest scope. |
| Work your plan.<br>Start with your priorities and follow your next steps.<br>Is this a membership?<br>Do I have to take the free Breakdown first? | Try it. Track it.<br>Start with week one. Add real numbers to the tools when you have them. Save your plan before you leave.<br>Do I need the free Breakdown first?<br>How do I get back to my plan? | Replace broad coaching language with specific deliverables, price, recovery instructions and an honest scope. |
| (Not present) | Will this make me more money? | Replace broad coaching language with specific deliverables, price, recovery instructions and an honest scope. |

### Meet Bradley

Restore the approved short bio, dry humor, exact education titles and past-affiliation wording.

| Old | New | Reason |
|---|---|---|
| FOUNDER / BOOKED AF<br>MEET BRADLEY SANDERS · FOUNDER<br>YOUR CAREER OWES YOU<br>A LIFE.<br>Great hair. Expensive lessons. I’m Bradley. I’ve spent nearly 30 years behind the chair as a colorist, salon owner, and educator. I’ve owned salons, worked in some of New York City’s top Fifth Avenue and SoHo salons, and now color hair in West Hollywood.<br>Along the way, I taught nationally for L’Oréal Professionnel and John Paul Mitchell Systems. I also stepped away from hair for a while — and eventually found my way back to the chair with a very different idea of what a successful career should look like.<br>I’ve made good money in this industry. I’ve also worked too much, saved too little, and learned more than a few business lessons the expensive way.<br>BOOKED AF is what I wish I’d had earlier: simple, useful help for hairdressers who want a fuller book, better money, and an actual life outside the salon. No business-school language. No pretending everybody’s career should look the same. Just what works, what doesn’t, and what to do next. | COLORIST / EDUCATOR / FOUNDER<br>MEET BRADLEY SANDERS<br>GREAT HAIR.<br>QUESTIONABLE PLANNING.<br>I’m Bradley. Nearly 30 years as a colorist, salon owner, and educator, with time behind the chair at top salons on New York’s Fifth Avenue and in SoHo. These days, you’ll find me coloring hair in West Hollywood.<br>Earlier in my career, I taught for L’Oréal Professionnel as an Artistic Technical Trainer and for John Paul Mitchell Systems as a National Educator. My job was to make color techniques and product knowledge useful behind the chair.<br>I’ve made good money. I’ve also worked too much and saved too little. Great hair. Questionable planning.<br>BOOKED AF is where I share what helped, what didn’t, and what I wish someone had told me sooner. More money left for you. More life outside the salon. | Restore the approved short bio, dry humor, exact education titles and past-affiliation wording. |
| (Not present) | LESSONS FROM MY OWN CAREER<br>I learned this the expensive way.<br>COLOR PRICING<br>One flat fee. A whole lot of product.<br>I used to charge one flat fee for a dimensional blonde. One lightener in the foils. Another to hand-paint the ends. Separate glosses for the roots, midshaft, ends, and money piece. Two lighteners. Four glosses. One price that wasn’t accounting for all of it.<br>The color was customized. The price hadn’t caught up. Every extra bowl had a cost, and I was absorbing it. Beautiful blonde. Very generous of me.<br>Read the story<br>MOVING CITIES<br>New city. Different blonde.<br>Moving cities taught me that “I want to be blonde” can mean very different things. In New York, my clients leaned cool and dimensional. In Miami, warm and golden. In California, natural and sun-kissed.<br>Those were the patterns I experienced, and I had to adjust my formulas as I moved. Same word. A different picture in the client’s head. I had to understand that picture before mixing.<br>Read the story<br>TEACHING<br>The class started long before anyone walked in.<br>I loved working with L’Oréal Professionnel and Paul Mitchell, teaching hairdressers color techniques, formulation, and product knowledge. But the work started long before the class.<br>There were four to six mannequins to color and style, a curriculum packet to prepare, and everything to pack. Some mornings, I was on the road at 5 a.m. for a 150-mile drive to a rural salon. And that was after the studying. Nothing says glamour like a car full of mannequin heads before sunrise.<br>Read the story<br>Different careers need different experts.<br>My experience is in color, salon ownership, and education. I’ve never done bridal or session hair. I have experts for that.<br>Find my first move → | Restore the approved short bio, dry humor, exact education titles and past-affiliation wording. |

### Contact

Make support the obvious action and explain what information helps.

| Old | New | Reason |
|---|---|---|
| STAY IN THE CONVERSATION<br>Good questions.<br>Always welcome.<br>Questions about the Breakdown or Your Next 30? Get in touch. | CONTACT BOOKED AF<br>GOT A QUESTION?<br>SEND IT.<br>Stuck on a plan, a purchase, or a number that looks suspicious? Email us.<br>Email BOOKED AF → | Make support the obvious action and explain what information helps. |
| Follow on Instagram ↗<br>Follow on TikTok ↗<br>Start with something useful.<br>Get your free Breakdown. Enter your email at the end to open your plan here and receive a copy.<br>Get my free Breakdown →<br>Your email is required to send and open your full result. | Help us find the problem.<br>Tell us what you were trying to do and what happened. For a purchase question, include the email you used at checkout. Keep card details and client information out of the message.<br>Instagram ↗<br>TikTok ↗<br>Just looking around? Start with your free Breakdown. | Make support the obvious action and explain what information helps. |

### Free Breakdown example

Show the product with larger controls and clear example labels; do not imply customer results.

| Old | New | Reason |
|---|---|---|
| EXAMPLE ONLY · NOT YOUR PERSONAL RESULT<br>YOUR CAREER.<br>YOUR RULES.<br>See how BOOKED AF thinks differently depending on how you actually work. | FREE BREAKDOWN · EXAMPLE ONLY<br>SHOW ME<br>WHAT I GET.<br>One priority. 3 moves. One result to watch. Pick a career to see an example. | Show the product with larger controls and clear example labels; do not imply customer results. |
| Start my Breakdown →<br>Back home | These are made-up situations, not customer results. | Show the product with larger controls and clear example labels; do not imply customer results. |

### Your Next 30 examples

Let all 10 careers see a relevant example from the new paid draft.

| Old | New | Reason |
|---|---|---|
| EXAMPLE ONLY · NOT YOUR PERSONAL PLAN<br>THIS IS WHAT<br>$49 GETS YOU.<br>A real Your Next 30 is built from your answers. This sample shows the format without pretending every hairdresser needs the same advice.<br>SAMPLE / GETTING BUSY<br>DO THIS<br>Fix Appointment #2.<br>New clients are finding you. Before you chase even more people, make the next visit clear and easy to reserve.<br>START HERE: Before checkout, tell every client what you recommend next, when you recommend it, and why. | EXAMPLE ONLY · MADE-UP ANSWERS<br>YOUR CAREER.<br>YOUR KIND OF PLAN.<br>Pick your career. This sample uses a busy workload, a better-pay goal, and an hour a week. Your answers change your plan.<br>Colorist<br>Cutting + styling<br>Extension specialist<br>Session / editorial / commercial<br>Bridal + event stylist<br>Educator + beauty brand work<br>Salon owner<br>Salon manager<br>Starting or returning to hair<br>Another kind of hair career<br>ILLUSTRATIVE NUMBERS · NOT CUSTOMER RESULTS<br>The appointment pays $300. It takes more than the time on the booking screen.<br>$40 color and supplies + $15 allocated work costs. 3.5 hours with the client + 0.5 hour setup and cleanup.<br>$300 − $55 = $245 left. Across 4 hours: $61.25/hour.<br>Record the consultation, color used, finish, and cleanup for one appointment before changing the price.<br>Before personal taxes and any costs not listed. This is a starting comparison, not a recommended rate or a promise of profit.<br>COLORIST<br>DO THIS FIRST<br>Record consultation, application, processing, finish, and cleanup separately for one real appointment. | Let all 10 careers see a relevant example from the new paid draft. |
| STOP CHASING NEW CLIENTS WHILE GOOD ONES DISAPPEAR.<br>More first appointments will not fix a return problem. Protect the people who already trusted you. | STOP LETTING THE PRICE DO ALL THE TALKING.<br>Check time, color used, your pay setup, and the agreed result together. | Let all 10 careers see a relevant example from the new paid draft. |
| APPOINTMENT #2 COMPLETED<br>Do not only count who reserved. Count how many new clients actually came back for their second appointment.<br>YOUR NEXT 30<br>WEEK 1<br>Prescribe the next visit.<br>Give every client a specific next-service recommendation before checkout.<br>WEEK 2<br>Fix the leak.<br>Follow up with clients who should be due but left without another appointment.<br>WEEK 3<br>Make maintenance obvious.<br>Set simple return timelines for your core services and use them consistently.<br>WEEK 4<br>Count what came back.<br>Compare reserved next visits with completed second appointments. Keep what worked.<br>Build my Next 30 — $49 → | Earned pay left after entered work costs<br>WEEK 1: GET ONE HONEST BASELINE.<br>Use one normal color appointment. Record earned pay, the costs you paid, and all the time the work took.<br>Write down the starting value for “Earned pay left after entered work costs” in the scorecard. If you do not know it yet, leave it blank and collect it before comparing.<br>ONE SCRIPT TO STEAL<br>CONSULTATION<br>For today, we’re aiming for [result]. Based on your starting hair, I recommend [plan]. Today is [price] and about [time]. Keeping it looking like this means [upkeep]. Does that work for you?<br>THE EXAMPLE ANSWERS BEHIND THIS<br>Your full plan includes four weeks, three scripts, a work checklist, color appointment math, a before-and-after scorecard, and a purchase-value check. Save it and come back as the work changes.<br>See Your Next 30 · $49 → | Let all 10 careers see a relevant example from the new paid draft. |
| Example only. Your plan changes with your book, money, schedule, clients, and goals. | (Removed) | Let all 10 careers see a relevant example from the new paid draft. |

### Privacy

Improve scanability while preserving the existing data-use and retention meaning.

| Old | New | Reason |
|---|---|---|
| Your information.<br>Clearly explained. | YOUR INFORMATION.<br>HERE’S THE DEAL. | Improve scanability while preserving the existing data-use and retention meaning. |

### Survey entry

Use a shorter invitation and preserve purchase-linked survey access.

| Old | New | Reason |
|---|---|---|
| TELL US WHAT<br>YOU THINK. | DID WE<br>EARN OUR KEEP? | Use a shorter invitation and preserve purchase-linked survey access. |
| Six quick questions. No homework. No corporate nonsense. | 6 quick questions. Tell us what helped and what needs work. | Use a shorter invitation and preserve purchase-linked survey access. |

### My plans

Separate free-plan recovery from paid purchase-link access.

| Old | New | Reason |
|---|---|---|
| (Not present) | PICK UP WHERE YOU LEFT OFF<br>YOUR PLANS.<br>RIGHT THIS WAY.<br>My free Breakdown<br>No free plan saved in this browser yet. Start here, or use the link in your Breakdown email.<br>Start my free Breakdown →<br>My Next 30<br>Open the access link in your purchase email. Then import your saved plan file to bring back your answers and scorecard.<br>Can’t find the purchase email? Email us. | Separate free-plan recovery from paid purchase-link access. |

### Free questions

Preserve the completed question audit; improve readable type, focus and tap targets.

| Old | New | Reason |
|---|---|---|
| Pick everything that sounds like your actual career. One lane, five lanes, no judgment. | Pick all the work you do. More than one? That counts. | Preserve the completed question audit; improve readable type, focus and tap targets. |

### Chair Math

Preserve calculations; improve field labels, spacing, touch targets and screen heading structure.

Visible wording retained. Layout, contrast, spacing and keyboard behavior were reviewed.

## Personalized and conditional screens

| Screen | Old | New / decision | Reason |
|---|---|---|---|
| Free questions | Original question set and small controls. | Prior audited choices retained; unused/duplicate questions already removed; consistent large buttons and heading outline. | Preserve career relevance and reduce friction. |
| Email form | Unmarked optional name; “Three moves. Seven days.” | Optional name marked; “3 moves. 7 days.”; email-use disclosure retained. | Clear effort and consent. |
| Free Breakdown result | Several visually competing actions. | First 7-day-plan action remains primary; math and paid depth stay secondary. | Put useful work first. |
| 7-day plan | Checkboxes and save controls used the older visual system. | Consistent 44px+ checked controls, readable text, spacing and focus. | Make daily use easier without changing diagnosis logic. |
| Paid verification | Requires a valid purchase response. | Preserved; no access granted by a page hash or saved file. | Do not let a visual refresh weaken purchase verification. |
| Paid questions | Completed career-specific draft. | Preserved with consistent type, focus and spacing. | Maintain all 10 paths and 70 career questions. |
| Paid plan | Completed draft with scripts, tools, progress and imports. | Preserved; paid session can resume from My plans after verification. | Make returning useful and predictable. |
| Survey form | Five choices plus optional text, linked to purchase. | Same response model; shorter invitation and consistent field styles. | Keep useful feedback without adding homework. |
| Payment/service error states | Retry or purchase-email instructions. | Preserved and documented as genuinely failing live while service configuration is missing. | Accurate feedback is more useful than cosmetic success. |
| Existing emailed return links | Older route/schema compatibility. | Preserved. | Existing customers must still be able to open their saved flows. |

## Link and scope checks

The website destinations, Stripe checkout page, Instagram and TikTok returned HTTP 200 during read-only checks. Hash routes were exercised in a real browser. Mail links contain the existing support address; inbox delivery was not tested. HTTP 200 does not prove a completed payment or an authenticated social-account experience. No customer form was submitted live.

## Uncertainties and required proof

- Keep “nearly 30 years” from the approved bio until an exact anniversary is confirmed.
- The three requested “handle” options were treated as headline options; the original is selected.
- Customer testimonials and matched before/after assets need real source material and permission.
- Do not launch paid/email flows until runtime service setup and live verification are repaired.
- Actual speed and 3-second comprehension vary by device, connection and visitor. Asset savings and tested layouts are measured; conversion or revenue improvements are not.
