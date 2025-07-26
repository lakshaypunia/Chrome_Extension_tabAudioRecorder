// background.js

// Use chrome.storage.session for state that survives service worker termination.
const storage = chrome.storage.session;

// Helper to get the current state from storage
async function getState() {
  const result = await storage.get(['recordingState', 'downloadableUrl']);
  // Provide default values
  return {
    recordingState: result.recordingState || 'idle',
    downloadableUrl: result.downloadableUrl || null,
  };
}

// Helper to set the state in storage
async function setState(newState) {
  await storage.set(newState);
}

// Helper function to reset the state in storage
async function resetState() {
  await setState({
    recordingState: 'idle',
    downloadableUrl: null
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.target !== 'background') return true;

  // Wrap logic in an async IIFE to use await
  (async () => {
    switch (message.type) {
      case 'get-status':
        const currentState = await getState();
        sendResponse({ state: currentState.recordingState, url: currentState.downloadableUrl });
        break;

      case 'start-recording':
        await startRecording();
        sendResponse(true);
        break;

      case 'stop-recording':
        stopRecording();
        sendResponse(true);
        break;

      case 'recording-finished':
        await setState({
          recordingState: 'stopped',
          downloadableUrl: {
            url: message.url,
            sampleRate: message.sampleRate
          }
        });
        sendResponse({ received: true });
        break;

      case 'upload-recording':
        const { downloadableUrl } = await getState();
        if (downloadableUrl) {
          try {
            await sendAudioToApi(downloadableUrl);
            await resetState(); // Reset after successful upload
            sendResponse({ success: true });
          } catch (err) {
            sendResponse({ success: false, error: err.message });
          }
        }
        break;

      case 'discard-recording':
        await resetState();
        sendResponse({ success: true });
        break;

      default:
        console.warn(`Unknown message: ${message.type}`);
    }
  })();

  // Return true to indicate you will be sending a response asynchronously
  return true;
});

async function startRecording() {
  const { recordingState } = await getState();
  if (recordingState === 'recording') return;

  await resetState(); // Ensure we start fresh
  await setState({ recordingState: 'recording' });

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });

  if (await chrome.offscreen.hasDocument()) {
    await chrome.offscreen.closeDocument();
  }

  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['USER_MEDIA'],
    justification: 'To record tab audio',
  });

  chrome.runtime.sendMessage({
    type: 'start-offscreen-recording',
    target: 'offscreen',
    streamId: streamId,
  });
}

async function stopRecording() {
    const { recordingState } = await getState();
    if (recordingState !== 'recording') return;
    chrome.runtime.sendMessage({ type: 'stop-offscreen-recording', target: 'offscreen' });
}

async function sendAudioToApi(audioDataUrl) {
  // This function remains the same as it does not deal with the recording state
  const response = await fetch(audioDataUrl.url);
  const audioBlob = await response.blob();

  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  formData.append('sampleRate', audioDataUrl.sampleRate);

  const apiResponse = await fetch('http://localhost:3000/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!apiResponse.ok) {
    throw new Error(`API request failed: ${apiResponse.statusText}`);
  }

  const result = await apiResponse.json();
  console.log('API response:', result);
}