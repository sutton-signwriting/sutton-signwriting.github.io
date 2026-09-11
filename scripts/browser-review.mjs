import {spawn} from 'node:child_process';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
const [office, technology, backOffice, output] = process.argv.slice(2);
if(!output)throw new Error('Usage: node browser-review.mjs OFFICE_URL TECHNOLOGY_URL BACK_OFFICE_URL OUTPUT');
const profile=await mkdtemp(path.join(tmpdir(),'designer-browser-'));await mkdir(output,{recursive:true});
const browser=spawn('chromium',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:['ignore','ignore','pipe']});
let socket;
const delay=ms=>new Promise(r=>setTimeout(r,ms));
try{
 const endpoint=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Browser timeout')),15000);browser.stderr.on('data',b=>{const m=b.toString().match(/DevTools listening on (ws:\/\/\S+)/);if(m){clearTimeout(timer);resolve(m[1]);}});browser.on('exit',code=>reject(new Error('Browser exit '+code)));});
 const pages=await fetch('http://'+new URL(endpoint).host+'/json/list').then(r=>r.json());
 socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
 await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j;});
 let id=0;const pending=new Map();const errors=[];
 socket.onmessage=({data})=>{const m=JSON.parse(data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);if(!m.id)return;const p=pending.get(m.id);if(!p)return;pending.delete(m.id);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);};
 const call=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.text);return r.result.value;};
 await call('Page.enable');await call('Runtime.enable');
 const report=[];
 for(const [name,url] of [['front-office',office],['technology',technology],['back-office',backOffice]]){
  for(const [size,width,height] of [['desktop',1440,1050],['mobile',390,844]]){
   await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
   await call('Page.navigate',{url});await delay(900);
   if(name==='front-office')await evaluate(`new Promise((resolve,reject)=>{const stop=Date.now()+8000;function check(){if(document.querySelectorAll('.bot-card').length===12)return resolve(true);if(Date.now()>stop)return reject(new Error('Office initialization'));setTimeout(check,50)}check()})`);
   const info=await evaluate(`(()=>({title:document.title,h1:document.querySelectorAll('h1').length,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,links:[...document.querySelectorAll('a')].map(a=>({text:a.textContent.trim(),href:a.href})),stewards:document.querySelectorAll('.steward-card').length,series:document.querySelectorAll('.series-card').length,botReferences:[...document.querySelectorAll('.bot-card')].map(b=>b.querySelectorAll('.bot-series a').length),order:document.querySelector('#stewards')&&document.querySelector('#stewards').compareDocumentPosition(document.querySelector('#bots'))&4,body:document.body.innerText}))()`);
   assert.equal(info.h1,1,name);assert.ok(info.scrollWidth<=width+1,name+' horizontal overflow');
   if(name==='front-office'){assert.equal(info.stewards,3);assert.equal(info.series,8);assert.ok(info.order);assert.ok(info.botReferences.every(n=>n>0));assert.ok(info.body.includes('57'));}
   const jpeg=await call('Page.captureScreenshot',{format:'jpeg',quality:75,captureBeyondViewport:false});await writeFile(path.join(output,`${name}-${size}.jpg`),Buffer.from(jpeg.data,'base64'));
   const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(path.join(output,`${name}-${size}.png`),Buffer.from(shot.data,'base64'));
   if(name==='front-office'&&size==='desktop'){await evaluate(`document.querySelector('#publications').scrollIntoView({behavior:'instant'})`);await delay(350);const j=await call('Page.captureScreenshot',{format:'jpeg',quality:75});await writeFile(path.join(output,'front-office-library.jpg'),Buffer.from(j.data,'base64'));const s=await call('Page.captureScreenshot',{format:'png'});await writeFile(path.join(output,'front-office-library.png'),Buffer.from(s.data,'base64'));}
   report.push({name,size,title:info.title,overflow:false,links:info.links.length});console.log(`${name} ${size}: PASS`);
  }
 }
 for(const route of ['status/','roadmap/','developers/','fonts/','packages/','app/']){
  await call('Page.navigate',{url:new URL(route,technology).href});await delay(350);
  assert.equal(await evaluate('document.querySelectorAll("h1").length'),1);
  assert.ok(await evaluate('document.documentElement.scrollWidth<=innerWidth+1'),route+' overflow');
  if(route==='fonts/'){await evaluate('document.querySelector("[data-copy]").click()');await delay(150);assert.ok(await evaluate('document.querySelector("[role=status]").textContent.length>0'));}
 }
 assert.deepEqual(errors,[],'Uncaught browser exceptions');
 await writeFile(path.join(output,'browser-review.json'),JSON.stringify({report,errors,checked:new Date().toISOString()},null,2));
 console.log('Secondary routes, copy-code feedback, and browser exceptions: PASS');
}finally{socket?.close();browser.kill();await delay(300);await rm(profile,{recursive:true,force:true});}
