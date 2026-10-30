import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer, parseRange } from '../scripts/serve.mjs';
import { videos, videosForLocale, animatedVideos, generatedVideos, solutionVideos, fieldImages } from '../src/media.mjs';

const dist=fileURLToPath(new URL('../dist/',import.meta.url));
const routes=['/en/','/en/who-we-are/','/en/solutions/','/en/in-the-field/','/en/privacy/','/es/','/es/quienes-somos/','/es/soluciones/','/es/en-campo/','/es/privacidad/'];
test('all localized pages resolve their local assets and links, with one H1 and matching language',async()=>{
  for(const route of routes){
    const html=await readFile(path.join(dist,route,'index.html'),'utf8');
    assert.equal((html.match(/<h1[ >]/g)||[]).length,1,route);
    assert.ok(html.includes(`<html lang="${route.split('/')[1]}">`),route);
    assert.match(html,/<link rel="alternate" hreflang="en"/);
    assert.match(html,/<link rel="alternate" hreflang="es"/);
    assert.doesNotMatch(html,/>Products</);
    assert.doesNotMatch(html,/Field media supplied by GETG|Material de campo compartido por GETG|real-tanker\.jpg|field-demonstration-01\.mp4|<title>undefined/);
    for(const [,value] of html.matchAll(/(?:src|href|poster)="([^"]+)"/g)){
      if(!value.startsWith('/')||value.startsWith('//'))continue;
      const pathname=new URL(value,'https://getg.com').pathname;
      const target=path.join(dist,pathname,pathname.endsWith('/')?'index.html':'');
      assert.ok((await stat(target)).isFile(),`${route}: ${value}`);
    }
  }
});
test('the four-video lineup uses the new field overview and keeps eight gallery images',async()=>{
  assert.deepEqual(solutionVideos.slice(0,2),videos);
  assert.equal(solutionVideos.length,4);
  assert.equal(animatedVideos.length,2);
  assert.equal(generatedVideos.length,3);
  assert.equal(videos[0].source,'/assets/video/field-overview.mp4');
  assert.equal(videos[1].source,'/assets/video/field-demonstration-02.mp4');
  await assert.rejects(stat(path.join(dist,'assets/video/field-demonstration-01.mp4')),{code:'ENOENT'});
  assert.equal(fieldImages.length,8);
  assert.equal(new Set(fieldImages.map(image=>image.source)).size,8);
  for(const video of generatedVideos){
    assert.ok((await stat(path.join(dist,video.source))).size>10000);
    for(const track of video.captions){
      const vtt=await readFile(path.join(dist,track.src),'utf8');
      assert.match(vtt,/^WEBVTT/);assert.match(vtt,/00:00:06.000/);
    }
  }
  for(const route of ['/en/solutions/','/es/soluciones/']){
    const html=await readFile(path.join(dist,route,'index.html'),'utf8');
    assert.equal((html.match(/data-carousel data-interval="6000"/g)||[]).length,5);
    assert.equal((html.match(/data-carousel-preview/g)||[]).length,4);
  }
  for(const route of ['/en/in-the-field/','/es/en-campo/']){
    const html=await readFile(path.join(dist,route,'index.html'),'utf8');
    assert.equal((html.match(/data-slide role="group"/g)||[]).length,8);
    for(const image of fieldImages)assert.ok(html.includes(image.source));
  }
});
test('the shared animation and unassigned supplied video are available in both languages',()=>{
  assert.equal(videos.length,2);
  assert.deepEqual(videosForLocale('en').map(v=>v.id),videosForLocale('es').map(v=>v.id));
  const categorized=[{id:'English',language:'en'},{id:'Spanish',language:'es'},{id:'Shared',language:'shared'}];
  assert.deepEqual(videosForLocale('es',categorized).map(v=>v.id),['Spanish','Shared']);
});
test('public contact is separate from the quote-request recipient in both languages',async()=>{
  for(const route of routes){
    const html=await readFile(path.join(dist,route,'index.html'),'utf8');
    const config=JSON.parse(html.match(/<script id="site-config" type="application\/json">(.*?)<\/script>/s)[1]);
    assert.equal(config.contactEmail,'team@getg.com');
    assert.equal(config.requestEmail,'tom@sterlingbrandcleaners.com');
    const visible=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
    assert.doesNotMatch(visible,/tom@sterlingbrandcleaners\.com/);
    if(html.includes('class="quote-form"'))assert.match(visible,/href="mailto:team@getg\.com">team@getg\.com/);
  }
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
    for(const video of solutionVideos){
      const response=await fetch(base+video.source,{headers:{Range:'bytes=0-1023'}});
      assert.equal(response.status,206);assert.equal(response.headers.get('content-type'),'video/mp4');
      assert.equal((await response.arrayBuffer()).byteLength,1024);
    }
    const badRange=await fetch(base+videos[0].source,{headers:{Range:'bytes=999999999-'}});assert.equal(badRange.status,416);
    assert.equal((await fetch(base+'/does-not-exist')).status,404);
    assert.equal((await fetch(base+'/en/',{method:'POST'})).status,405);
  }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
