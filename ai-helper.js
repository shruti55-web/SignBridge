const chatMessages = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message " + sender + "-message";

    messageDiv.innerHTML = `
        <div class="message-avatar">${sender === "ai" ? "🤖" : "👤"}</div>
        <div class="message-content">
            <p>${text}</p>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, "user");
    userInput.value = "";

    try {
        const response = await fetch("http://127.0.0.1:5000/ai-chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            addMessage("Server error: " + response.status + ". Check backend?", "ai");
            return;
        }
        const data = await response.json();
        addMessage(data.reply, "ai");

    } catch (error) {
        console.error("Fetch error:", error);
        addMessage("🤖 Network error. Backend at 127.0.0.1:5000? Refresh page.", "ai");
    }
}

if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
}

if (userInput) {
    userInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") {
            sendMessage();
        }
    });
}
