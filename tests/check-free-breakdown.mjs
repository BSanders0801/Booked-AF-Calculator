// Regression checks for the public free Breakdown. Run: node tests/check-free-breakdown.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const core=readFileSync(new URL('../breakdown-core.js',import.meta.url),'utf8');
const ui=readFileSync(new URL('../app.js',import.meta.url),'utf8');
function load(name) {
 const at=core.indexOf('function '+name+'(');
 assert.ok(at>=0,name+' missing');
 const end=core.indexOf('\n}',at)+2;
 assert.ok(end>at,name+' closing brace missing');
 return Function('return ('+core.slice(at,end)+')')();
}
const publicBreakdown=load('publicBreakdown');
const freeActionTips=load('freeActionTips');
const topics=['fill','clients','cheap','money','keep','return','rebooking','time','life','salon','consultation','boundaries'];
const stages=['BUILDING','GETTING BUSY','IN DEMAND','BOOKED AF'];
let count=0;
for(const stage of stages)for(const id of topics){
 const result=publicBreakdown({stage,top:{id:'short-'+id}});
 const tips=freeActionTips(result);
 assert.equal(tips.length,3,stage+'/'+id+' must have three steps');
 assert.equal(new Set(tips).size,3,stage+'/'+id+' duplicate steps');
 assert.ok(tips.every(t=>typeof t==='string'&&t.trim().length>35),stage+'/'+id+' weak or missing steps');
 assert.ok(!tips.join(' ').match(/start with the check below/i),stage+'/'+id+' ambiguous advice');
 count++;
}
assert.equal(freeActionTips({student:true,stage:'BUILDING'}).length,3);
count++;
assert.ok(ui.includes('THREE THINGS YOU CAN DO THIS WEEK'),'Public results missing steps');
assert.ok(ui.includes('The three actions below are your starting point'),'Public results missing clear guidance');
assert.ok(!ui.includes('Start with the check below'),'Old ambiguous guidance returned');
console.log('PASS: '+count+' stage/topic cases plus public results consistency.');
