const micBtn = document.getElementById("micBtn");
const spokenText = document.getElementById("spokenText");
const resultBox = document.getElementById("resultBox");

let recognition = null;
let isListening = false;

// Initialize speech recognition
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    isListening = true;
    micBtn.textContent = "🎤 Listening...";
    micBtn.classList.add("recording");
    spokenText.textContent = "Listening...";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    spokenText.textContent = transcript;

    translateToSigns(transcript);

    // ✅ Save to history (FIXED)
    saveHistory("Voice to Sign", transcript, transcript);
  };

  recognition.onend = () => {
    isListening = false;
    micBtn.textContent = "🎤 Start Speaking";
    micBtn.classList.remove("recording");
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    spokenText.textContent = "Error: " + event.error;
    micBtn.textContent = "🎤 Start Speaking";
    micBtn.classList.remove("recording");
  };

} else {
  alert("Speech recognition not supported in this browser. Please use Chrome or Edge.");
  micBtn.disabled = true;
}

// Handle microphone button click
micBtn.addEventListener("click", () => {
  if (!recognition) return;

  if (isListening) {
    recognition.stop();
  } else {
    recognition.start();
  }
});

// Translate text to sign language
function translateToSigns(text) {
  const upperText = text.toUpperCase().trim();
  resultBox.innerHTML = '';

  if (!upperText) {
    resultBox.innerHTML = '<p>No speech detected</p>';
    return;
  }

  const signsContainer = document.createElement('div');
  signsContainer.className = 'signs-sequence';
  signsContainer.style.display = 'flex';
  signsContainer.style.flexWrap = 'wrap';
  signsContainer.style.justifyContent = 'center';
  signsContainer.style.gap = '10px';

  let hasValidSigns = false;

  for (let char of upperText) {
    if (char >= 'A' && char <= 'Z') {
      const signImg = document.createElement('img');
      signImg.src = `js/assets/signs/${char}.png`;
      signImg.alt = `Sign for ${char}`;
      signImg.className = 'sign-letter';

      signImg.style.width = '80px';
      signImg.style.height = '80px';
      signImg.style.objectFit = 'contain';
      signImg.style.borderRadius = '8px';
      signImg.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      signImg.style.transition = 'transform 0.3s ease';

      signImg.onmouseover = () => signImg.style.transform = 'scale(1.1)';
      signImg.onmouseout = () => signImg.style.transform = 'scale(1)';

      signsContainer.appendChild(signImg);
      hasValidSigns = true;

    } else if (char === ' ') {
      const space = document.createElement('div');
      space.style.width = '20px';
      signsContainer.appendChild(space);
    }
  }

  if (hasValidSigns) {
    resultBox.appendChild(signsContainer);
    resultBox.innerHTML += `
      <p style="margin-top: 15px; color: #666; text-align: center;">
        ${upperText}
      </p>
    `;

    // animation
    const signImages = signsContainer.querySelectorAll('.sign-letter');
    signImages.forEach((img, index) => {
      img.style.opacity = '0';
      img.style.transform = 'translateY(20px)';

      setTimeout(() => {
        img.style.transition = 'all 0.5s ease';
        img.style.opacity = '1';
        img.style.transform = 'translateY(0)';
      }, index * 100);
    });

  } else {
    resultBox.innerHTML = '<p>Please speak letters A-Z</p>';
  }
}