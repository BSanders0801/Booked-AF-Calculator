const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx=vm.createContext({});vm.runInContext(fs.readFileSync('breakdown-core.js','utf8'),ctx);
const run=code=>vm.runInContext(code,ctx);
run(`function complete(input){const a={careerstage:'working',...input};for(const q of shortQuestions){if(q.when&&!q.when(a))continue;if(q.type==='service-time'){a[q.id]={service:'Root touch-up',hours:1,minutes:30};continue;}if(a[q.id]===undefined){const value=shortChoices(q,a)[0][0];a[q.id]=q.multi?[value]:value}}return validateShortAnswers(a)}`);
let count=0;
for(const work of ['color','cut','extensions','session','events','education','owner','other']){
 for(const goal of ['clients','money','return','keep','time','stable']){
  const input={worktype:[work],goal:[goal]};
  if(work==='owner')input.leadershiprole='owner';
  const result=run(`buildShortBreakdown(complete(${JSON.stringify(input)}))`);
  assert(result.stage);assert(!JSON.stringify(result).includes('undefined'));
  const tips=run(`freeActionTips(${JSON.stringify(result)})`);assert.equal(tips.length,3);assert(tips.every(x=>typeof x==='string'&&x.length>20));count++;
 }
}
for(const stage of ['school','considering']){
 const result=run(`buildShortBreakdown(complete({careerstage:${JSON.stringify(stage)}}))`);
 assert.equal(result.audience,'student');assert.match(run(`publicBreakdown(${JSON.stringify(result)}).offer`),/nothing to buy/i);count++;
}
console.log('PASS '+count+' professional and student result paths');
