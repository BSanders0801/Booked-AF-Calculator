// Package the draft website only. Never copy Worker code, credentials, or repository files.
import { mkdir, copyFile, readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const out = resolve(root, '.website-preview');
const files = ["index.html","site.css","day-math.js","breakdown-core.js","site-content.js","next30-core.js","next30-ui.js","next30-rebooking.js","next30-buyback.js","next30-services.js","next30-shell.js","app.js","lifecycle-ui.js","site-ui.js"];
await mkdir(out, {recursive:true});
for (const file of files) await copyFile(resolve(root,file), resolve(out,file));
await mkdir(resolve(out,'assets'), {recursive:true});
for (const file of await readdir(resolve(root,'assets'))) {
  if (/\.(png|webp|svg|jpg|jpeg|gif|ico)$/i.test(file)) await copyFile(resolve(root,'assets',file),resolve(out,'assets',file));
}
const html = await readFile(resolve(out,'index.html'),'utf8');
for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
  const path = match[1].split('?')[0];
  if (!path || /^(?:https?:|mailto:|#|data:)/.test(path)) continue;
  await readFile(resolve(out,path));
}
console.log('Packaged current draft website and verified local HTML assets.');
