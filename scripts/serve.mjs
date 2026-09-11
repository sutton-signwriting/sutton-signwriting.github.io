import http from 'node:http';
import {readFile, stat, realpath} from 'node:fs/promises';
import path from 'node:path';
const root = await realpath(process.argv[2] || 'dist/technology');
const port = Number(process.env.PORT || 8080);
const host = process.env.BIND_IP || '127.0.0.1';
const links = JSON.parse(process.env.PREVIEW_LINKS || '{}');
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.pdf':'application/pdf','.md':'text/plain; charset=utf-8','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
const techRoutes = new Set(['/', '/status/', '/roadmap/', '/developers/', '/packages/', '/tools/', '/fonts/', '/characters/', '/spec/', '/legacy/', '/office/', '/app/', '/machine-learning/']);
http.createServer(async(req,res)=>{
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
  if (!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end('Read-only preview');}
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://preview.invalid').pathname);
    if(pathname==='/health'){res.writeHead(200,{'Content-Type':'text/plain'});return res.end(req.method==='HEAD'?undefined:'ok\n');}
    let file=path.resolve(root,'.'+pathname);
    if(file!==root&&!file.startsWith(root+path.sep))throw new Error('Traversal');
    if((await stat(file)).isDirectory())file=path.join(file,'index.html');
    file=await realpath(file);if(!file.startsWith(root+path.sep))throw new Error('Symlink');
    let body=await readFile(file);
    if(file.endsWith('.html')&&Object.keys(links).length){
      let html=body.toString();
      html=html.replace(/href="(https:\/\/[^"\s]+)"/g,(match,href)=>{
        const u=new URL(href.replaceAll('&amp;','&')); let target;
        if(u.hostname==='office.signwriting.org')target=links['Front Office'];
        if(['www.sutton-signwriting.io','sutton-signwriting.io'].includes(u.hostname)&&techRoutes.has(u.pathname))target=links['Technology'];
        if(u.hostname==='office.sutton-signwriting.io')target=links['Back Office'];
        return target?`href="${escape(target.replace(/\/$/,'')+u.pathname+u.search+u.hash)}"`:match;
      });
      const banner=`<div class="review-banner" lang="en" dir="ltr"><strong>Development review</strong> · ${Object.entries(links).map(([label,url])=>`<a href="${escape(url)}">${escape(label)}</a>`).join(' · ')} · Not published</div>`;
      body=Buffer.from(html.replace(/(<body[^>]*>)/,'$1'+banner));
    }
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
}).listen(port,host,()=>console.log(`Read-only preview listening on ${host}:${port}`));
