const CACHE_NAME = 'carpeta-virtual-v4';

const ARCHIVOS_OFFLINE = [
  './',
  './index.html',
  './manifest.json',
  './fondo-carnet.png',
  './cedula.jpg',
  './pasaporte.jpg',
  './vouchers.pdf',
  './contrarecibos.pdf',
  './contratos.pdf',
  './nda.pdf',
  './cis.pdf',
  './w8.pdf',
  './ddr.pdf'
];

// Al instalar, toma el control de inmediato
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        ARCHIVOS_OFFLINE.map(url => {
          return cache.add(url).catch(err => console.log('Omitido:', url));
        })
      );
    })
  );
});

// Al activar, borra cualquier memoria vieja
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// NETWORK FIRST:
// Busca primero lo nuevo en internet. Si hay internet, lo muestra y actualiza la copia.
// Si no hay señal o está en modo avión, responde desde la memoria offline.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200 && event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
