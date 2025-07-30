import apiService from './api.js';

class PronunciationService {
  constructor() {
    this.phoneticMaps = this.initializePhoneticMaps();
    this.commonErrors = this.initializeCommonErrors();
    this.difficultyPatterns = this.initializeDifficultyPatterns();
  }

  // Initialize phonetic mapping for different languages
  initializePhoneticMaps() {
    return {
      'en-US': {
        'a': ['æ', 'eɪ', 'ɑ', 'ə'],
        'e': ['ɛ', 'i', 'ə'],
        'i': ['ɪ', 'aɪ', 'i'],
        'o': ['ɑ', 'oʊ', 'ɔ'],
        'u': ['ʌ', 'u', 'ʊ'],
        'th': ['θ', 'ð'],
        'r': ['r', 'ɹ'],
        'l': ['l', 'ɫ']
      },
      'fr-FR': {
        'u': ['y'],
        'ou': ['u'],
        'r': ['ʁ'],
        'j': ['ʒ'],
        'ch': ['ʃ'],
        'gn': ['ɲ']
      },
      'de-DE': {
        'ü': ['y'],
        'ö': ['ø'],
        'ä': ['ɛ'],
        'ch': ['x', 'ç'],
        'r': ['ʁ', 'r']
      },
      'es-ES': {
        'rr': ['r'],
        'j': ['x'],
        'll': ['ʎ', 'j'],
        'ñ': ['ɲ']
      }
    };
  }

  // Initialize common pronunciation errors by language
  initializeCommonErrors() {
    return {
      'en-US': {
        'th_sounds': {
          pattern: /th/g,
          common_mistakes: ['f', 'v', 's', 'z'],
          feedback: 'Place your tongue between your teeth for "th" sounds'
        },
        'r_sounds': {
          pattern: /r/g,
          common_mistakes: ['l', 'w'],
          feedback: 'Curl your tongue back without touching the roof of your mouth'
        },
        'vowel_length': {
          pattern: /[aeiou]/g,
          feedback: 'Pay attention to vowel length - some vowels are longer than others'
        }
      },
      'fr-FR': {
        'r_sounds': {
          pattern: /r/g,
          common_mistakes: ['english_r'],
          feedback: 'Use a guttural "r" sound from the back of your throat'
        },
        'nasal_vowels': {
          pattern: /[aeiou]n/g,
          feedback: 'Nasalize vowels before "n" sounds'
        }
      }
    };
  }

  // Initialize difficulty patterns
  initializeDifficultyPatterns() {
    return {
      'en-US': {
        easy: ['cat', 'dog', 'run', 'big', 'yes', 'no'],
        medium: ['think', 'world', 'right', 'through', 'beautiful'],
        hard: ['thoroughly', 'rhythm', 'sixth', 'clothes', 'squirrel']
      },
      'fr-FR': {
        easy: ['chat', 'chien', 'oui', 'non', 'eau'],
        medium: ['français', 'bonjour', 'merci', 'comment'],
        hard: ['grenouille', 'écureuil', 'serrurerie']
      }
    };
  }

  // Analyze pronunciation accuracy
  async analyzePronunciation(originalText, spokenText, language = 'en-US') {
    try {
      const response = await apiService.post('/speech/analyze-pronunciation', {
        originalText,
        spokenText,
        language
      });

      if (response.success) {
        // Enhance server analysis with client-side analysis
        const enhancedAnalysis = this.enhanceAnalysis(response.data.analysis, originalText, spokenText, language);
        return {
          ...response.data,
          analysis: enhancedAnalysis
        };
      }

      return response;
    } catch (error) {
      console.error('Pronunciation analysis error:', error);
      // Fallback to client-side analysis
      return this.performClientSideAnalysis(originalText, spokenText, language);
    }
  }

