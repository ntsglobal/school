import { validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/audio';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `audio-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm', 'audio/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio file type'), false);
    }
  }
});

// Analyze pronunciation from text comparison
export const analyzePronunciation = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { originalText, spokenText, language = 'en-US' } = req.body;

    // Basic pronunciation analysis (can be enhanced with AI services)
    const analysis = performPronunciationAnalysis(originalText, spokenText, language);

    res.json({
      success: true,
      data: {
        analysis,
        originalText,
        spokenText,
        language
      }
    });

  } catch (error) {
    console.error('Pronunciation analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during pronunciation analysis'
    });
  }
};

// Process audio file for pronunciation analysis
export const processAudioFile = async (req, res) => {
  try {
    const { originalText, language = 'en-US' } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    // In a real implementation, you would:
    // 1. Convert audio to text using speech recognition service
    // 2. Analyze pronunciation accuracy
    // 3. Generate detailed feedback

    // For now, we'll simulate the process
    const audioFilePath = req.file.path;
    const simulatedTranscription = await simulateAudioTranscription(audioFilePath, language);
    
    const analysis = performPronunciationAnalysis(originalText, simulatedTranscription, language);

    // Clean up uploaded file
    fs.unlink(audioFilePath, (err) => {
      if (err) console.error('Error deleting audio file:', err);
    });

    res.json({
      success: true,
      data: {
        transcription: simulatedTranscription,
        analysis,
        originalText,
        language,
        audioProcessed: true
      }
    });

  } catch (error) {
    console.error('Audio processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during audio processing'
    });
  }
};

