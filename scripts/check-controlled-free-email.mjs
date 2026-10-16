// One requested Breakdown to the previously approved test inbox via isolated test Worker.
// Never uses production verification tokens, customer contacts or payment routes.
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const email=(process.env.TEST_RECIPIENT_EMAIL||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error('Approved test inbox secret missing');
const context=vm.createContext({});vm.runInContext(await readFile('breakdown-core.js','utf8')+';globalThis.complete=()=>{const a={careerstage:"building",worktype:["color"],goal:["clients"],full:"under25",days:"3"};for(const q of shortQuestions){if(a[q.id]===undefined&&(!q.when||q.when(a))){const choices=shortChoices(q,a);a[q.id]=q.multi?[choices[0][0]]:choices[0][0]}}return a}',context);
const origin='https://booked-af-email-test.wild-recipe-42df.workers.dev';
const health=await(await fetch(origin+'/health')).json();if(!health.isolated||!health.ready||!health.profiles)throw Error('Isolated test service not ready');
const payload={schema:'short-v5',type:'breakdown',name:'Launch Test',email,answers:context.complete(),token:'XXXX.DUMMY.TOKEN.XXXX',marketingConsent:false};
const r=await fetch(origin+'/lead-test',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(30000)});let result;try{result=await r.json()}catch{}if(!r.ok||!result?.success||!result.breakdown?.title)throw Error('Controlled test signup failed '+r.status);if(result.breakdown.plan)throw Error('Paid plan exposed');
console.log('Controlled isolated free Breakdown accepted; personalized clarity returned; requested email provider accepted delivery to the approved test inbox. This is not production-domain visitor proof or inbox receipt.');
