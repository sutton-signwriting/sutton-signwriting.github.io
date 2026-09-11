import {resolveToolCatalog} from '../site/developers.mjs';
import {createPages} from '../site/content.mjs';
import {readFile, writeFile, mkdir, cp, rm, readdir} from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const json = async file => JSON.parse(await readFile(path.join(root, file), 'utf8'));
const status = await json('site/status.json');
const packages = await json('site/packages.json');
const publications = await json('site/publications.json');
const release = await json('package.json');
const tools = resolveToolCatalog(await json('site/developer-tools.json'), packages);
const {pages, backPages, doc, redirects} = createPages({status, packages, publications, release, tools});
await mkdir(path.join(root,'dist'),{recursive:true});
for (const [name, entries, back] of [['technology',pages,false],['back-office',backPages,true]]) {
  const out=path.join(root,'dist',name);await mkdir(out,{recursive:true});for(const old of await readdir(out))await rm(path.join(out,old),{recursive:true,force:true});await cp(path.join(root,'site/assets'),path.join(out,'assets'),{recursive:true});
  for (const [route,[title,body]] of entries) {const dir=path.join(out,route);await mkdir(dir,{recursive:true});await writeFile(path.join(dir,'index.html'),doc(title,body,route,back));}
  await writeFile(path.join(out,'health'),'ok\n');
  await writeFile(path.join(out,'404.html'),doc('Page not found','<div class="page-title shell"><h1>Page not found</h1><p>Choose a navigation link to continue.</p></div>','',back));
  await writeFile(path.join(out,'robots.txt'),'User-agent: *\nDisallow: /\n');
}
for (const [route, target] of redirects) {
  const dir=path.join(root,'dist/technology',route);await mkdir(dir,{recursive:true});
  const body=`<div class="page-title shell"><h1>Developer tools</h1><p>Libraries, packages, and tools are together on one page.</p><a href="${target}">Continue to developer tools →</a></div>`;
  const html=doc('Developer tools',body,'developers').replace('</head>',`<meta http-equiv="refresh" content="0; url=${target}"></head>`);
  await writeFile(path.join(dir,'index.html'),html);
}
await writeFile(path.join(root,'dist/technology/tools.json'),JSON.stringify(tools,null,2)+'\n');
await cp(path.join(root,'site/status.json'),path.join(root,'dist/technology/status.json'));
await cp(path.join(root,'site/packages.json'),path.join(root,'dist/technology/packages.json'));
await writeFile(path.join(root,'dist/technology/sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...pages.keys()].map(route=>`<url><loc>https://www.sutton-signwriting.io/${route?route+'/':''}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${pages.size} technology pages, ${redirects.size} redirects, and ${backPages.size} Back Office pages; version ${release.version}.`);
