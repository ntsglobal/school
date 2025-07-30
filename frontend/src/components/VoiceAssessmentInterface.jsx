import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AudioRecorder from './AudioRecorder';
import apiService from '../services/api';

const VoiceAssessmentInterface = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [assessment, setAssessment] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('preparation'); // preparation, recording, completed
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [preparationTime, setPreparationTime] = useState(0);
  const [recording, setRecording] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (assessmentId) {
      fetchAssessment();
    }
  }, [assessmentId]);

  useEffect(() => {
    let timer;
    if (timeRemaining > 0 && (currentPhase === 'preparation' || currentPhase === 'recording')) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (currentPhase === 'preparation') {
              startRecording();
            } else if (currentPhase === 'recording') {
              // Auto-submit when time runs out
              handleTimeUp();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [timeRemaining, currentPhase]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/speech/assessments/${assessmentId}`);
      
      if (response.success) {
        setAssessment(response.data.assessment);
        setPreparationTime(response.data.assessment.settings.preparationTime);
        setTimeRemaining(response.data.assessment.settings.preparationTime);
      } else {
        setError('Failed to load assessment');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startPreparation = () => {
    setCurrentPhase('preparation');
    setTimeRemaining(preparationTime);
  };

  const startRecording = () => {
    setCurrentPhase('recording');
    setTimeRemaining(assessment.settings.timeLimit);
  };

  const handleRecordingComplete = async (audioBlob, transcription, duration) => {
    setRecording(audioBlob);
    setTranscription(transcription);
    setCurrentPhase('completed');
    
    // Auto-submit the assessment
    await submitAssessment(audioBlob, transcription);
  };

  const handleTimeUp = () => {
    // Force stop recording when time runs out
    setCurrentPhase('completed');
  };

  const submitAssessment = async (audioBlob, transcription) => {
    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'assessment-recording.webm');
      formData.append('transcription', transcription);
      formData.append('deviceInfo', JSON.stringify({
        userAgent: navigator.userAgent,
        platform: navigator.platform
      }));

      const response = await apiService.post(
        `/speech/assessments/${assessmentId}/attempt`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.success) {
        setResults(response.data.attempt);
      } else {
        setError('Failed to submit assessment');
      }
    } catch (err) {
      setError('Error submitting assessment: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseTitle = () => {
    switch (currentPhase) {
      case 'preparation': return 'Preparation Time';
      case 'recording': return 'Recording';
      case 'completed': return 'Assessment Complete';
      default: return 'Voice Assessment';
    }
  };

  const getPhaseDescription = () => {
    switch (currentPhase) {
      case 'preparation': 
        return 'Review the instructions and prepare your response. Recording will start automatically when preparation time ends.';
      case 'recording': 
        return 'Speak clearly into your microphone. Your response is being recorded.';
      case 'completed': 
        return 'Your assessment has been submitted and is being processed.';
      default: 
        return 'Get ready to begin your voice assessment.';
    }
  };

  const renderAssessmentContent = () => {
    if (!assessment) return null;

    return (
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Assessment Content</h3>
        
        {/* Text Content */}
        {assessment.content.text && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Text to Read:</h4>
            <div className="bg-white p-4 rounded border text-lg leading-relaxed">
              {assessment.content.text}
            </div>
          </div>
        )}

        {/* Conversation Prompts */}
        {assessment.content.conversationPrompts && assessment.content.conversationPrompts.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Questions to Answer:</h4>
            <div className="space-y-3">
              {assessment.content.conversationPrompts.map((prompt, index) => (
                <div key={index} className="bg-white p-4 rounded border">
                  <p className="font-medium text-gray-900">{prompt.question}</p>
                  {prompt.expectedResponse && (
                    <p className="text-sm text-gray-600 mt-1">
                      Expected response length: {prompt.expectedResponse}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Prompts */}
        {assessment.content.imagePrompts && assessment.content.imagePrompts.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Describe the Image:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessment.content.imagePrompts.map((prompt, index) => (
                <div key={index} className="bg-white p-4 rounded border">
                  <img 
                    src={prompt.url} 
                    alt={prompt.description}
                    className="w-full h-48 object-cover rounded mb-2"
                  />
                  <p className="text-sm text-gray-600">{prompt.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Role Play Scenarios */}
        {assessment.content.rolePlayScenarios && assessment.content.rolePlayScenarios.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Role Play Scenario:</h4>
            {assessment.content.rolePlayScenarios.map((scenario, index) => (
              <div key={index} className="bg-white p-4 rounded border">
                <h5 className="font-medium text-gray-900 mb-2">{scenario.scenario}</h5>
                <p className="text-gray-700 mb-2"><strong>Your Role:</strong> {scenario.role}</p>
                <p className="text-gray-700 mb-2"><strong>Context:</strong> {scenario.context}</p>
                {scenario.objectives && scenario.objectives.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Objectives:</p>
                    <ul className="list-disc list-inside text-gray-600 text-sm">
                      {scenario.objectives.map((objective, objIndex) => (
                        <li key={objIndex}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Assessment Results</h3>
        
        {/* Overall Score */}
        <div className="text-center mb-6">
          <div className="inline-block bg-blue-100 rounded-lg p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {results.scores.overall.score}%
            </div>
            <div className="text-blue-800 font-medium">
              Grade: {results.scores.overall.grade}
            </div>
          </div>
        </div>

        {/* Detailed Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {Object.entries(results.scores).map(([category, score]) => {
            if (category === 'overall') return null;
            
            return (
              <div key={category} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 capitalize mb-2">
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </h4>
                <div className="text-2xl font-bold text-gray-700 mb-1">
                  {score.score}%
                </div>
                <p className="text-sm text-gray-600">{score.feedback}</p>
              </div>
            );
          })}
        </div>

        {/* Improvements */}
        {results.improvements && results.improvements.length > 0 && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-3">Suggestions for Improvement</h4>
            <ul className="space-y-2">
              {results.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start">
                  <span className={`inline-block w-2 h-2 rounded-full mt-2 mr-3 ${
                    improvement.priority === 'high' ? 'bg-red-500' :
                    improvement.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></span>
                  <span className="text-yellow-800">{improvement.suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={() => navigate('/assessments')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Assessments
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Take Again
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <i className="fas fa-exclamation-triangle text-4xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Assessment Not Found</h3>
          <p className="text-gray-600">The assessment you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
              <p className="text-gray-600">{assessment.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {assessment.language} • {assessment.level}
              </div>
              <div className="text-sm text-gray-600">
                Type: {assessment.type.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Phase Indicator */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">{getPhaseTitle()}</h2>
              <p className="text-gray-600">{getPhaseDescription()}</p>
            </div>
            
            {(currentPhase === 'preparation' || currentPhase === 'recording') && (
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  timeRemaining <= 30 ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {formatTime(timeRemaining)}
                </div>
                <div className="text-sm text-gray-600">
                  {currentPhase === 'preparation' ? 'Preparation' : 'Recording'} Time
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assessment Content */}
        {currentPhase !== 'completed' && renderAssessmentContent()}

        {/* Recording Interface */}
        {currentPhase === 'recording' && (
          <div className="mb-6">
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              language={assessment.language}
              maxDuration={assessment.settings.timeLimit}
              showTranscription={true}
              showWaveform={true}
              autoStart={true}
            />
          </div>
        )}

        {/* Start Button */}
        {currentPhase === 'initial' && (
          <div className="text-center">
            <button
              onClick={startPreparation}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg"
            >
              Start Assessment
            </button>
          </div>
        )}

        {/* Results */}
        {currentPhase === 'completed' && (
          <div>
            {submitting ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Processing your assessment...</p>
              </div>
            ) : results ? (
              renderResults()
            ) : (
              <div className="text-center py-12">
                <div className="text-green-600 mb-4">
                  <i className="fas fa-check-circle text-4xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Assessment Submitted</h3>
                <p className="text-gray-600">Your assessment has been submitted successfully.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceAssessmentInterface;
