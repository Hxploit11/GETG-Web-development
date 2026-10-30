import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer, parseRange } from '../scripts/serve.mjs';
import { videos, videosForLocale } from '../src/media.mjs';

const dist=fileURLToPath(new URL('../dist/',import.meta.url));
const routes=['/en/','/en/solutions/','/en/in-the-field/','/en/privacy/','/es/','/es/soluciones/','/es/en-campo/','/es/privacidad/'];
test('all localized pages resolve their local assets and links, with one H1 and matching language',async()=>{
  for(const route of routes){
    const html=await readFile(path.join(dist,route,'index.html'),'utf8');
    assert.equal((html.match(/<h1[ >]/g)||[]).length,1,route);
    assert.ok(html.includes(`<html lang="${route.split('/')[1]}">`),route);
    assert.match(html,/<link rel="alternate" hreflang="en"/);
    assert.match(html,/<link rel="alternate" hreflang="es"/);
    assert.doesNotMatch(html,/>Products</);
    for(const [,value] of html.matchAll(/(?:src|href|poster)="([^"]+)"/g)){
      if(!value.startsWith('/')||value.startsWith('//'))continue;
      const pathname=new URL(value,'https://getg.com').pathname;
      const target=path.join(dist,pathname,pathname.endsWith('/')?'index.html':'');
      assert.ok((await stat(target)).isFile(),`${route}: ${value}`);
    }
  }
});
test('both supplied videos remain visible in each language until assigned',()=>{
  assert.equal(videos.length,2);
  assert.deepEqual(videosForLocale('en').map(v=>v.id),videosForLocale('es').map(v=>v.id));
  const categorized=[{id:'English',language:'en'},{id:'Spanish',language:'es'},{id:'Shared',language:'shared'}];
  assert.deepEqual(videosForLocale('es',categorized).map(v=>v.id),['Spanish','Shared']);
});
test('video ranges support seeking, suffix requests, and invalid bounds',()=>{
  assert.deepEqual(parseRange('bytes=10-20',100),{start:10,end:20});
  assert.deepEqual(parseRange('bytes=-10',100),{start:90,end:99});
  assert.deepEqual(parseRange('bytes=50-',100),{start:50,end:99});
  for(const value of ['bytes=100-','bytes=20-10','bytes=-0','bytes=0-1,4-5','bytes=-','bad'])assert.equal(parseRange(value,100),null,value);
});
test('HTTP preview serves localized pages and seekable MP4 files',async()=>{
  const server=createServer();
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{
    const base=`http://127.0.0.1:${server.address().port}`;
    for(const route of routes){const response=await fetch(base+route);assert.equal(response.status,200,route);await response.text();}
    for(const video of videos){
      const response=await fetch(base+video.source,{headers:{Range:'bytes=0-1023'}});
      assert.equal(response.status,206);assert.equal(response.headers.get('content-type'),'video/mp4');
      assert.equal((await response.arrayBuffer()).byteLength,1024);
    }
    const badRange=await fetch(base+videos[0].source,{headers:{Range:'bytes=999999999-'}});assert.equal(badRange.status,416);
    assert.equal((await fetch(base+'/does-not-exist')).status,404);
    assert.equal((await fetch(base+'/en/',{method:'POST'})).status,405);
  }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
