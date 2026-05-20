// history.js

const HISTORY_KEY = "signbridge_history";

// Save history from any tab
function saveHistory(type, input, output) {
    let history = JSON.parse(localStorage.getItem("signbridge_history")) || [];

    const newEntry = {
        type: type,
        input: input,
        output: output,
        time: new Date().toLocaleString()
    };

    history.push(newEntry);
    localStorage.setItem("signbridge_history", JSON.stringify(history));
}

function clearHistory() {
    localStorage.removeItem("signbridge_history");
    loadHistory(); // reload UI after clearing
}