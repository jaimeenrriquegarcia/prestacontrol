// rebuild pages: push v2
const CACHE = 'prestacontrol-v2';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then((r) => {
      const copia = r.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copia)).catch(() => {});
      return r;
    }).catch(() => caches.match(e.request))
  );
});
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { mensaje: e.data ? e.data.text() : '' }; }
  const titulo = d.titulo || 'PrestaControl';
  e.waitUntil(self.registration.showNotification(titulo, {
    body: d.mensaje || '',
    icon: './icon.svg',
    badge: './icon.svg',
    tag: d.tag || 'prestacontrol',
    renotify: true,
    data: { url: d.url || './' }
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil((async () => {
    const abiertas = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of abiertas) {
      if (c.url.includes('/prestacontrol/')) {
        try { await c.navigate(url); } catch {}
        return c.focus();
      }
    }
    return clients.openWindow(url);
  })());
});
