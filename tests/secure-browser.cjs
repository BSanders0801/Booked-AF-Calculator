// Exercise the shipped public package with the actual protected bundle. Provider requests are mocked.
const {chromium,webkit}=require('playwright');
const engine=process.env.BROWSER_ENGINE||'chromium';
if(!['chromium','webkit'].includes(engine))throw Error('Unknown browser engine');
const fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.browser-review/secure'+(engine==='chromium'?'':'-'+engine));
(async()=>{
 const {buildTestWorker}=await import('../scripts/build-test-worker.mjs');
 const base='https://booked-af-email-test.fixture.workers.dev';
 await buildTestWorker({origin:base,checkoutUrl:'https://buy.stripe.com/test_fixture',paymentLinkId:'plink_fixture'});
 const bundle=(await import('../.test-worker/paid-bundle.mjs')).default;
 const publicRoot=path.join(root,'.test-website');
 const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');const rel=url.pathname==='/'?'index.html':url.pathname.slice(1);const p=path.resolve(publicRoot,rel);if(!p.startsWith(publicRoot+path.sep)){res.writeHead(404).end();return}try{res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':p.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(p))}catch{res.writeHead(404).end()}}).listen(8766,'127.0.0.1');
 const browser=await ({chromium,webkit}[engine]).launch({headless:true});const results=[];fs.mkdirSync(out,{recursive:true});
 try{for(const width of [320,390,768,1280]){
  const page=await browser.newPage({viewport:{width,height:900}});const errors=[];let leadAttempts=0,surveyPayload=null;page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.qaVerificationResets=0;window.turnstile={render:(el,opts)=>{window.qaVerify=opts.callback;opts.callback('fixture-token');return 1},remove:()=>{},reset:()=>{window.qaVerificationResets++;window.qaVerify('fixture-token-renewed')}}});
  await page.route('**/*',route=>{const url=route.request().url();
   if(url.startsWith('http://127.0.0.1:8766')||url.startsWith('blob:'))return route.continue();
   if(url.endsWith('/lead-test')&&route.request().method()==='POST'){
    const attempt=leadAttempts++;
    if(attempt<2)return route.fulfill({status:403,contentType:'application/json',body:JSON.stringify({success:false,...(attempt===1?{code:'TEST_RECIPIENT_NOT_APPROVED'}:{})})});
   }
   if(url.endsWith('/survey')){surveyPayload=route.request().postDataJSON();return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true})});}
   if(url.endsWith('/paid-content'))return route.fulfill({status:route.request().headers().authorization==='Bearer cs_test_fixture'?200:403,contentType:'text/javascript',body:bundle});
   return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ready:true,schemas:['short-v5'],success:true,paid:false})});
  });
  await page.goto('http://127.0.0.1:8766');
  await page.waitForFunction(()=>typeof state!=='undefined');
  assert.equal(await page.evaluate(()=>typeof BookedNext30),'undefined');
  // Tampering with local state does not conjure paid source or assets.
  await page.evaluate(()=>{state.next30Verified=true;state.view='deepresult';render()});
  assert.equal(await page.locator('#money-map').count(),0);
  await page.reload();
  for(const view of ['intro','sample','next30sample','paid','plans','about','privacy','contact']){
   await page.evaluate(view=>{state.view=view;render()},view);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${width} ${view} overflow`);
  }
  await page.locator('header [data-nav="question"]').click();
  let steps=0;
  while(await page.evaluate(()=>state.view==='question')){
   assert(++steps<40);
   const choices=page.locator('[data-value]');await choices.first().click();
   const next=page.locator('#next');if(await next.count())await next.click();
  }
  assert.equal(await page.evaluate(()=>state.view),'email');
  await page.locator('input[name="name"]').fill('Test');await page.locator('input[name="email"]').fill('other@example.invalid');
  await page.locator('#form button[type="submit"]').click();
  await page.waitForFunction(()=>window.qaVerificationResets===1);
  assert.equal(await page.locator('input[name="email"]').inputValue(),'other@example.invalid');
  assert.equal(await page.evaluate(()=>state.view),'email');
  assert.match(await page.locator('#app').innerText(),/Verification was not accepted/);
  assert.doesNotMatch(await page.locator('#app').innerText(),/use the official website instead/);
  await page.locator('#form button[type="submit"]').click();
  await page.waitForFunction(()=>window.qaVerificationResets===2);
  assert.match(await page.locator('#app').innerText(),/only accepts the email approved for testing/);
  assert.doesNotMatch(await page.locator('#app').innerText(),/Verification was not accepted/);
  assert.equal(await page.locator('input[name="name"]').inputValue(),'Test');
  assert.equal(await page.locator('input[name="email"]').inputValue(),'other@example.invalid');
  assert.equal(await page.evaluate(()=>state.view),'email');
  await page.locator('input[name="email"]').fill('recipient@example.invalid');
  await page.locator('#form button[type="submit"]').click();await page.waitForFunction(()=>state.view==='result');
  assert(!/MONTHLY MONEY MAP|STEAL THESE WORDS/.test(await page.locator('#app').innerText()));
  await page.screenshot({path:path.join(out,`${width}-free.png`),fullPage:true});
  // Render the new named-service input from the shipped public package.
  await page.evaluate(()=>{restoreSchema(SHORT_SCHEMA);state.answers={careerstage:'working',worktype:['color'],goal:['money'],paymodel:'commission'};state.index=questions.findIndex(q=>q.id==='servicehours');state.view='question';render()});
  await page.locator('#service-name').fill('Root touch-up');await page.locator('#service-hours').fill('1');await page.locator('#service-minutes').fill('45');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${width} service-time overflow`);
  await page.locator('#service-time-form button[type="submit"]').click();
  assert.deepEqual(await page.evaluate(()=>state.answers.servicehours),{service:'Root touch-up',hours:1,minutes:45});
  await page.goto('http://127.0.0.1:8766/?next30=paid&session_id=cs_test_fixture');
  await page.waitForSelector('[data-next30-choice]');
  // Go through real intake controls rather than force a paid result.
  await page.locator('[data-next30-choice="color"]').click();await page.locator('#next30-next').click();
  steps=0;
  while(await page.evaluate(()=>state.view==='deepintake')){
   assert(++steps<40);
   if(await page.locator('#next30-next').isDisabled()){const money=page.locator('[data-next30-choice="money"]');await (await money.count()?money:page.locator('[data-next30-choice]').first()).click();}
   await page.locator('#next30-next').click();
  }
  await page.locator('#money-map').waitFor();
  await page.selectOption('#mmm-pay-type','employee');
  for(const [k,v] of Object.entries({gross:5000,tips:500,bonus:0,net:4200,days:16}))await page.locator('#mmm-emp-'+k).fill(String(v));
  await page.locator('#mmm-calc').click();
  assert.match(await page.locator('#mmm-result').innerText(),/5,500/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${width} paid overflow`);
  await page.screenshot({path:path.join(out,`${width}-paid.png`),fullPage:true});
  const portable=await page.evaluate(()=>JSON.stringify(state.careerData));
  await page.reload();assert.equal(await page.locator('#money-map').count(),0,'refresh without private credential must reverify');
  // Render the new named-service input from the shipped public package.
  await page.evaluate(()=>{restoreSchema(SHORT_SCHEMA);state.answers={careerstage:'working',worktype:['color'],goal:['money'],paymodel:'commission'};state.index=questions.findIndex(q=>q.id==='servicehours');state.view='question';render()});
  await page.locator('#service-name').fill('Root touch-up');await page.locator('#service-hours').fill('1');await page.locator('#service-minutes').fill('45');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,`${width} service-time overflow`);
  await page.locator('#service-time-form button[type="submit"]').click();
  assert.deepEqual(await page.evaluate(()=>state.answers.servicehours),{service:'Root touch-up',hours:1,minutes:45});
  await page.goto('http://127.0.0.1:8766/?next30=paid&session_id=cs_test_fixture');await page.locator('#money-map').waitFor();
  assert.equal(await page.locator('#mmm-emp-gross').inputValue(),'5000');
  await page.locator('#next30-import').setInputFiles({name:'saved-plan.json',mimeType:'application/json',buffer:Buffer.from(portable)});
  await page.waitForSelector('#mmm-emp-gross');assert.equal(await page.locator('#mmm-emp-gross').inputValue(),'5000');
  await page.goto('http://127.0.0.1:8766/?survey=paid&session_id=cs_test_fixture#survey');
  for(const [name,value] of Object.entries({rating:'5',ease:'pretty easy',useful:'using it',recommend:'probably'}))await page.locator(`label:has(input[name="${name}"][value="${value}"])`).click();
  await page.locator('#booked-survey button[type="submit"]').click();
  await page.getByRole('heading',{name:'THANK YOU.',exact:true}).waitFor();
  assert.deepEqual(surveyPayload.more,[],'survey allows omitted optional help topics');
  assert.equal(surveyPayload.session_id,'cs_test_fixture');
  assert.deepEqual(errors,[]);
  results.push({engine,width,verificationRetry:'pass',recipientCorrection:'pass',freeForm:'pass',navigation:'pass',clientTampering:'denied',protectedLoad:'pass',moneyMap:'pass',restore:'pass',optionalSurveyTopics:'pass',overflow:false,errors});await page.close();
 }
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
