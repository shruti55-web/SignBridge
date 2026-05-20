function translateText() {
  const text = document.getElementById("textInput").value.trim().toUpperCase();
  const resultBox = document.getElementById("resultBox");
  const resultText = document.getElementById("resultText");
  const signImage = document.getElementById("signImage");

  if (!text) {
    resultBox.classList.add("hidden");
    return;
  }

  // Clear previous results
  resultText.innerHTML = '';
  signImage.style.display = 'none';

  // Create container for sign images
  const signsContainer = document.createElement('div');
  signsContainer.className = 'signs-sequence';
  signsContainer.style.display = 'flex';
  signsContainer.style.gap = '10px';
  signsContainer.style.flexWrap = 'wrap';
  signsContainer.style.justifyContent = 'center';

  let hasValidSigns = false;

  // Process each character
  for (let char of text) {
  if ((char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9')) {
    const signImg = document.createElement('img');

    // For numbers, assume you have images named 0.png, 1.png, ..., 9.png in js/assets/signs/
    signImg.src = `js/assets/signs/${char}.png`;
    signImg.alt = `Sign for ${char}`;
    signImg.className = 'sign-letter';
    signImg.style.width = '80px';
    signImg.style.height = '80px';
    signImg.style.objectFit = 'contain';
    signImg.style.borderRadius = '8px';
    signImg.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    signImg.style.transition = 'transform 0.3s ease';

    // Add hover effect
    signImg.onmouseover = () => signImg.style.transform = 'scale(1.1)';
    signImg.onmouseout = () => signImg.style.transform = 'scale(1)';

    signsContainer.appendChild(signImg);
    hasValidSigns = true;
  } else if (char === ' ') {
    // Add space between words
    const space = document.createElement('div');
    space.style.width = '20px';
    signsContainer.appendChild(space);
  }
}

  if (hasValidSigns) {
    resultText.appendChild(signsContainer);
    resultText.innerHTML += `<p style="margin-top: 15px; color: #666; text-align: center;">${text}</p>`;
    resultBox.classList.remove("hidden");

    // Animate signs appearing
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

    // ✅ Save translation to localStorage history
    saveTextToSignHistory(text);
     

  } else {
    resultText.innerText = "Please enter text with letters A-Z";
    resultBox.classList.remove("hidden");
  }
}

function clearText() {
  document.getElementById("textInput").value = "";
  document.getElementById("resultBox").classList.add("hidden");
}

function saveTextToSignHistory(inputText) {

  const historyItem = {
    type: "Text to Sign",
    input: inputText,
    time: new Date().toLocaleString()
  };

  let history = JSON.parse(localStorage.getItem("signbridge_history")) || [];
  history.push(historyItem);

  localStorage.setItem("signbridge_history", JSON.stringify(history));
}