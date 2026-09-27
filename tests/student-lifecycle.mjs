import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
const core=fs.readFileSync('breakdown-core.js','utf8');
const c=vm.createContext({});vm.runInContext(core+';globalThis.api={shortQuestions,shortVisibleQuestions,shortChoices,validateShortAnswers,buildShortBreakdown,shortStage,FIRST90_PRODUCT};',c);
const a=c.api;
function complete(input){const out={...input};for(const q of a.shortQuestions){if(q.when&&!q.when(out))continue;if(out[q.id]===undefined){const v=a.shortChoices(q,out)[0][0];out[q.id]=q.multi?[v]:v;}}return JSON.parse(JSON.stringify(a.validateShortAnswers(out)));}
assert.equal(a.shortVisibleQuestions({})[0].id,'careerstage');
assert.equal(a.shortQuestions[0].choices[0][1],'I’m still in school for hair.');
let cases=0;
for(const concern of ['salon','clients','consultation','rebooking','money','boundaries'])for(const practice of ['regular','some','notyet'])for(const direction of ['employee','rental','freelance','unsure'])for(const graduation of ['soon','middle','early','unknown']){
 const input=complete({careerstage:'school',readiness:concern,practice,direction,graduation});
 const visible=a.shortVisibleQuestions(input).map(q=>q.id);
 assert(!visible.some(id=>['worktype','primarywork','full','days','goal','paymodel','spend','workload'].includes(id)));
 const result=a.buildShortBreakdown(input);assert.equal(result.audience,'student');assert.equal(result.plan.steps.length,3);assert(result.plan.check);assert(!JSON.stringify(result).includes('undefined'));
 if(practice==='notyet')assert.match(result.intro,/instructor or classmate/);
 const dirty={...input,worktype:['color'],primarywork:'chair-color',goal:['money'],spend:'400'};
 assert.equal(JSON.stringify(a.buildShortBreakdown(dirty)),JSON.stringify(result));
 cases++;
}
const student=complete({careerstage:'school',readiness:'clients'});
const working=complete({careerstage:'building',worktype:['color'],goal:['clients'],full:'notyet',days:'0'});
assert.equal(a.shortStage(working).key,'building');assert(!a.shortVisibleQuestions(working).some(q=>q.id==='primarywork'));
assert(!a.shortVisibleQuestions(working).some(q=>q.id==='studentinterest'));
assert.equal(a.FIRST90_PRODUCT.status,'coming-soon');assert.equal(a.FIRST90_PRODUCT.price,29);
const store=new Map(),sent=[],background=[];
const env={RESEND_API_KEY:'mock',TURNSTILE_SECRET_KEY:'mock',FOLLOWUPS:{async get(k){return store.get(k)||null;},async put(k,v){store.set(k,v);},async delete(k){store.delete(k);},async list(){return {keys:[],list_complete:true};}}};
let providerFails=false;
const wc=vm.createContext({Response,Request,URL,TextEncoder,TextDecoder,AbortSignal,crypto:webcrypto,console,fetch:async(url,opts)=>{
 if(url.includes('turnstile'))return Response.json({success:true,hostname:'bookedandfabulous.com',action:'booked_email'});
 sent.push(JSON.parse(opts.body));return providerFails?Response.json({}, {status:503}):Response.json({id:'test-email'});
}});
vm.runInContext(fs.readFileSync('email-worker.mjs','utf8').replace('export default','globalThis.worker='),wc);
function req(path,data,origin='https://bookedandfabulous.com'){return new Request('https://api.test'+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(data)});}
const capture=answers=>({schema:'short-v5',type:'breakdown',email:'tester@example.test',name:'Tester',token:'verification-mock',answers,analyticsSession:'test-session-1234567890'});
let res=await wc.worker.fetch(req('/',{...capture(student),first90Interest:true}),env);assert.equal(res.status,200);const captureResponse=await res.json();assert(!JSON.stringify(captureResponse).includes('token'));assert.equal(sent.length,1,'Students must not receive professional followup schedules');
const token=sent[0].text.match(/#resume-profile\/([a-f0-9]{64})/)[1];
assert.match(sent[0].text,/FIRST 90 is coming/);assert(!sent[0].text.includes('https://buy.stripe'));
res=await wc.worker.fetch(req('/profile',{action:'open',token}),env);const p=(await res.json()).profile;assert.equal(p.careerStatus,'school');assert.equal(p.first90Interest,true);
res=await wc.worker.fetch(req('/profile',{action:'open',token:'a'.repeat(64)}),env);assert.equal(res.status,401);
res=await wc.worker.fetch(req('/profile',{action:'save',token,answers:working,done:{bad:true}}),env);const graduated=(await res.json()).profile;assert.equal(graduated.id,p.id);assert.equal(graduated.careerStatus,'building');assert.equal(graduated.history.at(-1).from,'school');assert.deepEqual(graduated.done,{});
res=await wc.worker.fetch(req('/profile',{action:'open',token}),env);assert.equal((await res.json()).profile.careerStatus,'building','An old email link cannot reset graduation');
// Knowing an email can request a link but cannot read or overwrite its profile.
await wc.worker.fetch(req('/',capture(student)),env);
res=await wc.worker.fetch(req('/profile',{action:'open',token}),env);assert.equal((await res.json()).profile.careerStatus,'building');
assert([...store.keys()].some(k=>k.includes('student_to_working')));
res=await wc.worker.fetch(req('/events',{event:'first90_conversion',session:'test-session-1234567890'}),env);assert.equal(res.status,400,'Client cannot invent a paid conversion');
res=await wc.worker.fetch(req('/events',{event:'student_start',session:'test-session-1234567890'},'https://evil.test'),env);assert.equal(res.status,403);
res=await wc.worker.fetch(req('/profile',{action:'save',token,answers:{careerstage:'school'}}),env);assert.equal(res.status,400);
providerFails=true;res=await wc.worker.fetch(req('/',capture(student)),env);assert.equal(res.status,502);assert.equal((await res.json()).success,false);providerFails=false;
// Schedules run after the delivery response when the platform provides waitUntil.
res=await wc.worker.fetch(req('/',capture(working)),env,{waitUntil:p=>background.push(p)});assert.equal(res.status,200);await Promise.all(background);
console.log(`PASS: ${cases} school scenarios, stage isolation, evidence-led results, authenticated profile continuity, protected links, analytics validation, delivery failures and background followups. No real emails or payments.`);
