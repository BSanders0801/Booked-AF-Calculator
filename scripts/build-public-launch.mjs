// Public release comes from the reconciled free-only source, never the paid development shell.
import {cp,readFile,rm,mkdir,readdir} from 'node:fs/promises';
const source=new URL('../public/',import.meta.url),out=new URL('../.website-preview/',import.meta.url);
const files=['index.html','app.js','breakdown-core.js','personalization.js','site-content.js','site-ui.js','site.css','lifecycle-ui.js','paid-loader.js','CNAME','.nojekyll','robots.txt','sitemap.xml'];
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const f of files)await cp(new URL(f,source),new URL(f,out));
await cp(new URL('assets/',source),new URL('assets/',out),{recursive:true});
const app=await readFile(new URL('app.js',out),'utf8'),core=await readFile(new URL('personalization.js',out),'utf8');
if(app.includes('https://buy.stripe.com/')||!app.includes('freeActionTips(p)')||!core.includes('beta-20261026-3'))throw Error('Public launch guard failed');
if((await readdir(out)).some(f=>f.startsWith('next30-')||f==='email-worker.mjs'))throw Error('Private source in public output');
console.log('Preserved current website and personalized Breakdown; checkout closed; paid modules excluded.');
