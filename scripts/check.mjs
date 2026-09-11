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
   if(!url.startsWith('/'))continue;
   let target=path.join(root,url.split(/[?#]/)[0]);if(url.endsWith('/'))target=path.join(target,'index.html');
   assert.ok((await stat(target)).isFile(),`${file}: broken local link ${url}`);
  }
 }
 console.log(`${name}: checked ${count} HTML pages and all local links`);
}
console.log('Status boundaries, eight-series mapping, and public output checks passed.');
