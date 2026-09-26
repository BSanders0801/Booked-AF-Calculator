import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../email-worker.mjs';

function fakeKV() {
  const map = new Map();
  return {
    map,
    async put(key,value){ map.set(key,value); },
    async get(key,opts){ const v=map.get(key); return opts?.type === 'json' && v ? JSON.parse(v) : v ?? null; },
    async delete(key){ map.delete(key); },
    async list(){ return {keys:[...map.keys()].map(name=>({name})),list_complete:true}; }
  };
}

const baseEnv = {RESEND_API_KEY:'resend_test_only',TURNSTILE_SECRET_KEY:'turnstile_test_only'};

test('Breakdown schedules distinct Day 7 and Day 30 emails and queues Day 60 and Day 90', async () => {
  const original = globalThis.fetch;
  const emails = [];
  const FOLLOWUPS = fakeKV();
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).includes('challenges.cloudflare.com/turnstile')) {
      return new Response(JSON.stringify({success:true,hostname:'bookedandfabulous.com',action:'booked_email'}),{status:200});
    }
    if (String(url) === 'https://api.resend.com/emails') {
      emails.push({body:JSON.parse(options.body),headers:options.headers});
      return new Response(JSON.stringify({id:'email_'+emails.length}),{status:200});
    }
    throw new Error('Unexpected fetch: '+url);
  };
  const payload = {
    type:'breakdown', email:'alex@example.com', name:'Alex', schema:'short-v3',
    token:'turnstile-token', honey:'',
    answers:{worktype:['fullservice'],primarywork:'chair',goal:'clients',full:'under25',days:'3',returning:'some',visibility:['social'],marketing:['social'],network:'local',urgency:'month'}
  };
  try {
    const request = new Request('https://example.workers.dev/',{
      method:'POST',
      headers:{Origin:'https://bookedandfabulous.com','Content-Type':'application/json'},
      body:JSON.stringify(payload)
    });
    const response = await worker.fetch(request,{...baseEnv,FOLLOWUPS});
    assert.equal(response.status,200);
    const result = await response.json();
    assert.equal(result.success,true);
    assert.equal(result.followupScheduled7,true);
    assert.equal(result.followupScheduled,true);
    assert.equal(result.followupQueued60,true);
    assert.equal(result.followupQueued90,true);
    assert.equal(emails.length,3);

    const immediate = emails.find(x=>x.body.subject==='Your BOOKED AF Breakdown').body;
    assert.match(immediate.text,/\nBradley\nBOOKED AF\n/);

    const day7 = emails.find(x=>x.body.subject==='It’s been a week. Did we actually do the things?').body;
    assert.equal(day7.scheduled_at,'in 7 days');
    assert.match(day7.text,/This is a business plan, not a guilt trip/);
    assert.match(day7.html,/OPEN MY 7-DAY PLAN →/);

    const day30 = emails.find(x=>x.body.subject==='30 days later. Are we rich yet?').body;
    assert.equal(day30.scheduled_at,'in 30 days');
    assert.match(day30.html,/RECHECK MY NUMBERS →/);

    const queued=[...FOLLOWUPS.map.entries()].map(([key,value])=>({key,record:JSON.parse(value)}));
    assert.equal(queued.length,2);
    assert.deepEqual(new Set(queued.map(x=>x.record.kind)),new Set(['60','90']));
    assert.ok(queued.every(x=>x.key.startsWith('followup:')));
    assert.ok(queued.every(x=>/booked-v3-short-/.test(x.record.idempotencyKey)));
  } finally { globalThis.fetch = original; }
});

test('scheduled handler sends due 60 and 90 day queue items with different copy', async () => {
  const original = globalThis.fetch;
  const FOLLOWUPS = fakeKV();
  const due=Date.now()-1000;
  await FOLLOWUPS.put('followup:'+String(due).padStart(13,'0')+':a',JSON.stringify({kind:'60',email:'a@example.com',name:'Alex',idempotencyKey:'id-60'}));
  await FOLLOWUPS.put('followup:'+String(due).padStart(13,'0')+':b',JSON.stringify({kind:'90',email:'b@example.com',name:'Blair',idempotencyKey:'id-90'}));
  const emails=[];
  globalThis.fetch=async(url,options={})=>{
    if(String(url)==='https://api.resend.com/emails'){
      emails.push({body:JSON.parse(options.body),headers:options.headers});
      return new Response(JSON.stringify({id:'queued_'+emails.length}),{status:200});
    }
    throw new Error('Unexpected fetch: '+url);
  };
  try {
    let pending;
    worker.scheduled({}, {...baseEnv,FOLLOWUPS}, {waitUntil(p){pending=p;}});
    await pending;
    assert.equal(emails.length,2);
    const day60=emails.find(x=>x.body.subject==='60 days in. What actually stuck?').body;
    const day90=emails.find(x=>x.body.subject==='90 days later. Apparently we do quarterly reviews now.').body;
    assert.match(day60.text,/We’re looking for patterns now/);
    assert.match(day90.text,/Three months is enough time to stop calling everything a fluke/);
    assert.doesNotMatch(day90.text,/Did your stage change/);
    assert.equal(FOLLOWUPS.map.size,0);
  } finally { globalThis.fetch=original; }
});
