// Switch only public website routes after validating Cloudflare HTTPS at the edge.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve4} from 'node:dns/promises';
import {execFileSync} from 'node:child_process';
const account='30ec5e35d67ddd1a1bab06c2263b2159',domain='bookedandfabulous.com',root='https://api.cloudflare.com/client/v4',token=(process.env.CLOUDFLARE_API_TOKEN||'').trim();
async function cf(path,method='GET',body){const r=await fetch(root+path,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});const d=await r.json();if(!r.ok||!d.success)throw Error('Provider operation failed '+r.status+' '+path+' '+JSON.stringify(d.errors));return d.result;}
let zone=(await cf('/zones?name='+domain))[0];assert.equal(zone.account.id,account);
for(let i=0;zone.status==='pending'&&i<18;i++){await new Promise(r=>setTimeout(r,10000));zone=await cf('/zones/'+zone.id);}
console.log('Cloudflare activation',zone.status);
if(zone.status!=='active'){console.log('No website routing change: waiting for Cloudflare activation.');process.exit(0);}
const recordPath='/zones/'+zone.id+'/dns_records',routePath='/zones/'+zone.id+'/workers/routes';
const records=await cf(recordPath+'?per_page=100');
const web=r=>(r.name===domain&&['A','AAAA'].includes(r.type))||(r.name==='www.'+domain&&r.type==='CNAME');
const mailSnapshot=JSON.stringify(records.filter(r=>!web(r)).map(r=>[r.id,r.type,r.name,r.content,r.priority]).sort());
let routes=await cf(routePath);
for(const pattern of [domain+'/*','www.'+domain+'/*']){const old=routes.find(r=>r.pattern===pattern);if(old)assert.equal(old.script,'booked-af-site','Conflicting production route');else await cf(routePath,'POST',{pattern,script:'booked-af-site'});}
const ip=(await resolve4('booked-af-site.wild-recipe-42df.workers.dev'))[0];
let edgeReady=false;
for(let n=0;n<6;n++){try{
 const result=execFileSync('curl',['--silent','--show-error','--connect-timeout','10','--max-time','20','--resolve',domain+':443:'+ip,'-D','/tmp/booked-edge-headers','-o','/tmp/booked-edge-body','https://'+domain+'/'],{encoding:'utf8',stdio:'pipe'});
 const headers=await readFile('/tmp/booked-edge-headers','utf8'),body=await readFile('/tmp/booked-edge-body','utf8');
 if(headers.toLowerCase().includes('x-booked-af-host: cloudflare-public')&&body.replaceAll('\r\n','\n')===(await readFile('.website-preview/index.html','utf8')).replaceAll('\r\n','\n')){edgeReady=true;break;}
 }catch{}await new Promise(r=>setTimeout(r,10000));}
if(!edgeReady){console.log('Cloudflare routes staged; HTTPS at edge not yet ready. DNS-only website preserved.');process.exit(0);}
for(const r of records.filter(web))if(!r.proxied)await cf(recordPath+'/'+r.id,'PATCH',{proxied:true});
const after=await cf(recordPath+'?per_page=100');assert.equal(JSON.stringify(after.filter(r=>!web(r)).map(r=>[r.id,r.type,r.name,r.content,r.priority]).sort()),mailSnapshot);
for(const name of ['index.html','app.js','site-content.js','site-ui.js']){const r=await fetch('https://'+domain+'/'+name);assert.equal(r.status,200);assert.ok((await r.text()).replaceAll('\r\n','\n')===(await readFile('.website-preview/'+name,'utf8')).replaceAll('\r\n','\n'));console.log('Branded public release verified',name,'workerObserved',r.headers.get('x-booked-af-host')==='cloudflare-public');}
const www=await fetch('https://www.'+domain+'/',{redirect:'manual'});assert.equal(www.status,301);assert.equal(www.headers.get('location'),'https://'+domain+'/');
const dnssec=await cf('/zones/'+zone.id+'/dnssec','PATCH',{status:'active'});console.log('DNSSEC prepared; registrar DS deliberately not installed during nameserver cache transition',JSON.stringify({status:dnssec.status,ds:dnssec.ds}));
console.log('PUBLIC WORKER HOST CUTOVER PASS: active zone, validated edge TLS and exact assets, apex/www routing, email DNS unchanged.');
