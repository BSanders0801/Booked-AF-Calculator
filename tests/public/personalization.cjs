const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx=vm.createContext({});for(const f of ['breakdown-core.js','personalization.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
run(`function complete(input){const a={careerstage:'working',...input};for(const q of shortQuestions){if(q.when&&!q.when(a))continue;if(a[q.id]!==undefined)continue;if(q.type==='service-time'){a[q.id]={service:'Full highlights',hours:3,minutes:0};continue;}const value=shortChoices(q,a)[0][0];a[q.id]=q.multi?[value]:value;}return validateShortAnswers(a);}`);
const complete=x=>JSON.parse(JSON.stringify(run(`complete(${JSON.stringify(x)})`)));
const result=x=>JSON.parse(JSON.stringify(run(`publicBreakdown(buildShortBreakdown(${JSON.stringify(complete(x))}))`)));
const base={worktype:['color'],days:'4',full:'half',spend:'275'};
let count=0;const variants=new Set();
function check(x){const a=complete(x),p=result(x);assert.equal(p.actions.length,3);assert.equal(new Set(p.actions).size,3);for(const t of [p.title,p.body,...p.actions]){assert(t&&t.length>10);assert(!/undefined|NaN|\[object Object\]/.test(t));}assert(!/\$\d/.test(p.actions.join(' ')));assert.equal(p.stage,run(`shortStage(${JSON.stringify(a)}).label`));const email=run(`publicBreakdownEmail(buildShortBreakdown(${JSON.stringify(a)}),'Test')`);p.actions.forEach(t=>assert(email.includes(t)));variants.add(p.actions.join('|'));count++;return p;}
for(const full of ['notyet','under25','half','threequarters','full'])for(const goal of ['clients','return','money','keep','time','stable']){
 const fields={clients:{inquiries:['few','lost','book','unknown'],returning:['notyet','low','some','most','almostall','unknown'],network:['none']},return:{returning:['notyet','low','some','most','almostall','unknown'],nextvisit:['prescribe','ask','desk','rare'],followup:[['none'],['unknown'],['personal'],['automatic'],['desk']]},money:{paymodel:['commission','self','owner','mixed'],pricecheck:['short','unchecked','works','fixed'],costs:['clear','tight','rough','unknown']},keep:{costs:['clear','tight','rough','unknown'],costleak:['space','product','discount','fees','team','unknown']},time:{days:['0','1','4','6'],overrun:['gaps','overrun','squeeze','messages','none','unknown'],targetdays:['1','3','5','shorter','unknown']},stable:{savings:['none','month','few','solid','unknown'],futurehabit:['catchup','spend','random','save'],futurefear:['emergency','timeoff','retire','body','unknown']}}[goal];
 function combinations(entries,i=0,x={}){if(i===entries.length){check({...base,full,goal:[goal],...x});return;}const[k,vs]=entries[i];for(const v of vs)combinations(entries,i+1,{...x,[k]:v});}combinations(Object.entries(fields));
}
for(const full of ['under25','half','threequarters','full'])for(const hourlytime of ['no','sometimes','often','unknown'])check({...base,full,goal:['money'],paymodel:'hourly',hourlytime});
for(const work of ['session','events','education','owner','other','inactive'])for(const leadershiprole of work==='owner'?['owner','manager']:['owner'])for(const workload of ['notyet','light','half','busy','full'])for(const goal of ['clients','return','money','keep','time','stable'])check({worktype:[work],leadershiprole,workload,goal:[goal]});
for(const careerstage of ['school','considering'])for(const readiness of ['salon','clients','consultation','rebooking','money','boundaries'])for(const direction of ['employee','rental','freelance','unsure'])check({careerstage,readiness,direction});
for(const goal of ['clients','return','money','keep','time','stable'])for(const second of ['clients','return','money','keep','time','stable'])if(goal!==second){const p=check({...base,goal:[goal,second],goalpriority:goal});assert.match(p.actions[2],/also/);}
const lost=result({...base,goal:['clients'],inquiries:'lost',returning:'most'});assert.match(lost.title,/ASKING AND BOOKING/);assert(!/post|referral/i.test(lost.actions[1]));
assert.match(result({...base,goal:['clients'],inquiries:'few',returning:'low'}).title,/RETURN VISIT/);
assert.match(result({...base,goal:['return'],returning:'almostall'}).title,/ALREADY WORKING/);
assert.match(result({...base,goal:['money'],pricecheck:'fixed'}).actions[2],/manager/);
assert.match(result({...base,goal:['money'],pricecheck:'unchecked'}).actions[0],/cannot establish/);
assert.match(result({...base,goal:['money'],paymodel:'hourly',hourlytime:'no'}).actions[0],/match your work/);
const stopped=result({...base,days:'0',goal:['clients']});assert.equal(stopped.stage,'BUILDING');assert(!/last five/i.test(stopped.actions[1]));
assert.match(result({...base,full:'full',goal:['time'],overrun:'none'}).actions[0],/finish as planned/);
assert.match(result({...base,goal:['stable'],savings:'solid'}).title,/CUSHION/);
const clean=complete({...base,goal:['time'],overrun:'gaps'});const stale=run(`publicBreakdown(buildShortBreakdown(${JSON.stringify({...clean,inquiries:'lost',pricecheck:'short',costleak:'discount'})}))`);assert.deepEqual(JSON.parse(JSON.stringify(stale)),result(clean));
assert.throws(()=>run(`validateShortAnswers(${JSON.stringify({...clean,overrun:'made-up'})})`));
console.log('PASS '+count+' answer combinations; '+variants.size+' distinct recommendation sets; evidence, stage, secondary goals, student/lane guards, stale-answer exclusion, share-copy parity');

// An empty calendar is not a statement that appointments are unavailable.
for(const days of ['1','2','3','4','5','6'])for(const full of ['notyet','under25','half','threequarters','full'])for(const goal of ['clients','money','return','keep','time','stable']){
 const p=result({...base,days,full,goal:[goal],spend:'275'});
 assert.doesNotMatch([p.body,...p.actions].join(' '),/not taking (?:clients|appointments)|not offering appointments|before the first appointment/i);
}
console.log('PASS 180 appointment-availability regressions including empty books');
