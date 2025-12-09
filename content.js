/*************************************************************
 *  FULL SCREEN READER CONTENT SCRIPT
 *  Includes:
 *   - Browse/Typing mode toggle (Ctrl + Space)
 *   - Highlighting
 *   - Paragraph / Heading / Link / Button Navigation
 *   - Sentence Navigation (ArrowUp / ArrowDown)
 *   - Landmark Navigation (D)
 *   - Skip to main content (M)
 *   - Image Navigation with Auto-Description (G)
 *************************************************************/

// ============================================================
// GLOBAL SETTINGS
// ============================================================
let SETTINGS = {
    enabled: true,
    rate: 1,
    pitch: 1,
    volume: 1
};

// Load saved settings from popup
chrome.storage?.sync?.get(["enabled", "rate", "pitch", "volume"], (res) => {
    SETTINGS = { ...SETTINGS, ...res };
});

// ============================================================
// BROWSE MODE vs TYPING MODE
// ============================================================
let BROWSE_MODE = true; // true = screen reader active

document.addEventListener("keydown", (e) => {
    // Toggle with Ctrl + Space
    if (e.ctrlKey && e.code === "Space") {
        BROWSE_MODE = !BROWSE_MODE;
        speak(BROWSE_MODE ? "Browse mode" : "Typing mode");
        console.log("MODE:", BROWSE_MODE ? "BROWSE" : "TYPING");
        return;
    }
}, true);


// ============================================================
// HIGHLIGHT BOX
// ============================================================
function highlight(el) {
    document.querySelectorAll(".sr-highlight").forEach(h => h.remove());

    const rect = el.getBoundingClientRect();
    const div = document.createElement("div");

    div.className = "sr-highlight";
    Object.assign(div.style, {
        position: "fixed",
        top: rect.top + "px",
        left: rect.left + "px",
        width: rect.width + "px",
        height: rect.height + "px",
        border: "3px solid yellow",
        background: "rgba(255, 255, 0, 0.15)",
        zIndex: 999999999,
        pointerEvents: "none"
    });

    document.body.appendChild(div);
}


// ============================================================
// SPEECH
// ============================================================
let speechTimer = null;

function speak(text) {
    if (!SETTINGS.enabled) return;
    if (!text) return;

    speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = Number(SETTINGS.rate);
    utter.pitch = Number(SETTINGS.pitch);
    utter.volume = Number(SETTINGS.volume);

    speechSynthesis.speak(utter);
}

function speakDebounced(text, delay = 200) {
    clearTimeout(speechTimer);
    speechTimer = setTimeout(() => speak(text), delay);
}


// ============================================================
// LABEL EXTRACTOR
// ============================================================
function extractLabel(el) {
    let text =
        el.getAttribute("aria-label") ||
        el.alt ||
        el.innerText ||
        el.textContent ||
        el.getAttribute("title") ||
        el.tagName.toLowerCase();

    if (!text) return "";
    return text.replace(/\s+/g, " ").trim();
}


// ============================================================
// VALID ELEMENT CHECK
// ============================================================
function isValidElement(el) {
    if (!el) return false;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;

    const style = getComputedStyle(el);
    if (style.position === "fixed" || style.position === "sticky") return false;

    const label = extractLabel(el);
    if (!label || label.length < 3) return false;

    return true;
}


// ============================================================
// GENERIC NAVIGATION HELPER
// ============================================================
function getNext(selector, currentEl) {
    const elements = Array.from(document.querySelectorAll(selector)).filter(isValidElement);
    if (elements.length === 0) return null;

    let idx = elements.indexOf(currentEl);
    return idx === -1 ? elements[0] : elements[idx + 1] || elements[0];
}

let lastElement = null;


// ============================================================
// CLICK SELECTION (important)
// ============================================================
document.addEventListener("click", (e) => {
    if (!BROWSE_MODE) return;

    const el = e.target.closest("p, h1, h2, h3, h4, h5, h6, a, button");
    if (!el || !isValidElement(el)) return;

    lastElement = el;
    highlight(el);
    speakDebounced(extractLabel(el));
}, true);


// ============================================================
// SENTENCE MODE (ARROW DOWN / ARROW UP)
// ============================================================
let currentSentences = [];
let sentenceIndex = 0;

function splitIntoSentences(text) {
    if (!text) return [];

    text = text.replace(/\s+/g, " ").trim();

    let sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g);
    if (sentences && sentences.length > 1) return sentences.map(s => s.trim());

    // fallback for long comma paragraphs
    return text.split(/,(?![^()]*\))/g).map(p => p.trim() + ".");
}

