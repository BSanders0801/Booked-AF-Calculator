// Public assets are explicitly assembled. Paid source is packaged only into a Worker module.
import {readFile, writeFile, mkdir, rm, readdir, copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
export const paidFiles=['day-math.js','next30-core.js','next30-ui.js','next30-rebooking.js','next30-buyback.js','next30-services.js','next30-lanes.js','next30-shell.js'];
function between(s,a,b){const start=s.indexOf(a),end=s.indexOf(b,start+1);if(start<0||end<0||s.indexOf(a,start+1)>=0)throw Error('Secure build boundary changed: '+a);return s.slice(start,end);}
export async function secureSources(){
 const source=await readFile(resolve(root,'app.js'),'utf8');
 const core=await readFile(resolve(root,'breakdown-core.js'),'utf8');
 const pages=await readFile(resolve(root,'site-content.js'),'utf8');
 // Keep questionnaire and clarity copy; remove recipes, diagnostics and calculators entirely.
 let publicCore=between(core,'// Shared by the website','function buildStudentBreakdown(')+between(core,'function shortFocusGoal(','function buildOutsideChairBreakdown(')+between(core,'// Public output is an explicit allowlist:','function leadershipBreakdown(')+`\nfunction buildShortBreakdown(a){return {audience:isStudent(a)?'student':'professional',category:a.readiness,stage:shortStage(a).label,top:{id:shortFocusGoal(a)||'money'}};}\n`;
 publicCore=publicCore.replace('function publicBreakdown(r) {','function publicBreakdown(r) { if(r.publicCopy)return r.publicCopy;');
 let app=between(source,'const legacyQuestions=','const deepQuestions=')+between(source,'let questions=legacyQuestions;','const voiceBanks=')+between(source,"const deliveryKey=","function read(){");
 // Legacy implementation views must never be present in public source, even as dead code.
 app=app.split('\n').filter(line=>!/^if\(state.view==='(?:deepintake|deepresult|membership|memberprogress|membercheck|membertool|checkin|daymath|plan)'/.test(line)).join('\n');
 const oldVerify=app.split('\n').find(line=>line.startsWith("if(state.view==='deepverify')"));
 if(!oldVerify)throw Error('Missing payment entry');
 app=app.replace(oldVerify,"if(state.view==='deepverify'){verifyAndLoadPaid();return}\nif(state.view==='deepintake'||state.view==='deepresult'){if(!window.BookedNext30){state.view='deepverify';render();return}if(state.view==='deepintake')renderCareerIntake();else renderCareerPlan();return}");
 app=app.replace('complete(values);',"if(result.breakdown){state.freePublicCopy={schema:state.schema,answers:JSON.stringify(state.answers),copy:result.breakdown};try{sessionStorage.setItem('booked-free-copy',JSON.stringify(state.freePublicCopy))}catch{}}complete(values);");
 app+=`\ntry{state.freePublicCopy=JSON.parse(sessionStorage.getItem('booked-free-copy')||'null')}catch{}\nfunction read(){if(state.freePublicCopy?.schema===state.schema&&state.freePublicCopy.answers===JSON.stringify(state.answers))return {stage:state.freePublicCopy.copy.stage,publicCopy:state.freePublicCopy.copy};if(state.schema===SHORT_SCHEMA)return buildShortBreakdown(state.answers);return {stage:({building:'BUILDING',busy:'GETTING BUSY',demand:'IN DEMAND',booked:'BOOKED AF'})[state.answers.stage]||'BUILDING',top:{id:state.answers.goal||'money'}};}\n`;
 // No preview routes may grant paid access in a published public bundle.
 let ui=await readFile(resolve(root,'site-ui.js'),'utf8');
 ui=ui.replace(/const preview = [^\n]+;/,'const preview = false;').replace(/const previewHost = [^\n]+;/,'const previewHost = false;');
 // Only the labels are needed to render public examples.
 const labels={chair:{tab:'BEHIND THE CHAIR',label:'BEHIND THE CHAIR'},session:{tab:'SESSION / EDITORIAL',label:'SESSION / EDITORIAL'},events:{tab:'BRIDAL + EVENTS',label:'BRIDAL + EVENTS'},education:{tab:'EDUCATION + BRAND',label:'EDUCATION + BRAND'},owner:{tab:'SALON OWNER',label:'SALON OWNER'},manager:{tab:'SALON MANAGER',label:'SALON MANAGER'}};
 const publicPages='const careerSampleData = '+JSON.stringify(labels)+';\n'+pages.slice(pages.indexOf('function leadershipSampleTabs('));
 let html=await readFile(resolve(root,'index.html'),'utf8');
 for(const name of paidFiles)html=html.replace(new RegExp('<script src="'+name.replace('.','\\.')+'[^\"]*" defer></script>'),'');
 html=html.replace('</head>','<meta name="referrer" content="no-referrer"></head>').replace('<script src="app.js','<script src="paid-loader.js" defer></script><script src="app.js');
 const files={'index.html':html,'app.js':app,'breakdown-core.js':publicCore,'site-content.js':publicPages,'site-ui.js':ui};
 files['app.js']=files['app.js'].replaceAll('fix the damn thing','fix the thing');
 for(const name of ['site.css','lifecycle-ui.js','paid-loader.js'])files[name]=await readFile(resolve(root,name),'utf8');
 return files;
}
export async function buildSecureSite(out, privateDir, transform=s=>s){
 const files=await secureSources();
 await rm(out,{recursive:true,force:true});await mkdir(resolve(out,'assets'),{recursive:true});await mkdir(privateDir,{recursive:true});
 for(const [name,content] of Object.entries(files))await writeFile(resolve(out,name),transform(content,name));
 for(const file of await readdir(resolve(root,'assets')))if(/\.(png|webp|svg|jpg|jpeg|gif|ico)$/i.test(file))await copyFile(resolve(root,'assets',file),resolve(out,'assets',file));
 const paid=(await Promise.all(paidFiles.map(f=>readFile(resolve(root,f),'utf8')))).join('\n;\n');
 await writeFile(resolve(privateDir,'paid-bundle.mjs'),'export default '+JSON.stringify(transform(paid,'paid-bundle.js'))+';\n');
 return files;
}
