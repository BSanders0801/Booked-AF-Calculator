// Shared by the website and the self-contained email Worker.
const SHORT_SCHEMA = 'short-v1';
const shortQuestions = [
 {id:'goal',title:'What would you most like to improve right now?',choices:[['clients','More clients in my chair'],['money','More money from the work I already do'],['return','More clients coming back'],['keep','Knowing where my money goes'],['time','A shorter work week'],['stable','Having money saved for slow months and time off']]},
 {id:'full',title:'How busy are you most weeks?',choices:[['notyet','I’m not taking clients yet'],['under25','I have a few clients and lots of openings'],['half','I’m booked about half the time'],['threequarters','I’m busy, with a few openings'],['full','I’m fully booked or close to it']]},
 {id:'days',title:'How many days a week do you currently take appointments?',choices:[['0','I’m not taking appointments yet'],['1','1 day'],['2','2 days'],['3','3 days'],['4','4 days'],['5','5 days'],['6','6–7 days']]},
 {id:'spend',title:'About how much does a client usually pay for one visit?',note:'Include their hair services. Leave out tips and products they take home. Choose the closest answer.',choices:[['notyet','I’m not taking clients yet'],['unknown','I’m not sure'],['75','Under $100'],['150','$100–$199'],['275','$200–$349'],['400','$350 or more']]},
 {id:'returning',title:'How many of your clients come back for another appointment?',choices:[['notyet','I haven’t had clients long enough to know'],['low','Not many come back'],['some','Some do, some don’t'],['most','Most come back'],['almostall','Almost everyone comes back'],['unknown','I don’t know yet']]},
 {id:'costs',note:'Think about what stays yours after the salon’s share and any rent or supplies you pay for. This is before personal bills and taxes.',title:'Do you know how much you keep after paying your work expenses?',choices:[['clear','Yes, and it covers what I need'],['tight','Yes, but I need to keep more'],['rough','I have a rough idea'],['unknown','I don’t know yet']]},
 {id:'visibility',when:a=>a.goal==='clients',title:'How do most of your new clients hear about you?',choices:[['social','Instagram or TikTok'],['salon','Through my salon'],['referrals','Someone recommends me'],['search','Google or my website'],['mix','Several of these bring me new clients'],['none','I’m not getting new clients yet'],['unknown','I’m not sure']]},
 {id:'marketing',when:a=>a.goal==='clients',note:'Choose the closest answer.',title:'What have you tried so far to bring in new clients?',choices:[['social','Posting my work online'],['people','Contacting people I know and asking them to recommend me'],['local','Introducing myself to people and businesses nearby'],['paid','Paying for ads or promotions'],['mix','Several of these, but bookings are still inconsistent'],['none','I haven’t tried any of these yet']]},
 {id:'network',when:a=>a.goal==='clients',note:'Choose the one you would feel most comfortable trying.',title:'Which of these could you do first to help new clients find you?',choices:[['past','Contact current or past clients and ask them to recommend me'],['local','Ask people or businesses I know nearby to recommend me'],['portfolio','Share photos of hair I’ve done, with a link to book'],['models','Offer a free or discounted appointment so I can take photos of the results'],['none','I’m not sure where to start']]},
 {id:'urgency',when:a=>a.goal==='clients',title:'When do you need more clients on your calendar?',choices:[['now','As soon as possible'],['month','Over the next month'],['steady','I can build gradually; it isn’t urgent']]},
 {id:'nextvisit',when:a=>a.goal==='return',title:'Before a client leaves, how do you talk about their next appointment?',choices:[['prescribe','I explain what we should do next and when they should come back'],['ask','I ask if they want to book their next appointment'],['desk','I leave that conversation to the front desk'],['rare','We usually don’t discuss the next visit']]},
 {id:'followup',when:a=>a.goal==='return',title:'If a client leaves without booking again, do they hear from you?',choices:[['personal','I contact them when it’s time for their next visit'],['automatic','My booking system sends them a reminder to book'],['none','I usually wait for them to contact me'],['unknown','I’m not sure what happens']]},
 {id:'paymodel',when:a=>a.goal==='money'||a.goal==='keep',title:'How are you paid for your work?',choices:[['commission','I get a percentage of what my clients pay'],['hourly','I get paid by the hour'],['self','I work for myself and pay my own salon expenses'],['owner','I own a salon'],['mixed','A mix, or I’m not sure yet']]},
 {id:'servicehours',when:a=>a.goal==='money',note:'Count from the client’s arrival until you finish cleaning up. Choose the closest answer.',title:'About how long does one appointment usually take?',choices:[['short','Less than an hour'],['medium','About 1–2 hours'],['long','About 3–4 hours'],['verylong','5 hours or more'],['varies','It varies a lot'],['unknown','I don’t know yet']]},
 {id:'workcosts',when:a=>a.goal==='money',title:'Which of these do you pay for yourself?',choices:[['none','None of these—the salon pays for my supplies and space'],['product','Color, extension hair, or other supplies'],['space','Chair or suite rent'],['both','Both rent and supplies'],['team','The salon’s bills and staff pay'],['unknown','I need to check']]},
 {id:'costleak',when:a=>a.goal==='keep',title:'Where would you like help figuring out what your money goes toward?',choices:[['space','The salon’s share of my sales, rent, or salon fees'],['product','Color, extension hair, and other supplies'],['discount','Discounts, appointments I redo for free, or extras I don’t charge for'],['fees','Booking apps, card fees, and subscriptions'],['team','Staff pay and the salon’s bills'],['unknown','I don’t know where to start']]},
 {id:'weeklyhours',when:a=>a.goal==='time',title:'About how many hours a week do you spend working?',note:'Include appointments, cleanup, ordering supplies, and answering client messages—even at home.',choices:[['under20','Under 20 hours'],['20to30','20–30 hours'],['31to40','31–40 hours'],['over40','More than 40 hours'],['unknown','I’m not sure']]},
 {id:'targetdays',when:a=>a.goal==='time',title:'How many days a week would you like to work?',choices:[['1','1 day'],['2','2 days'],['3','3 days'],['4','4 days'],['5','5 days'],['shorter','The same number of days, but shorter days'],['unknown','I want help figuring that out']]},
 {id:'overrun',when:a=>a.goal==='time',title:'What adds the most time to your workday?',choices:[['gaps','Long gaps between clients'],['overrun','Appointments running late'],['squeeze','Squeezing in clients outside my planned hours'],['messages','Client messages, paperwork, and other work after I leave'],['none','My work usually fits into my planned hours'],['unknown','I’m not sure yet']]},
 {id:'savings',when:a=>a.goal==='stable',note:'Think rent, food, utilities, and other bills you still have to pay. No math needed—choose the closest answer, or “I’m not sure.”',title:'If you had no work income, about how long would your savings cover your bills?',choices:[['none','I don’t have savings for that yet'],['month','About a month'],['few','A few months'],['solid','Six months or more'],['unknown','I’m not sure']]},
 {id:'futurehabit',when:a=>a.goal==='stable',title:'Which best describes how saving money is going for you?',choices:[['catchup','Bills use up what I make'],['spend','I spend what’s left instead of saving it'],['random','My income changes, so I don’t save regularly'],['save','I’m saving regularly already']]},
 {id:'futurefear',when:a=>a.goal==='stable',title:'What would you most like to have money set aside for?',choices:[['emergency','Money for a slow month or an emergency'],['timeoff','Being able to take time off'],['retire','Saving for later in life'],['body','Moving into work that is easier on my body'],['unknown','I need help choosing where to start']]}
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
