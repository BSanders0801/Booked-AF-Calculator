// Deploy only this Worker's code, inheriting credentials inside Cloudflare.
// No credential values are read, written to files, or printed.
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const account='30ec5e35d67ddd1a1bab06c2263b2159';
const worker='booked-af-email';
export const required=['RESEND_API_KEY','TURNSTILE_SECRET_KEY','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','FOLLOWUPS'];
export function inheritedBindings(version){
 const bindings=version.resources?.bindings;
 if(!Array.isArray(bindings))throw new Error('Cannot inspect source binding names; deployment stopped.');
 const names=new Set(bindings.map(b=>b.name));
 const missing=required.filter(n=>!names.has(n));
 if(missing.length)throw new Error('Source version missing required bindings: '+missing.join(', '));
 return bindings.map(b=>({name:b.name,type:'inherit',version_id:version.id}));
}
export async function deploy(){
 const token=process.env.CLOUDFLARE_API_TOKEN;
 if(!token)throw new Error('Cloudflare build deployment token unavailable. No changes made.');
 const base=`https://api.cloudflare.com/client/v4/accounts/${account}/workers/scripts/${worker}`;
 async function api(path,options={},apiBase=base){
  const r=await fetch(apiBase+path,{...options,headers:{Authorization:`Bearer ${token}`,...options.headers}});
  const data=await r.json();
  if(!r.ok||!data.success)throw new Error(`Cloudflare request failed (${r.status}): `+(data.errors||[]).map(x=>`${x.code}: ${String(x.message).replace(/(?:Bearer\s+\S+|sk_(?:live|test)_\w+|re_\w+|whsec_\w+)/g,'[redacted]')}`).join('; '));
  return data.result;
 }
 const history=await api('/deployments');
 const active=history.deployments?.[0]?.versions;
 if(!Array.isArray(active)||active.length!==1||active[0].percentage!==100)throw new Error('Expected one active version; deployment stopped.');
 const source=await api('/versions/'+active[0].version_id);
 const bindings=inheritedBindings(source);
 console.log('Preserving configured bindings from active version '+source.id+': '+bindings.map(b=>b.name).join(', '));
 // The newer version API supports inheriting from an explicit historical version.
 // The legacy upload API only supports the latest uploaded version, even after rollback.
 const body={main_module:'email-worker.mjs',compatibility_date:'2026-09-25',bindings,modules:[{name:'email-worker.mjs',content_type:'application/javascript+module',content_base64:(await readFile(new URL('./email-worker.mjs',import.meta.url))).toString('base64')}],annotations:{'workers/message':'Deploy current API while preserving active service connections'}};
 const uploaded=await api('/versions?deploy=false',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)},`https://api.cloudflare.com/client/v4/accounts/${account}/workers/workers/${worker}`);
 inheritedBindings(await api('/versions/'+uploaded.id));
 // Recheck the active deployment before moving traffic, avoiding concurrent edits.
 const fresh=await api('/deployments');
 if(JSON.stringify(fresh.deployments?.[0]?.versions)!==JSON.stringify(active))throw new Error('Active deployment changed; traffic was not moved.');
 await api('/deployments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({strategy:'percentage',versions:[{version_id:uploaded.id,percentage:100}],annotations:{'workers/message':'Preserve email and payment connections'}})});
 console.log('Deployed version '+uploaded.id+'. Cron schedule and routes retained.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){deploy().catch(e=>{console.error(e.message);process.exitCode=1;});}
