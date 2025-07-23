// Language Learning Constants

// Supported Languages for Learning
export const LEARNING_LANGUAGES = {
  FRENCH: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    cefr: ['A1', 'A2', 'B1'],
    culturalRegions: ['France', 'Belgium', 'Switzerland', 'Canada'],
    icon: '🥖'
  },
  JAPANESE: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    cefr: ['A1', 'A2', 'B1'],
    culturalRegions: ['Japan'],
    icon: '🍣'
  },
  GERMAN: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    cefr: ['A1', 'A2', 'B1'],
    culturalRegions: ['Germany', 'Austria', 'Switzerland'],
    icon: '🥨'
  },
  SPANISH: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    cefr: ['A1', 'A2', 'B1'],
    culturalRegions: ['Spain', 'Mexico', 'Argentina', 'Colombia'],
    icon: '🥘'
  },
  KOREAN: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    cefr: ['A1', 'A2', 'B1'],
    culturalRegions: ['South Korea'],
    icon: '🥢'
  }
};

// CEFR Level Definitions
export const CEFR_LEVELS = {
  A1: {
    code: 'A1',
    name: 'Beginner',
    description: 'Can understand and use familiar everyday expressions and very basic phrases',
    skills: {
      listening: 'Recognize familiar words and very basic phrases',
      reading: 'Understand familiar names, words and very simple sentences',
      speaking: 'Interact in a simple way with slow, clear speech',
      writing: 'Write simple phrases and sentences about yourself'
    },
    vocabulary: 1500,
    duration: '3-4 months',
    color: '#22c55e'
  },
  A2: {
    code: 'A2',
    name: 'Elementary',
    description: 'Can understand sentences and frequently used expressions',
    skills: {
      listening: 'Understand phrases and vocabulary in familiar topics',
      reading: 'Read very short, simple texts',
      speaking: 'Communicate in simple and routine tasks',
      writing: 'Write short, simple notes and messages'
    },
    vocabulary: 3000,
    duration: '4-5 months',
    color: '#3b82f6'
  },
  B1: {
    code: 'B1',
    name: 'Intermediate',
    description: 'Can understand the main points of clear standard input on familiar matters',
    skills: {
      listening: 'Understand main points of clear standard speech',
      reading: 'Understand texts consisting mainly of familiar vocabulary',
      speaking: 'Deal with situations while travelling and express opinions',
      writing: 'Write simple connected text on familiar topics'
    },
    vocabulary: 5000,
    duration: '5-6 months',
    color: '#8b5cf6'
  }
};

// Grade Level Mapping
export const GRADE_LEVELS = {
  6: {
    grade: 6,
    ageRange: '11-12',
    recommendedCefr: 'A1',
    focusAreas: ['Basic vocabulary', 'Simple greetings', 'Numbers', 'Colors'],
    boards: ['CBSE', 'ICSE', 'International']
  },
  7: {
    grade: 7,
    ageRange: '12-13',
    recommendedCefr: 'A1',
    focusAreas: ['Family & friends', 'School life', 'Hobbies', 'Food'],
    boards: ['CBSE', 'ICSE', 'International']
  },
  8: {
    grade: 8,
    ageRange: '13-14',
    recommendedCefr: 'A2',
    focusAreas: ['Travel', 'Culture', 'Environment', 'Technology'],
    boards: ['CBSE', 'ICSE', 'International']
  },
  9: {
    grade: 9,
    ageRange: '14-15',
    recommendedCefr: 'A2',
    focusAreas: ['History', 'Literature', 'Science', 'Global issues'],
    boards: ['CBSE', 'ICSE', 'International']
  },
  10: {
    grade: 10,
    ageRange: '15-16',
    recommendedCefr: 'B1',
    focusAreas: ['Academic writing', 'Debates', 'Research', 'Career preparation'],
    boards: ['CBSE', 'ICSE', 'International']
  }
};

