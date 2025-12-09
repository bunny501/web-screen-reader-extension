# Web Screen Reader Extension  
A lightweight, keyboard-driven **screen reader for websites**, inspired by NVDA & VoiceOver.  
It works entirely inside your browser and uses keyboard shortcuts, speech synthesis,  
and DOM navigation to make the web more accessible.

---

## ⭐ Features

### 🎧 Speech Output  
- Reads content using the built-in Web Speech API  
- Supports adjustable **rate, pitch, and volume**  
- Highlights the currently spoken element  

### 🧭 Powerful Keyboard Navigation  
| Key | Action |
|-----|--------|
| **Ctrl + Space** | Toggle **Browse Mode / Typing Mode** |
| **P** | Next paragraph |
| **H** | Next heading |
| **L** | Next link |
| **B** | Next button |
| **D** | Next landmark (`main`, `nav`, `section`, `footer`, etc.) |
| **M** | Jump to main content |
| **G** | Next image (with auto-generated description) |
| **Arrow Down** | Read next sentence |
| **Arrow Up** | Read previous sentence |
| **Space** | Pause / Resume speech |

### 🖼️ Image Description  
If an image has no alt text, the extension automatically generates a fallback description.

### 📌 Browse Mode vs Typing Mode  
Just like NVDA:
- **Browse Mode** → keyboard shortcuts control the screen reader  
- **Typing Mode** → shortcuts disabled; you can type normally  

Toggle anytime with:
Ctrl+space


---

## 🚀 Installation (Developer Mode)

1. Download or clone the repository:
 git clone https://github.com/bunny501/web-screen-reader-extension

2. Open Chrome and go to:chrome://extensions
   
4. Enable **Developer Mode** (top right)

5. Click **Load unpacked**

6. Select the `ScreenReaderExtension` folder

7. The extension icon will now appear in your toolbar

---


---

## 📌 How It Works

The extension injects `content.js` into every webpage.  
It listens for keyboard events and navigates the DOM dynamically:

- Finds paragraphs, headings, links, buttons  
- Skips hidden or decorative elements  
- Highlights and reads out text with speech synthesis  
- Splits paragraphs into sentences for precise navigation  
- Recognizes landmarks to jump between major regions  

---

## 🧪 Example Usage

1. Open any website  
2. Press **Ctrl + Space** → "Browse mode"  
3. Press **H** to move between headings  
4. Press **P** to move between paragraphs  
5. Press **Arrow Down** to read the current paragraph sentence-by-sentence  
6. Press **G** to explore images and hear their descriptions  
7. Press **Ctrl + Space** again when you want to type normally  

---

## 🛠️ Customization

You can modify:
- Speech speed (rate)
- Pitch
- Volume
- Highlight colors
- Navigation keys  
via the `popup.html` UI or by editing `content.js`.

---

## 📸 Screenshots  
(Add screenshots of your popup UI and extension here)

---

## 🤝 Contributing  
Pull requests are welcome.  
If you want help adding new features like:
- Continuous reading (“Read from here”)  
- Table navigation mode  
- Form mode  
- AI image captioning (real Vision API)  
- Word-by-word navigation  

just open an issue or ask.

---

## 📄 License  
MIT License.  
Feel free to modify and use this extension in your own projects.

---

## 🙌 Author  
**bunny501** (GitHub)  
Chrome Extension + Web Accessibility Project  




