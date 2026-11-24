const CACHE='maternacare-full-v2';
const ASSETS=['./','./index.html','./style.css','./engine.js','./app.js','./manifest.json','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(url.pathname.startsWith('/api/')) return; // never cache API
  if(e.request.method!=='GET') return;
  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(res=>{const cp=res.clone();caches.open(CACHE).then(cc=>cc.put(e.request,cp));return res;}).catch(()=>caches.match('./index.html'))));
});
