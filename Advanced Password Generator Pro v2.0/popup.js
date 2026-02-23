const result = document.getElementById("searchBox");
const strengthBar = document.getElementById("strengthBar");
const historyBox = document.getElementById("urlList");

const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "0123456789";
const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

function generatePassword() {
    const length = parseInt(document.getElementById("length").value);
    const useLetters = document.getElementById("letters").checked;
    const useNumbers = document.getElementById("numbers").checked;
    const useSymbols = document.getElementById("symbols").checked;

    let chars = "";
    if (useLetters) chars += letters;
    if (useNumbers) chars += numbers;
    if (useSymbols) chars += symbols;

    if (!chars) return;

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars[array[i] % chars.length];
    }

    result.value = password;
    updateStrength(password);
    saveToHistory(password);
}

function updateStrength(password) {
    let score = 0;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const percent = (score / 5) * 100;
    strengthBar.style.width = percent + "%";

    if (percent < 40) strengthBar.style.background = "red";
    else if (percent < 80) strengthBar.style.background = "orange";
    else strengthBar.style.background = "#00ffcc";
}

function saveToHistory(password) {
    chrome.storage.local.get(["history"], (data) => {
        let history = data.history || [];
        history.unshift(password);
        if (history.length > 20) history.pop();

        chrome.storage.local.set({ history: history });
        displayHistory(history);
    });
}

function displayHistory(history) {
    historyBox.innerHTML = "";
    history.forEach(pwd => {
        historyBox.innerHTML += `<div>${pwd}</div>`;
    });
}

document.getElementById("copyBtn").addEventListener("click", () => {
    navigator.clipboard.writeText(result.value);
});

document.getElementById("regenBtn").addEventListener("click", generatePassword);

document.getElementById("exportBtn").addEventListener("click", () => {
    chrome.storage.local.get(["history"], (data) => {
        const blob = new Blob([ (data.history || []).join("\n") ], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "password-history.txt";
        a.click();
    });
});

chrome.storage.local.get(["history"], (data) => {
    displayHistory(data.history || []);
});

document.getElementById("clearHistoryBtn").addEventListener("click", () => {
    chrome.storage.local.remove("history", () => {
        historyBox.innerHTML = "";
    });
});

generatePassword();

