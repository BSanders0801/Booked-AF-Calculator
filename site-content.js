const careerSampleData = {
  chair: {
    tab:'BEHIND THE CHAIR',
    label:'BEHIND THE CHAIR',
    stage:'BUILDING',
    snapshot:'Four client days. Plenty of open space. The problem is not your talent. The right people need a clearer way to find you and book.',
    fix:'MAKE ONE SERVICE IMPOSSIBLE TO MISS.',
    fixBody:'Choose the work you want more of and make the path from seeing it to booking it painfully obvious.',
    steps:[
      ['MAKE THE OFFER OBVIOUS.','Show one result, who it is for, where you work, and exactly how to book it.'],
      ['FOLLOW WHAT ACTUALLY BOOKS.','Track where each inquiry came from and whether it became an appointment. Attention is not the same as a booking.'],
      ['GIVE THE FIRST VISIT A NEXT STEP.','Before they leave, tell them what you recommend next and when.']
    ],
    watch:'Booked appointments from each source. Not likes. Not views. Actual appointments.'
  },
  session: {
    tab:'SESSION / EDITORIAL',
    label:'SESSION / EDITORIAL',
    stage:'IN DEMAND',
    snapshot:'The day rate looks good. Prep, travel, agency cuts, and money you front can tell a very different story.',
    fix:'FIND OUT WHAT THE JOB ACTUALLY PAID.',
    fixBody:'Count the whole job — not just the number on the invoice.',
    steps:[
      ['COUNT THE WHOLE JOB.','Track prep, fittings, shopping, travel, on-set time, wrap, and the admin after. Paid and unpaid time both count.'],
      ['SEPARATE THE MONEY.','Keep earnings, pass-through money, reimbursables, and real expenses in different buckets so the job does not look richer than it was.'],
      ['WATCH THE WAIT.','Track the invoice date, what you fronted, what is still owed, and when the money actually lands.']
    ],
    watch:'What actually stayed yours — and how long your cash was tied up.'
  },
  events: {
    tab:'BRIDAL + EVENTS',
    label:'BRIDAL + EVENTS',
    stage:'GETTING BUSY',
    snapshot:'The booking fee is only part of the job. Travel, early call times, assistants, and weekends count too.',
    fix:'PRICE THE WHOLE DAY. NOT JUST THE HAIR.',
    fixBody:'A three-hour service can still own six hours of your day. Price the job you actually have to do.',
    steps:[
      ['COUNT DOOR-TO-DOOR TIME.','Include prep, packing, travel, setup, the service, cleanup, and the trip home.'],
      ['SEPARATE WHAT THE CLIENT PAYS BACK.','Parking, mileage, hotel, assistants, and other reimbursed costs should not masquerade as your earnings.'],
      ['CHECK THE TERMS BEFORE THE DATE.','Make travel, deposits, cancellations, assistants, and extra time clear before the event arrives.']
    ],
    watch:'What one event actually pays for the total time it takes from you.'
  },
  education: {
    tab:'EDUCATION + BRAND',
    label:'EDUCATION + BRAND',
    stage:'IN DEMAND',
    snapshot:'The teaching day is paid. Prep, travel, kit work, and follow-up may not be.',
    fix:'COUNT THE WHOLE GIG.',
    fixBody:'The value of an education day changes when it takes two days of your life to deliver it.',
    steps:[
      ['TRACK THE TIME NOBODY SEES.','Count deck prep, model prep, kit packing, travel, setup, teaching, breakdown, and follow-up.'],
      ['SEPARATE TRAVEL FROM PAY.','Keep reimbursed travel and expenses separate from the money you are actually earning for the work.'],
      ['COMPARE GIGS THE SAME WAY.','Use total time and what stayed yours so a flashy job does not automatically look like the best job.']
    ],
    watch:'What the gig pays for the total time away — not just the hours you are teaching.'
  },
  owner: {
    tab:'SALON OWNER / MANAGER',
    label:'SALON OWNER / MANAGER',
    stage:'IN DEMAND',
    snapshot:'Revenue is moving. So are payroll, rent, product, software, and the bills nobody sees.',
    fix:'STOP CONFUSING SALES WITH YOUR PAY.',
    fixBody:'A busy salon can still leave the owner wondering where the money went.',
    steps:[
      ['FOLLOW ONE NORMAL MONTH.','Start with what actually came in and the real bills that had to be paid to keep the salon running.'],
      ['SEPARATE BUSINESS MONEY FROM YOUR MONEY.','Owner pay, payroll, taxes, product, rent, and operating costs are not one giant pile.'],
      ['FIND ONE LEAK YOU CAN CONTROL.','Pick one recurring cost, waste problem, or pricing gap and verify it before changing ten things at once.']
    ],
    watch:'What the business actually leaves after the real costs — not the sales total.'
  }
};
function careerSampleTabs() {
  return '<div class="baf-sample-tabs" role="group" aria-label="Choose a hair career sample">'+Object.entries(careerSampleData).map(([key,item])=>'<button type="button" class="baf-sample-tab" data-career-sample="'+key+'" aria-pressed="'+(key==='chair'?'true':'false')+'">'+item.tab+'</button>').join('')+'</div>';
}
function careerSamplePanel(key='chair',mode='full') {
  const s=careerSampleData[key]||careerSampleData.chair;
  if(mode==='compact') return '<div class="baf-sample-panel" data-sample-key="'+key+'"><p class="baf-kicker">'+s.label+' · '+s.stage+'</p><p><strong>YOUR WORK RIGHT NOW</strong></p><p>'+s.snapshot+'</p><h3>'+s.fix+'</h3><p>'+s.fixBody+'</p><p class="baf-kicker" style="margin-top:20px">WATCH THIS</p><p>'+s.watch+'</p><button class="baf-outline cursor-interaction" data-nav="sample" style="color:#20151d;border-color:#705363;margin-top:12px">See the full sample →</button></div>';
  return '<div class="baf-sheet baf-sample-panel" data-sample-key="'+key+'"><p class="baf-kicker">EXAMPLE ONLY · '+s.label+'</p><p><strong>YOUR WORK RIGHT NOW / '+s.stage+'</strong></p><p>'+s.snapshot+'</p><h3>FIX THIS FIRST</h3><p><strong>'+s.fix+'</strong></p><p>'+s.fixBody+'</p><p class="baf-kicker" style="margin-top:24px">DO THESE 3 THINGS</p><ol>'+s.steps.map(step=>'<li><strong>'+step[0]+'</strong><br>'+step[1]+'</li>').join('')+'</ol><p class="baf-kicker" style="margin-top:24px">WATCH THIS</p><p>'+s.watch+'</p><button class="baf-outline cursor-interaction" data-nav="question" style="color:#20151d;border-color:#705363;margin-top:20px">Get my own free Breakdown →</button></div>';
}
const sitePages = {
  "intro": `
<section class="baf-hero baf-hero-clean">
  <div class="baf-hero-copy">
    <p class="baf-kicker">Booked &amp; Fabulous · For hairdressers</p>
    <h1>YOUR TALENT SHOULD<br/><span>BUY YOU FREEDOM.</span></h1>
    <p class="baf-subhead">You can love doing hair.<br/>And still want a life.</p>
    <p>Practical education and tools to get more of the right work, keep more of your money, and build a career that leaves something for you.</p>
    <div class="baf-actions">
      <button class="cursor-interaction" data-nav="question">Get my free Breakdown →</button>
      <button class="baf-link cursor-interaction" data-nav="paid">See Your Next 30 · $49 ↗</button>
    </div>
    <p class="baf-small">About 3 minutes. 3 next moves. Email required to get your free Breakdown.</p>
  </div>
</section>

<section class="baf-section baf-career-section">
  <p class="baf-kicker">YOUR CAREER. YOUR RULES.</p>
  <h2>Same industry.<br/>Very different careers.</h2>
  <p class="baf-subhead">See how BOOKED AF changes the advice depending on how you actually make your living.</p>
  ${careerSampleTabs()}
  <div class="baf-career-stage" data-career-sample-panel="compact">${careerSamplePanel('chair','compact')}</div>
</section>

<section class="baf-section">
  <p class="baf-kicker">Your work. Your pace.</p>
  <h2>YOUR WORK RIGHT NOW.</h2>
  <p>Starting over? Building momentum? In demand and exhausted? BOOKED AF starts with the work you actually have — chair, set, event, classroom, or salon — and builds from there.</p>
  <div class="baf-stages"><span>BUILDING</span><span>GETTING BUSY</span><span>IN DEMAND</span><span>BOOKED AF</span></div>
  <p class="baf-small">These stages describe your current work and demand. They have nothing to do with your age, talent, or years in the industry.</p>
</section>

<section class="baf-section">
  <p class="baf-kicker">Start here</p>
  <h2>Find your next move. Choose your plan.</h2>
  <div class="baf-two">
    <article class="baf-card">
      <h3>The free Breakdown</h3>
      <p>Figure out what needs your attention first.</p>
      <div class="baf-price">Free</div>
      <ul>
        <li>A short set of normal questions</li>
        <li>What to fix first</li>
        <li>3 moves for the next seven days</li>
        <li>Money tools to check what the work actually pays</li>
      </ul>
      <button class="baf-outline cursor-interaction" data-nav="question">Get my free Breakdown →</button>
    </article>
    <article class="baf-card baf-featured">
      <p class="baf-kicker">Your next 30</p>
      <h3>BOOKED AF: YOUR NEXT 30</h3>
      <p>Your numbers. Your work. Your next 30 days.</p>
      <div class="baf-price">$49 <small>one payment</small></div>
      <ul>
        <li><strong>DO THIS:</strong> your first move</li>
        <li><strong>STOP THIS:</strong> what is wasting time, money, or energy</li>
        <li><strong>WATCH THIS:</strong> the number that tells us if it worked</li>
        <li>A four-week plan built around your answers</li>
      </ul>
      <button class="cursor-interaction" data-nav="paid">See what’s inside →</button>
      <p class="baf-small">No subscription.</p>
    </article>
  </div>
</section>

<section class="baf-section baf-manifesto">
  <p class="baf-kicker">The point</p>
  <h2>STOP TRADING YOUR WHOLE LIFE<br/>FOR A PAYCHECK.</h2>
  <p class="baf-subhead">Make the work pay. Protect your time. Build something that leaves room for you.</p>
</section>

<section class="baf-section baf-two baf-founder">
  <figure class="baf-founder-photo">
    <img src="assets/bradley-founder.svg" alt="Bradley Sanders in a striped shirt seated on dark stairs" width="1122" height="1402" loading="lazy" decoding="async"/>
    <figcaption>BRADLEY SANDERS <span>FOUNDER / BOOKED AF</span></figcaption>
  </figure>
  <div>
    <p class="baf-kicker">Meet Bradley Sanders</p>
    <h2>Great hair.<br/>Expensive lessons.</h2>
    <p>I’m Bradley. I’ve spent nearly 30 years behind the chair as a colorist, salon owner, and educator. I’ve owned salons, worked in some of New York City’s top Fifth Avenue and SoHo salons, and now color hair in West Hollywood.</p>
    <p>Along the way, I taught nationally for L’Oréal Professionnel and John Paul Mitchell Systems. I also stepped away from hair for a while — and eventually found my way back to the chair with a very different idea of what a successful career should look like.</p>
    <p>I’ve made good money in this industry. I’ve also worked too much, saved too little, and learned more than a few business lessons the expensive way.</p>
    <p>BOOKED AF is what I wish I’d had earlier: simple, useful help for hairdressers who want better work, better money, and an actual life outside the salon. No business-school language. No pretending everybody’s career should look the same. Just what works, what doesn’t, and what to do next.</p>
    <button class="baf-outline cursor-interaction" data-nav="about">Meet Bradley →</button>
  </div>
</section>

<section class="baf-section">
  <p class="baf-kicker">The bigger picture · Coming next</p>
  <h2>A better career should come<br/>with a better life.</h2>
  <div class="baf-grid">
    <div><span class="baf-number">01 / YOUR BUSINESS</span><h3>More than a full book.</h3><p>Short lessons, practical scripts, and tools that make the business side easier.</p></div>
    <div><span class="baf-number">02 / YOUR LIFE</span><h3>You’re part of the plan.</h3><p>Education around sustainable schedules and looking after the person doing the work.</p></div>
    <div><span class="baf-number">03 / YOUR FUTURE</span><h3>Something set aside.</h3><p>Simple ways to build better money habits and prepare for the unexpected.</p></div>
  </div>
  <p class="baf-small">In development. These future resources are not included in today’s $49 offer.</p>
</section>
`,
  "paid": "<div class=\"baf-page-head\"><p class=\"baf-kicker\">BOOKED AF: YOUR NEXT 30</p><h1>You know what needs work.<br/><span>Let’s build your next 30 days.</span></h1><p class=\"baf-subhead\">No giant business plan. Just what to do, what to stop, and what to watch for the next 30 days.</p></div><section class=\"baf-section baf-two\"><div><h2>A plan built around<br/>your actual business.</h2><p>Look at what you earn, how paid work finds you, what comes back, and where your time goes. Turn your answers into a clearer next step.</p><div class=\"baf-card\"><p class=\"baf-kicker\">What’s inside</p><h3>DO THIS.</h3><p>The move that deserves your attention first.</p><h3>STOP THIS.</h3><p>The habit, leak, or busywork that is not earning its place.</p><h3>WATCH THIS.</h3><p>One number that tells you whether the move is working.</p><h3>YOUR NEXT 30.</h3><p>Four weeks of simple actions built around your answers.</p></div></div><aside class=\"baf-card baf-featured\"><p class=\"baf-kicker\">One plan. One payment.</p><div class=\"baf-price\">$49</div><p>No subscription.</p><a class=\"primary checkout-link\" href=\"https://buy.stripe.com/6oU9AU5F72l05pA4RTaAw01\">Build my Next 30 — $49 →</a><p class=\"baf-small\">Secure checkout with Stripe.</p><button class=\"baf-link cursor-interaction\" data-nav=\"next30sample\">See a sample Next 30 ↗</button></aside></section><section class=\"baf-section\"><p class=\"baf-kicker\">What happens next</p><div class=\"baf-grid\"><div><span class=\"baf-number\">01</span><h3>Start Your Next 30.</h3><p>One payment through secure checkout.</p></div><div><span class=\"baf-number\">02</span><h3>Tell us about your work.</h3><p>Normal questions. BOOKED AF handles the math.</p></div><div><span class=\"baf-number\">03</span><h3>Work your plan.</h3><p>Start with your priorities and follow your next steps.</p></div></div><details><summary>Is this a membership?</summary><p>No. Your Next 30 is a one-time $49 purchase.</p></details><details><summary>Do I have to take the free Breakdown first?</summary><p>No. You can start with Your Next 30, or try the free Breakdown first.</p></details><details><summary>Is this personal coaching?</summary><p>This offer is a personalized plan based on your answers. Private coaching is not advertised as part of this offer.</p></details></section>",
  "about": "<section class=\"baf-section baf-two baf-founder\"><figure class=\"baf-founder-photo\"><img src=\"assets/bradley-founder.svg\" alt=\"Bradley Sanders in a striped shirt seated on dark stairs\" width=\"1122\" height=\"1402\" loading=\"lazy\" decoding=\"async\"/><figcaption>BRADLEY SANDERS <span>FOUNDER / BOOKED AF</span></figcaption></figure><div><p class=\"baf-kicker\">Meet Bradley Sanders · Founder</p><h1>YOUR CAREER OWES YOU<br/><span>A LIFE.</span></h1><p class=\"baf-subhead\">Great hair. Expensive lessons. I’m Bradley. I’ve spent nearly 30 years behind the chair as a colorist, salon owner, and educator. I’ve owned salons, worked in some of New York City’s top Fifth Avenue and SoHo salons, and now color hair in West Hollywood.</p><p>Along the way, I taught nationally for L’Oréal Professionnel and John Paul Mitchell Systems. I also stepped away from hair for a while — and eventually found my way back to the chair with a very different idea of what a successful career should look like.</p><p>I’ve made good money in this industry. I’ve also worked too much, saved too little, and learned more than a few business lessons the expensive way.</p><p>BOOKED AF is what I wish I’d had earlier: simple, useful help for hairdressers who want a fuller book, better money, and an actual life outside the salon. No business-school language. No pretending everybody’s career should look the same. Just what works, what doesn’t, and what to do next.</p><button class=\"cursor-interaction\" data-nav=\"question\">Find my first move →</button></div></section>",
  "contact": "<section class=\"baf-section\"><p class=\"baf-kicker\">Stay in the conversation</p><h1>Good questions.<br/><span>Always welcome.</span></h1><p>Questions about the Breakdown or Your Next 30? Get in touch.</p><p><a class=\"baf-social\" href=\"mailto:hello@bookedandfabulous.com\">hello@bookedandfabulous.com</a></p><div class=\"baf-actions\"><a class=\"baf-social\" href=\"https://www.instagram.com/bookedandfabulous/\" rel=\"noopener noreferrer\" target=\"_blank\">Follow on Instagram ↗</a><a class=\"baf-social\" href=\"https://www.tiktok.com/@bookedandfabulous\" rel=\"noopener noreferrer\" target=\"_blank\">Follow on TikTok ↗</a></div><div class=\"baf-card\" style=\"margin-top:32px\"><h3>Start with something useful.</h3><p>Get your free Breakdown. Enter your email at the end to open your plan here and receive a copy.</p><button data-nav=\"question\">Get my free Breakdown →</button><p class=\"baf-small\">Your email is required to send and open your full result.</p></div></section>",
  "sample": `
<section class="baf-section baf-sample-page">
  <p class="baf-kicker">Example only · Not your personal result</p>
  <h1>YOUR CAREER.<br/><span>YOUR RULES.</span></h1>
  <p class="baf-subhead">See how BOOKED AF thinks differently depending on how you actually work.</p>
  ${careerSampleTabs()}
  <div data-career-sample-panel="full">${careerSamplePanel('chair','full')}</div>
  <div class="baf-actions">
    <button data-nav="question">Start my Breakdown →</button>
    <button class="baf-outline" data-nav="intro">Back home</button>
  </div>
</section>
`,
  "next30sample": "<section class=\"baf-section\"><p class=\"baf-kicker\">Example only · Not your personal plan</p><h1>THIS IS WHAT<br/><span>$49 GETS YOU.</span></h1><p class=\"baf-subhead\">A real Your Next 30 is built from your answers. This sample shows the format without pretending every hairdresser needs the same advice.</p><div class=\"baf-card\"><div class=\"baf-number\">SAMPLE / GETTING BUSY</div><h3>DO THIS</h3><p><strong>Fix Appointment #2.</strong></p><p>New clients are finding you. Before you chase even more people, make the next visit clear and easy to reserve.</p><p><strong>START HERE:</strong> Before checkout, tell every client what you recommend next, when you recommend it, and why.</p></div><div class=\"baf-card\"><div class=\"baf-number\">STOP THIS</div><h3>STOP CHASING NEW CLIENTS WHILE GOOD ONES DISAPPEAR.</h3><p>More first appointments will not fix a return problem. Protect the people who already trusted you.</p></div><div class=\"baf-card\"><div class=\"baf-number\">WATCH THIS</div><h3>APPOINTMENT #2 COMPLETED</h3><p>Do not only count who reserved. Count how many new clients actually came back for their second appointment.</p></div><p class=\"baf-kicker\" style=\"margin-top:38px\">YOUR NEXT 30</p><div class=\"baf-grid\"><div><span class=\"baf-number\">WEEK 1</span><h3>Prescribe the next visit.</h3><p>Give every client a specific next-service recommendation before checkout.</p></div><div><span class=\"baf-number\">WEEK 2</span><h3>Fix the leak.</h3><p>Follow up with clients who should be due but left without another appointment.</p></div><div><span class=\"baf-number\">WEEK 3</span><h3>Make maintenance obvious.</h3><p>Set simple return timelines for your core services and use them consistently.</p></div><div><span class=\"baf-number\">WEEK 4</span><h3>Count what came back.</h3><p>Compare reserved next visits with completed second appointments. Keep what worked.</p></div></div><div class=\"baf-actions\"><button data-nav=\"paid\">Build my Next 30 — $49 →</button><button class=\"baf-outline\" data-nav=\"intro\">Back home</button></div><p class=\"baf-small\">Example only. Your plan changes with your book, money, schedule, clients, and goals.</p></section>",
  "survey": "<section class=\"baf-section survey-page\"><p class=\"baf-kicker\">BOOKED AF client survey</p><h1>TELL US WHAT<br><span>YOU THINK.</span></h1><p class=\"baf-subhead\">You spent money with us. We’d like to know if we earned it.</p><p>Six quick questions. No homework. No corporate nonsense.</p><form id=\"booked-survey\" class=\"survey-form\"><fieldset class=\"baf-card survey-question\"><legend>1. HOW DID WE DO?</legend><p class=\"baf-small\">1 = We have work to do. 5 = Okay, you understood the assignment.</p><div class=\"survey-inline\"><label><input type=\"radio\" name=\"rating\" value=\"1\" required><span>1</span></label><label><input type=\"radio\" name=\"rating\" value=\"2\" required><span>2</span></label><label><input type=\"radio\" name=\"rating\" value=\"3\" required><span>3</span></label><label><input type=\"radio\" name=\"rating\" value=\"4\" required><span>4</span></label><label><input type=\"radio\" name=\"rating\" value=\"5\" required><span>5</span></label></div></fieldset><fieldset class=\"baf-card survey-question\"><legend>2. WAS BOOKED AF EASY TO USE?</legend><label class=\"survey-option\"><input type=\"radio\" name=\"ease\" value=\"ridiculously easy\" required>Ridiculously easy</label><label class=\"survey-option\"><input type=\"radio\" name=\"ease\" value=\"pretty easy\">Pretty easy</label><label class=\"survey-option\"><input type=\"radio\" name=\"ease\" value=\"questions\">I got there, but I had questions</label><label class=\"survey-option\"><input type=\"radio\" name=\"ease\" value=\"throw my phone\">Something made me want to throw my phone</label></fieldset><fieldset class=\"baf-card survey-question\"><legend>3. DID YOU ACTUALLY GET SOMETHING USEFUL?</legend><label class=\"survey-option\"><input type=\"radio\" name=\"useful\" value=\"using it\" required>Yes. I’m using it.</label><label class=\"survey-option\"><input type=\"radio\" name=\"useful\" value=\"not yet\">Yes, but I haven’t put it into action yet</label><label class=\"survey-option\"><input type=\"radio\" name=\"useful\" value=\"a little\">A little</label><label class=\"survey-option\"><input type=\"radio\" name=\"useful\" value=\"not really\">Not really</label></fieldset><fieldset class=\"baf-card survey-question\"><legend>4. WHAT DO YOU WANT MORE HELP WITH?</legend><p class=\"baf-small\">Pick whatever sounds like your life right now.</p><label class=\"survey-option\"><input type=\"checkbox\" name=\"more\" value=\"getting more clients\">Getting more clients</label><label class=\"survey-option\"><input type=\"checkbox\" name=\"more\" value=\"keeping clients\">Keeping clients</label><label class=\"survey-option\"><input type=\"checkbox\" name=\"more\" value=\"charging and pricing\">Charging and pricing</label><label class=\"survey-option\"><input type=\"checkbox\" name=\"more\" value=\"making more money\">Making more money</label><label class=\"survey-option\"><input type=\"checkbox\" name=\"more\" value=\"where my money goes\">Where my money goes</label><label class=\"survey-option\"><input type=\"checkbox\" name=\"more\" value=\"working fewer days\">Working fewer days</label><label class=\"survey-option\"><input type=\"checkbox\" name=\"more\" value=\"marketing without living on Instagram\">Marketing without living on Instagram</label><label class=\"survey-option\"><input type=\"checkbox\" name=\"more\" value=\"scripts and templates\">Scripts and templates</label><label class=\"survey-option\"><input type=\"checkbox\" name=\"more\" value=\"classes and education\">Classes and education</label><label class=\"survey-option\"><input type=\"checkbox\" name=\"more\" value=\"something else\">Something else</label></fieldset><fieldset class=\"baf-card survey-question\"><legend>5. WOULD YOU TELL ANOTHER HAIRDRESSER ABOUT BOOKED AF?</legend><label class=\"survey-option\"><input type=\"radio\" name=\"recommend\" value=\"absolutely\" required>Absolutely</label><label class=\"survey-option\"><input type=\"radio\" name=\"recommend\" value=\"probably\">Probably</label><label class=\"survey-option\"><input type=\"radio\" name=\"recommend\" value=\"maybe\">Maybe</label><label class=\"survey-option\"><input type=\"radio\" name=\"recommend\" value=\"not yet\">Not yet</label><label class=\"survey-option\"><input type=\"radio\" name=\"recommend\" value=\"no\">No</label></fieldset><fieldset class=\"baf-card survey-question\"><legend>6. YOUR TURN.</legend><p>What did you love? What annoyed you? What confused you? What should we add? What should we change?</p><p class=\"baf-small\">Tell Bradley whatever you want.</p><label><span class=\"sr-only\">Your comments</span><textarea name=\"comments\" maxlength=\"2000\" rows=\"7\" placeholder=\"Say it. We can take it.\"></textarea></label></fieldset><div id=\"survey-status\" class=\"baf-note\" role=\"status\" hidden></div><button class=\"primary\" type=\"submit\">SEND IT TO BRADLEY →</button></form></section>",

  "privacy": "<section class=\"baf-section\"><p class=\"baf-kicker\">Privacy Policy</p><h1>Your information.<br><span>Clearly explained.</span></h1><p class=\"baf-small\">Effective September 25, 2026</p><p>BOOKED &amp; FABULOUS operates BOOKED AF. Contact us at <a href=\"mailto:hello@bookedandfabulous.com\">hello@bookedandfabulous.com</a> with privacy questions.</p><h2>What you give us</h2><p>We ask for your email to unlock and send your free Breakdown. Your first name is optional. Your answers about your work, money, goals, and schedule help us prepare your plan. Please do not enter details about your clients.</p><h2>How your details are used</h2><p>When you submit the form, your email, optional name, and answers go to our email service to prepare and deliver your Breakdown. BOOKED AF receives a copy, including your email and answers, to keep a record of your request and help with support. Requesting a Breakdown does not subscribe you to a promotional mailing list. We may send a small number of follow-up check-ins during the first 90 days so you can revisit your plan and numbers.</p><h2>Services that help the site work</h2><p>GitHub Pages hosts the website. Cloudflare runs the email service and checks forms for spam through Turnstile. Resend delivers the emails. These providers process information needed to perform those services. Hosting and security providers may process technical information such as your IP address, browser details, and request logs.</p><h2>When you buy</h2><p>Stripe handles checkout, payment details, and payment security. Your checkout email receives your Next 30 access link. BOOKED AF uses your payment confirmation to check access. Purchasers may also receive a short follow-up survey so we can improve the product and website. Full card details are handled by Stripe rather than entered into this website.</p><h2>Cookies and browser storage</h2><p>The website does not install advertising pixels, analytics trackers, or session-recording tools. It does not use the information from your Breakdown for cross-site advertising. Security and payment services may use cookies or similar technology to provide those services.</p><p>Your free answers and checklist progress are saved in this browser. The site restores them for up to 30 days after your last use. Temporary form details and Your Next 30 answers are kept in this browser session. Some tool history can remain until you clear browser storage. These saved details are not an account and do not automatically appear on another device.</p><p>The site does not change its behavior in response to Do Not Track or Global Privacy Control signals because it does not run cross-site advertising or sell the information entered into your Breakdown. Links to Instagram, TikTok, and Stripe take you to services with their own privacy practices.</p><button class=\"baf-outline\" data-clear-progress>Clear my saved free plan</button><p class=\"baf-small\">This clears your free plan and temporary email form details from this browser. It does not delete emails already sent or payment records. To remove all local site data, use your browser’s site-data settings.</p><h2>Keeping and deleting information</h2><p>Saved email requests, purchase records, and survey feedback are kept as needed to deliver your service, improve BOOKED AF, provide support, keep business records, and meet legal obligations. To ask about, correct, or request deletion of information held by BOOKED AF, email <a href=\"mailto:hello@bookedandfabulous.com\">hello@bookedandfabulous.com</a>. Some purchase records may need to be retained for legal reasons.</p><h2>Changes to this policy</h2><p>We will post changes here and update the effective date. If the way we use your details changes materially, we will provide a notice on the website or contact you where required.</p></section>"
};
