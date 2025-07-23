import apiService from './api.js';

class TTSService {
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.voices = [];
    this.currentUtterance = null;
    this.isSupported = 'speechSynthesis' in window;
    this.voicesLoaded = false;
    
    this.initializeVoices();
  }

  // Initialize and load voices
  async initializeVoices() {
    if (!this.isSupported) return;

    // Load voices
    this.loadVoices();
    
    // Some browsers load voices asynchronously
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  // Load available voices
  loadVoices() {
    this.voices = this.synthesis.getVoices().map(voice => ({
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
      default: voice.default,
      voiceURI: voice.voiceURI,
      gender: this.detectGender(voice.name),
      quality: voice.localService ? 'high' : 'standard',
      voice: voice // Keep reference to original voice object
    }));
    
    this.voicesLoaded = true;
  }

  // Detect voice gender from name
  detectGender(voiceName) {
    const name = voiceName.toLowerCase();
    const femaleIndicators = ['female', 'woman', 'girl', 'samantha', 'victoria', 'karen', 'susan', 'alice', 'emma', 'sophia'];
    const maleIndicators = ['male', 'man', 'boy', 'alex', 'daniel', 'thomas', 'david', 'john', 'michael', 'william'];
    
    if (femaleIndicators.some(indicator => name.includes(indicator))) {
      return 'female';
    }
    if (maleIndicators.some(indicator => name.includes(indicator))) {
      return 'male';
    }
    
    return 'unknown';
  }

  // Get all available voices
  getVoices() {
    return this.voices;
  }

  // Get voices for specific language
  getVoicesForLanguage(language) {
    const langCode = language.split('-')[0];
    return this.voices.filter(voice => 
      voice.lang.toLowerCase().startsWith(langCode.toLowerCase())
    );
  }

  // Get recommended voice for language and preferences
  getRecommendedVoice(language, preferences = {}) {
    const languageVoices = this.getVoicesForLanguage(language);
    
    if (languageVoices.length === 0) {
      return null;
    }

    // Filter by gender if specified
    let filteredVoices = languageVoices;
    if (preferences.gender) {
      const genderVoices = languageVoices.filter(voice => voice.gender === preferences.gender);
      if (genderVoices.length > 0) {
        filteredVoices = genderVoices;
      }
    }

    // Filter by quality if specified
    if (preferences.quality === 'high') {
      const highQualityVoices = filteredVoices.filter(voice => voice.localService);
      if (highQualityVoices.length > 0) {
        filteredVoices = highQualityVoices;
      }
    }

    // Prefer default voice
    const defaultVoice = filteredVoices.find(voice => voice.default);
    if (defaultVoice) {
      return defaultVoice;
    }

    // Return first available voice
    return filteredVoices[0];
  }

  // Speak text with options
  speak(text, options = {}) {
    if (!this.isSupported) {
      throw new Error('Text-to-speech is not supported in this browser');
    }

    // Stop any current speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set basic properties
    utterance.lang = options.language || 'en-US';
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    // Set voice if specified
    if (options.voiceName) {
      const selectedVoice = this.voices.find(voice => voice.name === options.voiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice.voice;
      }
    } else if (options.language) {
      const recommendedVoice = this.getRecommendedVoice(options.language, options);
      if (recommendedVoice) {
        utterance.voice = recommendedVoice.voice;
      }
    }

    // Set event handlers
    utterance.onstart = () => {
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (event) => {
      console.error('TTS Error:', event.error);
      this.currentUtterance = null;
      if (options.onError) options.onError(event.error);
    };

    utterance.onpause = () => {
      if (options.onPause) options.onPause();
    };

    utterance.onresume = () => {
      if (options.onResume) options.onResume();
    };

    utterance.onboundary = (event) => {
      if (options.onBoundary) options.onBoundary(event);
    };

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);
    
    return utterance;
  }

  // Speak with automatic voice selection
  speakAuto(text, language, options = {}) {
    const recommendedVoice = this.getRecommendedVoice(language, options);
    
    return this.speak(text, {
      ...options,
      language,
      voiceName: recommendedVoice?.name
    });
  }

  // Speak slowly for pronunciation practice
  speakSlowly(text, language, options = {}) {
    return this.speakAuto(text, language, {
      ...options,
      rate: 0.7,
      pitch: 1.0
    });
  }

  // Speak word by word with pauses
  speakWordByWord(text, language, options = {}) {
    const words = text.split(/\s+/);
    let currentIndex = 0;
    const wordDelay = options.wordDelay || 1000;
    const highlightDelay = options.highlightDelay || 200;

    const speakNextWord = () => {
      if (currentIndex < words.length) {
        const word = words[currentIndex];
        
        // Highlight word if callback provided
        if (options.onWordStart) {
          setTimeout(() => options.onWordStart(word, currentIndex), highlightDelay);
        }
        
        this.speakAuto(word, language, {
          ...options,
          onEnd: () => {
            if (options.onWordEnd) {
              options.onWordEnd(word, currentIndex);
            }
            
            currentIndex++;
            if (currentIndex < words.length) {
              setTimeout(speakNextWord, wordDelay);
            } else if (options.onComplete) {
              options.onComplete();
            }
          }
        });
      }
    };

    speakNextWord();
  }

  // Speak with emphasis on specific words
  speakWithEmphasis(text, language, emphasizedWords = [], options = {}) {
    const words = text.split(/\s+/);
    let currentIndex = 0;

    const speakNextWord = () => {
      if (currentIndex < words.length) {
        const word = words[currentIndex];
        const isEmphasized = emphasizedWords.includes(word.toLowerCase());
        
        this.speakAuto(word, language, {
          ...options,
          rate: isEmphasized ? (options.rate || 1.0) * 0.8 : options.rate || 1.0,
          pitch: isEmphasized ? (options.pitch || 1.0) * 1.2 : options.pitch || 1.0,
          onEnd: () => {
            currentIndex++;
            if (currentIndex < words.length) {
              setTimeout(speakNextWord, isEmphasized ? 800 : 400);
            } else if (options.onComplete) {
              options.onComplete();
            }
          }
        });
      }
    };

    speakNextWord();
  }

  // Create listening exercise
  createListeningExercise(text, language, difficulty = 'normal') {
    const difficultySettings = {
      easy: { rate: 0.8, pitch: 1.0, repetitions: 2 },
      normal: { rate: 1.0, pitch: 1.0, repetitions: 1 },
      hard: { rate: 1.2, pitch: 1.0, repetitions: 1 }
    };

    const settings = difficultySettings[difficulty] || difficultySettings.normal;

    return {
      text,
      language,
      difficulty,
      settings,
      play: (options = {}) => {
        return this.speakAuto(text, language, {
          ...settings,
          ...options
        });
      },
      playSlowly: (options = {}) => {
        return this.speakAuto(text, language, {
          ...settings,
          rate: settings.rate * 0.7,
          ...options
        });
      },
      playWordByWord: (options = {}) => {
        return this.speakWordByWord(text, language, {
          ...settings,
          ...options
        });
      }
    };
  }

  // Generate pronunciation model
  generatePronunciationModel(text, language) {
    const words = text.split(/\s+/);
    
    return {
      text,
      language,
      words: words.map((word, index) => ({
        word,
        index,
        phonetic: this.getPhoneticTranscription(word, language),
        syllables: this.getSyllables(word),
        stress: this.getStressPattern(word),
        difficulty: this.getWordDifficulty(word, language)
      })),
      speak: (options = {}) => this.speakAuto(text, language, options),
      speakWord: (wordIndex, options = {}) => {
        if (words[wordIndex]) {
          return this.speakAuto(words[wordIndex], language, options);
        }
      }
    };
  }

  // Get phonetic transcription (simplified)
  getPhoneticTranscription(word, language) {
    // This would typically use a phonetic dictionary or API
    const phoneticMaps = {
      'en': {
        'hello': '/həˈloʊ/',
        'world': '/wɜrld/',
        'thank': '/θæŋk/',
        'you': '/ju/',
        'how': '/haʊ/',
        'are': '/ɑr/',
        'today': '/təˈdeɪ/',
        'beautiful': '/ˈbjutəfəl/',
        'language': '/ˈlæŋɡwɪdʒ/'
      },
      'fr': {
        'bonjour': '/bonˈʒuʁ/',
        'merci': '/mɛʁˈsi/',
        'comment': '/kɔmɑ̃/',
        'allez': '/aˈle/',
        'vous': '/vu/',
        'français': '/fʁɑ̃ˈsɛ/'
      }
    };

    const langCode = language.split('-')[0];
    return phoneticMaps[langCode]?.[word.toLowerCase()] || `/${word}/`;
  }

  // Get syllables (simplified)
  getSyllables(word) {
    const vowels = 'aeiouy';
    const syllables = [];
    let currentSyllable = '';
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i].toLowerCase();
      currentSyllable += char;
      
      if (vowels.includes(char)) {
        syllables.push(currentSyllable);
        currentSyllable = '';
      }
    }
    
    if (currentSyllable) {
      if (syllables.length > 0) {
        syllables[syllables.length - 1] += currentSyllable;
      } else {
        syllables.push(currentSyllable);
      }
    }
    
    return syllables.length > 0 ? syllables : [word];
  }

  // Get stress pattern
  getStressPattern(word) {
    const syllables = this.getSyllables(word);
    if (syllables.length === 1) return [1];
    if (syllables.length === 2) return [1, 0];
    return syllables.map((_, i) => i === 0 ? 1 : 0);
  }

  // Get word difficulty
  getWordDifficulty(word, language) {
    const syllableCount = this.getSyllables(word).length;
    const length = word.length;
    
    if (syllableCount === 1 && length <= 4) return 'easy';
    if (syllableCount <= 2 && length <= 7) return 'medium';
    return 'hard';
  }

  // Control methods
  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.currentUtterance = null;
  }

  pause() {
    if (this.synthesis) {
      this.synthesis.pause();
    }
  }

  resume() {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  // Status methods
  isSpeaking() {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  isPaused() {
    return this.synthesis ? this.synthesis.paused : false;
  }

  isPending() {
    return this.synthesis ? this.synthesis.pending : false;
  }

  // Get TTS capabilities
  getCapabilities() {
    return {
      isSupported: this.isSupported,
      voiceCount: this.voices.length,
      languages: [...new Set(this.voices.map(voice => voice.lang))],
      hasLocalVoices: this.voices.some(voice => voice.localService),
      hasRemoteVoices: this.voices.some(voice => !voice.localService)
    };
  }
}

// Create and export singleton instance
const ttsService = new TTSService();
export default ttsService;
