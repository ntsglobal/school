import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PronunciationTrainer from './PronunciationTrainer';
import AudioRecorder from './AudioRecorder';
import speechService from '../services/speechService';
import ttsService from '../services/ttsService';
import pronunciationService from '../services/pronunciationService';

const AILanguageLab = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pronunciation');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [exercises, setExercises] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [capabilities, setCapabilities] = useState(null);

  const tabs = [
    { id: 'pronunciation', label: 'Pronunciation', icon: '🗣️' },
    { id: 'listening', label: 'Listening', icon: '👂' },
    { id: 'speaking', label: 'Speaking', icon: '🎤' },
    { id: 'assessment', label: 'Assessment', icon: '📊' }
  ];

  const languages = speechService.getSupportedLanguages();

  useEffect(() => {
    initializeLab();
    fetchUserProgress();
  }, [selectedLanguage]);

  const initializeLab = async () => {
    setLoading(true);
    
    try {
      // Check browser capabilities
      const caps = {
        speech: speechService.isSupported,
        tts: ttsService.getCapabilities()
      };
      setCapabilities(caps);

      // Fetch pronunciation exercises
      const exerciseResponse = await pronunciationService.getPronunciationExercises(
        selectedLanguage, 
        'beginner'
      );
      
      if (exerciseResponse.success) {
        setExercises(exerciseResponse.data.exercises);
      }
    } catch (error) {
      console.error('Failed to initialize AI Language Lab:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const progressResponse = await pronunciationService.getPronunciationProgress(
        user.id,
        selectedLanguage
      );
      
      if (progressResponse.success) {
        setUserProgress(progressResponse.data.progress);
      }
    } catch (error) {
      console.error('Failed to fetch user progress:', error);
    }
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    speechService.setLanguage(language);
  };

  const renderPronunciationTab = () => (
    <div className="space-y-6">
      {/* Quick Practice */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Pronunciation Practice</h3>
        
        <PronunciationTrainer
          targetText="Hello, how are you today? I hope you're having a wonderful day."
          language={selectedLanguage}
          onScoreUpdate={(score, analysis) => {
            console.log('Pronunciation score:', score, analysis);
          }}
          showPhonetics={true}
          showWordByWord={true}
          difficulty="medium"
        />
      </div>

      {/* Exercise Library */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pronunciation Exercises</h3>
        
        {exercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exercises.map((exercise, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">Exercise {exercise.id}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    exercise.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    exercise.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {exercise.difficulty}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{exercise.text}</p>
                {exercise.phonetic && (
                  <p className="text-sm text-gray-500 font-mono">{exercise.phonetic}</p>
                )}
                <button className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Practice This →
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-microphone text-3xl mb-2"></i>
            <p>No exercises available for this language yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderListeningTab = () => (
    <div className="space-y-6">
      {/* Listening Comprehension */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Listening Comprehension</h3>
        
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Listen and Repeat</h4>
            <p className="text-blue-800 mb-3">
              Listen to the following phrase and try to repeat it exactly as you hear it.
            </p>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => ttsService.speakAuto(
                  "The quick brown fox jumps over the lazy dog",
                  selectedLanguage
                )}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-play mr-2"></i>
                Play
              </button>
              
              <button
                onClick={() => ttsService.speakSlowly(
                  "The quick brown fox jumps over the lazy dog",
                  selectedLanguage
                )}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                <i className="fas fa-play mr-2"></i>
                Play Slowly
              </button>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">Dictation Exercise</h4>
            <p className="text-purple-800 mb-3">
              Listen carefully and type what you hear.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => ttsService.speakAuto(
                  "I love learning new languages every day",
                  selectedLanguage
                )}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
              >
                <i className="fas fa-volume-up mr-2"></i>
                Listen
              </button>
              
              <textarea
                placeholder="Type what you heard..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="3"
              />
              
              <button className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors">
                Check Answer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Settings */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Voice Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice Selection
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              {ttsService.getVoicesForLanguage(selectedLanguage).map((voice, index) => (
                <option key={index} value={voice.name}>
                  {voice.name} ({voice.gender})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Speech Rate
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              defaultValue="1"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSpeakingTab = () => (
    <div className="space-y-6">
      {/* Free Speaking Practice */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Free Speaking Practice</h3>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Speaking Prompt</h4>
          <p className="text-gray-700">
            Describe your favorite hobby and explain why you enjoy it. 
            Try to speak for at least 2 minutes.
          </p>
        </div>

        <AudioRecorder
          onRecordingComplete={(audioBlob, transcription, duration) => {
            console.log('Recording completed:', { audioBlob, transcription, duration });
          }}
          language={selectedLanguage}
          maxDuration={180} // 3 minutes
          showTranscription={true}
          showWaveform={true}
        />
      </div>

      {/* Conversation Practice */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Conversation Practice</h3>
        
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Role Play: Restaurant Order</h4>
            <p className="text-blue-800 mb-3">
              You are at a restaurant. Order your favorite meal and ask about the ingredients.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Start Conversation
            </button>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Role Play: Job Interview</h4>
            <p className="text-green-800 mb-3">
              You are in a job interview. Introduce yourself and explain your qualifications.
            </p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
              Start Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAssessmentTab = () => (
    <div className="space-y-6">
      {/* Progress Overview */}
      {userProgress && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Progress</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {userProgress.overallScore}%
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {userProgress.exercisesCompleted}
              </div>
              <div className="text-sm text-gray-600">Exercises Completed</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Math.round(userProgress.totalPracticeTime / 60)}
              </div>
              <div className="text-sm text-gray-600">Hours Practiced</div>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="mt-6">
            <h4 className="font-medium text-gray-900 mb-3">Daily Progress</h4>
            <div className="h-32 bg-gray-100 rounded-lg flex items-end justify-center">
              <span className="text-gray-500">Progress chart would go here</span>
            </div>
          </div>
        </div>
      )}

      {/* Strengths and Weaknesses */}
      {userProgress && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-green-900 mb-4">Strengths</h3>
            <ul className="space-y-2">
              {userProgress.strongAreas.map((area, index) => (
                <li key={index} className="flex items-center text-green-700">
                  <i className="fas fa-check-circle mr-2"></i>
                  {area}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-red-900 mb-4">Areas for Improvement</h3>
            <ul className="space-y-2">
              {userProgress.weakAreas.map((area, index) => (
                <li key={index} className="flex items-center text-red-700">
                  <i className="fas fa-exclamation-circle mr-2"></i>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Language Lab</h1>
              <p className="text-sm text-gray-600">Advanced speech recognition and pronunciation training</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>

              {/* Capabilities Indicator */}
              {capabilities && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className={`w-2 h-2 rounded-full ${
                    capabilities.speech.recognition ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <span className="text-gray-600">Speech Recognition</span>
                  
                  <span className={`w-2 h-2 rounded-full ${
                    capabilities.tts.isSupported ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  <span className="text-gray-600">Text-to-Speech</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'pronunciation' && renderPronunciationTab()}
        {activeTab === 'listening' && renderListeningTab()}
        {activeTab === 'speaking' && renderSpeakingTab()}
        {activeTab === 'assessment' && renderAssessmentTab()}
      </div>
    </div>
  );
};

export default AILanguageLab;
