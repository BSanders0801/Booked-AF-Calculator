// Publish the existing secure public bundle without selling unfinished products.
import {buildSecureSite} from './build-secure-site.mjs';
import {writeFile,readFile} from 'node:fs/promises';
const out=new URL('../.website-preview/',import.meta.url).pathname;
const notice='<section class="baf-section"><p class="baf-kicker">YOUR NEXT 30 · $49 ONE TIME</p><h1>NOT TAKING PAYMENTS YET.</h1><p>We’re finishing the paid experience before opening checkout. Start with your free Breakdown to understand what needs attention first.</p><button class="primary" data-nav="question">Get my free Breakdown →</button><p class="baf-small">Already purchased? Your existing access link still works. For help, email <a href="mailto:hello@bookedandfabulous.com">hello@bookedandfabulous.com</a>.</p></section>';
await buildSecureSite(out,new URL('../.private-assets/',import.meta.url).pathname,(s,name)=>{
 if(name==='app.js')s=s.replace("const next30CheckoutUrl = 'https://buy.stripe.com/6oU9AU5F72l05pA4RTaAw01';","const next30CheckoutUrl = '#deep-dive';");
 if(name==='site-content.js')s+='\nsitePages.paid='+JSON.stringify(notice)+';\n';
 if(name==='index.html')s=s.replace('data-product-nav>Your Next 30 · $49','data-product-nav>Your Next 30').replace(/((?:src|href)="[a-z-]+\.(?:js|css))(?:\?[^"]*)?"/g,'$1?v=public-20261016-1"');
 return s;
});
for(const [name,body] of Object.entries({
 'CNAME':'bookedandfabulous.com\n','.nojekyll':'',
 'robots.txt':'User-agent: *\nAllow: /\nSitemap: https://bookedandfabulous.com/sitemap.xml\n',
 'sitemap.xml':'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://bookedandfabulous.com/</loc></url></urlset>\n'
}))await writeFile(out+name,body);
const app=await readFile(out+'app.js','utf8');
if(app.includes('https://buy.stripe.com/'))throw Error('Public checkout remains enabled');
console.log('Public launch built; new checkout disabled; existing paid-access recovery preserved.');
