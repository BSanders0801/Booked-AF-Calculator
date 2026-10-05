"""Build the existing review page with the actual source, offline network stubs,
and viewport controls for rendered mobile/desktop QA. Never grants paid access."""
from pathlib import Path
import base64,json,re,html
root=Path(__file__).resolve().parents[1]
s=(root/'index.html').read_text()
s=re.sub(r'<meta property="og:[^>]+>','',s)
s=re.sub(r'<link rel="canonical"[^>]+>','',s)
s=re.sub(r'<link rel="stylesheet" href="site.css\?[^\"]+">',lambda _: '<style>'+(root/'site.css').read_text()+'</style>',s)
setup='''window.BOOKED_AF_REVIEW=true;
history.pushState=history.replaceState=()=>{};
for(const name of ['localStorage','sessionStorage']){const data=new Map();Object.defineProperty(window,name,{value:{getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key),clear:()=>data.clear()}});}
window.turnstile={render:(el,options)=>{options.callback('offline-review');return 'review';},remove:()=>{},reset:()=>{}};
window.fetch=async(url,options={})=>({ok:true,status:200,json:async()=>String(url).includes('verify-checkout')?{paid:false}:options.method==='POST'?{success:true}:{ready:true,schemas:['short-v5']}});
'''
s=s.replace('<script src="day-math.js?v=1" defer></script>','<script>'+setup+'</script><script>'+(root/'day-math.js').read_text()+'</script>')
for name in ['breakdown-core','site-content','next30-core','next30-ui','next30-rebooking','next30-buyback','next30-services','next30-lanes','next30-shell','app','lifecycle-ui','site-ui']:
 s=re.sub(r'<script src="'+name+r'\.js\?[^\"]+" defer></script>',lambda _:'<script>'+(root/(name+'.js')).read_text()+'</script>',s)
for name in ['booked-af-logo.webp','booked-af-logo.png','bradley-founder.webp']:
 mime='image/webp' if name.endswith('webp') else 'image/png'
 encoded='data:'+mime+';base64,'+base64.b64encode((root/'assets'/name).read_bytes()).decode()
 s=s.replace('assets/'+name,encoded)
s=s.replace('REDESIGN PREVIEW · Your live site has not changed','OFFLINE REVIEW · Sample submissions only. No emails or payments.')
outer='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BOOKED AF responsive review</title><style>body{margin:0;background:#242124;color:white;font:16px system-ui}header{padding:16px;position:sticky;top:0;background:#242124;z-index:5;display:flex;gap:12px;flex-wrap:wrap;align-items:center}label{display:flex;align-items:center;gap:12px}select,button{font:inherit;padding:9px}iframe{display:block;height:900px;border:1px solid #555;max-width:none;margin:0 auto;background:#080609}main{overflow:auto;padding:20px}</style><header><strong>BOOKED AF · OFFLINE REVIEW</strong><label>Viewport width<select id="width"><option value="390">390px · mobile</option><option value="320">320px · small mobile</option><option value="430">430px · large mobile</option><option value="1440">1440px · desktop</option></select></label><button id="reset">Reset sample</button><span>Real site code. Mock delivery. No emails or payments.</span></header><main><iframe title="BOOKED AF preview" id="preview" width="390"></iframe></main><script>const html='''+json.dumps(s).replace('</',r'<\/')+''';const frame=document.getElementById('preview');frame.srcdoc=html;document.getElementById('width').onchange=e=>frame.width=e.target.value;document.getElementById('reset').onclick=()=>{frame.srcdoc=html;};</script></html>'''
(root/'review/BOOKED_AF_Redesign_Preview.html').write_text(outer)
print('Built responsive review using current site source; all network operations mocked.')
