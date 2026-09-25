// BEGIN SHARED BREAKDOWN CORE
// Shared by the website and the self-contained email Worker.
const SHORT_SCHEMA = 'short-v1';
const shortQuestions = [
 {id:'goal',title:'WHAT ARE WE FIXING FIRST?',choices:[['clients','I need more clients in my chair.'],['money','I want to earn more without adding more hours.'],['return','I want clients who keep coming back.'],['keep','I make money. Where does it all go?'],['time','I love doing hair. I’d also like a life.'],['stable','I need money saved for when life happens.']]},
 {id:'full',title:'How busy are you most weeks?',choices:[['notyet','I’m not taking clients yet'],['under25','I have a few clients and lots of openings'],['half','I’m booked about half the time'],['threequarters','I’m busy, with a few openings'],['full','I’m fully booked or close to it']]},
 {id:'days',title:'HOW MANY DAYS A WEEK ARE YOU BEHIND THE CHAIR?',choices:[['0','I’m not taking appointments yet'],['1','1 day'],['2','2 days'],['3','3 days'],['4','4 days'],['5','5 days'],['6','6–7 days']]},
 {id:'spend',title:"WHAT DOES A CLIENT USUALLY SPEND IN YOUR CHAIR?",note:"Just the hair services. Leave out tips and take-home products. Pick the closest amount.",choices:[["notyet", "I’m not taking clients yet."], ["unknown", "Honestly? I need to check."], ["75", "Under $100"], ["150", "$100–$199"], ["275", "$200–$349"], ["400", "$350 or more"]]},
 {id:'returning',title:"THEY CAME IN. ARE THEY COMING BACK?",choices:[["notyet", "I’m still getting started. Too soon to tell."], ["low", "Not many come back. I’d like to change that."], ["some", "Some come back. Some I never see again."], ["most", "Most come back for more."], ["almostall", "Almost everyone comes back."], ["unknown", "I haven’t kept track."]]},
 {id:'costs',note:'After the salon’s share and any rent or supplies you pay for. Before personal bills and taxes.',title:'YOU DID THE HAIR. HOW MUCH OF THE MONEY IS ACTUALLY YOURS?',choices:[['clear','I know what I keep, and it’s enough.'],['tight','I know what I keep. It needs to be more.'],['rough','I have a ballpark idea.'],['unknown','Honestly? I need help figuring that out.']]},
 {id:'visibility',when:a=>a.goal==='clients',title:"HOW ARE NEW CLIENTS FINDING YOUR CHAIR?",choices:[["social", "They find me on Instagram or TikTok."], ["salon", "The salon sends them my way."], ["referrals", "Someone puts in a good word for me."], ["search", "They find me on Google or my website."], ["mix", "A few of these are working for me."], ["none", "New clients aren’t finding me yet."], ["unknown", "Good question. I need to start asking."]]},
 {id:'marketing',when:a=>a.goal==='clients',note:"Pick the closest answer.",title:"WHAT HAVE YOU TRIED TO GET PEOPLE IN YOUR CHAIR?",choices:[["social", "Posting my work online."], ["people", "Asking people I know to send clients my way."], ["local", "Introducing myself to people and businesses nearby."], ["paid", "Paying for ads or promotions."], ["mix", "Several of these. My book still has other plans."], ["none", "I haven’t started yet. I need a first move."]]},
 {id:'network',when:a=>a.goal==='clients',note:'Choose the one you would feel most comfortable trying.',title:'Which of these could you do first to help new clients find you?',choices:[['past','Contact current or past clients and ask them to recommend me'],['local','Ask people or businesses I know nearby to recommend me'],['portfolio','Share photos of hair I’ve done, with a link to book'],['models','Offer a free or discounted appointment so I can take photos of the results'],['none','I’m not sure where to start']]},
 {id:'urgency',when:a=>a.goal==='clients',title:"HOW SOON DO WE NEED TO FILL THOSE OPENINGS?",choices:[["now", "As soon as possible. My bills aren’t waiting."], ["month", "Over the next month."], ["steady", "I have time to build. I want to do it well."]]},
 {id:'nextvisit',when:a=>a.goal==='return',title:"GREAT HAIR. NOW, DO YOU TALK ABOUT THEIR NEXT VISIT?",choices:[["prescribe", "Yes. We talk about what’s next and when to come back."], ["ask", "I ask, “Want to book your next appointment?”"], ["desk", "I leave that conversation to the front desk."], ["rare", "Usually not. We say goodbye and hope for the best."]]},
 {id:'followup',when:a=>a.goal==='return',title:"THEY LEFT WITHOUT REBOOKING. WHAT HAPPENS NEXT?",choices:[["personal", "I reach out when it’s time for their next visit."], ["automatic", "My booking system sends a reminder."], ["none", "I wait for them to make the next move."], ["unknown", "Honestly? I’m not sure what happens."]]},
 {id:'paymodel',when:a=>a.goal==='money'||a.goal==='keep',title:"LET’S TALK PAY. HOW DOES YOURS WORK?",choices:[["commission", "I get a percentage of what my clients pay."], ["hourly", "I get paid by the hour."], ["self", "I work for myself. The salon expenses are mine, too."], ["owner", "I own the salon."], ["mixed", "It’s a mix, or I need help sorting it out."]]},
 {id:'servicehours',when:a=>a.goal==='money',note:"From the client walking in to the last towel in the hamper. Pick the closest answer.",title:"HOW LONG DOES ONE APPOINTMENT REALLY TAKE?",choices:[["short", "Less than an hour"], ["medium", "About 1–2 hours"], ["long", "About 3–4 hours"], ["verylong", "5 hours or more"], ["varies", "Depends on who’s in the chair and what we’re doing."], ["unknown", "I need to watch the clock next time."]]},
 {id:'workcosts',when:a=>a.goal==='money',title:"WHICH WORK BILLS HAVE YOUR NAME ON THEM?",choices:[["none", "The salon pays for my supplies and space."], ["product", "Color, extension hair, or other supplies."], ["space", "Chair or suite rent."], ["both", "Rent and supplies. Both come out of my pocket."], ["team", "The salon’s bills and staff pay."], ["unknown", "I need to check what I’m actually paying for."]]},
 {id:'costleak',when:a=>a.goal==='keep',title:"WHERE SHOULD WE START LOOKING AT WHAT YOU SPEND?",choices:[["space", "The salon’s share, rent, or salon fees."], ["product", "Color, extension hair, and supplies."], ["discount", "Discounts, free redos, and “I won’t charge you for that.”"], ["fees", "Apps, card fees, and subscriptions. They add up."], ["team", "Staff pay and the salon’s bills."], ["unknown", "Honestly? I need help knowing where to look."]]},
 {id:'weeklyhours',when:a=>a.goal==='time',title:'HOW MANY HOURS A WEEK ARE YOU ACTUALLY WORKING?',note:'Count appointments, cleanup, ordering, and client messages. Answering hair questions from your couch counts. The pajamas don’t make it time off.',choices:[['under20','Under 20 hours'],['20to30','20–30 hours'],['31to40','31–40 hours'],['over40','More than 40 hours'],['unknown','Honestly? I’ve lost track.']]},
 {id:'targetdays',when:a=>a.goal==='time',title:"YOUR WEEK, YOUR WAY. HOW MANY WORKDAYS?",choices:[["1", "1 day"], ["2", "2 days"], ["3", "3 days"], ["4", "4 days"], ["5", "5 days"], ["shorter", "Same number of days. I just want to get home earlier."], ["unknown", "Help me figure out what could work."]]},
 {id:'overrun',when:a=>a.goal==='time',title:'WHAT MAKES YOUR WORKDAY STRETCH LONGER THAN IT SHOULD?',choices:[['gaps','Big gaps between clients. I’m still here, but not getting paid.'],['overrun','Appointments take longer than I planned.'],['squeeze','I keep saying, “Sure, I can squeeze you in.”'],['messages','Messages and paperwork keep piling up after my last appointment.'],['none','I usually finish when I planned.'],['unknown','I’m not sure where the time goes.']]},
 {id:'savings',when:a=>a.goal==='stable',note:"Rent, food, utilities—the bills don’t take days off. Pick the closest answer. “I’m not sure” is okay.",title:"IF WORK STOPPED, HOW LONG COULD YOUR SAVINGS COVER THE BILLS?",choices:[["none", "I haven’t built up savings yet."], ["month", "About a month"], ["few", "A few months"], ["solid", "Six months or more"], ["unknown", "I’m not sure. I need a clearer picture."]]},
 {id:'futurehabit',when:a=>a.goal==='stable',title:"IS SAVING MONEY HAPPENING, OR STILL ON THE TO-DO LIST?",choices:[["catchup", "The bills get there first."], ["spend", "I mean to save. Then I spend what’s left."], ["random", "My income changes, and my saving does too."], ["save", "I’m already putting money away regularly."]]},
 {id:'futurefear',when:a=>a.goal==='stable',title:"WHAT DO YOU WANT THAT SAVED MONEY TO DO FOR YOU?",choices:[['emergency','Money for a slow month or an emergency'],['timeoff','Being able to take time off'],['retire','Saving for later in life'],['body','Moving into work that is easier on my body'],['unknown','I need help choosing where to start']]}
];
function shortVisibleQuestions(answers) {
 return shortQuestions.filter(q=>!q.when||q.when(answers));
}
function validateShortAnswers(input) {
 if(!input||typeof input!=='object'||Array.isArray(input)) throw new Error('answers');
 const clean={};
 for(const q of shortQuestions) {
  if(input[q.id]!==undefined) {
   if(!q.choices.some(c=>c[0]===input[q.id])) throw new Error('answers');
   clean[q.id]=input[q.id];
  }
 }
 for(const q of shortVisibleQuestions(clean)) if(!clean[q.id]) throw new Error('answers');
 // Answers from an abandoned goal must not influence the new result.
 return Object.fromEntries(shortVisibleQuestions(clean).map(q=>[q.id,clean[q.id]]));
}
function shortStage(a) {
 const key=a.days==='0'||a.full==='notyet'?'building':({under25:'building',half:'busy',threequarters:'demand',full:'booked'})[a.full]||'building';
 return {key,label:({building:'BUILDING',busy:'GETTING BUSY',demand:'IN DEMAND',booked:'BOOKED AF'})[key]};
}
function buildShortBreakdown(input) {
 const a=validateShortAnswers(input), stage=shortStage(a).label;
 const starting=a.days==='0'||a.full==='notyet'||a.spend==='notyet';
 const room=['under25','half'].includes(a.full), packed=a.full==='full';
 const steps=[], reasons=[];
 const step=(title,body)=>steps.push({id:'short-'+a.goal+'-'+steps.length,day:['1','2–3','4–6'][steps.length],title,body});
 let id,title,summary,check,rule, nextTool='daymath';
 if(a.goal==='clients') {
  id='fill'; title=packed?'MAKE ROOM FOR THE CLIENTS YOU WANT.':'GET MORE OF THE RIGHT PEOPLE IN YOUR CHAIR.';
  reasons.push(packed?'You want more clients, but you also said your book is packed. The first move is choosing which work you want more of, not adding another workday.':starting?'You’re getting started. A clear service, real examples of your work, and an easy way to book give new people something to say yes to.':'You want more clients'+(room?', and your book has open space.':'.'));
  const sources={social:'social media',salon:'your salon',referrals:'referrals',search:'Google or your website',mix:'a mix of places',none:'no steady source yet',unknown:'a source you haven’t identified yet'};
  reasons.push('You said new clients come from '+sources[a.visibility]+'.');
  const resources={past:['START WITH PEOPLE WHO KNOW YOUR WORK.','Message five past or happy clients about the service you want to do more of. Include your booking link and ask whether they know someone who would love it.'],local:['USE THE PEOPLE YOU ALREADY KNOW.','Contact three local people or businesses you know. Explain who your service is for and ask about a simple way to introduce each other to clients.'],portfolio:['GIVE YOUR WORK A WAY TO BOOK.','Choose one clear photo of work you want more of. Add your service, location, starting price, and booking link to the caption. Share it where local clients already find you.'],models:['BOOK ONE PORTFOLIO SERVICE.','Choose one model service you can afford to offer. Agree on any charge and permission for photos first. Use that result to show local people what they can book.'],none:['MAKE YOUR FIRST OFFER EASY TO UNDERSTAND.','Choose one service you can confidently deliver. Write who it is for, where you work, the price, and how to book. Share it with five local people you know; ask for introductions.']};
  if(packed) step('CHOOSE THE WORK YOU WANT MORE OF.','Pick one service or type of appointment you want to fill future openings. Keep your current workdays and decide where those bookings could fit before promoting them.');
  else step(...resources[a.network]);
  if(a.marketing==='social') step('CHECK THE STEP AFTER THE POST.','Look at your last few posts. Can someone tell where you work, what service to book, and how to book it? Fix those details, then share one clear offer with local people.');
  else if(a.marketing==='paid') step('CHECK WHAT THE PROMOTION BROUGHT IN.','Use your booking records to find any appointments from your last promotion. Before spending more, check whether people asked about booking, booked, and actually arrived.');
  else if(a.marketing==='people') step('MAKE THE INTRODUCTION EASY.','Give the people you contact one short message and booking link they can forward. Ask for an introduction to someone who wants your particular service.');
  else if(a.marketing==='local') step('FOLLOW UP WITH ONE LOCAL CONTACT.','Choose one business or person you’ve already approached. Suggest one small, specific referral idea and give them a link they can easily share.');
  else step('TRY ONE WAY TO REACH LOCAL CLIENTS.','Choose one local business, community group that allows business posts, or referral contact. Share the same clear service offer there. Keep the effort small enough to repeat.');
  step('FOLLOW THE BOOKING.',(a.urgency==='now'?'Start today with people you can contact directly. ':a.urgency==='steady'?'Choose a repeatable weekly time for this. ':'Repeat your chosen action this week. ')+'For each new inquiry, note where they found you and whether they booked. Follow up once with anyone who asked and hasn’t booked.');
  if(a.marketing==='none') reasons.push('You haven’t found a starting point yet, so the plan begins with one small action.');
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
  const followups={personal:'Keep your personal check-in. Refer to their service and make the booking link easy to find.',automatic:'Read the automatic reminder as if you were the client. Check its timing, service details, and booking link.',none:'Ask whether they would like a check-in when their next service is due. If they agree, send a short personal message and an easy booking link.',unknown:'Find out who follows up after an unbooked visit—you, the desk, or your booking system. Agree on who handles the next step.'};
  step('MAKE FOLLOW-UP CLEAR.',followups[a.followup]);
  step('WATCH THE NEXT FIVE VISITS.','For your next five clients, note whether a next visit was discussed and booked. When it is due, note whether they return. Those are different things, and both matter.');
  reasons.push(a.followup==='none'?'Right now you wait for clients to contact you, so a clear follow-up is a useful next step.':'Your answers point us to the handoff between the appointment, booking again, and following up.');
  summary='Make the next visit part of the conversation, then see where people drop out.';
  check='After a week, check whether the next-visit conversations happened. Wait until appointments are due before judging how many clients actually returned.';
  rule='Offer a useful recommendation. Give the client room to choose.';
 } else if(a.goal==='money') {
  id='cheap'; title='MAKE THE WORK YOU ALREADY DO PAY BETTER.';
  reasons.push('You want more money from your existing work. '+(room?'Your book also has open space, so higher prices alone may not solve the problem.':packed?'Your book is already packed, so adding more clients isn’t our first move.':'We need the pay, time, and costs from real appointments before recommending a change.'));
  const payLabels={commission:'a percentage from the salon',hourly:'hourly pay',self:'service money after your own work costs',owner:'income from a salon you own',mixed:'a mix or an arrangement you need to check'};
  reasons.push('You get '+payLabels[a.paymodel]+'.');
  if(a.paymodel==='hourly') {
   step('CHECK ONE NORMAL PAY PERIOD.','Use your payslip and hours worked. Note your hourly rate, paid hours, tips, and any bonus. A higher service price does not automatically raise hourly pay.');
   step('FIND WHAT YOU CAN CHANGE.','Ask your manager how raises, bonuses, and paid hours are decided. Choose the option that fits your role and bring examples of your work to that conversation.');
   step('CHECK THE NEXT PAYSLIP.','After an agreed change, check your pay for the hours you actually worked. Use Chair Math’s hourly-pay option if you want help checking a workday.');
  } else {
   step('CHECK ONE REAL APPOINTMENT.',starting?'Use a practice appointment or a planned service in Chair Math. Label the numbers as a trial, not money you have already earned.':'Open Chair Math for one recent appointment. Enter what the client paid and how long it took, including cleanup. Choose your actual pay arrangement.');
   let costs=a.workcosts==='none'?'You said the salon covers workspace and supplies, so don’t deduct those from your personal pay again.':a.workcosts==='unknown'?'Check your pay agreement or receipts first. Leave costs you don’t know blank; the calculator will tell you what it left out.':a.workcosts==='team'?'Team pay and other salon bills matter too. Chair Math is a starting point for one appointment, not your salon’s total profit.':'Add the supplies you paid for. For a normal workday, add your share of chair or suite rent if you pay it.';
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
  reasons.push(starting?'You’re still getting started. This is a chance to build around the schedule you want from the beginning.':target&&target<current?'You work '+a.days+(a.days==='6'?'–7':'')+' days and would like '+target+'. We need to check what the time you remove pays you.':target&&target>=current?'The number of days you chose is not fewer than you work now. We’ll focus on hours and how those days feel first.':'You want more room in your week. We’ll start with the hours you want back.');
  if(a.weeklyhours==='over40') reasons.push('You said work takes more than 40 hours a week, including work outside appointments.');
  step('CHOOSE THE TIME YOU WANT BACK.',starting?'Choose your preferred workdays and finish times before opening your booking calendar. Treat this as a starting schedule to test.':a.targetdays==='shorter'||(target&&target>=current)?'Choose an earlier finish or a block of time you want free. Name the hours, rather than trying to remove a whole day.':'Choose one workday or part of a day you would like back. Keep the bookings in place while you check it.');
  const timeMoves={gaps:'Mark the empty gaps in one normal week. See whether future bookings could fit closer together without rushing clients or removing breaks.',overrun:'For your next three appointments, record the booked finish and actual finish. Use the actual time in Chair Math; leave enough time for cleanup and breaks.',squeeze:'Choose your earliest start and latest finish. When that time is full, offer the next real opening instead of adding another squeeze-in.',messages:'Put messages and admin into one or two work blocks, and tell clients when you reply. Include those hours when checking what your week pays.',none:'Your schedule already has little spare time. Use Chair Math for one normal workday before deciding what could change.',unknown:'Record your start, finish, appointments, and gaps for one normal workday. That gives you something real to check.'};
  step('CHECK WHAT USES THOSE HOURS.',starting?'For your first appointments, record the actual time, including cleanup and messages. Build enough room for that work into your schedule.':timeMoves[a.overrun]);
  step('CHECK THE PAY BEFORE CHANGING DAYS.',starting?'When you begin taking paid appointments, use Chair Math to check a real workday. A planned schedule is not proof of what it will pay.':'Open Chair Math for a normal day. Choose your pay arrangement and enter the actual hours and costs. Keep your current days until you have checked how a change affects what you keep.');
  summary='Make more room in the week without pretending we already know what you can afford to give up.';
  check='Check the hours you worked and what reached your pocket. A shorter week is a goal to test, not an income promise.';
  rule='Keep breaks and realistic appointment times. Five exhausting days squeezed into three is not the goal.';
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
 return 'THE BOOKED AF BREAKDOWN\n\n'+(name?name+', here’s':'Here’s')+' your Breakdown.\n\nYOUR STAGE: '+r.stage+'\n\nYOUR FIRST PRIORITY\n'+r.top.title+'\n\nWHY THIS FIRST\n'+r.intro+'\n\nYOUR THREE MOVES\n'+r.plan.steps.map((s,i)=>(i+1)+'. '+s.title+'\n'+s.body).join('\n\n')+'\n\nAFTER A WEEK\n'+r.plan.check+'\n\nKEEP THIS IN MIND\n'+r.plan.rule+'\n\nThis is a starting point based on your answers. Exact pay and time-off decisions need your actual numbers.\n\nBOOKED AF\nLove your career. Keep your life.\nbookedandfabulous.com';
}
// END SHARED BREAKDOWN CORE
// BOOKED AF email service. No API keys belong in this file.
const questions=[
{id:'stage',title:'Where are you with your book right now?',choices:[['building','BUILDING','I’m starting, rebuilding, or still finding my people.'],['busy','GETTING BUSY','Clients are coming in, but it’s not steady yet.'],['demand','IN DEMAND','My book is pretty full.'],['booked','BOOKED AF','I’m busy. I want the money and the life to match.']]},
{id:'full',title:'How full is your book most weeks?',choices:[['under25','Less than a quarter'],['half','About halfway'],['threequarters','Mostly full'],['full','Packed, or close to it']]},
{id:'days',title:'How many days a week are you behind the chair?',choices:[['0','Not behind the chair yet'],['2','1–2 days'],['3','3 days'],['4','4 days'],['5','5 or more days']]},
{id:'clients',title:'How many clients do you usually see on a workday?',choices:[['0','Not seeing clients yet'],['2','1–2'],['4','3–4'],['6','5–6'],['7','7 or more']]},
{id:'spend',title:'About how much does a normal client pay for services?',choices:[['unknown','I’m not sure'],['75','Under $100'],['150','$100–$199'],['275','$200–$349'],['400','$350 or more']]},
{id:'newclients',title:'How many new clients are finding you in a typical month?',choices:[['0','Basically none'],['2','1–3'],['6','4–8'],['10','9 or more'],['unknown','I have no idea']]},
{id:'returning',title:'After a new client sees you, how often do they come back?',choices:[['low','Not nearly enough'],['some','Some do, some don’t'],['most','Most of them come back'],['almostall','Almost everybody comes back'],['unknown','I honestly don’t know']]},
{id:'income',title:'About how much money comes in from your work in a typical month?',note:'Best guess is fine. Think about what your clients pay for services before your work costs.',choices:[['unknown','I honestly don’t know'],['low','Under $3,000'],['mid','$3,000–$6,999'],['high','$7,000–$11,999'],['veryhigh','$12,000 or more']]},
{id:'costs',title:'After you pay the costs of doing hair, how much of that money actually feels like yours?',choices:[['little','Not much. It disappears fast.'],['some','Some, but less than I think it should be.'],['good','A solid amount.'],['most','Most of it.'],['unknown','I have absolutely no idea']]},
{id:'savings',title:'If work got weird tomorrow, how much breathing room do you have?',choices:[['none','Basically none'],['month','About a month'],['few','A few months'],['solid','I’ve got a solid cushion'],['unknown','I’d rather not think about it']]},
{id:'dayback',title:'If you could work one less day every week and keep your income, would you?',choices:[['yes','IN A HEARTBEAT'],['maybe','MAYBE'],['no','NOPE. I LIKE MY SCHEDULE']]},
{id:'goal',title:'What do you want most from your career right now?',choices:[['clients','More clients in my chair'],['money','More money without cramming in more people'],['return','More clients actually coming back'],['keep','To stop wondering where all the money went'],['time','More life outside the salon'],['stable','To feel financially secure']]},
{id:'visibility',when:a=>a.stage==='building'||a.full==='under25'||a.full==='half'||a.goal==='clients',title:'Where do you think new clients are supposed to find you right now?',choices:[['social','Mostly Instagram / TikTok'],['salon','I’m hoping the salon sends people my way'],['referrals','Mostly referrals / word of mouth'],['search','Google, my website, or local search'],['mix','A few different places'],['none','Honestly? I don’t really have a system']]},
{id:'marketing',when:a=>a.stage==='building'||a.full==='under25'||a.full==='half'||a.goal==='clients',title:'How do you feel about marketing yourself?',choices:[['love','I’m comfortable putting myself out there'],['okay','I can do it if you tell me what works'],['socialbad','Social media is not my thing'],['hate','I hate selling myself'],['lost','I genuinely don’t know what to do']]},
{id:'traffic',when:a=>a.stage==='building'||a.full==='under25'||a.full==='half'||a.goal==='clients',title:'How much help does your salon give you finding new clients?',choices:[['strong','A lot — there’s real traffic and referrals'],['some','Some, but I still need to build my own book'],['little','Very little'],['none','Basically none — I’m on my own'],['nosalon','I’m not in a traditional salon']]},
{id:'network',when:a=>a.stage==='building'||a.full==='under25'||a.full==='half'||a.goal==='clients',title:'What do you already have that could help you get clients?',choices:[['past','Past clients I could reconnect with'],['local','I know local businesses / people'],['portfolio','Good work and photos I can show people'],['models','I can bring in models and get good photos of my work'],['none','I’m basically starting from zero']]},
{id:'urgency',when:a=>a.stage==='building'||a.full==='under25'||a.full==='half'||a.goal==='clients',title:'How fast do you need this book to move?',choices:[['now','I need paying clients now'],['month','I need real movement this month'],['steady','I can build it steadily over a few months']]},
{id:'retentionleak',when:a=>a.returning==='low'||a.returning==='some'||a.goal==='return',title:'When a new client does not come back, what do you think usually happened?',choices:[['consult','I may not be setting up the next visit clearly enough'],['checkout','I get awkward about asking them to book again'],['followup','They leave and I do not really follow up'],['value','I worry the service, experience, or price is not giving them a reason to return'],['unknown','I honestly have no idea']]},
{id:'nextvisit',when:a=>a.returning==='low'||a.returning==='some'||a.goal==='return',title:'Before a client leaves, how specific are you about what happens next?',choices:[['prescribe','I tell them what they need next and when'],['ask','I usually just ask if they want to rebook'],['desk','The front desk handles it'],['rare','I rarely talk about the next appointment']]},
{id:'costleak',when:a=>a.costs==='little'||a.costs==='some'||a.costs==='unknown'||a.goal==='keep'||a.goal==='stable',title:'What do you think you spend the most work money on?',choices:[['space','Commission, rent, or salon fees'],['product','Color, extensions, backbar, and supplies'],['discount','Discounts, comps, redos, or services I give away'],['fees','Card fees, apps, assistants, and all the little charges'],['unknown','I have no clue — that is part of the problem']]},
{id:'tracking',when:a=>a.costs==='little'||a.costs==='some'||a.costs==='unknown'||a.goal==='keep'||a.goal==='stable',title:'Do you know what you keep after paying for work?',choices:[['clear','I know what comes in, what work costs, and what stays mine'],['revenue','I mostly know my sales number'],['bank','I look at my bank account and hope for the best'],['none','I really do not track it']]},
{id:'serviceeconomics',when:a=>a.goal==='money'||((a.full==='full'||a.full==='threequarters')&&(a.spend==='75'||a.spend==='150')),title:'Do you know which appointments leave you with the most money?',choices:[['yes','Yes — I know which services pay me best'],['guess','I have a pretty good guess'],['ticket','I mostly look at the ticket price'],['no','No. I have never broken it down that way']]},
{id:'overrun',when:a=>a.goal==='money'||a.goal==='time'||a.days==='5'||(a.days==='4'&&(a.full==='full'||a.full==='threequarters')),title:'What steals the most time from your workday?',choices:[['gaps','Gaps and awkward holes'],['overrun','Services running longer than planned'],['lowvalue','Work that takes too much time for what it pays'],['squeeze','Squeezing people in because I hate saying no'],['none','My schedule is actually pretty tight']]},
{id:'bodyload',when:a=>a.goal==='time'||a.days==='5'||(a.days==='4'&&(a.full==='full'||a.full==='threequarters')),title:'What does your body say about your current schedule?',choices:[['fine','I feel good — this pace is sustainable'],['tired','I am tired, but functioning'],['pain','I am regularly sore or in pain'],['done','My body is telling me this cannot be the long-term plan']]},
{id:'futurehabit',when:a=>a.goal==='stable'||a.savings==='none'||a.savings==='month'||a.savings==='unknown',title:'When a strong month happens, what usually happens to the extra money?',choices:[['save','Some automatically goes to savings / Future Me'],['catchup','It catches up bills or old expenses'],['spend','It tends to disappear into life'],['random','There is no system — every month is different']]},
{id:'futurefear',when:a=>a.goal==='stable'||a.savings==='none'||a.savings==='month'||a.savings==='unknown',title:'What worries you most about the future?',choices:[['emergency','One slow month or emergency could wreck me'],['timeoff','Taking real time off costs too much'],['retire','I am not building enough for retirement'],['body','I do not know how long my body can keep doing this'],['all','Honestly? A little bit of all of it']]} 
];

function read(answers){
 const a=answers, items=[]; const stage=({building:'BUILDING',busy:'GETTING BUSY',demand:'IN DEMAND',booked:'BOOKED AF'})[a.stage]||'BUILDING';
 const starting=a.days==='0'||a.clients==='0', packed=a.full==='full'||a.full==='threequarters';
 const days=+a.days||0,clients=+a.clients||0,spend=+a.spend||0,estMonth=days&&clients&&spend?days*4.33*clients*spend:0;
 const fill={under25:20,half:50,threequarters:78,full:95}[a.full]||0;
 let s={fill:0,cheap:0,return:0,time:0,money:0,life:0};
 s.fill+=(100-fill)/12;if(a.newclients==='0')s.fill+=4;if(a.newclients==='2')s.fill+=2;if(a.goal==='clients')s.fill+=4;if(starting)s.fill+=6;
 if(packed)s.cheap+=4;if(a.spend==='75')s.cheap+=5;if(a.spend==='150')s.cheap+=3;if(a.goal==='money')s.cheap+=4;if(estMonth&&estMonth<7000&&packed)s.cheap+=3;
 if(a.newclients==='6'||a.newclients==='10')s.return+=3;if(a.returning==='low')s.return+=7;if(a.returning==='some')s.return+=4;if(a.goal==='return')s.return+=5;
 if(days>=5)s.time+=6;else if(days===4&&packed)s.time+=2;if(clients>=7)s.time+=3;if(a.dayback==='yes')s.time+=4;if(a.dayback==='maybe'&&packed)s.time+=1;if(a.goal==='time')s.time+=7; if(!packed&&days<5&&a.goal!=='time')s.time=0;
 if(a.costs==='little')s.money+=7;if(a.costs==='some')s.money+=4;if(a.costs==='unknown')s.money+=3;if(a.savings==='none')s.money+=5;if(a.savings==='month')s.money+=3;if(a.goal==='keep'||a.goal==='stable')s.money+=5;
 if(packed&&(a.returning==='most'||a.returning==='almostall')&&(a.costs==='good'||a.costs==='most'))s.life+=5;if(a.savings==='few'||a.savings==='solid')s.life+=3;if(a.dayback==='yes')s.life+=3;if(a.goal==='time')s.life+=4;
 const defs={
 fill:['GET MORE OF THE RIGHT PEOPLE IN YOUR CHAIR.','Your book has room. That does not mean you are doing something wrong. It means more people need a clear way to find you and book.','Do not try to be everywhere. Pick a few simple ways people can find you: past clients, referrals, local businesses, Google, or social.','Start here: Pick ONE way to reach people today. Example: text 10 happy or past clients and say you are taking new clients for the service you want more of.'],
 cheap:['FIND THE SERVICES THAT ARE NOT PAYING ENOUGH.','A big ticket does not always mean a service is making you good money. Time and product matter too.','Tell us what you charged, how long the service took, and roughly what the product cost. Use Chair Math for each appointment. BOOKED AF will compare the last two for you.','Example: Service A is $400, takes 4 hours, and uses $80 in product. Service B is $250, takes 2 hours, and uses $30. Enter both in Chair Math. It will show which pays more for each hour you worked.'],
 return:['GET MORE CLIENTS TO COME BACK.','A new client is great. A returning client is how your book gets steady.','Before they leave, tell them what they need next and when. Make the next visit part of the service, not a sales pitch.','Example: “Your color will be ready again in about 8 weeks. Let’s grab that spot now so you do not have to think about it later.”'],
 time:['FIND THE HOURS THAT MAKE YOU MONEY.','Not every hour behind the chair is worth the same.','Tell us what you made and how many hours you worked. BOOKED AF will show what each day leaves you when you enter its numbers.','Example: you made $800 in 8 hours. That is $100 an hour on average. But if the first 4 hours made $600 and the last 4 made $200, the last 4 hours may be the problem.'],
 money:['LET’S SEE WHERE YOUR MONEY WENT.','Clients may pay you $10,000 in a month. That does not mean $10,000 was yours.','Tell us what clients paid and what you spent to do the work. BOOKED AF should show you what was left and where the biggest costs were.','Example: Clients paid $10,000. Work cost $4,000. About $6,000 was left before personal taxes and life. Now we know what is worth looking at first.'],
 life:['A FULL BOOK DOES NOT MEAN A GOOD BOOK.','The goal is not to fill every minute. The goal is to make good money and still have a life.','Tell us which services take the most time, which make the most money, and which wear you out. Enter two appointments in Chair Math. It will show which pays more for each hour.','Example: one service makes $400 in 5 hours. Two color clients make $800 in the same 5 hours. We are not automatically dropping anything. We are spotting what deserves a closer look.']
 }
 let ranked=Object.entries(s).sort((x,y)=>y[1]-x[1]); const earlyBook=a.stage==='building'&&(a.full==='under25'||a.full==='half'); if(earlyBook){ranked=ranked.filter(x=>x[0]!=='cheap'&&x[0]!=='life');ranked=[['fill',99],...ranked.filter(x=>x[0]!=='fill')];} if(starting)ranked=[['fill',99],...ranked.filter(x=>x[0]!=='fill')];
 const chosen=[];for(const [id,score] of ranked){if(chosen.length===3)break;const minimum=chosen.length===0?0:4;if(score<=minimum)continue;const d=defs[id];chosen.push({id,title:d[0],short:d[1],body:d[2],action:d[3],score});}
 const top=chosen[0];
 if(top.id==='fill'){
  const v=a.visibility,m=a.marketing,t=a.traffic,n=a.network,u=a.urgency;
  if(v==='social'&&(m==='socialbad'||m==='hate'||m==='lost')){top.title='STOP MAKING SOCIAL MEDIA RESPONSIBLE FOR YOUR RENT.';top.short='Right now, too much of your client-building depends on a kind of marketing you do not enjoy. We need other simple ways for people to find you.';top.body='Start with two things that do not require becoming an influencer: people who already know your work and nearby businesses that already know the kind of clients you want.';top.action='Today: text 10 past or happy clients and ask for one introduction. Then contact 5 nearby businesses that serve the same kind of people.';}
  else if(t==='none'||t==='little'||t==='nosalon'){top.title='YOUR SALON IS A LOCATION. IT IS NOT YOUR MARKETING DEPARTMENT.';top.short='If there is little or no walk-in traffic, waiting inside the salon is not a client-building strategy. Your book needs its own traffic sources.';top.body='Make it easy to find and book you. Reach out to people who know your work, build a few local referral relationships, and keep your booking link easy to find.';top.action='Make a simple list: 10 people who already know you, 10 nearby businesses that could refer clients, and 5 places online where a local client could find you.';}
  else if(v==='referrals'&&n==='past'){top.title='YOUR OLD CLIENT LIST IS AN ASSET YOU ARE NOT USING.';top.short='Before chasing strangers, reach back out to people who already know your work.';top.body='Pick past clients who loved the service you want more of. Send them a personal message instead of a mass blast.';top.action='Pick 15 past clients who loved the work you want more of. Message five a day for three days. Include your booking link and ask for an introduction.';}
  else if(n==='models'||n==='portfolio'){top.title='TURN PROOF INTO A CLIENT MACHINE.';top.short='Great work is not marketing until the right local person sees it, understands what to book, and knows what to do next.';top.body='Use every model or portfolio result as a tiny sales asset: transformation, who it is for, maintenance, starting context, location, and a direct booking action.';top.action='Create one hero service campaign from your strongest result and distribute the same proof through clients, local partners, search/profile pages, and social instead of creating endless new content.';}
  else if(n==='none'){top.title='BORROW TRUST BEFORE YOU BUILD AN AUDIENCE.';top.short='Starting from zero does not mean waiting months for followers. Other local businesses already have the exact people you want to meet.';top.body='Nearby businesses already know people you may want as clients. Build a simple two-way referral relationship with them.';top.action='Find 10 nearby businesses that serve the same kind of client. Contact five today with one simple referral or collaboration idea.';}
  if(u==='now')top.action+=' Because you need clients now, talk directly to people and make it easy to book before spending hours making content.';
 }
 if(top.id==='return'){
  if(a.nextvisit==='ask'||a.nextvisit==='rare'){top.title='STOP ASKING PERMISSION TO HAVE A PLAN.';top.short='Your client may not be rejecting you. They may simply be leaving without a clear professional recommendation for what happens next.';top.body='Booking the next appointment gets easier when you explain what they will need next and when.';top.action='For the next 10 clients, tell them what you recommend next, when to come back, and why. Then see how many book before they leave.';}
  else if(a.retentionleak==='followup'){top.title='THE CLIENT IS NOT GHOSTING YOU IF YOU DISAPPEARED FIRST.';top.short='A client who leaves without booking needs a deliberate second chance to reconnect — not six months of silence.';top.body='Make a simple follow-up plan for clients who leave without booking their next visit.';top.action='Make a list of clients who should have returned but have not. Contact 10 personally with a relevant check-in and an easy booking path.';}
  else if(a.retentionleak==='value'){top.title='SOMETIMES THE NEXT APPOINTMENT IS NOT THE REAL PROBLEM.';top.short='If the result, experience, maintenance expectation, and price do not line up in the client’s head, a perfect checkout script will not save it.';top.body='Look at what the client expected, what they got, and what it costs to keep the result looking good.';top.action='Look at your last five new clients who did not return. Note what they booked, paid, expected, and any feedback. See if the same problem keeps showing up.';}
 }
 if(top.id==='cheap'){
  if(a.serviceeconomics==='ticket'||a.serviceeconomics==='no'){top.title='A BIG TICKET CAN STILL BE A BAD SERVICE.';top.short='A big price can hide a service that takes too long or uses too much product.';top.body='Tell us the price, time, and rough product cost. We should show you what each service actually leaves you.';top.action='Give us 10 recent appointments: what the client paid, how long each took, and roughly what product cost. Enter two appointments in Chair Math. It will show which pays more for each hour.';}
  if(a.overrun==='overrun'){top.action+=' Tell us the time you booked and the time it actually took. BOOKED AF shows the difference.';}
 }
 if(top.id==='money'){
  if(a.tracking==='revenue'||a.tracking==='bank'||a.tracking==='none'){top.title='YOUR BANK BALANCE IS NOT A BUSINESS REPORT.';top.short='If you only know your sales total or bank balance, it is hard to see where the money is going.';top.body='We need three simple numbers: what clients paid, what it cost you to do the work, and what was left.';top.action='Give us one normal month of work costs: rent or commission, product, payroll, fees, software, discounts, redos, and anything else. BOOKED AF should sort them for you.';}
  if(a.costleak==='product')top.action+=' For a product-heavy service, enter the price and product cost in Chair Math. See what stays with you.';
  if(a.costleak==='discount')top.action+=' Total every discount, comp, redo, and free add-on for the month. Invisible generosity still has a price tag.';
 }
 if(top.id==='time'||top.id==='life'){
  if(a.overrun==='gaps'){top.title='YOU MAY NOT NEED FEWER CLIENTS. YOU NEED FEWER DEAD HOURS.';top.short='A five-day schedule with holes can consume more of your life than a tighter four-day schedule producing the same money.';top.body='Before dropping a day, first see whether the appointments can fit into the days you want to keep.';top.action='Show us one normal week. Mark the empty gaps between clients. BOOKED AF should add those hours for you and show where the schedule might tighten up.';}
  else if(a.overrun==='squeeze'){top.title='YOUR SCHEDULE PROBLEM MAY BE A BOUNDARY PROBLEM.';top.short='Squeezing in one more client feels helpful in the moment and quietly teaches the calendar that your time has no edge.';top.body='Leaving yourself some room is part of building a schedule you can actually live with.';top.action='Pick your earliest start, latest finish, and how many squeeze-ins you are willing to take next week. When those spots are gone, offer the next real opening.';}
  if(a.bodyload==='pain'||a.bodyload==='done'){top.body+=' If certain services or hours hurt your body, that matters just as much as the money.';top.action+=' Tell us which services or hours wear you out the most. We should help you decide whether to charge more, do fewer, or move them.';}
 }
 if((a.goal==='stable'||a.savings==='none'||a.savings==='month'||a.savings==='unknown')&&top.id!=='fill'){
  if(a.futurehabit==='random'||a.futurehabit==='spend'){top.short+=' A strong month does not build security if all the extra money disappears.';top.action+=' Pick a small amount or percentage to move to savings when you get paid, instead of waiting to see what is left at the end of the month.';}
  if(a.futurefear==='timeoff')top.action+=' Start a separate Time-Off Fund so a vacation does not require sacrificing the month’s income.';
  if(a.futurefear==='body')top.action+=' Treat reducing physical dependence on the chair as a financial goal, not just a wellness goal.';
 }
 const intro=top.id==='fill'?'You already know you need clients. The useful question is: how are the right people going to find you?':top.short;
 const showTime=chosen.some(x=>x.id==='time'||x.id==='life')||a.goal==='time'; const day=earlyBook?'You are building a book that can give you choices later: what you charge, who you work with, when you work, and how much time belongs to the salon.':showTime?(a.dayback==='yes'?'You said you’d take a day back in a heartbeat. Good. We’re going to treat that as a business goal, not a fantasy.':'You’re open to more room in your week. We’ll look for it without gambling with your income.'):'Get the book more consistent first. Once that happens, you get a lot more say in your money, your schedule, and what you do next.';
 let opportunity=null;
 if(!starting&&days&&clients&&spend){
  const monthlyClients=days*clients*4.33,currentMonthly=monthlyClients*spend; let gain=0,title="",body="",math="";
  if(top.id==="cheap"){const bump=spend<100?20:spend<200?25:spend<350?35:50;gain=monthlyClients*bump;title="YOUR BOOK IS BUSY. YOUR BANK ACCOUNT SHOULD KNOW ABOUT IT.";body="No extra day. No extra client. Here’s what a small bump in what each client spends could do at your current pace.";math=Math.round(monthlyClients)+" clients/month × $"+bump+" more per client";}
  else if(top.id==="fill"){const extra=fill<30?2:fill<60?1:0;if(extra){gain=extra*4.33*spend;title="A few more good clients can make a real difference.";body="Here’s what happens with just "+extra+" additional client"+(extra>1?"s":"")+" per week—not a packed schedule.";math=extra+" extra client"+(extra>1?"s":"")+"/week × 4.33 weeks × $"+spend;}}
  else if(top.id==="return"&&a.newclients!=="0"&&a.newclients!=="unknown"){const n=+a.newclients||0,extra=Math.max(1,Math.round(n*.25));gain=extra*spend;title="Appointment #2 is where this starts paying off.";body="Here’s what happens if just a few more new clients make it to appointment #2—without spending another dollar finding strangers.";math=extra+" additional return visit"+(extra>1?"s":"")+"/month × $"+spend;}
  else if((top.id==="time"||top.id==="life")&&days>=4){gain=0;title="SEE WHAT YOUR DAY PAYS.";body="The short questions above cannot tell us what you keep from a day. Open Chair Math and enter a normal day to see it.";math="Use Chair Math with the pay and costs from a normal day.";}
  else if(top.id==="money"){title="THE BIG SEXY NUMBER ISN’T YOUR PAYCHECK.";body="Before we chase a bigger sales number, let’s find out what the current one actually leaves in your pocket.";math="A rough sales illustration from the ranges you chose: $"+Math.round(currentMonthly).toLocaleString()+"/month before work costs.";}
  if(title)opportunity={title,body,gain:gain>0,monthly:gain>0?"$"+Math.round(gain).toLocaleString():"",annual:gain>0?"$"+Math.round(gain*12).toLocaleString():"",math};
 }
 let fix=null;
 const fixMap={
  fill:{title:"BUILD THREE ROADS TO YOUR CHAIR.",body:"Do not make one app responsible for your paycheck. A healthy client pipeline can come from people you already know, local businesses that already serve your dream client, and one clear offer people can actually book.",first:"BORROW AN AUDIENCE: choose 5 nearby businesses that already serve the kind of client you want — injectors, estheticians, nail artists, Pilates studios, boutiques, photographers — and propose a simple referral partnership.",then:"WORK THE WARM ROOM: personally text 10 happy or past clients and ask for one introduction to someone who would genuinely love the service you want to grow. Then put one specific service offer in front of local people with a dead-simple booking path.",dontTitle:"DON’T MAKE INSTAGRAM YOUR BOSS.",dont:"If you hate Reels, are bad at social, or work in a salon with zero foot traffic, you can still build a clientele. Referrals, local partnerships, reactivation, models, search visibility, neighborhood relationships, and targeted local advertising can all create demand. Social media is one road — not the whole highway."},
  cheap:{title:"FIND THE SERVICE THAT’S ROBBING THE REST OF YOUR DAY.",body:"A service can look profitable because the ticket is high and still be a lousy use of your calendar. Time, product, and what it prevents you from booking matter too.",first:"Use Chair Math for two real appointments. Enter the pay, time, and supplies. BOOKED AF shows which pays more for each hour.",then:"Fix the weakest one before touching the whole menu: raise it, shorten it, change what is included, pair it differently, or stop giving it prime calendar space.",dontTitle:"DON’T DO A BLANKET PRICE INCREASE YET.",dont:"If one or two services are causing the problem, raising everything can punish great clients without fixing the bad math. Fix the weak service economics first."},
  return:{title:"STOP ASKING IF THEY WANT TO REBOOK.",body:"Clients came to you for professional guidance. A vague checkout question makes the next visit feel optional. Give them a maintenance plan instead.",first:"Before the cape comes off, tell the client what you want to do next and when: “Your next visit should be around six weeks so we can…” Then offer to reserve it.",then:"Track the next 10 new clients in three columns: next visit prescribed, appointment reserved, appointment completed. That shows whether the leak is the conversation, booking, or follow-through.",dontTitle:"DON’T BUY MORE EYEBALLS FOR A LEAKY BUCKET.",dont:"If new clients already find you but do not return, more marketing buys you more first dates — not a stronger business. Fix appointment #2 first."},
  time:{title:"WANT A SHORTER WORK WEEK? LET’S MAKE THE NUMBERS WORK.",body:"A four-day income on three days is built by improving what each remaining hour produces — not by cramming five days of exhaustion into three.",first:"Open Chair Math for the day you want back. We will show what it pays each month before you change your schedule.",then:"Use Chair Math on your other days too. We will show which appointments pay less. Change one thing at a time and check your actual pay before taking a day off.",dontTitle:"DON’T COMPRESS CHAOS.",dont:"Working fewer days while keeping every inefficient service, gap, and overrun just creates longer, harder days. Redesign the remaining calendar before shrinking it."},
  money:{title:"FIND THE GAP BETWEEN BUSY AND PAID.",body:"The useful number is not what crossed the register. It is what survived the cost of producing it. That gap tells us where the business is feeding itself instead of you.",first:"Use one normal month. Write down client money in, then group work costs into a few plain-English buckets: space/commission, color and supplies, assistants/payroll, software/fees, and everything else.",then:"Enter your work costs. BOOKED AF will show which cost takes the most and what a small reduction could leave you.",dontTitle:"DON’T GO PENNY-PINCHING FIRST.",dont:"Saving $18 on tiny purchases while a major cost category is eating hundreds is busywork. Fix the expensive leak before the annoying little ones."},
  life:{title:"YOUR NEXT PROMOTION IS A BETTER CALENDAR.",body:"When demand is strong, success is no longer proving you can stay busy. It is deciding what deserves your finite time, body, and attention.",first:"Score one normal week. For each major service/client block, note money, time, physical strain, and whether you want more or less of that work.",then:"Protect the combinations that pay well and feel sustainable. Start moving, repricing, delegating, or eventually releasing the work that consumes prime hours without earning its place.",dontTitle:"DON’T AUTOMATICALLY REFILL EVERY HOLE.",dont:"At this stage, white space can be intentional. A lunch, workout, admin block, or earlier finish is not lost revenue if the remaining calendar is designed to support it."}
 };
 fix=fixMap[top.id]||fixMap.fill;
 const planMap={
 fill:{intro:"You need money now, so this week is about conversations and appointments — not spending seven hours making a Reel twelve people will see.",steps:[
  {id:"p1",day:"1",title:"BORROW SOMEONE ELSE’S AUDIENCE",body:"Make a list of 5 nearby businesses that already have your dream client: injectors, estheticians, nail artists, Pilates studios, boutiques, photographers. Reach out with one simple referral idea that benefits both of you."},
  {id:"p2",day:"2–3",title:"ASK FOR THE INTRODUCTION",body:"Text 10 happy or past clients personally. Do not blast a coupon. Ask each for one introduction to somebody who would genuinely love the service you want more of. Make the handoff easy."},
  {id:"p3",day:"4–6",title:"SELL ONE TRANSFORMATION",body:"Choose one service and one result. Show the before/after or finished work, say exactly who it is for, give them a clear reason to book now, and make the booking path painfully obvious. One offer. One audience. One next step."}],
  checkTitle:"WHAT ACTUALLY PUT SOMEONE IN THE CHAIR?",check:"Track four things: conversations started, qualified inquiries, appointments booked, and where each booking came from. Likes are cute. Appointments pay rent.",rule:"Instagram is optional. Being findable is not. Keep the source that creates paying appointments and stop worshipping the one that only creates activity."},
 cheap:{intro:"Your calendar has suffered enough. This week we find the work taking too much time for too little money.",steps:[
  {id:"p1",day:"1",title:"PULL 10 TICKETS",body:"For a recent appointment, enter the service price and time in Chair Math. Add product cost if you know it."},
  {id:"p2",day:"2–3",title:"FIND THE MONEY SUCK",body:"Try another appointment in Chair Math. We’ll show which one paid less for the time you spent."},
  {id:"p3",day:"4–6",title:"FIX ONE THING",body:"Choose one: adjust a price, tighten timing, improve the service mix, or create an upgrade that actually makes sense for the client."}],
  checkTitle:"What would this change pay?",check:"Enter the new price in Chair Math. We’ll show what changes. Keep the same workdays for now.",rule:"More clients are not the assignment. Better money from the work you already do is."},
 return:{intro:"You already did the hard part: somebody new sat in your chair. This week we make appointment #2 less accidental.",steps:[
  {id:"p1",day:"1",title:"PLAN THE SECOND DATE",body:"Write one normal sentence about when you want to see them again. No script that makes you sound like you joined a cult."},
  {id:"p2",day:"2–5",title:"USE IT FIVE TIMES",body:"With your next five new clients, recommend the next visit and offer to reserve it before checkout."},
  {id:"p3",day:"6",title:"WHO MADE IT TO DATE #2?",body:"Write down who rebooked, who said maybe, and who left without another appointment."}],
  checkTitle:"How many made it to appointment #2?",check:"That number is your starting point. Improve this before paying to pour more strangers into the top of the funnel.",rule:"No new marketing project until you know what happens to the new clients you already earn."},
 time:{intro:"“I want more time” is lovely. This week we put an actual number behind it so it can become a plan.",steps:[
  {id:"p1",day:"1",title:"PICK THE DAY",body:"Choose the workday—or chunk of a day—you would most like back."},
  {id:"p2",day:"2",title:"MEET WHAT THAT DAY PAYS",body:"Open Chair Math and enter a normal day. We’ll show what you would need to replace each month."},
  {id:"p3",day:"3–6",title:"FIND THE REPLACEMENT",body:"We’ll look at the numbers with you. Try one change to your price or schedule, then check what you actually take home."}],
  checkTitle:"Is the number less scary now?",check:"Keep the day for now. Use the number Chair Math shows as your starting point.",rule:"Do not add hours to solve a problem whose entire point is getting your hours back."},
 money:{intro:"This week we stop letting revenue cosplay as income.",steps:[
  {id:"p1",day:"1",title:"PICK ONE REAL MONTH",body:"Use a recent normal month—not your best month and not the apocalypse month."},
  {id:"p2",day:"2–3",title:"THREE NUMBERS",body:"Write down money clients paid, what it cost you to work, and what actually stayed yours."},
  {id:"p3",day:"4–6",title:"FIND THE BIGGEST LEAK",body:"Look for the largest recurring cost or category eating the gap. Start there instead of obsessing over ten tiny expenses."}],
  checkTitle:"What did you actually make?",check:"That number matters more than the impressive sales number. Now you have something real to improve.",rule:"No bragging about gross revenue while your checking account is filing a complaint."},
 life:{intro:"You built the demand. Excellent. Now the business needs to give something back besides carpal tunnel.",steps:[
  {id:"p1",day:"1",title:"CLAIM THE TIME",body:"Choose the workday you would most like back."},
  {id:"p2",day:"2",title:"PUT A NUMBER ON IT",body:"Use Chair Math. Enter a normal day and we’ll show what it pays."},
  {id:"p3",day:"3–6",title:"PROTECT THE BEST WORK",body:"Tell us which appointments you enjoy, how long they take, and what they pay. BOOKED AF shows which work to protect."}],
  checkTitle:"What would your better week look like?",check:"Sketch it. The goal is not an emptier calendar. It is a calendar that pays you and still leaves you a life.",rule:"Stop treating every empty appointment like a personal failure. Space can be part of the plan."}
 };
 const plan=planMap[top.id]||planMap.fill;
 return{stage,top,items:chosen,intro,day,showTime,opportunity,fix,plan};
}
function emailCopy(r,name){
if(r.schema===SHORT_SCHEMA)return shortEmailCopy(r,name);
 const money=r.opportunity?("\n\nTHE MONEY OPPORTUNITY\n"+r.opportunity.title+"\n"+r.opportunity.body+(r.opportunity.gain?"\n"+r.opportunity.monthly+" more per month • "+r.opportunity.annual+" more per year":"")+"\n"+r.opportunity.math):"";
 const week=r.plan?("\n\nYOUR 7-DAY BOOKED AF PLAN\n"+r.plan.steps.map(step=>"DAY "+step.day+" — "+step.title+"\n"+step.body).join("\n\n")+"\n\nDAY 7 — "+r.plan.checkTitle+"\n"+r.plan.check+"\n\nTHE RULE THIS WEEK\n"+r.plan.rule):"";
 return "THE BOOKED AF BREAKDOWN\n\n"+(name?name+", here’s":"Here’s")+" your Breakdown.\n\nYOUR STAGE: "+r.stage+"\n\n"+r.intro+
 "\n\nWHAT I’D FIX FIRST\n"+r.fix.title+"\n"+r.fix.body+"\n\nDO THIS FIRST\n"+r.fix.first+"\n\nTHEN THIS\n"+r.fix.then+
 "\n\nDON’T DO THIS YET\n"+r.fix.dontTitle+"\n"+r.fix.dont+money+week+
 "\n\nThis is a starting point based on your answers, not a promise of income.\n\nBOOKED AF\nLove your career. Keep your life.\nbookedandfabulous.com";
}

const ORIGINS = new Set(['https://bookedandfabulous.com', 'https://www.bookedandfabulous.com']);
const FROM = 'BOOKED AF <hello@bookedandfabulous.com>';
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function validateAnswers(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('answers');
  const answers = {};
  for (const q of questions) {
    if (input[q.id] !== undefined) {
      if (!q.choices.some(choice => choice[0] === input[q.id])) throw new Error('answers');
      answers[q.id] = input[q.id];
    }
  }
  for (const q of questions) {
    if ((!q.when || q.when(answers)) && !answers[q.id]) throw new Error('answers');
  }
  return answers;
}

function emailHTML(title, text) {
  const paragraphs = text.split(/\n\n+/).map(part => {
    const lines = part.split('\n');
    const heading = lines.length > 1 && lines[0] === lines[0].toUpperCase();
    return heading
      ? `<h2 style="margin:28px 0 10px;font-size:15px;letter-spacing:1px;color:#e90076">${esc(lines.shift())}</h2><p style="margin:0 0 18px;line-height:1.7">${lines.map(esc).join('<br>')}</p>`
      : `<p style="margin:0 0 18px;line-height:1.7">${lines.map(esc).join('<br>')}</p>`;
  }).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#eeeeef;font-family:Arial,Helvetica,sans-serif;color:#171719"><div style="display:none;max-height:0;overflow:hidden">${esc(title)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:white"><tr><td align="center" bgcolor="#000000" style="padding:8px 26px;background-color:#000000;background-image:linear-gradient(#000000,#000000);border-bottom:4px solid #ff1686"><a href="https://bookedandfabulous.com" style="display:block;text-decoration:none"><img src="https://bookedandfabulous.com/assets/booked-af-logo.png" width="400" height="200" alt="BOOKED AF — Booked &amp; Fabulous" style="display:block;width:100%;max-width:400px;height:auto;margin:0 auto;border:0;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:24px"></a></td></tr><tr><td style="padding:32px 26px;font-size:16px"><h1 style="margin:0 0 24px;font-size:28px;line-height:1.2">${esc(title)}</h1>${paragraphs}<p style="margin-top:30px"><a href="https://bookedandfabulous.com" style="color:#d00069;font-weight:bold">BACK TO BOOKED AF →</a></p></td></tr><tr><td style="padding:24px 26px;background:#111114;color:#dddddf;font-size:12px;line-height:1.7">BOOKED AF · Booked &amp; Fabulous<br>Love your career. Keep your life.<br><a href="mailto:hello@bookedandfabulous.com" style="color:#ff79b8">hello@bookedandfabulous.com</a><br>You received this email after submitting a request on BOOKED AF.</td></tr></table></td></tr></table></body></html>`;
}

async function limitedJSON(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('body');
  const chunks = []; let total = 0;
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > 16384) { await reader.cancel(); throw new Error('body'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(total); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

const deepDiveUrl = 'https://bookedandfabulous.com/?deepdive=paid';
const welcomeSubject = 'Welcome to BOOKED AF. Your Deep Dive starts now.';
const deepDivePaymentLinkId = 'plink_1UJbGMK8mAQwUniDbDofJPiQ';

async function verifyStripeSignature(body, header, secret) {
  const values = Object.fromEntries((header || '').split(',').map(part => part.trim().split('=', 2)));
  const timestamp = Number(values.t);
  if (!Number.isSafeInteger(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > 300) return false;
  const candidates = (header || '').split(',').map(part => part.trim()).filter(part => part.startsWith('v1=')).map(part => part.slice(3));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign']);
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(timestamp + '.' + body)));
  const expected = [...signature].map(n => n.toString(16).padStart(2, '0')).join('');
  return candidates.some(value => /^[a-f0-9]{64}$/i.test(value) && value.toLowerCase() === expected);
}

async function stripeWelcome(request, env) {
  if (request.method !== 'POST') return new Response('Method not allowed', {status:405});
  if (!env.STRIPE_WEBHOOK_SECRET || !env.RESEND_API_KEY) return new Response('Not configured', {status:503});
  let body;
  try {
    body = await request.text();
    if (body.length > 100000 || !await verifyStripeSignature(body, request.headers.get('Stripe-Signature'), env.STRIPE_WEBHOOK_SECRET)) return new Response('Invalid signature', {status:400});
  } catch { return new Response('Invalid request', {status:400}); }
  let event;
  try { event = JSON.parse(body); } catch { return new Response('Invalid JSON', {status:400}); }
  if (!['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type)) return new Response('Ignored');
  const session = event.data?.object;
  if (session?.payment_status !== 'paid' || session?.payment_link !== deepDivePaymentLinkId || session?.currency !== 'usd' || session?.amount_total !== 4900) return new Response('Ignored');
  const email = session.customer_details?.email || session.customer_email;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return new Response('Missing customer email', {status:422});
  const firstName = String(session.customer_details?.name || '').trim().split(/\s+/)[0].slice(0, 60);
  const greeting = firstName ? 'Hey ' + firstName + ',' : 'Hey,';
  const customerDeepDiveUrl = deepDiveUrl + '&session_id=' + encodeURIComponent(session.id);
  const text = `${greeting}

Welcome to BOOKED AF. You’re officially part of the family.

You’ve already done the first big thing: decided your career should give you more than a full book and tired feet. Now we’ll look at what’s happening in your business and build a 30-day plan you can actually use.

Some changes will help now. Others will give Future You more money, time, and choices. We’re here for both.

START MY DEEP DIVE: ${customerDeepDiveUrl}

Love your career. Keep your life.
Bradley
BOOKED AF`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#eeeeef;font-family:Arial,Helvetica,sans-serif;color:#171719"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#fff"><tr><td align="center" style="padding:8px 26px;background:#000;border-bottom:4px solid #ff1686"><img src="https://bookedandfabulous.com/assets/booked-af-logo.png" width="400" height="200" alt="BOOKED AF" style="display:block;width:100%;max-width:400px;height:auto"></td></tr><tr><td style="padding:32px 26px;font-size:16px;line-height:1.7"><h1 style="font-size:28px;line-height:1.2">${welcomeSubject}</h1><p>${esc(greeting)}</p><p>Welcome to BOOKED AF. You’re officially part of the family.</p><p>You’ve already done the first big thing: decided your career should give you more than a full book and tired feet. Now we’ll look at what’s happening in <em>your</em> business and build a 30-day plan you can actually use.</p><p>Some changes will help now. Others will give Future You more money, time, and choices. We’re here for both.</p><p style="margin:30px 0"><a href="${customerDeepDiveUrl}" style="display:inline-block;background:#ff338e;color:#160510;text-decoration:none;font-weight:bold;padding:16px 24px">START MY DEEP DIVE →</a></p><p>Love your career. Keep your life.<br>Bradley<br>BOOKED AF</p></td></tr><tr><td style="padding:20px 26px;background:#111114;color:#ddd;font-size:12px">You received this email because you purchased the BOOKED AF Deep Dive.<br><a href="mailto:hello@bookedandfabulous.com" style="color:#ff79b8">hello@bookedandfabulous.com</a></td></tr></table></td></tr></table></body></html>`;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':'booked-deep-dive-'+session.id},
      body:JSON.stringify({from:FROM,to:[email],reply_to:'hello@bookedandfabulous.com',subject:welcomeSubject,text,html}),
      signal:AbortSignal.timeout(12000)
    });
    if (!response.ok) return new Response('Email delivery failed', {status:502});
    const result = await response.json();
    return result.id ? new Response('Sent') : new Response('Email delivery failed', {status:502});
  } catch { return new Response('Email delivery failed', {status:502}); }
}

async function verifyCheckout(request, env) {
  const origin = request.headers.get('Origin') || '';
  const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};
  if (ORIGINS.has(origin)) Object.assign(headers, {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, OPTIONS'});
  const reply = (data, status=200) => new Response(JSON.stringify(data), {status,headers});
  if (!ORIGINS.has(origin)) return reply({paid:false},403);
  if (request.method === 'OPTIONS') return new Response(null,{status:204,headers});
  if (request.method !== 'GET') return reply({paid:false},405);
  const sessionId = new URL(request.url).searchParams.get('session_id');
  if (!/^cs_(?:live|test)_[A-Za-z0-9]+$/.test(sessionId||'')) return reply({paid:false},400);
  if (!env.STRIPE_SECRET_KEY) return reply({paid:false,error:'Payment check is unavailable.'},503);
  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(sessionId), {
      headers:{Authorization:'Bearer '+env.STRIPE_SECRET_KEY},
      signal:AbortSignal.timeout(8000)
    });
    if (!response.ok) return reply({paid:false},response.status===404?404:502);
    const session = await response.json();
    return reply({paid:session.status==='complete' && session.payment_status==='paid' && session.payment_link===deepDivePaymentLinkId && session.currency==='usd' && session.amount_total===4900});
  } catch { return reply({paid:false,error:'Payment check is unavailable.'},503); }
}

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname === '/stripe-webhook') return stripeWelcome(request, env);
    if (new URL(request.url).pathname === '/verify-checkout') return verifyCheckout(request, env);
    const origin = request.headers.get('Origin') || '';
    const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};
    if (ORIGINS.has(origin)) Object.assign(headers, {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'});
    const reply = (data, status = 200) => new Response(JSON.stringify(data), {status, headers});
    if (request.method === 'GET') return reply({service:'BOOKED AF email', ready:!!(env.RESEND_API_KEY && env.TURNSTILE_SECRET_KEY), schemas:['legacy',SHORT_SCHEMA]});
    if (!ORIGINS.has(origin)) return reply({success:false}, 403);
    if (request.method === 'OPTIONS') return new Response(null, {status:204, headers});
    if (request.method !== 'POST') return reply({success:false}, 405);
    if (!env.RESEND_API_KEY || !env.TURNSTILE_SECRET_KEY) return reply({success:false, error:'Email setup is not finished.'}, 503);
    if (!request.headers.get('Content-Type')?.startsWith('application/json')) return reply({success:false}, 415);
    let data, answers;
    try {
      data = await limitedJSON(request);
      if (!data || typeof data !== 'object') throw new Error('body');
      if (data.honey) return reply({success:false}, 400);
      if (!['breakdown','founding'].includes(data.type)) throw new Error('type');
      if (typeof data.email !== 'string' || data.email.length > 254 || !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}$/.test(data.email.trim())) throw new Error('email');
      if (typeof data.name !== 'string' || data.name.length > 60 || !/^[\p{L}\p{M} '\u2019-]*$/u.test(data.name)) throw new Error('name');
      if (typeof data.token !== 'string' || !data.token || data.token.length > 2048) throw new Error('token');
      if(data.schema!==undefined&&!['legacy',SHORT_SCHEMA].includes(data.schema))throw new Error('schema');
      answers = data.schema===SHORT_SCHEMA?validateShortAnswers(data.answers):validateAnswers(data.answers);
    } catch { return reply({success:false, error:'Check your details and try again.'}, 400); }
    try {
      const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:data.token,remoteip:request.headers.get('CF-Connecting-IP') || undefined}),
        signal:AbortSignal.timeout(8000)
      });
      if (!verification.ok) return reply({success:false}, 503);
      const verified = await verification.json();
      if (!verified.success || verified.hostname !== new URL(origin).hostname || verified.action !== 'booked_email') return reply({success:false,error:'Please complete the verification again.'}, 403);
      const email = data.email.trim().toLowerCase();
      const name = data.name.trim();
      const result = data.schema===SHORT_SCHEMA?buildShortBreakdown(answers):read(answers);
      const title = data.type === 'breakdown' ? 'Your BOOKED AF Breakdown' : 'You’re on the founding list';
      const text = data.type === 'breakdown' ? emailCopy(result, name) : `${name ? name + ', you’re' : 'You’re'} on the BOOKED AF Deep Dive founding list.\n\nWe’ve received your request for the $49 founding offer. No payment has been taken. We’ll contact you when checkout is ready.\n\nBOOKED AF\nLove your career. Keep your life.`;
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify([email,name,data.type,data.schema||'legacy',answers])));
      const key = 'booked-v3-short-' + [...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
      const response = await fetch('https://api.resend.com/emails', {
        method:'POST', headers:{'Authorization':`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':key},
        body:JSON.stringify({from:FROM,to:[email],bcc:email === 'hello@bookedandfabulous.com' ? undefined : ['hello@bookedandfabulous.com'],reply_to:'hello@bookedandfabulous.com',subject:title,text,html:emailHTML(title,text)}),
        signal:AbortSignal.timeout(12000)
      });
      if (!response.ok) {
        console.error('Email provider returned status', response.status);
        return reply({success:false,error:'Email could not be sent. Please try again shortly.'}, response.status === 429 ? 429 : 502);
      }
      const sent = await response.json();
      if (!sent.id) return reply({success:false}, 502);
      return reply({success:true});
    } catch { return reply({success:false,error:'Email could not be sent. Please try again shortly.'}, 502); }
  }
};
