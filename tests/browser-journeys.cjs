// Full browser journeys. All external requests are intercepted: never sends email.
const {chromium}=require('playwright'),fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
(async()=>{
 const root=process.cwd();const server=http.createServer((req,res)=>{let file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));if(file===root)file=path.join(root,'index.html');if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}if(file.endsWith(path.sep))file+='index.html';try{res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']}: {})});let count=0;
 async function journey(width,answers){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage(),errors=[],posts=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.addInitScript(()=>{window.turnstile={render:(el,o)=>{window._verify=o.callback;o.callback('qa-only-token');return 'qa';},reset:()=>window._verify?.('qa-only-token'),remove:()=>{}};});
  await page.route('**/*',async route=>{const req=route.request();if(req.url().startsWith(origin))return route.continue();if(req.url().startsWith('https://booked-af-email.')){if(req.method()==='POST'){if(req.postDataJSON()?.type==='breakdown')posts.push(req.postDataJSON());return route.fulfill({json:{success:true,breakdown:{stage:'BUILDING',title:'STALE SERVER COPY',body:'Must not replace current browser answers.'}}});}return route.fulfill({json:{ready:true,schemas:['short-v5']}});}return route.fulfill({status:200,body:'',contentType:'application/javascript'});});
  const layout=async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Horizontal overflow at '+width+' '+JSON.stringify(answers));
  try{
   await page.goto(origin);await page.locator('header [data-nav="question"]').click();
   let seen=0;
   while(await page.locator('#next,#service-time-form').count()){
    assert(++seen<35);await layout();assert(await page.locator('#app h1,#app h2').first().evaluate(el=>document.activeElement===el),'Question heading must receive focus');const q=await page.evaluate(()=>({id:questions[state.index].id,multi:questions[state.index].multi,type:questions[state.index].type}));
    if(q.type==='service-time'){await page.locator('#service-name').fill('Full highlights');await page.locator('#service-hours').fill('3');await page.locator('#service-minutes').fill('0');await page.locator('#service-time-form button[type="submit"]').click();continue;}
    const selected=answers[q.id];if(selected!==undefined){for(const v of Array.isArray(selected)?selected:[selected])await page.locator('[data-value="'+v+'"]').click();}else await page.locator('.choice').first().click();
    await page.locator('#next').click();
   }
   await page.locator('#form').waitFor();await layout();assert.equal(await page.locator('[name="marketingConsent"]').isChecked(),false);
   await page.locator('#name').fill('QA');await page.locator('#email').fill('qa@example.test');await page.locator('#form button[type="submit"]').click();await page.locator('.free-action-list').waitFor();await layout();
   assert.equal(await page.locator('.free-action-list li').count(),3);assert(!await page.locator('#app').textContent().then(x=>x.includes('STALE SERVER COPY')));
   const expected=await page.evaluate(()=>freeActionTips(publicBreakdown(buildShortBreakdown(state.answers))));for(const t of expected)assert((await page.locator('.free-action-list').textContent()).includes(t));
   assert(posts.length===1);assert(!('inquiries' in posts[0].answers));assert(!('pricecheck' in posts[0].answers));assert.equal(posts[0].marketingConsent,false);
   assert.equal(await page.locator('a[href*="buy.stripe.com"]').count(),0);
   if(answers.full==='full'&&answers.goal[0]==='time')await page.screenshot({path:'/tmp/booked-result-'+width+'.png',fullPage:true});
   await page.locator('#edit').click();assert(await page.locator('.choice.selected').count());await page.locator('#next').click();assert(await page.locator('.choice.selected').count());
   await page.reload();assert.equal(errors.length,0,errors.join('\n'));count++;if(count%12===0)console.log('Completed '+count+' browser journeys');
  }finally{await context.close();}
 }
 try{
  for(const width of [360,1280])for(const full of ['under25','half','threequarters','full'])for(const goal of ['clients','return','money','keep','time','stable'])await journey(width,{careerstage:'working',worktype:['color'],days:'4',full,goal:[goal],spend:'275',inquiries:'lost',pricecheck:'fixed',overrun:'squeeze'});
  for(const work of ['session','owner'])await journey(360,{careerstage:'broader',worktype:[work],goal:['time'],workdays:'4',targetdays:'3'});
  console.log('PASS '+count+' complete mobile/desktop browser journeys; capture, supplemental answer isolation, stale API override, three results, editing, reload, no horizontal overflow or JS errors');
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
