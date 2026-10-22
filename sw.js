// Service worker de la calculadora de remesas.
// Estrategia: primero la red (así siempre se ve la última versión) y, si no hay internet, la
// copia guardada. Vale para la página, para la tasa del día y para los archivos de la app.
const CACHE = 'remesas-v1';
const ARCHIVOS = ['./', './index.html', './tasas.json', './manifest.webmanifest', './icono.svg'];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ARCHIVOS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (evento) => {
  if(evento.request.method !== 'GET') return;
  evento.respondWith(
    fetch(evento.request)
      .then((respuesta) => {
        const copia = respuesta.clone();
        caches.open(CACHE).then((cache) => cache.put(evento.request, copia)).catch(() => {});
        return respuesta;
      })
      .catch(() => caches.match(evento.request))
  );
});
