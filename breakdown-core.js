// Shared by the website and the self-contained email Worker.
const SHORT_SCHEMA = 'short-v3';
const shortQuestions = [
 {id:'worktype',multi:true,note:'Pick everything that sounds like your actual career. One lane, five lanes, no judgment.',title:'WHAT’S YOUR HAIR GAME?',choices:[['fullservice','I work behind the chair and do a little bit of everything.'],['color','I mainly do color.'],['cut','I mainly cut and style.'],['extensions','I specialize in extensions.'],['session','I do session, editorial, or commercial work.'],['events','I do bridal, events, or other on-location work.'],['education','I teach or work for a beauty brand.'],['owner','I own or manage a salon.'],['other','Something else.']]},
 {id:'primarywork',title:'WHERE DOES MOST OF YOUR HAIR INCOME COME FROM RIGHT NOW?',note:'Pick the closest answer. This tells BOOKED AF which questions to ask next.',choices:[['chair','Clients behind the chair.'],['session','Session, editorial, or commercial jobs.'],['events','Bridal, events, or other on-location work.'],['education','Education or brand work.'],['management','Owning or managing a salon.'],['mix','It’s a mix. No single lane pays most.'],['notearning','I’m not earning from hair right now.']]},
 {id:'goal',title:'WHAT ARE WE FIXING FIRST?',choices:[['clients','I need more work coming in.'],['money','I want to earn more without adding more hours.'],['return','I want more of the right people to hire or book me again.'],['keep','I make money. Where does it all go?'],['time','I love what I do. I’d also like a life.'],['stable','I need money saved for when life happens.']]},
 {id:'full',when:a=>a.primarywork==='chair',title:'How busy are you most weeks?',choices:[['notyet','I’m not taking clients yet'],['under25','I have a few clients and lots of openings'],['half','I’m booked about half the time'],['threequarters','I’m busy, with a few openings'],['full','I’m fully booked or close to it']]},
 {id:'days',when:a=>a.primarywork==='chair',title:'HOW MANY DAYS A WEEK ARE YOU BEHIND THE CHAIR?',choices:[['0','I’m not taking appointments yet'],['1','1 day'],['2','2 days'],['3','3 days'],['4','4 days'],['5','5 days'],['6','6-7 days']]},
 {id:'workload',when:a=>a.primarywork!=='chair',title:'HOW FULL IS YOUR WORK CALENDAR MOST MONTHS?',choices:[['notyet','I’m not booking paid work right now.'],['light','I have a lot of open time.'],['half','I’m working about half the time I want to be.'],['busy','I’m busy, with some room.'],['full','I’m as busy as I want to be or close to it.']]},
 {id:'workdays',when:a=>a.primarywork!=='chair',title:'HOW MANY DAYS A WEEK DOES WORK REALLY TAKE?',note:'Include paid work, travel, prep, shopping, admin, and anything else the job requires.',choices:[['0','I’m not working right now'],['1','1 day'],['2','2 days'],['3','3 days'],['4','4 days'],['5','5 days'],['6','6-7 days'],['varies','It changes constantly.']]},
 {id:'paystyle',when:a=>a.primarywork!=='chair'&&(a.goal==='money'||a.goal==='keep'),title:'HOW DO YOU USUALLY GET PAID?',multi:true,note:'Choose everything that applies.',choices:[['day','Day rate'],['half','Half-day rate'],['project','Flat fee for a job or project'],['hourly','Hourly'],['salary','Salary'],['commission','Commission or percentage'],['other','It depends or something else']]},
 {id:'paywait',when:a=>a.primarywork!=='chair'&&(a.goal==='money'||a.goal==='keep'),title:'HOW LONG DOES IT USUALLY TAKE TO ACTUALLY GET PAID?',choices:[['fast','Usually within two weeks'],['month','About a month'],['60','About 1-2 months'],['90','About 2-3 months'],['long','More than 3 months'],['varies','It varies a lot']]},
 {id:'workexpenses',when:a=>a.primarywork!=='chair'&&(a.goal==='money'||a.goal==='keep'),multi:true,exclusive:['none','unknown'],note:'Choose everything that can come out of your pocket.',title:'WHAT DO YOU END UP PAYING FOR?',choices:[['products','Products and supplies'],['hair','Extension hair, wigs, or hairpieces'],['tools','Tools and kit replacement'],['travel','Travel, Uber, mileage, parking, or baggage'],['team','Assistants or other people on the job'],['fees','Agency, booking, or business fees'],['none','Clients or my employer cover basically everything'],['unknown','I need to look at the real numbers']]},
 {id:'jobsource',when:a=>a.primarywork!=='chair'&&a.goal==='clients',multi:true,exclusive:['none','unknown'],note:'Choose everything that actually brings paid work.',title:'HOW DOES PAID WORK FIND YOU?',choices:[['agency','An agency or representation'],['repeat','Repeat clients or brands'],['referrals','Referrals and word of mouth'],['social','Social media or my portfolio'],['direct','Brands, producers, planners, or clients contact me directly'],['none','Paid work is not coming in consistently yet'],['unknown','I need to start tracking this']]},
 {id:'outreach',when:a=>a.primarywork!=='chair'&&a.goal==='clients',multi:true,exclusive:['none'],note:'Choose everything you actually do.',title:'WHAT HAVE YOU TRIED TO GET MORE WORK?',choices:[['agency','Staying in touch with my agency or reps'],['past','Following up with past clients or brands'],['portfolio','Updating or sharing my portfolio'],['network','Networking with people who hire hair teams'],['pitch','Reaching out directly for work'],['none','I haven’t really started yet']]},
 {id:'repeatwork',when:a=>a.primarywork!=='chair'&&a.goal==='return',title:'ARE THE PEOPLE WHO HIRE YOU COMING BACK?',choices:[['new','I’m still getting started. Too soon to tell.'],['rare','Not often enough'],['some','Some do. Some disappear.'],['most','Most of the right clients hire me again'],['unknown','I haven’t tracked it']]},
 {id:'repeatfollow',when:a=>a.primarywork!=='chair'&&a.goal==='return',multi:true,exclusive:['none'],note:'Choose everything that usually happens after a job.',title:'AFTER THE JOB, WHAT HAPPENS?',choices:[['thanks','I send a thank-you or follow-up'],['portfolio','I share or update the work when I’m allowed to'],['touch','I stay in touch with the client, producer, planner, or brand'],['agency','My agency handles most of that'],['none','Usually nothing. I wait for the next call']]},
 {id:'sessionagency',when:a=>a.primarywork==='session'&&(a.goal==='money'||a.goal==='keep'),title:'DOES AN AGENCY TAKE A CUT FROM YOUR RATE?',choices:[['yes','Yes'],['sometimes','Sometimes, depending on the job'],['no','No']]},
 {id:'sessionfront',when:a=>a.primarywork==='session'&&(a.goal==='money'||a.goal==='keep'),title:'HOW OFTEN ARE YOU FRONTING MONEY FOR A JOB?',note:'Flights, Uber, meals, baggage, hair, products, assistants, or anything you expect to be reimbursed for.',choices:[['often','A lot'],['sometimes','Sometimes'],['rare','Rarely'],['never','Basically never']]},
 {id:'paymodel',when:a=>a.primarywork==='chair'&&(a.goal==='money'||a.goal==='keep'),title:"LET’S TALK PAY. HOW DOES YOURS WORK?",choices:[["commission", "I get a percentage of what my clients pay."], ["hourly", "I get paid by the hour."], ["self", "I work for myself. The salon expenses are mine, too."], ["owner", "I own the salon."], ["mixed", "It’s a mix, or I need help sorting it out."]]},
 {id:'hourlytime',when:a=>a.primarywork==='chair'&&a.goal==='money'&&a.paymodel==='hourly',title:"ARE YOU DOING WORK THAT DOESN’T SHOW UP AS PAID TIME?",choices:[["no", "No. My paid hours match the time I’m working."], ["sometimes", "Sometimes. Messages, setup, cleanup, or other work happens off the clock."], ["often", "Yes. More than I’d like."], ["unknown", "I need to compare my hours with my payslip."]]},
 {id:'spend',when:a=>a.primarywork==='chair'&&a.goal==='money'&&a.paymodel!=='hourly',title:"WHAT DOES A CLIENT USUALLY SPEND IN YOUR CHAIR?",note:"Just the hair services. Leave out tips and take-home products. Pick the closest amount.",choices:[["notyet", "I’m not taking clients yet."], ["unknown", "Honestly? I need to check."], ["75", "Under $100"], ["150", "$100-$199"], ["275", "$200-$349"], ["400", "$350 or more"]]},
 {id:'returning',when:a=>a.primarywork==='chair'&&(a.goal==='clients'||a.goal==='return'),title:"THEY CAME IN. ARE THEY COMING BACK?",choices:[["notyet", "I’m still getting started. Too soon to tell."], ["low", "Not many come back. I’d like to change that."], ["some", "Some come back. Some I never see again."], ["most", "Most come back for more."], ["almostall", "Almost everyone comes back."], ["unknown", "I haven’t kept track."]]},
 {id:'costs',when:a=>a.primarywork==='chair'&&(a.goal==='keep'||(a.goal==='money'&&a.paymodel!=='hourly')),note:'After the salon’s share and any rent or supplies you pay for. Before personal bills and taxes.',title:'YOU DID THE HAIR. HOW MUCH OF THE MONEY IS ACTUALLY YOURS?',choices:[['clear','I know what I keep, and it’s enough.'],['tight','I know what I keep. It needs to be more.'],['rough','I have a ballpark idea.'],['unknown','Honestly? I need help figuring that out.']]},
 {id:'visibility',when:a=>a.primarywork==='chair'&&a.goal==='clients',multi:true,exclusive:['none','unknown'],note:"Choose all that are actually bringing you new clients.",title:"HOW ARE NEW CLIENTS FINDING YOUR CHAIR?",choices:[["social", "Instagram or TikTok."], ["salon", "The salon sends them my way."], ["referrals", "Referrals or word of mouth."], ["search", "Google or my website."], ["none", "New clients aren’t finding me yet."], ["unknown", "Good question. I need to start asking."]]},
 {id:'marketing',when:a=>a.primarywork==='chair'&&a.goal==='clients',multi:true,exclusive:['none'],note:"Choose all that apply.",title:"WHAT HAVE YOU TRIED TO GET PEOPLE IN YOUR CHAIR?",choices:[["social", "Posting my work online."], ["people", "Asking people I know to send clients my way."], ["local", "Introducing myself to people and businesses nearby."], ["paid", "Paying for ads or promotions."], ["none", "I haven’t started yet. I need a first move."]]},
 {id:'network',when:a=>a.primarywork==='chair'&&a.goal==='clients',note:'Choose the one you would feel most comfortable trying.',title:'Which of these could you do first to help new clients find you?',choices:[['past','Contact current or past clients and ask them to recommend me'],['local','Ask people or businesses I know nearby to recommend me'],['portfolio','Share photos of hair I’ve done, with a link to book'],['models','Offer a free or discounted appointment so I can take photos of the results'],['none','I’m not sure where to start']]},
 {id:'urgency',when:a=>a.primarywork==='chair'&&a.goal==='clients',title:"HOW SOON DO WE NEED TO FILL THOSE OPENINGS?",choices:[["now", "As soon as possible. My bills aren’t waiting."], ["month", "Over the next month."], ["steady", "I have time to build. I want to do it well."]]},
 {id:'nextvisit',when:a=>a.primarywork==='chair'&&a.goal==='return',title:"GREAT HAIR. NOW, DO YOU TALK ABOUT THEIR NEXT VISIT?",choices:[["prescribe", "Yes. We talk about what’s next and when to come back."], ["ask", "I ask, “Want to book your next appointment?”"], ["desk", "I leave that conversation to the front desk."], ["rare", "Usually not. We say goodbye and hope for the best."]]},
 {id:'followup',when:a=>a.primarywork==='chair'&&a.goal==='return',multi:true,exclusive:['none','unknown'],note:"Choose all that usually happen.",title:"THEY LEFT WITHOUT REBOOKING. WHAT HAPPENS NEXT?",choices:[["personal", "I reach out when it’s time for their next visit."], ["automatic", "My booking system sends a reminder."], ["desk", "The front desk or salon follows up."], ["none", "Nothing. I wait for them to make the next move."], ["unknown", "Honestly? I’m not sure what happens."]]},
 {id:'servicehours',when:a=>a.primarywork==='chair'&&a.goal==='money'&&a.paymodel!=='hourly',note:"From the client walking in to the last towel in the hamper. Pick the closest answer.",title:"HOW LONG DOES ONE APPOINTMENT REALLY TAKE?",choices:[["short", "Less than an hour"], ["medium", "About 1-2 hours"], ["long", "About 3-4 hours"], ["verylong", "5 hours or more"], ["varies", "Depends on who’s in the chair and what we’re doing."], ["unknown", "I need to watch the clock next time."]]},
 {id:'workcosts',when:a=>a.primarywork==='chair'&&a.goal==='money'&&a.paymodel!=='hourly',multi:true,exclusive:['none','unknown'],note:"Choose all that come out of your pocket.",title:"WHICH WORK BILLS HAVE YOUR NAME ON THEM?",choices:[["product", "Color, extension hair, or other supplies."], ["space", "Chair or suite rent."], ["fees", "Card fees, booking apps, or work software."], ["team", "Assistant or team costs."], ["none", "The salon covers my work costs."], ["unknown", "I need to check what I’m actually paying for."]]},
 {id:'costleak',when:a=>a.primarywork==='chair'&&a.goal==='keep',title:"WHERE SHOULD WE START LOOKING AT WHAT YOU SPEND?",choices:[["space", "The salon’s share, rent, or salon fees."], ["product", "Color, extension hair, and supplies."], ["discount", "Discounts, free redos, and “I won’t charge you for that.”"], ["fees", "Apps, card fees, and subscriptions. They add up."], ["team", "Staff pay and the salon’s bills."], ["unknown", "Honestly? I need help knowing where to look."]]},
 {id:'weeklyhours',when:a=>a.goal==='time',title:'HOW MANY HOURS A WEEK ARE YOU ACTUALLY WORKING?',note:'Count paid work, prep, cleanup, travel, ordering, admin, and messages. Answering hair questions from your couch counts. The pajamas don’t make it time off.',choices:[['under20','Under 20 hours'],['20to30','20-30 hours'],['31to40','31-40 hours'],['over40','More than 40 hours'],['unknown','Honestly? I’ve lost track.']]},
 {id:'targetdays',when:a=>a.goal==='time',title:"YOUR WEEK, YOUR WAY. HOW MANY WORKDAYS?",choices:[["1", "1 day"], ["2", "2 days"], ["3", "3 days"], ["4", "4 days"], ["5", "5 days"], ["shorter", "Same number of days. I just want to get home earlier."], ["unknown", "Help me figure out what could work."]]},
 {id:'overrun',when:a=>a.primarywork==='chair'&&a.goal==='time',note:'Choose the biggest time thief.',title:'WHICH ONE STEALS THE MOST TIME FROM YOUR WORKDAY?',choices:[['gaps','Big gaps between clients. I’m still here, but not getting paid.'],['overrun','Appointments take longer than I planned.'],['squeeze','I keep saying, “Sure, I can squeeze you in.”'],['messages','Messages and paperwork keep piling up after my last appointment.'],['none','I usually finish when I planned.'],['unknown','I’m not sure where the time goes.']]},
 {id:'timeleak',when:a=>a.primarywork!=='chair'&&a.goal==='time',note:'Choose the biggest one.',title:'WHAT EATS THE MOST TIME AROUND THE PAID WORK?',choices:[['travel','Travel and getting to the job'],['prep','Prep, shopping, kit work, or fittings'],['waiting','Waiting around before or during the job'],['longday','The paid day regularly turns into a very long day'],['admin','Invoices, email, scheduling, and follow-up'],['none','The unpaid time is pretty manageable'],['unknown','I need to track it']]},
 {id:'savings',when:a=>a.goal==='stable',note:"Rent, food, utilities-the bills don’t take days off. Pick the closest answer. “I’m not sure” is okay.",title:"IF WORK STOPPED, HOW LONG COULD YOUR SAVINGS COVER THE BILLS?",choices:[["none", "I haven’t built up savings yet."], ["month", "About a month"], ["few", "A few months"], ["solid", "Six months or more"], ["unknown", "I’m not sure. I need a clearer picture."]]},
 {id:'futurehabit',when:a=>a.goal==='stable',title:"IS SAVING MONEY HAPPENING, OR STILL ON THE TO-DO LIST?",choices:[["catchup", "The bills get there first."], ["spend", "I mean to save. Then I spend what’s left."], ["random", "My income changes, and my saving does too."], ["save", "I’m already putting money away regularly."]]},
 {id:'futurefear',when:a=>a.goal==='stable',note:"Pick the first job you want that money to do.",title:"WHAT SHOULD THAT SAVED MONEY DO FIRST?",choices:[['emergency','Cover a slow month or an emergency'],['timeoff','Let me take real time off'],['retire','Build money for later in life'],['body','Help me move toward work that is easier on my body'],['unknown','I need help choosing where to start']]}
];
function shortVisibleQuestions(answers) {
 return shortQuestions.filter(q=>!q.when||q.when(answers));
}
function validateShortAnswers(input) {
 if(!input||typeof input!=='object'||Array.isArray(input)) throw new Error('answers');
 const clean={};
 for(const q of shortQuestions) {
  if(input[q.id]!==undefined) {
   if(q.multi) {
    const raw=Array.isArray(input[q.id])?input[q.id]:[input[q.id]];
    const values=[...new Set(raw.map(String))];
    if(!values.length||values.some(v=>!q.choices.some(c=>c[0]===v))) throw new Error('answers');
    if((q.exclusive||[]).some(v=>values.includes(v))&&values.length>1) throw new Error('answers');
    clean[q.id]=values;
   } else {
    if(!q.choices.some(c=>c[0]===input[q.id])) throw new Error('answers');
    clean[q.id]=input[q.id];
   }
  }
 }
 for(const q of shortVisibleQuestions(clean)) {
  const value=clean[q.id];
  if(value===undefined||(q.multi&&(!Array.isArray(value)||!value.length))) throw new Error('answers');
 }
 // Answers from an abandoned goal must not influence the new result.
 return Object.fromEntries(shortVisibleQuestions(clean).map(q=>[q.id,clean[q.id]]));
}
function shortStage(a) {
 const chair=a.primarywork==='chair';
 const stopped=chair?a.days==='0'||a.full==='notyet':a.workdays==='0'||a.workload==='notyet';
 const load=chair?a.full:a.workload;
 const key=stopped?'building':chair?({under25:'building',half:'busy',threequarters:'demand',full:'booked'})[load]||'building':({light:'building',half:'busy',busy:'demand',full:'booked'})[load]||'building';
 return {key,label:({building:'BUILDING',busy:'GETTING BUSY',demand:'IN DEMAND',booked:'BOOKED AF'})[key]};
}
function buildOutsideChairBreakdown(a) {
 const stage=shortStage(a).label;
 const starting=a.workdays==='0'||a.workload==='notyet';
 const room=['light','half'].includes(a.workload), packed=a.workload==='full';
 const steps=[], reasons=[];
 const step=(title,body)=>steps.push({id:'short-'+a.goal+'-'+steps.length,day:['1','2-3','4-6'][steps.length],title,body});
 const role=({session:'session, editorial, or commercial work',events:'bridal or event work',education:'education or brand work',management:'salon ownership or management',mix:'a mix of different kinds of hair work',notearning:'hair work that is not currently bringing in income'})[a.primarywork]||'hair work';
 let id,title,summary,check,rule,nextTool='daymath';

 if(a.goal==='clients') {
  id='fill'; title=packed?'CHOOSE THE WORK YOU WANT MORE OF.':'GET MORE OF THE RIGHT WORK COMING IN.';
  reasons.push(starting?'You are not booking paid work right now. We need one clear way for the right people to understand what they can hire you for.':packed?'You said your calendar is already as full as you want it. More work only helps if it is the kind you actually want.':'You want more paid work in '+role+(room?', and there is room for it.':'.'));
  const sources=Array.isArray(a.jobsource)?a.jobsource:[a.jobsource];
  const outreach=Array.isArray(a.outreach)?a.outreach:[a.outreach];
  const sourceLabels={agency:'an agency or representation',repeat:'repeat clients or brands',referrals:'referrals and word of mouth',social:'social media or your portfolio',direct:'direct outreach from brands, producers, planners, or clients',none:'no consistent source yet',unknown:'a source you have not tracked yet'};
  reasons.push(sources.includes('none')?'You said paid work is not coming in consistently yet.':sources.includes('unknown')?'You are not sure yet where paid work is coming from.':'You said paid work is finding you through '+sources.map(v=>sourceLabels[v]).filter(Boolean).join(', ')+'.');
  step('MAKE IT OBVIOUS WHAT PEOPLE CAN HIRE YOU FOR.','Choose the kind of paid work you want more of. Make sure your portfolio, bio, or booking contact shows that clearly without making someone hunt for it.');
  if(outreach.includes('none')) step('MAKE ONE REAL CONTACT.','Choose one person, agency, past client, producer, planner, brand, or company that could realistically hire or refer you. Send one clear message about the work you want.');
  else step('FOLLOW THE SOURCE THAT HAS ACTUALLY PAID YOU.','Look at your last few paid jobs. Note how each one found you. Put this week behind the source that produced real paid work, not just attention.');
  step('TRACK THE NEXT FIVE OPPORTUNITIES.','For each inquiry, hold, booking, or referral, write down where it came from and whether it turned into paid work. BOOKED AF needs the real pattern, not the loudest platform.');
  summary='Make the work you want easy to understand, then track what actually turns into paid jobs.';
  check='Look at the next five real opportunities. Which source produced a paid booking, not just a conversation?';
  rule='More inquiries are useful only when they lead to work you actually want and can fit into your life.';
 } else if(a.goal==='return') {
  id='return'; title=starting||a.repeatwork==='new'?'BUILD THE FOLLOW-UP INTO THE JOB.':'GET MORE OF THE RIGHT PEOPLE TO HIRE YOU AGAIN.';
  reasons.push(starting||a.repeatwork==='new'?'It is too early to judge repeat work. We can build a follow-up habit from the start.':a.repeatwork==='most'?'You said most of the right clients already come back. The goal is protecting that relationship without becoming annoying.':a.repeatwork==='unknown'?'You have not tracked repeat work yet. That is the first thing to fix.':'You want more repeat work, and you said some people who hire you do not come back.');
  const follow=Array.isArray(a.repeatfollow)?a.repeatfollow:[a.repeatfollow];
  step('CLOSE THE JOB LIKE YOU WANT ANOTHER ONE.','Send a short thank-you after the job and make it easy for the person who hired you to find your contact information again.');
  if(follow.includes('agency')) step('KNOW WHO OWNS THE FOLLOW-UP.','If your agency handles the relationship, know what they do after the job and when it makes sense for you to stay visible without stepping on that relationship.');
  else if(follow.includes('none')) step('DO ONE SIMPLE FOLLOW-UP.','Reach out once after the job. Thank them, mention that you would love to work together again, and then let the relationship breathe.');
  else step('KEEP THE FOLLOW-UP THAT FEELS NATURAL.','You already do some follow-up. Keep the pieces that lead to repeat bookings and remove anything that feels like busywork.');
  step('MARK THE NEXT FIVE REPEAT OPPORTUNITIES.','For the next five jobs, note whether the client, brand, planner, producer, or team had hired you before. That gives us a real repeat-work picture.');
  summary='Make it easy for good clients and teams to remember you, rehire you, and refer you.';
  check='Watch the next five paid jobs and note how many came from someone who had hired you before.';
  rule='A repeat client is valuable. Chasing every past contact is not the goal.';
 } else if(a.goal==='money') {
  id='money'; title='MAKE THE WORK YOU ALREADY DO PAY BETTER.';
  const styles=Array.isArray(a.paystyle)?a.paystyle:[a.paystyle];
  const expenses=Array.isArray(a.workexpenses)?a.workexpenses:[a.workexpenses];
  reasons.push('You want more money without simply adding more work. Your '+role+' can have a very different real value once time, fees, travel, assistants, products, and payment delays are included.');
  if(a.primarywork==='session'&&a.sessionagency==='yes') reasons.push('You said an agency takes a cut from your rate, so we need to use what actually stays yours.');
  if(a.paywait==='90'||a.paywait==='long') reasons.push('You also wait a long time to get paid. That is a cash-flow problem even when the job itself pays well.');
  step('CHECK ONE REAL JOB FROM START TO FINISH.','Use the agreed pay, every paid and unpaid hour, and every cost that truly stayed yours. Do not count reimbursed money as income.');
  step('SEPARATE THE MONEY INTO THE RIGHT BUCKETS.',expenses.includes('team')||expenses.includes('travel')||expenses.includes('hair')?'Separate what you earned, what you fronted and expect back, money that passed through you for someone else, and expenses you actually had to absorb.':'Separate what you earned from the work costs you actually paid.');
  step('COMPARE IT WITH A SECOND JOB.','Pick another recent job and do the same check. The better-paying job is not always the one with the biggest headline rate.');
  summary='Compare what the work really paid you after the time and costs around it.';
  check='After two real jobs, compare what actually stayed yours and how much time each one took.';
  rule='A day rate, project fee, salary, or invoice total is not the same thing as what the work paid you per hour or per day.';
 } else if(a.goal==='keep') {
  id='money'; title='FIND OUT WHERE THE MONEY IS ACTUALLY GOING.';
  const expenses=Array.isArray(a.workexpenses)?a.workexpenses:[a.workexpenses];
  reasons.push('You earn through '+role+'. We need to separate real income from reimbursements, pass-through money, and costs before deciding that you are spending too much.');
  if(a.primarywork==='session'&&['often','sometimes'].includes(a.sessionfront)) reasons.push('You said you sometimes front money for jobs. That money is tied up until the client reimburses you, even when it is not ultimately your expense.');
  step('PICK ONE NORMAL MONTH.','Gather the payments that actually reached you, plus the work bills and reimbursements from that same period. Do not use invoice totals alone.');
  step('SEPARATE EARNINGS FROM MONEY THAT WAS NEVER REALLY YOURS.',expenses.includes('team')?'If client money came through you to pay an assistant or someone else, mark it separately. Also separate reimbursements from actual earnings.':'Keep reimbursements separate from earnings, and keep business costs separate from personal spending.');
  step('CHECK ONE COST OR DELAY YOU CAN CHANGE.','Choose one recurring cost, payment delay, unnecessary purchase, or job expense you can actually verify. Make one change and check the next real statement or payment.');
  summary='Get a clean picture of what stayed yours before trying to cut everything.';
  check='Did the amount you actually kept change, or did money simply move through your account differently?';
  rule='Money hitting your account is not automatically income you got to keep.';
 } else if(a.goal==='time') {
  id='time'; title='GET MORE OF YOUR WEEK BACK WITHOUT PRETENDING THE WORK TAKES LESS TIME.';
  const leak=({travel:'travel and getting to the job',prep:'prep, shopping, kit work, or fittings',waiting:'waiting around before or during jobs',longday:'paid days that turn into very long days',admin:'invoices, email, scheduling, and follow-up',none:'very little unpaid time',unknown:'time you have not tracked yet'})[a.timeleak];
  reasons.push('Your work is not only the hours somebody sees. You said the biggest time issue is '+leak+'.');
  step('TRACK ONE FULL JOB, NOT JUST THE PAID PART.','Start the clock with the first required prep, message, shopping trip, or travel and stop when the job is genuinely finished. Keep paid and unpaid time separate.');
  step('CHOOSE THE TIME YOU WANT BACK.','Pick one block of time you want protected each week. Do not remove paid work yet; first see what is actually eating the surrounding hours.');
  step('CHECK WHAT THAT TIME IS WORTH.','Compare one normal job or workday with the total time it required. Then decide whether the schedule, fee, travel terms, or workflow needs to change.');
  summary='Protect your time using the full job, not just the hours on the call sheet or invoice.';
  check='After one week, compare paid time with total work time. Which unpaid piece is taking the most from your week?';
  rule='A shorter schedule is only better if the same workload is not being crammed into fewer, worse days.';
 } else {
  id='money'; title='GIVE YOURSELF SOME BREATHING ROOM.';
  const goals={emergency:'a slow month or emergency',timeoff:'time off',retire:'later life',body:'less dependence on your body for income',unknown:'a first savings goal'};
  reasons.push(a.savings==='none'?'You said you do not have savings to cover a slowdown yet. Start with the basics that need protecting.':a.savings==='unknown'?'You are not sure how long savings would cover you. Start by finding what is set aside and what it needs to cover.':a.savings==='solid'?'You already have six months or more set aside. We can focus on the next goal you chose.':'You have some savings set aside. The next step is deciding what you need that money to protect.');
  step('NAME WHAT THE MONEY IS FOR.','You chose '+goals[a.futurefear]+'. Keep money for upcoming bills separate from money genuinely set aside for that goal.');
  if(a.futurehabit==='catchup') step('CHECK WHAT IS LEFT BEFORE MOVING MONEY.','Check the bills due before your next payment and what you actually have available. Start with one income or work-cost change; do not schedule a savings transfer that leaves a bill unpaid.');
  else if(a.futurehabit==='save') step('CHECK THAT YOUR ROUTINE FITS THE GOAL.','Keep the savings routine that is already working. Check what it is for and whether upcoming bills will need any of that money.');
  else step('USE EACH PAYDAY AS THE CHECK-IN.','When money arrives, check upcoming bills first. If there is money available after those are covered, choose a manageable amount for the goal.');
  step('REPEAT THE CHECK WHEN YOU GET PAID AGAIN.','Irregular work needs a repeatable habit more than a perfect monthly number. Check the goal again the next time money comes in.');
  summary='Build a repeatable habit around the money you actually have available.';
  check='Did you check the bills and take one step toward the goal? If nothing was available to save, record that honestly and focus on income or costs next.';
  rule='A savings plan should fit your real pay and bills. These answers do not tell us a safe transfer amount.';
 }
 const intro=reasons.join(' '), top={id,title,short:intro,body:summary,action:steps[0].body};
 const plan={intro:summary,steps,checkTitle:'WHAT CHANGED THIS WEEK?',check,rule};
 return {schema:SHORT_SCHEMA,stage,top,items:[top],intro,showTime:a.goal==='time',opportunity:null,
  day:'Want to check what one job or workday pays? Enter the real pay, total time, and costs. BOOKED AF does the math.',
  fix:{title,body:intro,first:steps[0].body,then:steps.slice(1).map(s=>s.body).join(' '),dontTitle:'KEEP THIS IN MIND.',dont:rule},plan,nextTool};
}
function buildShortBreakdown(input) {
 const a=validateShortAnswers(input);
 if(a.primarywork!=='chair') return buildOutsideChairBreakdown(a);
 const stage=shortStage(a).label;
 const starting=a.days==='0'||a.full==='notyet'||a.spend==='notyet';
 const room=['under25','half'].includes(a.full), packed=a.full==='full';
 const steps=[], reasons=[];
 const step=(title,body)=>steps.push({id:'short-'+a.goal+'-'+steps.length,day:['1','2-3','4-6'][steps.length],title,body});
 let id,title,summary,check,rule, nextTool='daymath';
 if(a.goal==='clients') {
  id='fill'; title=packed?'MAKE ROOM FOR THE CLIENTS YOU WANT.':'GET MORE OF THE RIGHT PEOPLE IN YOUR CHAIR.';
  reasons.push(packed?'You want more clients, but you also said your book is packed. The first move is choosing which work you want more of, not adding another workday.':starting?'You’re getting started. A clear service, real examples of your work, and an easy way to book give new people something to say yes to.':'You want more clients'+(room?', and your book has open space.':'.'));
  const sourceLabels={social:'Instagram or TikTok',salon:'your salon',referrals:'referrals or word of mouth',search:'Google or your website',none:'no steady source yet',unknown:'a source you haven’t identified yet'};
  const visibility=Array.isArray(a.visibility)?a.visibility:[a.visibility];
  const marketing=Array.isArray(a.marketing)?a.marketing:[a.marketing];
  reasons.push(visibility.includes('none')?'You said new clients are not finding you yet.':visibility.includes('unknown')?'You are not sure yet where new clients are finding you.':'You said new clients are finding you through '+visibility.map(v=>sourceLabels[v]).filter(Boolean).join(', ')+'.');
  const resources={past:['START WITH PEOPLE WHO KNOW YOUR WORK.','Message five past or happy clients about the service you want to do more of. Include your booking link and ask whether they know someone who would love it.'],local:['USE THE PEOPLE YOU ALREADY KNOW.','Contact 3 local people or businesses you know. Explain who your service is for and ask about a simple way to introduce each other to clients.'],portfolio:['MAKE IT OBVIOUS HOW TO BOOK YOU.','Choose one clear photo of work you want more of. Add your service, location, starting price, and booking link to the caption. Share it where local clients already find you.'],models:['BOOK ONE PORTFOLIO SERVICE.','Choose one model service you can afford to offer. Agree on any charge and permission for photos first. Use that result to show local people what they can book.'],none:['MAKE YOUR FIRST OFFER EASY TO UNDERSTAND.','Choose one service you can confidently deliver. Write who it is for, where you work, the price, and how to book. Share it with five local people you know; ask for introductions.']};
  if(packed) step('CHOOSE THE WORK YOU WANT MORE OF.','Pick one service or type of appointment you want to fill future openings. Keep your current workdays and decide where those bookings could fit before promoting them.');
  else step(...resources[a.network]);
  if(marketing.includes('none')) step('TRY ONE WAY TO REACH LOCAL CLIENTS.','Choose one local business, community group that allows business posts, or referral contact. Share the same clear service offer there. Keep the effort small enough to repeat.');
  else if(marketing.length>1) {
   const triedLabels={social:'posting your work online',people:'asking people you know for referrals',local:'introducing yourself locally',paid:'paid ads or promotions'};
   step('KEEP THE TACTIC THAT BROUGHT A REAL BOOKING.','You’ve tried '+marketing.map(v=>triedLabels[v]).filter(Boolean).join(', ')+'. Look back at each one: did it create an inquiry, a booked appointment, and a client who actually showed up? Put this week behind the one producing the strongest real response. If none did, fix the offer or booking path before spending more.');
  } else if(marketing.includes('social')) step('CHECK THE STEP AFTER THE POST.','Look at your last few posts. Can someone tell where you work, what service to book, and how to book it? Fix those details, then share one clear offer with local people.');
  else if(marketing.includes('paid')) step('CHECK WHAT THE PROMOTION BROUGHT IN.','Use your booking records to find any appointments from your last promotion. Before spending more, check whether people asked about booking, booked, and actually arrived.');
  else if(marketing.includes('people')) step('MAKE THE INTRODUCTION EASY.','Give the people you contact one short message and booking link they can forward. Ask for an introduction to someone who wants your particular service.');
  else if(marketing.includes('local')) step('FOLLOW UP WITH ONE LOCAL CONTACT.','Choose one business or person you’ve already approached. Suggest one small, specific referral idea and give them a link they can easily share.');
  step('FOLLOW THE BOOKING.',(a.urgency==='now'?'Start today with people you can contact directly. ':a.urgency==='steady'?'Choose a repeatable weekly time for this. ':'Repeat your chosen action this week. ')+'For each new inquiry, note where they found you and whether they booked. Follow up once with anyone who asked and hasn’t booked.');
  if(marketing.includes('none')) reasons.push('You haven’t found a starting point yet, so the plan begins with one small action.');
  if(a.returning==='low'||a.returning==='some') reasons.push('You also said some clients don’t return. Give each new booking a clear next-visit recommendation before they leave.');
  summary='Give the right local people one clear reason to book and one easy way to do it.';
  check='Look at the inquiries and bookings from this week. Repeat the action that brought a real booking; adjust the offer or booking step if people asked but didn’t book.';
  rule=packed?'More demand should give you better choices, not automatically give you longer days.':'Keep your attention on booked appointments. A busy week of posting is not the same thing.';
 } else if(a.goal==='return') {
  id='return'; title=starting||a.returning==='notyet'?'GIVE THE FIRST VISIT A NEXT STEP.':'GET MORE CLIENTS TO COME BACK.';
  reasons.push(starting||a.returning==='notyet'?'It’s too early to judge who comes back. We can build a clear next-visit routine from the start.':['most','almostall'].includes(a.returning)?'You said most clients already come back. We’ll improve the next-visit routine without treating your book as broken.':a.returning==='unknown'?'You don’t know yet how often clients return. Start with a few real visits so we can see what happens.':'You want more clients to return, and you said some are not coming back.');
  if(a.nextvisit==='desk') step('AGREE ON THE NEXT VISIT TOGETHER.','Tell the client what service you recommend next and when. Pass that recommendation to the front desk so the client hears one clear plan.');
  else if(a.nextvisit==='prescribe') step('CHECK THAT THE PLAN FITS THE CLIENT.','Keep recommending the next service and timing. Ask whether that upkeep fits their budget and routine, and agree on a realistic plan together.');
  else step('RECOMMEND THE NEXT VISIT.','Before checkout, explain what the client needs next and when. For example: “To keep this color looking like this, I’d recommend seeing you in about eight weeks. Would you like to reserve that?”');
  const followup=Array.isArray(a.followup)?a.followup:[a.followup];
  const followups={personal:'Keep your personal check-in. Refer to their service and make the booking link easy to find.',automatic:'Read the automatic reminder as if you were the client. Check its timing, service details, and booking link.',desk:'Ask the front desk or salon when they follow up and what the client receives. Make sure your recommendation and their message match.',none:'Ask whether they would like a check-in when their next service is due. If they agree, send a short personal message and an easy booking link.',unknown:'Find out who follows up after an unbooked visit—you, the desk, or your booking system. Agree on who handles the next step.'};
  if(followup.length>1) step('MAKE THE FOLLOW-UP WORK TOGETHER.','You have more than one follow-up happening. Decide who owns the timing, what each message is for, and make sure the client is not getting duplicate nudges. Keep the parts that actually lead to booked return visits.');
  else step('MAKE FOLLOW-UP CLEAR.',followups[followup[0]]);
  step('WATCH THE NEXT FIVE VISITS.','For your next five clients, note whether a next visit was discussed and booked. When it is due, note whether they return. Those are different things, and both matter.');
  reasons.push(followup.includes('none')?'Right now you wait for clients to contact you, so a clear follow-up is a useful next step.':'Your answers point us to the handoff between the appointment, booking again, and following up.');
  summary='Make the next visit part of the conversation, then see where people drop out.';
  check='After a week, check whether the next-visit conversations happened. Wait until appointments are due before judging how many clients actually returned.';
  rule='Offer a useful recommendation. Give the client room to choose.';
 } else if(a.goal==='money') {
  id='cheap'; title='MAKE THE WORK YOU ALREADY DO PAY BETTER.';
  reasons.push('You want more money from your existing work. '+(room?'Your book also has open space, so higher prices alone may not solve the problem.':packed?'Your book is already packed, so adding more clients isn’t our first move.':'We need the pay, time, and costs from real appointments before recommending a change.'));
  const payLabels={commission:'a percentage from the salon',hourly:'hourly pay',self:'service money after your own work costs',owner:'income from a salon you own',mixed:'a mix or an arrangement you need to check'};
  reasons.push('You get '+payLabels[a.paymodel]+'.');
  if(a.costs==='tight') reasons.push('You already know what reaches you after work costs, and it needs to be more.');
  else if(a.costs==='rough'||a.costs==='unknown') reasons.push('You are not fully clear yet on what stays yours after work costs, so the plan starts with real pay and cost numbers instead of guesses.');
  else if(a.costs==='clear') reasons.push('You said what stays yours is enough, so the goal is improving pay without creating a schedule or cost problem.');
  if(a.paymodel==='hourly') {
   reasons.push(a.hourlytime==='no'?'You said your paid hours match the time you are working, so the opportunity is probably in rate, bonus, responsibilities, or schedule—not missing paid time.':a.hourlytime==='unknown'?'You are not sure whether all of your work time is showing up as paid time, so we need to compare the clock with the payslip first.':'You said some work is happening outside paid time. That is part of the pay problem and belongs in the plan.');
   step('CHECK ONE NORMAL PAY PERIOD.','Use your payslip and hours worked. Note your hourly rate, paid hours, tips, and any bonus. A higher service price does not automatically raise hourly pay.');
   step('FIND WHAT CAN ACTUALLY CHANGE YOUR PAY.','Ask how raises, bonuses, premium services, education, or higher-paid responsibilities are decided. Choose the lever that actually exists in your workplace.');
   if(a.hourlytime==='no') step('CHECK THE NEXT PAYSLIP.','After one agreed change, compare the next pay period with the first one. Keep the change only if your real pay or paid hours improved.');
   else if(a.hourlytime==='unknown') step('COMPARE THE CLOCK WITH THE PAYSLIP.','For one week, write down when work actually starts and ends, including required setup, cleanup, and messages. Compare that with the paid hours on your payslip.');
   else step('STOP LOSING WORK TIME.','Track required setup, cleanup, messages, and other work happening off the clock. Follow your workplace rules and make sure paid work time is recorded correctly.');
  } else {
   step('CHECK ONE REAL APPOINTMENT.',starting?'Use a practice appointment or a planned service in Chair Math. Label the numbers as a trial, not money you have already earned.':'Open Chair Math for one recent appointment. Enter what the client paid and how long it took, including cleanup. Choose your actual pay arrangement.');
   const workcosts=Array.isArray(a.workcosts)?a.workcosts:[a.workcosts];
   let costs='';
   if(workcosts.includes('none')) costs='You said the salon covers your work costs, so don’t deduct costs you do not personally pay.';
   else if(workcosts.includes('unknown')) costs='Check your pay agreement, statements, or receipts first. Leave costs you don’t know blank; the calculator will tell you what it left out.';
   else {
    const pieces=[];
    if(workcosts.includes('product')) pieces.push('the supplies used for that service');
    if(workcosts.includes('space')) pieces.push('your share of chair or suite rent for a normal workday');
    if(workcosts.includes('fees')) pieces.push('card, booking, or software fees that apply');
    if(workcosts.includes('team')) pieces.push('assistant or team costs that apply');
    costs='Include '+pieces.join(', ')+'.';
   }
   if(['long','verylong'].includes(a.servicehours)) costs+=' Your appointments run several hours, so include processing, finishing, and cleanup time.';
   step('INCLUDE WHAT YOU ACTUALLY PAY.',costs);
   step('CHECK A SECOND APPOINTMENT.',(a.paymodel==='commission'?'If prices or timing are set by the salon, discuss changes with your manager. ':'')+'Enter a second appointment in Chair Math. It compares what the two pay for your time. Try one change you control, then check the real result.');
  }
  if(a.spend==='unknown') reasons.push('You’re unsure what a typical client spends. Use a receipt for the first check rather than guessing.');
  summary='Start with what reaches your pocket for the time you give it.';
  check='Check the real pay and hours after one change. The amount a client spends by itself does not tell us what you earn.';
  rule='Your location, services, pay arrangement, time, and costs all matter. A lower ticket alone does not mean you are undercharging.';
 } else if(a.goal==='keep') {
  id='money'; title='LET’S SEE WHERE YOUR MONEY WENT.';
  reasons.push(a.costs==='clear'?'You already know what stays yours. We can focus on the particular cost you want to understand.':a.costs==='tight'?'You know what is left, and it is less than you need. Start with one cost you can actually check.':'You’re not yet clear on what stays yours. We’ll start with actual pay and bills, not the sales total.');
  step('START WITH ONE NORMAL MONTH.',a.paymodel==='hourly'||a.paymodel==='commission'?'Use your payslips, tips, and any other work pay for one normal month. Use the money paid to you, not all the sales the salon took.':'Use your service receipts and work bank records for one normal month. Keep business costs separate from personal spending.');
  const costMoves={space:'Find your pay agreement, rent, or salon-fee statement. If commission was already removed before you were paid, don’t subtract it a second time.',product:'Gather the receipts for color, hair, and supplies you personally paid for. For an appointment check, use only what you used for that service.',discount:'Use your booking records to find discounts, free extras, and redos. Don’t subtract a discount again if the receipt already shows the lower amount paid.',fees:'Look at recurring apps, card fees, and subscriptions on your work statements. Mark anything you no longer use.',team:'Gather team pay and regular salon bills. These are separate from the money you take home as the owner.',unknown:'Start with your largest regular work bill and check one statement. You don’t need to remember every purchase tonight.'};
  step('CHECK THE COST YOU PICKED.',costMoves[a.costleak]);
  step('TEST ONE SMALL CHANGE.','Choose a cost you control: an unused subscription, wasted product, or an extra you keep giving away. Check its actual charge before and after the change. For one appointment or workday, use Chair Math to check pay and direct costs.');
  summary='Find one real cost to understand before trying to cut everything.';
  check='Look for a change in the actual charge or amount used. A pay deposit alone does not show every work cost or personal bill.';
  rule='Chair Math checks an appointment or workday. It does not replace a full monthly profit calculation.';
 } else if(a.goal==='time') {
  id='time'; title='WANT A SHORTER WORK WEEK? LET’S MAKE THE NUMBERS WORK.';
  const target=Number(a.targetdays),current=Number(a.days);
  reasons.push(starting?'You’re still getting started. This is a chance to build around the schedule you want from the beginning.':target&&target<current?'You work '+a.days+(a.days==='6'?'-7':'')+' days and would like '+target+'. We need to check what the time you remove pays you.':target&&target>=current?'The number of days you chose is not fewer than you work now. We’ll focus on hours and how those days feel first.':'You want more room in your week. We’ll start with the hours you want back.');
  if(a.weeklyhours==='over40') reasons.push('You said work takes more than 40 hours a week, including work outside appointments.');
  step('CHOOSE THE TIME YOU WANT BACK.',starting?'Choose your preferred workdays and finish times before opening your booking calendar. Treat this as a starting schedule to test.':a.targetdays==='shorter'||(target&&target>=current)?'Choose an earlier finish or a block of time you want free. Name the hours, rather than trying to remove a whole day.':'Choose one workday or part of a day you would like back. Keep the bookings in place while you check it.');
  const timeMoves={gaps:'Mark the empty gaps in one normal week. See whether future bookings could fit closer together without rushing clients or removing breaks.',overrun:'For your next 3 appointments, record the booked finish and actual finish. Use the actual time in Chair Math; leave enough time for cleanup and breaks.',squeeze:'Choose your earliest start and latest finish. When that time is full, offer the next real opening instead of adding another squeeze-in.',messages:'Put messages and admin into one or two work blocks, and tell clients when you reply. Include those hours when checking what your week pays.',none:'Your schedule already has little spare time. Use Chair Math for one normal workday before deciding what could change.',unknown:'Record your start, finish, appointments, and gaps for one normal workday. That gives you something real to check.'};
  step('CHECK WHAT USES THOSE HOURS.',starting?'For your first appointments, record the actual time, including cleanup and messages. Build enough room for that work into your schedule.':timeMoves[a.overrun]);
  step('CHECK THE PAY BEFORE CHANGING DAYS.',starting?'When you begin taking paid appointments, use Chair Math to check a real workday. A planned schedule is not proof of what it will pay.':'Open Chair Math for a normal day. Choose your pay arrangement and enter the actual hours and costs. Keep your current days until you have checked how a change affects what you keep.');
  summary='Make more room in the week without pretending we already know what you can afford to give up.';
  check='Check the hours you worked and what reached your pocket. A shorter week is a goal to test, not an income promise.';
  rule='Keep breaks and realistic appointment times. Five exhausting days squeezed into 3 is not the goal.';
 } else {
  id='money'; title='GIVE YOURSELF SOME BREATHING ROOM.';
  reasons.push(a.savings==='none'?'You said you do not have savings to cover a slowdown yet. Start with the basics that need protecting.':a.savings==='unknown'?'You’re unsure how long savings would cover you. Start by finding what is set aside and what it needs to cover.':a.savings==='solid'?'You already have six months or more set aside. We can focus on the next goal you chose.':'You have some savings set aside. The next step is deciding what you need that money to protect.');
  const goals={emergency:'a slow month or emergency',timeoff:'time off',retire:'later life',body:'less dependence on your body for income',unknown:'a first savings goal'};
  step('NAME WHAT THE MONEY IS FOR.','You chose '+goals[a.futurefear]+'. Keep money for upcoming bills separate from money genuinely set aside for that goal.');
  if(a.futurehabit==='catchup') step('CHECK WHAT IS LEFT BEFORE MOVING MONEY.','You said bills use up your pay. Check the bills due before your next payday and what you have available. Start with one income or work-cost change; don’t schedule a savings transfer that leaves a bill unpaid.');
  else if(a.futurehabit==='save') step('CHECK THAT YOUR ROUTINE FITS THE GOAL.','Keep the savings routine that is already working. Check what it is for and whether upcoming bills will need any of that money.');
  else if(a.futurehabit==='random') step('USE PAYDAY AS THE CHECK-IN.','Whenever you are paid, check upcoming bills first. If there is money available after those are covered, choose a manageable amount for your goal.');
  else step('GIVE EXTRA MONEY A DESTINATION.','When a stronger payday arrives, check upcoming bills first. Put an affordable amount toward the goal you named before it blends into everyday spending.');
  if(a.futurefear==='body') step('CHOOSE ONE SMALL OFF-CHAIR TEST.','Name one way your experience could earn away from the chair, such as teaching or a role with a beauty company. Check what it requires before paying for a course or reducing your current work.');
  else if(a.futurefear==='retire') step('CHECK WHAT YOU ALREADY HAVE.','Locate any retirement accounts or workplace plan information. Note what you contribute and any employer contribution before deciding on a next step.');
  else if(a.futurefear==='timeoff') step('CHECK ONE DAY OFF.','Use Chair Math on a normal workday to see what it leaves you. That is one starting point for time-off planning; remember that bills still arrive while you are away.');
  else step('REPEAT THE CHECK NEXT PAYDAY.','Check bills, available money, and your goal again. Adjust the amount to what you can actually spare. A routine you can repeat matters more than an impressive first transfer.');
  summary='Build a repeatable habit around the money you actually have available.';
  check='Did you check the bills and take one step toward the goal? If nothing was available to save, record that honestly and focus on income or costs next.';
  rule='A savings plan should fit your real pay and bills. These answers do not tell us a safe transfer amount.';
 }
 const intro=reasons.join(' '), top={id,title,short:intro,body:summary,action:steps[0].body};
 const plan={intro:summary,steps,checkTitle:'WHAT CHANGED THIS WEEK?',check,rule};
 return {schema:SHORT_SCHEMA,stage,top,items:[top],intro,showTime:a.goal==='time',opportunity:null,
  day:'Want to check what one appointment or workday pays? Enter the real pay, time, and costs. BOOKED AF does the math.',
  fix:{title,body:intro,first:steps[0].body,then:steps.slice(1).map(s=>s.body).join(' '),dontTitle:'KEEP THIS IN MIND.',dont:rule},plan,nextTool};
}
function shortEmailCopy(r,name) {
 return 'THE BOOKED AF BREAKDOWN\n\n'+(name?name+', here’s':'Here’s')+' your Breakdown.\n\nYOUR BOOK RIGHT NOW\n'+r.stage+'\n\nFIX THIS FIRST\n'+r.top.title+'\n'+r.intro+'\n\nDO THESE 3 THINGS\n'+r.plan.steps.map((s,i)=>(i+1)+'. '+s.title+'\n'+s.body).join('\n\n')+'\n\nWATCH THIS\n'+r.plan.checkTitle+'\n'+r.plan.check+'\n'+r.plan.rule+'\n\nThis is a starting point based on your answers. Exact pay and time-off decisions need your actual numbers.\n\nBradley\nBOOKED AF\nLove your career. Keep your life.\nbookedandfabulous.com';
}

