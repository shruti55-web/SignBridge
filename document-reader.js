let currentText = '';
let words = [];
let currentWordIndex = 0;
let isReading = false;

const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const controls = document.getElementById('controls');
const textCard = document.getElementById('textCard');
const textDisplay = document.getElementById('textDisplay');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const resetBtn = document.getElementById('resetBtn');
resetBtn.addEventListener('click', resetPage);

uploadArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', e => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

speedSlider.addEventListener('input', () => {
    speedValue.textContent = speedSlider.value + "x";
});

document.getElementById('playBtn').onclick = playReading;
document.getElementById('pauseBtn').onclick = () => speechSynthesis.pause();
document.getElementById('stopBtn').onclick = stopReading;

async function handleFile(file) {
    const name = file.name.toLowerCase();

    if (name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = e => processText(e.target.result);
        reader.readAsText(file);
    }

    else if (name.endsWith('.pdf')) {
        const reader = new FileReader();
        reader.onload = async function() {
            const pdf = await pdfjsLib.getDocument(new Uint8Array(this.result)).promise;
            let text = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(item => item.str).join(' ') + '\n';
            }
            processText(text);
        };
        reader.readAsArrayBuffer(file);
    }

    else if (name.endsWith('.docx')) {
        const reader = new FileReader();
        reader.onload = e => {
            mammoth.extractRawText({ arrayBuffer: e.target.result })
                .then(result => processText(result.value));
        };
        reader.readAsArrayBuffer(file);
    }

    else {
        alert("Only .txt, .pdf, .docx supported.");
    }
}

function processText(text) {
    currentText = text.trim();
    words = currentText.split(/\s+/);
    currentWordIndex = 0;

    textDisplay.innerHTML = words.map((w,i) =>
        `<span id="word-${i}">${w} </span>`).join('');

    controls.style.display = "block";
    textCard.style.display = "block";

    // ✅ SAVE HISTORY HERE
    const fileName = fileInput.files[0]?.name || "Unknown File";
    saveHistory("Document Reader", fileName, currentText);
}

function playReading() {
    if (isReading) return;
    isReading = true;
    speakWord();
}

function stopReading() {
    isReading = false;
    speechSynthesis.cancel();
    currentWordIndex = 0;
    updateProgress();
}

function speakWord() {
    if (currentWordIndex >= words.length) {
        stopReading();
        return;
    }

    highlight(currentWordIndex);

    const utter = new SpeechSynthesisUtterance(words[currentWordIndex]);
    utter.rate = parseFloat(speedSlider.value);

    utter.onend = () => {
        currentWordIndex++;
        updateProgress();
        if (isReading) speakWord();
    };

    speechSynthesis.speak(utter);
}

function highlight(index) {
    document.querySelectorAll('.highlight')
        .forEach(el => el.classList.remove('highlight'));

    const el = document.getElementById('word-' + index);
    if (el) el.classList.add('highlight');
}

function updateProgress() {
    const percent = (currentWordIndex / words.length) * 100;
    document.getElementById('progressFill').style.width = percent + "%";
    document.getElementById('progressText').textContent =
        Math.round(percent) + "% complete";
}

function resetPage() {

    // Stop speech
    speechSynthesis.cancel();
    isReading = false;

    // Reset variables
    currentText = '';
    words = [];
    currentWordIndex = 0;

    // Clear file input
    fileInput.value = "";

    // Hide sections
    controls.style.display = "none";
    textCard.style.display = "none";

    // Clear text display
    textDisplay.innerHTML = "";

    // Reset progress bar
    document.getElementById('progressFill').style.width = "0%";
    document.getElementById('progressText').textContent = "0% complete";
}

function saveDocumentHistory(fileName) {

  const historyItem = {
    type: "Document Reader",
    input: fileName,
    time: new Date().toLocaleString()
  };

  let history = JSON.parse(localStorage.getItem("signbridge_history")) || [];
  history.push(historyItem);

  localStorage.setItem("signbridge_history", JSON.stringify(history));
}
