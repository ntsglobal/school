import React, { useState, useEffect } from 'react';
import { FaTrophy, FaFire, FaBullseye, FaMedal, FaStar, FaGraduationCap, FaBook, FaMicrophone, FaHeadphones, FaPen, FaGamepad, FaChartLine } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import gamificationService from '../../services/gamificationService';
import './GamificationDashboard.css';

const GamificationDashboard = () => {
  const { user } = useAuth();
  const [activeLeaderboard, setActiveLeaderboard] = useState('local');
  const [gamificationData, setGamificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchGamificationData();
    }
  }, [user]);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      const response = await gamificationService.getUserGamification(user.id);
      if (response.success) {
        setGamificationData(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch gamification data:', err);
      setError('Failed to load gamification data');
    } finally {
      setLoading(false);
    }
  };

  // Demo function to award points (for testing)
  const handleTestLessonComplete = async () => {
    try {
      const lessonData = {
        lessonId: 'demo-lesson',
        quizScore: 95,
        timeSpent: 30
      };
      
      const result = await gamificationService.awardLessonPoints(user.id, lessonData);
      if (result.success) {
        // Refresh gamification data
        await fetchGamificationData();
        alert(`Earned ${result.data.pointsEarned} points! ${result.data.message}`);
      }
    } catch (error) {
      console.error('Test lesson complete error:', error);
      alert('Error awarding points');
    }
  };

  const handleTestVocabulary = async () => {
    try {
      const result = await gamificationService.awardVocabularyPoints(user.id, 5);
      if (result.success) {
        await fetchGamificationData();
        alert(`Earned ${result.data.pointsEarned} points! ${result.data.message}`);
      }
    } catch (error) {
      console.error('Test vocabulary error:', error);
      alert('Error awarding points');
    }
  };

  if (loading) {
    return (
      <div className="gamification-dashboard">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your achievements...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="gamification-dashboard">
        <Navbar />
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchGamificationData} className="retry-btn">
            Try Again
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const gamification = gamificationData?.gamification || {};
  const stats = gamificationData?.stats || {};

  const mockAchievements = [
    {
      id: 1,
      title: 'Grammar Master',
      icon: <FaBook />,
      color: 'blue',
      earned: true,
      progress: 100
    },
    {
      id: 2,
      title: 'Vocabulary Champion',
      icon: <FaStar />,
      color: 'gold',
      earned: true,
      progress: 100
    },
    {
      id: 3,
      title: 'Perfect Attendance',
      icon: <FaGraduationCap />,
      color: 'green',
      earned: true,
      progress: 100
    },
    {
      id: 4,
      title: 'Reading Expert',
      icon: <FaBook />,
      color: 'teal',
      earned: false,
      progress: 75
    },
    {
      id: 5,
      title: 'Writing Wizard',
      icon: <FaPen />,
      color: 'orange',
      earned: false,
      progress: 60
    },
    {
      id: 6,
      title: 'Speaking Star',
      icon: <FaMicrophone />,
      color: 'blue',
      earned: false,
      progress: 40
    },
    {
      id: 7,
      title: 'Listening Pro',
      icon: <FaHeadphones />,
      color: 'green',
      earned: false,
      progress: 85
    },
    {
      id: 8,
      title: 'Culture Explorer',
      icon: <FaTrophy />,
      color: 'gold',
      earned: false,
      progress: 30
    }
  ];

  const localLeaderboard = [
    { rank: 1, name: 'Sarah M.', xp: '3,240 XP', avatar: '👩' },
    { rank: 2, name: 'Alex K.', xp: '2,980 XP', avatar: '👨' },
    { rank: 3, name: user?.firstName || 'You', xp: `${gamification.totalPoints || 0} XP`, avatar: '🧑', isCurrentUser: true },
    { rank: 4, name: 'Ranu R.', xp: '2,120 XP', avatar: '👩' },
    { rank: 5, name: 'Priya L.', xp: '1,980 XP', avatar: '👩' }
  ];

  const globalLeaderboard = [
    { rank: 1, name: 'Emma W.', xp: '4,120 XP', avatar: '👩' },
    { rank: 2, name: 'Yuki T.', xp: '3,890 XP', avatar: '👨' },
    { rank: 3, name: 'Lisa M.', xp: '3,650 XP', avatar: '👩' },
    { rank: 4, name: 'Chen L.', xp: '3,420 XP', avatar: '👨' },
    { rank: 5, name: 'Maria S.', xp: '3,190 XP', avatar: '👩' }
  ];

  const languageProgress = [
    { language: 'Japanese', progress: 75, color: '#3b82f6' },
    { language: 'German', progress: 60, color: '#10b981' },
    { language: 'French', progress: 45, color: '#ef4444' },
    { language: 'Spanish', progress: 80, color: '#f59e0b' },
    { language: 'Korean', progress: 30, color: '#06b6d4' }
  ];

  const streakDays = Array.from({ length: 7 }, (_, i) => ({
    day: i + 1,
    completed: i < (gamification.currentStreak || 0) && i < 7
  }));

  return (
    <div className="gamification-dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        {/* Test Buttons (Development Only) */}
        <div className="test-controls">
          <h3>🎮 Test Gamification (Dev Mode)</h3>
          <div className="test-buttons">
            <button onClick={handleTestLessonComplete} className="test-btn lesson-btn">
              <FaBook /> Complete Lesson (95% score)
            </button>
            <button onClick={handleTestVocabulary} className="test-btn vocab-btn">
              <FaStar /> Learn 5 Vocabulary Words
            </button>
            <button onClick={fetchGamificationData} className="test-btn refresh-btn">
              <FaChartLine /> Refresh Data
            </button>
          </div>
        </div>

        {/* Top Stats */}
        <div className="stats-cards">
          <div className="stat-card xp-card">
            <div className="stat-icon">
              <FaTrophy />
            </div>
            <div className="stat-content">
              <div className="stat-value">{gamification.totalPoints || 0} XP</div>
              <div className="stat-label">XP Points</div>
              <div className="stat-sublabel">Level {gamification.level || 1}</div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${stats.nextLevelProgress || 0}%` }}
                ></div>
              </div>
              <div className="progress-text">
                {stats.pointsToNextLevel || 100} XP to next level
              </div>
            </div>
          </div>

          <div className="stat-card streak-card">
            <div className="stat-icon">
              <FaFire />
            </div>
            <div className="stat-content">
              <div className="stat-value">{gamification.currentStreak || 0} Days</div>
              <div className="stat-label">Current Streak</div>
              <div className="streak-dots">
                {streakDays.map((day, index) => (
                  <div 
                    key={index} 
                    className={`streak-dot ${day.completed ? 'completed' : ''}`}
                  ></div>
                ))}
              </div>
              <div className="streak-info">
                Best: {gamification.longestStreak || 0} days
              </div>
            </div>
          </div>

          <div className="stat-card goals-card">
            <div className="stat-icon">
              <FaBullseye />
            </div>
            <div className="stat-content">
              <div className="stat-value">4/7</div>
              <div className="stat-label">Weekly Goals</div>
              <div className="goals-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '57%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="achievements-section">
          <h2 className="section-title">Recent Achievements</h2>
          <div className="achievements-grid">
            {mockAchievements.map((achievement) => (
              <div key={achievement.id} className={`achievement-badge ${achievement.color} ${achievement.earned ? 'earned' : 'locked'}`}>
                <div className="badge-icon">
                  {achievement.icon}
                </div>
                <div className="badge-title">{achievement.title}</div>
                {!achievement.earned && (
                  <div className="achievement-progress">
                    <div 
                      className="progress-bar-small"
                      style={{ width: `${achievement.progress}%` }}
                    ></div>
                    <span className="progress-text">{achievement.progress}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Badges Section */}
        <div className="badges-section">
          <h2 className="section-title">Badge Collection</h2>
          <div className="badges-grid">
            {(gamification.badges || []).map((badge, index) => (
              <div key={index} className={`badge-item ${badge.rarity}`}>
                <div className="badge-icon-large">{badge.icon}</div>
                <div className="badge-name">{badge.name}</div>
                <div className="badge-description">{badge.description}</div>
                <div className="badge-earned">
                  Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
            {(gamification.badges || []).length === 0 && (
              <div className="no-badges">
                <FaMedal className="no-badges-icon" />
                <p>No badges earned yet. Complete activities to earn your first badge!</p>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboards */}
        <div className="leaderboards-section">
          <div className="leaderboard local-leaderboard">
            <h3 className="leaderboard-title">Local Leaderboard</h3>
            <div className="leaderboard-list">
              {localLeaderboard.map((user) => (
                <div key={user.rank} className={`leaderboard-item ${user.isCurrentUser ? 'current-user' : ''}`}>
                  <div className="rank">{user.rank}</div>
                  <div className="user-avatar">{user.avatar}</div>
                  <div className="user-name">{user.name}</div>
                  <div className="user-xp">{user.xp}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="leaderboard global-leaderboard">
            <h3 className="leaderboard-title">Global Leaderboard</h3>
            <div className="leaderboard-list">
              {globalLeaderboard.map((user) => (
                <div key={user.rank} className="leaderboard-item">
                  <div className="rank">{user.rank}</div>
                  <div className="user-avatar">{user.avatar}</div>
                  <div className="user-name">{user.name}</div>
                  <div className="user-xp">{user.xp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Language Progress */}
        <div className="language-progress-section">
          <h2 className="section-title">Language Progress</h2>
          <div className="progress-list">
            {languageProgress.map((lang, index) => (
              <div key={index} className="language-item">
                <div className="language-header">
                  <span className="language-name">{lang.language}</span>
                  <span className="language-percentage">{lang.progress}%</span>
                </div>
                <div className="language-bar">
                  <div 
                    className="language-fill"
                    style={{ 
                      width: `${lang.progress}%`,
                      backgroundColor: lang.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="encouragement-text">
            Keep learning! You're doing great!
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default GamificationDashboard;
