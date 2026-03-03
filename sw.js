const CACHE_NAME = "admin-guru-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./setting.html",
  "./cp.html",
  "./atp.html",
  "./modul-ajar.html",
  "./daftar-nilai.html",
  "./kalender.html",
  "./absensi.html",
  "./buku-tamu.html",
  "./analisis.html",
  "./prota.html",
  "./promes.html",
  "./style.css",
  "./index.js",
  "./install.js",
  "./auth.js"
];

// Install service worker
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate service worker
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// Fetch handler → offline fallback
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});