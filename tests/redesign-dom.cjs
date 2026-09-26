// DOM-only integration checks; no browser, payment, or real email is used.
const {JSDOM}=require('jsdom');
const fs=require('node:fs');const vm=require('node:vm');const assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
const savedKey='booked-af-free-progress-v1';
function boot({hash='',saved=null,blocked=false,search=''}={}){
 const dom=new JSDOM(html,{url:'https://preview.example.test/'+search+hash,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window; const errors=[]; w.addEventListener('error',e=>errors.push(e.error));
 w.scrollTo=()=>{};w.AbortSignal=AbortSignal;w.fetch=async url=>({ok:true,json:async()=>url.includes('verify-checkout')?{paid:false}:{ready:true,schemas:['short-v1']}});
 if(saved)w.localStorage.setItem(savedKey,JSON.stringify(saved));
 if(blocked)w.Storage.prototype.setItem=()=>{throw Error('storage unavailable')};
 const ctx=dom.getInternalVMContext();for(const f of ['day-math.js','breakdown-core.js','site-content.js','app.js','site-ui.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
 const $=s=>w.document.querySelector(s);const click=s=>{assert($(s),'Missing '+s);$(s).click();assert.equal(errors.length,0,errors.map(e=>e.stack).join('\n'));};
 return {dom,w,$,click,errors};
}
const d=boot();assert.match(d.$('#app').textContent,/MAKE MORE/);assert.equal(d.$('.brand-logo').getAttribute('src'),'assets/booked-af-logo.png');
d.click('header [data-nav="paid"]');assert.match(d.$('#app').textContent,/One plan. One payment/);assert.equal(d.w.location.hash,'#deep-dive');
d.click('.checkout-link');assert.match(d.$('#preview-checkout-note').textContent,/Checkout is kept off/);
d.click('header [data-nav="question"]');assert.match(d.$('#app').textContent,/WHAT ARE WE FIXING FIRST/);
for(let i=0;i<20 && d.$('#next');i++){const choices=[...d.w.document.querySelectorAll('.choice')];assert(choices.length);choices[0].click();d.click('#next');}
assert(d.$('#skip'));d.click('#skip');assert.match(d.$('#app').textContent,/YOUR THREE MOVES THIS WEEK/);d.click('#plan');
const box=d.$('[data-task]');box.click();assert.match(d.$('#checklist-status').textContent,/1 of 3/);assert.match(box.getAttribute('aria-label'),/Mark/);
const saved=JSON.parse(d.w.localStorage.getItem(savedKey));assert(saved.answers.goal);assert(!('email' in saved));
const reload=boot({hash:'#my-plan',saved});assert(reload.$('[data-task]').checked);assert.match(reload.$('#checklist-status').textContent,/1 of 3/);
reload.click('header [data-nav="intro"]');reload.click('header [data-nav="resume"]');assert.match(reload.$('#app').textContent,/Seven days/);
reload.click('#backread');reload.click('#daymath');for(const [id,value] of Object.entries({sales:'400',hours:'4',rate:'50'}))reload.$('#'+id).value=value;
reload.$('#dayform').dispatchEvent(new reload.w.Event('submit',{bubbles:true,cancelable:true}));assert.match(reload.$('#dayresult').textContent,/\$200/);assert.match(reload.$('#dayresult').textContent,/\$50 an hour/);
const empty=boot({hash:'#my-plan'});assert(empty.$('#next'));assert(empty.$('#next').disabled);
const bad=boot({hash:'#my-plan',saved:{...saved,answers:{goal:'<script>'}}});assert(bad.$('#next'));assert.equal(bad.errors.length,0);
const blocked=boot({blocked:true});blocked.click('header [data-nav="question"]');blocked.$('.choice').click();assert.equal(blocked.$('#storage-error').hidden,false);
const paid=boot({search:'?deepdive=paid&session_id=cs_test_123',hash:'#my-plan',saved});assert.match(paid.$('#app').textContent,/Checking your payment/);assert(!paid.$('#dnext'));
for(const v of [d,reload,empty,bad,blocked,paid])v.dom.window.close();
console.log('PASS: real quiz -> personalized plan, direct offer, preview checkout block, refresh/checklist persistence, return navigation, calculator, corrupt/blocked storage, paid-route verification isolation.');