  // Perform client-side pronunciation analysis
  performClientSideAnalysis(originalText, spokenText, language) {
    const analysis = {
      overallScore: this.calculateOverallScore(originalText, spokenText),
      wordAnalysis: this.analyzeWords(originalText, spokenText),
      phonemeAnalysis: this.analyzePhonemes(originalText, spokenText, language),
      fluencyAnalysis: this.analyzeFluency(originalText, spokenText),
      commonErrors: this.identifyCommonErrors(originalText, spokenText, language),
      improvements: []
    };

    analysis.improvements = this.generateImprovements(analysis, language);

    return {
      success: true,
      data: {
        analysis,
        originalText,
        spokenText,
        language
      }
    };
  }

  // Enhance server analysis with additional client-side insights
  enhanceAnalysis(serverAnalysis, originalText, spokenText, language) {
    return {
      ...serverAnalysis,
      fluencyAnalysis: this.analyzeFluency(originalText, spokenText),
      detailedPhonemes: this.analyzeDetailedPhonemes(originalText, spokenText, language),
      prosodyAnalysis: this.analyzeProsody(originalText, spokenText),
      confidenceMetrics: this.calculateConfidenceMetrics(serverAnalysis)
    };
  }

  // Calculate overall pronunciation score
  calculateOverallScore(originalText, spokenText) {
    const similarity = this.calculateTextSimilarity(originalText.toLowerCase(), spokenText.toLowerCase());
    const lengthPenalty = this.calculateLengthPenalty(originalText, spokenText);
    const wordAccuracy = this.calculateWordAccuracy(originalText, spokenText);
    
    const score = (similarity * 0.4 + wordAccuracy * 0.4 + (1 - lengthPenalty) * 0.2) * 100;
    return Math.round(Math.max(0, Math.min(100, score)));
  }

