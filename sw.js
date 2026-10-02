/* Mode hors ligne : à la première ouverture en ligne, la page (autonome) est mise en réserve.
   Ensuite elle est servie depuis la réserve, et rafraîchie en arrière-plan quand le réseau est là.
   VERSION est remplacée par publier.py à chaque mise en ligne, ce qui force le renouvellement. */
const VERSION = '0.6.0';
const CACHE = 'parcours-ia-' + VERSION;
const FICHIERS = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((enReserve) => {
      const reseau = fetch(e.request)
        .then((rep) => {
          if (rep && rep.ok) caches.open(CACHE).then((c) => c.put(e.request, rep.clone()));
          return rep;
        })
        .catch(() => enReserve);
      return enReserve || reseau;
    })
  );
});
