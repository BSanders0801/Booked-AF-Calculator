// Read-only production checks from the deployment runner. No form or email submission.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const site='https://bookedandfabulous.com', api='https://booked-af-email.wild-recipe-42df.workers.dev';
async function get(url,options={}){let last;for(let n=0;n<5;n++){try{const r=await fetch(url,{...options,signal:AbortSignal.timeout(15000)});if(r.status>=500)throw Error('HTTP '+r.status);return r;}catch(e){last=e;await new Promise(r=>setTimeout(r,2000));}}throw last;}

const token=(process.env.CLOUDFLARE_API_TOKEN||'').trim();
async function cf(path){const r=await get('https://api.cloudflare.com/client/v4'+path,{headers:{Authorization:'Bearer '+token}});let d;try{d=await r.json();}catch{d={success:false};}return {status:r.status,okay:r.ok&&d.success===true,data:d.result};}
const z=await cf('/zones?name=bookedandfabulous.com');assert.ok(z.okay&&z.data.length===1);const zone=z.data[0];assert.equal(zone.account.id,'30ec5e35d67ddd1a1bab06c2263b2159');
for(const [label,path] of [['DNSSEC','/zones/'+zone.id+'/dnssec'],['SSL setting','/zones/'+zone.id+'/settings/ssl'],['Worker routes','/zones/'+zone.id+'/workers/routes'],['Worker custom domains','/accounts/30ec5e35d67ddd1a1bab06c2263b2159/workers/domains'],['Contact store','/accounts/30ec5e35d67ddd1a1bab06c2263b2159/storage/kv/namespaces/c1030f222e4047ba8fc03636900a14fc/keys?prefix=contact%3A&limit=100']]){const v=await cf(path);console.log('Cloudflare access verified',label,JSON.stringify({http:v.status,readable:v.okay,state:label==='DNSSEC'?v.data?.status:undefined}));}
console.log('Cloudflare zone state',zone.status);

const main=await get(site+'/');assert.equal(main.status,200);const html=await main.text();assert.ok(html.includes('public-20261016-2'));
for(const url of ['http://bookedandfabulous.com/','https://www.bookedandfabulous.com/','http://www.bookedandfabulous.com/']){const r=await get(url,{redirect:'manual'});assert.ok([301,302,307,308].includes(r.status));assert.equal(new URL(r.headers.get('location'),url).hostname,'bookedandfabulous.com');console.log('Redirect verified',url,r.status,r.headers.get('location'));}
for(const name of ['index.html','app.js','site-content.js','breakdown-core.js','site-ui.js','site.css','lifecycle-ui.js','paid-loader.js']){const r=await get(site+'/'+name+'?v=public-20261016-2');assert.equal(r.status,200);const body=await r.text();assert.ok(body.replaceAll('\r\n','\n')===(await readFile('.website-preview/'+name,'utf8')).replaceAll('\r\n','\n'),'Live asset mismatch '+name);assert.ok(!body.includes('https://buy.stripe.com/'),'Checkout URL exposed '+name);console.log('Production asset verified',name,createHash('sha256').update(body).digest('hex'));}
for(const p of ['/next30-core.js','/day-math.js','/email-worker.mjs','/.private-assets/paid-bundle.mjs'])assert.equal((await get(site+p)).status,404,p);
const app=await readFile('.website-preview/app.js','utf8');assert.ok(app.includes('name="name" required'));assert.ok(app.includes('type="email" autocomplete="email" required'));assert.ok(app.includes("marketingConsent: data.get('marketingConsent')==='on'"));
const pre=await get(api,{method:'OPTIONS',headers:{Origin:site,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}});assert.ok([200,204].includes(pre.status));assert.equal(pre.headers.get('access-control-allow-origin'),site);
const health=await(await get(api)).json();assert.equal(health.launchReady,true);
const denied=await get(api+'/paid-content',{headers:{Origin:site}});assert.equal(denied.status,401);assert.ok(denied.headers.get('cache-control').includes('no-store'));
console.log('PRODUCTION DOMAIN PASS: exact free release, required fields, optional consent, CORS, ready API, held checkout and protected paid assets. This is not a successful visitor submission test.');

const approvedTestEmail='hello@bookedandfabulous.com';
const contactHash=createHash('sha256').update(approvedTestEmail).digest('hex');
const kvBase='https://api.cloudflare.com/client/v4/accounts/30ec5e35d67ddd1a1bab06c2263b2159/storage/kv/namespaces/c1030f222e4047ba8fc03636900a14fc';
const contactResponse=await get(kvBase+'/values/'+encodeURIComponent('contact:'+contactHash),{headers:{Authorization:'Bearer '+token}});
assert.equal(contactResponse.status,200,'Production test contact not saved');const contact=await contactResponse.json();
assert.equal(contact.email,approvedTestEmail);assert.ok(contact.name?.trim());assert.equal(contact.source,'free-breakdown');assert.ok(Date.parse(contact.breakdownRequestedAt)>=Date.parse('2026-10-16T23:00:00Z'));
assert.ok(['pending','subscribed','unsubscribed'].includes(contact.marketingStatus));assert.equal(contact.consentVersion,'2026-10-16');
const deliveryResponse=await get(kvBase+'/values/'+encodeURIComponent('contact-delivery:'+contactHash),{headers:{Authorization:'Bearer '+token}});assert.equal(deliveryResponse.status,200);const delivery=await deliveryResponse.json();assert.ok(delivery.emailId);assert.ok(Date.parse(delivery.acceptedAt)>=Date.parse('2026-10-16T23:00:00Z'));
const keys=await cf('/accounts/30ec5e35d67ddd1a1bab06c2263b2159/storage/kv/namespaces/c1030f222e4047ba8fc03636900a14fc/keys?prefix='+encodeURIComponent('contact:'+contactHash)+'&limit=100');assert.ok(keys.okay);assert.equal(keys.data.length,1);assert.ok(!keys.data[0].expiration,'Contact must not expire');
console.log('PRODUCTION VISITOR STORAGE PASS',JSON.stringify({requiredNameSaved:true,emailMatchesApprovedInbox:true,source:contact.source,schema:contact.schema,marketingStatus:contact.marketingStatus,consentVersion:contact.consentVersion,requestedAt:contact.breakdownRequestedAt,deliveryAcceptedAt:delivery.acceptedAt,persistentWithoutTTL:true,matchingContactRecords:keys.data.length}));
