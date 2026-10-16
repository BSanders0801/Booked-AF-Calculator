// Reconcile only bookedandfabulous.com against its currently authoritative public DNS.
// Does not change the registrar, nameservers, mail routing, or any other domain.
const root='https://api.cloudflare.com/client/v4',domain='bookedandfabulous.com',account='30ec5e35d67ddd1a1bab06c2263b2159';
const token=(process.env.CLOUDFLARE_API_TOKEN||'').trim();
if(!/^[A-Za-z0-9_-]{20,200}$/.test(token))throw Error('Launch token formatting invalid');
async function api(path,method='GET',body){const r=await fetch(root+path,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});const d=await r.json();if(!r.ok||!d.success)throw Error('Cloudflare '+method+' failed '+r.status+' '+JSON.stringify(d.errors?.map(e=>({code:e.code,message:e.message}))));return d.result;}
async function dns(name,type){const r=await fetch('https://cloudflare-dns.com/dns-query?name='+encodeURIComponent(name)+'&type='+type,{headers:{Accept:'application/dns-json'},signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('DNS lookup failed');const d=await r.json();if(![0,3].includes(d.Status))throw Error('DNS status '+d.Status);return d.Answer||[];}
const zones=await api('/zones?name='+domain);if(zones.length!==1||zones[0].account.id!==account)throw Error('Wrong zone');const zone=zones[0],base='/zones/'+zone.id+'/dns_records';
const authoritative=(await dns(domain,'NS')).filter(r=>r.type===2).map(r=>r.data.replace(/\.$/,''));
if(!authoritative.length||authoritative.some(x=>!['launch1.spaceship.net','launch2.spaceship.net'].includes(x)))throw Error('Authoritative nameservers changed; inspect before reconciliation');
let records=await api(base+'?per_page=100');if(records.length>=100)throw Error('Inventory pagination required');
const wanted=new Map(records.map(r=>[r.type+'|'+r.name,[r.name,r.type]]));
for(const [name,type] of [[domain,'A'],[domain,'AAAA'],[domain,'MX'],[domain,'TXT'],[domain,'CAA'],['www.'+domain,'CNAME'],['send.'+domain,'CNAME'],['rsend.'+domain,'CNAME'],['resend.'+domain,'CNAME'],['_dmarc.'+domain,'TXT'],['google._domainkey.'+domain,'TXT'],['resend._domainkey.'+domain,'TXT'],['send.'+domain,'TXT'],['send.'+domain,'MX']])wanted.set(type+'|'+name,[name,type]);
const typeIds={A:1,AAAA:28,CNAME:5,MX:15,TXT:16,CAA:257};
const normalize=(type,value)=>type==='TXT'?(String(value).match(/"([^"]*)"/g)||[String(value)]).map(s=>s.replace(/^"|"$/g,'')).join(''):String(value).replace(/\.$/,'');
const expected=[];
for(const [name,type] of wanted.values()){
 for(const row of await dns(name,type)){
  if(row.type!==typeIds[type]||row.name.toLowerCase()!==name.toLowerCase())continue;
  const item={type,name,content:type==='TXT'?normalize(type,row.data):row.data.replace(/\.$/,''),ttl:Math.max(60,Math.min(1800,row.TTL||300))};
  if(type==='MX'){const parts=row.data.split(' ');item.priority=Number(parts.shift());item.content=parts.join(' ').replace(/\.$/,'');}
  if(type==='CAA')throw Error('CAA record needs structured review before cutover');
  if(['A','AAAA','CNAME'].includes(type))item.proxied=false;
  expected.push(item);
 }
}
for(const type of ['MX','TXT'])if(!expected.some(r=>r.name===domain&&r.type===type))throw Error('Missing expected email records');
for(const name of ['google._domainkey.'+domain,'resend._domainkey.'+domain])if(!expected.some(r=>r.name===name&&r.type==='TXT'))throw Error('Missing DKIM');
const equal=(a,b)=>a.type===b.type&&a.name===b.name&&normalize(a.type,a.content)===normalize(b.type,b.content)&&(a.priority??null)===(b.priority??null);
for(const item of expected){
 const existing=records.find(r=>equal(r,item));
 if(existing){if(item.proxied===false&&existing.proxied){await api(base+'/'+existing.id,'PATCH',{proxied:false});console.log('Set DNS-only:',item.type,item.name);}continue;}
 const conflicting=records.filter(r=>r.name===item.name&&r.type===item.type&&!expected.some(e=>equal(e,r)));
 if(conflicting.length===1&&item.type==='CNAME'&&item.name==='rsend.'+domain&&item.content==='rsend.forge.rmta.net'&&conflicting[0].content==='rsend.forge.mta.net'){
  const check=await(await fetch('https://dns.google/resolve?name='+item.name+'&type=CNAME')).json();if(!check.Answer?.some(r=>r.type===5&&r.data.replace(/\.$/,'')===item.content))throw Error('Independent DNS confirmation failed');
  await api(base+'/'+conflicting[0].id,'PATCH',{content:item.content,proxied:false});console.log('Corrected verified imported CNAME:',item.name);continue;
 }
 if(conflicting.length)throw Error('Destination conflict: '+item.type+' '+item.name+'; retained existing record for review');
 await api(base,'POST',item);console.log('Copied authoritative record:',item.type,item.name);
}
records=await api(base+'?per_page=100');for(const e of expected)if(!records.some(r=>equal(r,e)&&(e.proxied===undefined||r.proxied===e.proxied)))throw Error('DNS copy verification failed: '+e.name);
const ds=(await dns(domain,'DS')).filter(r=>r.type===43);if(ds.length)console.log('CUTOVER BLOCKED: registrar DNSSEC DS records are present. Do not change nameservers until registrar DNSSEC transition is coordinated.');
const earliestSafeCutover='2026-10-17T22:45:00Z';
const dsCacheWaitComplete=Date.now()>=Date.parse(earliestSafeCutover);
console.log(JSON.stringify({earliestSafeCutover,dsCacheWaitComplete,domain,zoneStatus:zone.status,authoritativeNameservers:authoritative,assignedNameservers:zone.name_servers,verifiedAuthoritativeRecords:expected.length,workspaceMXPreserved:expected.some(r=>r.type==='MX'&&r.content==='smtp.google.com'),googleDKIMPreserved:true,resendDKIMPreserved:true,dmarcPresent:expected.some(r=>r.name==='_dmarc.'+domain&&r.type==='TXT'),dnssecDS:ds.length>0,cutoverReady:ds.length===0&&dsCacheWaitComplete,nameserversChanged:false}));