// UI Languages for Platform Interface
export const UI_LANGUAGES = {
  ENGLISH: { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  HINDI: { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  TAMIL: { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  TELUGU: { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  BENGALI: { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  GUJARATI: { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  MARATHI: { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  KANNADA: { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  MALAYALAM: { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  ODIA: { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' }
};

// Cultural Content Categories
export const CULTURAL_CATEGORIES = {
  FESTIVALS: {
    id: 'festivals',
    name: 'Festivals & Celebrations',
    icon: '🎉',
    description: 'Learn about traditional and modern celebrations'
  },
  FOOD: {
    id: 'food',
    name: 'Food & Cuisine',
    icon: '🍽️',
    description: 'Explore culinary traditions and dining etiquette'
  },
  ETIQUETTE: {
    id: 'etiquette',
    name: 'Social Etiquette',
    icon: '🤝',
    description: 'Master social norms and cultural behaviors'
  },
  HISTORY: {
    id: 'history',
    name: 'History & Heritage',
    icon: '🏛️',
    description: 'Discover historical context and cultural heritage'
  },
  ARTS: {
    id: 'arts',
    name: 'Arts & Literature',
    icon: '🎭',
    description: 'Explore artistic expressions and literary traditions'
  },
  LIFESTYLE: {
    id: 'lifestyle',
    name: 'Daily Life',
    icon: '🏠',
    description: 'Understanding everyday life and customs'
  }
};

// Assessment Types
export const ASSESSMENT_TYPES = {
  LISTENING: {
    id: 'listening',
    name: 'Listening Comprehension',
    icon: '👂',
    skills: ['Audio comprehension', 'Context understanding', 'Detail recognition']
  },
  READING: {
    id: 'reading',
    name: 'Reading Comprehension',
    icon: '📖',
    skills: ['Text understanding', 'Vocabulary recognition', 'Inference making']
  },
  SPEAKING: {
    id: 'speaking',
    name: 'Speaking Assessment',
    icon: '🗣️',
    skills: ['Pronunciation', 'Fluency', 'Grammar usage', 'Vocabulary range']
  },
  WRITING: {
    id: 'writing',
    name: 'Writing Assessment',
    icon: '✍️',
    skills: ['Grammar accuracy', 'Vocabulary usage', 'Text structure', 'Creativity']
  },
  VOCABULARY: {
    id: 'vocabulary',
    name: 'Vocabulary Quiz',
    icon: '📚',
    skills: ['Word recognition', 'Meaning understanding', 'Usage context']
  },
  GRAMMAR: {
    id: 'grammar',
    name: 'Grammar Exercise',
    icon: '📝',
    skills: ['Sentence structure', 'Tense usage', 'Article usage', 'Prepositions']
  }
};

// Learning Paths
export const LEARNING_PATHS = {
  ACADEMIC: {
    id: 'academic',
    name: 'Academic Excellence',
    description: 'Focused on school curriculum and exam preparation',
    icon: '🎓',
    features: ['CBSE/ICSE alignment', 'Exam preparation', 'Academic vocabulary']
  },
  CONVERSATIONAL: {
    id: 'conversational',
    name: 'Conversational Fluency',
    description: 'Emphasis on speaking and everyday communication',
    icon: '💬',
    features: ['Speaking practice', 'Real-life scenarios', 'Cultural context']
  },
  TRAVEL: {
    id: 'travel',
    name: 'Travel & Tourism',
    description: 'Practical language for travel and exploration',
    icon: '✈️',
    features: ['Travel vocabulary', 'Navigation help', 'Cultural etiquette']
  },
  BUSINESS: {
    id: 'business',
    name: 'Professional Development',
    description: 'Language skills for career advancement',
    icon: '💼',
    features: ['Business vocabulary', 'Formal communication', 'Presentation skills']
  }
};

// Gamification Elements
export const ACHIEVEMENT_CATEGORIES = {
  LINGUISTIC: {
    id: 'linguistic',
    name: 'Language Mastery',
    icon: '🗣️',
    color: '#3b82f6'
  },
  CULTURAL: {
    id: 'cultural',
    name: 'Cultural Explorer',
    icon: '🌍',
    color: '#10b981'
  },
  SOCIAL: {
    id: 'social',
    name: 'Community Builder',
    icon: '👥',
    color: '#8b5cf6'
  },
  ACADEMIC: {
    id: 'academic',
    name: 'Academic Excellence',
    icon: '🎓',
    color: '#f59e0b'
  },
  CONSISTENCY: {
    id: 'consistency',
    name: 'Dedication Master',
    icon: '🔥',
    color: '#ef4444'
  }
};

export default {
  LEARNING_LANGUAGES,
  CEFR_LEVELS,
  GRADE_LEVELS,
  UI_LANGUAGES,
  CULTURAL_CATEGORIES,
  ASSESSMENT_TYPES,
  LEARNING_PATHS,
  ACHIEVEMENT_CATEGORIES
};
