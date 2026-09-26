// DOM integration checks. Email, security verification, and payments are mocked.
const {JSDOM}=require('jsdom');
const fs=require('node:fs');const vm=require('node:vm');const assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const savedKey='booked-af-free-progress-v1';
const deliveryKey='booked-af-delivery-v1';
function boot({hash='',saved=null,delivery=null,blocked=false,search=''}={}){
 const dom=new JSDOM(html,{url:'https://preview.example.test/'+search+hash,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;const errors=[];const network={accept:false,posts:0};
 w.addEventListener('error',e=>errors.push(e.error));
 w.scrollTo=()=>{};w.AbortSignal=AbortSignal;
 w.turnstile={render:(_el,opts)=>{opts.callback('mock-token');return 'mock';},remove:()=>{},reset:()=>{}};
 w.fetch=async (url,options={})=>{
  if(options.method==='POST'){
   network.posts++;
   assert.equal(JSON.parse(options.body).email,'test@example.test');
   return {ok:network.accept,status:network.accept?200:503,json:async()=>({success:network.accept})};
  }
  return {ok:true,json:async()=>url.includes('verify-checkout')?{paid:false}:{ready:true,schemas:['short-v3']}};
 };
 if(saved)w.localStorage.setItem(savedKey,JSON.stringify(saved));
 if(delivery)w.sessionStorage.setItem(deliveryKey,JSON.stringify(delivery));
 if(blocked)w.Storage.prototype.setItem=()=>{throw Error('storage unavailable')};
 const ctx=dom.getInternalVMContext();
 for(const f of ['day-math.js','breakdown-core.js','site-content.js','app.js','site-ui.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
 const $=s=>w.document.querySelector(s);
 const click=s=>{assert($(s),'Missing '+s);$(s).click();assert.equal(errors.length,0,errors.map(e=>e.stack).join('\n'));};
 return {dom,w,$,click,errors,network};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
 const sessions=[];const start=options=>{const d=boot(options);sessions.push(d);return d;};
 try{
  const d=start();
  assert.match(d.$('#app').textContent,/3 minutes. 3 next moves. Email required/);
  assert.doesNotMatch(d.$('#app').textContent,/Deep Dive|YOUR STAGE/);
  assert.equal(d.$('.brand-logo').getAttribute('src'),'assets/booked-af-logo.png');
  d.click('header [data-nav="paid"]');assert.match(d.$('#app').textContent,/One plan. One payment/);
  d.click('[data-nav="next30sample"]');assert.match(d.$('#app').textContent,/THIS IS WHAT/);assert.match(d.$('#app').textContent,/STOP THIS/);assert.match(d.$('#app').textContent,/WEEK 4/);
  d.click('[data-nav="paid"]');d.click('.checkout-link');assert.match(d.$('#preview-checkout-note').textContent,/Checkout is kept off/);
  d.click('header [data-nav="question"]');assert.match(d.$('#app').textContent,/WHAT’S YOUR HAIR GAME/);
  for(let i=0;i<20&&d.$('#next');i++){d.click('.choice');d.click('#next');}
  await tick();assert(d.$('#form'));assert(!d.$('#skip'));assert(!d.$('#plan'));
  d.click('#form button[type="submit"]');assert.equal(d.network.posts,0);
  const beforeEmail=JSON.parse(d.w.localStorage.getItem(savedKey));
  d.$('#email').value='test@example.test';
  await d.$('#form').onsubmit({preventDefault(){}});
  assert.match(d.$('#error').textContent,/temporarily unavailable/);assert(!d.$('#plan'));
  d.click('header [data-nav="intro"]');d.click('header [data-nav="resume"]');
  await tick();assert(d.$('#form'));d.network.accept=true;d.$('#email').value='test@example.test';
  await d.$('#form').onsubmit({preventDefault(){}});
  assert.match(d.$('#app').textContent,/DO THESE 3 THINGS/);assert.equal(d.network.posts,2);
  d.click('#plan');d.click('[data-task]');assert.match(d.$('#checklist-status').textContent,/1 of 3/);
  const saved=JSON.parse(d.w.localStorage.getItem(savedKey));
  const delivery=JSON.parse(d.w.sessionStorage.getItem(deliveryKey));
  assert(saved.answers.goal);assert(!('email' in saved));assert.equal(delivery.emailSent,true);
  const reload=start({hash:'#my-plan',saved,delivery});
  assert(reload.$('[data-task]').checked);assert.match(reload.$('#checklist-status').textContent,/1 of 3/);
  reload.click('header [data-nav="intro"]');reload.click('header [data-nav="resume"]');assert.match(reload.$('#app').textContent,/Seven days/);
  reload.click('#backread');reload.click('#daymath');
  for(const [id,value] of Object.entries({sales:'400',hours:'4',rate:'50'}))reload.$('#'+id).value=value;
  reload.$('#dayform').dispatchEvent(new reload.w.Event('submit',{bubbles:true,cancelable:true}));
  assert.match(reload.$('#dayresult').textContent,/\$200/);assert.match(reload.$('#dayresult').textContent,/\$50 an hour/);
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
  for(const s of sessions)assert.equal(s.errors.length,0,s.errors.map(e=>e.stack).join('\n'));
  console.log('PASS: homepage copy; quiz; required email; blank and failed email blocked; accepted email unlocks; resume, refresh, checklist and calculator; URL bypass blocked; privacy and clearing; corrupt/blocked storage; paid-route isolation. No real emails or payments.');
 }finally{for(const s of sessions)s.dom.window.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
