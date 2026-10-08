// Draft package: public assets only. The private module is never copied to the website.
import {resolve} from 'node:path';
import {buildSecureSite} from './build-secure-site.mjs';
const root=resolve(import.meta.dirname,'..');
await buildSecureSite(resolve(root,'.website-preview'),resolve(root,'.private-assets'));
console.log('Packaged public-only website; paid assets require server authorization.');
