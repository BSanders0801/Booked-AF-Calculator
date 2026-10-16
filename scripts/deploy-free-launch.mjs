// Authorized free-launch update. Preserve account, bindings, schedules and existing buyers.
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const account='30ec5e35d67ddd1a1bab06c2263b2159',root='https://api.cloudflare.com/client/v4',base='/accounts/'+account+'/workers/scripts/booked-af-email';
const launchToken=(process.env.CLOUDFLARE_API_TOKEN||'').trim();
if(!/^[A-Za-z0-9_-]{20,200}$/.test(launchToken))throw Error('Saved launch token has unexpected formatting. Copy only the token value into the repository secret.');
async function api(path){const r=await fetch(root+path,{headers:{Authorization:'Bearer '+launchToken},signal:AbortSignal.timeout(20000)});const d=await r.json();if(!r.ok||!d.success)throw Error('Provider read failed '+r.status);return d.result;}
if((await api('/accounts/'+account+'/workers/subdomain')).subdomain!=='wild-recipe-42df')throw Error('Wrong account');
const before=await api(base+'/settings'),deployments=await api(base+'/deployments'),active=deployments.deployments?.[0]?.versions,schedules=await api(base+'/schedules');
const expected=['FOLLOWUPS','FULFILLMENT','RESEND_API_KEY','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','TURNSTILE_SECRET_KEY'];
if(JSON.stringify(before.bindings.map(b=>b.name).sort())!==JSON.stringify(expected.sort()))throw Error('Unexpected bindings; inspect before changing');
if(before.bindings.find(b=>b.name==='FOLLOWUPS')?.namespace_id!=='c1030f222e4047ba8fc03636900a14fc')throw Error('Wrong contact store');
if(!before.bindings.some(b=>b.name==='FULFILLMENT'&&b.class_name==='PurchaseFulfillment'))throw Error('Existing buyer binding changed');
if(active?.length!==1||active[0].percentage!==100)throw Error('Concurrent rollout');
if(!Array.isArray(schedules.schedules))throw Error('Schedule response changed');
const cfg=JSON.parse(await readFile('.release-review/api.config.json','utf8'));cfg.triggers={crons:schedules.schedules.map(s=>s.cron)};cfg.observability=before.observability||{enabled:false};
await writeFile('.release-review/api.config.json',JSON.stringify(cfg));
if(JSON.stringify((await api(base+'/deployments')).deployments?.[0]?.versions)!==JSON.stringify(active))throw Error('Production changed');
console.log('Preserving production version',active[0].version_id,'all six bindings and existing schedules.');
if(process.env.VERIFY_ONLY!=='true'){try{execFileSync('npx',['--yes','wrangler@4.148.0','deploy','--config','.release-review/api.config.json','--keep-vars'],{stdio:'pipe',timeout:240000});}catch(e){console.error(String(e.stderr||'').replace(/(?:Bearer\s+\S+|sk_(?:live|test)_\w+|re_\w+|whsec_\w+)/g,'[redacted]').slice(-2000));throw Error('API deployment failed');}}
const after=await api(base+'/settings');
for(const name of expected)if(!after.bindings.some(b=>b.name===name))throw Error('Missing preserved binding');
if(JSON.stringify((await api(base+'/schedules')).schedules.map(s=>s.cron))!==JSON.stringify(cfg.triggers.crons))throw Error('Schedule changed');
let healthy=false;for(let i=0;i<5;i++){try{const h=await(await fetch('https://booked-af-email.wild-recipe-42df.workers.dev',{signal:AbortSignal.timeout(10000)})).json();if(h.launchReady){healthy=true;break;}}catch{}await new Promise(r=>setTimeout(r,2000));}if(!healthy)throw Error('Live health failed');
for(const [path,status] of [['/paid-content',401],['/verify-checkout?session_id=invalid',400],['/unsubscribe?token=invalid',400]]){const r=await fetch('https://booked-af-email.wild-recipe-42df.workers.dev'+path);if(r.status!==status||!r.headers.get('cache-control')?.includes('no-store'))throw Error('Live guard failed '+path);}
console.log('Free-launch API verified. Marketing remains paused; paid guards verified.');
const zones=await api('/zones?name=bookedandfabulous.com');
console.log('Domain zone:',JSON.stringify(zones.map(z=>({name:z.name,status:z.status,name_servers:z.name_servers}))));
if(zones.length===1){try{const records=await api('/zones/'+zones[0].id+'/dns_records?per_page=100');console.log('DNS inventory:',JSON.stringify(records.map(r=>({type:r.type,name:r.name,content:r.content,priority:r.priority,proxied:r.proxied}))));}catch{console.log('DNS record inventory BLOCKED: token cannot read zone records. No DNS changed.');}}
try{
 const keys=await api('/accounts/'+account+'/storage/kv/namespaces/c1030f222e4047ba8fc03636900a14fc/keys?prefix=contact%3A&limit=100');
 console.log('Persistent contact store admin retrieval:',JSON.stringify({readable:true,contactKeysOnFirstPage:keys.length}));
}catch{console.log('Persistent contact store admin retrieval BLOCKED: current deployment token lacks KV read access. Runtime storage is covered by behavior tests.');}