document.addEventListener("keydown", (e) => {
    if (!BROWSE_MODE) return;

    if (e.key === "ArrowDown") {
        e.preventDefault();

        if (!lastElement) return;

        const fullText = extractLabel(lastElement);
        currentSentences = splitIntoSentences(fullText);

        if (sentenceIndex >= currentSentences.length) return;

        speakDebounced(currentSentences[sentenceIndex]);
        sentenceIndex++;
    }

    if (e.key === "ArrowUp") {
        e.preventDefault();

        if (!lastElement) return;

        if (sentenceIndex > 1) sentenceIndex -= 2;
        else sentenceIndex = 0;

        const fullText = extractLabel(lastElement);
        currentSentences = splitIntoSentences(fullText);

        speakDebounced(currentSentences[sentenceIndex]);
        sentenceIndex++;
    }
}, true);


// ============================================================
// PARAGRAPH NAVIGATION (P)
// ============================================================
document.addEventListener("keydown", (e) => {
    if (!BROWSE_MODE) return;

    if (e.key.toLowerCase() === "p") {
        e.preventDefault();

        const next = getNext("p", lastElement || document.body);
        if (!next) return;

        lastElement = next;
        sentenceIndex = 0;

        highlight(next);
        speakDebounced(extractLabel(next));
        next.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}, true);


// ============================================================
// HEADING NAVIGATION (H)
// ============================================================
document.addEventListener("keydown", (e) => {
    if (!BROWSE_MODE) return;

    if (e.key.toLowerCase() === "h") {
        e.preventDefault();

        const next = getNext("h1,h2,h3,h4,h5,h6", lastElement || document.body);
        if (!next) return;

        lastElement = next;
        sentenceIndex = 0;

        highlight(next);
        speakDebounced(extractLabel(next));
        next.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}, true);


// ============================================================
// LINK NAVIGATION (L)
// ============================================================
document.addEventListener("keydown", (e) => {
    if (!BROWSE_MODE) return;

    if (e.key.toLowerCase() === "l") {
        e.preventDefault();

        const next = getNext("a[href]", lastElement || document.body);
        if (!next) return;

        lastElement = next;
        sentenceIndex = 0;

        highlight(next);
        speakDebounced(extractLabel(next));
        next.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}, true);


// ============================================================
// BUTTON NAVIGATION (B)
// ============================================================
document.addEventListener("keydown", (e) => {
    if (!BROWSE_MODE) return;

    if (e.key.toLowerCase() === "b") {
        e.preventDefault();

        const next = getNext("button,[role='button'],input[type='button'],input[type='submit']", lastElement || document.body);
        if (!next) return;

        lastElement = next;
        sentenceIndex = 0;

        highlight(next);
        speakDebounced(extractLabel(next));
        next.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}, true);


// ============================================================
// LANDMARK NAVIGATION (D)
// ============================================================
document.addEventListener("keydown", (e) => {
    if (!BROWSE_MODE) return;

    if (e.key.toLowerCase() === "d") {
        e.preventDefault();

        const next = getNext("main, nav, footer, aside, section", lastElement || document.body);
        if (!next) {
            speak("No more landmarks");
            return;
        }

        lastElement = next;
        highlight(next);
        speakDebounced(extractLabel(next));
        next.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}, true);


// ============================================================
// SKIP TO MAIN CONTENT (M)
// ============================================================
document.addEventListener("keydown", (e) => {
    if (!BROWSE_MODE) return;

    if (e.key.toLowerCase() === "m") {
        e.preventDefault();

        const main = document.querySelector("main") || document.querySelector("[role='main']");
        if (!main) {
            speak("Main content not found");
            return;
        }

        lastElement = main;
        highlight(main);
        speak("Main content");
        main.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}, true);


// ============================================================
// IMAGE NAVIGATION (G) WITH AUTO-DESCRIPTION
// ============================================================
async function generateAltText(imgEl) {
    const src = imgEl.getAttribute("src") || imgEl.src || "";
    const filename = src.split("/").pop() || "";
    if (filename) return `Image: ${filename.replace(/[-_]/g, " ").split(".")[0]}`;
    return "Image with no description";
}

document.addEventListener("keydown", async (e) => {
    if (!BROWSE_MODE) return;

    if (e.key.toLowerCase() === "g") {
        e.preventDefault();

        const next = getNext("img", lastElement || document.body);
        if (!next) {
            speak("No images found");
            return;
        }

        let alt = next.getAttribute("alt");
        if (!alt || alt.trim().length < 3) {
            speak("Generating image description");
            alt = await generateAltText(next);
        }

        lastElement = next;
        highlight(next);
        speakDebounced(alt);
        next.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}, true);
