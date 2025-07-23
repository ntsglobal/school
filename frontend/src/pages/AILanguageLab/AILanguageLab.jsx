import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AILanguageLab.css';
import speechService from '../../services/speechService';
import pronunciationService from '../../services/pronunciationService';

const AILanguageLab = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [speechAccuracy, setSpeechAccuracy] = useState(85);
  const [fluencyScore, setFluencyScore] = useState(85);
  const [pronunciationScore, setPronunciationScore] = useState(78);
  const [recordingsList, setRecordingsList] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState({
    sessionsCompleted: 12,
    hoursSpent: 24,
    languagesLearned: 3,
    wordsLearned: 8
  });
  const [currentPhrase, setCurrentPhrase] = useState("Bonjour, comment allez-vous aujourd'hui?");
  const [selectedLanguage, setSelectedLanguage] = useState('french');
  
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);

  // Mock recordings data
  const mockRecordings = [
    {
      id: 1,
      title: 'French Greetings',
      language: 'French',
      duration: '2:45',
      date: '2 days ago',
      accuracy: 94,
      audioUrl: null
    },
    {
      id: 2,
      title: 'Spanish Numbers',
      language: 'Spanish',
      duration: '1:30',
      date: 'Yesterday',
      accuracy: 87,
      audioUrl: null
    },
    {
      id: 3,
      title: 'Japanese Phrases',
      language: 'Japanese',
      duration: '3:12',
      date: 'Today',
      accuracy: 91,
      audioUrl: null
    }
  ];

  const languages = [
    { code: 'french', name: 'French', phrases: ["Bonjour, comment allez-vous aujourd'hui?", "Merci beaucoup pour votre aide", "Où se trouve la bibliothèque?"] },
    { code: 'spanish', name: 'Spanish', phrases: ["Hola, ¿cómo está usted hoy?", "Muchas gracias por su ayuda", "¿Dónde está la biblioteca?"] },
    { code: 'japanese', name: 'Japanese', phrases: ["こんにちは、今日はいかがですか？", "ご協力ありがとうございます", "図書館はどこですか？"] },
    { code: 'english', name: 'English', phrases: ["Hello, how are you today?", "Thank you very much for your help", "Where is the library located?"] }
  ];

  const additionalResources = [
    {
      id: 1,
      title: 'Practice Sheets',
      description: 'Downloadable worksheets',
      icon: '📄',
      downloadUrl: '/resources/practice-sheets.pdf'
    },
    {
      id: 2,
      title: 'Video Tutorials',
      description: 'Step-by-step tutorials',
      icon: '🎥',
      downloadUrl: '/resources/video-tutorials'
    },
    {
      id: 3,
      title: 'Study Guides',
      description: 'Comprehensive study materials',
      icon: '📚',
      downloadUrl: '/resources/study-guides.pdf'
    }
  ];

  useEffect(() => {
    setRecordingsList(mockRecordings);
    loadUserProgress();
  }, []);

  const loadUserProgress = async () => {
    try {
      // In real implementation, this would fetch from API
      // const progress = await speechService.getUserProgress();
      // setWeeklyStats(progress.weeklyStats);
      // setSpeechAccuracy(progress.speechAccuracy);
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const startSpeechPractice = async () => {
    try {
      setIsRecording(true);
      
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        recordedChunks.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = async () => {
          const blob = new Blob(recordedChunks.current, { type: 'audio/wav' });
          await analyzeSpeech(blob);
        };

        mediaRecorderRef.current.start();
      }
    } catch (error) {
      console.error('Error starting speech practice:', error);
      setIsRecording(false);
    }
  };

  const stopSpeechPractice = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  };

  const analyzeSpeech = async (audioBlob) => {
    try {
      // In real implementation, this would use speech recognition API
      // const analysis = await pronunciationService.analyzeAudio(audioBlob, currentPhrase);
      
      // Mock analysis results
      const mockAccuracy = Math.floor(Math.random() * (95 - 75) + 75);
      setSpeechAccuracy(mockAccuracy);
      
      // Update weekly stats
      setWeeklyStats(prev => ({
        ...prev,
        sessionsCompleted: prev.sessionsCompleted + 1
      }));

      // Add to recordings list
      const newRecording = {
        id: Date.now(),
        title: `${languages.find(l => l.code === selectedLanguage)?.name} Practice`,
        language: languages.find(l => l.code === selectedLanguage)?.name,
        duration: '0:30',
        date: 'Just now',
        accuracy: mockAccuracy,
        audioUrl: URL.createObjectURL(audioBlob)
      };

      setRecordingsList(prev => [newRecording, ...prev]);
      
    } catch (error) {
      console.error('Error analyzing speech:', error);
    }
  };

  const playListenAndRepeat = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      return;
    }

    setIsPlaying(true);
    
    // Use Web Speech API for text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentPhrase);
      utterance.lang = getLanguageCode(selectedLanguage);
      utterance.rate = 0.8;
      
      utterance.onend = () => {
        setIsPlaying(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const getLanguageCode = (language) => {
    const codes = {
      french: 'fr-FR',
      spanish: 'es-ES',
      japanese: 'ja-JP',
      english: 'en-US'
    };
    return codes[language] || 'en-US';
  };

  const playRecording = (recording) => {
    if (recording.audioUrl) {
      const audio = new Audio(recording.audioUrl);
      audio.play();
    } else {
      alert('Audio not available for this recording');
    }
  };

  const downloadResource = (resource) => {
    // In real implementation, this would download the actual file
    alert(`Downloading ${resource.title}...`);
  };

  const getRandomPhrase = () => {
    const currentLanguage = languages.find(l => l.code === selectedLanguage);
    if (currentLanguage && currentLanguage.phrases.length > 0) {
      const randomIndex = Math.floor(Math.random() * currentLanguage.phrases.length);
      setCurrentPhrase(currentLanguage.phrases[randomIndex]);
    }
  };

  return (
    <div className="ai-language-lab">
      <div className="container">
        {/* Header Section */}
        <div className="lab-header">
          <h1>Language Laboratory</h1>
          <p className="lab-subtitle">Perfect Your Pronunciation</p>
        </div>

        {/* Main Practice Grid */}
        <div className="practice-grid">
          {/* Speech Practice Card */}
          <div className="practice-card speech-practice">
            <div className="card-header">
              <div className="card-icon">
                <i className="fas fa-microphone"></i>
              </div>
              <h3>Speech Practice</h3>
            </div>
            
            <div className="card-content">
              <div className="language-selector">
                <select 
                  value={selectedLanguage} 
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="language-select"
                >
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>

              <div className="practice-phrase">
                <p>"{currentPhrase}"</p>
                <button 
                  className="btn-text refresh-phrase"
                  onClick={getRandomPhrase}
                  title="Get new phrase"
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
              </div>

              <div className="recording-controls">
                <button 
                  className={`btn-primary record-btn ${isRecording ? 'recording' : ''}`}
                  onClick={isRecording ? stopSpeechPractice : startSpeechPractice}
                >
                  {isRecording ? (
                    <>
                      <i className="fas fa-stop"></i>
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <i className="fas fa-microphone"></i>
                      Start Speaking
                    </>
                  )}
                </button>
              </div>

              <div className="accuracy-display">
                <div className="accuracy-label">Accuracy Score</div>
                <div className="accuracy-value">{speechAccuracy}%</div>
                <button className="btn-outline practice-again">
                  Practice Again
                </button>
              </div>
            </div>
          </div>

          {/* Listen & Repeat Card */}
          <div className="practice-card listen-repeat">
            <div className="card-header">
              <div className="card-icon">
                <i className="fas fa-volume-up"></i>
              </div>
              <h3>Listen & Repeat</h3>
            </div>
            
            <div className="card-content">
              <div className="phrase-display">
                <p>"{currentPhrase}"</p>
              </div>
              
              <div className="audio-controls">
                <button 
                  className={`btn-primary listen-btn ${isPlaying ? 'playing' : ''}`}
                  onClick={playListenAndRepeat}
                >
                  <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                  {isPlaying ? 'Pause' : 'Listen'}
                </button>
                
                <button 
                  className={`btn-danger record-btn ${isRecording ? 'recording' : ''}`}
                  onClick={isRecording ? stopSpeechPractice : startSpeechPractice}
                >
                  <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
                  {isRecording ? 'Stop' : 'Record'}
                </button>
              </div>
            </div>
          </div>

          {/* Performance Analysis Card */}
          <div className="practice-card performance-analysis">
            <div className="card-header">
              <div className="card-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>Performance Analysis</h3>
            </div>
            
            <div className="card-content">
              <div className="performance-metrics">
                <div className="metric-item">
                  <div className="metric-label">Fluency</div>
                  <div className="metric-value">+15%</div>
                  <div className="progress-circle" data-percentage={fluencyScore}>
                    <div className="circle-content">
                      <span className="percentage">{fluencyScore}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="detailed-metrics">
                  <div className="metric-bar">
                    <span className="metric-name">Pronunciation</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${pronunciationScore}%` }}
                      ></div>
                    </div>
                    <span className="metric-score">{pronunciationScore}%</span>
                  </div>
                  
                  <div className="metric-bar">
                    <span className="metric-name">Clarity</span>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${speechAccuracy}%` }}
                      ></div>
                    </div>
                    <span className="metric-score">{speechAccuracy}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* My Recordings Card */}
          <div className="practice-card my-recordings">
            <div className="card-header">
              <div className="card-icon">
                <i className="fas fa-list"></i>
              </div>
              <h3>My Recordings</h3>
            </div>
            
            <div className="card-content">
              <div className="recordings-list">
                {recordingsList.slice(0, 3).map(recording => (
                  <div key={recording.id} className="recording-item">
                    <div className="recording-info">
                      <h4>{recording.title}</h4>
                      <span className="recording-date">{recording.date}</span>
                    </div>
                    <div className="recording-stats">
                      <span className="duration">{recording.duration}</span>
                      <span className="accuracy">{recording.accuracy}%</span>
                    </div>
                    <button 
                      className="btn-play"
                      onClick={() => playRecording(recording)}
                      title="Play recording"
                    >
                      <i className="fas fa-play"></i>
                    </button>
                  </div>
                ))}
              </div>
              
              {recordingsList.length > 3 && (
                <button className="btn-outline view-all">
                  View All Recordings
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Progress Section */}
        <div className="weekly-progress">
          <h2>Weekly Progress</h2>
          <div className="progress-stats">
            <div className="stat-item">
              <div className="stat-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="stat-content">
                <div className="stat-label">Sessions Completed</div>
                <div className="stat-value">{weeklyStats.sessionsCompleted}</div>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-content">
                <div className="stat-label">Hours Practiced</div>
                <div className="stat-value">{weeklyStats.hoursSpent}</div>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">
                <i className="fas fa-globe"></i>
              </div>
              <div className="stat-content">
                <div className="stat-label">Languages</div>
                <div className="stat-value">{weeklyStats.languagesLearned}</div>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">
                <i className="fas fa-book"></i>
              </div>
              <div className="stat-content">
                <div className="stat-label">Words Learned</div>
                <div className="stat-value">{weeklyStats.wordsLearned}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Resources Section */}
        <div className="additional-resources">
          <h2>Additional Resources</h2>
          <div className="resources-grid">
            {additionalResources.map(resource => (
              <div key={resource.id} className="resource-card">
                <div className="resource-icon">{resource.icon}</div>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <button 
                  className="btn-outline download-btn"
                  onClick={() => downloadResource(resource)}
                >
                  <i className="fas fa-download"></i>
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AILanguageLab;
