import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        home: 'Home',
        courses: 'Courses',
        dashboard: 'Dashboard',
        progress: 'Progress',
        community: 'Community',
        profile: 'Profile',
        logout: 'Logout'
      },
      
      // Common
      common: {
        loading: 'Loading...',
        error: 'Error occurred',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        search: 'Search',
        filter: 'Filter',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        continue: 'Continue',
        finish: 'Finish',
        start: 'Start',
        retry: 'Retry'
      },

      // Authentication
      auth: {
        login: 'Login',
        signup: 'Sign Up',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        forgotPassword: 'Forgot Password?',
        rememberMe: 'Remember Me',
        signInWithGoogle: 'Sign in with Google',
        signInWithFacebook: 'Sign in with Facebook',
        alreadyHaveAccount: 'Already have an account?',
        dontHaveAccount: "Don't have an account?",
        createAccount: 'Create Account',
        resetPassword: 'Reset Password'
      },

      // Languages
      languages: {
        selectLanguage: 'Select Learning Language',
        selectUILanguage: 'Select Interface Language',
        french: 'French',
        japanese: 'Japanese',
        german: 'German',
        spanish: 'Spanish',
        korean: 'Korean',
        currentLevel: 'Current Level',
        targetLevel: 'Target Level',
        changeLearningLanguage: 'Change Learning Language'
      },

      // Levels
      levels: {
        beginner: 'Beginner',
        elementary: 'Elementary',
        intermediate: 'Intermediate',
        upperIntermediate: 'Upper Intermediate',
        advanced: 'Advanced',
        proficient: 'Proficient'
      },

      // Dashboard
      dashboard: {
        welcome: 'Welcome back, {{name}}!',
        todaysGoal: "Today's Goal",
        currentStreak: 'Current Streak',
        totalPoints: 'Total Points',
        level: 'Level',
        weeklyProgress: 'Weekly Progress',
        recentAchievements: 'Recent Achievements',
        continueLearning: 'Continue Learning',
        startNewLesson: 'Start New Lesson',
        practiceVocabulary: 'Practice Vocabulary',
        takeQuiz: 'Take Quiz'
      },

      // Courses
      courses: {
        allCourses: 'All Courses',
        myCourses: 'My Courses',
        recommended: 'Recommended',
        popular: 'Popular',
        new: 'New',
        difficulty: 'Difficulty',
        duration: 'Duration',
        lessons: 'Lessons',
        enrollNow: 'Enroll Now',
        startCourse: 'Start Course',
        continueCourse: 'Continue Course',
        completed: 'Completed',
        inProgress: 'In Progress',
        notStarted: 'Not Started'
      },

      // Lessons
      lessons: {
        lesson: 'Lesson',
        of: 'of',
        vocabulary: 'Vocabulary',
        grammar: 'Grammar',
        listening: 'Listening',
        speaking: 'Speaking',
        reading: 'Reading',
        writing: 'Writing',
        practice: 'Practice',
        quiz: 'Quiz',
        review: 'Review',
        complete: 'Complete',
        mastered: 'Mastered',
        needsPractice: 'Needs Practice'
      },

      // Gamification
      gamification: {
        points: 'Points',
        badges: 'Badges',
        achievements: 'Achievements',
        leaderboard: 'Leaderboard',
        streak: 'Streak',
        level: 'Level',
        experience: 'Experience',
        rank: 'Rank',
        earned: 'Earned',
        locked: 'Locked',
        progress: 'Progress',
        dailyGoal: 'Daily Goal',
        weeklyGoal: 'Weekly Goal',
        monthlyGoal: 'Monthly Goal'
      },

      // Cultural Content
      cultural: {
        culturalContent: 'Cultural Content',
        festivals: 'Festivals & Celebrations',
        food: 'Food & Cuisine',
        etiquette: 'Social Etiquette',
        history: 'History & Heritage',
        arts: 'Arts & Literature',
        lifestyle: 'Daily Life',
        exploreMore: 'Explore More',
        learnAbout: 'Learn About',
        culturalTip: 'Cultural Tip',
        didYouKnow: 'Did You Know?'
      },

      // Live Classes
      liveClasses: {
        liveClasses: 'Live Classes',
        upcomingClasses: 'Upcoming Classes',
        joinClass: 'Join Class',
        classStartsIn: 'Class starts in',
        classInProgress: 'Class in Progress',
        classEnded: 'Class Ended',
        instructor: 'Instructor',
        participants: 'Participants',
        duration: 'Duration',
        topic: 'Topic',
        materials: 'Materials',
        recording: 'Recording'
      },

      // AI Language Lab
      aiLab: {
        languageLab: 'AI Language Lab',
        pronunciationTrainer: 'Pronunciation Trainer',
        conversationPractice: 'Conversation Practice',
        speechAnalysis: 'Speech Analysis',
        startRecording: 'Start Recording',
        stopRecording: 'Stop Recording',
        playback: 'Playback',
        accuracy: 'Accuracy',
        fluency: 'Fluency',
        suggestions: 'Suggestions',
        tryAgain: 'Try Again',
        excellent: 'Excellent!',
        good: 'Good!',
        needsImprovement: 'Needs Improvement'
      },

      // Assessment
      assessment: {
        assessment: 'Assessment',
        quiz: 'Quiz',
        test: 'Test',
        exam: 'Exam',
        question: 'Question',
        answer: 'Answer',
        submit: 'Submit',
        score: 'Score',
        result: 'Result',
        passed: 'Passed',
        failed: 'Failed',
        retake: 'Retake',
        review: 'Review',
        correct: 'Correct',
        incorrect: 'Incorrect',
        skipped: 'Skipped',
        timeRemaining: 'Time Remaining',
        submitAssessment: 'Submit Assessment'
      },

      // Community
      community: {
        community: 'Community',
        forums: 'Forums',
        discussions: 'Discussions',
        studyGroups: 'Study Groups',
        languageBuddies: 'Language Buddies',
        findBuddy: 'Find a Buddy',
        createPost: 'Create Post',
        reply: 'Reply',
        like: 'Like',
        share: 'Share',
        follow: 'Follow',
        message: 'Message',
        online: 'Online',
        offline: 'Offline'
      },

      // Progress
      progress: {
        progress: 'Progress',
        weeklyReport: 'Weekly Report',
        monthlyReport: 'Monthly Report',
        strengths: 'Strengths',
        improvements: 'Areas for Improvement',
        recommendations: 'Recommendations',
        timeSpent: 'Time Spent',
        lessonsCompleted: 'Lessons Completed',
        vocabularyLearned: 'Vocabulary Learned',
        accuracyRate: 'Accuracy Rate',
        streakMaintained: 'Streak Maintained'
      },

      // Certification
      certification: {
        certificates: 'Certificates',
        earnCertificate: 'Earn Certificate',
        downloadCertificate: 'Download Certificate',
        shareCertificate: 'Share Certificate',
        cefrCertificate: 'CEFR Certificate',
        completionCertificate: 'Completion Certificate',
        verified: 'Verified',
        issueDate: 'Issue Date',
        validUntil: 'Valid Until',
        shareOnLinkedIn: 'Share on LinkedIn'
      },

      // Parent Portal
      parent: {
        parentPortal: 'Parent Portal',
        childProgress: "Child's Progress",
        weeklyReport: 'Weekly Report',
        strengths: 'Strengths',
        improvements: 'Areas for Improvement',
        timeSpent: 'Time Spent Learning',
        goalsAchieved: 'Goals Achieved',
        upcomingClasses: 'Upcoming Classes',
        teacherNotes: 'Teacher Notes',
        parentMeeting: 'Schedule Parent Meeting'
      },

      // Teacher Portal
      teacher: {
        teacherPortal: 'Teacher Portal',
        myStudents: 'My Students',
        classManagement: 'Class Management',
        createAssignment: 'Create Assignment',
        gradeAssignments: 'Grade Assignments',
        attendance: 'Attendance',
        progressReports: 'Progress Reports',
        parentCommunication: 'Parent Communication',
        curriculum: 'Curriculum',
        resources: 'Resources'
      }
    }
  },

  hi: {
    translation: {
      // Navigation
      nav: {
        home: 'होम',
        courses: 'कोर्स',
        dashboard: 'डैशबोर्ड',
        progress: 'प्रगति',
        community: 'समुदाय',
        profile: 'प्रोफ़ाइल',
        logout: 'लॉगआउट'
      },

      // Common
      common: {
        loading: 'लोड हो रहा है...',
        error: 'त्रुटि हुई',
        save: 'सेव करें',
        cancel: 'रद्द करें',
        delete: 'डिलीट करें',
        edit: 'संपादित करें',
        add: 'जोड़ें',
        search: 'खोजें',
        filter: 'फ़िल्टर',
        back: 'वापस',
        next: 'आगे',
        previous: 'पिछला',
        continue: 'जारी रखें',
        finish: 'समाप्त करें',
        start: 'शुरू करें',
        retry: 'पुनः प्रयास करें'
      },

      // Authentication
      auth: {
        login: 'लॉगिन',
        signup: 'साइन अप',
        logout: 'लॉगआउट',
        email: 'ईमेल',
        password: 'पासवर्ड',
        confirmPassword: 'पासवर्ड की पुष्टि करें',
        forgotPassword: 'पासवर्ड भूल गए?',
        rememberMe: 'मुझे याद रखें',
        signInWithGoogle: 'Google से साइन इन करें',
        signInWithFacebook: 'Facebook से साइन इन करें',
        alreadyHaveAccount: 'पहले से खाता है?',
        dontHaveAccount: 'खाता नहीं है?',
        createAccount: 'खाता बनाएं',
        resetPassword: 'पासवर्ड रीसेट करें'
      },

      // Dashboard
      dashboard: {
        welcome: 'वापसी पर स्वागत है, {{name}}!',
        todaysGoal: 'आज का लक्ष्य',
        currentStreak: 'वर्तमान स्ट्रीक',
        totalPoints: 'कुल अंक',
        level: 'स्तर',
        weeklyProgress: 'साप्ताहिक प्रगति',
        recentAchievements: 'हाल की उपलब्धियां',
        continueLearning: 'सीखना जारी रखें',
        startNewLesson: 'नया पाठ शुरू करें',
        practiceVocabulary: 'शब्दावली का अभ्यास करें',
        takeQuiz: 'क्विज़ लें'
      }
    }
  }
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false // React already does escaping
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;
