const CACHE_NAME = 'expenses-v2'
const urlsToCache = [
  '/gastos/',
  '/gastos/index.html',
  '/gastos/manifest.json',
  '/gastos/styles.css',
  '/gastos/firebase.js',
  '/gastos/script.js',
  '/gastos/images/up.png',
  '/gastos/images/down.png',
  '/gastos/images/fallback.png',
  '/gastos/images/money192.png',
  '/gastos/images/money512.png',
]

// Instala e adiciona arquivos ao cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

// Intercepta as requisições
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    }),
  )
})

// Limpa caches antigos
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName)
          }
        }),
      ),
    ),
  )
})
