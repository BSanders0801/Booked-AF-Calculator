// Local fixtures only; all external requests mocked. Paid state is a layout fixture, not an access test.
const {chromium}=require('playwright');
const fs=require('fs'),http=require('http'),path=require('path');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'.browser-review');
(async()=>{
 const server=http.createServer((req,res)=>{const p=path.join(root,new URL(req.url,'http://localhost').pathname==='/'?'index.html':new URL(req.url,'http://localhost').pathname);try{res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':p.endsWith('.css')?'text/css':p.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(p))}catch{res.statusCode=404;res.end()}}).listen(8765,'127.0.0.1');
 const browser=await chromium.launch({headless:true});const results=[];fs.mkdirSync(output,{recursive:true});
 try{for(const width of [320,390,1280]){
 const page=await browser.newPage({viewport:{width,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>{const u=route.request().url();return u.startsWith('http://127.0.0.1:8765')?route.continue():route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ready:true,schemas:['short-v5'],paid:false})})});
 await page.goto('http://127.0.0.1:8765');await page.waitForFunction(()=>typeof state!=='undefined');
 for(const view of ['intro','sample','next30sample','paid','email','result','first90','deepintake','deepresult']){
 await page.evaluate(view=>{state.emailSent=true;state.next30Verified=true;state.view=view;for(let pass=0;pass<8;pass++)for(const q of questions)if(!q.when||q.when(state.answers)){const c=state.schema===SHORT_SCHEMA?shortChoices(q,state.answers):q.choices;if(state.answers[q.id]===undefined)state.answers[q.id]=q.multi?[c[0][0]]:c[0][0];}if(view.startsWith('deep')){let a={careers:['color'],goal:'money'};for(let i=0;i<8;i++)for(const q of BookedNext30.questions(a))if(a[q.id]===undefined)a[q.id]=q.multi?[q.choices[0][0]]:q.choices[0][0];state.careerData={version:BookedNext30.VERSION,answers:BookedNext30.cleanAnswers(a),carried:{},checks:{},metrics:{},tools:{},savedPlans:[],currentId:null}if(view==='deepintake'){state.careerData.answers={};state.careerData.currentId=null;}}render()},view);
 if(view==='email')await page.locator('#form').waitFor();if(view==='result')await page.locator('#share').waitFor();
 await page.screenshot({path:path.join(output,`${width}-${view}.png`),fullPage:true});
 results.push({width,view,...await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,actual:document.documentElement.scrollWidth,text:document.getElementById('app').innerText.slice(0,100)})),errors:[...errors]});
 }await page.close();}
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));if(results.some(r=>r.overflow||r.errors.length))throw Error('Layout overflow or browser error; inspect screenshot artifacts.');
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exit(1)});
