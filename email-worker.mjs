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
  time:{title:"MAKE THE OTHER HOURS MORE EXPENSIVE BEFORE YOU DELETE A DAY.",body:"A four-day income on three days is built by improving what each remaining hour produces — not by cramming five days of exhaustion into three.",first:"Open Chair Math for the day you want back. We will show what it pays each month before you change your schedule.",then:"Use Chair Math on your other days too. We will show which appointments pay less. Change one thing at a time and check your actual pay before taking a day off.",dontTitle:"DON’T COMPRESS CHAOS.",dont:"Working fewer days while keeping every inefficient service, gap, and overrun just creates longer, harder days. Redesign the remaining calendar before shrinking it."},
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

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};
    if (ORIGINS.has(origin)) Object.assign(headers, {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'});
    const reply = (data, status = 200) => new Response(JSON.stringify(data), {status, headers});
    if (request.method === 'GET') return reply({service:'BOOKED AF email', ready:!!(env.RESEND_API_KEY && env.TURNSTILE_SECRET_KEY)});
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
      answers = validateAnswers(data.answers);
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
      const result = read(answers);
      const title = data.type === 'breakdown' ? 'Your BOOKED AF Breakdown' : 'You’re on the founding list';
      const text = data.type === 'breakdown' ? emailCopy(result, name) : `${name ? name + ', you’re' : 'You’re'} on the BOOKED AF Deep Dive founding list.\n\nWe’ve received your request for the $49 founding offer. No payment has been taken. We’ll contact you when checkout is ready.\n\nBOOKED AF\nLove your career. Keep your life.`;
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify([email,name,data.type,answers])));
      const key = 'booked-v2-logo-' + [...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
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
