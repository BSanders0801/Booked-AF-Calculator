import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const ctx=vm.createContext({});
vm.runInContext(fs.readFileSync('public/breakdown-core.js','utf8')+'\n'+fs.readFileSync('public/personalization.js','utf8')+`\n
globalThis.api={questions:shortQuestions,visible:shortVisibleQuestions,choices:shortChoices,validate:validateShortAnswers,result:a=>publicBreakdown(buildShortBreakdown(a)),complete(input){
 const a={careerstage:'working',...input};
 for(let round=0;round<3;round++)for(const q of shortQuestions){
 if(q.when&&!q.when(a)){delete a[q.id];continue;}
 if(q.type==='service-time'){a[q.id]??={service:'Highlights',hours:3,minutes:0};continue;}
 const choices=shortChoices(q,a),allowed=new Set(choices.map(c=>c[0]));
 if(a[q.id]!==undefined&&(q.multi?!a[q.id].every(v=>allowed.has(v)):!allowed.has(a[q.id])))delete a[q.id];
 if(a[q.id]===undefined)a[q.id]=q.multi?[choices[0][0]]:choices[0][0];
 }return validateShortAnswers(a);
}};`,ctx);
const api=ctx.api,covered=new Map();let count=0;
function check(input){
 const a=api.complete(input),p=api.result(a);count++;
 assert.equal(p.actions.length,3);assert.equal(new Set(p.actions).size,3);
 assert(!/undefined|NaN|\[object Object\]/.test(JSON.stringify(p)),JSON.stringify(a));
 assert(p.actions.every(x=>typeof x==='string'&&x.length>15));
 if(a.days&&a.days!=='0'&&a.spend!=='notyet')assert.doesNotMatch([p.body,...p.actions].join(' '),/not taking (?:clients|appointments)|not offering appointments/i);
 for(const q of api.visible(a)){if(q.type==='service-time'){covered.set(q.id,new Set(['service-time']));continue;}
 const values=q.multi?a[q.id]:[a[q.id]];if(!covered.has(q.id))covered.set(q.id,new Set());values.forEach(v=>covered.get(q.id).add(v));}
 return a;
}
const goals=['clients','money','return','keep','time','stable'];
for(const work of ['color','cut','extensions','session','events','education','owner','other','inactive'])for(const role of work==='owner'?['owner','manager']:['owner'])for(const full of ['notyet','under25','half','threequarters','full'])for(const goal of goals){
 const base=check({worktype:[work],leadershiprole:role,full,days:'4',goal:[goal],spend:'275'});
 // Every visible answer and every pair of compatible multi-select answers.
 for(const q of api.visible(base)){
 if(q.type==='service-time')continue;const choices=api.choices(q,base).map(x=>x[0]);
 for(const value of choices)check({...base,[q.id]:q.multi?[value]:value});
 if(q.multi)for(let i=0;i<choices.length;i++)for(let j=i+1;j<choices.length;j++)if(![choices[i],choices[j]].some(v=>(q.exclusive||[]).includes(v)))check({...base,[q.id]:[choices[i],choices[j]]});
 }
}
for(const careerstage of ['school','considering'])for(const readiness of ['salon','clients','consultation','rebooking','money','boundaries']){
 const a=check({careerstage,readiness});for(const q of api.visible(a))for(const [v] of api.choices(q,a))check({...a,[q.id]:q.multi?[v]:v});
}
// Every goal subset and each chosen priority, across all four stages.
for(let mask=1;mask<64;mask++){const selected=goals.filter((_,i)=>mask&(1<<i));for(const goalpriority of selected)for(const full of ['under25','half','threequarters','full'])check({worktype:['color'],days:'4',full,goal:selected,goalpriority,spend:'275'});}
const missing=api.questions.filter(q=>!covered.has(q.id)).map(q=>q.id);
assert.equal(missing.length,0,`Unvisited questions: ${missing}`);
console.log(`PASS ${count} branch/choice and multiselect audits; ${covered.size} questions reached; all goal subsets and priorities across four stages. Not a claim of every Cartesian permutation.`);
