// Local preparation only. No network requests, provider changes or deployment commands.
import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {createHash} from 'node:crypto';
import {buildSecureSite,paidFiles} from './build-secure-site.mjs';
const root=resolve(import.meta.dirname,'..');
const out=resolve(root,'.release-review');
const publicDir=resolve(root,'.website-preview');
await buildSecureSite(publicDir,resolve(root,'.private-assets'));
await mkdir(out,{recursive:true});
const current=JSON.parse((await readFile(resolve(root,'wrangler.jsonc'),'utf8')).replace(/^\s*\/\/.*$/gm,''));
if(current.name!=='booked-af-email'||current.main!=='email-worker.mjs')throw Error('Production configuration changed; review before preparing.');
if(current.kv_namespaces?.length!==1||current.kv_namespaces[0].binding!=='FOLLOWUPS')throw Error('Unexpected profile storage configuration.');
const api={name:current.name,main:'../secure-api-worker.mjs',compatibility_date:current.compatibility_date,workers_dev:true,keep_vars:true,kv_namespaces:current.kv_namespaces,durable_objects:{bindings:[{name:'FULFILLMENT',class_name:'PurchaseFulfillment'}]},migrations:[{tag:'purchase-fulfillment-v1',new_sqlite_classes:['PurchaseFulfillment']}]};
const site={name:'booked-af-site',compatibility_date:current.compatibility_date,workers_dev:true,assets:{directory:'../.website-preview',not_found_handling:'none'}};
const manifest=[];
async function audit(dir){for(const ent of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,ent.name),name=relative(publicDir,path);if(ent.isSymbolicLink())throw Error('Symlink in public package');if(ent.isDirectory()){if(name!=='assets')throw Error('Unexpected public directory');await audit(path);continue;}if(paidFiles.includes(ent.name)||!(/^(index\.html|app\.js|breakdown-core\.js|site-content\.js|site-ui\.js|site\.css|lifecycle-ui\.js|paid-loader\.js)$/.test(name)||/^assets\/[^/]+\.(png|webp|svg|jpg|jpeg|gif|ico)$/i.test(name)))throw Error('Unexpected public file: '+name);const bytes=await readFile(path);manifest.push({path:name,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});}}
await audit(publicDir);
for(const [name,data] of [['api.config.json',api],['site.config.json',site],['public-manifest.json',manifest]])await writeFile(resolve(out,name),JSON.stringify(data,null,2)+'\n');
console.log('Release review prepared locally. No deployment performed. Public asset count: '+manifest.length);
