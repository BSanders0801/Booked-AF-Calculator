// DOM integration checks. Email, security verification, and payments are mocked.
const {JSDOM}=require('jsdom');
const fs=require('node:fs');const vm=require('node:vm');const assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const savedKey='booked-af-free-progress-v1';
const deliveryKey='booked-af-delivery-v1';
function boot({hash='',saved=null,delivery=null,blocked=false,search='',profile=null}={}){
 const dom=new JSDOM(html,{url:'https://preview.example.test/'+search+hash,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;const errors=[];const network={accept:false,posts:0,profileSaves:[],holdProfile:false,releaseProfile:null};
 w.addEventListener('error',e=>errors.push(e.error));
 w.scrollTo=()=>{};w.AbortSignal=AbortSignal;
 w.turnstile={render:(_el,opts)=>{opts.callback('mock-token');return 'mock';},remove:()=>{},reset:()=>{}};
 w.fetch=async (url,options={})=>{
  if(String(url).endsWith('/events'))return {ok:true,status:200,json:async()=>({success:true})};
  if(String(url).endsWith('/profile')){
   const data=JSON.parse(options.body);network.profileSaves.push(data);
   if(network.holdProfile)await new Promise(resolve=>{network.releaseProfile=resolve;});
   return {ok:true,status:200,json:async()=>({success:true,profile:{id:'test-profile',answers:data.answers,done:data.done}})};
  }
  if(options.method==='POST'){
   network.posts++;
   assert.equal(JSON.parse(options.body).email,'test@example.test');
   return {ok:network.accept,status:network.accept?200:503,json:async()=>({success:network.accept})};
  }
  return {ok:true,json:async()=>url.includes('verify-checkout')?{paid:false}:{ready:true,schemas:['short-v5']}};
 };
 if(saved)w.localStorage.setItem(savedKey,JSON.stringify(saved));
 if(delivery)w.sessionStorage.setItem(deliveryKey,JSON.stringify(delivery));
 if(profile)w.localStorage.setItem('booked-af-career-profile-v1',JSON.stringify(profile));
 if(blocked)w.Storage.prototype.setItem=()=>{throw Error('storage unavailable')};
 const ctx=dom.getInternalVMContext();
 for(const f of ['day-math.js','breakdown-core.js','site-content.js','next30-core.js','next30-ui.js','app.js','lifecycle-ui.js','site-ui.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
 const $=s=>w.document.querySelector(s);
 const click=s=>{assert($(s),'Missing '+s);$(s).click();assert.equal(errors.length,0,errors.map(e=>e.stack).join('\n'));};
 return {dom,w,$,click,errors,network};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
 const sessions=[];const start=options=>{const d=boot(options);sessions.push(d);return d;};
 try{
  const d=start();
  assert.match(d.$('#app').textContent,/3 minutes. A clearer picture. Email required/);
  assert.doesNotMatch(d.$('#app').textContent,/Deep Dive|YOUR STAGE/);
  assert.equal(d.$('.brand-logo').getAttribute('src'),'assets/booked-af-logo.webp');
  assert.match(d.$('#app').textContent,/YOUR CHAIR IS A BUSINESS.YOUR LIFE IS NOT THE OVERHEAD/);
  assert.equal(d.w.document.querySelectorAll('.brand-hero button').length,1);
  assert.match(d.$('#app').textContent,/Your work changes.So should the advice/);
  assert.equal(d.w.document.querySelectorAll('[data-career-sample]').length,5);
  d.click('[data-career-sample="session"]');
  assert.match(d.$('[data-career-sample-panel]').textContent,/SESSION/);
  d.click('[data-nav="sample"]');
  for(const role of ['events','education','owner']){
   d.click(`[data-career-sample="${role}"]`);
   assert.doesNotMatch(d.$('[data-career-sample-panel]').textContent,/DO THESE 3 THINGS|WATCH THIS/);
  }
  d.click('[data-career-sample-detail="manager"]');
  assert.match(d.$('[data-career-sample-panel]').textContent,/MANAGER/);
  d.click('[data-nav="intro"]');
  d.click('header [data-nav="paid"]');assert.match(d.$('#app').textContent,/YOUR CAREER. ONE PAYMENT/);
  d.click('[data-nav="next30sample"]');assert.match(d.$('#app').textContent,/A PLAN YOU CAN ACTUALLY USE/);assert.doesNotMatch(d.$('#app').textContent,/STOP THIS|WEEK 1|ONE SCRIPT TO STEAL/);
  d.click('[data-nav="paid"]');d.click('.checkout-link');assert.match(d.$('#preview-checkout-note').textContent,/Checkout is kept off/);
  d.click('header [data-nav="question"]');assert.match(d.$('#app').textContent,/WHERE ARE YOU IN YOUR HAIR CAREER/);d.click('[data-value="working"]');d.click('#next');assert.match(d.$('#app').textContent,/WHAT’S YOUR HAIR GAME/);
  for(let i=0;i<20&&d.$('#next');i++){d.click('.choice');d.click('#next');}
  await tick();assert(d.$('#form'));assert(!d.$('#skip'));assert(!d.$('#plan'));
  d.click('#form button[type="submit"]');assert.equal(d.network.posts,0);
  const beforeEmail=JSON.parse(d.w.localStorage.getItem(savedKey));
  d.$('#email').value='test@example.test';
  await d.$('#form').onsubmit({preventDefault(){}});
  assert.match(d.$('#error').textContent,/temporarily unavailable/);assert(!d.$('#plan'));
  d.click('header [data-nav="intro"]');d.click('header [data-nav="resume"]');d.click('#resume-free');
  await tick();assert(d.$('#form'));d.network.accept=true;d.$('#email').value='test@example.test';
  await d.$('#form').onsubmit({preventDefault(){}});
  assert.match(d.$('#app').textContent,/WHAT MAY BE GETTING IN THE WAY/);assert.equal(d.network.posts,2);
  assert(!d.$('#plan'));assert(!d.$('#daymath'));assert(!d.$('[data-task]'));
  const saved=JSON.parse(d.w.localStorage.getItem(savedKey));
  const delivery=JSON.parse(d.w.sessionStorage.getItem(deliveryKey));
  assert(saved.answers.goal);assert(!('email' in saved));assert.equal(delivery.emailSent,true);
  const reload=start({hash:'#my-plan',saved,delivery});
  assert(!reload.$('[data-task]'));assert.match(reload.$('#app').textContent,/WHAT MAY BE GETTING IN THE WAY/);
  reload.click('header [data-nav="intro"]');reload.click('header [data-nav="resume"]');reload.click('#resume-free');
  assert.match(reload.$('#app').textContent,/WHAT MAY BE GETTING IN THE WAY/);
  const math=start({hash:'#chair-math'});assert(!math.$('#dayform'));assert.match(math.$('#app').textContent,/YOUR CAREER. ONE PAYMENT/);
  const bypass=start({hash:'#my-plan',saved:beforeEmail,search:'?breakdown=sent'});
  assert(bypass.$('#form'));assert(!bypass.$('[data-task]'));assert(!bypass.$('#skip'));
  const falseDelivery=start({hash:'#my-breakdown',saved:beforeEmail,delivery:{...delivery,emailSent:false},search:'?breakdown=sent'});
  assert(falseDelivery.$('#form'));assert(!falseDelivery.$('#plan'));
  reload.click('[data-nav="privacy"]');assert.match(reload.$('#app').textContent,/Privacy Policy/);
  assert.match(reload.$('#app').textContent,/BOOKED AF receives a copy/);
  reload.click('[data-clear-progress]');assert.equal(reload.w.localStorage.getItem(savedKey),null);assert.equal(reload.w.sessionStorage.getItem(deliveryKey),null);
  const empty=start({hash:'#my-plan'});assert(empty.$('#next'));assert(empty.$('#next').disabled);
  const bad=start({hash:'#my-plan',saved:{...saved,answers:{goal:'<script>'}}});assert(bad.$('#next'));assert.equal(bad.errors.length,0);
  const blocked=start({blocked:true});blocked.click('header [data-nav="question"]');blocked.click('.choice');assert.equal(blocked.$('#storage-error').hidden,false);
  const paid=start({search:'?deepdive=paid&session_id=cs_test_123',hash:'#my-plan',saved});assert.match(paid.$('#app').textContent,/Checking your payment/);assert(!paid.$('#dnext'));
  // Student enters through the same front door, with no working-business questions.
  const directStudent=start();directStudent.click('.student-entry');assert.match(directStudent.$('#app').textContent,/WHAT KIND OF HAIR WORK INTERESTS YOU/);
  const student=start();student.click('header [data-nav="question"]');student.click('[data-value="school"]');student.click('#next');
  let studentScreens=[];
  while(student.$('#next')){studentScreens.push(student.$('#app h2').textContent);student.click('.choice');student.click('#next');}
  assert(!studentScreens.some(t=>/PAYS THE BILLS|FULL IS YOUR BOOK|WORK CALENDAR|TALK PAY/.test(t)));
  await tick();assert(student.$('#first90-optin'));assert.equal(student.$('#first90-optin').checked,false);
  student.network.accept=true;student.$('#email').value='test@example.test';await student.$('#form').onsubmit({preventDefault(){}});
  assert.match(student.$('#app').textContent,/WHAT MAY BE GETTING IN THE WAY/);assert(!student.$('#daymath'));assert.match(student.$('#paid').textContent,/FIRST 90/);
  student.click('#paid');assert.match(student.$('#app').textContent,/nothing to buy yet/);assert(!student.$('.checkout-link'));
  student.click('#first90-email');await tick();assert(student.$('#first90-optin').checked);student.$('#email').value='test@example.test';await student.$('#form').onsubmit({preventDefault(){}});
  student.click('#paid');assert.match(student.$('#app').textContent,/YOU’RE ON THE LIST/);student.click('#first90-back');assert(!student.$('[data-task]'));
  student.click('[data-career-update]');assert.match(student.$('#app').textContent,/WHERE ARE YOU IN YOUR HAIR CAREER/);student.click('[data-value="building"]');student.click('#next');assert.match(student.$('#app').textContent,/WHAT’S YOUR HAIR GAME/);
  for(const s of sessions)assert.equal(s.errors.length,0,s.errors.map(e=>e.stack).join('\n'));
  console.log('PASS: homepage copy; quiz; required email; blank and failed email blocked; accepted email unlocks; resume, refresh, free-content boundary and retired calculator route; URL bypass blocked; privacy and clearing; corrupt/blocked storage; paid-route isolation. No real emails or payments.');
 }finally{for(const s of sessions)s.dom.window.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
