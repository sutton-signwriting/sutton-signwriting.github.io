import assert from 'node:assert/strict';
import {readFile, readdir, stat} from 'node:fs/promises';
import path from 'node:path';
async function walk(dir) {const files=[];for(const item of await readdir(dir,{withFileTypes:true})){const p=path.join(dir,item.name);files.push(...item.isDirectory()?await walk(p):[p]);}return files;}
const status=JSON.parse(await readFile('site/status.json','utf8'));
assert.equal(status.kind,'reviewed-snapshot');
for(const item of status.services){assert.ok(item.current&&item.target&&item.verification);if(['app','api'].includes(item.id)){assert.equal(item.state,'not-ready');assert.equal(item.hostname,item.id+'.signwriting.org');}}
const pubs=JSON.parse(await readFile('site/publications.json','utf8'));assert.equal(pubs.series.length,8);
assert.equal(new Set(pubs.series.flatMap(s=>s.desks)).size,12);
for(const name of ['technology','back-office']){
 const root=path.resolve('dist',name);let count=0;
 for(const file of await walk(root)){
  if(!file.endsWith('.html'))continue;count++;const html=await readFile(file,'utf8');
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1,file+' needs one h1');
  assert.ok(!/192\.168\.|\/home\/|app\.sutton-signwriting\.io|api\.sutton-signwriting\.io|type="password"/.test(html),'Public boundary: '+file);
  for(const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
   if(!url.startsWith('/')&&!url.startsWith('#'))continue;
   const parsed=new URL(url,'https://local.invalid/'+path.relative(root,file));
   let target=path.join(root,parsed.pathname);if((await stat(target)).isDirectory())target=path.join(target,'index.html');
   assert.ok((await stat(target)).isFile(),`${file}: broken local link ${url}`);
   if(parsed.hash){const targetHtml=await readFile(target,'utf8');assert.ok(targetHtml.includes(`id="${decodeURIComponent(parsed.hash.slice(1))}"`),`${file}: broken fragment ${url}`);}
  }
 }
 console.log(`${name}: checked ${count} HTML pages and all local links`);
}
console.log('Status boundaries, eight-series mapping, and public output checks passed.');

const catalog=JSON.parse(await readFile('dist/technology/tools.json','utf8'));
const developerHtml=await readFile('dist/technology/developers/index.html','utf8');
const groupIds=new Set(catalog.groups.map(g=>g.id));
assert.deepEqual([...groupIds],['javascript','php','python','external']);
assert.equal(new Set(catalog.tools.map(t=>t.id)).size,catalog.tools.length);
for(const tool of catalog.tools){
 assert.ok(groupIds.has(tool.group));
 assert.ok(tool.environments.length&&tool.owner&&tool.documentation&&tool.repository);
 assert.ok(developerHtml.includes(`id="${tool.id}"`));
 if(tool.status==='Released')assert.ok(tool.install&&tool.version&&tool.registry);
}
assert.ok(catalog.tools.some(t=>t.group==='external'&&t.capabilities.includes('Structured data')));
assert.ok(catalog.tools.some(t=>t.group==='external'&&t.capabilities.includes('Machine learning')));
assert.match(catalog.communityExtension.integrationStatus,/has not been accepted/);
assert.deepEqual(catalog.communityExtension.possiblePackageReview.map(x=>x.package),['core','font-ttf','font-db']);
for(const [route,target] of [['packages','/developers/'],['tools','/developers/#javascript'],['machine-learning','/developers/#external']]){
 const html=await readFile(`dist/technology/${route}/index.html`,'utf8');
 assert.ok(html.includes(`content="0; url=${target}"`));
 assert.ok(html.includes('rel="canonical" href="https://www.sutton-signwriting.io/developers/"'));
}
assert.ok(!/cloud-maker|hello-world|portable/.test(developerHtml));
const nav=developerHtml.match(/<nav aria-label="Primary">([\s\S]*?)<\/nav>/)[1];
assert.ok(!/href="\/(packages|tools|machine-learning)\//.test(nav));
console.log('Developer environments, catalog, proposal status, and consolidated routes passed.');
