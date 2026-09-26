// BEGIN SHARED BREAKDOWN CORE
// Shared by the website and the self-contained email Worker.
const SHORT_SCHEMA = 'short-v4';
const shortQuestions = [
 {id:'worktype',multi:true,note:'Pick everything that sounds like your actual career. One lane, five lanes, no judgment.',title:'WHAT’S YOUR HAIR GAME?',choices:[['color','Color is my thing.'],['cut','Cutting + styling.'],['extensions','Extensions.'],['session','Session / editorial / commercial.'],['events','Bridal + events / on-location.'],['education','Education + beauty brand work.'],['owner','I own or manage a salon.'],['inactive','I’m trained or licensed, but I’m not taking clients right now.'],['other','Something else.']]},
 {id:'primarywork',title:'OKAY, BUT WHAT PAYS THE BILLS?',note:'Pick the lane bringing in the most money right now.',choices:a=>{
   const w=new Set(Array.isArray(a.worktype)?a.worktype:[]);
   const out=[];
   if(w.has('color'))out.push(['chair-color','Color clients.']);
   if(w.has('cut'))out.push(['chair-cut','Cutting + styling clients.']);
   if(w.has('extensions'))out.push(['chair-extensions','Extension clients.']);
   if(w.has('session'))out.push(['session','Session / editorial / commercial jobs.']);
   if(w.has('events'))out.push(['events','Bridal + event / on-location work.']);
   if(w.has('education'))out.push(['education','Education + beauty brand work.']);
   if(w.has('owner'))out.push(['management','Owning or managing a salon.']);
   if(w.has('other'))out.push(['other','Something else.']);
   if(out.length>1)out.push(['mix','It’s a mix. No single lane wins.']);
   out.push(['notearning','Hair isn’t paying me right now.']);
   return out;
 }},
 {id:'goal',title:'ALRIGHT. WHAT NEEDS FIXING?',note:'Pick the thing making your work life harder right now.',choices:a=>{
   const lane=shortLane(a);
   if(lane==='chair')return [['clients','I need more clients in my chair.'],['money','I want to make more without working more.'],['return','I want more clients to actually come back.'],['keep','I’m making money. Where is it all going?'],['time','I love doing hair. I’d also like a life.'],['stable','I need a real safety net.']];
   if(lane==='session')return [['clients','I need more paid jobs coming in.'],['money','I want the jobs I already do to pay better.'],['return','I want the right clients and teams to hire me again.'],['keep','Money comes in. Why does so little stay mine?'],['time','I love the work. I’d also like my life back.'],['stable','I need a real safety net.']];
   if(lane==='events')return [['clients','I need more paid bookings.'],['money','I want each booking to pay better.'],['return','I want more referrals and repeat clients.'],['keep','Money comes in. Why does so little stay mine?'],['time','I want the work without losing every weekend.'],['stable','I need a real safety net.']];
   if(lane==='education')return [['clients','I need more paid education or brand work.'],['money','I want the work I do to pay better.'],['return','I want brands and teams to bring me back.'],['keep','Money comes in. Why does so little stay mine?'],['time','I want the work without giving it my whole life.'],['stable','I need a real safety net.']];
   if(lane==='management')return [['clients','I need more business coming through the door.'],['money','I want the business to make more without eating more of my time.'],['return','I want more clients to come back.'],['keep','The business makes money. Where is it all going?'],['time','I need the business to stop owning my life.'],['stable','I need a real safety net.']];
   return [['clients','I need more paid work coming in.'],['money','I want to make more without working more.'],['return','I want more of the right people to hire me again.'],['keep','Money comes in. Where is it all going?'],['time','I love the work. I’d also like a life.'],['stable','I need a real safety net.']];
 }}, {id:'full',when:a=>shortLane(a)==='chair',title:'HOW FULL IS YOUR BOOK, REALLY?',choices:[['notyet','Basically empty. I’m just getting started.'],['under25','A few clients. Plenty of room.'],['half','About half full.'],['threequarters','Pretty busy, but I’ve got openings.'],['full','Packed. I’m basically booked.']]},
 {id:'days',when:a=>shortLane(a)==='chair',title:'HOW MANY DAYS A WEEK ARE YOU TAKING CLIENTS?',note:'Count the days you’re available for appointments—even if they’re not full yet.',choices:[['0','I’m not taking appointments yet'],['1','1 day'],['2','2 days'],['3','3 days'],['4','4 days'],['5','5 days'],['6','6-7 days']]},
 {id:'workload',when:a=>shortLane(a)!=='chair',title:'HOW FULL IS YOUR WORK CALENDAR MOST MONTHS?',choices:[['notyet','I’m not booking paid work right now.'],['light','I have a lot of open time.'],['half','I’m working about half the time I want to be.'],['busy','I’m busy, with some room.'],['full','I’m as busy as I want to be or close to it.']]},
 {id:'workdays',when:a=>shortLane(a)!=='chair',title:'HOW MANY DAYS A WEEK DOES WORK REALLY TAKE?',note:'Include paid work, travel, prep, shopping, admin, and anything else the job requires.',choices:[['0','I’m not working right now'],['1','1 day'],['2','2 days'],['3','3 days'],['4','4 days'],['5','5 days'],['6','6-7 days'],['varies','It changes constantly.']]},
 {id:'paystyle',when:a=>shortLane(a)!=='chair'&&(a.goal==='money'||a.goal==='keep'),title:'HOW DO YOU USUALLY GET PAID?',multi:true,note:'Choose everything that applies.',choices:[['day','Day rate'],['half','Half-day rate'],['project','Flat fee for a job or project'],['hourly','Hourly'],['salary','Salary'],['commission','Commission or percentage'],['other','It depends or something else']]},
 {id:'paywait',when:a=>shortLane(a)!=='chair'&&(a.goal==='money'||a.goal==='keep'),title:'HOW LONG DOES IT USUALLY TAKE TO ACTUALLY GET PAID?',choices:[['fast','Usually within two weeks'],['month','About a month'],['60','About 1-2 months'],['90','About 2-3 months'],['long','More than 3 months'],['varies','It varies a lot']]},
 {id:'workexpenses',when:a=>shortLane(a)!=='chair'&&(a.goal==='money'||a.goal==='keep'),multi:true,exclusive:['none','unknown'],note:'Choose everything that can come out of your pocket.',title:'WHAT DO YOU END UP PAYING FOR?',choices:[['products','Products and supplies'],['hair','Extension hair, wigs, or hairpieces'],['tools','Tools and kit replacement'],['travel','Travel, Uber, mileage, parking, or baggage'],['team','Assistants or other people on the job'],['fees','Agency, booking, or business fees'],['none','Clients or my employer cover basically everything'],['unknown','I need to look at the real numbers']]},
 {id:'jobsource',when:a=>shortLane(a)!=='chair'&&a.goal==='clients',multi:true,exclusive:['none','unknown'],note:'Choose everything that actually brings paid work.',title:'HOW DOES PAID WORK FIND YOU?',choices:[['agency','An agency or representation'],['repeat','Repeat clients or brands'],['referrals','Referrals and word of mouth'],['social','Social media or my portfolio'],['direct','Brands, producers, planners, or clients contact me directly'],['none','Paid work is not coming in consistently yet'],['unknown','I need to start tracking this']]},
 {id:'outreach',when:a=>shortLane(a)!=='chair'&&a.goal==='clients',multi:true,exclusive:['none'],note:'Choose everything you actually do.',title:'WHAT HAVE YOU TRIED TO GET MORE WORK?',choices:[['agency','Staying in touch with my agency or reps'],['past','Following up with past clients or brands'],['portfolio','Updating or sharing my portfolio'],['network','Networking with people who hire hair teams'],['pitch','Reaching out directly for work'],['none','I haven’t really started yet']]},
 {id:'repeatwork',when:a=>shortLane(a)!=='chair'&&a.goal==='return',title:'ARE THE PEOPLE WHO HIRE YOU COMING BACK?',choices:[['new','I’m still getting started. Too soon to tell.'],['rare','Not often enough'],['some','Some do. Some disappear.'],['most','Most of the right clients hire me again'],['unknown','I haven’t tracked it']]},
 {id:'repeatfollow',when:a=>shortLane(a)!=='chair'&&a.goal==='return',multi:true,exclusive:['none'],note:'Choose everything that usually happens after a job.',title:'AFTER THE JOB, WHAT HAPPENS?',choices:[['thanks','I send a thank-you or follow-up'],['portfolio','I share or update the work when I’m allowed to'],['touch','I stay in touch with the client, producer, planner, or brand'],['agency','My agency handles most of that'],['none','Usually nothing. I wait for the next call']]},
 {id:'sessionagency',when:a=>a.primarywork==='session'&&(a.goal==='money'||a.goal==='keep'),title:'DOES AN AGENCY TAKE A CUT FROM YOUR RATE?',choices:[['yes','Yes'],['sometimes','Sometimes, depending on the job'],['no','No']]},
 {id:'sessionfront',when:a=>a.primarywork==='session'&&(a.goal==='money'||a.goal==='keep'),title:'HOW OFTEN ARE YOU FRONTING MONEY FOR A JOB?',note:'Flights, Uber, meals, baggage, hair, products, assistants, or anything you expect to be reimbursed for.',choices:[['often','A lot'],['sometimes','Sometimes'],['rare','Rarely'],['never','Basically never']]},
 {id:'paymodel',when:a=>shortLane(a)==='chair'&&(a.goal==='money'||a.goal==='keep'),title:"LET’S TALK PAY. HOW DOES YOURS WORK?",choices:[["commission", "I get a percentage of what my clients pay."], ["hourly", "I get paid by the hour."], ["self", "I work for myself. The salon expenses are mine, too."], ["owner", "I own the salon."], ["mixed", "It’s a mix, or I need help sorting it out."]]},
 {id:'hourlytime',when:a=>shortLane(a)==='chair'&&a.goal==='money'&&a.paymodel==='hourly',title:"ARE YOU DOING WORK THAT DOESN’T SHOW UP AS PAID TIME?",choices:[["no", "No. My paid hours match the time I’m working."], ["sometimes", "Sometimes. Messages, setup, cleanup, or other work happens off the clock."], ["often", "Yes. More than I’d like."], ["unknown", "I need to compare my hours with my payslip."]]},
 {id:'spend',when:a=>shortLane(a)==='chair'&&a.goal==='money'&&a.paymodel!=='hourly',title:"WHAT DOES A CLIENT USUALLY SPEND IN YOUR CHAIR?",note:"Just the hair services. Leave out tips and take-home products. Pick the closest amount.",choices:[["notyet", "I’m not taking clients yet."], ["unknown", "Honestly? I need to check."], ["75", "Under $100"], ["150", "$100-$199"], ["275", "$200-$349"], ["400", "$350 or more"]]},
 {id:'returning',when:a=>shortLane(a)==='chair'&&(a.goal==='clients'||a.goal==='return'),title:"THEY CAME ONCE. DID THEY COME BACK?",choices:[["notyet", "I’m still building. Too soon to know."], ["low", "Not really. We need to fix that."], ["some", "Some do. Some vanish into the witness protection program."], ["most", "Most come back."], ["almostall", "Almost everybody comes back."], ["unknown", "No clue. I haven’t tracked it."]]},
 {id:'costs',when:a=>shortLane(a)==='chair'&&(a.goal==='keep'||(a.goal==='money'&&a.paymodel!=='hourly')),note:'After the salon’s share and any rent or supplies you pay for. Before personal bills and taxes.',title:'YOU DID THE HAIR. HOW MUCH OF THE MONEY IS ACTUALLY YOURS?',choices:[['clear','I know what I keep, and it’s enough.'],['tight','I know what I keep. It needs to be more.'],['rough','I have a ballpark idea.'],['unknown','Honestly? I need help figuring that out.']]},
 {id:'visibility',when:a=>shortLane(a)==='chair'&&a.goal==='clients',multi:true,exclusive:['none','unknown'],note:"Pick every source that has brought a real client into your chair. Not where you hope they’re coming from.",title:"HOW ARE THEY ACTUALLY FINDING YOU?",choices:[["social", "Instagram or TikTok."], ["salon", "The salon sends them my way."], ["referrals", "Referrals or word of mouth."], ["search", "Google or my website."], ["none", "New clients aren’t finding me yet."], ["unknown", "Good question. I need to start asking."]]},
 {id:'marketing',when:a=>shortLane(a)==='chair'&&a.goal==='clients',multi:true,exclusive:['none'],note:"Pick everything you’ve actually tried.",title:"WHAT HAVE YOU ALREADY THROWN AT THIS?",choices:[["social", "Posting my work online."], ["people", "Asking clients, friends, or people I know for referrals."], ["local", "Getting out locally and introducing myself."], ["paid", "Paying for ads or promotions."], ["none", "Honestly? Not much yet. I need a first move."]]},
 {id:'network',when:a=>shortLane(a)==='chair'&&a.goal==='clients',note:'Pick the one you would actually do this week.',title:'PICK YOUR MOVE.',choices:a=>{
   const visibility=new Set(Array.isArray(a.visibility)?a.visibility:[]);
   const marketing=new Set(Array.isArray(a.marketing)?a.marketing:[]);
   const out=[];
   if(visibility.has('referrals')||!marketing.has('people'))out.push(['past','Ask happy or past clients for introductions.']);
   if(visibility.has('salon'))out.push(['salon','Ask the salon to help spotlight one service I want more of.']);
   if(visibility.has('social')||!marketing.has('social'))out.push(['portfolio','Share one strong result with a dead-simple way to book.']);
   if(!marketing.has('local'))out.push(['local','Make one real local connection that could send me clients.']);
   if(a.returning==='notyet'||a.full==='notyet'||a.full==='under25')out.push(['models','Book one smart portfolio/model service.']);
   const seen=new Set();const clean=out.filter(([v])=>!seen.has(v)&&seen.add(v)).slice(0,4);
   clean.push(['none','You pick. That’s why I’m here.']);
   return clean;
 }},
 {id:'urgency',when:a=>shortLane(a)==='chair'&&a.goal==='clients',title:"HOW FAST DO WE NEED TO MOVE?",note:"No wrong answer. We just need the truth.",choices:[["now", "Yesterday. My bills are not waiting."], ["month", "I want real movement over the next month."], ["steady", "I’ve got some breathing room. Let’s build this right."]]},
 {id:'nextvisit',when:a=>shortLane(a)==='chair'&&a.goal==='return',title:"GREAT HAIR. NOW, DO YOU TALK ABOUT THEIR NEXT VISIT?",choices:[["prescribe", "Yes. We talk about what’s next and when to come back."], ["ask", "I ask, “Want to book your next appointment?”"], ["desk", "I leave that conversation to the front desk."], ["rare", "Usually not. We say goodbye and hope for the best."]]},
 {id:'followup',when:a=>shortLane(a)==='chair'&&a.goal==='return',multi:true,exclusive:['none','unknown'],note:"Choose all that usually happen.",title:"THEY LEFT WITHOUT REBOOKING. WHAT HAPPENS NEXT?",choices:[["personal", "I reach out when it’s time for their next visit."], ["automatic", "My booking system sends a reminder."], ["desk", "The front desk or salon follows up."], ["none", "Nothing. I wait for them to make the next move."], ["unknown", "Honestly? I’m not sure what happens."]]},
 {id:'servicehours',when:a=>shortLane(a)==='chair'&&a.goal==='money'&&a.paymodel!=='hourly',note:"From the client walking in to the last towel in the hamper. Pick the closest answer.",title:"HOW LONG DOES ONE APPOINTMENT REALLY TAKE?",choices:[["short", "Less than an hour"], ["medium", "About 1-2 hours"], ["long", "About 3-4 hours"], ["verylong", "5 hours or more"], ["varies", "Depends on who’s in the chair and what we’re doing."], ["unknown", "I need to watch the clock next time."]]},
 {id:'workcosts',when:a=>shortLane(a)==='chair'&&a.goal==='money'&&a.paymodel!=='hourly',multi:true,exclusive:['none','unknown'],note:"Choose all that come out of your pocket.",title:"WHICH WORK BILLS HAVE YOUR NAME ON THEM?",choices:[["product", "Color, extension hair, or other supplies."], ["space", "Chair or suite rent."], ["fees", "Card fees, booking apps, or work software."], ["team", "Assistant or team costs."], ["none", "The salon covers my work costs."], ["unknown", "I need to check what I’m actually paying for."]]},
 {id:'costleak',when:a=>shortLane(a)==='chair'&&a.goal==='keep',title:"WHERE SHOULD WE START LOOKING AT WHAT YOU SPEND?",choices:[["space", "The salon’s share, rent, or salon fees."], ["product", "Color, extension hair, and supplies."], ["discount", "Discounts, free redos, and “I won’t charge you for that.”"], ["fees", "Apps, card fees, and subscriptions. They add up."], ["team", "Staff pay and the salon’s bills."], ["unknown", "Honestly? I need help knowing where to look."]]},
 {id:'weeklyhours',when:a=>a.goal==='time',title:'HOW MANY HOURS A WEEK ARE YOU ACTUALLY WORKING?',note:'Count paid work, prep, cleanup, travel, ordering, admin, and messages. Answering hair questions from your couch counts. The pajamas don’t make it time off.',choices:[['under20','Under 20 hours'],['20to30','20-30 hours'],['31to40','31-40 hours'],['over40','More than 40 hours'],['unknown','Honestly? I’ve lost track.']]},
 {id:'targetdays',when:a=>a.goal==='time',title:"YOUR WEEK, YOUR WAY. HOW MANY WORKDAYS?",choices:[["1", "1 day"], ["2", "2 days"], ["3", "3 days"], ["4", "4 days"], ["5", "5 days"], ["shorter", "Same number of days. I just want to get home earlier."], ["unknown", "Help me figure out what could work."]]},
 {id:'overrun',when:a=>shortLane(a)==='chair'&&a.goal==='time',note:'Choose the biggest time thief.',title:'WHICH ONE STEALS THE MOST TIME FROM YOUR WORKDAY?',choices:[['gaps','Big gaps between clients. I’m still here, but not getting paid.'],['overrun','Appointments take longer than I planned.'],['squeeze','I keep saying, “Sure, I can squeeze you in.”'],['messages','Messages and paperwork keep piling up after my last appointment.'],['none','I usually finish when I planned.'],['unknown','I’m not sure where the time goes.']]},
 {id:'timeleak',when:a=>shortLane(a)!=='chair'&&a.goal==='time',note:'Choose the biggest one.',title:'WHAT EATS THE MOST TIME AROUND THE PAID WORK?',choices:[['travel','Travel and getting to the job'],['prep','Prep, shopping, kit work, or fittings'],['waiting','Waiting around before or during the job'],['longday','The paid day regularly turns into a very long day'],['admin','Invoices, email, scheduling, and follow-up'],['none','The unpaid time is pretty manageable'],['unknown','I need to track it']]},
 {id:'savings',when:a=>a.goal==='stable',note:"Rent, food, utilities-the bills don’t take days off. Pick the closest answer. “I’m not sure” is okay.",title:"IF WORK STOPPED, HOW LONG COULD YOUR SAVINGS COVER THE BILLS?",choices:[["none", "I haven’t built up savings yet."], ["month", "About a month"], ["few", "A few months"], ["solid", "Six months or more"], ["unknown", "I’m not sure. I need a clearer picture."]]},
 {id:'futurehabit',when:a=>a.goal==='stable',title:"IS SAVING MONEY HAPPENING, OR STILL ON THE TO-DO LIST?",choices:[["catchup", "The bills get there first."], ["spend", "I mean to save. Then I spend what’s left."], ["random", "My income changes, and my saving does too."], ["save", "I’m already putting money away regularly."]]},
 {id:'futurefear',when:a=>a.goal==='stable',note:"Pick the first job you want that money to do.",title:"WHAT SHOULD THAT SAVED MONEY DO FIRST?",choices:[['emergency','Cover a slow month or an emergency'],['timeoff','Let me take real time off'],['retire','Build money for later in life'],['body','Help me move toward work that is easier on my body'],['unknown','I need help choosing where to start']]}
];
function shortLane(a) {
 const p=String(a&&a.primarywork||'');
 if(p.startsWith('chair-')) return 'chair';
 if(p==='notearning'||p==='mix'||p==='other'||!p) return p||'other';
 return p;
}
function shortChoices(q,answers) {
 return typeof q.choices==='function'?q.choices(answers||{}):q.choices;
}
function chairPrimaryLabel(a) {
 return ({'chair-color':'color clients','chair-cut':'cutting + styling clients','chair-extensions':'extension clients'})[a.primarywork]||'clients behind the chair';
}
function chairSnapshot(a) {
 const days=a.days==='6'?'6-7':a.days;
 const dayText=days&&days!=='0'?(days==='1'?'1 client day':days+' client days'):'no client days';
 const load=({notyet:'You’re starting from scratch.',under25:'There’s plenty of room in the book.',half:'Your book is about half full.',threequarters:'You’re busy, but there is still room.',full:'Your book is packed or close to it.'})[a.full]||'';
 return 'Most of your hair income comes from '+chairPrimaryLabel(a)+'. You have '+dayText+' available each week. '+load;
}
function outsideSnapshot(a) {
 const role=({session:'session / editorial / commercial work',events:'bridal + event work',education:'education + beauty brand work',management:'salon ownership or management',mix:'a mix of hair work',other:'other hair work',notearning:'hair work that is not paying you right now'})[shortLane(a)]||'hair work';
 const load=({notyet:'You’re not booking paid work right now.',light:'You have a lot of open time.',half:'You’re working about half as much as you want.',busy:'You’re busy, with some room.',full:'You’re as busy as you want to be or close to it.'})[a.workload]||'';
 return 'Most of your hair income comes from '+role+'. '+load;
}
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
    if(!values.length||values.some(v=>!shortChoices(q,clean).some(c=>c[0]===v))) throw new Error('answers');
    if((q.exclusive||[]).some(v=>values.includes(v))&&values.length>1) throw new Error('answers');
    clean[q.id]=values;
   } else {
    if(!shortChoices(q,clean).some(c=>c[0]===input[q.id])) throw new Error('answers');
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
 const chair=shortLane(a)==='chair';
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
 const intro=reasons.join(' '), snapshot=outsideSnapshot(a), top={id,title,short:intro,body:summary,action:steps[0].body};
 const plan={intro:summary,steps,checkTitle:'WHAT CHANGED THIS WEEK?',check,rule};
 return {schema:SHORT_SCHEMA,stage,snapshot,top,items:[top],intro,showTime:a.goal==='time',opportunity:null,
  day:'Want to check what one job or workday pays? Enter the real pay, total time, and costs. BOOKED AF does the math.',
  fix:{title,body:intro,first:steps[0].body,then:steps.slice(1).map(s=>s.body).join(' '),dontTitle:'KEEP THIS IN MIND.',dont:rule},plan,nextTool};
}
function buildShortBreakdown(input) {
 const a=validateShortAnswers(input);
 if(shortLane(a)!=='chair') return buildOutsideChairBreakdown(a);
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
  const resources={past:['START WITH PEOPLE WHO KNOW YOUR WORK.','Message five past or happy clients about the service you want to do more of. Include your booking link and ask whether they know someone who would love it.'],local:['USE THE PEOPLE YOU ALREADY KNOW.','Contact 3 local people or businesses you know. Explain who your service is for and ask about a simple way to introduce each other to clients.'],salon:['USE THE SALON TRAFFIC YOU ALREADY HAVE.','Choose one service you want more of and ask the front desk or salon team for one specific way to put that service in front of the right guests this week.'],portfolio:['MAKE IT OBVIOUS HOW TO BOOK YOU.','Choose one clear photo of work you want more of. Add your service, location, starting price, and booking link to the caption. Share it where local clients already find you.'],models:['BOOK ONE PORTFOLIO SERVICE.','Choose one model service you can afford to offer. Agree on any charge and permission for photos first. Use that result to show local people what they can book.'],none:['MAKE YOUR FIRST OFFER EASY TO UNDERSTAND.','Choose one service you can confidently deliver. Write who it is for, where you work, the price, and how to book. Share it with five local people you know; ask for introductions.']};
  if(packed) step('CHOOSE THE WORK YOU WANT MORE OF.','Pick one service or type of appointment you want to fill future openings. Keep your current workdays and decide where those bookings could fit before promoting them.');
  else { const autoMove=visibility.includes('referrals')?'past':visibility.includes('salon')?'salon':visibility.includes('social')?'portfolio':!marketing.includes('local')?'local':'models'; step(...resources[a.network==='none'?autoMove:a.network]); }
  if(marketing.includes('none')) step('TRY ONE WAY TO REACH LOCAL CLIENTS.','Choose one local business, community group that allows business posts, or referral contact. Share the same clear service offer there. Keep the effort small enough to repeat.');
  else if(marketing.length>1) {
   const triedLabels={social:'posting your work online',people:'asking people you know for referrals',local:'introducing yourself locally',paid:'paid ads or promotions'};
   step('KEEP WHAT ACTUALLY BROUGHT SOMEONE IN.','You’ve tried '+marketing.map(v=>triedLabels[v]).filter(Boolean).join(', ')+'. Look at the last few real bookings. Which one actually brought a client in? Put your energy there this week. If none did, stop spending more until the offer or booking path is clearer.');
  } else if(marketing.includes('social')) step('CHECK THE STEP AFTER THE POST.','Look at your last few posts. Can someone tell where you work, what service to book, and how to book it? Fix those details, then share one clear offer with local people.');
  else if(marketing.includes('paid')) step('CHECK WHAT THE PROMOTION BROUGHT IN.','Use your booking records to find any appointments from your last promotion. Before spending more, check whether people asked about booking, booked, and actually arrived.');
  else if(marketing.includes('people')) step('MAKE THE INTRODUCTION EASY.','Give the people you contact one short message and booking link they can forward. Ask for an introduction to someone who wants your particular service.');
  else if(marketing.includes('local')) step('FOLLOW UP WITH ONE LOCAL CONTACT.','Choose one business or person you’ve already approached. Suggest one small, specific referral idea and give them a link they can easily share.');
  step('FOLLOW THE BOOKING.',(a.urgency==='steady'?'Choose a repeatable weekly time for this. ':'Keep the move going this week. ')+'For each new inquiry, note where they found you and whether they booked. Follow up once with anyone who asked and hasn’t booked.');
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
 const intro=reasons.join(' '), snapshot=chairSnapshot(a), top={id,title,short:intro,body:summary,action:steps[0].body};
 const plan={intro:summary,steps,checkTitle:'WHAT CHANGED THIS WEEK?',check,rule};
 return {schema:SHORT_SCHEMA,stage,snapshot,top,items:[top],intro,showTime:a.goal==='time',opportunity:null,
  day:'Want to check what one appointment or workday pays? Enter the real pay, time, and costs. BOOKED AF does the math.',
  fix:{title,body:intro,first:steps[0].body,then:steps.slice(1).map(s=>s.body).join(' '),dontTitle:'KEEP THIS IN MIND.',dont:rule},plan,nextTool};
}
function shortEmailCopy(r,name) {
 return 'THE BOOKED AF BREAKDOWN\n\n'+(name?name+', here’s':'Here’s')+' your Breakdown.\n\nYOUR BOOK RIGHT NOW\n'+r.stage+'\n'+(r.snapshot||'')+'\n\nFIX THIS FIRST\n'+r.top.title+'\n'+r.intro+'\n\nDO THESE 3 THINGS\n'+r.plan.steps.map((s,i)=>(i+1)+'. '+s.title+'\n'+s.body).join('\n\n')+'\n\nWATCH THIS\n'+r.plan.checkTitle+'\n'+r.plan.check+'\n'+r.plan.rule+'\n\nThis is a starting point based on your answers. Exact pay and time-off decisions need your actual numbers.\n\nBradley\nBOOKED AF\nLove your career. Keep your life.\nbookedandfabulous.com';
}

