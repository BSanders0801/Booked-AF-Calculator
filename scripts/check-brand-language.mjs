// Text regression guard. The register, tests and archives are intentionally not marketing.
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {resolve,relative} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const rules=JSON.parse(readFileSync(resolve(root,'docs/brand-language-rules.json'),'utf8'));
const register=JSON.parse(readFileSync(resolve(root,'docs/retired-language.json'),'utf8'));
// Match complete retired phrases across HTML, punctuation and line breaks.
// The human-readable register includes instructions as well as public wording;
// neither is allowed to regain authority in active files.
const normalize=s=>s.replace(/<[^>]*>/g,' ').replace(/\\[nr]/g,' ').replace(/[’‘]/g,"'").toLowerCase().replace(/[^a-z0-9']+/g,' ').trim();
const failures=[];let scanned=0;
function walk(dir){for(const name of readdirSync(dir)){const p=resolve(dir,name),rel=relative(root,p);
 if(name.startsWith('.')||['node_modules','tests','archive','docs'].includes(name))continue;
 if(statSync(p).isDirectory()){walk(p);continue;}
 if(!/\.(?:js|mjs|html|md)$/.test(name)||name==='check-brand-language.mjs')continue;
 const raw=readFileSync(p,'utf8');const plain=raw.replace(/<[^>]*>/g,' ').replace(/\\[nr]/g,' ').replace(/\s+/g,' ');scanned++;
 for(const [id,pattern] of Object.entries(rules)){const m=new RegExp(pattern,'i').exec(plain);if(m)failures.push({file:rel,rule:id,match:m[0]});}
 const normalized=' '+normalize(raw)+' ';
 for(const entry of register){
  const phrase=normalize(entry.language);
  // A standalone catchphrase is retired; an instruction to gather actual
  // expense receipts remains valid and must not be rewritten to appease a scan.
  const found=entry.language==='THE RECEIPTS'
   ? /["'>]THE RECEIPTS[.!]?["'<]/i.test(raw)
   : phrase&&normalized.includes(' '+phrase+' ');
  if(found)failures.push({file:rel,rule:'retired-register',match:entry.language,status:entry.status});
 }
}}
walk(root);console.log(JSON.stringify({scanned,failures},null,2));if(failures.length)process.exitCode=1;
