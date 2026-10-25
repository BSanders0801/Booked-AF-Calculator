import assert from 'node:assert/strict';
import worker from '../email-worker.mjs';
const data={type:'breakdown',email:'LAUNCH@EXAMPLE.TEST',name:'Launch',schema:'short-v5',token:'mock',answers:{worktype:['color','extensions'],primarywork:'chair-color',goal:['clients'],full:'under25',days:'3',returning:'some',visibility:['social'],marketing:['social'],network:'local',urgency:'month'}};
const map=new Map(),messages=[];
const env={RESEND_API_KEY:'mock',TURNSTILE_SECRET_KEY:'mock',FOLLOWUPS:{get:async k=>map.get(k)||null,put:async(k,v)=>map.set(k,v)}};
const original=globalThis.fetch;
globalThis.fetch=async(url,options)=>String(url).includes('turnstile')?Response.json({success:true,hostname:'bookedandfabulous.com',action:'booked_email'}):(messages.push({body:JSON.parse(options.body),key:options.headers['Idempotency-Key']}),Response.json({id:'controlled-test'}));
const submit=body=>worker.fetch(new Request('https://api.test/',{method:'POST',headers:{Origin:'https://bookedandfabulous.com','Content-Type':'application/json'},body:JSON.stringify(body)}),env);
const rows=()=>[...map].filter(([k])=>k.startsWith('contact:')).map(([,v])=>JSON.parse(v));
try{
 assert.equal((await submit(data)).status,200);assert.equal(rows()[0].email,'launch@example.test');assert.equal(rows()[0].marketingStatus,'not_subscribed');
 assert(!messages[0].body.text.includes('/confirm-subscription?'));
 assert.equal((await submit({...data,marketingConsent:true})).status,200);assert.equal(rows().length,1);assert.equal(rows()[0].marketingStatus,'pending');
 const confirm=messages.at(-1).body.text.match(/https:\/\/[^\s]+\/confirm-subscription\?token=[a-f0-9]+/)[0];
 const unsub=messages.at(-1).body.text.match(/https:\/\/[^\s]+\/unsubscribe\?token=[a-f0-9]+/)[0];
 assert.equal((await worker.fetch(new Request(confirm),env)).status,200);assert.equal(rows()[0].marketingStatus,'pending','GET cannot subscribe');
 assert.equal((await worker.fetch(new Request(confirm,{method:'POST'}),env)).status,200);assert.equal(rows()[0].marketingStatus,'subscribed');assert(rows()[0].consentConfirmedAt);
 assert.equal((await worker.fetch(new Request(unsub),env)).status,200);assert.equal(rows()[0].marketingStatus,'subscribed','GET cannot unsubscribe');
 assert.equal((await worker.fetch(new Request(unsub,{method:'POST'}),env)).status,200);assert.equal(rows()[0].marketingStatus,'unsubscribed');
 assert.equal((await worker.fetch(new Request(confirm,{method:'POST'}),env)).status,400,'old confirmation cannot undo unsubscribe');
 await submit(data);assert.equal(rows()[0].marketingStatus,'unsubscribed','unchecked request preserves suppression');
 assert.equal((await submit({...data,marketingConsent:'yes'})).status,400);
 assert.equal((await worker.fetch(new Request(unsub.replace(/token=.*/, 'token=invalid')),env)).status,400);
 assert.equal((await submit({...data,name:''})).status,400);assert.equal((await submit({...data,email:'bad'})).status,400);
 const n=messages.length;await worker.fetch(new Request('https://api.test/',{method:'POST',headers:{Origin:'https://bookedandfabulous.com','Content-Type':'application/json'},body:JSON.stringify(data)}),{...env,FOLLOWUPS:undefined});assert.equal(messages.length,n,'storage failure prevents email and success');
 await submit(data);assert.equal(messages.at(-1).key,messages.at(-2).key,'identical requests use the same provider idempotency key');
 console.log('PASS: persistent normalized contacts, optional consent, double opt-in, POST-only preferences, suppression, required fields, invalid tokens and storage failure. No real emails.');
}finally{globalThis.fetch=original;}
