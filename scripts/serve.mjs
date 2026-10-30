import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const directory = path.resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const port = Number(process.env.PORT || 4173);
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml', '.mp4':'video/mp4', '.vtt':'text/vtt', '.xml':'application/xml', '.txt':'text/plain' };
export function parseRange(range, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(range || '');
  if(!match || (!match[1]&&!match[2])) return null;
  const start = match[1] ? Number(match[1]) : Math.max(0,size-Number(match[2]));
  const end = match[1] ? (match[2] ? Math.min(Number(match[2]),size-1) : size-1) : size-1;
  return Number.isSafeInteger(start)&&Number.isSafeInteger(end)&&start>=0&&start<=end&&start<size ? {start,end} : null;
}
export function createServer() {
  return http.createServer(async (req,res)=>{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
    let requested;
    try { requested=decodeURIComponent(new URL(req.url,'http://localhost').pathname); } catch {res.writeHead(400);res.end();return;}
    let file=path.resolve(directory,'.'+requested);
    if(file!==directory&&!file.startsWith(directory+path.sep)){res.writeHead(403);res.end();return;}
    try {
      let info=await stat(file);
      if(info.isDirectory()) {file=path.join(file,'index.html');info=await stat(file);}
      const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Cache-Control':'no-cache'};
      if(req.headers.range) {
        const range=parseRange(req.headers.range,info.size);
        if(!range){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}
        res.writeHead(206,{...headers,'Content-Range':`bytes ${range.start}-${range.end}/${info.size}`,'Content-Length':range.end-range.start+1});
        if(req.method==='HEAD')res.end();else createReadStream(file,range).pipe(res);
      } else {
        res.writeHead(200,{...headers,'Content-Length':info.size});
        if(req.method==='HEAD')res.end();else createReadStream(file).pipe(res);
      }
    } catch {
      res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});
      if(req.method==='HEAD')res.end();else res.end(await readFile(path.join(directory,'404.html'),'utf8').catch(()=>'Not found'));
    }
  });
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  createServer().listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}/en/`));
}