  // Calculate text similarity using Levenshtein distance
  calculateTextSimilarity(text1, text2) {
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

  // Calculate length penalty
  calculateLengthPenalty(originalText, spokenText) {
    const originalLength = originalText.split(/\s+/).length;
    const spokenLength = spokenText.split(/\s+/).length;
    const lengthDiff = Math.abs(originalLength - spokenLength);
    
    return Math.min(0.5, lengthDiff / Math.max(originalLength, spokenLength));
  }

  // Calculate word-level accuracy
  calculateWordAccuracy(originalText, spokenText) {
    const originalWords = originalText.toLowerCase().split(/\s+/);
    const spokenWords = spokenText.toLowerCase().split(/\s+/);
    
    let correctWords = 0;
    const maxLength = Math.max(originalWords.length, spokenWords.length);
    
    for (let i = 0; i < maxLength; i++) {
      const originalWord = originalWords[i] || '';
      const spokenWord = spokenWords[i] || '';
      
      if (originalWord && spokenWord) {
        const wordSimilarity = this.calculateTextSimilarity(originalWord, spokenWord);
        if (wordSimilarity >= 0.8) {
          correctWords++;
        }
      }
    }
    
    return maxLength > 0 ? correctWords / maxLength : 0;
  }

  // Analyze individual words
  analyzeWords(originalText, spokenText) {
    const originalWords = originalText.toLowerCase().split(/\s+/);
    const spokenWords = spokenText.toLowerCase().split(/\s+/);
    const maxLength = Math.max(originalWords.length, spokenWords.length);
    
    const wordAnalysis = [];
    
    for (let i = 0; i < maxLength; i++) {
      const originalWord = originalWords[i] || '';
      const spokenWord = spokenWords[i] || '';
      
      const accuracy = this.calculateTextSimilarity(originalWord, spokenWord);
      const feedback = this.generateWordFeedback(originalWord, spokenWord, accuracy);
      
      wordAnalysis.push({
        index: i,
        original: originalWord,
        spoken: spokenWord,
        accuracy: Math.round(accuracy * 100),
        feedback,
        difficulty: this.getWordDifficulty(originalWord),
        phonemes: this.getWordPhonemes(originalWord)
      });
    }
    
    return wordAnalysis;
  }

  // Analyze phonemes
  analyzePhonemes(originalText, spokenText, language) {
    const langCode = language.split('-')[0];
    const phoneticMap = this.phoneticMaps[language] || this.phoneticMaps[langCode] || {};
    
    const analysis = {
      language,
      accuracy: Math.random() * 0.3 + 0.7, // Simulated for now
      difficultPhonemes: this.getDifficultPhonemes(originalText, language),
      recommendations: this.getPhonemeRecommendations(originalText, language)
    };
    
    return analysis;
  }

  // Analyze detailed phonemes
  analyzeDetailedPhonemes(originalText, spokenText, language) {
    const words = originalText.toLowerCase().split(/\s+/);
    
    return words.map(word => ({
      word,
      phonemes: this.getWordPhonemes(word, language),
      difficulty: this.getWordDifficulty(word, language),
      commonErrors: this.getWordCommonErrors(word, language)
    }));
  }

  // Analyze fluency
  analyzeFluency(originalText, spokenText) {
    const originalWords = originalText.split(/\s+/);
    const spokenWords = spokenText.split(/\s+/);
    
    return {
      wordRate: spokenWords.length, // Words per recording (simplified)
      hesitations: this.detectHesitations(spokenText),
      repetitions: this.detectRepetitions(spokenWords),
      fillers: this.detectFillers(spokenText),
      naturalness: this.calculateNaturalness(originalText, spokenText)
    };
  }

  // Analyze prosody (rhythm, stress, intonation)
  analyzeProsody(originalText, spokenText) {
    return {
      rhythm: Math.random() * 0.4 + 0.6, // Simulated
      stress: Math.random() * 0.4 + 0.6, // Simulated
      intonation: Math.random() * 0.4 + 0.6, // Simulated
      feedback: 'Work on natural rhythm and word stress patterns'
    };
  }

  // Identify common pronunciation errors
  identifyCommonErrors(originalText, spokenText, language) {
    const langCode = language.split('-')[0];
    const errorPatterns = this.commonErrors[language] || this.commonErrors[langCode] || {};
    
    const errors = [];
    
    Object.entries(errorPatterns).forEach(([errorType, pattern]) => {
      if (pattern.pattern && originalText.match(pattern.pattern)) {
        errors.push({
          type: errorType,
          description: pattern.feedback,
          examples: this.findErrorExamples(originalText, pattern.pattern),
          severity: this.calculateErrorSeverity(errorType)
        });
      }
    });
    
    return errors;
  }

  // Generate improvement suggestions
  generateImprovements(analysis, language) {
    const improvements = [];
    
    if (analysis.overallScore < 70) {
      improvements.push({
        type: 'overall',
        priority: 'high',
        suggestion: 'Focus on speaking more slowly and clearly',
        exercises: ['slow_speech', 'word_by_word']
      });
    }
    
    if (analysis.wordAnalysis) {
      const poorWords = analysis.wordAnalysis.filter(word => word.accuracy < 60);
      if (poorWords.length > 0) {
        improvements.push({
          type: 'word_accuracy',
          priority: 'medium',
          suggestion: `Practice these specific words: ${poorWords.map(w => w.original).join(', ')}`,
          exercises: ['word_practice', 'phoneme_drill']
        });
      }
    }
    
    if (analysis.commonErrors && analysis.commonErrors.length > 0) {
      analysis.commonErrors.forEach(error => {
        improvements.push({
          type: 'phoneme',
          priority: error.severity,
          suggestion: error.description,
          exercises: ['phoneme_practice', 'minimal_pairs']
        });
      });
    }
    
    return improvements;
  }

  // Helper methods
  generateWordFeedback(original, spoken, accuracy) {
    if (!original && !spoken) return 'Perfect';
    if (!spoken) return 'Word not spoken';
    if (!original) return 'Extra word';
    
    if (accuracy >= 0.9) return 'Excellent';
    if (accuracy >= 0.7) return 'Good';
    if (accuracy >= 0.5) return 'Needs improvement';
    return 'Try again';
  }

  getWordDifficulty(word, language = 'en-US') {
    const langCode = language.split('-')[0];
    const patterns = this.difficultyPatterns[language] || this.difficultyPatterns[langCode];
    
    if (!patterns) return 'medium';
    
    if (patterns.easy.includes(word.toLowerCase())) return 'easy';
    if (patterns.hard.includes(word.toLowerCase())) return 'hard';
    return 'medium';
  }

  getWordPhonemes(word, language = 'en-US') {
    // Simplified phoneme extraction
    // In a real implementation, this would use a phonetic dictionary
    return word.split('').map(char => char.toLowerCase());
  }

  getDifficultPhonemes(text, language) {
    const langCode = language.split('-')[0];
    const commonDifficult = {
      'en': ['θ', 'ð', 'r', 'l', 'w'],
      'fr': ['ʁ', 'y', 'ɲ', 'ʒ'],
      'de': ['x', 'ç', 'y', 'ø'],
      'es': ['r', 'x', 'ɲ']
    };
    
    return commonDifficult[langCode] || [];
  }

  getPhonemeRecommendations(text, language) {
    return [
      'Practice individual sounds slowly',
      'Use a mirror to check mouth position',
      'Listen to native speakers carefully',
      'Record yourself and compare'
    ];
  }

  getWordCommonErrors(word, language) {
    // Return common mispronunciations for specific words
    const errorMap = {
      'en-US': {
        'the': ['da', 'ze'],
        'think': ['fink', 'sink'],
        'world': ['word', 'worl']
      }
    };
    
    return errorMap[language]?.[word.toLowerCase()] || [];
  }

  detectHesitations(text) {
    const hesitationPatterns = /\b(uh|um|er|ah|hmm)\b/gi;
    const matches = text.match(hesitationPatterns);
    return matches ? matches.length : 0;
  }

  detectRepetitions(words) {
    let repetitions = 0;
    for (let i = 1; i < words.length; i++) {
      if (words[i].toLowerCase() === words[i-1].toLowerCase()) {
        repetitions++;
      }
    }
    return repetitions;
  }

  detectFillers(text) {
    const fillerPatterns = /\b(like|you know|actually|basically|literally)\b/gi;
    const matches = text.match(fillerPatterns);
    return matches ? matches.length : 0;
  }

  calculateNaturalness(originalText, spokenText) {
    // Simplified naturalness calculation
    const lengthSimilarity = 1 - Math.abs(originalText.length - spokenText.length) / Math.max(originalText.length, spokenText.length);
    return Math.max(0.3, lengthSimilarity);
  }

  findErrorExamples(text, pattern) {
    const matches = text.match(pattern);
    return matches ? matches.slice(0, 3) : [];
  }

  calculateErrorSeverity(errorType) {
    const severityMap = {
      'th_sounds': 'high',
      'r_sounds': 'medium',
      'vowel_length': 'low',
      'nasal_vowels': 'medium'
    };
    
    return severityMap[errorType] || 'medium';
  }

  calculateConfidenceMetrics(analysis) {
    return {
      overall: Math.random() * 0.3 + 0.7,
      phoneme: Math.random() * 0.3 + 0.6,
      fluency: Math.random() * 0.3 + 0.65,
      prosody: Math.random() * 0.3 + 0.6
    };
  }

  // Process audio file for pronunciation analysis
  async processAudioFile(audioFile, originalText, language = 'en-US') {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('originalText', originalText);
      formData.append('language', language);

      const response = await apiService.post('/speech/process-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response;
    } catch (error) {
      console.error('Audio processing error:', error);
      throw error;
    }
  }

  // Save pronunciation assessment
  async savePronunciationAssessment(userId, assessmentData) {
    try {
      const response = await apiService.post(`/speech/user/${userId}/assessment`, assessmentData);
      return response;
    } catch (error) {
      console.error('Save assessment error:', error);
      throw error;
    }
  }

  // Get pronunciation progress
  async getPronunciationProgress(userId, language, timeframe = '30d') {
    try {
      const response = await apiService.get(`/speech/user/${userId}/progress`, {
        params: { language, timeframe }
      });
      return response;
    } catch (error) {
      console.error('Get progress error:', error);
      throw error;
    }
  }

  // Get pronunciation exercises
  async getPronunciationExercises(language, level = 'beginner', category = 'general') {
    try {
      const response = await apiService.get('/speech/exercises', {
        params: { language, level, category }
      });
      return response;
    } catch (error) {
      console.error('Get exercises error:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const pronunciationService = new PronunciationService();
export default pronunciationService;
