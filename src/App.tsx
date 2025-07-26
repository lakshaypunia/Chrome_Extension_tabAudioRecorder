import { useEffect, useState } from 'react';
import './App.css';
import { Play, StopCircle, DownloadCloud, Mic, Upload } from 'lucide-react';

function App() {
  const [RecordingState, setRecordingState] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [recordingStopState, setRecordingStopState] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'uploaded'>('idle');



  useEffect(() => {
    // Fetch initial status from background when popup opens
    chrome.runtime.sendMessage({ type: 'get-status', target: 'background' }, (response) => {
      if (response) {
        console.log('Initial status received:', response);
        console.log('Recording URL:', response.url);
        if (response.state === 'recording') {
          setRecordingState(true);
          setRecordingUrl(null);
        } else if (response.state === 'stopped' && response.url) {
          setRecordingUrl(response.url.url);
          setRecordingState(false);
        } else {
          setRecordingState(false);
          setRecordingUrl(null);
        }
      }
    });
  }, []);

  const handleUpload = () => {
    setUploadStatus('uploading');

    chrome.runtime.sendMessage({ type: 'upload-recording', target: 'background' }, (response) => {
    if (response && response.success) {
      console.log('Upload successful.');
      setSuccess('Upload successful!');
      setError(null);
      setUploadStatus('uploaded');
      
    } else {
      console.error('Upload failed:', response ? response.error : 'No response');
      setSuccess(null);
      setError(response ? response.error : 'No response from background script');
      setUploadStatus('idle');
    }
  });
  }

  const handleStartRecording = () => {
    chrome.runtime.sendMessage({ type: 'start-recording', target: 'background' }, (response) => {
      if (response) {
        console.log('Recording started successfully');
      } else {
        console.error('Failed to start recording:', response.error);
      }
      setRecordingState(true);
      setRecordingUrl(null);
    });
  };

  const handleStopRecording = () => {
    console.log('Stopping recording...');
    setRecordingStopState(true);
    chrome.runtime.sendMessage({ type: 'stop-recording', target: 'background' }, () => {
      console.log('Recording stop request sent');
      pollForCompletion();
    });
  };

  function pollForCompletion() {
    chrome.runtime.sendMessage({ type: 'get-status', target: 'background' }, (response) => {
      if (response.state === 'stopped') {
        setRecordingUrl(response.url.url);
        setRecordingStopState(false);
        setRecordingState(false);
        console.log('Recording stopped and URL received:', response.url);
      } else {
        setTimeout(pollForCompletion, 300);
      }
    });
  }

  return (
    <div className="w-[350px] h-[500px] bg-white text-gray-800 overflow-hidden shadow-md font-sans flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          <h1 className="text-lg font-semibold tracking-wide">Audio Capture</h1>
        </div>
        <div className={`text-xs ${RecordingState ? 'text-green-200' : 'text-white/70'}`}>
          {RecordingState ? 'Recording...' : 'Idle'}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleStartRecording}
            disabled={RecordingState}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium shadow transition-all 
            ${RecordingState
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer'}`}
          >
            <Play className="w-4 h-4" />
            Start Recording
          </button>

          <button
            onClick={handleStopRecording}
            disabled={!RecordingState}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium shadow transition-all 
            ${!RecordingState
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-red-500 text-white hover:bg-red-600 cursor-pointer'}`}
          >
            <StopCircle className="w-4 h-4" />
            {recordingStopState ? 'Stopping...' : 'Stop Recording'}
          </button>
        </div>

        {/* Audio & Download */}
        {recordingUrl && (
          <div className="mt-2 flex flex-col gap-4 items-center">
            <audio controls className="w-full rounded">
              <source src={recordingUrl} type="audio/webm" />
              Your browser does not support the audio element.
            </audio>

            <button
              onClick={() => {
                chrome.downloads.download({
                  url: recordingUrl,
                  filename: `tab-audio-${Date.now()}.webm`,
                  saveAs: true,
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md shadow cursor-pointer"
            >
              <DownloadCloud className="w-4 h-4" />
              Download
            </button>
          <button
            onClick={handleUpload}
            disabled={uploadStatus === 'uploading' || uploadStatus === 'uploaded'}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm shadow cursor-pointer
              ${
                uploadStatus === 'uploading'
                  ? 'bg-blue-300 text-blue-800 cursor-not-allowed'
                  : uploadStatus === 'uploaded'
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
          >
            <Upload className="w-4 h-4" />
            {uploadStatus === 'uploading'
              ? 'Uploading...'
              : uploadStatus === 'uploaded'
              ? 'Uploaded'
              : 'Upload'}
          </button>
          </div>
        )}
      </div>
      {(success || error) && (
        <div
          className={`text-sm px-4 py-2 text-center transition-all ${
            success
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}
        >
          {success || error}
        </div>
      )}
    </div>
  );
}

export default App;
