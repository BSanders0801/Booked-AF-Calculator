const {JSDOM}=require('jsdom');
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
(async()=>{
 const {buildTestWorker}=await import('../scripts/build-test-worker.mjs');
 await buildTestWorker({origin:'https://booked-af-email-test.fixture.workers.dev',checkoutUrl:'https://buy.stripe.com/test_fixture',paymentLinkId:'plink_fixture'});
 const bundle=(await import('../.test-worker/paid-bundle.mjs')).default;
 const files=['breakdown-core.js','site-content.js','paid-loader.js','app.js','lifecycle-ui.js','site-ui.js'];
 for(const paid of [false,true]){
 const dom=new JSDOM(fs.readFileSync('.test-website/index.html','utf8'),{url:'https://booked-af-email-test.fixture.workers.dev/'+(paid?'?next30=paid&session_id=cs_test_fixture':''),runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,ctx=dom.getInternalVMContext(),errors=[];w.scrollTo=()=>{};w.AbortSignal=AbortSignal;
 w.addEventListener('error',e=>errors.push(e.error));
 w.fetch=async url=>String(url).endsWith('/paid-content')?new Response(bundle,{headers:{'Content-Type':'text/javascript'}}):Response.json({ready:true,schemas:['short-v5'],success:true});
 w.URL.createObjectURL=()=> 'blob:fixture';w.URL.revokeObjectURL=()=>{};
 const append=w.document.head.append.bind(w.document.head);w.document.head.append=el=>{if(el.src==='blob:fixture'){vm.runInContext(bundle,ctx);queueMicrotask(()=>el.onload());}else append(el);};
 for(const file of files)vm.runInContext(fs.readFileSync('.test-website/'+file,'utf8'),ctx,{filename:file});
 const run=s=>vm.runInContext(s,ctx);await new Promise(r=>setTimeout(r,40));
 if(paid){
  assert.equal(run('state.next30Verified'),true);assert.equal(run('state.view'),'deepintake');
  for(let n=0;run('state.view')==='deepintake';n++){
   assert(n<40);const next=w.document.querySelector('#next30-next');if(next.disabled)(w.document.querySelector('[data-next30-choice="money"]')||w.document.querySelector('[data-next30-choice]')).click();w.document.querySelector('#next30-next').click();
  }
  assert(w.document.querySelector('#money-map'),run('state.view')+' '+w.document.querySelector('#app').textContent.slice(0,700)+' '+errors.map(e=>e.message).join(';'));
 }else{
  assert.equal(run('typeof BookedNext30'),'undefined');
  for(const view of ['intro','sample','next30sample','paid','plans','about','privacy','contact'])run(`state.view='${view}';render()`);
  run("state.next30Verified=true;state.view='deepresult';render()");assert(!w.document.querySelector('#money-map'));
  run("restoreSchema(SHORT_SCHEMA);state.answers={};for(const q of questions){if(!q.when||q.when(state.answers)){const c=shortChoices(q,state.answers);state.answers[q.id]=q.multi?[c[0][0]]:c[0][0]}}state.emailSent=true;state.view='result';render()");
  assert(w.document.querySelector('#share'));
 }
 assert.deepEqual(errors,[]);dom.window.close();
 }
 console.log('PASS: generated public bundle, public navigation and results, tampering denied, server-delivered paid bundle and complete intake.');
})().catch(e=>{console.error(e);process.exitCode=1});
