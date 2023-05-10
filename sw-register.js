"use strict";
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/neuro-editor/service-worker.js').then(
        (reg) => console.log('Service worker registered', reg),
        (err) =>  console.log('Service worker not registered', err)
    );
} else {
    console.log('No service-worker on this browser');
}
