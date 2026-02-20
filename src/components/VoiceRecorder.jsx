import { useState, useRef, useCallback } from 'react';

const DRAGON_URL = 'http://100.101.184.20:5005';

function VoiceRecorder({ onTranscription, onPartialTranscription }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscription('');
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        }
      });
      streamRef.current = stream;

      // Try webm/opus first, fall back to wav
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await sendToTranscribe(blob, mimeType);
      };

      mediaRecorder.start(1000); // collect chunks every second
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } catch (err) {
      setError(`Microphone access denied: ${err.message}`);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(t => t.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
      setIsProcessing(true);
    }
  }, [isRecording]);

  const sendToTranscribe = async (blob, mimeType) => {
    try {
      const ext = mimeType.includes('webm') ? 'webm' : mimeType.includes('mp4') ? 'mp4' : 'wav';
      const formData = new FormData();
      formData.append('audio', blob, `recording.${ext}`);

      const response = await fetch(`${DRAGON_URL}/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.status}`);
      }

      const data = await response.json();
      const text = data.transcription || data.text || data.result || '';
      setTranscription(text);
      onTranscription?.(text);
    } catch (err) {
      setError(`Transcription error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Record Button */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`w-28 h-28 rounded-full flex items-center justify-center transition-all shadow-lg ${
          isRecording
            ? 'bg-red-600 animate-pulse shadow-red-300 ring-4 ring-red-300'
            : isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 hover:scale-105 active:scale-95'
        }`}
      >
        {isProcessing ? (
          <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : isRecording ? (
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </button>

      {/* Status */}
      <div className="text-center">
        {isRecording && (
          <div className="text-red-600 font-bold text-lg">
            🔴 Recording... {formatTime(recordingTime)}
          </div>
        )}
        {isProcessing && (
          <div className="text-blue-600 font-medium">
            Processing with Dragon Dictation...
          </div>
        )}
        {!isRecording && !isProcessing && (
          <div className="text-gray-500 text-sm">
            Tap to start recording
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg w-full text-sm">
          {error}
        </div>
      )}

      {/* Transcription Result */}
      {transcription && (
        <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-600 mb-2">Transcription:</h4>
          <p className="text-gray-800 text-base leading-relaxed">{transcription}</p>
        </div>
      )}
    </div>
  );
}

export default VoiceRecorder;
