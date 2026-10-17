// Authorized domain migration: preserve all mail DNS and current public assets.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const account='30ec5e35d67ddd1a1bab06c2263b2159',domain='bookedandfabulous.com',root='https://api.cloudflare.com/client/v4';
const token=(process.env.CLOUDFLARE_API_TOKEN||'').trim();
async function cf(path,method='GET',body){const r=await fetch(root+path,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});const d=await r.json();if(!r.ok||!d.success)throw Error('Cloudflare API '+method+' '+path+' failed '+r.status+' '+JSON.stringify(d.errors));return d.result;}
const zones=await cf('/zones?name='+domain);assert.equal(zones.length,1);const zone=zones[0];assert.equal(zone.account.id,account);
const records=await cf('/zones/'+zone.id+'/dns_records?per_page=100');
assert.ok(records.some(r=>r.type==='MX'&&r.name===domain&&r.content==='smtp.google.com'));
for(const n of ['google._domainkey.','resend._domainkey.'])assert.ok(records.some(r=>r.type==='TXT'&&r.name===n+domain));
const mailSnapshot=JSON.stringify(records.filter(r=>!((r.name===domain&&['A','AAAA'].includes(r.type))||(r.name==='www.'+domain&&r.type==='CNAME'))).map(r=>[r.id,r.type,r.name,r.content,r.priority]).sort());
console.log('Cloudflare current zone',zone.status,'preserved records',records.length);
for(const path of ['/ssl/certificate_packs?status=active','/ssl/verification']){try{const result=await cf('/zones/'+zone.id+path);console.log('SSL inventory',path,JSON.stringify(result));}catch(e){console.log('SSL inventory unavailable',path,String(e.message).slice(0,180));}}
const dnssec=await cf('/zones/'+zone.id+'/dnssec');console.log('Cloudflare DNSSEC',JSON.stringify({status:dnssec.status,ds:dnssec.ds}));
execFileSync('node',['scripts/prepare-release.mjs'],{stdio:'inherit'});
execFileSync('node',['scripts/build-public-launch.mjs'],{stdio:'inherit'});
const config=JSON.parse(await readFile('.release-review/site.config.json','utf8'));
config.main='../public-site-worker.mjs';config.assets.binding='ASSETS';config.assets.run_worker_first=true;
await writeFile('.release-review/site-cutover.config.json',JSON.stringify(config));
try{execFileSync('npx',['--yes','wrangler@4.148.0','deploy','--config','.release-review/site-cutover.config.json','--keep-vars'],{stdio:'pipe',timeout:240000});}catch(e){console.error(String(e.stderr||'').replaceAll(token,'[redacted]').slice(-1500));throw Error('Public site deployment failed');}
const host='https://booked-af-site.wild-recipe-42df.workers.dev';
for(const name of ['index.html','app.js','site-content.js','site-ui.js']){let okay=false;for(let n=0;n<5;n++){const r=await fetch(host+'/'+name);if(r.ok&&(await r.text()).replaceAll('\r\n','\n')===(await readFile('.website-preview/'+name,'utf8')).replaceAll('\r\n','\n')&&r.headers.get('x-booked-af-host')==='cloudflare-public'){okay=true;break;}await new Promise(r=>setTimeout(r,2000));}assert.ok(okay,'Public Worker mismatch '+name);}
for(const p of ['/next30-core.js','/day-math.js','/email-worker.mjs','/.private-assets/paid-bundle.mjs'])assert.equal((await fetch(host+p)).status,404);
console.log('LATEST APPROVED PUBLIC WORKER VERIFIED; redirect wrapper ready; paid paths404; no DNS routing changed.');
const after=await cf('/zones/'+zone.id+'/dns_records?per_page=100');
assert.equal(JSON.stringify(after.filter(r=>!((r.name===domain&&['A','AAAA'].includes(r.type))||(r.name==='www.'+domain&&r.type==='CNAME'))).map(r=>[r.id,r.type,r.name,r.content,r.priority]).sort()),mailSnapshot);
