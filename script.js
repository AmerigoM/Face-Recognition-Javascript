const video = document.getElementById('video');

// execute calls in parallel: load the model
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'), // detect a face
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'), // detect face landmarks
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'), // detect the face box
    faceapi.nets.faceExpressionNet.loadFromUri('/models') // detect emotions
]).then(startVideo);

function startVideo() {
    // get the webcam
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
}

// add an event listener for when the video starts playing
video.addEventListener('play', () => {
    // inject a canvas in the html where we draw the faceapi results
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    
    faceapi.matchDimensions(canvas, displaySize);
    
    setInterval(async () => {
        // face detection
        const detections = await faceapi.detectAllFaces(video, new  faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        // clear canvas
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        
        // draw result on canvas
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 100);
})