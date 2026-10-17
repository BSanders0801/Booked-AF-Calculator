import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const account='30ec5e35d67ddd1a1bab06c2263b2159',domain='bookedandfabulous.com',token=(process.env.CLOUDFLARE_API_TOKEN||'').trim(),root='https://api.cloudflare.com/client/v4';
async function cf(path){const r=await fetch(root+path,{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(20000)});const d=await r.json();assert.ok(r.ok&&d.success,'Provider read failed '+r.status);return d.result;}
async function dns(name,type){const d=await(await fetch('https://dns.google/resolve?name='+encodeURIComponent(name)+'&type='+type)).json();assert.equal(d.Status,0,'DNS status for '+name);return d.Answer||[];}
let zone=(await cf('/zones?name='+domain))[0];assert.equal(zone.account.id,account);
if(zone.status==='active')execFileSync('node',['scripts/route-public-host.mjs'],{stdio:'inherit',timeout:180000});
execFileSync('node',['scripts/build-public-launch.mjs'],{stdio:'inherit'});
const ns=(await dns(domain,'NS')).filter(r=>r.type===2).map(r=>r.data.replace(/\.$/,'')).sort();assert.deepEqual(ns,['faye.ns.cloudflare.com','zeus.ns.cloudflare.com']);
assert.ok((await dns(domain,'MX')).some(r=>r.type===15&&r.data==='1 smtp.google.com.'));
for(const [name,type,match] of [[domain,'TXT','include:_spf.google.com'],['google._domainkey.'+domain,'TXT','v=DKIM1'],['resend._domainkey.'+domain,'TXT','p='],['rsend.'+domain,'CNAME','rsend.forge.rmta.net'],['send.'+domain,'CNAME','send.forge.rmta.net']])assert.ok((await dns(name,type)).some(r=>r.data.includes(match)),'Preserved email DNS '+name);
for(const name of ['index.html','app.js','site-content.js','site-ui.js','site.css','breakdown-core.js','paid-loader.js','lifecycle-ui.js']){const r=await fetch('https://'+domain+'/'+name,{signal:AbortSignal.timeout(15000)});assert.equal(r.status,200);const b=await r.text();assert.ok(b.replaceAll('\r\n','\n')===(await readFile('.website-preview/'+name,'utf8')).replaceAll('\r\n','\n'),'Live release mismatch '+name);assert.ok(!b.includes('https://buy.stripe.com/'));}
for(const u of ['http://'+domain+'/','https://www.'+domain+'/','http://www.'+domain+'/']){const r=await fetch(u,{redirect:'manual'});assert.equal(r.status,301);assert.equal(r.headers.get('location'),'https://'+domain+'/');}
for(const p of ['/next30-core.js','/day-math.js','/email-worker.mjs','/.private-assets/paid-bundle.mjs'])assert.equal((await fetch('https://'+domain+p)).status,404);
const api='https://booked-af-email.wild-recipe-42df.workers.dev';assert.equal((await(await fetch(api)).json()).launchReady,true);assert.equal((await fetch(api+'/paid-content')).status,401);
const keys=await cf('/accounts/'+account+'/storage/kv/namespaces/c1030f222e4047ba8fc03636900a14fc/keys?prefix=contact%3A&limit=100');
zone=await cf('/zones/'+zone.id);const ds=await dns(domain,'DS');const sec=await cf('/zones/'+zone.id+'/dnssec');
try{console.log('PARENT DELEGATION',execFileSync('dig',['+norecurse',domain,'NS','@a.gtld-servers.net','+noall','+authority'],{encoding:'utf8',timeout:15000}).trim());}catch{console.log('Parent delegation TTL not available from this runner.');}
console.log('POST-CUTOVER VERIFIED',JSON.stringify({at:new Date().toISOString(),nameservers:ns,zoneStatus:zone.status,publicReleaseMatches:true,HTTPS:true,canonicalRedirects:true,emailDNSPreserved:true,paidCheckoutDisabled:true,paidSitePathsProtected:true,APIReady:true,contactRecordsFirstPage:keys.length,dnssecState:sec.status,registrarDS:ds.some(r=>r.type===43),DS:sec.ds||null}));
