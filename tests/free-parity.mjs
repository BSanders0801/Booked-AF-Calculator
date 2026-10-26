import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import worker from '../email-worker.mjs';
const cx=vm.createContext({});
vm.runInContext(fs.readFileSync('public/breakdown-core.js','utf8')+'\n'+fs.readFileSync('public/personalization.js','utf8')+`\n
globalThis.api={result:a=>publicBreakdown(buildShortBreakdown(a)),email:(a,n)=>publicBreakdownEmail(buildShortBreakdown(a),n),complete(input){
 const a={careerstage:'working',...input};
 for(const q of shortQuestions){if(q.when&&!q.when(a))continue;if(a[q.id]!==undefined)continue;
 if(q.type==='service-time'){a[q.id]={service:'Full highlights',hours:3,minutes:0};continue;}
 const value=shortChoices(q,a)[0][0];a[q.id]=q.multi?[value]:value;}
 return validateShortAnswers(a);
}};`,cx);
const plain=x=>JSON.parse(JSON.stringify(x));
const store=new Map(),sent=[];
const env={RESEND_API_KEY:'mock',TURNSTILE_SECRET_KEY:'mock',FOLLOWUPS:{get:async k=>store.get(k)||null,put:async(k,v)=>store.set(k,v),delete:async k=>store.delete(k)}};
const original=globalThis.fetch;let fail=false;
globalThis.fetch=async(url,opts)=>String(url).includes('turnstile')?Response.json({success:true,hostname:'bookedandfabulous.com',action:'booked_email'}):(sent.push(JSON.parse(opts.body)),Response.json(fail?{}:{id:'parity-test'},{status:fail?503:200}));
const req=(path,data)=>new Request('https://api.test'+path,{method:'POST',headers:{Origin:'https://bookedandfabulous.com','Content-Type':'application/json'},body:JSON.stringify(data)});
let count=0;
try{
 for(const work of ['color','session','events','education','owner','inactive','other'])for(const goal of ['clients','return','money','keep','time','stable'])for(const full of ['notyet','under25','half','threequarters','full']){
  const a=plain(cx.api.complete({worktype:[work],full,days:'4',goal:[goal],inquiries:'lost',pricecheck:'fixed',spend:'275'}));
  const expected=plain(cx.api.result(a));
  const response=await worker.fetch(req('/',{schema:'short-v5',type:'breakdown',name:'Tester',email:'parity@example.test',token:'mock',answers:a,marketingConsent:false}),env);
  assert.equal(response.status,200,JSON.stringify(a));
  const body=await response.json();assert.deepEqual(body.breakdown,expected);
  const message=sent.at(-1);assert(message.text.startsWith(cx.api.email(a,'Tester')));
  for(const key of ['mechanism','script','measure','decision'])assert(message.text.includes(expected.experiment[key]),'Experiment missing from email: '+key);
  assert.equal(expected.actions.length,3);assert(!('plan' in body.breakdown));
  if(work==='color')assert.doesNotMatch(JSON.stringify(body.breakdown),/not taking (?:appointments|clients)|not offering appointments/i);
  const token=message.text.match(/#resume-profile\/([a-f0-9]{64})/)[1];
  const restored=await worker.fetch(req('/profile',{action:'open',token}),env);
  assert.deepEqual((await restored.json()).profile.breakdown,expected);
  assert(!message.text.includes('/confirm-subscription?'));
  count++;
 }
 const a=plain(cx.api.complete({worktype:['color'],full:'notyet',days:'4',goal:['money'],spend:'unknown',pricecheck:'fixed'}));
 fail=true;const response=await worker.fetch(req('/',{schema:'short-v5',type:'breakdown',name:'Tester',email:'parity@example.test',token:'mock',answers:a}),env);assert.equal(response.status,502);
 console.log(`PASS ${count} website/API/email/profile parity journeys, all stages and professional lanes, no paid plans, no marketing consent, provider failure recovery.`);
}finally{globalThis.fetch=original;}
