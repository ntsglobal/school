import React, { useState, useEffect } from 'react';
import AudioRecorder from './AudioRecorder';
import speechService from '../services/speechService';
import ttsService from '../services/ttsService';
import pronunciationService from '../services/pronunciationService';

const PronunciationTrainer = ({ 
  targetText, 
  language = 'en-US', 
  onScoreUpdate,
  showPhonetics = true,
  showWordByWord = true,
  difficulty = 'medium'
}) => {
  const [currentMode, setCurrentMode] = useState('listen'); // listen, practice, record, results
  const [userRecording, setUserRecording] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [pronunciationScore, setPronunciationScore] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [highlightedWord, setHighlightedWord] = useState(-1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const words = targetText.split(/\s+/);

  useEffect(() => {
    // Initialize TTS voices
    ttsService.initializeVoices();
  }, []);

  const handleListen = () => {
    setCurrentMode('listen');
    ttsService.speakAuto(targetText, language, {
      rate: playbackSpeed,
      onStart: () => setHighlightedWord(0),
      onEnd: () => setHighlightedWord(-1)
    });
  };

  const handleListenWordByWord = () => {
    setCurrentMode('listen');
    ttsService.speakWordByWord(targetText, language, {
      rate: playbackSpeed,
      wordDelay: 1500,
      onWordStart: (word, index) => setHighlightedWord(index),
      onWordEnd: () => setHighlightedWord(-1),
      onComplete: () => setHighlightedWord(-1)
    });
  };

  const handleListenSlowly = () => {
    setCurrentMode('listen');
    ttsService.speakSlowly(targetText, language, {
      onStart: () => setHighlightedWord(0),
      onEnd: () => setHighlightedWord(-1)
    });
  };

  const handleStartPractice = () => {
    setCurrentMode('practice');
    setError(null);
    setTranscription('');
    setPronunciationScore(null);
    setAnalysis(null);
  };

  const handleRecordingComplete = async (audioBlob, transcription, duration) => {
    setUserRecording(audioBlob);
    setTranscription(transcription);
    setCurrentMode('results');
    setLoading(true);

    try {
      // Analyze pronunciation
      const result = await pronunciationService.analyzePronunciation(
        targetText,
        transcription,
        language
      );

      if (result.success) {
        setAnalysis(result.data.analysis);
        setPronunciationScore(result.data.analysis.overallScore);
        
        if (onScoreUpdate) {
          onScoreUpdate(result.data.analysis.overallScore, result.data.analysis);
        }
      } else {
        setError('Failed to analyze pronunciation');
      }
    } catch (err) {
      setError('Error analyzing pronunciation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTranscriptionUpdate = (newTranscription, confidence) => {
    setTranscription(newTranscription);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-yellow-100';
    if (score >= 60) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const renderTargetText = () => (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-3">Target Text</h3>
      <div className="text-xl leading-relaxed">
        {words.map((word, index) => (
          <span
            key={index}
            className={`inline-block mr-2 mb-1 px-2 py-1 rounded transition-colors ${
              highlightedWord === index
                ? 'bg-blue-200 text-blue-900'
                : 'hover:bg-gray-200'
            }`}
          >
            {word}
          </span>
        ))}
      </div>
      
      {showPhonetics && (
        <div className="mt-3 text-sm text-gray-600 font-mono">
          Phonetic: {pronunciationService.getPhoneticTranscription(targetText, language)}
        </div>
      )}
    </div>
  );

  const renderListenMode = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Listen & Learn</h3>
        <p className="text-gray-600 mb-6">Listen to the correct pronunciation before practicing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleListen}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-play mr-2"></i>
          Normal Speed
        </button>
        
        <button
          onClick={handleListenSlowly}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          <i className="fas fa-play mr-2"></i>
          Slow Speed
        </button>
        
        {showWordByWord && (
          <button
            onClick={handleListenWordByWord}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <i className="fas fa-play mr-2"></i>
            Word by Word
          </button>
        )}
      </div>

      <div className="flex items-center justify-center space-x-4 mt-6">
        <label className="text-sm text-gray-600">Speed:</label>
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.1"
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
          className="w-32"
        />
        <span className="text-sm text-gray-600">{playbackSpeed}x</span>
      </div>

      <div className="text-center mt-6">
        <button
          onClick={handleStartPractice}
          className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors"
        >
          <i className="fas fa-microphone mr-2"></i>
          Start Practice
        </button>
      </div>
    </div>
  );

  const renderPracticeMode = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Practice Speaking</h3>
        <p className="text-gray-600">Record yourself saying the target text</p>
      </div>

      <AudioRecorder
        onRecordingComplete={handleRecordingComplete}
        onTranscriptionUpdate={handleTranscriptionUpdate}
        language={language}
        maxDuration={60}
        showTranscription={true}
        showWaveform={true}
      />

      <div className="text-center">
        <button
          onClick={() => setCurrentMode('listen')}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          ← Back to Listen
        </button>
      </div>
    </div>
  );

  const renderResultsMode = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pronunciation Results</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Analyzing pronunciation...</span>
          </div>
        ) : pronunciationScore !== null ? (
          <div className={`inline-block px-6 py-3 rounded-lg ${getScoreBackground(pronunciationScore)}`}>
            <div className={`text-3xl font-bold ${getScoreColor(pronunciationScore)}`}>
              {pronunciationScore}%
            </div>
            <div className="text-sm text-gray-600">Pronunciation Score</div>
          </div>
        ) : null}
      </div>

      {/* Transcription Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Target Text</h4>
          <p className="text-green-800">{targetText}</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">What You Said</h4>
          <p className="text-blue-800">{transcription || 'No transcription available'}</p>
        </div>
      </div>

      {/* Detailed Analysis */}
      {analysis && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Detailed Analysis</h4>
          
          {/* Word-by-word analysis */}
          {analysis.wordAnalysis && (
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Word Analysis</h5>
              <div className="flex flex-wrap gap-2">
                {analysis.wordAnalysis.map((word, index) => (
                  <div
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm ${
                      word.accuracy >= 80 ? 'bg-green-100 text-green-800' :
                      word.accuracy >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {word.original} ({word.accuracy}%)
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Feedback</h5>
            <p className="text-gray-600">{analysis.feedback}</p>
          </div>

          {/* Improvements */}
          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Suggestions for Improvement</h5>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {analysis.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-red-600 mr-2"></i>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={handleStartPractice}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <i className="fas fa-redo mr-2"></i>
          Try Again
        </button>
        
        <button
          onClick={() => setCurrentMode('listen')}
          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <i className="fas fa-volume-up mr-2"></i>
          Listen Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Pronunciation Trainer</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Language: {language}</span>
          <span>•</span>
          <span>Difficulty: {difficulty}</span>
        </div>
      </div>

      {/* Target Text Display */}
      {renderTargetText()}

      {/* Mode Content */}
      {currentMode === 'listen' && renderListenMode()}
      {currentMode === 'practice' && renderPracticeMode()}
      {currentMode === 'results' && renderResultsMode()}
    </div>
  );
};

export default PronunciationTrainer;
