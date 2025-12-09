document.getElementById("toggleReader").addEventListener("change", async (e) => {
    chrome.storage.sync.set({ enabled: e.target.checked });
});

document.getElementById("rate").addEventListener("input", e => {
    chrome.storage.sync.set({ rate: e.target.value });
});

document.getElementById("pitch").addEventListener("input", e => {
    chrome.storage.sync.set({ pitch: e.target.value });
});

document.getElementById("volume").addEventListener("input", e => {
    chrome.storage.sync.set({ volume: e.target.value });
});
