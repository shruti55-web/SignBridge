async function checkUserAndLoadHistory() {
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    loadHistory();
}

function loadHistory() {

    const historyList = document.getElementById("historyList");
    if (!historyList) return;

    historyList.innerHTML = "";

    let history = JSON.parse(localStorage.getItem("signbridge_history")) || [];

    console.log("Loaded history:", history); // 🔥 DEBUG LINE

    if (history.length === 0) {
        historyList.innerHTML = "<p>No history available.</p>";
        return;
    }

    history.slice().reverse().forEach(item => {

        const div = document.createElement("div");
        div.classList.add("history-item");

        div.innerHTML = `
            <h4>${item.type}</h4>
            <p>${item.input || "-"}</p>
            <small>${item.time || ""}</small>
            <hr>
        `;

        historyList.appendChild(div);
    });
}

checkUserAndLoadHistory();