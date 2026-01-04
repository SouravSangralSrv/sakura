
# 🌸 V-BHARAT: AI Desktop Buddy

V-Bharat is a premium, Indian-themed AI Desktop Assistant featuring interactive anime personas (**Sakura** and **Haruki**). It supports both high-performance Cloud AI (Gemini) and full **Offline Edge AI** (Ollama).

---

## 🛠 Setup Guide (Visual Studio Code & Offline Mode)

Follow these steps to get V-Bharat running locally on your machine for a completely private, offline experience.

### 1. Prerequisites
Before starting, ensure you have the following installed:
*   **Visual Studio Code**: [Download here](https://code.visualstudio.com/)
*   **Node.js (v18+)**: [Download here](https://nodejs.org/)
*   **Ollama (For Offline Mode)**: [Download here](https://ollama.com/)

### 2. Installation
1.  Open **VS Code**.
2.  Open the project folder.
3.  Open the integrated terminal in VS Code (`Ctrl + ` ` or `View > Terminal`).
4.  Install the required dependencies:
    ```bash
    npm install
    ```

### 3. Setting Up Offline Mode (Ollama)
V-Bharat uses **Ollama** to run Large Language Models locally on your hardware.

1.  **Launch Ollama**: Ensure the Ollama application is running in your system tray.
2.  **Download the Model**: In your terminal, run the following command to download the default model used by V-Bharat:
    ```bash
    ollama run llama3
    ```
    *(You can also use other models, but ensure the model name matches in `services/ollamaService.ts`)*.
3.  **Verify Connection**: V-Bharat connects to `http://localhost:11434`. Ensure no firewall is blocking this port.

### 4. Running the Application
Since this is an **Electron** application, you need to launch it using the npm start script:

1.  In the VS Code terminal, run:
    ```bash
    npm start
    ```
2.  Once the app opens:
    *   Go to the **Neural Config** panel on the left.
    *   Toggle the **Cognitive Core** from "Cloud" to **"Edge"**.
    *   Click **"Initiate Buddy"**.

---

## 🚀 Key Features
*   **Dual Personas**: Switch between **Sakura** (Bubbly/Teasing) and **Haruki** (Stoic/Thoughtful).
*   **Hinglish Support**: Naturally understands and speaks in urban Indian dialects.
*   **Knowledge Base**: Drag and drop PDFs to give your buddy local context.
*   **Holographic UI**: A sound-reactive, glass-morphism interface designed for modern desktops.
*   **Privacy First**: Use the **Edge (Ollama)** provider to ensure no data ever leaves your computer.

---

## 📂 Project Structure
*   `App.tsx`: Main logic and state management.
*   `components/Avatar.tsx`: 2D Sprite rendering and holographic animations.
*   `services/ollamaService.ts`: Local LLM integration logic.
*   `main.js`: Electron window configuration (Transparency, Always-on-top).

## ⚠️ Troubleshooting
*   **"Ollama is not running"**: Ensure you have started the Ollama app and it is accessible at `localhost:11434`.
*   **Audio Issues**: Ensure your microphone permissions are granted. In Electron, these are handled via `metadata.json`.
*   **Transparency**: If the background isn't transparent, ensure your OS supports hardware acceleration and transparent windows.
