import React, { useState, useRef, useEffect } from 'react';
import speechService from '../services/speechService';

const AudioRecorder = ({ 
  onRecordingComplete, 
  onTranscriptionUpdate,
  language = 'en-US',
  maxDuration = 300, // 5 minutes
  showTranscription = true,
  showWaveform = false,
  autoStart = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    checkSupport();
    if (autoStart) {
      startRecording();
    }
    
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRecording, isPaused, maxDuration]);

  const checkSupport = () => {
    const supported = navigator.mediaDevices && 
                     navigator.mediaDevices.getUserMedia && 
                     window.MediaRecorder;
    setIsSupported(supported);
    return supported;
  };

  const startRecording = async () => {
    if (!isSupported) {
      setError('Audio recording is not supported in this browser');
      return;
    }

    try {
      setError(null);
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      
      // Set up audio level monitoring
      if (showWaveform) {
        setupAudioAnalysis(stream);
      }

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob, transcription, duration);
        }
        cleanup();
      };

      // Start speech recognition if transcription is enabled
      if (showTranscription) {
        startSpeechRecognition();
      }

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
    
    speechService.stopListening();
    cleanup();
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const startSpeechRecognition = () => {
    speechService.startListening({
      language,
      continuous: true,
      interimResults: true,
      onResult: (results) => {
        const latestResult = results[results.length - 1];
        if (latestResult) {
          const newTranscription = latestResult.transcript;
          setTranscription(newTranscription);
          if (onTranscriptionUpdate) {
            onTranscriptionUpdate(newTranscription, latestResult.confidence);
          }
        }
      },
      onError: (error) => {
        console.error('Speech recognition error:', error);
      }
    });
  };

  const setupAudioAnalysis = (stream) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      updateAudioLevel();
    } catch (err) {
      console.error('Error setting up audio analysis:', err);
    }
  };

  const updateAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    setAudioLevel(average / 255); // Normalize to 0-1

    if (isRecording) {
      requestAnimationFrame(updateAudioLevel);
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    clearInterval(timerRef.current);
    speechService.stopListening();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRecordingStatus = () => {
    if (!isRecording) return 'Ready to record';
    if (isPaused) return 'Paused';
    return 'Recording...';
  };

  if (!isSupported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <i className="fas fa-exclamation-triangle text-red-600 mr-2"></i>
          <span className="text-red-800">Audio recording is not supported in this browser</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Audio Recorder</h3>
        <div className="text-sm text-gray-600">
          {formatDuration(duration)} / {formatDuration(maxDuration)}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-red-600 mr-2"></i>
            <span className="text-red-800 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Recording Controls */}
      <div className="flex items-center justify-center space-x-4 mb-6">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
          >
            <i className="fas fa-microphone text-xl"></i>
          </button>
        ) : (
          <>
            <button
              onClick={pauseRecording}
              className={`w-12 h-12 ${isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white rounded-full flex items-center justify-center transition-colors`}
            >
              <i className={`fas ${isPaused ? 'fa-play' : 'fa-pause'}`}></i>
            </button>
            
            <button
              onClick={stopRecording}
              className="w-16 h-16 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
            >
              <i className="fas fa-stop text-xl"></i>
            </button>
          </>
        )}
      </div>

      {/* Status and Audio Level */}
      <div className="text-center mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">
          {getRecordingStatus()}
        </div>
        
        {/* Audio Level Indicator */}
        {showWaveform && isRecording && (
          <div className="flex items-center justify-center space-x-1">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-blue-500 rounded-full transition-all duration-100 ${
                  audioLevel * 10 > i ? 'h-8' : 'h-2'
                }`}
              ></div>
            ))}
          </div>
        )}

        {/* Recording Indicator */}
        {isRecording && !isPaused && (
          <div className="flex items-center justify-center mt-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-red-600 text-sm font-medium">REC</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(duration / maxDuration) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Live Transcription */}
      {showTranscription && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Live Transcription</h4>
            <span className="text-xs text-gray-500">
              Language: {language}
            </span>
          </div>
          <div className="min-h-[60px] text-sm text-gray-800">
            {transcription || (isRecording ? 'Listening...' : 'Start recording to see transcription')}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        {!isRecording && 'Click the microphone to start recording'}
        {isRecording && !isPaused && 'Click pause to pause or stop to finish recording'}
        {isRecording && isPaused && 'Click play to resume or stop to finish recording'}
      </div>
    </div>
  );
};

export default AudioRecorder;
