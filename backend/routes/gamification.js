import express from 'express';
import { 
  getUserGamification,
  updatePoints,
  awardBadgeRoute,
  getLeaderboard,
  getUserBadges,
  updateStreakRoute,
  getAchievements,
  awardLessonPoints,
  awardVocabularyPoints,
  awardGrammarPoints,
  awardPronunciationPoints,
  awardLiveClassPoints
} from '../controllers/gamificationController.js';
import { 
  verifyFirebaseAuth, 
  canAccessStudentData 
} from '../middleware/auth.js';

const router = express.Router();

// User gamification routes
router.get('/user/:userId', verifyFirebaseAuth, canAccessStudentData, getUserGamification);
router.get('/user/:userId/badges', verifyFirebaseAuth, canAccessStudentData, getUserBadges);
router.get('/user/:userId/achievements', verifyFirebaseAuth, canAccessStudentData, getAchievements);

// Points and streaks
router.post('/user/:userId/points', verifyFirebaseAuth, updatePoints);
router.post('/user/:userId/streak', verifyFirebaseAuth, updateStreakRoute);
router.post('/user/:userId/badge', verifyFirebaseAuth, awardBadgeRoute);

// Automatic point awarding routes
router.post('/user/:userId/lesson-complete', verifyFirebaseAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await awardLessonPoints(userId, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/user/:userId/vocabulary-learned', verifyFirebaseAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { wordsLearned } = req.body;
    const result = await awardVocabularyPoints(userId, wordsLearned);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/user/:userId/grammar-exercise', verifyFirebaseAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await awardGrammarPoints(userId, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/user/:userId/pronunciation-exercise', verifyFirebaseAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { score } = req.body;
    const result = await awardPronunciationPoints(userId, score);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/user/:userId/live-class-attended', verifyFirebaseAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await awardLiveClassPoints(userId, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Leaderboards
router.get('/leaderboard/global', verifyFirebaseAuth, getLeaderboard);
router.get('/leaderboard/course/:courseId', verifyFirebaseAuth, getLeaderboard);
router.get('/leaderboard/grade/:grade', verifyFirebaseAuth, getLeaderboard);

export default router;
