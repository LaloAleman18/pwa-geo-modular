const base = self.registration.scope;
const prefijoCache = 'mi-zona:' + base + ':';
const nombreCache = prefijoCache + 'v1';
const activos = [
  './index.html', './styles.css', './geo-helper.js', './app.js',
  './manifest.json', './icons/icon-192.png', './icons/icon-512.png'
];
const rutas = new Set(activos.map((ruta) => new URL(ruta, base).href));

self.addEventListener('install', (evento) => {
  evento.waitUntil(caches.open(nombreCache).then((cache) => cache.addAll(activos)));
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(caches.keys()
    .then((nombres) => Promise.all(nombres
      .filter((nombre) => nombre.startsWith(prefijoCache) && nombre !== nombreCache)
      .map((nombre) => caches.delete(nombre))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (evento) => {
  const { request } = evento;
  if (request.method !== 'GET') return;
  const ruta = request.mode === 'navigate' && request.url === base
    ? new URL('./index.html', base).href
    : request.url;
  if (!rutas.has(ruta)) return;

  evento.respondWith(caches.open(nombreCache)
    .then((cache) => cache.match(ruta))
    .catch(() => undefined)
    .then((respuesta) => respuesta || fetch(request)));
});
