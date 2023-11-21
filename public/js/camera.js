let cameraActive = false;
let stream = null;

function startCamera() {
    const video = document.getElementById('video');
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(currentStream => {
                stream = currentStream;
                video.srcObject = stream;
                cameraActive = true;
            })
            .catch(error => console.log("Error accessing the camera:", error));
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        cameraActive = false;
    }
}

function capturePhoto() {
    const canvas = document.createElement('canvas');
    const video = document.getElementById('video');
    canvas.width = 140;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
}

document.addEventListener('DOMContentLoaded', () => {
    const toggleCameraBtn = document.getElementById('toggleCamera');
    const captureBtn = document.getElementById('capture');
    const video = document.getElementById('video');

    toggleCameraBtn.addEventListener('click', () => {
        if (cameraActive) {
            stopCamera();
            video.style.display = 'none';
            captureBtn.style.display = 'none';
        } else {
            startCamera();
            video.style.display = 'block';
            captureBtn.style.display = 'block';
        }
    });

    captureBtn.addEventListener('click', () => {
        const photo = capturePhoto();
        const fileInput = document.getElementById('image1');
        fetch(photo)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], 'capture.png', { type: 'image/png' });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
            });
    });

    const form = document.getElementById('visionForm');
    form.addEventListener('submit', (event) => {
        if (!form.image1.files.length) {
            event.preventDefault();
            alert('Please capture a photo or upload an image.');
        }
    });
});
