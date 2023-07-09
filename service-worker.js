"use strict";
const CACHE = 'cache-v1';

self.addEventListener('install', (event) =>
    event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([
        '/neuro-editor/index.html',
        '/neuro-editor/style.css',
        '/neuro-editor/script.js',
        '/neuro-editor/service-worker.js',
        '/neuro-editor/sw-register.js',
        '/neuro-editor/manifest.webmanifest',
    ])))
);

self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('yandex')) {
        return event.respondWith(fetch(event.request).catch(e => undefined));
    }

    event.respondWith(fetch(event.request).then((response) => {
        if (response.ok) {
            event.waitUntil(caches.open(CACHE).then((cache) =>
                cache.put(event.request, response)
            ));
            return response.clone();
        } else {
            return fromCache(event.request);
        }
    }).catch(e => fromCache(event.request) ));

});

function fromCache(request) {
    return caches.open(CACHE).then((cache) => cache.match(request));
}
