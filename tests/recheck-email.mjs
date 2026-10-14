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

test('Breakdown delivers the requested result without enrolling the customer in unready marketing', async () => {
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
    type:'breakdown', email:'alex@example.com', name:'Alex', schema:'short-v5',
    token:'turnstile-token', honey:'',
    answers:{worktype:['color','extensions'],primarywork:'chair-color',goal:['clients'],full:'under25',days:'3',returning:'some',visibility:['social'],marketing:['social'],network:'local',urgency:'month'}
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
    assert.equal(result.followupScheduled7,false);
    assert.equal(result.followupScheduled,false);
    assert.equal(result.followupQueued60,false);
    assert.equal(result.followupQueued90,false);
    assert.equal(emails.length,1);

    const immediate = emails.find(x=>x.body.subject==='Your BOOKED AF Breakdown').body;
    assert.match(immediate.text,/\nBradley\nBOOKED AF\n/);

    assert.equal([...FOLLOWUPS.map.keys()].filter(key=>key.startsWith('followup:')).length,0);
  } finally { globalThis.fetch = original; }
});

test('scheduled handler preserves legacy queues without sending unready marketing', async () => {
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
    assert.equal(emails.length,0);
    assert.equal(FOLLOWUPS.map.size,2);
  } finally { globalThis.fetch=original; }
});

