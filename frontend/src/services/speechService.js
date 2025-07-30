class SpeechService {
  constructor() {
    this.recognition = null;
    this.synthesis = null;
    this.isListening = false;
    this.isSupported = this.checkSupport();
    this.currentLanguage = 'en-US';
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;
    
    this.initializeServices();
  }

  // Check browser support for speech APIs
  checkSupport() {
    const speechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    const speechSynthesisSupported = 'speechSynthesis' in window;
    
    return {
      recognition: speechRecognitionSupported,
      synthesis: speechSynthesisSupported,
      full: speechRecognitionSupported && speechSynthesisSupported
    };
  }

  // Initialize speech recognition and synthesis
  initializeServices() {
    if (this.isSupported.recognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }

    if (this.isSupported.synthesis) {
      this.synthesis = window.speechSynthesis;
    }
  }

  // Setup speech recognition configuration
  setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;
    this.recognition.lang = this.currentLanguage;

    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('Speech recognition started');
    };

    this.recognition.onresult = (event) => {
      const results = [];
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        
        results.push({
          transcript: transcript.trim(),
          confidence: confidence || 0,
          isFinal: result.isFinal,
          alternatives: Array.from(result).map(alt => ({
            transcript: alt.transcript.trim(),
            confidence: alt.confidence || 0
          }))
        });
      }

      if (this.onResultCallback) {
        this.onResultCallback(results);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      
      if (this.onErrorCallback) {
        this.onErrorCallback({
          error: event.error,
          message: this.getErrorMessage(event.error)
        });
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log('Speech recognition ended');
      
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };
  }

  // Get user-friendly error messages
  getErrorMessage(error) {
    const errorMessages = {
      'no-speech': 'No speech was detected. Please try again.',
      'audio-capture': 'Audio capture failed. Please check your microphone.',
      'not-allowed': 'Microphone access was denied. Please allow microphone access.',
      'network': 'Network error occurred. Please check your connection.',
      'service-not-allowed': 'Speech recognition service is not allowed.',
      'bad-grammar': 'Grammar error in speech recognition.',
      'language-not-supported': 'Language is not supported.',
      'aborted': 'Speech recognition was aborted.'
    };
    
    return errorMessages[error] || 'An unknown error occurred during speech recognition.';
  }

  // Start speech recognition
  startListening(options = {}) {
    if (!this.isSupported.recognition) {
      throw new Error('Speech recognition is not supported in this browser');
    }

    if (this.isListening) {
      console.warn('Speech recognition is already active');
      return;
    }

    // Configure recognition options
    if (options.language) {
      this.setLanguage(options.language);
    }
    
    if (options.continuous !== undefined) {
      this.recognition.continuous = options.continuous;
    }
    
    if (options.interimResults !== undefined) {
      this.recognition.interimResults = options.interimResults;
    }

    // Set callbacks
    this.onResultCallback = options.onResult;
    this.onErrorCallback = options.onError;
    this.onEndCallback = options.onEnd;

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      throw error;
    }
  }

  // Stop speech recognition
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  // Abort speech recognition
  abortListening() {
    if (this.recognition && this.isListening) {
      this.recognition.abort();
    }
  }

  // Set recognition language
  setLanguage(language) {
    this.currentLanguage = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  // Get available voices for synthesis
  getVoices() {
    if (!this.isSupported.synthesis) {
      return [];
    }

    return this.synthesis.getVoices().map(voice => ({
      name: voice.name,
      lang: voice.lang,
      gender: this.detectGender(voice.name),
      localService: voice.localService,
      default: voice.default
    }));
  }

  // Detect voice gender from name (heuristic)
  detectGender(voiceName) {
    const femaleIndicators = ['female', 'woman', 'girl', 'samantha', 'victoria', 'karen', 'susan'];
    const maleIndicators = ['male', 'man', 'boy', 'alex', 'daniel', 'thomas', 'david'];
    
    const name = voiceName.toLowerCase();
    
    if (femaleIndicators.some(indicator => name.includes(indicator))) {
      return 'female';
    }
    if (maleIndicators.some(indicator => name.includes(indicator))) {
      return 'male';
    }
    
    return 'unknown';
  }

  // Text-to-speech synthesis
  speak(text, options = {}) {
    if (!this.isSupported.synthesis) {
      throw new Error('Speech synthesis is not supported in this browser');
    }

    // Stop any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure utterance
    utterance.lang = options.language || this.currentLanguage;
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    // Set voice if specified
    if (options.voiceName) {
      const voices = this.synthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.name === options.voiceName);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    // Set event handlers
    utterance.onstart = () => {
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      if (options.onError) options.onError(event.error);
    };

    utterance.onpause = () => {
      if (options.onPause) options.onPause();
    };

    utterance.onresume = () => {
      if (options.onResume) options.onResume();
    };

    this.synthesis.speak(utterance);
    return utterance;
  }

  // Stop speech synthesis
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // Pause speech synthesis
  pauseSpeaking() {
    if (this.synthesis) {
      this.synthesis.pause();
    }
  }

  // Resume speech synthesis
  resumeSpeaking() {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  // Check if currently speaking
  isSpeaking() {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  // Get supported languages for recognition
  getSupportedLanguages() {
    return [
      { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
      { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
      { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
      { code: 'de-DE', name: 'German', flag: '🇩🇪' },
      { code: 'es-ES', name: 'Spanish (Spain)', flag: '🇪🇸' },
      { code: 'es-MX', name: 'Spanish (Mexico)', flag: '🇲🇽' },
      { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
      { code: 'pt-BR', name: 'Portuguese (Brazil)', flag: '🇧🇷' },
      { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
      { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
      { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
      { code: 'ru-RU', name: 'Russian', flag: '🇷🇺' },
      { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
      { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' }
    ];
  }

  // Request microphone permission
  async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      return false;
    }
  }

  // Test speech recognition with a simple phrase
  async testRecognition(language = 'en-US') {
    return new Promise((resolve, reject) => {
      if (!this.isSupported.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      const timeout = setTimeout(() => {
        this.stopListening();
        reject(new Error('Recognition test timed out'));
      }, 10000);

      this.startListening({
        language,
        continuous: false,
        interimResults: false,
        onResult: (results) => {
          clearTimeout(timeout);
          resolve(results);
        },
        onError: (error) => {
          clearTimeout(timeout);
          reject(error);
        }
      });
    });
  }

  // Get voices filtered by language
  getVoicesByLanguage(language) {
    const voices = this.getVoices();
    return voices.filter(voice => voice.lang.startsWith(language.split('-')[0]));
  }

  // Get recommended voice for language
  getRecommendedVoice(language, gender = null) {
    const voices = this.getVoicesByLanguage(language);

    if (gender) {
      const genderVoices = voices.filter(voice => voice.gender === gender);
      if (genderVoices.length > 0) {
        return genderVoices.find(voice => voice.default) || genderVoices[0];
      }
    }

    return voices.find(voice => voice.default) || voices[0] || null;
  }

  // Speak with automatic voice selection
  speakWithAutoVoice(text, language, options = {}) {
    const recommendedVoice = this.getRecommendedVoice(language, options.gender);

    return this.speak(text, {
      ...options,
      language,
      voiceName: recommendedVoice?.name
    });
  }

  // Speak word by word for pronunciation practice
  speakWordByWord(text, options = {}) {
    const words = text.split(/\s+/);
    let currentIndex = 0;
    const delay = options.wordDelay || 1000;

    const speakNextWord = () => {
      if (currentIndex < words.length) {
        const word = words[currentIndex];

        this.speak(word, {
          ...options,
          onEnd: () => {
            if (options.onWordComplete) {
              options.onWordComplete(word, currentIndex);
            }

            currentIndex++;
            if (currentIndex < words.length) {
              setTimeout(speakNextWord, delay);
            } else if (options.onComplete) {
              options.onComplete();
            }
          }
        });
      }
    };

    speakNextWord();
  }

  // Create pronunciation model for a phrase
  createPronunciationModel(text, language) {
    const words = text.split(/\s+/);

    return {
      text,
      language,
      words: words.map(word => ({
        word,
        phonetic: this.getPhoneticTranscription(word, language),
        syllables: this.getSyllables(word),
        stress: this.getStressPattern(word)
      })),
      totalSyllables: words.reduce((sum, word) => sum + this.getSyllables(word).length, 0)
    };
  }

  // Get phonetic transcription (simplified)
  getPhoneticTranscription(word, language) {
    // This is a simplified implementation
    // In a real app, you'd use a phonetic dictionary or API
    const phoneticMap = {
      'en-US': {
        'hello': '/həˈloʊ/',
        'world': '/wɜrld/',
        'thank': '/θæŋk/',
        'you': '/ju/',
        'how': '/haʊ/',
        'are': '/ɑr/',
        'today': '/təˈdeɪ/'
      },
      'fr-FR': {
        'bonjour': '/bonˈʒuʁ/',
        'merci': '/mɛʁˈsi/',
        'comment': '/kɔmɑ̃/',
        'allez': '/aˈle/',
        'vous': '/vu/'
      }
    };

    return phoneticMap[language]?.[word.toLowerCase()] || `/${word}/`;
  }

  // Get syllables (simplified)
  getSyllables(word) {
    // Simple syllable detection
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

  // Get stress pattern (simplified)
  getStressPattern(word) {
    // Simplified stress pattern detection
    const syllables = this.getSyllables(word);
    if (syllables.length === 1) return [1];
    if (syllables.length === 2) return [1, 0];
    return syllables.map((_, i) => i === 0 ? 1 : 0);
  }

  // Generate listening exercise
  generateListeningExercise(text, language, difficulty = 'normal') {
    const speeds = {
      slow: 0.7,
      normal: 1.0,
      fast: 1.3
    };

    const pitches = {
      low: 0.8,
      normal: 1.0,
      high: 1.2
    };

    return {
      text,
      language,
      options: {
        rate: speeds[difficulty] || speeds.normal,
        pitch: pitches.normal,
        volume: 1.0
      },
      exercises: [
        {
          type: 'listen_and_repeat',
          instruction: 'Listen and repeat the following phrase',
          text: text
        },
        {
          type: 'listen_and_type',
          instruction: 'Listen and type what you hear',
          text: text
        },
        {
          type: 'listen_and_choose',
          instruction: 'Choose the correct transcription',
          text: text,
          options: this.generateSimilarTexts(text)
        }
      ]
    };
  }

  // Generate similar texts for multiple choice
  generateSimilarTexts(originalText) {
    // Simple text variations for multiple choice
    const words = originalText.split(' ');
    const variations = [originalText];

    // Create variations by changing one word
    for (let i = 0; i < Math.min(3, words.length); i++) {
      const variation = [...words];
      variation[i] = this.getSimilarWord(variation[i]);
      variations.push(variation.join(' '));
    }

    return variations.slice(0, 4);
  }

  // Get similar sounding word
  getSimilarWord(word) {
    const similarWords = {
      'hello': 'hallo',
      'world': 'word',
      'thank': 'think',
      'you': 'your',
      'how': 'who',
      'are': 'our',
      'today': 'to day'
    };

    return similarWords[word.toLowerCase()] || word;
  }

  // Get audio level (requires additional implementation)
  getAudioLevel() {
    // This would require Web Audio API implementation
    // Placeholder for future enhancement
    return 0;
  }

  // Cleanup resources
  destroy() {
    this.stopListening();
    this.stopSpeaking();
    this.recognition = null;
    this.synthesis = null;
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;
  }
}

// Create and export a singleton instance
const speechService = new SpeechService();
export default speechService;
