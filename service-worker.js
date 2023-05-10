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

        '/neuro-editor/images/favicon.svg',
        '/neuro-editor/images/favicon512.png',
        '/neuro-editor/images/favicon128.png',
        '/neuro-editor/images/favicon-maskable.png',
        '/neuro-editor/images/cursor.png',

        'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js',

        'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation_landscape.tflite',
        'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation_solution_simd_wasm_bin.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.binarypb',
        'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation_solution_simd_wasm_bin.wasm',

        'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh_solution_packed_assets_loader.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh_solution_simd_wasm_bin.js',
        'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.binarypb',
        'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh_solution_packed_assets.data',
        'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh_solution_simd_wasm_bin.wasm',
    ])))
);

self.addEventListener('fetch', (event) => {
    event.respondWith(fromCache(event.request));
    event.waitUntil(update(event.request));
});

function fromCache(request) {
    return caches.open(CACHE).then((cache) =>
        cache.match(request).then((matching) =>
            matching || Promise.reject('no-match')
        ));
}

function update(request) {
   return caches.open(CACHE).then((cache) =>
       fetch(request).then((response) =>
           cache.put(request, response)
       )
   );

}
