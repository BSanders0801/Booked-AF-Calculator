const legacyQuestions=[
{id:'stage',title:'What does your book look like right now?',choices:[['building','BUILDING','I’m starting, rebuilding, or still finding my people.'],['busy','GETTING BUSY','Clients are coming in, but it’s not steady yet.'],['demand','IN DEMAND','My book is pretty full.'],['booked','BOOKED AF','I’m busy. I want the money and the life to match.']]},
{id:'full',title:'How full is your book most weeks?',choices:[['under25','Less than a quarter'],['half','About halfway'],['threequarters','Mostly full'],['full','Packed, or close to it']]},
{id:'days',title:'How many days a week are you behind the chair?',choices:[['0','Not behind the chair yet'],['2','1-2 days'],['3','3 days'],['4','4 days'],['5','5 or more days']]},
{id:'clients',title:'How many clients do you usually see on a workday?',choices:[['0','Not seeing clients yet'],['2','1-2'],['4','3-4'],['6','5-6'],['7','7 or more']]},
{id:'spend',title:'About how much does a normal client pay for services?',choices:[['unknown','I’m not sure'],['75','Under $100'],['150','$100-$199'],['275','$200-$349'],['400','$350 or more']]},
{id:'newclients',title:'How many new clients are finding you in a typical month?',choices:[['0','Basically none'],['2','1-3'],['6','4-8'],['10','9 or more'],['unknown','I have no idea']]},
{id:'returning',title:'After a new client sees you, how often do they come back?',choices:[['low','Not nearly enough'],['some','Some do, some don’t'],['most','Most of them come back'],['almostall','Almost everybody comes back'],['unknown','I honestly don’t know']]},
{id:'income',title:'About how much money comes in from your work in a typical month?',note:'Best guess is fine. Think about what your clients pay for services before your work costs.',choices:[['unknown','I honestly don’t know'],['low','Under $3,000'],['mid','$3,000-$6,999'],['high','$7,000-$11,999'],['veryhigh','$12,000 or more']]},
{id:'costs',title:'After you pay the costs of doing hair, how much of that money actually feels like yours?',choices:[['little','Not much. It disappears fast.'],['some','Some, but less than I think it should be.'],['good','A solid amount.'],['most','Most of it.'],['unknown','I have absolutely no idea']]},
{id:'savings',title:'If work got weird tomorrow, how much breathing room do you have?',choices:[['none','Basically none'],['month','Less than 2 months'],['few','2 to under 6 months'],['solid','I’ve got a solid cushion'],['unknown','I’d rather not think about it']]},
{id:'dayback',title:'If you could work one less day every week and keep your income, would you?',choices:[['yes','IN A HEARTBEAT'],['maybe','MAYBE'],['no','NOPE. I LIKE MY SCHEDULE']]},
{id:'goal',title:'What do you want most from your career right now?',choices:[['clients','More clients in my chair'],['money','More money without cramming in more people'],['return','More clients actually coming back'],['keep','To stop wondering where all the money went'],['time','More life outside the salon'],['stable','To feel financially secure']]},
{id:'visibility',when:a=>a.stage==='building'||a.full==='under25'||a.full==='half'||a.goal==='clients',title:'Where do you think new clients are supposed to find you right now?',choices:[['social','Mostly Instagram / TikTok'],['salon','I’m hoping the salon sends people my way'],['referrals','Mostly referrals / word of mouth'],['search','Google, my website, or local search'],['mix','A few different places'],['none','Honestly? I don’t really have a system']]},
{id:'marketing',when:a=>a.stage==='building'||a.full==='under25'||a.full==='half'||a.goal==='clients',title:'How do you feel about marketing yourself?',choices:[['love','I’m comfortable putting myself out there'],['okay','I can do it if you tell me what works'],['socialbad','Social media is not my thing'],['hate','I hate selling myself'],['lost','I genuinely don’t know what to do']]},
{id:'traffic',when:a=>a.stage==='building'||a.full==='under25'||a.full==='half'||a.goal==='clients',title:'How much help does your salon give you finding new clients?',choices:[['strong','A lot - there’s real traffic and referrals'],['some','Some, but I still need to build my own book'],['little','Very little'],['none','Basically none - I’m on my own'],['nosalon','I’m not in a traditional salon']]},
{id:'network',when:a=>a.stage==='building'||a.full==='under25'||a.full==='half'||a.goal==='clients',title:'What do you already have that could help you get clients?',choices:[['past','Past clients I could reconnect with'],['local','I know local businesses / people'],['portfolio','Good work and photos I can show people'],['models','I can bring in models and get good photos of my work'],['none','I’m basically starting from zero']]},
{id:'urgency',when:a=>a.stage==='building'||a.full==='under25'||a.full==='half'||a.goal==='clients',title:'How fast do you need this book to move?',choices:[['now','I need paying clients now'],['month','I need real movement this month'],['steady','I can build it steadily over a few months']]},
{id:'retentionleak',when:a=>a.returning==='low'||a.returning==='some'||a.goal==='return',title:'When a new client does not come back, what do you think usually happened?',choices:[['consult','I may not be setting up the next visit clearly enough'],['checkout','I get awkward about asking them to book again'],['followup','They leave and I do not really follow up'],['value','I worry the service, experience, or price is not giving them a reason to return'],['unknown','I honestly have no idea']]},
{id:'nextvisit',when:a=>a.returning==='low'||a.returning==='some'||a.goal==='return',title:'Before a client leaves, how specific are you about what happens next?',choices:[['prescribe','I tell them what they need next and when'],['ask','I usually just ask if they want to rebook'],['desk','The front desk handles it'],['rare','I rarely talk about the next appointment']]},
{id:'costleak',when:a=>a.costs==='little'||a.costs==='some'||a.costs==='unknown'||a.goal==='keep'||a.goal==='stable',title:'What do you think you spend the most work money on?',choices:[['space','Commission, rent, or salon fees'],['product','Color, extensions, backbar, and supplies'],['discount','Discounts, comps, redos, or services I give away'],['fees','Card fees, apps, assistants, and all the little charges'],['unknown','I have no clue - that is part of the problem']]},
{id:'tracking',when:a=>a.costs==='little'||a.costs==='some'||a.costs==='unknown'||a.goal==='keep'||a.goal==='stable',title:'Do you know what you keep after paying for work?',choices:[['clear','I know what comes in, what work costs, and what stays mine'],['revenue','I mostly know my sales number'],['bank','I look at my bank account and hope for the best'],['none','I really do not track it']]},
{id:'serviceeconomics',when:a=>a.goal==='money'||((a.full==='full'||a.full==='threequarters')&&(a.spend==='75'||a.spend==='150')),title:'Do you know which appointments leave you with the most money?',choices:[['yes','Yes - I know which services pay me best'],['guess','I have a pretty good guess'],['ticket','I mostly look at the ticket price'],['no','No. I have never broken it down that way']]},
{id:'overrun',when:a=>a.goal==='money'||a.goal==='time'||a.days==='5'||(a.days==='4'&&(a.full==='full'||a.full==='threequarters')),title:'What steals the most time from your workday?',choices:[['gaps','Gaps and awkward holes'],['overrun','Services running longer than planned'],['lowvalue','Work that takes too much time for what it pays'],['squeeze','Squeezing people in because I hate saying no'],['none','My schedule is actually pretty tight']]},
{id:'bodyload',when:a=>a.goal==='time'||a.days==='5'||(a.days==='4'&&(a.full==='full'||a.full==='threequarters')),title:'What does your body say about your current schedule?',choices:[['fine','I feel good - this pace is sustainable'],['tired','I am tired, but functioning'],['pain','I am regularly sore or in pain'],['done','My body is telling me this cannot be the long-term plan']]},
{id:'futurehabit',when:a=>a.goal==='stable'||a.savings==='none'||a.savings==='month'||a.savings==='unknown',title:'When a strong month happens, what usually happens to the extra money?',choices:[['save','Some automatically goes to savings / Future Me'],['catchup','It catches up bills or old expenses'],['spend','It tends to disappear into life'],['random','There is no system - every month is different']]},
{id:'futurefear',when:a=>a.goal==='stable'||a.savings==='none'||a.savings==='month'||a.savings==='unknown',title:'What worries you most about the future?',choices:[['emergency','One slow month or emergency could wreck me'],['timeoff','Taking real time off costs too much'],['retire','I am not building enough for retirement'],['body','I do not know how long my body can keep doing this'],['all','Honestly? A little bit of all of it']]} 
];
let questions=legacyQuestions;
const state={schema:'legacy',answers:{},index:-1,view:'intro',name:'',done:{},deepAnswers:{},deepIndex:0,deepPreview:false,checkin:{},memberTool:null,memberCheck:{money:null,life:null,future:null},memberHistory:[]};const app=document.getElementById('app');const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const deliveryKey='booked-af-delivery-v1';
function emailCopy(r,name) { return publicBreakdownEmail(r,name); }
// Lead requests stay in the background. Never navigate to the form provider.
// Send validated form details to our email Worker after Turnstile verification.
const emailServiceUrl = 'https://booked-af-email.wild-recipe-42df.workers.dev';
const next30CheckoutUrl = '#deep-dive';
const checkoutVerifyUrl = emailServiceUrl + '/verify-checkout';
const shortReady=fetch(emailServiceUrl,{signal:AbortSignal.timeout(5000),credentials:'omit'}).then(r=>r.ok?r.json():{}).then(r=>r.ready===true&&Array.isArray(r.schemas)&&r.schemas.includes(SHORT_SCHEMA)).catch(()=>false);
function restoreSchema(schema){state.schema=schema===SHORT_SCHEMA?SHORT_SCHEMA:'legacy';questions=state.schema===SHORT_SCHEMA?shortQuestions:legacyQuestions;}

