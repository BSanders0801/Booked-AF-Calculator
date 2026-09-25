"""Bundle a self-contained, no-network review copy. Production files stay separate."""
from pathlib import Path
import base64,re
root=Path(__file__).resolve().parents[1]
s=(root/'index.html').read_text()
s=s.replace('<link rel="stylesheet" href="site.css?v=redesign-1">','<style>'+(root/'site.css').read_text()+'</style>')
logo='data:image/png;base64,'+base64.b64encode((root/'assets/booked-af-logo.png').read_bytes()).decode()
s=s.replace('src="assets/booked-af-logo.png"',f'src="{logo}"',1)
setup='''window.BOOKED_AF_REVIEW=true;window.fetch=()=>Promise.reject(new Error('Network disabled in offline preview'));const reviewLogo=document.querySelector('.brand-logo').src;function reviewImages(){document.querySelectorAll('img[src="assets/booked-af-logo.png"]').forEach(img=>img.src=reviewLogo);}new MutationObserver(reviewImages).observe(document.body,{childList:true,subtree:true});reviewImages();'''
s=s.replace('<script src="day-math.js?v=1" defer></script>','<script>'+setup+'</script><script>'+ (root/'day-math.js').read_text()+'</script>')
for name in ['breakdown-core','site-content','app','site-ui']:
 s=re.sub(r'<script src="'+name+r'\.js\?[^\"]+" defer></script>',lambda m:'<script>'+ (root/(name+'.js')).read_text()+'</script>',s)
# Embed founder portrait in static and dynamically rendered pages.
portrait='data:image/svg+xml;base64,'+base64.b64encode((root/'assets/bradley-founder.svg').read_bytes()).decode()
s=s.replace('assets/bradley-founder.svg',portrait)
# Offline review cannot request CAPTCHA scripts or submit an email.
s=s.replace("function loadEmailVerification() {", "function loadEmailVerification() { if(window.BOOKED_AF_REVIEW) return Promise.reject(new Error('Email sending is unavailable in this review copy')); ")
(root/'review/BOOKED_AF_Redesign_Preview.html').write_text(s)
print('Review bundle:',len(s.encode()),'bytes')
