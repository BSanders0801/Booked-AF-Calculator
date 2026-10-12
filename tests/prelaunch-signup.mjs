import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker from '../email-worker.mjs';
const url='https://booked-af-email.wild-recipe-42df.workers.dev/prelaunch';
const valid={name:'Alex',email:'alex@example.com',consent:true,token:'valid-test-token',honey:''};
const req=(obj=valid,origin='https://bookedandfabulous.com')=>new Request(url,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(obj)});
const env={RESEND_API_KEY:'re_test',TURNSTILE_SECRET_KEY:'turnstile_test'};
test('signup requires explicit consent and proper origin',async()=>{
 assert.equal((await worker.fetch(req({...valid,consent:false}),env)).status,400);
 assert.equal((await worker.fetch(req(valid,'https://other.example'),env)).status,403);
 assert.equal((await worker.fetch(req({...valid,name:''}),env)).status,400);
 assert.equal((await worker.fetch(req({...valid,token:''}),env)).status,400);
});
test('verified signup saves contact once, using existing mailing list',async()=>{
 const original=globalThis.fetch,calls=[];
 globalThis.fetch=async(u,opt)=>{calls.push({url:String(u),body:JSON.parse(opt.body)});if(String(u).includes('siteverify'))return Response.json({success:true,hostname:'bookedandfabulous.com',action:'booked_prelaunch'});return Response.json({object:'contact',id:'test-contact'})};
 try{const response=await worker.fetch(req(),env);assert.equal(response.status,200);assert.deepEqual(await response.json(),{success:true});assert.equal(calls.length,2);assert.equal(calls[1].url,'https://api.resend.com/contacts');assert.equal(calls[1].body.email,'alex@example.com');assert.equal(calls[1].body.segments[0].id,'fed93505-852a-4ddd-9124-b1972cae26a8');}
 finally{globalThis.fetch=original}
});
test('does not resubscribe or misrepresent a previously unsubscribed contact',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async u=>String(u).includes('siteverify')?Response.json({success:true,hostname:'bookedandfabulous.com',action:'booked_prelaunch'}):new Response(JSON.stringify({message:'Already exists'}),{status:409});
 try{const response=await worker.fetch(req(),env);assert.equal(response.status,200);assert.deepEqual(await response.json(),{success:true,alreadyJoined:true});assert.match(fs.readFileSync('prelaunch.html','utf8'),/already subscribed/);}
 finally{globalThis.fetch=original}
});
test('site links to separate consent form; no marketing preselection',()=>{
 const home=fs.readFileSync('index.html','utf8'),page=fs.readFileSync('prelaunch.html','utf8');
 assert.match(home,/prelaunch\.html/);assert.match(page,/type="checkbox" id="consent" required/);assert.doesNotMatch(page,/id="consent"[^>]*checked/);assert.match(page,/unsubscribe anytime/);assert.match(page,/booked_prelaunch/);
});