// Get pronunciation exercises for a specific language/level
export const getPronunciationExercises = async (req, res) => {
  try {
    const { language, level = 'beginner', category = 'general' } = req.query;

    const exercises = generatePronunciationExercises(language, level, category);

    res.json({
      success: true,
      data: {
        exercises,
        language,
        level,
        category
      }
    });

  } catch (error) {
    console.error('Get pronunciation exercises error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Save pronunciation assessment results
export const savePronunciationAssessment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const { 
      exerciseId, 
      originalText, 
      spokenText, 
      pronunciationScore, 
      detailedAnalysis,
      language,
      duration 
    } = req.body;

    // Check permissions
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // In a real implementation, save to database
    const assessmentResult = {
      userId,
      exerciseId,
      originalText,
      spokenText,
      pronunciationScore,
      detailedAnalysis,
      language,
      duration,
      timestamp: new Date(),
      improvements: generateImprovementSuggestions(detailedAnalysis)
    };

    res.json({
      success: true,
      message: 'Pronunciation assessment saved successfully',
      data: { assessment: assessmentResult }
    });

  } catch (error) {
    console.error('Save pronunciation assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user's pronunciation progress
export const getPronunciationProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const { language, timeframe = '30d' } = req.query;

    // Check permissions
    if (userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Simulate pronunciation progress data
    const progress = generatePronunciationProgress(userId, language, timeframe);

    res.json({
      success: true,
      data: { progress }
    });

  } catch (error) {
    console.error('Get pronunciation progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to perform pronunciation analysis
function performPronunciationAnalysis(originalText, spokenText, language) {
  const original = originalText.toLowerCase().trim();
  const spoken = spokenText.toLowerCase().trim();

  // Calculate similarity score
  const similarity = calculateTextSimilarity(original, spoken);
  
  // Analyze word-by-word
  const originalWords = original.split(/\s+/);
  const spokenWords = spoken.split(/\s+/);
  
  const wordAnalysis = [];
  const maxLength = Math.max(originalWords.length, spokenWords.length);
  
  for (let i = 0; i < maxLength; i++) {
    const originalWord = originalWords[i] || '';
    const spokenWord = spokenWords[i] || '';
    
    wordAnalysis.push({
      original: originalWord,
      spoken: spokenWord,
      accuracy: calculateWordAccuracy(originalWord, spokenWord),
      feedback: generateWordFeedback(originalWord, spokenWord)
    });
  }

  // Calculate overall score
  const overallScore = Math.round(similarity * 100);
  
  return {
    overallScore,
    similarity,
    wordAnalysis,
    feedback: generateOverallFeedback(overallScore),
    suggestions: generateImprovementSuggestions(wordAnalysis),
    phonemeAnalysis: analyzePhonemes(originalText, spokenText, language)
  };
}

// Calculate text similarity using Levenshtein distance
function calculateTextSimilarity(text1, text2) {
  const matrix = [];
  const len1 = text1.length;
  const len2 = text2.length;

  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (text2.charAt(i - 1) === text1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const maxLength = Math.max(len1, len2);
  return maxLength === 0 ? 1 : (maxLength - matrix[len2][len1]) / maxLength;
}

// Calculate word-level accuracy
function calculateWordAccuracy(original, spoken) {
  if (!original && !spoken) return 1;
  if (!original || !spoken) return 0;
  
  return calculateTextSimilarity(original, spoken);
}

// Generate word-level feedback
function generateWordFeedback(original, spoken) {
  if (!original && !spoken) return 'Perfect';
  if (!spoken) return 'Word not spoken';
  if (!original) return 'Extra word';
  
  const accuracy = calculateWordAccuracy(original, spoken);
  
  if (accuracy >= 0.9) return 'Excellent';
  if (accuracy >= 0.7) return 'Good';
  if (accuracy >= 0.5) return 'Needs improvement';
  return 'Try again';
}

// Generate overall feedback
function generateOverallFeedback(score) {
  if (score >= 90) return 'Excellent pronunciation! Keep up the great work.';
  if (score >= 80) return 'Very good pronunciation with minor areas for improvement.';
  if (score >= 70) return 'Good pronunciation, but some words need more practice.';
  if (score >= 60) return 'Fair pronunciation. Focus on clarity and accuracy.';
  return 'Pronunciation needs significant improvement. Keep practicing!';
}

// Generate improvement suggestions
function generateImprovementSuggestions(analysis) {
  const suggestions = [];
  
  if (Array.isArray(analysis)) {
    // Word analysis
    const poorWords = analysis.filter(word => word.accuracy < 0.7);
    if (poorWords.length > 0) {
      suggestions.push(`Focus on pronouncing these words more clearly: ${poorWords.map(w => w.original).join(', ')}`);
    }
  }
  
  suggestions.push('Practice speaking slowly and clearly');
  suggestions.push('Record yourself and compare with native speakers');
  suggestions.push('Use the pronunciation exercises regularly');
  
  return suggestions;
}

// Analyze phonemes (simplified)
function analyzePhonemes(originalText, spokenText, language) {
  // This is a simplified phoneme analysis
  // In a real implementation, you would use phonetic analysis libraries
  
  return {
    language,
    phonemeAccuracy: Math.random() * 0.3 + 0.7, // Simulated
    difficultPhonemes: ['th', 'r', 'l'], // Common difficult phonemes
    recommendations: [
      'Practice tongue placement for "th" sounds',
      'Work on rolling "r" sounds',
      'Distinguish between "l" and "r" sounds'
    ]
  };
}

// Simulate audio transcription (placeholder)
async function simulateAudioTranscription(audioFilePath, language) {
  // In a real implementation, this would use a speech-to-text service
  // For now, return a simulated transcription
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
  
  const sampleTranscriptions = [
    'Hello, how are you today?',
    'I am learning a new language.',
    'The weather is beautiful today.',
    'Thank you for your help.',
    'I would like to order some food.'
  ];
  
  return sampleTranscriptions[Math.floor(Math.random() * sampleTranscriptions.length)];
}

// Generate pronunciation exercises
function generatePronunciationExercises(language, level, category) {
  const exercises = {
    'en-US': {
      beginner: [
        { id: 1, text: 'Hello, my name is John.', phonetic: '/həˈloʊ, maɪ neɪm ɪz ʤɑn/', difficulty: 'easy' },
        { id: 2, text: 'How are you today?', phonetic: '/haʊ ɑr ju təˈdeɪ/', difficulty: 'easy' },
        { id: 3, text: 'Thank you very much.', phonetic: '/θæŋk ju ˈvɛri mʌʧ/', difficulty: 'medium' }
      ],
      intermediate: [
        { id: 4, text: 'The weather is beautiful today.', phonetic: '/ðə ˈwɛðər ɪz ˈbjutəfəl təˈdeɪ/', difficulty: 'medium' },
        { id: 5, text: 'I would like to make a reservation.', phonetic: '/aɪ wʊd laɪk tu meɪk ə ˌrɛzərˈveɪʃən/', difficulty: 'hard' }
      ]
    },
    'fr-FR': {
      beginner: [
        { id: 6, text: 'Bonjour, comment allez-vous?', phonetic: '/bonˈʒuʁ, kɔmɑ̃ talˈe vu/', difficulty: 'easy' },
        { id: 7, text: 'Je suis étudiant.', phonetic: '/ʒə sɥi zetyˈdjɑ̃/', difficulty: 'medium' }
      ]
    }
  };

  return exercises[language]?.[level] || [];
}

// Generate pronunciation progress data
function generatePronunciationProgress(userId, language, timeframe) {
  return {
    overallScore: Math.round(Math.random() * 30 + 70), // 70-100
    improvement: Math.round(Math.random() * 20 + 5), // 5-25% improvement
    exercisesCompleted: Math.round(Math.random() * 50 + 10),
    totalPracticeTime: Math.round(Math.random() * 300 + 60), // minutes
    weakAreas: ['th sounds', 'r pronunciation', 'vowel clarity'],
    strongAreas: ['consonant clusters', 'intonation', 'rhythm'],
    dailyScores: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      score: Math.round(Math.random() * 40 + 60)
    }))
  };
}

// Voice Assessment Functions
import { VoiceAssessment, VoiceAssessmentAttempt } from '../models/VoiceAssessment.js';

// Create voice assessment
export const createVoiceAssessment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const assessmentData = {
      ...req.body,
      createdBy: req.user.id
    };

    const assessment = await VoiceAssessment.create(assessmentData);

    res.status(201).json({
      success: true,
      message: 'Voice assessment created successfully',
      data: { assessment }
    });

  } catch (error) {
    console.error('Create voice assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get voice assessments
export const getVoiceAssessments = async (req, res) => {
  try {
    const { language, level, type, courseId } = req.query;

    const query = { isActive: true };
    if (language) query.language = language;
    if (level) query.level = level;
    if (type) query.type = type;
    if (courseId) query.courseId = courseId;

    const assessments = await VoiceAssessment.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { assessments }
    });

  } catch (error) {
    console.error('Get voice assessments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get voice assessment by ID
export const getVoiceAssessmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await VoiceAssessment.findById(id)
      .populate('createdBy', 'firstName lastName')
      .populate('courseId', 'title')
      .populate('lessonId', 'title');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Voice assessment not found'
      });
    }

    res.json({
      success: true,
      data: { assessment }
    });

  } catch (error) {
    console.error('Get voice assessment by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Submit voice assessment attempt
export const submitVoiceAssessmentAttempt = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { transcription, deviceInfo, networkInfo } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Audio file is required'
      });
    }

    const assessment = await VoiceAssessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    // Check if user has exceeded max attempts
    const existingAttempts = await VoiceAssessmentAttempt.countDocuments({
      assessmentId,
      userId: req.user.id
    });

    if (existingAttempts >= assessment.settings.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts exceeded'
      });
    }

    // Create attempt record
    const attemptData = {
      assessmentId,
      userId: req.user.id,
      attemptNumber: existingAttempts + 1,
      audioFile: {
        url: req.file.path,
        filename: req.file.filename,
        duration: 0, // Would be calculated from audio file
        fileSize: req.file.size,
        format: req.file.mimetype
      },
      transcription: {
        automatic: transcription || '',
        confidence: 0.8 // Simulated
      },
      deviceInfo,
      networkInfo,
      startedAt: new Date()
    };

    const attempt = await VoiceAssessmentAttempt.create(attemptData);

    // Process assessment (in a real implementation, this would be async)
    const scores = await processVoiceAssessment(attempt, assessment);

    attempt.scores = scores;
    attempt.status = 'completed';
    attempt.completedAt = new Date();
    await attempt.save();

    res.json({
      success: true,
      message: 'Voice assessment submitted successfully',
      data: { attempt }
    });

  } catch (error) {
    console.error('Submit voice assessment attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user's assessment attempts
export const getUserAssessmentAttempts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { assessmentId } = req.query;

    // Check permissions
    if (userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const attempts = await VoiceAssessmentAttempt.getUserAttempts(userId, assessmentId);

    res.json({
      success: true,
      data: { attempts }
    });

  } catch (error) {
    console.error('Get user assessment attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Process voice assessment (helper function)
async function processVoiceAssessment(attempt, assessment) {
  // This is a simplified scoring system
  // In a real implementation, this would use AI/ML models

  const baseScore = Math.random() * 30 + 70; // 70-100 range

  return {
    pronunciation: {
      score: Math.round(baseScore + Math.random() * 10 - 5),
      feedback: 'Good pronunciation with minor areas for improvement',
      details: {
        accuracy: Math.random() * 0.3 + 0.7,
        clarity: Math.random() * 0.3 + 0.7,
        naturalness: Math.random() * 0.3 + 0.7,
        wordErrors: [],
        phonemeErrors: []
      }
    },
    fluency: {
      score: Math.round(baseScore + Math.random() * 10 - 5),
      feedback: 'Natural speaking pace with good rhythm',
      details: {
        speakingRate: Math.round(Math.random() * 50 + 120), // 120-170 WPM
        pauseFrequency: Math.random() * 5,
        hesitations: Math.round(Math.random() * 3),
        repetitions: Math.round(Math.random() * 2),
        fillers: Math.round(Math.random() * 2)
      }
    },
    vocabulary: {
      score: Math.round(baseScore + Math.random() * 10 - 5),
      feedback: 'Appropriate vocabulary usage for the level',
      details: {
        range: Math.random() * 0.3 + 0.7,
        accuracy: Math.random() * 0.3 + 0.7,
        appropriateness: Math.random() * 0.3 + 0.7,
        complexity: Math.random() * 0.3 + 0.6
      }
    },
    grammar: {
      score: Math.round(baseScore + Math.random() * 10 - 5),
      feedback: 'Generally accurate grammar with minor errors',
      details: {
        accuracy: Math.random() * 0.3 + 0.7,
        complexity: Math.random() * 0.3 + 0.6,
        errors: []
      }
    },
    coherence: {
      score: Math.round(baseScore + Math.random() * 10 - 5),
      feedback: 'Well-organized response with clear structure',
      details: {
        organization: Math.random() * 0.3 + 0.7,
        connectivity: Math.random() * 0.3 + 0.7,
        relevance: Math.random() * 0.3 + 0.8
      }
    }
  };
}

// Export multer upload middleware
export const uploadAudio = upload.single('audio');
