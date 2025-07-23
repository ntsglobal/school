import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import lessonService from '../services/lessonService';

const LessonViewer = () => {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [lesson, setLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (lessonId) {
      fetchLesson();
      fetchProgress();
    }
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const response = await lessonService.getLessonById(lessonId);
      if (response.success) {
        setLesson(response.data.lesson);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await lessonService.getLessonProgress(lessonId);
      if (response.success) {
        setProgress(response.data.progress);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitQuiz = async () => {
    try {
      const quizAnswers = lesson.quiz.questions.map(question => ({
        questionId: question._id,
        answer: answers[question._id],
        isCorrect: answers[question._id] === question.correctAnswer
      }));

      const response = await lessonService.submitQuiz(lessonId, quizAnswers, 0);
      
      if (response.success) {
        setShowResults(true);
        await fetchProgress(); // Refresh progress
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCompleteActivity = async (activityType) => {
    try {
      const response = await lessonService.completeLessonActivity(lessonId, {
        activityType,
        score: 100,
        timeSpent: 5
      });
      
      if (response.success) {
        await fetchProgress(); // Refresh progress
      }
    } catch (err) {
      console.error('Failed to complete activity:', err);
    }
  };

  const navigateToLesson = (direction) => {
    if (direction === 'next' && lesson.navigation.nextLesson) {
      navigate(`/lessons/${lesson.navigation.nextLesson.id}`);
    } else if (direction === 'previous' && lesson.navigation.previousLesson) {
      navigate(`/lessons/${lesson.navigation.previousLesson.id}`);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      video: '🎥',
      interactive: '🎮',
      quiz: '📝',
      speaking: '🎤',
      listening: '👂',
      reading: '📖',
      writing: '✍️'
    };
    return icons[type] || '📚';
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Lesson</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Lesson Not Found</h3>
          <p className="text-gray-600">The lesson you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div>
                <h1 className="text-lg font-medium text-gray-900">{lesson.title}</h1>
                <p className="text-sm text-gray-500">
                  {lesson.courseId?.title} • Lesson {lesson.order}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Progress indicator */}
              {progress && (
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.completionPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.round(progress.completionPercentage)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Lesson Content */}
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-2">{getActivityIcon(lesson.type)}</span>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{lesson.title}</h2>
                    <p className="text-gray-600">{lesson.description}</p>
                  </div>
                </div>

                {/* Video Content */}
                {lesson.type === 'video' && lesson.content.videoUrl && (
                  <div className="mb-6">
                    <video
                      controls
                      className="w-full rounded-lg"
                      poster={lesson.content.videoThumbnail}
                      onEnded={() => handleCompleteActivity('video')}
                    >
                      <source src={lesson.content.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                {/* Text Content */}
                {lesson.content.textContent && (
                  <div className="mb-6 prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: lesson.content.textContent }} />
                  </div>
                )}

                {/* Interactive Content */}
                {lesson.type === 'interactive' && lesson.content.interactiveContent && (
                  <div className="mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">Interactive Exercise</h3>
                      <p className="text-blue-700">Interactive content would be rendered here</p>
                      <button
                        onClick={() => handleCompleteActivity('interactive')}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Complete Exercise
                      </button>
                    </div>
                  </div>
                )}

                {/* Quiz */}
                {lesson.type === 'quiz' && lesson.quiz.questions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quiz</h3>
                    
                    {!showResults ? (
                      <div className="space-y-6">
                        {lesson.quiz.questions.map((question, index) => (
                          <div key={question._id} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-3">
                              {index + 1}. {question.question}
                            </h4>
                            
                            {question.type === 'multiple-choice' && (
                              <div className="space-y-2">
                                {question.options.map((option, optionIndex) => (
                                  <label key={optionIndex} className="flex items-center">
                                    <input
                                      type="radio"
                                      name={`question-${question._id}`}
                                      value={option}
                                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                      className="mr-2"
                                    />
                                    <span>{option}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                            
                            {question.type === 'true-false' && (
                              <div className="space-y-2">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`question-${question._id}`}
                                    value="true"
                                    onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                    className="mr-2"
                                  />
                                  <span>True</span>
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`question-${question._id}`}
                                    value="false"
                                    onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                    className="mr-2"
                                  />
                                  <span>False</span>
                                </label>
                              </div>
                            )}
                            
                            {question.type === 'fill-blank' && (
                              <input
                                type="text"
                                placeholder="Enter your answer"
                                onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            )}
                          </div>
                        ))}
                        
                        <button
                          onClick={handleSubmitQuiz}
                          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Submit Quiz
                        </button>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-2">Quiz Completed!</h4>
                        <p className="text-green-700">
                          Your results have been saved. You can review your answers in the progress section.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Vocabulary */}
                {lesson.vocabulary && lesson.vocabulary.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Vocabulary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {lesson.vocabulary.map((word, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{word.word}</h4>
                            {word.audioUrl && (
                              <button className="text-blue-600 hover:text-blue-700">
                                <i className="fas fa-volume-up"></i>
                              </button>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm">{word.translation}</p>
                          {word.example && (
                            <p className="text-gray-500 text-xs mt-1 italic">{word.example}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Lesson Navigation</h3>
              
              {/* Previous/Next Buttons */}
              <div className="space-y-3 mb-6">
                {lesson.navigation.previousLesson && (
                  <button
                    onClick={() => navigateToLesson('previous')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <i className="fas fa-chevron-left mr-2 text-gray-400"></i>
                      <span className="text-sm text-gray-600">Previous</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Lesson {lesson.navigation.previousLesson.order}
                    </span>
                  </button>
                )}
                
                {lesson.navigation.nextLesson && (
                  <button
                    onClick={() => navigateToLesson('next')}
                    className="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-sm text-blue-600">Next</span>
                      <i className="fas fa-chevron-right ml-2 text-blue-400"></i>
                    </div>
                    <span className="text-xs text-blue-500">
                      Lesson {lesson.navigation.nextLesson.order}
                    </span>
                  </button>
                )}
              </div>

              {/* Lesson Info */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{lesson.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{lesson.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="font-medium capitalize">{lesson.difficulty}</span>
                </div>
                {progress && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Progress:</span>
                    <span className="font-medium">{Math.round(progress.completionPercentage)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;
