const video = document.getElementById("camera");
const canvas = document.getElementById("landmarkCanvas");
const canvasCtx = canvas.getContext("2d");
const btn = document.getElementById("enableCamera");
const outputDiv = document.getElementById("output");

let lastDetectionTime = Date.now();
const PAUSE_THRESHOLD = 2000; // 2 seconds

let stream = null;
let hands = null;
let cameraInstance = null;

let lastPrediction = "";
let stableCount = 0;
let sentence = "";

const STABLE_THRESHOLD = 12; // same as Python

// ================= CAMERA BUTTON =================
btn.addEventListener("click", async () => {
  if (stream) {
    stopCamera();
    return;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 }
    });

    video.srcObject = stream;
    await video.play();

    btn.textContent = "Stop Camera";

    initMediapipe();

  } catch (err) {
    alert("Camera access denied.");
    console.error(err);
  }
});

// ================= STOP CAMERA =================
function stopCamera() {
  if (!stream) return;

  stream.getTracks().forEach(track => track.stop());
  stream = null;

  btn.textContent = "Enable Camera";

  if (cameraInstance) {
    cameraInstance.stop();
    cameraInstance = null;
  }
}

// ================= MEDIAPIPE INIT =================
function initMediapipe() {
  hands = new Hands({
    locateFile: (file) =>
  `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
  });

  hands.onResults(onResults);

  cameraInstance = new Camera(video, {
    onFrame: async () => {
      if (hands) {
        await hands.send({ image: video });
      }
    },
    width: 640,
    height: 480
  });

  cameraInstance.start();
}

// ================= HANDLE RESULTS =================
async function onResults(results) {

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {

    const landmarks = results.multiHandLandmarks[0];
    lastDetectionTime = Date.now();
    // Draw
    drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
      color: "#00FF00",
      lineWidth: 2
    });

    drawLandmarks(canvasCtx, landmarks, {
      color: "#FF0000",
      lineWidth: 1
    });

    // ✅ FULL 63 FEATURES
    let landmarkArray = [];

    for (let lm of landmarks) {
      landmarkArray.push(lm.x);
      landmarkArray.push(lm.y);
      landmarkArray.push(lm.z);
    }

    if (landmarkArray.length !== 63) {
      canvasCtx.restore();
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/predict_sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ landmarks: landmarkArray })
      });

      const data = await response.json();

      if (data.letter) {

        const prediction = data.letter;

        // 🔥 STABILITY LOGIC (same as Python)
        if (prediction === lastPrediction) {
          stableCount++;
        } else {
          stableCount = 0;
        }

        lastPrediction = prediction;

        if (stableCount === STABLE_THRESHOLD) {
          sentence += prediction;
          console.log("Sentence:", sentence);
        }

       outputDiv.innerHTML = `
  <div>Current Letter: <b>${prediction}</b></div>
  <div>Sentence: <b>${sentence}</b></div>`;
      }

    } catch (err) {
      console.error("Backend error:", err);
    }

  } else {
  // Keep showing last sentence even if hand disappears
  outputDiv.innerHTML = `
  <div>Current Letter: -</div>
  <div>Sentence: <b>${sentence}</b></div>`;
}

  canvasCtx.restore();
}

// ================= KEY CONTROLS =================
window.addEventListener("keydown", (e) => {

  if (e.key === "Backspace") {
    sentence = sentence.slice(0, -1);
    outputDiv.innerText = `Sentence: ${sentence}`;
  }

  if (e.key.toLowerCase() === "c") {
    sentence = "";
    outputDiv.innerText = "Sentence: ";
  }

});

// ================= CLEANUP =================
window.addEventListener("beforeunload", () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }

  if (cameraInstance) {
    cameraInstance.stop();
  }
});