// END SHARED BREAKDOWN CORE
// BOOKED AF email service. No API keys belong in this file.
const questions=[
{id:'stage',title:'What does your book look like right now?',choices:[['building','BUILDING','I’m starting, rebuilding, or still finding my people.'],['busy','GETTING BUSY','Clients are coming in, but it’s not steady yet.'],['demand','IN DEMAND','My book is pretty full.'],['booked','BOOKED AF','I’m busy. I want the money and the life to match.']]},
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
 return "THE BOOKED AF BREAKDOWN\n\n"+(name?name+", here’s":"Here’s")+" your Breakdown.\n\nYOUR BOOK RIGHT NOW\n"+r.stage+"\n\nFIX THIS FIRST\n"+r.fix.title+"\n"+r.fix.body+
 "\n\nDO THESE 3 THINGS\n"+r.plan.steps.map((step,i)=>(i+1)+". "+step.title+"\n"+step.body).join("\n\n")+
 "\n\nWATCH THIS\n"+r.plan.checkTitle+"\n"+r.plan.check+"\n"+r.plan.rule+money+
 "\n\nThis is a starting point based on your answers, not a promise of income.\n\nBradley\nBOOKED AF\nLove your career. Keep your life.\nbookedandfabulous.com";
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


const RECHECK_SUBJECT = '30 days later. Are we rich yet?';
const RECHECK_URL = 'https://bookedandfabulous.com/#breakdown';

function recheckEmailCopy(name) {
  const greeting = name ? 'Hey ' + name + ',' : 'Hey,';
  return `${greeting}

It’s been 30 days since you did your BOOKED AF Breakdown, so it’s time to see what changed.

Maybe you got busier. Maybe you raised a price. Maybe your rebooking got better. Maybe absolutely nothing changed. That’s okay too. We just need to know what’s actually happening.

Come back, plug in your new numbers, and let’s see where you are now compared to 30 days ago.

RECHECK MY NUMBERS: ${RECHECK_URL}

This isn’t a report card. Nobody’s getting graded. We’re just figuring out what’s working, what isn’t, and what you should focus on next.

Bradley
BOOKED AF
Love your career. Keep your life.`;
}

function recheckEmailHTML(name) {
  const greeting = name ? 'Hey ' + esc(name) + ',' : 'Hey,';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#eeeeef;font-family:Arial,Helvetica,sans-serif;color:#171719"><div style="display:none;max-height:0;overflow:hidden">${esc(RECHECK_SUBJECT)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:white"><tr><td align="center" bgcolor="#000000" style="padding:8px 26px;background-color:#000000;background-image:linear-gradient(#000000,#000000);border-bottom:4px solid #ff1686"><a href="https://bookedandfabulous.com" style="display:block;text-decoration:none"><img src="https://bookedandfabulous.com/assets/booked-af-logo.png" width="400" height="200" alt="BOOKED AF — Booked &amp; Fabulous" style="display:block;width:100%;max-width:400px;height:auto;margin:0 auto;border:0"></a></td></tr><tr><td style="padding:32px 26px;font-size:16px;line-height:1.7"><h1 style="margin:0 0 24px;font-size:28px;line-height:1.2">${esc(RECHECK_SUBJECT)}</h1><p>${greeting}</p><p>It’s been 30 days since you did your BOOKED AF Breakdown, so it’s time to see what changed.</p><p>Maybe you got busier. Maybe you raised a price. Maybe your rebooking got better. Maybe absolutely nothing changed. That’s okay too. We just need to know what’s actually happening.</p><p>Come back, plug in your new numbers, and let’s see where you are now compared to 30 days ago.</p><p style="margin:30px 0"><a href="${RECHECK_URL}" style="display:inline-block;background:#ff338e;color:#160510;text-decoration:none;font-weight:bold;padding:16px 24px">RECHECK MY NUMBERS →</a></p><p>This isn’t a report card. Nobody’s getting graded. We’re just figuring out what’s working, what isn’t, and what you should focus on next.</p><p>Bradley<br>BOOKED AF<br>Love your career. Keep your life.</p></td></tr><tr><td style="padding:24px 26px;background:#111114;color:#dddddf;font-size:12px;line-height:1.7">BOOKED AF · Booked &amp; Fabulous<br><a href="mailto:hello@bookedandfabulous.com" style="color:#ff79b8">hello@bookedandfabulous.com</a><br>You received this email because you asked BOOKED AF to send your Breakdown.</td></tr></table></td></tr></table></body></html>`;
}


const RECHECK_60_SUBJECT = '60 days in. What actually stuck?';
const RECHECK_90_SUBJECT = '90 days later. Apparently we do quarterly reviews now.';

function recheck60EmailCopy(name) {
  const greeting = name ? 'Hey ' + name + ',' : 'Hey,';
  return `${greeting}

It’s been 60 days since your first BOOKED AF Breakdown.

By now, something should be getting clearer.

Maybe your book is filling up. Maybe your clients are coming back more often. Maybe you finally raised that price you’ve been thinking about for six months.

Or maybe you tried a few things and discovered exactly what does not work for you. Also useful.

Come back and run your numbers again.

This time, don’t just look at whether they went up or down. Look at what actually changed because of something you did.

CHECK MY 60-DAY NUMBERS: ${RECHECK_URL}

We’re looking for patterns now.

What’s working? What keeps happening? What needs another month? And what can we officially stop wasting our time on?

Bradley
BOOKED AF
Love your career. Keep your life.`;
}

function recheck60EmailHTML(name) {
  const greeting = name ? 'Hey ' + esc(name) + ',' : 'Hey,';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#eeeeef;font-family:Arial,Helvetica,sans-serif;color:#171719"><div style="display:none;max-height:0;overflow:hidden">${esc(RECHECK_60_SUBJECT)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:white"><tr><td align="center" bgcolor="#000000" style="padding:8px 26px;background-color:#000000;background-image:linear-gradient(#000000,#000000);border-bottom:4px solid #ff1686"><a href="https://bookedandfabulous.com" style="display:block;text-decoration:none"><img src="https://bookedandfabulous.com/assets/booked-af-logo.png" width="400" height="200" alt="BOOKED AF — Booked &amp; Fabulous" style="display:block;width:100%;max-width:400px;height:auto;margin:0 auto;border:0"></a></td></tr><tr><td style="padding:32px 26px;font-size:16px;line-height:1.7"><h1 style="margin:0 0 24px;font-size:28px;line-height:1.2">${esc(RECHECK_60_SUBJECT)}</h1><p>${greeting}</p><p>It’s been 60 days since your first BOOKED AF Breakdown.</p><p>By now, something should be getting clearer.</p><p>Maybe your book is filling up. Maybe your clients are coming back more often. Maybe you finally raised that price you’ve been thinking about for six months.</p><p>Or maybe you tried a few things and discovered exactly what does not work for you. Also useful.</p><p>Come back and run your numbers again.</p><p>This time, don’t just look at whether they went up or down. Look at what actually changed because of something you did.</p><p style="margin:30px 0"><a href="${RECHECK_URL}" style="display:inline-block;background:#ff338e;color:#160510;text-decoration:none;font-weight:bold;padding:16px 24px">CHECK MY 60-DAY NUMBERS →</a></p><p>We’re looking for patterns now.</p><p>What’s working? What keeps happening? What needs another month? And what can we officially stop wasting our time on?</p><p>Bradley<br>BOOKED AF<br>Love your career. Keep your life.</p></td></tr><tr><td style="padding:24px 26px;background:#111114;color:#dddddf;font-size:12px;line-height:1.7">BOOKED AF · Booked &amp; Fabulous<br><a href="mailto:hello@bookedandfabulous.com" style="color:#ff79b8">hello@bookedandfabulous.com</a><br>You received this email because you asked BOOKED AF to send your Breakdown.</td></tr></table></td></tr></table></body></html>`;
}

function recheck90EmailCopy(name) {
  const greeting = name ? 'Hey ' + name + ',' : 'Hey,';
  return `${greeting}

It’s been 90 days since you first checked in with BOOKED AF.

Three months is enough time to stop calling everything a fluke.

If you’re busier, making more, keeping more, working differently, or finally getting some breathing room, we want to see it.

And if the numbers haven’t moved the way you hoped, that matters too. It usually means we need a different plan—not that you need to work yourself into the ground.

Come back and run your Breakdown again.

SHOW ME MY 90-DAY NUMBERS: ${RECHECK_URL}

Now we can look at the bigger picture.

Are you busier than you were three months ago? Are you making more? Keeping more? Working differently? Or are we still trying to fix the same thing?

Growth is funny like that.

Bradley
BOOKED AF
Love your career. Keep your life.`;
}

function recheck90EmailHTML(name) {
  const greeting = name ? 'Hey ' + esc(name) + ',' : 'Hey,';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#eeeeef;font-family:Arial,Helvetica,sans-serif;color:#171719"><div style="display:none;max-height:0;overflow:hidden">${esc(RECHECK_90_SUBJECT)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:white"><tr><td align="center" bgcolor="#000000" style="padding:8px 26px;background-color:#000000;background-image:linear-gradient(#000000,#000000);border-bottom:4px solid #ff1686"><a href="https://bookedandfabulous.com" style="display:block;text-decoration:none"><img src="https://bookedandfabulous.com/assets/booked-af-logo.png" width="400" height="200" alt="BOOKED AF — Booked &amp; Fabulous" style="display:block;width:100%;max-width:400px;height:auto;margin:0 auto;border:0"></a></td></tr><tr><td style="padding:32px 26px;font-size:16px;line-height:1.7"><h1 style="margin:0 0 24px;font-size:28px;line-height:1.2">${esc(RECHECK_90_SUBJECT)}</h1><p>${greeting}</p><p>It’s been 90 days since you first checked in with BOOKED AF.</p><p>Three months is enough time to stop calling everything a fluke.</p><p>If you’re busier, making more, keeping more, working differently, or finally getting some breathing room, we want to see it.</p><p>And if the numbers haven’t moved the way you hoped, that matters too. It usually means we need a different plan—not that you need to work yourself into the ground.</p><p>Come back and run your Breakdown again.</p><p style="margin:30px 0"><a href="${RECHECK_URL}" style="display:inline-block;background:#ff338e;color:#160510;text-decoration:none;font-weight:bold;padding:16px 24px">SHOW ME MY 90-DAY NUMBERS →</a></p><p>Now we can look at the bigger picture.</p><p>Are you busier than you were three months ago? Are you making more? Keeping more? Working differently? Or are we still trying to fix the same thing?</p><p>Growth is funny like that.</p><p>Bradley<br>BOOKED AF<br>Love your career. Keep your life.</p></td></tr><tr><td style="padding:24px 26px;background:#111114;color:#dddddf;font-size:12px;line-height:1.7">BOOKED AF · Booked &amp; Fabulous<br><a href="mailto:hello@bookedandfabulous.com" style="color:#ff79b8">hello@bookedandfabulous.com</a><br>You received this email because you asked BOOKED AF to send your Breakdown.</td></tr></table></td></tr></table></body></html>`;
}


const DAY7_SUBJECT = 'It’s been a week. Did we actually do the things?';
const DAY7_URL = 'https://bookedandfabulous.com/#my-plan';

function day7EmailCopy(name) {
  const greeting = name ? 'Hey ' + name + ',' : 'Hey,';
  return `${greeting}

It’s been a week since your BOOKED AF Breakdown.

So… did we actually do the things?

You had three moves. You do not need a perfect week. I just want you to look at what happened.

Did one thing work? Great. Keep it.
Did one thing go nowhere? Also useful.
Did you do none of it because life happened? Welcome to being human.

Come back, open your plan, and finish what still matters.

OPEN MY 7-DAY PLAN: ${DAY7_URL}

This is a business plan, not a guilt trip.

Bradley
BOOKED AF
Love your career. Keep your life.`;
}

function day7EmailHTML(name) {
  const greeting = name ? 'Hey ' + esc(name) + ',' : 'Hey,';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#eeeeef;font-family:Arial,Helvetica,sans-serif;color:#171719"><div style="display:none;max-height:0;overflow:hidden">${esc(DAY7_SUBJECT)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:white"><tr><td align="center" bgcolor="#000000" style="padding:8px 26px;background-color:#000000;background-image:linear-gradient(#000000,#000000);border-bottom:4px solid #ff1686"><a href="https://bookedandfabulous.com" style="display:block;text-decoration:none"><img src="https://bookedandfabulous.com/assets/booked-af-logo.png" width="400" height="200" alt="BOOKED AF — Booked &amp; Fabulous" style="display:block;width:100%;max-width:400px;height:auto;margin:0 auto;border:0"></a></td></tr><tr><td style="padding:32px 26px;font-size:16px;line-height:1.7"><h1 style="margin:0 0 24px;font-size:28px;line-height:1.2">${esc(DAY7_SUBJECT)}</h1><p>${greeting}</p><p>It’s been a week since your BOOKED AF Breakdown.</p><p>So… did we actually do the things?</p><p>You had three moves. You do not need a perfect week. I just want you to look at what happened.</p><p>Did one thing work? Great. Keep it.<br>Did one thing go nowhere? Also useful.<br>Did you do none of it because life happened? Welcome to being human.</p><p>Come back, open your plan, and finish what still matters.</p><p style="margin:30px 0"><a href="${DAY7_URL}" style="display:inline-block;background:#ff338e;color:#160510;text-decoration:none;font-weight:bold;padding:16px 24px">OPEN MY 7-DAY PLAN →</a></p><p>This is a business plan, not a guilt trip.</p><p>Bradley<br>BOOKED AF<br>Love your career. Keep your life.</p></td></tr><tr><td style="padding:24px 26px;background:#111114;color:#dddddf;font-size:12px;line-height:1.7">BOOKED AF · Booked &amp; Fabulous<br><a href="mailto:hello@bookedandfabulous.com" style="color:#ff79b8">hello@bookedandfabulous.com</a><br>You received this because you asked BOOKED AF to send your Breakdown.</td></tr></table></td></tr></table></body></html>`;
}

const SURVEY_SUBJECT = 'You paid us. Did we earn it?';
const SURVEY_URL_BASE = 'https://bookedandfabulous.com/?survey=paid&session_id=';

function surveyEmailCopy(name, sessionId) {
  const greeting = name ? 'Hey ' + name + ',' : 'Hey,';
  const url = SURVEY_URL_BASE + encodeURIComponent(sessionId) + '#survey';
  return `${greeting}

You spent money with us. We’d like to know if we earned it.

You’ve had a little time with BOOKED AF now, so tell us what you really think.

What worked? What was confusing? What do you want more of? What should we do better?

Six questions. About two minutes. We promise this isn’t the SAT.

TELL US WHAT YOU THINK: ${url}

The nice answers are lovely. The useful answers are even better.

Bradley
BOOKED AF
Love your career. Keep your life.`;
}

function surveyEmailHTML(name, sessionId) {
  const greeting = name ? 'Hey ' + esc(name) + ',' : 'Hey,';
  const url = SURVEY_URL_BASE + encodeURIComponent(sessionId) + '#survey';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#eeeeef;font-family:Arial,Helvetica,sans-serif;color:#171719"><div style="display:none;max-height:0;overflow:hidden">${esc(SURVEY_SUBJECT)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:white"><tr><td align="center" bgcolor="#000000" style="padding:8px 26px;background:#000;border-bottom:4px solid #ff1686"><a href="https://bookedandfabulous.com" style="display:block;text-decoration:none"><img src="https://bookedandfabulous.com/assets/booked-af-logo.png" width="400" height="200" alt="BOOKED AF — Booked &amp; Fabulous" style="display:block;width:100%;max-width:400px;height:auto;margin:0 auto;border:0"></a></td></tr><tr><td style="padding:32px 26px;font-size:16px;line-height:1.7"><h1 style="margin:0 0 24px;font-size:28px;line-height:1.2">${esc(SURVEY_SUBJECT)}</h1><p>${greeting}</p><p>You spent money with us. We’d like to know if we earned it.</p><p>You’ve had a little time with BOOKED AF now, so tell us what you really think.</p><p>What worked? What was confusing? What do you want more of? What should we do better?</p><p>Six questions. About two minutes. We promise this isn’t the SAT.</p><p style="margin:30px 0"><a href="${url}" style="display:inline-block;background:#ff338e;color:#160510;text-decoration:none;font-weight:bold;padding:16px 24px">TELL US WHAT YOU THINK →</a></p><p>The nice answers are lovely. The useful answers are even better.</p><p>Bradley<br>BOOKED AF<br>Love your career. Keep your life.</p></td></tr><tr><td style="padding:24px 26px;background:#111114;color:#dddddf;font-size:12px;line-height:1.7">BOOKED AF · Booked &amp; Fabulous<br><a href="mailto:hello@bookedandfabulous.com" style="color:#ff79b8">hello@bookedandfabulous.com</a><br>You received this email because you made a purchase from BOOKED AF.</td></tr></table></td></tr></table></body></html>`;
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


async function queueLongFollowup(env, dueMs, idempotencyKey, kind, email, name) {
  if (!env.FOLLOWUPS || typeof env.FOLLOWUPS.put !== 'function') return false;
  const key = 'followup:' + String(dueMs).padStart(13,'0') + ':' + idempotencyKey;
  await env.FOLLOWUPS.put(key, JSON.stringify({kind,email,name,idempotencyKey}));
  return true;
}

async function processLongFollowups(env) {
  if (!env.FOLLOWUPS || typeof env.FOLLOWUPS.list !== 'function' || !env.RESEND_API_KEY) return;
  let cursor;
  const now = Date.now();
  do {
    const page = await env.FOLLOWUPS.list({prefix:'followup:', cursor});
    for (const item of page.keys || []) {
      const due = Number(item.name.split(':')[1]);
      if (!Number.isFinite(due) || due > now) continue;
      const record = await env.FOLLOWUPS.get(item.name, {type:'json'});
      if (!record) { await env.FOLLOWUPS.delete(item.name); continue; }
      const is60 = record.kind === '60';
      const is90 = record.kind === '90';
      if (!is60 && !is90) { await env.FOLLOWUPS.delete(item.name); continue; }
      const subject = is60 ? RECHECK_60_SUBJECT : RECHECK_90_SUBJECT;
      const text = is60 ? recheck60EmailCopy(record.name) : recheck90EmailCopy(record.name);
      const html = is60 ? recheck60EmailHTML(record.name) : recheck90EmailHTML(record.name);
      const response = await fetch('https://api.resend.com/emails', {
        method:'POST',
        headers:{'Authorization':`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':record.idempotencyKey},
        body:JSON.stringify({from:FROM,to:[record.email],bcc:record.email === 'hello@bookedandfabulous.com' ? undefined : ['hello@bookedandfabulous.com'],reply_to:'hello@bookedandfabulous.com',subject,text,html}),
        signal:AbortSignal.timeout(12000)
      });
      if (response.ok) await env.FOLLOWUPS.delete(item.name);
      else console.error('Long follow-up send returned status', response.status);
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
}

const next30Url = 'https://bookedandfabulous.com/?next30=paid';
const welcomeSubject = 'You’re in. Let’s make some moves.';
const next30PaymentLinkIds = new Set(['plink_1UJsjEK8mAQwUniDH9v9XShT','plink_1UJbGMK8mAQwUniDbDofJPiQ']);

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

async function schedulePurchaseSurvey(env, session, email, firstName) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':'booked-survey-14d-'+session.id},
      body:JSON.stringify({from:FROM,to:[email],reply_to:'hello@bookedandfabulous.com',subject:SURVEY_SUBJECT,text:surveyEmailCopy(firstName,session.id),html:surveyEmailHTML(firstName,session.id),scheduled_at:'in 14 days'}),
      signal:AbortSignal.timeout(12000)
    });
    if (!response.ok) {
      console.error('14-day survey scheduling returned status', response.status);
      return false;
    }
    const result = await response.json();
    return !!result.id;
  } catch {
    console.error('14-day survey scheduling failed');
    return false;
  }
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
  if (session?.payment_status !== 'paid') return new Response('Ignored');
  const email = session.customer_details?.email || session.customer_email;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return new Response('Missing customer email', {status:422});
  const firstName = String(session.customer_details?.name || '').trim().split(/\s+/)[0].slice(0, 60);

  const surveyScheduled = await schedulePurchaseSurvey(env, session, email, firstName);
  const isNext30 = next30PaymentLinkIds.has(session.payment_link) && session.currency === 'usd' && session.amount_total === 4900;
  if (!isNext30) return new Response(surveyScheduled ? 'Survey scheduled' : 'Purchase recorded');

  const greeting = firstName ? 'Hey ' + firstName + ',' : 'Hey,';
  const customerNext30Url = next30Url + '&session_id=' + encodeURIComponent(session.id);
  const text = `${greeting}

Welcome to BOOKED AF. You’re officially part of the family.

You’ve already done the first big thing: decided your career should give you more than a full book and tired feet. Now we’ll look at what’s happening in your business and build a 30-day plan you can actually use.

Some changes will help now. Others will give Future You more money, time, and choices. We’re here for both.

START MY NEXT 30: ${customerNext30Url}

Love your career. Keep your life.
Bradley
BOOKED AF`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#eeeeef;font-family:Arial,Helvetica,sans-serif;color:#171719"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;background:#fff"><tr><td align="center" style="padding:8px 26px;background:#000;border-bottom:4px solid #ff1686"><img src="https://bookedandfabulous.com/assets/booked-af-logo.png" width="400" height="200" alt="BOOKED AF" style="display:block;width:100%;max-width:400px;height:auto"></td></tr><tr><td style="padding:32px 26px;font-size:16px;line-height:1.7"><h1 style="font-size:28px;line-height:1.2">${welcomeSubject}</h1><p>${esc(greeting)}</p><p>Welcome to BOOKED AF. You’re officially part of the family.</p><p>You’ve already done the first big thing: decided your career should give you more than a full book and tired feet. Now we’ll look at what’s happening in <em>your</em> business and build a 30-day plan you can actually use.</p><p>Some changes will help now. Others will give Future You more money, time, and choices. We’re here for both.</p><p style="margin:30px 0"><a href="${customerNext30Url}" style="display:inline-block;background:#ff338e;color:#160510;text-decoration:none;font-weight:bold;padding:16px 24px">START MY NEXT 30 →</a></p><p>Love your career. Keep your life.<br>Bradley<br>BOOKED AF</p></td></tr><tr><td style="padding:20px 26px;background:#111114;color:#ddd;font-size:12px">You received this email because you purchased BOOKED AF: Your Next 30.<br><a href="mailto:hello@bookedandfabulous.com" style="color:#ff79b8">hello@bookedandfabulous.com</a></td></tr></table></td></tr></table></body></html>`;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':'booked-next30-'+session.id},
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
    return reply({paid:session.status==='complete' && session.payment_status==='paid' && next30PaymentLinkIds.has(session.payment_link) && session.currency==='usd' && session.amount_total===4900});
  } catch { return reply({paid:false,error:'Payment check is unavailable.'},503); }
}


async function surveyResponse(request, env) {
  const origin = request.headers.get('Origin') || '';
  const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};
  if (ORIGINS.has(origin)) Object.assign(headers, {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'});
  const reply = (data,status=200)=>new Response(JSON.stringify(data),{status,headers});
  if (!ORIGINS.has(origin)) return reply({success:false},403);
  if (request.method === 'OPTIONS') return new Response(null,{status:204,headers});
  if (request.method !== 'POST') return reply({success:false},405);
  if (!env.STRIPE_SECRET_KEY || !env.RESEND_API_KEY) return reply({success:false,error:'Survey is temporarily unavailable.'},503);
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) return reply({success:false},415);
  let data;
  try { data = await limitedJSON(request); } catch { return reply({success:false,error:'Please check your answers.'},400); }
  const sessionId = String(data?.session_id || '');
  const rating = Number(data?.rating);
  const ease = String(data?.ease || '');
  const useful = String(data?.useful || '');
  const recommend = String(data?.recommend || '');
  const more = Array.isArray(data?.more) ? [...new Set(data.more.map(String))] : [];
  const comments = String(data?.comments || '').trim();
  const allowedEase = new Set(['ridiculously easy','pretty easy','questions','throw my phone']);
  const allowedUseful = new Set(['using it','not yet','a little','not really']);
  const allowedRecommend = new Set(['absolutely','probably','maybe','not yet','no']);
  const allowedMore = new Set(['getting more clients','keeping clients','charging and pricing','making more money','where my money goes','working fewer days','marketing without living on Instagram','scripts and templates','classes and education','something else']);
  if (!/^cs_(?:live|test)_[A-Za-z0-9]+$/.test(sessionId) || !Number.isInteger(rating) || rating < 1 || rating > 5 || !allowedEase.has(ease) || !allowedUseful.has(useful) || !allowedRecommend.has(recommend) || !more.length || more.length > 10 || more.some(v=>!allowedMore.has(v)) || comments.length > 2000) return reply({success:false,error:'Please check your answers.'},400);
  try {
    const stripe = await fetch('https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(sessionId), {headers:{Authorization:'Bearer '+env.STRIPE_SECRET_KEY},signal:AbortSignal.timeout(8000)});
    if (!stripe.ok) return reply({success:false,error:'We could not verify this purchase.'},403);
    const session = await stripe.json();
    if (session.status !== 'complete' || session.payment_status !== 'paid' || session.currency !== 'usd') return reply({success:false,error:'We could not verify this purchase.'},403);
    const customerEmail = session.customer_details?.email || session.customer_email || '';
    const customerName = String(session.customer_details?.name || '').trim();
    const text = `BOOKED AF CLIENT SURVEY

Customer: ${customerName || 'Not provided'}
Email: ${customerEmail || 'Not provided'}
Purchase session: ${sessionId}

1. HOW DID WE DO?
${rating}/5

2. WAS BOOKED AF EASY TO USE?
${ease}

3. DID YOU ACTUALLY GET SOMETHING USEFUL?
${useful}

4. WHAT DO YOU WANT MORE HELP WITH?
${more.join(', ')}

5. WOULD YOU TELL ANOTHER HAIRDRESSER ABOUT BOOKED AF?
${recommend}

6. YOUR TURN.
${comments || 'No additional comments.'}`;
    const send = await fetch('https://api.resend.com/emails', {
      method:'POST',
      headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':'booked-survey-response-'+sessionId},
      body:JSON.stringify({from:FROM,to:['hello@bookedandfabulous.com'],reply_to:customerEmail || 'hello@bookedandfabulous.com',subject:`BOOKED AF survey — ${rating}/5 — ${customerName || customerEmail || 'customer'}`,text}),
      signal:AbortSignal.timeout(12000)
    });
    if (!send.ok) return reply({success:false,error:'We could not save your survey. Please try again.'},502);
    const sent = await send.json();
    return sent.id ? reply({success:true}) : reply({success:false},502);
  } catch { return reply({success:false,error:'We could not save your survey. Please try again.'},502); }
}

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname === '/stripe-webhook') return stripeWelcome(request, env);
    if (new URL(request.url).pathname === '/verify-checkout') return verifyCheckout(request, env);
    if (new URL(request.url).pathname === '/survey') return surveyResponse(request, env);
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
      const text = data.type === 'breakdown' ? emailCopy(result, name) : `${name ? name + ', you’re' : 'You’re'} on the BOOKED AF: Your Next 30 founding list.\n\nWe’ve received your request for the $49 founding offer. No payment has been taken. We’ll contact you when checkout is ready.\n\nBradley\nBOOKED AF\nLove your career. Keep your life.`;
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
      let followupScheduled7 = false;
      let followupScheduled = false;
      let followupQueued60 = false;
      let followupQueued90 = false;
      if (data.type === 'breakdown') {
        try {
          const followup7Response = await fetch('https://api.resend.com/emails', {
            method:'POST',
            headers:{'Authorization':`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':key+'-checkin-7d'},
            body:JSON.stringify({from:FROM,to:[email],bcc:email === 'hello@bookedandfabulous.com' ? undefined : ['hello@bookedandfabulous.com'],reply_to:'hello@bookedandfabulous.com',subject:DAY7_SUBJECT,text:day7EmailCopy(name),html:day7EmailHTML(name),scheduled_at:'in 7 days'}),
            signal:AbortSignal.timeout(12000)
          });
          if (followup7Response.ok) {
            const followup7 = await followup7Response.json();
            followupScheduled7 = !!followup7.id;
          } else console.error('7-day check-in scheduling returned status', followup7Response.status);
        } catch { console.error('7-day check-in scheduling failed'); }
        try {
          const followupResponse = await fetch('https://api.resend.com/emails', {
            method:'POST',
            headers:{'Authorization':`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':key+'-recheck-30d'},
            body:JSON.stringify({from:FROM,to:[email],bcc:email === 'hello@bookedandfabulous.com' ? undefined : ['hello@bookedandfabulous.com'],reply_to:'hello@bookedandfabulous.com',subject:RECHECK_SUBJECT,text:recheckEmailCopy(name),html:recheckEmailHTML(name),scheduled_at:'in 30 days'}),
            signal:AbortSignal.timeout(12000)
          });
          if (followupResponse.ok) {
            const followup = await followupResponse.json();
            followupScheduled = !!followup.id;
          } else console.error('30-day recheck scheduling returned status', followupResponse.status);
        } catch { console.error('30-day recheck scheduling failed'); }
        const now = Date.now();
        try { followupQueued60 = await queueLongFollowup(env, now + 60*24*60*60*1000, key+'-recheck-60d', '60', email, name); } catch { console.error('60-day recheck queue failed'); }
        try { followupQueued90 = await queueLongFollowup(env, now + 90*24*60*60*1000, key+'-recheck-90d', '90', email, name); } catch { console.error('90-day recheck queue failed'); }
      }
      return reply({success:true,followupScheduled7,followupScheduled,followupQueued60,followupQueued90});
    } catch { return reply({success:false,error:'Email could not be sent. Please try again shortly.'}, 502); }
  },
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(processLongFollowups(env));
  }
};
