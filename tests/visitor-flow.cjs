// Offline DOM tests: all network calls, email delivery, and Turnstile are mocked.
const {JSDOM}=require('jsdom');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
function snapshot(d,name){if(process.env.BOOKED_QA_SNAPSHOTS){const html=d.dom.serialize().replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');fs.writeFileSync(process.env.BOOKED_QA_SNAPSHOTS+'/'+name+'.html',html);}}
const tick=()=>new Promise(r=>setImmediate(r));
function boot(saved){
 const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://bookedandfabulous.com/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,ctx=dom.getInternalVMContext(),errors=[],requests=[];
 w.scrollTo=()=>{};w.AbortSignal=AbortSignal;
 w.addEventListener('error',e=>errors.push(e.error));
 let accept=false,callback;
 w.turnstile={render:(el,o)=>{callback=o.callback;callback('test-token');return 'test';},reset:()=>callback('test-token'),remove:()=>{}};
 w.fetch=async(url,opts={})=>{
  if(opts.method==='POST'){requests.push({url,...JSON.parse(opts.body)});return {ok:accept,status:accept?200:503,json:async()=>({success:accept})};}
  return {ok:true,json:async()=>({ready:true,schemas:['short-v5']})};
 };
 if(saved)w.localStorage.setItem('booked-af-free-progress-v1',JSON.stringify(saved));
 for(const f of ['breakdown-core.js','personalization.js','site-content.js','paid-loader.js','app.js','lifecycle-ui.js','site-ui.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
 const $=s=>w.document.querySelector(s);
 const click=s=>{assert($(s),'Missing '+s);$(s).click();assert.equal(errors.length,0,errors.map(e=>e.stack).join('\n'));};
 return {dom,w,ctx,$,click,requests,accept:()=>accept=true};
}
(async()=>{
 const d=boot();
 try{
 assert.match(d.$('#app').textContent,/GET BOOKED/);
 d.click('header [data-nav="paid"]');assert.match(d.$('#app').textContent,/THE NEXT STEP IS COMING/);assert(!d.$('a[href*="buy.stripe.com"]'));
 for(const nav of ['about','contact','privacy','resume']){d.click(`header [data-nav="${nav}"]` .replace('header [data-nav="contact"]','footer [data-nav="contact"]').replace('header [data-nav="privacy"]','footer [data-nav="privacy"]'));assert(d.$('#app h1'));}
 d.click('header [data-nav="question"]');assert(d.$('#next').disabled);
 d.click('[data-value="working"]');d.click('#next');
 d.click('[data-value="color"]');d.click('[data-value="education"]');
 assert.equal(d.w.document.querySelectorAll('.choice.selected').length,2);
 d.click('[data-value="education"]');d.click('#next');
 for(let i=0;i<35&&d.$('#next');i++){d.click('.choice');d.click('#next');}
 await tick();assert(d.$('#form'),'Email required before results');assert(!d.$('.free-action-list'));
 d.$('#name').value='Test';d.$('#name').dispatchEvent(new d.w.Event('input',{bubbles:true}));
 d.$('#email').value='test@example.test';d.$('#email').dispatchEvent(new d.w.Event('input',{bubbles:true}));
 assert.equal(d.$('[name="marketingConsent"]').checked,false);snapshot(d,'email-qa');
 d.click('.capture-note [data-nav="privacy"]');d.click('header [data-nav="resume"]');d.click('#resume-free');await tick();
 assert.equal(d.$('#name').value,'Test');assert.equal(d.$('#email').value,'test@example.test');
 d.click('#edit-email-answers');assert(d.$('#next'));assert(d.$('.choice.selected'));
 for(let i=0;i<35&&d.$('#next');i++){if(d.$('#next').disabled)d.click('.choice');d.click('#next');}
 await tick();assert.equal(d.$('#email').value,'test@example.test');
 d.$('#email').value='invalid';await d.$('#form').onsubmit({preventDefault(){}});assert.equal(d.requests.filter(x=>x.type==='breakdown').length,0);
 d.$('#email').value='test@example.test';await d.$('#form').onsubmit({preventDefault(){}});assert.match(d.$('#error').textContent,/temporarily unavailable/);assert(!d.$('button[type="submit"]').disabled);assert(d.$('#form'));
 d.accept();await d.$('#form').onsubmit({preventDefault(){}});assert(!d.$('#form'));assert(d.$('.free-action-list'));snapshot(d,'result-qa');assert.equal(d.requests.filter(x=>x.type==='breakdown').at(-1).marketingConsent,false);
 d.click('#edit');d.click('#next');assert(d.$('.choice.selected'));
 console.log('PASS navigation, multi-select, required email, privacy return, answer editing, validation, failed submission recovery, successful results, separate consent');
 const stored=JSON.parse(d.w.localStorage.getItem('booked-af-free-progress-v1'));
 const r=boot(stored);try{r.click('header [data-nav="resume"]');r.click('#resume-free');assert(r.$('#next')||r.$('#form'));}finally{r.dom.window.close();}
 console.log('PASS saved progress recovery');
 }finally{d.dom.window.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