function answersForDelivery(){
 return state.schema===SHORT_SCHEMA
  ? validateShortAnswers(state.answers)
  : JSON.parse(JSON.stringify(state.answers||{}));
}

const emailSiteKey = '0x4AAAAAAFDEaTJ_ybTjAuWb';
let turnstileLoading;
let disposeEmailWidget = () => {};
function loadEmailVerification() {
 if (window.turnstile) return Promise.resolve(window.turnstile);
 if (turnstileLoading) return turnstileLoading;
 turnstileLoading = new Promise((resolve, reject) => {
  const script = document.createElement('script');
  const timer = setTimeout(failed, 15000);
  function failed() {
   clearTimeout(timer); script.remove(); turnstileLoading = null;
   reject(new Error('Verification could not load. Please refresh and try again.'));
  }
  window.bookedTurnstileReady = () => { clearTimeout(timer); resolve(window.turnstile); };
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=bookedTurnstileReady';
  script.async = true; script.onerror = failed; document.head.appendChild(script);
 });
 return turnstileLoading;
}
function mountEmailVerification(form, error) {
 const container = document.createElement('div');
 container.style.margin = '16px 0';
 container.dataset.emailVerification='true';
 error.before(container);
 let widget, token = '', disposed = false;
 const notice = message => { if (form.isConnected && form.dataset.sending !== 'true' && !error.dataset.submission) error.textContent = message; };
 const verification = {
  token: () => token,
  reset: () => { token = ''; if (!disposed && widget !== undefined) window.turnstile.reset(widget); }
 };
 disposeEmailWidget = () => {
  disposed = true; token = '';
  if (widget !== undefined) window.turnstile.remove(widget);
 };
 loadEmailVerification().then(api => {
  if (disposed || !form.isConnected) return;
  widget = api.render(container, {
   sitekey: emailSiteKey, action: 'booked_email', size: 'flexible',
   callback: value => { token = value; notice(''); },
   'expired-callback': () => { token = ''; if (!disposed && widget !== undefined) api.reset(widget); notice('Verification expired. Please complete the new verification below. Your answers are saved.'); },
   'error-callback': () => { token = ''; notice('Verification could not finish. Please refresh and try again.'); },
   'timeout-callback': () => { token = ''; notice('Verification timed out. Please try again.'); }
  });
 }).catch(() => notice('Verification could not load. Please refresh and try again.'));
 return verification;
}
function bindLeadForm(form, {errorId, pendingText, failureText, prepare, complete}) {
 let verification = mountEmailVerification(form, document.getElementById(errorId));
 form.onsubmit = async event => {
  event.preventDefault();
  if (form.dataset.sending === 'true' || !form.reportValidity()) return;
  const button = form.querySelector('button[type="submit"]');
  const error = document.getElementById(errorId);
  const label = button.textContent;
  const firstName = form.elements.namedItem('name').value.trim();
  if (!firstName || !/\p{L}/u.test(firstName) || !/^[\p{L}\p{M} '\u2019-]*$/u.test(firstName)) {
   error.textContent = 'Please use letters, spaces, apostrophes, or hyphens for your first name.';
   error.focus(); return;
  }
  if (!verification) {
   error.textContent='Please verify again, then submit. Your details are still here.';
   delete error.dataset.submission;verification=mountEmailVerification(form,error);return;
  }
  if (!verification.token()) {
   error.textContent = 'Please complete the verification below before submitting.';
   error.focus(); return;
  }
  error.textContent = '';
  delete error.dataset.submission;
  form.dataset.sending = 'true';
  form.setAttribute('aria-busy', 'true');
  button.disabled = true;
  button.textContent = pendingText;
  let timeout;
  let failure = failureText;
  let failureCode = 'connection';
  try {
   const data = new FormData(form);
   const values = prepare(data);
   data.set('email', String(data.get('email') || '').trim().toLowerCase());

   // This is a temporary draft, never proof that the address has been received.
   try { sessionStorage.setItem('booked-af-email-draft', JSON.stringify({form: form.id, name: data.get('name'), email: data.get('email'), schema: state.schema, answers: state.answers})); } catch (err) {}
   const controller = new AbortController();
   timeout = setTimeout(() => controller.abort(), 30000);
   const response = await fetch(emailServiceUrl, {
    method: 'POST',
    headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
    body: JSON.stringify({type: form.id === 'interest' ? 'founding' : 'breakdown',
     email: data.get('email'), name: firstName, schema: state.schema, answers: answersForDelivery(),
     marketingConsent: data.get('marketingConsent')==='on', first90Interest: data.get('first90Interest')==='on', analyticsSession: window.BookedLifecycle?.session, source: window.BookedLifecycle?.source || 'direct', token: verification.token(), honey: data.get('_honey') || ''}),
    signal: controller.signal,
    redirect: 'error',
    credentials: 'omit'
   });
   failureCode = String(response.status);
   if (response.status === 429) {
    failure = 'Email sign-ups need a short break. Your details are still here. Please try again in a few minutes.';
    throw new Error('Rate limited');
   }
   if (response.status === 403) failure = 'Verification was not accepted. Please complete the new verification and try again. If you are testing a preview, use the official website instead.';
   if (response.status === 503) failure = 'Email is temporarily unavailable. Your details are still here. Please try again shortly.';
   if (response.status === 400) failure = 'Please check your name and email. If this continues, restart the questionnaire.';
   if (!response.ok) throw new Error('Submission failed: ' + response.status);
   const result = await response.json();
   if (result.success !== true && result.success !== 'true') throw new Error('Submission not accepted');
   try { sessionStorage.removeItem('booked-af-email-draft'); } catch (err) {}
   // A visitor may leave the form while the request is pending.
   if (!form.isConnected) return;
   if(result.breakdown){state.freePublicCopy={schema:state.schema,answers:JSON.stringify(state.answers),copy:result.breakdown};try{sessionStorage.setItem('booked-free-copy',JSON.stringify(state.freePublicCopy))}catch{}}complete(values);
   if(data.get('first90Interest')==='on')state.first90Interest=true;
   try { sessionStorage.setItem(deliveryKey, JSON.stringify({schema: state.schema, answers: state.answers, name: state.name, emailSent: !!state.emailSent, deepJoined: !!state.deepJoined})); } catch (err) {}
   state.view = 'result';
   render();
  } catch (err) {
   if (err.name === 'AbortError') failure = 'Saving your email is taking too long. Your details are still here. Please try again in a moment.';
   else if (err instanceof TypeError) failure = 'We couldn’t connect to save your email. Your details are still here. Please try again.';
   console.warn('BOOKED AF email submission:', err.name, err.message);
   if (form.isConnected) {
    error.dataset.submission = 'true';
    // Turnstile tokens are single-use. Keep the answers and widget in place,
    // but issue a fresh challenge after every failed request.
    if (verification) verification.reset();
    error.textContent = failure + ' (Reference: ' + failureCode + ')';
    error.focus();
   }
  } finally {
   clearTimeout(timeout);
   form.dataset.sending = 'false';
   form.removeAttribute('aria-busy');
   button.disabled = false;
   button.textContent = label;
  }
 };
 // Recover an unfinished attempt after a refresh, without submitting it automatically.
 try {
  const draft = JSON.parse(sessionStorage.getItem('booked-af-email-draft') || 'null');
  if (draft && draft.form === form.id) {
   form.elements.namedItem('name').value = String(draft.name || '').slice(0, 60);
   form.elements.namedItem('email').value = String(draft.email || '').slice(0, 254);
  }
 } catch (err) {}
}
try{const mh=JSON.parse(localStorage.getItem('booked-af-member-history')||'[]');if(Array.isArray(mh))state.memberHistory=mh;}catch(e){}try{const savedDeep=JSON.parse(sessionStorage.getItem('booked-af-deep-answers')||'null');if(savedDeep&&typeof savedDeep==='object'&&!Array.isArray(savedDeep))state.deepAnswers=savedDeep;}catch(e){}try{const saved=JSON.parse(sessionStorage.getItem(deliveryKey)||'null');if(saved&&saved.answers&&typeof saved.answers==='object'){restoreSchema(saved.schema);state.answers=saved.answers;state.name=String(saved.name||'').slice(0,60);state.view='result';const params=new URLSearchParams(location.search);state.emailSent=saved.emailSent===true;state.deepJoined=saved.deepJoined===true||params.get('next30')==='joined'||params.get('deepdive')==='joined';if(params.get('breakdown')==='sent'||params.get('next30')==='joined'||params.get('deepdive')==='joined'){history.replaceState(null,'',location.pathname+location.hash)}}}catch(e){}
try {
 const draft = JSON.parse(sessionStorage.getItem('booked-af-email-draft') || 'null');
 if (draft && draft.answers && typeof draft.answers === 'object' && ['form', 'interest'].includes(draft.form)) {
  restoreSchema(draft.schema);state.answers = draft.answers;
  state.name = String(draft.name || '').slice(0, 60);
  state.view = draft.form === 'form' ? 'email' : 'paid';
 }
} catch (err) {}
const next30Entry=new URLSearchParams(location.search).get('next30')||new URLSearchParams(location.search).get('deepdive');if(next30Entry==='paid'){state.view='deepverify';state.checkoutSessionId=new URLSearchParams(location.search).get('session_id')||'';}
function shortResultHTML(r){
 const p=publicBreakdown(r);
 return `<div class="eyebrow">Your BOOKED AF Breakdown</div><section class="card"><div class="number">YOUR CAREER RIGHT NOW</div><h2>${esc(p.stage)}</h2></section><section class="card"><div class="number">WHAT MAY BE GETTING IN THE WAY</div><h2>${esc(p.title)}</h2><p>${esc(p.body)}</p><p class="fine">This is a starting point for understanding the problem, not a personalized action plan or an income forecast.</p></section><section class="card"><h2>${p.student?'BOOKED AF: FIRST 90':'YOUR NEXT 30 · $49'}</h2><p>${esc(p.offer)}</p>${p.student?'<button class="primary" id="paid">FIRST 90 UPDATES →</button>':`<a class="primary checkout-link" id="paid" href="${esc(next30CheckoutUrl)}">BUILD MY NEXT 30 · $49 →</a><p class="fine">One payment. No subscription. Includes 12 months of online access. Download readable copies to keep.</p>`}</section><div class="actions"><button class="secondary" id="share">SAVE / SHARE MY BREAKDOWN</button><button class="secondary" id="edit">EDIT ANSWERS</button><button class="secondary" id="restart">START OVER</button>${p.student?'<button class="secondary" data-career-update>I’VE FINISHED SCHOOL →</button>':''}</div>`;
}
function render(){if(['deepintake','deepresult','checkin'].includes(state.view)&&state.next30Verified!==true)state.view='paid';if(state.view==='plan')state.view='result';if(['daymath','membertool','membership'].includes(state.view))state.view=isStudent(state.answers)?'first90':'paid';if(['teaser','result','plan'].includes(state.view)&&!state.emailSent)state.view='email';disposeEmailWidget();disposeEmailWidget=()=>{};if(state.view!=='intro')app.classList.remove('intro-screen');document.getElementById('bar').style.width=(state.view==='question'?Math.round(questions.filter((q,i)=>i<state.index&&(!q.when||q.when(state.answers))).length/questions.filter(q=>!q.when||q.when(state.answers)).length*100):state.view==='intro'?0:100)+'%';if(state.view==='intro'){app.classList.add('intro-screen');app.innerHTML=`<section class="intro-hero"><p class="intro-topline">BOOKED & FABULOUS</p><h1 class="intro-wordmark">BOOKED <b>AF</b></h1><p class="intro-promise"><span>YOUR BOOKED AF BREAKDOWN. </span></p><button class="primary intro-cta" id="start">START YOUR BREAKDOWN →</button></section><section class="intro-after"><div class="intro-kicker">THE 3-MINUTE BOOKED AF BREAKDOWN</div><h2 class="intro-title">THE BOOKED AF<span class="future">BREAKDOWN.</span></h2><p class="intro-thesis">You learned how to do hair.<br><span class="pink">Nobody taught you what to do with the career it creates.</span></p><p class="intro-copy">More money. Better clients. Fewer hours that don’t pay their way. A body that still works. Money for Future You.</p><div class="intro-manifesto intro-quote"><h3>“I’ll figure it out later” is not a retirement plan.</h3></div><p class="intro-note">Built by a haircolorist with nearly 30 years behind the chair-and the financial mistakes to prove it.</p></section>`;document.getElementById('start').onclick=async()=>{const button=document.getElementById('start');button.disabled=true;button.textContent='LET’S GET STARTED…';const ready=await shortReady;if(!Object.keys(state.answers).length)restoreSchema(ready?SHORT_SCHEMA:'legacy');app.classList.remove('intro-screen');state.index=0;state.view='question';render()};return}
if(state.view==='question'){let q=questions[state.index];while(q&&q.when&&!q.when(state.answers)){state.index++;q=questions[state.index]}if(!q){state.view='teaser';render();return}if(state.schema===SHORT_SCHEMA)q=shortQuestionCopy(q,state.answers);if(q.type==='service-time'){renderServiceTimeQuestion(q);return}const choiceList=state.schema===SHORT_SCHEMA?shortChoices(q,state.answers):q.choices,allowed=new Set(choiceList.map(c=>c[0]));let selected=state.answers[q.id];if(q.multi&&Array.isArray(selected)){selected=selected.filter(v=>allowed.has(v));if(selected.length)state.answers[q.id]=selected;else delete state.answers[q.id]}else if(!q.multi&&selected!==undefined&&!allowed.has(selected)){delete state.answers[q.id];selected=undefined}const selectedValues=q.multi?(Array.isArray(selected)?selected:(selected===undefined?[]:[selected])):[],hasSelected=q.multi?selectedValues.length>0:selected!==undefined,visible=questions.filter((x,i)=>i<=state.index&&(!x.when||x.when(state.answers))).length,total=questions.filter(x=>!x.when||x.when(state.answers)).length;app.innerHTML=`<div class="eyebrow">Question ${visible}${state.schema===SHORT_SCHEMA&&!isStudent(state.answers)&&!state.answers.goal?' · about 7-10 questions':' of '+total}</div><h2>${q.title}</h2>${q.note?`<p>${q.note}</p>`:''}${q.note&&/pick|choose/i.test(q.note)?'':`<p class="fine">${q.multi?'Pick all that fit.':'Pick one.'}</p>`}<div class="choices">${choiceList.map(([value,label,detail])=>{const on=q.multi?selectedValues.includes(value):selected===value;return `<button type="button" class="choice ${on?'selected':''}" data-value="${value}" aria-pressed="${on}">${label}${detail?`<small>${detail}</small>`:''}</button>`}).join('')}</div><div class="actions"><button class="secondary" id="back">← BACK</button><button class="primary" id="next" ${hasSelected?'':'disabled'}>${visible===total?'SEE MY BREAKDOWN →':'NEXT →'}</button></div>`;app.querySelectorAll('.choice').forEach(el=>el.onclick=()=>{const value=el.dataset.value;if(q.multi){const exclusive=q.exclusive||[];let next=Array.isArray(state.answers[q.id])?[...state.answers[q.id]]:(state.answers[q.id]===undefined?[]:[state.answers[q.id]]);if(exclusive.includes(value)){next=next.includes(value)?[]:[value]}else{next=next.filter(v=>!exclusive.includes(v));next=next.includes(value)?next.filter(v=>v!==value):[...next,value]}if(next.length)state.answers[q.id]=next;else delete state.answers[q.id]}else state.answers[q.id]=value;if(state.schema===SHORT_SCHEMA){for(const hidden of shortQuestions.filter(x=>x.when&&!x.when(state.answers)))delete state.answers[hidden.id]}render()});document.getElementById('back').onclick=()=>{if(state.index===0)state.view='intro';else {do{state.index--}while(state.index>0&&questions[state.index].when&&!questions[state.index].when(state.answers))}render()};document.getElementById('next').onclick=()=>{const answer=state.answers[q.id];if(answer===undefined||(q.multi&&(!Array.isArray(answer)||!answer.length)))return;let next=state.index+1;while(next<questions.length&&questions[next].when&&!questions[next].when(state.answers))next++;if(next>=questions.length)state.view='teaser';else state.index=next;render()};return}
if(state.view==='teaser'){state.view='result';render();return}
if(state.view==='email'){app.innerHTML=`<section class="capture-shell"><div class="capture-wordmark">BOOKED <b>AF</b></div><div class="capture-rule"></div><div class="eyebrow">YOUR BREAKDOWN IS READY</div><h2 class="capture-title">LET’S LOOK AT WHAT’S GETTING IN THE WAY.</h2><p class="capture-copy">Drop your email. See what may be getting in the way of the career you want, here and in your inbox.</p><form id="form" class="capture-form" onsubmit="return false"><label for="name">What’s your first name?</label><input class="input" id="name" name="name" required autocomplete="given-name" maxlength="60" placeholder="Bradley"><label for="email">Where should I send your Breakdown?</label><input class="input" id="email" name="email" type="email" autocomplete="email" required placeholder="you@example.com"><label class="marketing-consent" style="display:flex;gap:12px;align-items:flex-start"><input type="checkbox" name="marketingConsent" style="width:20px;height:20px;flex:none"> <span>Email me BOOKED AF updates and offers. Optional. I can unsubscribe anytime.</span></label><p class="fine">Your name, email and answers are saved to deliver your Breakdown. <a href="#privacy">Privacy Policy</a>.</p><input type="hidden" name="_subject" value="BOOKED AF • New Breakdown Lead"><input type="hidden" name="_template" value="box"><input type="hidden" name="stage"><input type="hidden" name="breakdown"><input type="text" name="_honey" tabindex="-1" autocomplete="off" style="display:none" hidden aria-hidden="true"><p class="error" id="error" role="alert" tabindex="-1"></p><button type="submit" class="primary capture-cta">SHOW ME MY BREAKDOWN →</button></form><p class="capture-note">Your full Breakdown opens here immediately. Save it, share it, or return to your Breakdown when you’re ready.</p></section>`;bindLeadForm(document.getElementById('form'), {
 errorId: 'error',
 pendingText: 'OPENING YOUR BREAKDOWN…',
 failureText: 'Your email hasn’t been saved yet. Please try again in a moment. Your details and answers are still here.',
 prepare: data => {
  const name = String(data.get('name') || '').trim().slice(0, 60);
  const result = read();
  data.set('name', name);
  data.set('stage', result.stage);
  data.set('breakdown', emailCopy(result, name));
  return {name};
 },
 complete: ({name}) => { state.name = name; state.emailSent = true; }
});return}
if(state.view==='paid'){app.innerHTML=`<div class="eyebrow">BOOKED AF: Your Next 30</div><span class="tag">FOUNDING OFFER</span><h2>We found the problem. Now we get into the numbers and work out what to do next.</h2><p class="lead">Your numbers. Your clients. Your next 30 days - without a giant business plan.</p><div class="card"><div class="price">$49</div><p><strong>Founding price.</strong> One payment. No subscription.</p></div><div class="grid2"><div class="card"><h3>DO THIS.</h3><p>The move that deserves your attention first.</p></div><div class="card"><h3>STOP THIS.</h3><p>The habit, leak, or busywork that is not earning its place.</p></div><div class="card"><h3>WATCH THIS.</h3><p>The number that tells you whether the move worked.</p></div><div class="card"><h3>YOUR NEXT 30.</h3><p>Four weeks of clear actions built around your business.</p></div></div><div class="card"><h3>WHAT HAPPENS NEXT</h3><p>Pay securely with Stripe. After payment, you’ll come back here to answer your Next 30 questions and see your 30-day plan. Your welcome email will have the same link, so you can pick up where you left off.</p></div><div class="actions"><a class="primary" href="${next30CheckoutUrl}">BUILD MY NEXT 30 - $49 →</a><button type="button" class="secondary" id="paidback">← NOT YET</button></div><p class="fine">Your payment opens in a secure Stripe checkout.</p>`;document.getElementById('paidback').onclick=()=>{state.view='result';render()};return}
if(state.view==='deepverify'){verifyAndLoadPaid();return}
if(state.view==='deepintake'||state.view==='deepresult'){if(!window.BookedNext30){state.view='deepverify';render();return}if(state.view==='deepintake')renderCareerIntake();else renderCareerPlan();return}
const r=read();app.innerHTML=shortResultHTML(r);const dayButton=document.getElementById('daymath');if(dayButton)dayButton.onclick=()=>{state.view='daymath';render()};const planButton=document.getElementById('plan');if(planButton)planButton.onclick=()=>{state.view='plan';render()};const shareButton=document.getElementById('share');if(shareButton)shareButton.onclick=async()=>{const text=emailCopy(read(),state.name);try{if(navigator.share){await navigator.share({title:'My BOOKED AF Breakdown',text})}else if(navigator.clipboard){await navigator.clipboard.writeText(text);shareButton.textContent='COPIED. GO BE RESPONSIBLE.'}}catch(err){}};if(isStudent(state.answers))document.getElementById('paid').onclick=()=>{state.view='first90';render()};document.getElementById('edit').onclick=()=>{state.view='question';state.index=0;render()};document.getElementById('restart').onclick=()=>{state.answers={};state.done={};state.name='';state.emailSent=false;state.deepJoined=false;try{sessionStorage.removeItem(deliveryKey);sessionStorage.removeItem('booked-af-email-draft')}catch(err){};state.index=-1;state.view='intro';render()}}

function renderServiceTimeQuestion(q){
 const value=cleanServiceTime(state.answers[q.id])||{service:'',hours:'',minutes:''};
 const visible=questions.filter((x,i)=>i<=state.index&&(!x.when||x.when(state.answers))).length;
 const total=questions.filter(x=>!x.when||x.when(state.answers)).length;
 app.innerHTML=`<div class="eyebrow">Question ${visible} of ${total}</div><h2>${esc(q.title)}</h2><p>${esc(q.note)}</p><form id="service-time-form"><label for="service-name">Which service?</label><input class="input" id="service-name" required maxlength="100" value="${esc(value.service)}"><div class="grid2"><div><label for="service-hours">Hours</label><input class="input" id="service-hours" type="number" min="0" max="24" step="1" required value="${value.hours}"></div><div><label for="service-minutes">Minutes</label><input class="input" id="service-minutes" type="number" min="0" max="59" step="1" required value="${value.minutes}"></div></div><p id="service-time-error" role="alert"></p><div class="actions"><button type="button" class="secondary" id="back">← BACK</button><button type="submit" class="primary">NEXT →</button></div></form>`;
 document.getElementById('back').onclick=()=>{do{state.index--}while(state.index>0&&questions[state.index].when&&!questions[state.index].when(state.answers));render()};
 document.getElementById('service-time-form').onsubmit=event=>{
  event.preventDefault();if(!event.currentTarget.reportValidity())return;
  const answer=cleanServiceTime({service:document.getElementById('service-name').value,hours:Number(document.getElementById('service-hours').value),minutes:Number(document.getElementById('service-minutes').value)});
  if(!answer){document.getElementById('service-time-error').textContent='Name the service and enter a total time greater than zero, up to 24 hours.';return}
  state.answers[q.id]=answer;let next=state.index+1;while(next<questions.length&&questions[next].when&&!questions[next].when(state.answers))next++;
  if(next>=questions.length)state.view='teaser';else state.index=next;render();
 };
}


try{state.freePublicCopy=JSON.parse(sessionStorage.getItem('booked-free-copy')||'null')}catch{}
function read(){if(state.freePublicCopy?.schema===state.schema&&state.freePublicCopy.answers===JSON.stringify(state.answers))return {stage:state.freePublicCopy.copy.stage,publicCopy:state.freePublicCopy.copy};if(state.schema===SHORT_SCHEMA)return buildShortBreakdown(state.answers);return {stage:({building:'BUILDING',busy:'GETTING BUSY',demand:'IN DEMAND',booked:'BOOKED AF'})[state.answers.stage]||'BUILDING',top:{id:state.answers.goal||'money'}};}
