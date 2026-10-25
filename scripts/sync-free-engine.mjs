// Embed the exact public engine without imports so existing Worker deployments stay self-contained.
import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const core=await readFile(new URL('public/breakdown-core.js',root),'utf8');
const personalization=await readFile(new URL('public/personalization.js',root),'utf8');
const embedded=`const FreeBreakdownEngine=(()=>{\n${core}\n${personalization}\nreturn {
 version:PERSONALIZATION_VERSION,
 validate(input){
  // Older saved profiles have no supplemental answers. Validate without inventing evidence.
  const supplied={...input};
  for(const q of supplementalQuestions)if(supplied[q.id]===undefined)supplied[q.id]=q.id==='inquiries'?'unknown':'unchecked';
  const clean=validateShortAnswers(supplied);
  for(const q of supplementalQuestions)if(input?.[q.id]===undefined)delete clean[q.id];
  return clean;
 },
 result:input=>publicBreakdown(buildShortBreakdown(input)),
 email:publicBreakdownEmail
};})();\n`;
const file=new URL('email-worker.mjs',root),source=await readFile(file,'utf8');
const start='// BEGIN PUBLIC FREE ENGINE\n',end='// END PUBLIC FREE ENGINE';
const a=source.indexOf(start),b=source.indexOf(end,a);
if(a<0||b<a)throw Error('Missing engine boundaries');
const updated=source.slice(0,a)+start+embedded+source.slice(b);
if(process.argv.includes('--check')){if(updated!==source)throw Error('Worker free engine differs from public source');}
else await writeFile(file,updated);
console.log('Website and Worker free engine are byte-aligned.');
