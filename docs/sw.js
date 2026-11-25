/* One-time self-destruct worker.
   Older builds of this app cached index.html/app.js forever (cache-first),
   which served a stale, broken interface. This new worker clears every cache,
   unregisters itself, and reloads open tabs so the browser always gets fresh code. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    } catch (e) { }
    try {
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(c => { try { c.navigate(c.url); } catch (e) { } });
    } catch (e) { }
    try { await self.registration.unregister(); } catch (e) { }
  })());
});
self.addEventListener('fetch', () => { });
