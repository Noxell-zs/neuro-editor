"use strict";

let markColor = '#00ff55';
let markOpacity = '80';
let markRGBA = '#00ff5580';
let markImage = null;
let markMode = 'source-out';

let noseImage = null;
let noseWidth = 0;
let noseHeight = 0;

let eyeImage = null;
let eyeWidth = 0;
let eyeHeight = 0;

document.getElementById('mark_color').addEventListener('input', (event) => {
    markColor = event.target.value;
    markRGBA = `${markColor}${markOpacity}`;
});
document.getElementById('mark_opacity').addEventListener('input', (event) => {
    markOpacity = (+event.target.value).toString(16);
    if (markOpacity.length < 2) {
        markOpacity = `0${markOpacity}`;
    }
    markRGBA = `${markColor}${markOpacity}`;
});


const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
let canvasCtx = canvasElement.getContext('2d');

function onResultsSeg(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    canvasCtx.filter = 'blur(2px)';
    canvasCtx.drawImage(results.segmentationMask, 0, 0,
        canvasElement.width, canvasElement.height);

    canvasCtx.globalCompositeOperation = markMode;

    canvasCtx.fillStyle = markRGBA;
    if (markImage) {
        canvasCtx.drawImage(markImage, 0, 0, canvasElement.width, canvasElement.height);
    } else {
        canvasCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    }

    canvasCtx.globalCompositeOperation = 'destination-atop';
    canvasCtx.filter = 'blur(0px)';
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);

    canvasCtx.restore();
}

function onResultsMesh(results) {
    canvasCtx.save();
    if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
            if (noseImage) {
                let x = landmarks[4].x * canvasElement.width - noseWidth / 2;
                let y = landmarks[4].y * canvasElement.height - noseHeight / 2;
                canvasCtx.drawImage(noseImage, x, y, noseWidth, noseHeight);
            }

            if (eyeImage) {
                const rightEyeLeft = landmarks[33].x;
                const rightEyeRight = landmarks[133].x;
                const rightEyeWidth = (rightEyeRight - rightEyeLeft) * canvasElement.width * 1.5;
                const rightEyeX = landmarks[159].x * canvasElement.width - rightEyeWidth / 2;
                const rightEyeTop = landmarks[159].y;
                const rightEyeBottom = landmarks[145].y;
                const rightEyeY =
                    (rightEyeTop + (rightEyeBottom - rightEyeTop)) * canvasElement.height -
                    rightEyeWidth / 2;
                canvasCtx.drawImage(
                    eyeImage,
                    rightEyeX,
                    rightEyeY,
                    rightEyeWidth,
                    rightEyeWidth
                );

                const leftEyeLeft = landmarks[362].x;
                const leftEyeRight = landmarks[263].x;
                const leftEyeWidth = (leftEyeRight - leftEyeLeft) * canvasElement.width * 1.5;
                const leftEyeX = landmarks[386].x * canvasElement.width - leftEyeWidth / 2;
                const leftEyeTop = landmarks[386].y;
                const leftEyeBottom = landmarks[374].y;
                const leftEyeY =
                    (leftEyeTop + (leftEyeBottom - leftEyeTop)) * canvasElement.height - leftEyeWidth / 2;
                canvasCtx.drawImage(eyeImage, leftEyeX, leftEyeY, leftEyeWidth, leftEyeWidth);
            }
        }
    }
    canvasCtx.restore();
}

const selfieSegmentation = new SelfieSegmentation({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
}});
selfieSegmentation.setOptions({
    modelSelection: 1,
});
selfieSegmentation.onResults(onResultsSeg);

const faceMesh = new FaceMesh({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});
faceMesh.setOptions({
    maxNumFaces: 2,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
faceMesh.onResults(onResultsMesh);

function getCamera(width, height) {
    return new Camera(videoElement, {
        onFrame: async () => {
            await selfieSegmentation.send({image: videoElement});
            await faceMesh.send({image: videoElement});
        },
        width: width,
        height: height
    });
}

let camera = getCamera(800, 800);
camera.start();

const downloadImage = document.getElementById('download_image');

canvasElement.addEventListener('click', () => {
    downloadImage.href = canvasElement.toDataURL();
    downloadImage.download = `${new Date().toISOString()}.png`;
    downloadImage.click();
});

document.getElementById('toggle').addEventListener('click', () => {
    markMode = (markMode === 'source-out') ? 'source-in' : 'source-out';
});

const backImageField = document.getElementById('back_image');
backImageField.addEventListener('change', function() {
    const img = new Image();
    img.src = URL.createObjectURL(this.files[0]);
    img.onload = function() { markImage = this; };
    img.onerror = function(){ console.error('error', this); };
});
document.getElementById('reset_back_image').addEventListener(
    'click', () => {
        markImage = null;
        backImageField.value = null;
    });

const noseImageField = document.getElementById('nose_image');
noseImageField.addEventListener('change', function() {
    const img = new Image();
    img.src = URL.createObjectURL(this.files[0]);
    img.onload = function() {
        noseImage = this;
        noseWidth = img.width;
        noseHeight = img.height;
    };
    img.onerror = function(){ console.error('error', this); };
});
document.getElementById('reset_nose_image').addEventListener(
    'click', () => {
        noseImage = null;
        noseImageField.value = null;
    });

const eyeImageField = document.getElementById('eye_image');
eyeImageField.addEventListener('change', function() {
    const img = new Image();
    img.src = URL.createObjectURL(this.files[0]);
    img.onload = function() {
        eyeImage = this;
        eyeWidth = img.width;
        eyeHeight = img.height;
    };
    img.onerror = function(){ console.error('error', this); };
});
document.getElementById('reset_eye_image').addEventListener(
    'click', () => {
        eyeImage = null;
        eyeImageField.value = null;
    });

const videoWidthField = document.getElementById('video_width_field');
const videoHeightField = document.getElementById('video_height_field');

document.getElementById('set_res').addEventListener(
    'click', () => {
        const width = +videoWidthField.value, height = +videoHeightField.value;
        if (videoHeightField.validity.valid && videoWidthField.validity.valid) {
            camera?.stop();
            canvasElement.width = width;
            canvasElement.height = height;
            canvasCtx = canvasElement.getContext('2d');
            camera = getCamera(width, height);
            camera.start();
        }
    });
