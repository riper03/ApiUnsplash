const CACHE_NAME = "ImagenesBuscar-v2";
const STATIC_ASSETS = [
    "/",
    "/index.html",
    "/style.css",
    "/script.js",
    "/app.js",
    "/manifest.json",
    "/sw.js",
    "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

self.addEventListener("fetch", (event) => {
    const requestUrl = new URL(event.request.url);

    // Estrategia CACHE FIRST para archivos estáticos
    if (STATIC_ASSETS.includes(requestUrl.pathname)) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                return cachedResponse || fetch(event.request);
            })
        );
        return;
    }

    // Estrategia NETWORK FIRST para imágenes (con respaldo en caché)
    if (event.request.destination === "image") {
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone()); // Guardar imagen en caché
                        return networkResponse;
                    });
                })
                .catch(() => caches.match(event.request)) // Si falla la red, usar la caché
        );
        return;
    }
    event.respondWith(
        fetch(event.request)
            .catch(() => caches.match(event.request)) // Si falla la red, usar caché
    );
});

// Eliminar cachés antiguas
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
});
