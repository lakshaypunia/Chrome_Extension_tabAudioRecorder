# Tab Audio Recorder - Chrome Extension

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Chrome Extensions](https://img.shields.io/badge/Chrome%20Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/)

A powerful Chrome extension built with React and TypeScript to record audio from any browser tab. Once recorded, you can instantly download the audio as a `.webm` file or upload it directly to a backend API for further processing.

![Extension Demo](./demo.gif)
*(You can replace this with a real GIF of your extension in action!)*

---

## Features

-   **One-Click Recording:** Start and stop recording tab audio with a simple, intuitive interface.
-   **Persistent State:** The recording state is saved even if you close the popup, thanks to the `chrome.storage` API.
-   **Audio Playback:** Preview your recording directly within the extension popup.
-   **Local Download:** Save the captured audio to your computer as a high-quality `.webm` file.
-   **Direct Upload:** Send the recording and its sample rate to a specified API endpoint with a single click.
-   **Modern UI:** A clean, modern interface built with React and styled with utility-first CSS.

## Tech Stack

-   **Frontend (Extension):** React, TypeScript, Vite, Lucide React (for icons)
-   **Backend (API):** Node.js, Express (or your preferred framework)
-   **Chrome APIs:** `tabCapture`, `storage`, `offscreen`, `downloads`

---

## 🚀 Local Setup and Installation

Follow these steps to get the extension and the local test server running on your machine.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or newer recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   [Google Chrome](https://www.google.com/chrome/)

### Step 1: Clone the Repository

First, clone the project from GitHub to your local machine.

```bash
git clone https://github.com/lakshaypunia/Chrome_Extension_tabAudioRecorder.git
cd Chrome_Extension_tabAudioRecorder
### Step 2: Install Dependencies

You'll need to install dependencies for both the extension frontend and the backend server.

#### For the Extension (Frontend):

```bash
# Navigate to the root directory of the project
npm install
```

### Step 3: Build the Extension

To create the production-ready extension files, run the build command from the root directory. This will generate a `dist` folder containing all the necessary HTML, CSS, and JavaScript.

```bash
# From the root directory
npm run build
```

## 🔧 Installing the Chrome Extension Locally

With the `dist` folder generated, you can now load the extension into Chrome.

1. **Open Chrome Extensions**: Open Google Chrome and navigate to `chrome://extensions`.

2. **Enable Developer Mode**: In the top-right corner of the page, toggle the "Developer mode" switch on.

3. **Load the Extension**: 
   - Click the "Load unpacked" button that appears on the top-left.
   - A file selection dialog will open.
   - Navigate to your project directory and select the `dist` folder.
   - Click "Select Folder".

The Tab Audio Recorder extension should now appear in your list of extensions, and its icon will be available in the Chrome toolbar!

## 🎧 How to Use the Extension

### Open a Tab with Audio
Navigate to any website that is playing audio, like a YouTube video or a Spotify web player.

### Start Recording
1. Click the extension's icon in the Chrome toolbar to open the popup.
2. Click the "Start Recording" button.
3. The extension is now capturing the audio from that tab.

### Stop Recording
When you're ready to finish, click the "Stop Recording" button.

### Download or Upload
The UI will update to show an audio player for previewing your recording.

**To save the file locally:**
- Click the "Download" button. This will open a "Save As" dialog to save the `recording.webm` file on your computer.

**To test the API:**
- Click the "Upload" button. This will send the audio file and its sample rate to your local server running at **http://localhost:3000/api/upload**.
- You can check the server's console output to confirm a successful upload.

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features or find a bug, please feel free to open an issue or submit a pull request.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

