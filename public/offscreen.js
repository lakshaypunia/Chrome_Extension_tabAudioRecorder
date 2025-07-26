// offscreen.js

let mediaRecorder;

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.target !== 'offscreen') return;

  if (message.type === 'start-offscreen-recording') {
    await startRecording(message.streamId);
  } else if (message.type === 'stop-offscreen-recording') {
    if (mediaRecorder?.state === 'recording') {
      mediaRecorder.stop();
    }
  }
});

async function startRecording(streamId) {
  if (mediaRecorder?.state === 'recording') {
    return;
  }

  const media = await navigator.mediaDevices.getUserMedia({
    audio: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: streamId } },
    video: false,
  });

  const audioContext = new AudioContext();
  const sampleRate = audioContext.sampleRate;
  const source = audioContext.createMediaStreamSource(media);
  source.connect(audioContext.destination);

  const audioChunks = [];
  mediaRecorder = new MediaRecorder(media, { mimeType: 'audio/webm' });

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) audioChunks.push(event.data);
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    const reader = new FileReader();

    reader.onload = () => {
      // --- CHANGE IS HERE ---
      // We no longer send the 'blob' property, as it doesn't work.
      // We will reconstruct the blob from the URL in the background script.
      chrome.runtime.sendMessage({
        type: 'recording-finished',
        target: 'background',
        url: reader.result, // The data URL is all we need now
        sampleRate: sampleRate,
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(`Error after sending recording: ${chrome.runtime.lastError.message}`);
        }
        window.close();
      });
    };

    reader.readAsDataURL(blob);
    media.getTracks().forEach(track => track.stop());
    audioContext.close();
  };

  mediaRecorder.start();
}