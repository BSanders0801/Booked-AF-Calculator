// Shared by the website and the self-contained email Worker.
const SHORT_SCHEMA = 'short-v5';
const professionalQuestions = [
 {id:'worktype',multi:true,note:'Pick everything that sounds like your actual career. One lane, five lanes, no judgment.',title:'WHAT’S YOUR HAIR GAME?',choices:[['color','Color is my thing.'],['cut','Cutting + styling.'],['extensions','Extensions.'],['session','Session / editorial / commercial.'],['events','Bridal + events / on-location.'],['education','Education + beauty brand work.'],['owner','I own or manage a salon.'],['inactive','I’m trained or licensed, but I’m not taking clients right now.'],['other','Something else.']]},
 {id:'leadershiprole',when:a=>Array.isArray(a.worktype)&&a.worktype.includes('owner'),title:'ARE YOU THE OWNER OR THE MANAGER?',note:'Pick one. Running the salon and owning it are different jobs.',choices:[['owner','I own the salon.'],['manager','I manage the salon, but I don’t own it.']]},
 {id:'primarywork',when:a=>{const w=Array.isArray(a.worktype)?a.worktype:[];const active=w.filter(x=>x!=='inactive');return active.length>1||(w.includes('inactive')&&active.length>0);},title:'OKAY, BUT WHAT PAYS THE BILLS?',note:'Pick what brings in the most money. Not earning from hair yet? Say that.',choices:a=>{
   const w=new Set(Array.isArray(a.worktype)?a.worktype:[]);
   const out=[];
   if(w.has('color'))out.push(['chair-color','Color clients.']);
   if(w.has('cut'))out.push(['chair-cut','Cutting + styling clients.']);
   if(w.has('extensions'))out.push(['chair-extensions','Extension clients.']);
   if(w.has('session'))out.push(['session','Session / editorial / commercial jobs.']);
   if(w.has('events'))out.push(['events','Bridal + event / on-location work.']);
   if(w.has('education'))out.push(['education','Education + beauty brand work.']);
   if(w.has('owner'))out.push(['management',a.leadershiprole==='manager'?'Managing a salon.':'Owning a salon.']);
   if(w.has('other'))out.push(['other','Something else.']);
   if(out.length>1)out.push(['mix','It’s a mix. No single lane wins.']);
   out.push(['notearning','Hair isn’t paying me right now.']);
   return out;
 }},
 {id:'full',when:a=>shortLane(a)==='chair',title:'HOW FULL IS YOUR BOOK, REALLY?',choices:[['notyet','Basically empty. I’m just getting started.'],['under25','A few clients. Plenty of room.'],['half','About half full.'],['threequarters','Pretty busy, but I’ve got openings.'],['full','Packed. I’m basically booked.']]},
 {id:'days',when:a=>shortLane(a)==='chair',title:'HOW MANY DAYS A WEEK ARE YOU TAKING CLIENTS?',note:'Count the days you offer appointments, even if they are not full yet.',choices:[['0','I’m not taking appointments yet'],['1','1 day'],['2','2 days'],['3','3 days'],['4','4 days'],['5','5 days'],['6','6-7 days']]},
 {id:'workload',when:a=>shortLane(a)!=='chair',title:'HOW FULL IS YOUR WORK CALENDAR MOST MONTHS?',choices:[['notyet','I’m not booking paid work right now.'],['light','I have a lot of open time.'],['half','I’m working about half the time I want to be.'],['busy','I’m busy, with some room.'],['full','I’m as busy as I want to be or close to it.']]},
 {id:'goal',multi:true,title:'ALRIGHT. WHAT NEEDS FIXING?',note:'Pick everything that feels true right now.',choices:a=>{
   const lane=shortLane(a);
   if(lane==='chair')return [['clients','I need more clients in my chair.'],['money','I want to make more without working more.'],['return','I want more clients to actually come back.'],['keep','I’m making money. Where is it all going?'],['time','I love doing hair. I’d also like a life.'],['stable','I need a real safety net.']];
   if(lane==='session')return [['clients','I need more paid jobs coming in.'],['money','I want the jobs I already do to pay better.'],['return','I want the right clients and teams to hire me again.'],['keep','Money comes in. Why does so little stay mine?'],['time','I love the work. I’d also like my life back.'],['stable','I need a real safety net.']];
   if(lane==='events')return [['clients','I need more paid bookings.'],['money','I want each booking to pay better.'],['return','I want more referrals and repeat clients.'],['keep','Money comes in. Why does so little stay mine?'],['time','I want the work without losing every weekend.'],['stable','I need a real safety net.']];
   if(lane==='education')return [['clients','I need more paid education or brand work.'],['money','I want the work I do to pay better.'],['return','I want brands and teams to bring me back.'],['keep','Money comes in. Why does so little stay mine?'],['time','I want the work without giving it my whole life.'],['stable','I need a real safety net.']];
   if(lane==='owner')return [['clients','I need more business coming through the door.'],['money','I want the business to make more without eating more of my time.'],['return','I want more clients to come back.'],['keep','The business makes money. Where is it all going?'],['time','I need the business to stop owning my life.'],['stable','I need a real safety net.']];
   if(lane==='manager')return [['clients','I need more business coming through the door.'],['money','I want my role to pay better for what I’m responsible for.'],['return','I want more clients to come back.'],['keep','I need a clearer grip on the numbers I’m responsible for.'],['time','I need this job to stop following me home.'],['stable','I need a real safety net.']];
   return [['clients','I need more paid work coming in.'],['money','I want to make more without working more.'],['return','I want more of the right people to hire me again.'],['keep','Money comes in. Where is it all going?'],['time','I love the work. I’d also like a life.'],['stable','I need a real safety net.']];
 }},
 {id:'goalpriority',when:a=>Array.isArray(a.goal)&&a.goal.length>1,title:'WHICH ONE DO WE FIX FIRST?',note:'Pick one to start with. The others still count.',choices:a=>{
   const picked=new Set(a.goal);
   const goalQuestion=shortQuestions.find(q=>q.id==='goal');
   return shortChoices(goalQuestion,a).filter(([value])=>picked.has(value));
 }},
 {id:'workdays',when:a=>shortLane(a)!=='chair'&&shortFocusGoal(a)==='time',title:'HOW MANY DAYS A WEEK DOES WORK REALLY TAKE?',note:'Include paid work, travel, prep, shopping, admin, and anything else the job requires.',choices:[['0','I’m not working right now'],['1','1 day'],['2','2 days'],['3','3 days'],['4','4 days'],['5','5 days'],['6','6-7 days'],['varies','It changes constantly.']]},
 {id:'paywait',when:a=>!['chair','owner','manager'].includes(shortLane(a))&&(shortFocusGoal(a)==='money'||shortFocusGoal(a)==='keep'),title:'HOW LONG DOES IT USUALLY TAKE TO ACTUALLY GET PAID?',choices:[['fast','Within 2 weeks'],['month','More than 2 weeks, up to 1 month'],['60','More than 1 month, up to 2 months'],['90','More than 2 months, up to 3 months'],['long','More than 3 months'],['varies','It varies a lot']]},
 {id:'workexpenses',when:a=>shortLane(a)!=='chair'&&(shortFocusGoal(a)==='money'||shortFocusGoal(a)==='keep'),multi:true,exclusive:['none','unknown'],note:'Choose everything that can come out of your pocket.',title:'WHAT DO YOU END UP PAYING FOR?',choices:[['products','Products and supplies'],['hair','Extension hair, wigs, or hairpieces'],['tools','Tools and kit replacement'],['travel','Travel, Uber, mileage, parking, or baggage'],['team','Assistants or other people on the job'],['fees','Agency, booking, or business fees'],['none','Clients or my employer cover basically everything'],['unknown','I need to look at the real numbers']]},
 {id:'jobsource',when:a=>shortLane(a)!=='chair'&&shortFocusGoal(a)==='clients',multi:true,exclusive:['none','unknown'],note:'Choose everything that actually brings paid work.',title:'HOW DOES PAID WORK FIND YOU?',choices:[['agency','An agency or representation'],['repeat','Repeat clients or brands'],['referrals','Referrals and word of mouth'],['social','Social media or my portfolio'],['direct','Brands, producers, planners, or clients contact me directly'],['none','Paid work is not coming in consistently yet'],['unknown','I need to start tracking this']]},
 {id:'outreach',when:a=>shortLane(a)!=='chair'&&shortFocusGoal(a)==='clients',multi:true,exclusive:['none'],note:'Choose everything you actually do.',title:'WHAT HAVE YOU TRIED TO GET MORE WORK?',choices:[['agency','Staying in touch with my agency or reps'],['past','Following up with past clients or brands'],['portfolio','Updating or sharing my portfolio'],['network','Networking with people who hire hair teams'],['pitch','Reaching out directly for work'],['none','I haven’t really started yet']]},
 {id:'repeatwork',when:a=>shortLane(a)!=='chair'&&shortFocusGoal(a)==='return',title:'ARE THE PEOPLE WHO HIRE YOU COMING BACK?',choices:[['new','I’m still getting started. Too soon to tell.'],['rare','Not often enough'],['some','Some do. Some disappear.'],['most','Most of the right clients hire me again'],['unknown','I haven’t tracked it']]},
 {id:'repeatfollow',when:a=>shortLane(a)!=='chair'&&shortFocusGoal(a)==='return',multi:true,exclusive:['none'],note:'Choose everything that usually happens after a job.',title:'AFTER THE JOB, WHAT HAPPENS?',choices:[['thanks','I send a thank-you or follow-up'],['portfolio','I share or update the work when I’m allowed to'],['touch','I stay in touch with the client, producer, planner, or brand'],['agency','My agency handles most of that'],['none','Usually nothing. I wait for the next call']]},
 {id:'sessionagency',when:a=>a.primarywork==='session'&&(shortFocusGoal(a)==='money'||shortFocusGoal(a)==='keep'),title:'DOES AN AGENCY TAKE A CUT FROM YOUR RATE?',choices:[['yes','Yes'],['sometimes','Sometimes, depending on the job'],['no','No']]},
 {id:'sessionfront',when:a=>a.primarywork==='session'&&(shortFocusGoal(a)==='money'||shortFocusGoal(a)==='keep'),title:'HOW OFTEN ARE YOU FRONTING MONEY FOR A JOB?',note:'Flights, Uber, meals, baggage, hair, products, assistants, or anything you expect to be reimbursed for.',choices:[['often','A lot'],['sometimes','Sometimes'],['rare','Rarely'],['never','Basically never']]},
 {id:'paymodel',when:a=>shortLane(a)==='chair'&&(shortFocusGoal(a)==='money'||shortFocusGoal(a)==='keep'),title:"LET’S TALK PAY. HOW DOES YOURS WORK?",choices:[["commission", "I get a percentage of what my clients pay."], ["hourly", "I get paid by the hour."], ["self", "I work for myself. The salon expenses are mine, too."], ["owner", "I own the salon."], ["mixed", "It’s a mix, or I need help sorting it out."]]},
 {id:'hourlytime',when:a=>shortLane(a)==='chair'&&shortFocusGoal(a)==='money'&&a.paymodel==='hourly',title:"ARE YOU DOING WORK THAT DOESN’T SHOW UP AS PAID TIME?",choices:[["no", "No. My paid hours match the time I’m working."], ["sometimes", "Sometimes. Messages, setup, cleanup, or other work happens off the clock."], ["often", "Yes. More than I’d like."], ["unknown", "I need to check my hours against my pay."]]},
 {id:'spend',when:a=>shortLane(a)==='chair'&&shortFocusGoal(a)==='money'&&a.paymodel!=='hourly',title:"WHAT DOES A CLIENT USUALLY SPEND IN YOUR CHAIR?",note:"Just the hair services. Leave out tips and take-home products. Pick the closest amount.",choices:[["notyet", "I’m not taking clients yet."], ["unknown", "Honestly? I need to check."], ["75", "Under $100"], ["150", "$100-$199"], ["275", "$200-$349"], ["400", "$350 or more"]]},
 {id:'returning',when:a=>shortLane(a)==='chair'&&(shortFocusGoal(a)==='clients'||shortFocusGoal(a)==='return'),title:"THEY CAME ONCE. DID THEY COME BACK?",choices:[["notyet", "I’m still building. Too soon to know."], ["low", "Not really. We need to fix that."], ["some", "Some do. Some vanish into the witness protection program."], ["most", "Most come back."], ["almostall", "Almost everybody comes back."], ["unknown", "No clue. I haven’t tracked it."]]},
 {id:'costs',when:a=>shortLane(a)==='chair'&&(shortFocusGoal(a)==='keep'||(shortFocusGoal(a)==='money'&&a.paymodel!=='hourly')),note:'After the salon’s share and your work bills. Before personal bills and taxes. Pick one.',title:'DO YOU KNOW WHAT YOU KEEP AFTER WORK COSTS?',choices:[['clear','I know what I keep, and it’s enough.'],['tight','I know what I keep. It needs to be more.'],['rough','I have a ballpark idea.'],['unknown','Honestly? I need help figuring that out.']]},
 {id:'visibility',when:a=>shortLane(a)==='chair'&&shortFocusGoal(a)==='clients',multi:true,exclusive:['none','unknown'],note:"Pick every source that has brought you a paying client.",title:"HOW ARE THEY ACTUALLY FINDING YOU?",choices:[["social", "Instagram or TikTok."], ["salon", "The salon sends them my way."], ["referrals", "Referrals or word of mouth."], ["search", "Google or my website."], ["none", "New clients aren’t finding me yet."], ["unknown", "Good question. I need to start asking."]]},
 {id:'marketing',when:a=>shortLane(a)==='chair'&&shortFocusGoal(a)==='clients',multi:true,exclusive:['none'],note:"Pick everything you’ve actually tried.",title:"WHAT HAVE YOU TRIED TO FILL YOUR BOOK?",choices:[["social", "Posting my work online."], ["people", "Asking clients, friends, or people I know for referrals."], ["local", "Getting out locally and introducing myself."], ["paid", "Paying for ads or promotions."], ["none", "Honestly? Not much yet. I need a first move."]]},
 {id:'network',when:a=>shortLane(a)==='chair'&&shortFocusGoal(a)==='clients',note:'Pick the one you would actually do this week.',title:'PICK YOUR MOVE.',choices:a=>{
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
 {id:'urgency',when:a=>shortLane(a)==='chair'&&shortFocusGoal(a)==='clients',title:"HOW FAST DO WE NEED TO MOVE?",note:"No wrong answer. We just need the truth.",choices:[["now", "Yesterday. My bills are not waiting."], ["month", "I want real movement over the next month."], ["steady", "I’ve got some breathing room. Let’s build this right."]]},
 {id:'nextvisit',when:a=>shortLane(a)==='chair'&&shortFocusGoal(a)==='return',title:"GREAT HAIR. NOW, DO YOU TALK ABOUT THEIR NEXT VISIT?",choices:[["prescribe", "Yes. We talk about what’s next and when to come back."], ["ask", "I ask, “Want to book your next appointment?”"], ["desk", "I leave that conversation to the front desk."], ["rare", "Usually not. We say goodbye and hope for the best."]]},
 {id:'followup',when:a=>shortLane(a)==='chair'&&shortFocusGoal(a)==='return',multi:true,exclusive:['none','unknown'],note:"Choose all that usually happen.",title:"THEY LEFT WITHOUT REBOOKING. WHAT HAPPENS NEXT?",choices:[["personal", "I reach out when it’s time for their next visit."], ["automatic", "My booking system sends a reminder."], ["desk", "The front desk or salon follows up."], ["none", "Nothing. I wait for them to make the next move."], ["unknown", "Honestly? I’m not sure what happens."]]},
 {id:'servicehours',type:'service-time',when:a=>shortLane(a)==='chair'&&shortFocusGoal(a)==='money'&&a.paymodel!=='hourly',note:"From the client walking in to the last towel in the hamper. Pick the closest answer.",title:"HOW LONG DOES ONE APPOINTMENT REALLY TAKE?",choices:[]},
 {id:'workcosts',when:a=>shortLane(a)==='chair'&&shortFocusGoal(a)==='money'&&a.paymodel!=='hourly',multi:true,exclusive:['none','unknown'],note:"Choose all that come out of your pocket.",title:"WHICH WORK BILLS HAVE YOUR NAME ON THEM?",choices:[["product", "Color, extension hair, or other supplies."], ["space", "Chair or suite rent."], ["fees", "Card fees, booking apps, or work software."], ["team", "Assistant or team costs."], ["none", "The salon covers my work costs."], ["unknown", "I need to check what I’m actually paying for."]]},
 {id:'costleak',note:'Pick one to check first. Not sure? We can start there, too.',when:a=>shortLane(a)==='chair'&&shortFocusGoal(a)==='keep',title:"WHERE SHOULD WE START LOOKING AT WHAT YOU SPEND?",choices:[["space", "The salon’s share, rent, or salon fees."], ["product", "Color, extension hair, and supplies."], ["discount", "Discounts, free redos, and “I won’t charge you for that.”"], ["fees", "Apps, card fees, and subscriptions. They add up."], ["team", "Staff pay and the salon’s bills."], ["unknown", "Honestly? I need help knowing where to look."]]},
 {id:'weeklyhours',when:a=>shortFocusGoal(a)==='time',title:'HOW MANY HOURS A WEEK ARE YOU ACTUALLY WORKING?',note:'Count clients, prep, cleanup, travel, and admin. Hair messages from your couch count, too.',choices:[['under20','Under 20 hours'],['20to30','20-30 hours'],['31to40','31-40 hours'],['over40','More than 40 hours'],['unknown','Honestly? I’ve lost track.']]},
 {id:'targetdays',when:a=>shortFocusGoal(a)==='time',title:"HOW MANY DAYS WOULD YOU LIKE TO WORK?",choices:[["1", "1 day"], ["2", "2 days"], ["3", "3 days"], ["4", "4 days"], ["5", "5 days"], ["shorter", "Same number of days. I just want to get home earlier."], ["unknown", "Help me figure out what could work."]]},
 {id:'overrun',when:a=>shortLane(a)==='chair'&&shortFocusGoal(a)==='time',note:'Choose the biggest time thief.',title:'WHICH ONE STEALS THE MOST TIME FROM YOUR WORKDAY?',choices:[['gaps','Big gaps between clients. I’m still here, but not getting paid.'],['overrun','Appointments take longer than I planned.'],['squeeze','I keep saying, “Sure, I can squeeze you in.”'],['messages','Messages and paperwork keep piling up after my last appointment.'],['none','I usually finish when I planned.'],['unknown','I’m not sure where the time goes.']]},
 {id:'timeleak',when:a=>shortLane(a)!=='chair'&&shortFocusGoal(a)==='time',note:'Choose the biggest one.',title:'WHAT EATS THE MOST TIME AROUND THE PAID WORK?',choices:[['travel','Travel and getting to the job'],['prep','Prep, shopping, kit work, or fittings'],['waiting','Waiting around before or during the job'],['longday','The paid day regularly turns into a very long day'],['admin','Invoices, email, scheduling, and follow-up'],['none','The unpaid time is pretty manageable'],['unknown','I need to track it']]},
 {id:'savings',when:a=>shortFocusGoal(a)==='stable',note:"Rent, food, and bills that keep coming. Pick the closest answer.",title:"IF WORK STOPPED, HOW LONG COULD YOUR SAVINGS COVER THE BILLS?",choices:[["none", "I haven’t built up savings yet."], ["month", "Less than 2 months"], ["few", "2 to under 6 months"], ["solid", "6 months or more"], ["unknown", "I’m not sure. I need a clearer picture."]]},
 {id:'futurehabit',when:a=>shortFocusGoal(a)==='stable',title:"IS SAVING MONEY HAPPENING, OR STILL ON THE TO-DO LIST?",choices:[["catchup", "The bills get there first."], ["spend", "I mean to save. Then I spend what’s left."], ["random", "My income changes, and my saving does too."], ["save", "I’m already putting money away regularly."]]},
 {id:'futurefear',when:a=>shortFocusGoal(a)==='stable',note:"Pick the first job you want that money to do.",title:"WHAT SHOULD THAT SAVED MONEY DO FIRST?",choices:[['emergency','Cover a slow month or an emergency'],['timeoff','Let me take real time off'],['retire','Build money for later in life'],['body','Help me move toward work that is easier on my body'],['unknown','I need help choosing where to start']]}
];
// School is a career stage, never an income lane. Old saved professional
// answers remain readable; every new Breakdown starts with careerstage.
const careerStageQuestion = {id:'careerstage', when:a=>a.careerstage!==undefined||!a.worktype, title:'WHERE ARE YOU IN YOUR HAIR CAREER?', choices:[
 ['school','I’m still in school for hair.'],
 ['building','I’m licensed and building or rebuilding.'],
 ['working','I’m already working behind the chair.'],
 ['broader','My career goes beyond the chair, or mixes several kinds of work.'],
 ['considering','Thinking about getting into hair.']
]};
function isStudent(a){return ['school','considering'].includes(a?.careerstage);}
const studentQuestions = [
 {id:'studentinterest',multi:true,exclusive:['exploring'],title:'WHAT KIND OF HAIR WORK INTERESTS YOU?',note:'Pick all that fit. You’re choosing what to explore, not signing a lifetime contract.',choices:[['color','Color.'],['cut','Cutting + styling.'],['extensions','Extensions.'],['session','Session / editorial.'],['events','Bridal + events.'],['education','Education + brand work.'],['exploring','I’m still figuring that out.']]},
 {id:'graduation',title:'HOW CLOSE ARE YOU TO FINISHING SCHOOL?',choices:[['soon','About 3 months or less.'],['middle','About 4-6 months.'],['early','More than 6 months.'],['unknown','My finish date isn’t clear yet.']]},
 {id:'practice',title:'ARE YOU WORKING ON CLINIC CLIENTS OR MODELS YET?',choices:[['regular','Yes, regularly.'],['some','A few so far.'],['notyet','Not yet.']]},
 {id:'direction',title:'WHAT DO YOU THINK COMES AFTER GRADUATION?',choices:[['employee','A salon job or assistant role with training.'],['rental','Renting a chair or suite.'],['freelance','Session, bridal, or freelance work.'],['unsure','I haven’t figured that out yet.']]},
 {id:'readiness',title:'WHAT FEELS LEAST PREPARED?',note:'Choose the one you want help with first.',choices:[['salon','Knowing which first job is actually right for me.'],['clients','Finding my first clients or models.'],['consultation','Agreeing on the service before I start.'],['rebooking','Talking about their next appointment.'],['money','Understanding what I’ll actually get paid.'],['boundaries','Saying no or explaining what I can offer.']]},
 {id:'salonevidence',when:a=>a.readiness==='salon'||a.direction==='rental',title:'WHAT HAVE YOU ACTUALLY CHECKED SO FAR?',choices:[['compared','I’ve compared training, pay, costs, and how clients find me.'],['visited','I’ve visited or interviewed, but those details aren’t clear.'],['social','Mostly photos, social media, or what people have told me.'],['none','I haven’t checked yet.']]},
 {id:'habitevidence',when:a=>!['salon'].includes(a.readiness),title:a=>'',choices:[]}
];
// This question follows the selected concern and asks for evidence, not confidence.
studentQuestions[studentQuestions.length-1]={id:'habitevidence',when:a=>a.readiness!=='salon',title:'WHAT DOES THAT LOOK LIKE RIGHT NOW?',choices:a=>({
 clients:[['planned','I have a school-approved way to invite people and book them.'],['social','I post my work, but don’t have a clear booking step.'],['none','I haven’t invited anyone yet.']],
 consultation:[['planned','We agree on the result, time, maintenance, and price before starting.'],['some','We cover some of that, but not consistently.'],['none','I need a simple way to practice this.']],
 rebooking:[['planned','I explain what comes next and when.'],['some','I ask if they want to book, without a specific recommendation.'],['none','I haven’t practiced that conversation.']],
 money:[['planned','I can explain the pay, work costs, and what is still before taxes.'],['some','I know the sales number or percentage, but not what it leaves me.'],['none','I haven’t looked at an actual pay example.']],
 boundaries:[['planned','I explain my limits and offer a clear next step.'],['some','I say yes and figure it out afterward.'],['none','I haven’t practiced the conversation.']]
}[a.readiness]||[])};
const shortQuestions=[careerStageQuestion,
 ...studentQuestions.map(q=>({...q,when:a=>isStudent(a)&&!(a.careerstage==='considering'&&['graduation','practice'].includes(q.id))&&(!q.when||q.when(a))})),
 ...professionalQuestions.map(q=>({...q,when:a=>!isStudent(a)&&!(a.careerstage==='considering'&&['graduation','practice'].includes(q.id))&&(!q.when||q.when(a))}))];
const FIRST90_PRODUCT={id:'first90',title:'BOOKED AF: FIRST 90',price:29,currency:'usd',status:'coming-soon'};

function cleanServiceTime(value) {
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const service=typeof value.service==='string'?value.service.trim():'';
 const hours=value.hours,minutes=value.minutes;
 if(!service||service.length>100||!Number.isInteger(hours)||!Number.isInteger(minutes)||hours<0||minutes<0||minutes>59||hours*60+minutes<=0||hours*60+minutes>1440)return null;
 return {service,hours,minutes};
}

function shortFocusGoal(a) {
 const priority=String(a&&a.goalpriority||'');
 if(priority) return priority;
 const goals=Array.isArray(a&&a.goal)?a.goal:[a&&a.goal];
 return String(goals.find(Boolean)||'');
}
function shortInferredPrimaryWork(a) {
 const explicit=String(a&&a.primarywork||'');
 if(explicit) return explicit;
 const worktype=Array.isArray(a&&a.worktype)?a.worktype:[];
 const active=worktype.filter(x=>x!=='inactive');
 if(worktype.includes('inactive')&&active.length>0) return '';
 if(active.length===0&&worktype.includes('inactive')) return 'notearning';
 if(active.length!==1) return '';
 return ({color:'chair-color',cut:'chair-cut',extensions:'chair-extensions',session:'session',events:'events',education:'education',owner:'management',other:'other'})[active[0]]||'';
}
function shortLane(a) {
 if(isStudent(a))return 'student';
 const p=shortInferredPrimaryWork(a);
 const leadership=String(a&&a.leadershiprole||'');
 if(p==='management') return leadership==='manager'?'manager':'owner';
 if(p.startsWith('chair-')) return 'chair';
 if(p==='notearning'||p==='mix'||p==='other'||!p) return p||'other';
 return p;
}
function shortChoices(q,answers) {
 q=shortQuestionCopy(q,answers||{});
 return typeof q.choices==='function'?q.choices(answers||{}):q.choices;
}
function chairPrimaryLabel(a) {
 return ({'chair-color':'color clients','chair-cut':'cutting + styling clients','chair-extensions':'extension clients'})[shortInferredPrimaryWork(a)]||'clients behind the chair';
}
function chairSnapshot(a) {
 const days=a.days==='6'?'6-7':a.days;
 const dayText=days&&days!=='0'?(days==='1'?'1 client day':days+' client days'):'no client days';
 const load=({notyet:'You’re starting from scratch.',under25:'There’s plenty of room in the book.',half:'Your book is about half full.',threequarters:'You’re busy, but there is still room.',full:'Your book is packed or close to it.'})[a.full]||'';
 return 'Most of your hair income comes from '+chairPrimaryLabel(a)+'. You have '+dayText+' available each week. '+load;
}
function outsideSnapshot(a) {
 const role=({session:'session / editorial / commercial work',events:'bridal + event work',education:'education + beauty brand work',owner:'salon ownership',manager:'salon management',management:'salon leadership',mix:'a mix of hair work',other:'other hair work',notearning:'hair work that is not paying you right now'})[shortLane(a)]||'hair work';
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
  if(q.when&&!q.when({...input,...clean}))continue;
  if(input[q.id]!==undefined) {
   if(q.type==='service-time') {
    clean[q.id]=cleanServiceTime(input[q.id]);
    if(!clean[q.id])throw new Error('answers');
   } else if(q.multi) {
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
 if(a.careerstage==='considering')return {key:'considering',label:'EXPLORING A HAIR CAREER'};
 if(isStudent(a))return {key:'school',label:'IN SCHOOL'};
 const chair=shortLane(a)==='chair';
 const stopped=chair?a.days==='0':a.workdays==='0'||a.workload==='notyet';
 const load=chair?a.full:a.workload;
 const key=stopped?'building':chair?({under25:'building',half:'busy',threequarters:'demand',full:'booked'})[load]||'building':({light:'building',half:'busy',busy:'demand',full:'booked'})[load]||'building';
 return {key,label:({building:'BUILDING',busy:'GETTING BUSY',demand:'IN DEMAND',booked:'BOOKED AF'})[key]};
}
// Public output is an explicit allowlist: never serialize internal plans or calculations.
function publicBreakdown(r) { if(r.publicCopy)return r.publicCopy;
 const student=r.audience==='student';
 const id=student?r.category:String(r.top?.id||'').replace(/^short-/, '');
 const topics={
  fill:['ROOM IN THE BOOK.','An open calendar can make every quiet week feel personal. Visibility and reliable demand are different things.'],
  clients:['ROOM TO BUILD.','Being good at the work and having people ready to book are different challenges.'],
  cheap:['A BIG TICKET ISN’T THE WHOLE STORY.','Busy appointments can still leave disappointing income. The price on the menu never tells the whole story.'],
  money:['BUSY AND WELL PAID ARE DIFFERENT THINGS.','Sales, pay and money left over can tell very different stories about the same career.'],
  keep:['MONEY IN. MONEY LEFT.','A stronger sales month does not always feel like a stronger paycheck. Work costs can explain part of that gap.'],
  return:['THE SECOND VISIT MATTERS.','New clients bring opportunity. Repeat visits bring consistency. A busy first appointment is only part of the picture.'],
  rebooking:['THE SECOND VISIT MATTERS.','A great first visit and a dependable return are different parts of a lasting client relationship.'],
  time:['A FULL CALENDAR CAN COST TOO MUCH.','A career can look successful while taking more time and energy than you want to give it.'],
  life:['SUCCESS SHOULD LEAVE ROOM FOR YOU.','A full book does not automatically mean the career fits the life you want.'],
  salon:['THE FIRST SALON SHAPES THE START.','A beautiful room and a supportive place to learn are not always the same thing.'],
  consultation:['GOOD WORK STARTS WITH CLEAR EXPECTATIONS.','Unclear expectations can turn a technically good service into a disappointing experience.'],
  boundaries:['A GOOD CAREER NEEDS LIMITS.','Saying yes to everything can cost confidence, time and the quality of the work.']
 };
 const topic=topics[id]||['YOUR CAREER DESERVES A CLOSER LOOK.','Clients, money, time and the life around the work do not always improve together.'];
 return {student,stage:r.stage,title:topic[0],body:topic[1],
  offer:student?'FIRST 90 is in development. Join the optional updates list to hear when it is ready. There is nothing to buy yet.':'YOUR NEXT 30 turns your answers into a four-week plan, with scripts, practical tools and a way to check what changed. $49 once.',
  url:student?'https://bookedandfabulous.com/#first-90':'https://bookedandfabulous.com/#deep-dive'};
}
function freeActionTips(p) {
 const title=String(p.title||'').toUpperCase(), stage=String(p.stage||'').toUpperCase();
 if(p.student)return [
  'Take two salon interviews. Ask each: “Who trains me, how often, and how do you know I’m ready for clients?” A pretty salon without a training plan is just expensive wallpaper.',
  'Choose one finished service and document the consultation, formula or technique, result and what you would do differently. That is a portfolio case study, not another random photo.',
  'Compare the two salons on supervision, actual paid opportunities and client-building support. Pick the stronger learning environment—not the prettier Instagram account.'
 ];
 if(/SECOND VISIT/.test(title))return [
  'Choose one service clients should maintain regularly. At consultation, name its realistic return window and explain what happens if they wait longer.',
  'Use this at checkout: “To keep this result looking right, I’d see you again in about [interval]. I have [date] or [date]. Which works?” Do not pretend the interval is identical for every guest.',
  'For the next five eligible clients, record how many leave with a return date. If they decline, record why—timing, price, or uncertainty. Fix the objection you actually hear.'
 ];
 if(/ROOM IN THE BOOK|ROOM TO BUILD/.test(title))return [
  'Pick ONE service you want to book more of this week. Build a specific client-facing offer: who it suits, the result, realistic starting price and two genuine openings. A discount is not the strategy.',
  'Use a real client result with permission. Caption framework: “Want [specific result] without [common frustration]? I have [two real openings] in [area]. Message [booking instruction] for a consultation and appointment.” Adapt the promise to work you can deliver.',
  'For seven days, answer qualified inquiries with two actual appointment options and a clear price expectation. Count inquiries, appointments offered and confirmed bookings. If inquiries arrive but nobody books, investigate the objection—not your follower count.'
 ];
 if(/MONEY|TICKET|PAID|MONEY IN/.test(title))return [
  'Take two services you perform often. Calculate what you KEEP after direct product costs and salon commission or rent allocation—not what the client pays.',
  'Divide each service’s remaining money by its total chair time, including processing overlap and cleanup. Example: $120 left over 3 hours is $40 per hour; $95 left over 90 minutes is about $63 per hour.',
  'Choose ONE underperforming service and test a change: tighter booking time, better add-on structure where appropriate, or a carefully justified price adjustment. Compare the next three appointments before declaring victory.'
 ];
 if(/TIME|LIFE|LIMITS|SUCCESS SHOULD LEAVE ROOM|FULL CALENDAR/.test(title))return [
  'Choose the one recurring appointment type or exception most responsible for extending your days. Name the real cost in hours, not just the annoyance.',
  'Write a boundary clients can understand: “My last appointment for [service] starts at [time] so I can give it the time it needs.” Apply it when offering new times; honor existing commitments.',
  'Protect one specific block of personal time next week. Track whether revenue changes before cutting more hours. Freedom is useful only if the math works.'
 ];
 if(/GOOD WORK STARTS WITH CLEAR EXPECTATIONS/.test(title))return [
  'For your next consultation, ask for one inspiration photo AND one example of what they do not want. Agree on maintenance and what can safely happen today.',
  'Say: “Here’s what we can achieve in this appointment, what would take another visit, and the price range before we start.” Get agreement before mixing color or beginning the service.',
  'After three appointments, note whether the consultation prevented a surprise, redo or pricing misunderstanding. Tighten the question that clients keep finding confusing.'
 ];
 if(/THE FIRST SALON/.test(title))return [
  'Ask two prospective salons for the exact training schedule, commission or hourly terms, and how new clients are allocated. “We’re like a family” is not an answer.',
  'Talk with a newer team member about the last month: how many clients they received and whether paid education actually happened.',
  'Compare both offers on expected take-home pay, mentorship and realistic opportunity. Get the important terms in writing.'
 ];
 if(stage==='BOOKED AF'||stage==='IN DEMAND')return [
  'Take your three most-booked services and rank them by money left after costs per chair hour. Busy is not the same as profitable.',
  'Look for one appointment type that consistently runs long or breaks your preferred schedule. Decide whether the timing, service structure or price needs to change.',
  'Test ONE adjustment on the next three appropriate bookings, without springing surprise prices on existing clients. Compare hourly return and the time you got back.'
 ];
 return [
  'Choose the exact service you want more clients for and identify who it is for; “everyone who needs hair” is not a target market.',
  'Show a real example of that service and offer two genuine appointment options with clear location and starting price.',
  'Track the next five qualified conversations: what they requested, the price expectation and whether they booked. Use the most common objection to decide the next move.'
 ];
}
function publicBreakdownEmail(r,name) {
 const p=publicBreakdown(r);
 return 'THE BOOKED AF BREAKDOWN\n\n'+(name?name+', here’s':'Here’s')+' your Breakdown.\n\nYOUR CAREER RIGHT NOW\n'+p.stage+'\n\nWHAT MAY BE GETTING IN THE WAY\n'+p.title+'\n'+p.body+'\n\nHere is one practical play to test against the problem your answers highlighted. Results depend on your circumstances.\n\nHERE’S THE MOVE\n'+freeActionTips(p).map((t,i)=>(i+1)+'. '+t).join('\n')+'\n\n'+p.offer+'\n'+p.url+'\n\nBradley\nBOOKED AF';
}
function shortEmailCopy(r,name) { return publicBreakdownEmail(r,name); }




// Approved question wording; answer keys remain stable for saved Breakdowns.
const approvedFree = {"careerstage": {"title": "Where are you in your hair career?", "labels": ["In school. Taking it one mannequin at a time.", "Licensed and building—or rebuilding—my clientele.", "My clientele is established. I’m ready for more from my career.", "Beyond the chair, or doing a bit of everything.", "Thinking about getting into hair."], "note": ""}, "studentinterest": {"title": "What kind of work can you see yourself doing?", "labels": ["Color.", "Cutting and styling.", "Extensions.", "Editorial and commercial work.", "Bridal and events.", "Education and beauty brand work.", "Ask me after a few more classes."], "note": "Pick all that apply. You’re allowed to change your mind."}, "graduation": {"title": "How much school do you have left?", "labels": ["3 months or less. Nearly there.", "About 4–6 months.", "More than 6 months. Still in it.", "Good question. My finish date keeps moving."], "note": ""}, "practice": {"title": "Have you worked on actual people yet?", "labels": ["Yes. Regularly.", "A few. Building up to it.", "Not yet. Still mannequin territory."], "note": ""}, "direction": {"title": "What’s the plan after graduation?", "labels": ["A salon job where I can keep learning.", "Rent a chair or suite and work for myself.", "Freelance work—shoots, weddings, or events.", "Get through graduation. Then figure it out."], "note": ""}, "readiness": {"title": "What do you feel least ready for?", "labels": ["Choosing a salon that’s actually right for me.", "Getting people in my chair.", "Talking through the service before I start.", "Getting clients to book their next visit.", "Understanding what I’ll actually get paid.", "Saying no without a ten-minute apology."], "note": "Pick what you want help with first."}, "salonevidence": {"title": "What do you know about the places you’re considering?", "labels": ["I’ve checked the training, pay, costs, and how I’d get clients.", "I’ve visited or interviewed, but I still need those answers.", "They look good on Instagram. That’s most of my research.", "I haven’t started looking yet."], "note": ""}, "worktype": {"title": "What do you do in the hair world?", "labels": ["Color.", "Cutting and styling.", "Extensions.", "Editorial, commercial, or session work.", "Bridal, events, or on-location work.", "Education or beauty brand work.", "Own or manage a salon.", "I’m trained or licensed, but not taking clients right now.", "Something else."], "note": "Pick everything that applies. One job title rarely covers it."}, "leadershiprole": {"title": "Do you own the salon or manage it?", "labels": ["I own it.", "I manage it. My name isn’t on the lease."], "note": ""}, "primarywork": {"title": "You do a few things. Which one brings in the most money?", "labels": null, "note": ""}, "full": {"title": "How full is your book, really?", "labels": ["Pretty empty. I’m getting started.", "A few clients. Plenty of openings.", "About half full.", "Busy, but there’s room.", "Full, or close to it."], "note": ""}, "days": {"title": "How many days a week can clients book with you?", "labels": ["I’m not taking appointments yet.", "1 day.", "2 days.", "3 days.", "4 days.", "5 days.", "6–7 days."], "note": "Count the days you offer appointments—even if nobody’s booked yet."}, "workload": {"title": "Are you getting enough paid work?", "labels": ["None right now.", "Some. I need more.", "About half as much as I’d like.", "Almost. I have room for a few more jobs.", "Yes. I don’t need to add more."], "note": ""}, "workdays": {"title": "How many days a week are you working, including the stuff nobody pays you for?", "labels": ["I’m not working right now.", "1 day.", "2 days.", "3 days.", "4 days.", "5 days.", "6–7 days.", "It changes every week."], "note": "Count prep, travel, supply runs, and admin."}, "goal": {"title": "Alright. What needs to change?", "labels": null, "note": "Pick everything that applies."}, "goalpriority": {"title": "We’re not fixing everything by Friday. Where should we start?", "labels": null, "note": "Choose one of the goals you just selected. The others still count."}, "paywait": {"title": "The work’s done. How long are you waiting for the money?", "labels": ["2 weeks or less.", "More than 2 weeks, up to a month.", "More than 1 month, up to 2 months.", "More than 2 months, up to 3 months.", "More than 3 months.", "Depends on who’s paying me."], "note": ""}, "workexpenses": {"title": "What comes out of your pocket to do the job?", "labels": ["Products and supplies.", "Extension hair, wigs, or hairpieces.", "Tools and replacing what wears out.", "Travel, parking, rides, and baggage fees.", "Assistants or other people working with me.", "Agency, booking, or business fees.", "Almost nothing. The client or employer covers it.", "I need to look. Those little charges add up."], "note": "Pick all that apply."}, "jobsource": {"title": "Where is your paid work actually coming from?", "labels": ["My agent or rep.", "Clients or brands hiring me again.", "Referrals and word of mouth.", "Social media or my portfolio.", "Brands, producers, planners, or clients reaching out directly.", "It’s not coming in consistently yet.", "I need to start tracking that."], "note": "Pick all that apply. Bookings, not likes."}, "outreach": {"title": "What are you doing to get more paid work?", "labels": ["Staying in touch with my agent or rep.", "Following up with people who’ve hired me before.", "Updating and sharing my work.", "Getting to know the people who hire hair teams.", "Reaching out and asking for the job.", "Thinking about it. Haven’t done much yet."], "note": "Pick all that apply."}, "repeatwork": {"title": "Once someone hires you, do they hire you again?", "labels": ["I’m new. Too soon to tell.", "Not often enough.", "Some do. Some disappear.", "Most of the people I want to work with hire me again.", "I haven’t tracked it."], "note": ""}, "repeatfollow": {"title": "The job’s done. Do they hear from you again?", "labels": ["I send a thank-you or follow-up.", "I share the work when I have permission.", "I stay in touch with the people who hired me.", "My agent handles that.", "No. I wait for the next call."], "note": "Pick all that apply."}, "sessionagency": {"title": "Does an agency take a cut of your pay?", "labels": ["Yes.", "Sometimes.", "No."], "note": ""}, "sessionfront": {"title": "How often are you covering job expenses before you get paid?", "labels": ["Often.", "Sometimes.", "Rarely or never.", "It’s covered before the job."], "note": "Travel, supplies, assistants—the money leaves your account first."}, "paymodel": {"title": "How do you get paid?", "labels": ["Commission.", "Hourly.", "I work for myself. The money comes to me—and so do the bills.", "I own the salon.", "A mix, or I need help sorting it out."], "note": ""}, "hourlytime": {"title": "Are you working hours that aren’t showing up on your paycheck?", "labels": ["No. My paid hours match my work hours.", "Sometimes. Messages, setup, or cleanup happen off the clock.", "Yes. More than I’d like.", "I need to compare my hours with my pay."], "note": ""}, "spend": {"title": "What does a client usually spend in your chair?", "labels": ["I’m not taking clients yet.", "I need to check.", "Under $100.", "$100–$199.", "$200–$349.", "$350 or more."], "note": "Services only. Leave out tips and take-home products."}, "returning": {"title": "They came once. Are they coming back?", "labels": ["Too soon to tell. I’m still building.", "Not enough of them.", "Some do. Some apparently entered witness protection.", "Most come back.", "Almost everyone comes back.", "I haven’t tracked it."], "note": ""}, "costs": {"title": "After the salon gets its share and your work expenses are paid, what’s left?", "labels": ["I know the number, and it works for me.", "I know the number. It needs to be bigger.", "I have a rough idea.", "That’s what I need help figuring out."], "note": "Before personal bills and taxes."}, "visibility": {"title": "Where are your paying clients finding you?", "labels": ["Instagram or TikTok.", "The salon sends them my way.", "Referrals and word of mouth.", "Google or my website.", "New clients aren’t finding me yet.", "Good question. I need to start asking."], "note": "Pick all that apply."}, "marketing": {"title": "What have you actually tried to fill your book?", "labels": ["Posting my work.", "Asking clients, friends, and people I know for referrals.", "Meeting people locally and introducing myself.", "Paying for ads or promotions.", "Not much yet. I need somewhere to start."], "note": "Pick all that apply."}, "network": {"title": "Which of these would you actually do this week?", "labels": null, "note": ""}, "urgency": {"title": "How soon do you need more clients?", "labels": ["Yesterday. The bills aren’t taking a break.", "I need things moving in the next month.", "I have some breathing room. I want steady growth."], "note": ""}, "nextvisit": {"title": "Do you talk about their next visit before they leave?", "labels": ["Yes. What they’ll need and when to come back.", "I ask if they want to rebook.", "The front desk handles that conversation.", "We say goodbye and leave the rest to chance."], "note": ""}, "followup": {"title": "They left without rebooking. Who makes the next move?", "labels": ["I reach out when they’re due back.", "My booking system sends a reminder.", "The front desk follows up.", "They do. I wait.", "I’m not actually sure anyone follows up."], "note": "Pick all that apply."}, "servicehours": {"title": "Think about the service you book most often. How long does it take, including setup and cleanup?", "labels": null, "note": "Name the service, then enter the total hours and minutes."}, "workcosts": {"title": "Which work expenses are you paying for?", "labels": ["Color, extension hair, and supplies.", "Chair or suite rent.", "Card fees, booking apps, and software.", "An assistant or team.", "The salon covers my work expenses.", "I need to check what’s coming out of my money."], "note": "Pick all that apply."}, "costleak": {"title": "Where do you think you’re losing money?", "labels": ["The salon’s share, rent, or fees.", "Color, extension hair, and supplies.", "Discounts, free fixes, and my generous inability to charge for extras.", "Apps, card fees, and subscriptions.", "Payroll and the salon’s bills.", "If I knew, I wouldn’t be asking for help."], "note": "Pick one to look at first."}, "weeklyhours": {"title": "How many hours a week does this career get out of you?", "labels": ["Under 20 hours.", "20–30 hours.", "31–40 hours.", "More than 40 hours.", "I’ve lost track. That probably says something."], "note": "Clients, prep, cleanup, travel, admin. Answering hair messages from bed still counts."}, "targetdays": {"title": "How many days a week do you actually want to work?", "labels": ["1 day.", "2 days.", "3 days.", "4 days.", "5 days.", "Same days. I’d just like to leave earlier.", "Help me figure out what’s realistic."], "note": ""}, "overrun": {"title": "What keeps you at the salon longer than you want?", "labels": ["Gaps between clients. Still here. Not earning.", "Appointments running over.", "My inability to stop squeezing people in.", "Messages and paperwork after my last client.", "Nothing major. I usually finish on time.", "I need to figure out where the day goes."], "note": "Pick the biggest one."}, "timeleak": {"title": "Outside the actual job, what takes up the most time?", "labels": ["Getting there and back.", "Prep, shopping, packing my kit, or fittings.", "Waiting around.", "Jobs that run longer than planned.", "Invoices, emails, scheduling, and follow-up.", "It’s manageable.", "I haven’t tracked it."], "note": ""}, "savings": {"title": "If you couldn’t work, how long would your savings cover the bills?", "labels": ["There’s no cushion yet.", "Less than 2 months.", "2 to under 6 months.", "6 months or more.", "I need to do the math."], "note": "Rent, food, and everything else that doesn’t stop charging you."}, "futurehabit": {"title": "Is money actually making it into savings?", "labels": ["The bills get it first.", "I mean to save. Then somehow I spend what’s left.", "When I can. My income changes.", "Yes. I put money away regularly."], "note": ""}, "futurefear": {"title": "What do you want your savings to do for you first?", "labels": ["Get me through a slow month or an emergency.", "Let me take time off without panicking.", "Support me later in life. I’m not doing hair forever.", "Help me move into work that’s easier on my body.", "Help me figure out where to start."], "note": ""}};
const approvedLeadership = {"workload": {"title": "How’s the salon’s book looking?", "labels": ["We’re not taking clients yet.", "Too many empty chairs.", "About half full.", "Busy, with some openings.", "Full, or close to it."], "note": "The whole team—not just your busiest stylist."}, "jobsource": {"title": "How are paying clients finding the salon?", "labels": ["Outside booking services or partners.", "Former clients coming back.", "Referrals and word of mouth.", "Social media.", "Google, our website, or contacting us directly.", "New clients aren’t coming in consistently.", "We should probably start asking."], "note": "Pick all that apply."}, "outreach": {"title": "What are you doing to fill the salon’s book?", "labels": ["Working with outside booking services or partners.", "Reaching out to past clients.", "Showing off the team’s work.", "Connecting with local people and businesses.", "Promoting specific services or open appointments.", "We need to move past hoping the phone rings."], "note": "Pick all that apply."}, "repeatwork": {"title": "Are the salon’s clients coming back?", "labels": ["We’re new. Too soon to tell.", "Not often enough.", "Some do. Some disappear.", "Most come back.", "We haven’t checked the numbers."], "note": ""}, "repeatfollow": {"title": "They leave the salon without rebooking. Then what?", "labels": ["Their stylist follows up.", "We keep showing our work so they remember us.", "We check in when they’re due back.", "The front desk handles it.", "We wait and hope they book."], "note": "Pick all that apply."}, "timeleak": {"title": "What keeps eating up your time at the salon?", "labels": ["Salon errands and travel.", "Supplies, setup, and getting everything ready.", "Waiting around when the schedule falls apart.", "Days that never seem to end on time.", "Scheduling, messages, paperwork, and follow-up.", "It’s manageable.", "I need to see where my time’s going."], "note": ""}};
const approvedManager = {"workexpenses": {"title": "Which salon expenses are you expected to keep an eye on?", "labels": ["Products and supplies.", "Extension hair, wigs, or hairpieces.", "Tools and equipment.", "Travel and work errands.", "Staffing.", "Booking systems, card fees, and software.", "The owner handles the money.", "We need to get clear on what’s my responsibility."], "note": "Pick all that apply."}};
const approvedHabits = {"clients": {"title": "How are you getting people into your chair?", "labels": ["I ask them and book them through school.", "I post my work. The part where I tell them how to book needs work.", "So far? Hoping someone asks."], "note": ""}, "consultation": {"title": "Before you start, have you talked through more than the inspiration photo?", "labels": ["Yes. The result, time, upkeep, and price.", "Some of it. I’m not consistent yet.", "I need help knowing what to ask."], "note": ""}, "rebooking": {"title": "Do you bring up the next appointment, or hope they bring it up?", "labels": ["I tell them when to come back and why.", "I ask if they want to rebook. That’s about as far as I get.", "I haven’t gotten comfortable asking yet."], "note": ""}, "money": {"title": "They’ve told you what the job pays. Do you know what that leaves you?", "labels": ["Yes. I’ve checked my costs and what’s still before taxes.", "I know the rate or percentage. The rest is a little foggy.", "Not yet. I need to see the actual math."], "note": ""}, "boundaries": {"title": "Someone asks for something you’re not ready to do. What comes out of your mouth?", "labels": ["Let’s get my instructor involved.", "Sure. Followed by a small internal panic.", "I need help saying what I can—and can’t—do yet."], "note": ""}};
const approvedFreeGoals = {"chair": ["More clients. Those empty appointments aren’t paying rent.", "More money without adding another day.", "Clients who come back.", "Money that stays in my account long enough to get acquainted.", "I love doing hair. It doesn’t need custody of my entire life.", "A financial cushion. I’m tired of one surprise bill being an event."], "session": ["More paid jobs on my calendar.", "Better pay for the jobs I’m already doing.", "More people hiring me again.", "Less money disappearing into the cost of doing the job.", "Work that leaves room for a life.", "Savings for when the phone isn’t ringing."], "events": ["More paid bookings.", "Making more from each booking.", "More referrals and repeat business.", "Keeping more after the expenses.", "A weekend off occasionally. Imagine.", "Savings for the quieter months."], "education": ["More paid teaching or brand work.", "Getting paid properly for the work involved.", "Brands and teams bringing me back.", "Keeping more after travel, prep, and supplies.", "Work that doesn’t take over my entire life.", "A cushion between bookings."], "owner": ["More clients coming through the door.", "More profit without more hours from me.", "Clients who come back.", "Knowing where the salon’s money is going.", "I own the salon. I’d like it to stop owning me.", "A cushion for slow months and surprise bills."], "manager": ["More clients coming through the door.", "Pay that matches what I’m responsible for.", "More clients coming back.", "A better handle on the numbers I’m expected to improve.", "Being off work when I’m off work.", "Personal savings so every paycheck isn’t already spoken for."], "other": ["More paid work.", "More money without more hours.", "More people hiring me again.", "Knowing where the money goes—and keeping more.", "A career that leaves room for the rest of my life.", "Savings for when things don’t go to plan."]};
const approvedNetwork = {"past": "Ask happy clients to send someone my way.", "salon": "Ask the salon to promote a service I want more bookings for.", "portfolio": "Post a great result and make it easy to book.", "local": "Meet someone locally who could refer clients.", "models": "Book a model for the kind of work I want to show.", "none": "You pick. That’s why I’m here."};
function shortQuestionCopy(q,a) {
 if(q.approvedCopy)return q;
 const lane=shortLane(a);
 const original=legacyShortQuestionCopy(q,a);
 let copy=approvedFree[q.id];
 if(['owner','manager'].includes(lane)&&approvedLeadership[q.id])copy=approvedLeadership[q.id];
 if(lane==='manager'&&shortFocusGoal(a)==='keep'&&approvedManager[q.id])copy=approvedManager[q.id];
 if(q.id==='habitevidence')copy=approvedHabits[a.readiness];
 let choices=typeof original.choices==='function'?original.choices(a):original.choices;
 if(q.id==='goal')copy={...copy,labels:approvedFreeGoals[lane]||approvedFreeGoals.other};
 if(copy&&copy.labels)choices=choices.map((c,i)=>[c[0],copy.labels[i]||c[1]]);
 if(q.id==='network')choices=choices.map(c=>[c[0],approvedNetwork[c[0]]||c[1]]);
 if(q.id==='primarywork')choices=choices.map(c=>[c[0],c[0]==='mix'?'It’s a mix. No single one brings in the most.':c[1]]);
 return {...original,...(copy?{title:copy.title,note:copy.note}:{}),choices,approvedCopy:true};
}

function legacyShortQuestionCopy(q,a) {
 if(!['owner','manager'].includes(shortLane(a)))return q;
 const copies={
  workload:{title:'HOW FULL IS THE SALON’S BOOK?',note:'Think about the whole team. Pick the closest answer.',choices:[['notyet','We’re not taking clients yet.'],['light','Plenty of empty appointments.'],['half','About half full.'],['busy','Busy, with some room.'],['full','Packed, or close to it.']]},
  jobsource:{title:'HOW DO NEW CLIENTS FIND THE SALON?',note:'Pick every source that has brought in a paying client.',choices:[['agency','Outside booking partners.'],['repeat','Past clients finding their way back.'],['referrals','Referrals and word of mouth.'],['social','Social media.'],['direct','Google, our website, or people contacting us directly.'],['none','New clients aren’t coming in consistently.'],['unknown','We need to start asking.']]},
  outreach:{title:'WHAT HAVE YOU TRIED TO FILL THE SALON’S BOOK?',note:'Pick all that apply.',choices:[['agency','Working with outside booking partners.'],['past','Reaching out to past clients.'],['portfolio','Sharing the team’s work.'],['network','Meeting local businesses and people.'],['pitch','Promoting a specific service or opening.'],['none','We need a first move.']]},
  repeatwork:{title:'ARE SALON CLIENTS COMING BACK?',choices:[['new','We’re just getting started. Too soon to know.'],['rare','Not often enough.'],['some','Some do. Some disappear.'],['most','Most come back.'],['unknown','We haven’t tracked it.']]},
  repeatfollow:{title:'THEY LEFT WITHOUT REBOOKING. WHAT HAPPENS NEXT?',note:'Pick all that usually happen.',choices:[['thanks','The stylist sends a follow-up.'],['portfolio','We stay visible by sharing the team’s work.'],['touch','The salon checks in when their next visit is due.'],['agency','Our front desk or booking team handles it.'],['none','Nothing. We wait for them to book.']]},
  timeleak:{title:'WHAT STEALS THE MOST TIME AT THE SALON?',note:'Pick one to tackle first.',choices:[['travel','Travel or running errands for the salon.'],['prep','Prep, supplies, or getting the salon ready.'],['waiting','Waiting around when the schedule falls apart.'],['longday','The workday keeps running late.'],['admin','Scheduling, messages, paperwork, and follow-up.'],['none','The extra work is manageable.'],['unknown','I need to see where the time goes.']]}
 };
 if(q.id==='workexpenses'&&shortLane(a)==='manager'&&shortFocusGoal(a)==='keep')return {...q,title:'WHICH SALON COSTS ARE YOU RESPONSIBLE FOR WATCHING?',note:'Pick all that are part of your job.',choices:[['products','Products and supplies.'],['hair','Extension hair, wigs, or hairpieces.'],['tools','Tools and equipment.'],['travel','Travel or work errands.'],['team','Staffing costs.'],['fees','Booking, card, or software fees.'],['none','The owner handles these costs.'],['unknown','I need to clarify what I’m responsible for.']]};
 return {...q,...(copies[q.id]||{})};
}

function buildShortBreakdown(a){return {audience:isStudent(a)?'student':'professional',category:a.readiness,stage:shortStage(a).label,top:{id:shortFocusGoal(a)||'money'}};}

