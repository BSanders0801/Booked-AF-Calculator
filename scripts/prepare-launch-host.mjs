// Refresh the existing public-only Worker host. No custom-domain or API change.
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
execFileSync('node',['scripts/build-public-launch.mjs'],{stdio:'inherit'});
const host='https://booked-af-site.wild-recipe-42df.workers.dev';
async function matches(){for(const name of ['index.html','app.js','site-content.js']){try{const r=await fetch(host+'/'+name,{signal:AbortSignal.timeout(10000)});if(!r.ok||await r.text()!==await readFile('.website-preview/'+name,'utf8'))return false;}catch{return false;}}return true;}
if(!await matches()){
 try{execFileSync('npx',['--yes','wrangler@4.148.0','deploy','--config','.release-review/site.config.json','--keep-vars'],{stdio:'pipe',timeout:240000});}catch(e){const msg=String(e.stderr||'').replaceAll(process.env.CLOUDFLARE_API_TOKEN||'UNSET','[redacted]');console.error(msg.slice(-1500));throw Error('Public host deployment failed');}
 let okay=false;for(let i=0;i<5;i++){if(await matches()){okay=true;break;}await new Promise(r=>setTimeout(r,2000));}if(!okay)throw Error('Public host byte verification failed');
}
for(const path of ['/next30-core.js','/day-math.js','/email-worker.mjs','/.private-assets/paid-bundle.mjs'])if((await fetch(host+path)).status!==404)throw Error('Public host exposes protected source');
const app=await readFile('.website-preview/app.js','utf8');if(app.includes('https://buy.stripe.com/'))throw Error('Checkout unexpectedly exposed');
console.log('Existing public Worker host matches approved free-launch release. Paid source paths return 404; checkout remains held.');
